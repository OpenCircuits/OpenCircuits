const path = require("path");
const url = require("url");
const address = require("address");
const chalk = require("chalk");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const openBrowser = require("../utils/browser/openBrowser");
const choosePort = require("../utils/choosePort");
const copyDir = require("../utils/copyDir");
const getEnv = require("../utils/env");
const config = require("./config");


/**
 * @param {string} dir
 * @param {webpack.Configuration["mode"]} mode
 * @returns {Promise<void>}
 */
module.exports = async (dir, mode) => {
    const publicRoot = "/";
    const rootPath = process.cwd();
    const dirPath = path.resolve(rootPath, dir);
    const buildDir = path.resolve(rootPath, "build/site");

    const compiler = webpack(config({
        mode,
        isProd: (mode === "production"),
        isDev: (mode === "development"),

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
        const protocol = "http";
        const hostname = "localhost"; // Allow any connections
        const pathname = publicRoot.slice(0, -1);

        // Start dev server
        const port = await choosePort("0.0.0.0", 3000);
        if (!port)
            return; // No port found

        // Attempt to get full IPv4 local address
        let lanUrl;
        try {
            lanUrl = address.ip();
            if (lanUrl) {
                const privateTest = /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/;
                // Check if private
                if (privateTest.test(lanUrl))
                    lanUrl = url.format({ protocol, hostname: lanUrl, port: chalk.bold(port), pathname });
                else
                    lanUrl = undefined;
            }
        } catch (e) {
            // Ignore, just defer to localhost
            lanUrl = undefined;
        }

        let firstDone = false;
        compiler.hooks.done.tap("done", async stats => {
            if (!firstDone) {
                openBrowser(url.format({ protocol, hostname, port, pathname }));
                firstDone = true;
            }

            console.log(`\nYou can now view ${chalk.bold("OpenCircuits")} in the browser!\n`);

            if (lanUrl) {
                console.log(`  ${chalk.bold("Local:")}            ${url.format({ protocol, hostname, port: chalk.bold(port), pathname })}`);
                console.log(`  ${chalk.bold("On Your Network:")}  ${lanUrl}`);
            }

            console.log(`\nNote that the development buld is not optimized!`);
            console.log(`To create a production build, use ${chalk.cyan("yarn build")}\n`);
        });

        const server = new WebpackDevServer({
            // Explanations: https://stackoverflow.com/a/62992178
            static: {
                directory: path.resolve(dirPath, "public"),
                publicPath: [pathname],
            },
            hot: true,
            host: "0.0.0.0",
            port,
            proxy: {
                "/api/**": {
                    target: `http://${hostname}:8080`,
                    secure: false,
                    changeOrigin: true,
                },
            },
            devMiddleware: {
                publicPath: pathname,
            },
            client: {
                overlay: true,
            },
        }, compiler);

        ["SIGINT", "SIGTERM"].forEach(sig => {
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
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
};
