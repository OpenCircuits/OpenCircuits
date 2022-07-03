import webpack from "webpack";

import * as Types from "./types.js";


/**
 * @param {Types.Config} config
 * @returns {webpack.Configuration}
 */
export default (config) => ({
    module: {
        rules: [{
            // Test for: .wasm
            test: /\.(wasm)$/,

            // Do not want to process anything from node_modules
            exclude: /node_modules/,

            use: {
                loader: "emscript-loader",
                options: {},
            },
        }]
    },
});
