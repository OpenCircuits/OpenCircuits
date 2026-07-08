import path from "node:path";

import { rspack } from "@rspack/core";

import type { Config } from "./types";
import type { Configuration } from "@rspack/core";

/**
 * Creates the bundler configuration for HTML.
 *
 * @param config            The current configuration.
 * @param config.env        The current environment.
 * @param config.publicPath The public path leading to index.html.
 * @returns                 The bundler configuration for the HTML-specific rules.
 */
export default ({ env, publicPath }: Config): Configuration => ({
    plugins: [
        new rspack.HtmlRspackPlugin({
            template: path.resolve(publicPath, "index.html"),
            templateParameters: env,
        }),
    ],
});
