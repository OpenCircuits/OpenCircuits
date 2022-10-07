import path from "node:path";

import address          from "address";
import chalk            from "chalk";
import webpack          from "webpack";
import WebpackDevServer from "webpack-dev-server";

import openBrowser from "../utils/browser/openBrowser.js";
import choosePort  from "../utils/choosePort.js";
import copyDir     from "../utils/copyDir.js";
import getEnv      from "../utils/env.js";

import config          from "./config/index.js";
import customDevServer from "./customDevServer.js";


/**
 * Basic webpack creation.
 *
 * @param dir     The directory to launch the webpack instance in.
 * @param project The project that is being started, i.e. "digital" or "analog".
 * @param mode    The webpack-mode: development or production.
 * @param open    Boolean indicating whether or not we should auto-open the browser on start.
 */
export default async (dir: string, project: string, mode: "development" | "production", open: boolean) => {
    const publicRoot = "/";
    const rootPath = process.cwd();
    const dirPath = path.resolve(rootPath, dir);
    const buildDir = path.resolve(rootPath, "build/site");

    const compiler = webpack(config({
        mode,
        isProd: (mode === "production"),
        isDev:  (mode === "development"),

        target: (mode === "production" ? "browserslist" : "web"),

        rootDir: dirPath,

        // Needs to be relative paths from root
        entry:      `./${dir}/src/index.tsx`,
        publicPath: `./${dir}/public`,

        // Needs to be absolute path
        buildDir,

        stats: "none",

        env: getEnv(dirPath, publicRoot),
    }));

    if (mode === "development") {
        const formatURL = (protocol: "http" | "https", hostname: string, port: number | string, pathname: string) => (
            `${protocol}://${hostname}:${port}${pathname}`
        );

        const protocol = "http";
        const hostname = "localhost"; // Allow any connections
        const pathname = publicRoot.slice(0, -1);

        // Start dev server
        const port = await choosePort("0.0.0.0", 3000);
        if (!port)
            return; // No port found

        // Attempt to get full IPv4 local address
        const lanUrl = (() => {
            try {
                const ip = address.ip();
                if (ip) {
                    const privateTest = /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./;
                    // Check if private
                    if (privateTest.test(ip))
                        return formatURL(protocol, ip, chalk.bold(port), pathname);
                }
            } catch {
                // Ignore, just defer to localhost
            }
        })();

        let firstDone = false;
        compiler.hooks.done.tap("done", async (_) => {
            if (open && !firstDone) {
                openBrowser(formatURL(protocol, hostname, port, pathname));
                firstDone = true;
            }

            console.log(`\nYou can now view ${chalk.bold("OpenCircuits")} in the browser!\n`);

            if (lanUrl) {
                console.log(`  ${chalk.bold("Local:")}            `
                            + formatURL(protocol, hostname, chalk.bold(port), pathname));
                console.log(`  ${chalk.bold("On Your Network:")}  ${lanUrl}`);
            }

            console.log("\nNote that the development buld is not optimized!");
            console.log(`To create a production build, use ${chalk.cyan("yarn build")}\n`);
        });

        const server = new WebpackDevServer({
            // Explanations: https://stackoverflow.com/a/62992178
            static: {
                directory:  path.resolve(dirPath, "public"),
                publicPath: [pathname],
            },
            hot:   true,
            host:  "0.0.0.0",
            port,
            proxy: {
                "/api/**": {
                    target:       `http://${hostname}:8080`,
                    secure:       false,
                    changeOrigin: true,
                },
            },
            devMiddleware: {
                publicPath: pathname,
            },
            client: {
                overlay: true,
            },
            // Allows devs to save local circuits for use in #1037
            setupMiddlewares: customDevServer(project),
        }, compiler);

        ["SIGINT", "SIGTERM"].forEach((sig) => {
            process.on(sig, () => {
                server.stop();
                process.exit();
            });
        });

        await server.start();
        console.log(chalk.cyan("Starting the development server...\n"));
    }

    if (mode === "production") {
        copyDir(path.resolve(dirPath, "public"), buildDir);

        return new Promise((resolve, reject) => {
            compiler.run((err, result) => {
                if (err || result!.compilation.errors.length > 0)
                    reject({ err, errors: result!.compilation.errors });
                else
                    resolve(result);
            });
        });
    }
};
