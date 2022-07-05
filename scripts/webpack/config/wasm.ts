import type {Config}        from "./types.js";
import type {Configuration} from "webpack";


/**
 * Returns the wasm webpack configuration.
 *
 * @param config The current configuration.
 * @returns        The webpack configuration for the WASM-specific rules.
 */
export default ({ }: Config): Configuration => ({
    module: {
        rules: [{
            // Test for: .wasm
            test: /\.(wasm)$/,

            // Do not want to process anything from node_modules
            exclude: /node_modules/,

            use: {
                loader:  "emscript-loader",
                options: {},
            },
        }],
    },
});
