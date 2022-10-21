import type {Config}        from "./types";
import type {Configuration} from "webpack";


/**
 * Creates the webpack configuration for Images.
 *
 * @param config The current configuration.
 * @returns      The webpack configuration for the Image-specific rules.
 */
export default ({ }: Config): Configuration => ({
    output: {
        assetModuleFilename: "images/[hash][ext][query]", // extract assets (images and such) to and images folder in the output
    },

    module: {
        rules: [
            {
                // Test for: .png, .jpg, .jpeg, .gif, and .svg
                test: /\.(png|jpe?g|gif|svg)$/i,

                // Webpack 5 has builtin image loading support that auto inlines based off of image size
                type: "asset",
                // type: "asset/resource", // this extracts all images as separate files
                // type: "asset/inline", // this inlines all images

                // parser: {
                //     dataUrlCondition: {
                //         maxSize: 30 * 1024, // Set inline-size to 30kb (30 * 1024 bytes)
                //     }
                // }
            },
        ],
    },
});
