import chalk   from "chalk";
import detect  from "detect-port-alt";
import prompts from "prompts";


/**
 * Chooses an open port to run on.
 *
 * @param host        The hostname.
 * @param defaultPort The default port number.
 * @returns             The found port.
 */
export default async function choosePort(host: string, defaultPort: number) {
    try {
        const port: number = await detect(defaultPort, host);

        // All good to use
        if (port === defaultPort)
            return port;

        // Prompt to see if they want to change the port
        const { changePort } = await prompts({
            type:    "confirm",
            name:    "changePort",
            message: chalk.yellow(
                `Something is already running on port ${defaultPort}.\n\n` +
                "Would you like to run the app on another port instead?"
            ),
            initial: true,
        });

        return (changePort ? port : undefined);
    } catch (e) {
        throw new Error(
            chalk.red(`Could not find an open port at ${chalk.bold(host)}.\n`) +
            `Network error message: ${e.message || e}\n`
        );
    }
}
