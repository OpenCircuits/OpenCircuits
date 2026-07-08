import ReactRefreshWebpackPlugin from "@rspack/plugin-react-refresh";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

import getAliases from "../../utils/getAliases.ts";

import type { Config } from "./types.ts";
import type { Configuration } from "@rspack/core";

/**
 * Returns the typescript webpack configuration.
 *
 * @param config         The current configuration.
 * @param config.rootDir The current root directory.
 * @param config.isDev   Whether or not this is running in a development environment.
 * @returns              The webpack configuration for the TypeScript-specific rules.
 */
export default ({ rootDir, isDev }: Config): Configuration => ({
    module: {
        rules: [
            {
                // Test for: .ts, .tsx, .js, .jsx
                test: /\.[jt]sx?$/,

                // Do not want to process anything from node_modules
                exclude: /node_modules/,

                // Loads from bottom to top:
                //  So it first goes through the ts-loader to become js
                //  and then goes through the react compiler.
                use: [
                    {
                        loader: "builtin:swc-loader",
                        options: {
                            jsc: {
                                parser: {
                                    syntax: "typescript",
                                    tsx: true,
                                },
                                transform: {
                                    react: {
                                        runtime: "automatic",
                                        development: isDev,
                                        refresh: isDev,
                                    },
                                },
                            },
                        },
                    },
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-typescript"],
                            plugins: ["babel-plugin-react-compiler"],
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        // Setup hot-module refreshing
        ...(isDev ? [new ReactRefreshWebpackPlugin()] : []),

        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                configFile: `${rootDir}/tsconfig.json`,
            },
        }),
    ],

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],

        // Retrieve the TypeScript paths
        alias: getAliases(rootDir),
    },
});
