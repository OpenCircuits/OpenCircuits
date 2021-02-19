const os = require("os");
const {spawn, execSync} = require("child_process");


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
