import os   from "os";
import path from "path";

import {existsSync} from "fs";
import {spawn}      from "child_process";

import chalk   from "chalk";
import prompts from "prompts";

import getDirs      from "./utils/getDirs.js";
import startWebpack from "./webpack/index.js";


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";


function start_server() {
    const isWin = (os.platform() === "win32");

    // Check if server is built
    if (!existsSync(path.resolve(process.cwd(), "build", (isWin ? "server.exe" : "server")))) {
        console.log(`\n${chalk.red("Failed to start server!")}\nYou must first build the server with ${chalk.bold(chalk.cyan("yarn build"))}\n`);
        return;
    }

    spawn(`cd build && ${isWin ? "server.exe" : "./server"} -no_auth`, {
        shell: true, stdio: "inherit",
    });
}

function start_client(dir: string) {
    startWebpack(dir, "development");
}


// CLI
(async () => {
    // Prompt for project type
    const type = await prompts({
        type: "select",
        name: "value",
        message: "Pick a project",
        choices: getDirs(true, false),
        initial: 1
    });

    if (!type.value)
        return;

    // Start server
    if (type.value === "server") {
        start_server();
        return;
    }

    // Start digital/analog/landing page
    start_client(`src/site/pages/${type.value}`);
})();
