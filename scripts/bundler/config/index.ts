import { rspack } from "@rspack/core";

import mergeDeep from "../../utils/merge.ts";

import CSSConfig from "./css.ts";
import HTMLConfig from "./html.ts";
import IMGConfig from "./img.ts";
import TSConfig from "./ts.ts";
import WASMConfig from "./wasm.ts";

import type { Config } from "./types";
import type { Configuration } from "@rspack/core";

/**
 * Creates the bundler configuration.
 *
 * @param config The current configuration.
 * @returns      The bundler configuration.
 */
export default (config: Config): Configuration => {
    const { entry, isDev, isProd, mode, target, buildDir, stats, env } = config;

    return mergeDeep(
        {
            mode,
            target,
            entry,
            stats,

            output: {
                path: buildDir,
                publicPath: "/",

                // Extract the JS to /static/js/
                filename: isProd ? "static/js/[name].[contenthash:8].js" : undefined,
                chunkFilename: isProd ? "static/js/[name].[contenthash:8].chunk.js" : undefined,
                
                // Extract the CSS to /static/css/
                cssFilename: isProd ? "static/css/[name].[contenthash:8].css" : undefined,
                cssChunkFilename: isProd ? "static/css/[name].[contenthash:8].chunk.css" : undefined,
            },

            plugins: [
                // Stringify environment variables
                new rspack.DefinePlugin({
                    "process.env": Object.fromEntries(
                        Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)]),
                    ),
                }),
            ],

            infrastructureLogging: {
                level: "error",
            },

            devtool: isDev ? "inline-source-map" : undefined,
        },
        IMGConfig(config),
        CSSConfig(config),
        TSConfig(config),
        HTMLConfig(config),
        WASMConfig(config),
    );
};
