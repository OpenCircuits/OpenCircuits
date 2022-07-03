import webpack from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import InterpolateHtmlPlugin from "interpolate-html-plugin";

import * as Types from "./types.js";


/**
 * @param {Types.Config} config
 * @returns {webpack.Configuration}
 */
 export default ({ env, publicPath }) => ({
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(publicPath, "index.html"),
        }),

        new InterpolateHtmlPlugin(env),
    ],
});
