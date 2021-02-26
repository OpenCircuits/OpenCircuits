const os = require("os");
const prompts = require("prompts");
const {spawn} = require("child_process");


function start_server() {
    if (os.platform() === "win32") {
        spawn("cd build && ./server.exe -no_auth", {
            shell: true,
            stdio: "inherit"
        });
    } else {
        spawn("cd build && ./server -no_auth", {
            shell: true,
            stdio: "inherit"
        });
    }
}


// CLI
(async () => {
    // Prompt for project type
    const type = await prompts({
        type: "select",
        name: "value",
        message: "Pick a project",
        choices: [
            { title: "Server",  description: "The backend server for OpenCircuits", value: "server" },
            { title: "Digital", description: "The digital version of OpenCircuits", value: "digital" },
            { title: "Analog",  description: "The anlog version of OpenCircuits", value: "analog", disabled: true },
            { title: "Landing", description: "The landing page for OpenCircuits", value: "landing", disabled: true }
        ],
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
    const dir = `src/site/pages/${type.value}`;
    spawn(`cd ${dir} && npm run start`, {
        shell: true,
        stdio: "inherit"
    });
})();