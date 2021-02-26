const os = require("os");
const prompts = require("prompts");
const {spawn} = require("child_process");


function build_server() {
    // Create directory and copy files
    execSync("mkdir -p build/sql/sqlite");
    execSync("cp src/server/data/sql/sqlite/* build/sql/sqlite");

    if (os.platform() === "win32") {
        spawn("cd src/server && go build -o ../../build/server.exe", {
            shell: true,
            stdio: "inherit"
        });
    } else {
        spawn("cd src/server && go build -o ../../build/server", {
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