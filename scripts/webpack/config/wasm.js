const webpack = require("webpack");
const {Config} = require("./types");


/**
 * @param {Config} config
 * @returns {webpack.Configuration}
 */
module.exports = (config) => ({
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
