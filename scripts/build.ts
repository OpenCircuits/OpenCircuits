import {spawn}                           from "node:child_process";
import {existsSync, readdirSync, rmSync} from "node:fs";
import os                                from "node:os";

import chalk   from "chalk";
import ora     from "ora";
import prompts from "prompts";
import yargs   from "yargs/yargs";

import CopyDir      from "./utils/copyDir.js";
import getDirs      from "./utils/getDirs.js";
import startWebpack from "./webpack/index.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";


const DIRS = getDirs(true, false, false);
const DIR_MAP = Object.fromEntries(DIRS.map((d) => [d.value, d]));


function BuildServer(prod: boolean) {
    return new Promise<void>((resolve, _) => {
        // GCP requires raw go files, so no need to build server
        if (prod) {
            CopyDir("src/server", "build")
            resolve();
            return;
        }

        CopyDir("src/server/data/sql/sqlite", "build/sql/sqlite");

        const isWin = (os.platform() === "win32");
        spawn(`cd src/server && go build -o ../../build/server${isWin ? ".exe" : ""}`, {
            shell: true, stdio: "inherit",
        }).on("exit", () => {
            resolve();
        });
    });
}
async function BuildDir(dir: string, project: string) {
    return await startWebpack(dir, project, "production", false);
}


// CLI
(async () => {
    const argv = await yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("prod")
        .argv;

    const ci = argv.ci;
    const prod = argv.prod;

    let dirs = argv._ as string[];
    if (ci && dirs.length === 0) {
        // Run tests on all directories
        dirs = Object.keys(DIR_MAP);
    } else if (dirs.length === 0) {
        // Prompt user for directory
        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project to build",
            choices: DIRS,
            initial: 0,
        });
        if (!value)
            return;
        dirs = [value];
    }

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
    for (const dir of dirs) {
        const info = DIR_MAP[dir];

        console.log();
        if (!info) {
            console.log(chalk.red("Could not find directory,", chalk.underline(dir) + "!"));
            continue;
        }
        if (info.disabled) {
            console.log(chalk.yellow("Skipping disabled directory,", chalk.underline(dir)));
            continue;
        }

        if (dir === "server") {
            const spinner = ora(`Building ${chalk.blue(dir)}...`).start();
            await BuildServer(prod);
            spinner.stop();
        } else {
            await BuildDir(`src/site/pages/${dir}`, dir);
        }

        console.log(`${chalk.greenBright("Done!")}`);
    }
})();
