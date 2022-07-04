import webpack from "webpack";

import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin";

import mergeDeep from "../../utils/merge.js";

import IMGConfig  from "./img.js";
import CSSConfig  from "./css.js";
import TSConfig   from "./ts.js";
import HTMLConfig from "./html.js";
import WASMConfig from "./wasm.js";

import type {Configuration} from "webpack";
import type {Config} from "./types";


/**
 * @param config The current configuration
 * @returns The webpack configuration for the Image-specific rules
 */
export default (config: Config): Configuration => {
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
         IMGConfig(config),
         CSSConfig(config),
          TSConfig(config),
        HTMLConfig(config),
        WASMConfig(config),
    );
}
