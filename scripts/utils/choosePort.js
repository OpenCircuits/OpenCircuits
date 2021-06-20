const detect = require("detect-port-alt");
const prompts = require("prompts");
const chalk = require("chalk");


/**
 * @param {string} host
 * @param {number} defaultPort
 * @param {boolean} prompt
 * @returns {Promise<string>}
 */
module.exports = async function choosePort(host, defaultPort, prompt) {
    try {
        const port = await detect(defaultPort, host);

        // All good to use
        if (port === defaultPort)
            return port;

        // Prompt to see if they want to change the port
        const {changePort} = prompt ? await prompts({
            type: "confirm",
            name: "changePort",
            message: chalk.yellow(
                `Something is already running on port ${defaultPort}.\n\n` +
                `Would you like to run the app on another port instead?`
            ),
            initial: true,
        }) : {changePort: true};

        return (changePort ? port : null);
    } catch (err) {
        throw new Error(
            chalk.red(`Could not find an open port at ${chalk.bold(host)}.\n`) +
            `Network error message: ${err.message || err}\n`
        );
    }
}