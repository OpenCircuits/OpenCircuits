const prompts = require("prompts");
const {spawn} = require("child_process");
const chalk = require("chalk");
const yargs = require("yargs/yargs");


const DIRS = [
    { title: "Server",  description: "The backend server for OpenCircuits", value: "server", disabled: true },
    { title: "App",     description: "The app for OpenCircuits",            value: "app"},
    { title: "Digital", description: "The digital version of OpenCircuits", value: "digital", disabled: true},
    { title: "Analog",  description: "The anlog version of OpenCircuits",   value: "analog", disabled: true },
    { title: "Landing", description: "The landing page for OpenCircuits",   value: "landing", disabled: true }
];
const DIR_MAP = Object.fromEntries(DIRS.map(d => [d.value, d]));

function launch_test(dir, flags) {
    return new Promise((resolve, reject) => {
        spawn(`cd ${dir} && npm run test -- ${flags}`, {
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
        dirs = [await prompts({
            type: "select",
            name: "value",
            message: "Pick a project",
            choices: DIRS,
            initial: 1
        }).value];
        if (!dirs[0])
            return;
    }

    const flags = (ci ? "--ci " : "") +
                  (dirs.length > 1 ? "--watch=false " : "");

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
        await launch_test(dir === "app" ? "src/app" : `src/site/pages/${dir}`, flags);
    }
})();