import {existsSync, readdirSync, rmSync} from "node:fs";
import os                                from "node:os";

import chalk   from "chalk";
import ora     from "ora";
import prompts from "prompts";
import yargs   from "yargs/yargs";

import CopyDir      from "./utils/copyDir.js";
import {Spawn}      from "./utils/spawn.js";
import startWebpack from "./webpack/index.js";

import {FindDir, getOtherPageDirs, getProjectSiteDirs, getServerDir} from "./utils/getDirs.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";


async function BuildServer(prod: boolean) {
    // GCP requires raw go files, so no need to build server
    if (prod) {
        CopyDir("src/server", "build")
        return;
    }

    CopyDir("src/server/data/sql/sqlite", "build/sql/sqlite");

    const isWin = (os.platform() === "win32");
    await Spawn(`cd src/server && go build -o ../../build/server${isWin ? ".exe" : ""}`, {
        shell: true, stdio: "inherit",
    });
}
async function BuildDir(dir: string, project: string) {
    return await startWebpack(dir, project, "production", false);
}


// CLI
(async () => {
    const dirs = [
        getServerDir(),
        ...getProjectSiteDirs(),
        ...getOtherPageDirs(),
    ];

    const argv = await yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("prod")
        .argv;

    const ci = argv.ci;
    const prod = argv.prod;

    const dirPaths = await (async () => {
        // If specified dirs in argv, then just use those.
        if (argv._.length > 0)
            return argv._.map((s) => `${s}`);

        // If nothing specified, but using CI, use all directories.
        if (ci)
            return dirs.map((d) => d.path);

        // Else prompt user for a directory
        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project to build",
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

    // If prod, clear build directory first
    if (prod) {
        readdirSync("build")
            // Don't clear scripts directory though
            .filter((name) => (name !== "scripts"))
            .forEach((name) => rmSync(`./build/${name}`, { recursive: true, force: true }));
    }

    // If manual production build, copy secrets
    if (prod && !ci && existsSync("src/secrets"))
        CopyDir("src/secrets", "build");

    // Launch build in each directory
    const dirsToUse = dirPaths.map((p) => [p, FindDir(dirs, p)] as const);
    for (const [path, dir] of dirsToUse) {
        console.log();
        if (!dir) {
            console.log(chalk.red("Could not find directory,", chalk.underline(path) + "!"));
            continue;
        }
        // if (info.disabled) {
        //     console.log(chalk.yellow("Skipping disabled directory,", chalk.underline(dir)));
        //     continue;
        // }

        if (dir.name === "server") {
            const spinner = ora(`Building ${chalk.blue(dir)}...`).start();
            await BuildServer(prod);
            spinner.stop();
        } else if (dir.name === "docs") {
            await Spawn(`cd ${dir.path} && yarn build`, { shell: true, stdio: "inherit" });
        } else {
            await BuildDir(dir.path, dir.name);
        }

        console.log(`${chalk.greenBright("Done!")}`);
    }
})();
