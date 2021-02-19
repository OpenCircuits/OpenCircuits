const os = require("os");
const {spawn} = require("child_process");


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
