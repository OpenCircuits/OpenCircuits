const path = require("path");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const choosePort = require("../utils/choosePort");
const copyDir = require("../utils/copyDir");
const getAliases = require("../utils/getAliases");
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
        buildDir: path.resolve(rootPath, "build"),

        stats: "none",

        env: Object.keys(process.env)
                   .reduce(
                       (env, key) => ({...env, [key]: process.env[key]}),
                       {
                           NODE_ENV: process.env.NODE_ENV || "development",
                           PUBLIC_URL: publicRoot.slice(0, -1),
                           AUTH_TYPES: "",
                       }
                   )
    }));

    if (mode === "development") {
        // Start dev server
        const port = await choosePort("localhost", 3000);
        if (!port)
            return; // No port found

        const server = new WebpackDevServer(compiler, {
            // Explanations: https://stackoverflow.com/a/62992178
            publicPath: publicRoot.slice(0, -1),
            contentBasePublicPath: publicRoot,
            contentBase: path.resolve(dirPath, "public"),
            hot: true,
            quiet: true,
        });
        server.listen(port, "localhost", (err) => { if (err) throw err; });
    }

    if (mode === "production") {
        copyDir(path.resolve(dirPath, "public"), path.resolve(rootPath, "build"));

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
