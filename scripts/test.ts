/* eslint-disable jest/no-jest-import */
import path from "node:path";

import chalk   from "chalk";
import jest    from "jest";
import open    from "open";
import prompts from "prompts";
import yargs   from "yargs/yargs";

import getEnv     from "./utils/env.js";
import getAliases from "./utils/getAliases.js";
import getDirs    from "./utils/getDirs.js";

import type {Arguments} from "yargs";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";


const DIRS = getDirs(true, true, true);
const DIR_MAP = Object.fromEntries(DIRS.map((d) => [d.value, d]));

async function LaunchTest(args: Arguments, dir: string, flags: Record<string, unknown>) {
    return await jest.runCLI({
        ...args,
        ...flags,
        config: JSON.stringify({
            "preset":           "ts-jest",
            "testEnvironment":  "jsdom",
            "moduleNameMapper": getAliases(path.resolve(process.cwd(), dir), "jest"),

            "transform": {
                "^.+\\.scss$": path.resolve("build/scripts/test/scssTransform.js"),
            },
        }),
    }, [dir]);
}


// CLI
(async () => {
    const argv = await yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("coverage")
        .argv;

    const ci = argv.ci;
    const coverage = argv.coverage;

    let dirs = argv._;
    if (ci && dirs.length === 0) {
        // Run tests on all directories
        dirs = Object.keys(DIR_MAP);
    } else if (dirs.length === 0) {
        // Prompt user for directory
        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project",
            choices: DIRS,
            initial: 1,
        });
        if (!value)
            return;
        dirs = [value];
    }

    const flags = {
        ci,
        coverage,

        watch: (dirs.length === 1 && !ci) && !coverage,

        collectCoverageFrom: "**/*.{js,ts,tsx}",
        coverageDirectory:   undefined,
    };

    const results = [];

    // Launch test in each directory
    for (const dir of dirs) {
        const info = DIR_MAP[dir];

        // Ensure all environment variables are read
        getEnv(`${dir}`, "");

        console.log();
        if (!info) {
            console.log(chalk.red("Could not find directory,", chalk.underline(dir) + "!"));
            continue;
        }
        if (info.disabled) {
            console.log(chalk.yellow("Skipping disabled directory,", chalk.underline(dir)));
            continue;
        }
        const testDir = (dir === "app" || dir === "site/shared")
                        ? `src/${dir}` : `src/site/pages/${dir}`;
        flags.coverageDirectory = `${process.cwd()}/coverage/${testDir}`;

        const { results: result } = await LaunchTest(argv, testDir, flags);
        results.push(result);
        if (coverage)
            open(flags.coverageDirectory + "/lcov-report/index.html");
    }

    const pass = results.every((r) => r.success);
    if (!pass && ci) // Exit with failure
        throw new Error("Not all tests passed!");
})();
