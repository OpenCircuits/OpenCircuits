const os = require("os");
const {mkdirSync, copyFileSync, readdirSync} = require("fs");
const {spawn} = require("child_process");
const ora = require("ora");
const chalk = require("chalk");
const prompts = require("prompts");
const yargs = require("yargs/yargs");


const DIRS = [
    { title: "Server",  description: "The backend server for OpenCircuits", value: "server" },
    { title: "Digital", description: "The digital version of OpenCircuits", value: "digital", disabled: true },
    { title: "Analog",  description: "The anlog version of OpenCircuits",   value: "analog", disabled: true },
    { title: "Landing", description: "The landing page for OpenCircuits",   value: "landing", disabled: true }
];
const DIR_MAP = Object.fromEntries(DIRS.map(d => [d.value, d]));


function build_server() {
    return new Promise((resolve, reject) => {
        // Create directory and copy files
        mkdirSync("build/sql/sqlite", { recursive: true });
        const files = readdirSync("src/server/data/sql/sqlite/");
        for (const file of files)
            copyFileSync(`src/server/data/sql/sqlite/${file}`, `build/sql/sqlite/${file}`);

        const cmd = (os.platform() === "win32" ?
                        "cd src/server && go build -o ../../build/server.exe" :
                        "cd src/server && go build -o ../../build/server");

        spawn(cmd, {
            shell: true,
            stdio: "inherit"
        }).on("exit", () => {
            resolve();
        });
    });
}
function build_dir(dir) {
    return new Promise((resolve, reject) => {
        spawn(`cd ${dir} && npm run build`, {
            shell: true,
            stdio: "inherit"
        }).on("exit", () => {
            resolve();
        });
    });
}


// CLI
(async () => {
    const argv = yargs(process.argv.slice(2))
        .boolean("ci")
        .argv;

    const ci = argv.ci;

    let dirs = argv._;
    if (ci && dirs.length === 0) {
        // Run tests on all directories
        dirs = Object.keys(DIR_MAP);
    } else if (dirs.length === 0) {
        // Prompt user for directory
        dirs = [(await prompts({
            type: "select",
            name: "value",
            message: "Pick a project to build",
            choices: DIRS,
            initial: 0
        })).value];
        if (!dirs[0])
            return;
    }

    // Launch test in each directory
    for (const dir of dirs) {
        const info = DIR_MAP[dir];
        console.log();
        if (!info) {
            console.log(chalk.red("Could not find directory,", chalk.underline(dir) + "!"));
            continue;
        }
        if (info.disabled) {
            console.log(chalk.yellow("Skipping disabled directory,", chalk.underline(dir)));
            continue;
        }

        const spinner = ora(`Building ${chalk.blue(dir)}...`).start();

        if (dir === "server") {
            await build_server();
        } else {
            await build_dir(`src/site/pages/${type.value}`);
        }

        spinner.stop();
        console.log(`${chalk.greenBright("Done!")}`);
    }
})();