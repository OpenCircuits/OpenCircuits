import type {Arguments} from "yargs";

import path from "node:path";

import chalk   from "chalk";
import jest    from "jest";
import open    from "open";
import prompts from "prompts";
import yargs   from "yargs/yargs";

import getEnv     from "./utils/env.js";
import getAliases from "./utils/getAliases.js";
import {getOtherPageDirs,
        getProjectCircuitDesignerDirs,
        getProjectCircuitDirs,
        getProjectSiteDirs,
        getServerDir} from "./utils/getDirs.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";


async function LaunchTest(args: Arguments, dir: string, flags: Record<string, unknown>) {
    return await jest.runCLI({
        ...args,
        ...flags,
        silent:          false,
        passWithNoTests: true,
        config:          JSON.stringify({
            "preset":           "ts-jest",
            "testEnvironment":  "jsdom",
            "moduleNameMapper": getAliases(path.resolve(process.cwd(), dir), "jest"),

            "transform": {
                "^.+\\.scss$": path.resolve("build/scripts/test/scssTransform.js"),
                "^.+\\.svg$":  path.resolve("build/scripts/test/svgTransform.js"),
            },

            "setupFiles": ["jest-canvas-mock"],
            "setupFilesAfterEnv": [path.resolve("build/scripts/test/setupFileAfterEnv.js")],
        }),
    }, [dir]);
}


// CLI
(async () => {
    const dirs = [
        getServerDir(),
        ...getProjectCircuitDirs(),
        ...getProjectCircuitDesignerDirs(),
        ...getProjectSiteDirs(),
        ...getOtherPageDirs(),
    ]

    const argv = await yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("coverage")
        .argv;

    const ci = argv.ci;
    const coverage = argv.coverage;

    const dirPaths = await (async () => {
        // If specified dirs in argv, then just use those.
        if (argv._.length > 0)
            return argv._;

        // If nothing specified, but using CI, use all directories.
        if (ci)
            return dirs.map((d) => d.path);

        // Else prompt user for a directory
        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project",
            choices: dirs.sort((a, b) => (a.title.localeCompare(b.title))).map((d) => ({
                ...d,
                value: d.path,
            })),
            initial: 0,
        });
        if (!value)
            return;
        return [value as string];
    })();
    if (!dirPaths)
        return;

    const flags = {
        ci,
        coverage,

        watch: (dirPaths.length === 1 && !ci) && !coverage,

        collectCoverageFrom: "**/*.{js,ts,tsx}",
        coverageDirectory:   undefined,
    };

    const results = [];

    // Launch test in each directory
    const dirsToUse = dirPaths.map((path) => dirs.find((d) => (d.path === path)));
    for (const dir of dirsToUse) {
        // Ensure all environment variables are read
        getEnv(`${dir}`, "");

        console.log();
        if (!dir) {
            console.log(chalk.red("Could not find directory,", chalk.underline(dir) + "!"));
            continue;
        }
        // if (dir.disabled) {
        //     console.log(chalk.yellow("Skipping disabled directory,", chalk.underline(dir)));
        //     continue;
        // }
        flags.coverageDirectory = `${process.cwd()}/coverage/${dir.path}`;

        const { results: result } = await LaunchTest(argv, dir.path, flags);
        results.push(result);
        if (coverage)
            open(flags.coverageDirectory + "/lcov-report/index.html");
    }

    const pass = results.every((r) => r.success);
    if (!pass && ci) // Exit with failure
        throw new Error("Not all tests passed!");
})();
