import {spawn}      from "node:child_process";
import {existsSync} from "node:fs";
import os           from "node:os";
import path         from "node:path";

import chalk   from "chalk";
import prompts from "prompts";
import yargs   from "yargs";

import getDirs      from "./utils/getDirs.js";
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
    const dirs = getDirs(true, false, false);

    const { open, project, port } = await yargs(process.argv.slice(2))
        .boolean("open")
        .choices("project", dirs.map((dir) => dir.value as string))
        .number("port")
        .argv;

    let dir: string;
    if (project) {
        dir = project;
    } else {
        // Prompt for project type
        const { value } = await prompts({
            type:    "select",
            name:    "value",
            message: "Pick a project",
            choices: dirs,
            initial: dirs.findIndex((dir) => (dir.title === "Digital")),
        });
        dir = value;
    }

    if (!dir)
        return;

    // Start server
    if (dir === "server") {
        StartServer();
        return;
    }

    // Start digital/analog/landing page
    StartClient(`src/site/pages/${dir}`, dir, open, port);
})();
