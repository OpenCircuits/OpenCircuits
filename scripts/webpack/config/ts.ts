import path from "path";
import webpack from "webpack";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypescript from "react-refresh-typescript";

import getAliases from "../../utils/getAliases.js";

import * as Types from "./types.js";


/**
 * @param {Types.Config} config
 * @returns {webpack.Configuration}
 */
export default (config) => {
    const { rootDir, isDev } = config;

    // Configuration for babel
    const BabelConfig = {
        presets: [
            "@babel/preset-env",
            // runtime: automatic => makes it so you don't have to `import React` in every tsx file
            ["@babel/preset-react", { runtime: "automatic" }],
        ],
        plugins: [
            (isDev && "react-refresh/babel"),
        ].filter(Boolean),
    };

    return {
        module: {
            rules: [{
                // Test for: .ts, .tsx, .js, .jsx
                test: /\.[jt]sx?$/,

                // Do not want to process anything from node_modules
                exclude: /node_modules/,

                // Loads from bottom to top:
                //  So it first goes through the ts-loader to become js
                //  and then goes through babel-loader to transpile it
                //
                //  Babel: the defacto-standard for compiling JS to support older versions with newer syntax
                use: [
                    {
                        loader: "babel-loader",
                        options: BabelConfig,
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            getCustomTransformers: () => ({
                                before: (isDev ? [ReactRefreshTypescript()] : []),
                            }),
                        },
                    },
                ]
            }]
        },

        plugins: [
            // Setup hot-module refreshing
            (isDev && new ReactRefreshWebpackPlugin()),
        ].filter(Boolean),

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"],

            // Retrieve the TypeScript paths
            alias: getAliases(rootDir),
        },
    };
}
