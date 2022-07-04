import path from "node:path";

import HtmlWebpackPlugin     from "html-webpack-plugin";
import InterpolateHtmlPlugin from "interpolate-html-plugin";

import type {Config}        from "./types";
import type {Configuration} from "webpack";


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
