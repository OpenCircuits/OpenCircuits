import {spawn}      from "node:child_process";
import {existsSync} from "node:fs";
import os           from "node:os";
import path         from "node:path";

import chalk   from "chalk";
import prompts from "prompts";
import yargs   from "yargs";

import {getOtherPageDirs, getProjectSiteDirs, getServerDir} from "./utils/getDirs.js";
import startWebpack from "./webpack/index.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";


function StartServer() {
    const isWin = (os.platform() === "win32");

    // Check if server is built
    if (!existsSync(path.resolve(process.cwd(), "build", (isWin ? "server.exe" : "server")))) {
        console.log(
            `\n${chalk.red("Failed to start server!")}\n`+
            `You must first build the server with ${chalk.bold(chalk.cyan("yarn build"))}\n`
        );
        return;
    }

    spawn(`cd build && ${isWin ? "server.exe" : "./server"} -no_auth`, {
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

    const { open, targetDir, port } = await yargs(process.argv.slice(2))
        .boolean("open")
        .choices("path", dirs.map((dir) => dir.path))
        .number("port")
        .argv;

    const dirPath = await (async () => {
        if (targetDir)
            return targetDir;
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

    const dir = dirs.find((d) => (d.path === dirPath));
    if (!dir) {
        console.error(`Failed to find dir with path: ${dirPath}!`);
        return;
    }

    // Start server
    if (dir.name === "server") {
        StartServer();
        return;
    }

    if (dir.name === "docs") {
        spawn(`cd ${dir.path} && yarn start`, { shell: true, stdio: "inherit" });
        return;
    }

    // Start digital/analog/landing page
    StartClient(dir.path, dir.name, open, port);
})();
