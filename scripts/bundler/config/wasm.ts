import type { Config } from "./types.ts";
import type { Configuration } from "@rspack/core";

/**
 * Returns the wasm bundler configuration.
 *
 * @param config The current configuration.
 * @returns      The bundler configuration for the WASM-specific rules.
 */
export default ({}: Config): Configuration => ({
    module: {
        rules: [
            {
                // Test for: .wasm
                test: /\.(wasm)$/,

                // Do not want to process anything from node_modules
                exclude: /node_modules/,
                type: "javascript/auto",

                use: {
                    loader: "emscript-loader",
                    options: {},
                },
            },
        ],
    },
});
