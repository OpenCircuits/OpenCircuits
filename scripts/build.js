const os = require("os");
const {renameSync, existsSync, rmSync} = require("fs");
const {spawn} = require("child_process");

const ora = require("ora");
const chalk = require("chalk");
const prompts = require("prompts");
const yargs = require("yargs/yargs");

const copy_dir = require("./utils/copyDir");


const DIRS = [
    { title: "Server",  description: "The backend server for OpenCircuits", value: "server" },
    { title: "Digital", description: "The digital version of OpenCircuits", value: "digital" },
    { title: "Analog",  description: "The anlog version of OpenCircuits",   value: "analog", disabled: true },
    { title: "Landing", description: "The landing page for OpenCircuits",   value: "landing", disabled: true }
];
const DIR_MAP = Object.fromEntries(DIRS.map(d => [d.value, d]));


function build_server(prod) {
    return new Promise((resolve, reject) => {
        // Copy go files to build folder
        if (prod) {
            copy_dir("src/server", "build")
            resolve();
            return;
        }

        copy_dir("src/server/data/sql/sqlite", "build/sql/sqlite");

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
            if (existsSync(`${dir}/build`)) {
                // Remove build/site folder
                if (existsSync("build/site"))
                    rmdirSync("build/site", { recursive: true });

                // Successful build, move folder to <rootDir>/build/site
                renameSync(`${dir}/build`, "build/site");
            }
            resolve();
        });
    });
}


// CLI
(async () => {
    const argv = yargs(process.argv.slice(2))
        .boolean("ci")
        .boolean("prod")
        .argv;

    const ci = argv.ci;
    const prod = argv.prod;

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

    // If prod, clear build directory first
    if (prod)
        rmSync("build", { recursive: true, force: true });


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


        if (dir === "server") {
            const spinner = ora(`Building ${chalk.blue(dir)}...`).start();
            await build_server(prod);
            spinner.stop();
        } else {
            await build_dir(`src/site/pages/${dir}`);
        }

        console.log(`${chalk.greenBright("Done!")}`);
    }
})();