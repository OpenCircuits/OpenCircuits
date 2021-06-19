const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const {Config} = require("./types");


/**
 * @param {Config} config
 * @returns {webpack.Configuration}
 */
module.exports = ({ env, publicPath }) => ({
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(publicPath, "index.html"),
        }),

        new InterpolateHtmlPlugin(env),
    ],
});
