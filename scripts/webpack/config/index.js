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
    const { entry, isDev, mode, target, buildDir, stats, env } = config;

    return mergeDeep(
        {
            mode, target, entry, stats,

            output: {
                path: buildDir,
                publicPath: "/",
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

            devtool: (isDev ? "source-map" : undefined),

            devServer: {
                contentBase: buildDir,
                publicPath: ".",
                hot: true,
                quiet: true,
            },
        },
        require("./img")(config),
        require("./css")(config),
        require("./ts")(config),
        require("./html")(config),
    );
}
