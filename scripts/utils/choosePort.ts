import detect from "detect-port-alt";
import prompts from "prompts";
import chalk from "chalk";


/**
 * @param {string} host
 * @param {number} defaultPort
 * @returns {Promise<string>}
 */
export default async function choosePort(host, defaultPort) {
    try {
        const port = await detect(defaultPort, host);

        // All good to use
        if (port === defaultPort)
            return port;

        // Prompt to see if they want to change the port
        const {changePort} = await prompts({
            type: "confirm",
            name: "changePort",
            message: chalk.yellow(
                `Something is already running on port ${defaultPort}.\n\n` +
                `Would you like to run the app on another port instead?`
            ),
            initial: true,
        });

        return (changePort ? port : null);
    } catch (err) {
        throw new Error(
            chalk.red(`Could not find an open port at ${chalk.bold(host)}.\n`) +
            `Network error message: ${err.message || err}\n`
        );
    }
}