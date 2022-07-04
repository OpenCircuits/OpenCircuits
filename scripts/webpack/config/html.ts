import path from "path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import InterpolateHtmlPlugin from "interpolate-html-plugin";

import type {Configuration} from "webpack";
import type {Config} from "./types";


/**
 * @param config The current configuration
 * @returns The webpack configuration for the HTML-specific rules
 */
export default ({ env, publicPath }: Config): Configuration => ({
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(publicPath, "index.html"),
        }),

        new InterpolateHtmlPlugin(env),
    ],
});
