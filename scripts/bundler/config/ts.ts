import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
import { TsCheckerRspackPlugin } from "ts-checker-rspack-plugin";

import getAliases from "../../utils/getAliases.ts";

import type { Config } from "./types.ts";
import type { Configuration } from "@rspack/core";

/**
 * Returns the typescript bundler configuration.
 *
 * @param config         The current configuration.
 * @param config.rootDir The current root directory.
 * @param config.isDev   Whether or not this is running in a development environment.
 * @returns              The bundler configuration for the TypeScript-specific rules.
 */
export default ({ rootDir, isDev }: Config): Configuration => ({
    module: {
        rules: [
            {
                // Test for: .ts, .tsx, .js, .jsx
                test: /\.[jt]sx?$/,

                // Do not want to process anything from node_modules
                exclude: /node_modules/,

                // Process typescript and run the react compiler via Rspack's native SWC loader.
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
                                    reactCompiler: true,
                                },
                            },
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        // Setup hot-module refreshing
        ...(isDev ? [new ReactRefreshPlugin()] : []),

        new TsCheckerRspackPlugin({
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
