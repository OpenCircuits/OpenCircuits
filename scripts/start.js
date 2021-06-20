const os = require("os");
const path = require("path");
const {existsSync} = require("fs");
const {spawn, fork} = require("child_process");
const kill = require("tree-kill");

const termkit = require("terminal-kit");
const term = termkit.terminal;

const chalk = require("chalk");
const yargs = require("yargs/yargs");

const startWebpack = require("./webpack");
const copy_dir = require("./utils/copyDir");
const getDirs = require("./utils/getDirs");
const genQR = require("./utils/qr");
const UI = require("./utils/ui");


// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";



const DIRS = getDirs(true, false);
const DIR_MAP = Object.fromEntries(DIRS.map(d => [d.value, d]));


// CLI
(async () => {
    // console.log("TEST");
    // console.log(`${chalk.bgBlack("TEST")}`);
    // console.log(`${chalk.bgGrey("TEST")}`);
    // console.log(`${chalk.bgBlackBright("TEST")}`);
    // console.log(`${chalk.bgBlackBright("TEST")}`);
    // console.log(`${chalk.red("\u001B[45mTE\u001B[49mST")}`);
    // console.log(`${chalk.red.bgAnsi256(234)("TEST")}`);
    // return;


    const argv = yargs(process.argv.slice(2))
        .boolean("noui")
        .argv;

    // Start without UI
    if (argv.noui) {
        const dir = argv._;
        if (!DIR_MAP[dir])
            throw new Error(`Invalid directory: ${dir} in start script!`);

        if (dir === "server") {
            start_server();
            return;
        }
        const localUrl = await startWebpack(`src/site/pages/${dir}`, "development", false);
        process.send(localUrl);
        return;
    }


    const ui = await UI();

    let frontend, server;
    try {
        // Spawn frontend node
        frontend = fork("./scripts/start", ["--noui", "digital"],
            { detached: true, silent: true, env: { ...process.env, FORCE_COLOR: 1 } });
        frontend.stdout.on("data", (data) => ui.frontendBox.appendLog(`\x1b[0m${data}`));
        frontend.stderr.on("data", (data) => ui.frontendBox.appendLog(`\x1b[0m${data}`));
        frontend.on("message", async (message) => {
            // LAN URL for QRCode
            if (message && `${message}`.startsWith("http")) {
                const qr = await genQR(`${message}`);
                ui.setQRCode(qr.qrcode);
            }
        });


        // Spawn backend node
        await buildServer(true);
        server = start_server();

        function start_server() {
            const isWin = (os.platform() === "win32");

            // Check if server is built
            if (!existsSync(path.resolve(process.cwd(), "build", (isWin ? "server.exe" : "server")))) {
                ui.serverBox.appendLog(`\n${chalk.red("Failed to start server!")}\nYou must first build the server with ${chalk.bold(chalk.cyan("yarn build"))}\n`);
                return;
            }

            const server = spawn(`cd build && ${isWin ? "server.exe" : "./server"} -no_auth`, {
                shell: true, detached: true, env: { ...process.env, FORCE_COLOR: true }
            });
            server.stdout.on("data", (data) => ui.serverBox.appendLog((`\x1b[0m${data}`)));
            server.stderr.on("data", (data) => ui.serverBox.appendLog((`\x1b[0m${data}`)));
            return server;
        }
        function buildServer(firstTime = false) {
            return new Promise((resolve) => {
                ui.serverBox.setContent("");

                copy_dir("src/server/data/sql/sqlite", "build/sql/sqlite");
                const isWin = (os.platform() === "win32");
                const child = spawn(`cd src/server && go build -o ../../build/server${isWin ? ".exe" : ""}`, {
                    shell: true, detached: true, env: { ...process.env, FORCE_COLOR: true }
                });
                child.stdout.on("data", (data) => ui.serverBox.appendLog(`${data}`));
                child.stderr.on("data", (data) => ui.serverBox.appendLog(`${data}`));

                child.on("exit", () => {
                    if (!firstTime) {
                        // Restart server
                        server = start_server();
                    }
                    ui.serverBox.setContent("");
                    resolve();
                });
            });
        }

        ui.setOnExitListener((callback) => {
            kill(frontend.pid, callback);
        });
        ui.setOnServerExitListener((callback) => {
            if (server?.pid)
                kill(server.pid, callback);
        });
    } catch(e) {
        ui.destroy();
        if (frontend?.pid)
            kill(frontend.pid);
        if (server?.pid)
            kill(server.pid);
        console.error(`EXITED WITH ERROR: ${e}`);
        throw e;
    }

    // ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM"].forEach((ev) =>
    //     process.on(ev, () => {
    //         kill(frontend.pid);
    //     })
    // );
})();