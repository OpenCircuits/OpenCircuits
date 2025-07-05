import {existsSync} from "node:fs";
import os           from "node:os";
import path         from "node:path";

import chalk   from "chalk";
import prompts from "prompts";
import yargs   from "yargs";

import {FindDir, getOtherPageDirs, getProjectSiteDirs, getServerDir} from "./utils/getDirs.js";
import startWebpack from "./webpack/index.js";
import {Spawn}      from "./utils/spawn.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";


async function StartServer(extraFlags?: string) {
    const isWin = (os.platform() === "win32");

    // Check if server is built
    if (!existsSync(path.resolve(process.cwd(), "build", (isWin ? "server.exe" : "server")))) {
        console.log(
            `\n${chalk.red("Failed to start server!")}\n`+
            `You must first build the server with ${chalk.bold(chalk.cyan("yarn build"))}\n`
        );
        return;
    }

    await Spawn(`cd build && ${isWin ? "server.exe" : "./server"} ${extraFlags}`, {
        shell: true, stdio: "inherit",
    });
}

function StartClient(dir: string, project: string, open: boolean, forcePort?: number) {
    startWebpack(dir, project, "development", open, forcePort);
}


// CLI
(async () => {
    const dirs = [
        getServerDir(),
        ...getProjectSiteDirs(),
        ...getOtherPageDirs(),
    ];

    const argv = await yargs(process.argv.slice(2))
        .boolean("open")
        .choices("path", dirs.map((dir) => dir.path))
        .number("port")
        .string("extraFlags")
            .usage("--extraFlags='-no_auth -firebase_auth=\"secrets/firebase.json\"'")
        .argv;

    const { open, port, extraFlags } = argv;

    const dirPath = await (async () => {
        // If specified dirs in argv, then just use those.
        if (argv._.length > 0){
            if (argv._.length > 1)
                throw new Error("Can only specify one directory to start at a time!");
            return `${argv._[0]}`;
        }

        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project",
            choices: dirs.map((d) => ({
                ...d,
                value: d.path,
            })),
            initial: dirs.findIndex((d) => d.name === "digital"),
        });
        return value;
    })();
    if (!dirPath)
        return;

    const dir = FindDir(dirs, dirPath);
    if (!dir) {
        console.error(`Failed to find dir with path: ${dirPath}!`);
        return;
    }

    // Start server
    if (dir.name === "server") {
        await StartServer(extraFlags);
        return;
    }

    if (dir.name === "docs") {
        await Spawn(`cd ${dir.path} && yarn start`, { shell: true, stdio: "inherit" });
        return;
    }

    // Start digital/analog/landing page
    StartClient(dir.path, dir.name, open, port);
})();
