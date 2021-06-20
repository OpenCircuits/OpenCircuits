const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {Config} = require("./types");


/**
 * @param {Config} config
 * @returns {webpack.Configuration}
 */
module.exports = ({ isProd, publicPath }) => ({
    module: {
        rules: [
            {
                // Test for: .sass, .scss, or .css
                test: /\.(s[ac]|c)ss$/i,

                // Reads right to left
                // So first processes it w/ sass-loader, which turns it into css
                //  then it gets processed into postcss-loader which makes it browser-compatible
                //  and then it goes through css-loader to actually load it into the jsbundle
                //  then shoots it into mini-css-extract-plugin to extract it out of the bundle and into a separate file
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath, },
                    },
                    {
                        loader: "css-loader",
                        options: { importLoaders: 1 },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env",
                                ],
                            },
                        },
                    },
                    "sass-loader",
                ]
            }
        ]
    },

    plugins: [
        new MiniCssExtractPlugin(isProd ? {
            // Extract the css to /static/css/
            filename: "static/css/[name].[contenthash:8].css",
            chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        } : undefined),
    ],
});
