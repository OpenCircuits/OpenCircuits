const os = require("os");
const {spawn, execSync} = require("child_process");
const ora = require("ora");
const chalk = require("chalk");
const prompts = require("prompts");


function build_server() {
    const spinner = ora("Building...").start();

    // Create directory and copy files
    execSync("mkdir -p build/sql/sqlite");
    execSync("cp src/server/data/sql/sqlite/* build/sql/sqlite");

    const cmd = (os.platform() === "win32" ?
                    "cd src/server && go build -o ../../build/server.exe" :
                    "cd src/server && go build -o ../../build/server");

    spawn(cmd, {
        shell: true,
        stdio: "inherit"
    }).on("exit", () => {
        spinner.stop();
        console.log(`${chalk.greenBright("Done!")}`);
    });
}


// CLI
(async () => {
    // Prompt for project type
    const type = await prompts({
        type: "select",
        name: "value",
        message: "Pick a project to build",
        choices: [
            { title: "Server",  description: "The backend server for OpenCircuits", value: "server" },
            { title: "Digital", description: "The digital version of OpenCircuits", value: "digital", disabled: true },
            { title: "Analog",  description: "The anlog version of OpenCircuits", value: "analog", disabled: true },
            { title: "Landing", description: "The landing page for OpenCircuits", value: "landing", disabled: true }
        ],
        initial: 0
    });

    if (!type.value)
        return;

    // Build server
    if (type.value === "server") {
        build_server();
        return;
    }

    // Build digital/analog/landing page
    const dir = `src/site/pages/${type.value}`;
    spawn(`cd ${dir} && npm run build`, {
        shell: true,
        stdio: "inherit"
    });
})();