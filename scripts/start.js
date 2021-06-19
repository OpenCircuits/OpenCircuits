const os = require("os");
const prompts = require("prompts");
const {spawn} = require("child_process");
const startWebpack = require("./webpack");
const getDirs = require("./utils/getDirs");
const {existsSync} = require("fs");
const path = require("path");


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";


function start_server() {
    const isWin = (os.platform() === "win32");
    spawn(`cd build && ${isWin ? "server.exe" : "./server"} -no_auth`, {
        shell: true, stdio: "inherit",
    });
}

function start_client(dir) {
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