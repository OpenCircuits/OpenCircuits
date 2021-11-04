const path = require("path");
const webpack = require("webpack");

const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const mergeDeep = require("../../utils/merge");
const {Config} = require("./types");


/**
 * @param {Config} config
 * @returns {webpack.Configuration}
 */
module.exports = (config) => {
    const { entry, isDev, isProd, mode, target, buildDir, stats, env } = config;

    return mergeDeep(
        {
            mode, target, entry, stats,

            output: {
                path: buildDir,
                publicPath: "/",

                // Extract the JS to /static/js/
                filename: (isProd ? "static/js/[name].[contenthash:8].js" : undefined),
                chunkFilename: (isProd ? "static/js/[name].[contenthash:8].chunk.js" : undefined),
            },

            plugins: [
                new FriendlyErrorsWebpackPlugin(),

                // Stringify environment variables
                new webpack.DefinePlugin({
                    "process.env": Object.fromEntries(
                        Object.entries(env).map(
                            ([key, val]) => [key, JSON.stringify(val)]
                        )
                    )
                }),
            ],

            infrastructureLogging: {
                level: "error",
            },

            devtool: (isDev ? "source-map" : undefined),
        },
        require("./img")(config),
        require("./css")(config),
        require("./ts")(config),
        require("./html")(config),
    );
}
