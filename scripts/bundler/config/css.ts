

import type { Config } from "./types";
import type { Configuration } from "@rspack/core";

/**
 * Creates the bundler configuration for CSS.
 *
 * @param config            The current configuration.
 * @param config.isProd     Indicates whether or not this config is for prod.
 * @param config.publicPath The public path.
 * @returns                 The bundler configuration for the CSS-specific rules.
 */
export default ({ isProd, publicPath }: Config): Configuration => ({
    module: {
        rules: [
            {
                // Test for: .sass, .scss, or .css
                test: /\.(s[ac]|c)ss$/i,

                // Use Rspack's native CSS integration (extracts css without plugin)
                type: "css/auto",

                // Reads right to left
                use: [
                    "sass-loader",
                ],
            },
        ],
    },

    plugins: [],
});
