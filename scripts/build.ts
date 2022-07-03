import os from "os";
import {existsSync, rmSync} from "fs";
import {spawn} from "child_process";

import ora from "ora";
import chalk from "chalk";
import prompts from "prompts";
import yargs from "yargs/yargs";

import getDirs from "./utils/getDirs.js";
import copy_dir from "./utils/copyDir.js";
import startWebpack from "./webpack/index.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";


const DIRS = getDirs(true, false);
const DIR_MAP = Object.fromEntries(DIRS.map(d => [d.value, d]));


function build_server(prod) {
    return new Promise((resolve, reject) => {
        // GCP requires raw go files, so no need to build server
        if (prod) {
            copy_dir("src/server", "build")
            resolve();
            return;
        }

        copy_dir("src/server/data/sql/sqlite", "build/sql/sqlite");

        const isWin = (os.platform() === "win32");
        spawn(`cd src/server && go build -o ../../build/server${isWin ? ".exe" : ""}`, {
            shell: true, stdio: "inherit"
        }).on("exit", () => {
            resolve();
        });
    });
}
async function build_dir(dir) {
    return await startWebpack(dir, "production");
}


// CLI
(async () => {
    const argv = yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("prod")
        .argv;

    const ci = argv.ci;
    const prod = argv.prod;

    let dirs = argv._;
    if (ci && dirs.length === 0) {
        // Run tests on all directories
        dirs = Object.keys(DIR_MAP);
    } else if (dirs.length === 0) {
        // Prompt user for directory
        dirs = [(await prompts({
            type: "select",
            name: "value",
            message: "Pick a project to build",
            choices: DIRS,
            initial: 0
        })).value];
        if (!dirs[0])
            return;
    }

    // If prod, clear build directory first
    if (prod)
        rmSync("build", { recursive: true, force: true });

    // If manual production build, copy secrets
    if (prod && !ci && existsSync("src/secrets"))
        copy_dir("src/secrets", "build");

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
            await build_server(prod);
            spinner.stop();
        } else {
            await build_dir(`src/site/pages/${dir}`);
        }

        console.log(`${chalk.greenBright("Done!")}`);
    }
})();