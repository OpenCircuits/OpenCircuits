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
            { title: "Server",  description: "The backend server for OpenCircuits", value: "server", disabled: true },
            { title: "App",     description: "The app for OpenCircuits",            value: "app"},
            { title: "Digital", description: "The digital version of OpenCircuits", value: "digital" },
            { title: "Analog",  description: "The anlog version of OpenCircuits",   value: "analog", disabled: true },
            { title: "Landing", description: "The landing page for OpenCircuits",   value: "landing", disabled: true }
        ],
        initial: 1
    });

    if (!type.value)
        return;

    if (type.value === "app") {
        spawn(`cd src/app && npm run test`, {
            shell: true,
            stdio: "inherit"
        });
        return;
    }

    // Test digital/analog/landing page
    const dir = `src/site/pages/${type.value}`;
    spawn(`cd ${dir} && npm run test`, {
        shell: true,
        stdio: "inherit"
    });
})();