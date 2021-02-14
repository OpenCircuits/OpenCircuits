// CHECK OUT https://github.com/cilliemalan/react-from-scratch/blob/step-2/webpack.config.js
// potential, simpler building system

const webpack = require("webpack");
const resolve = require("resolve");
const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const ForkTsCheckerWebpackPlugin = require("react-dev-utils/ForkTsCheckerWebpackPlugin");
const WatchMissingNodeModulesPlugin = require("react-dev-utils/WatchMissingNodeModulesPlugin");
const typescriptFormatter = require("react-dev-utils/typescriptFormatter");

const getAliases = require("./utils/getAliases");






class WatchTSConfigPathsPlugin {
    constructor(path) {
      this.path = path;
    }

    apply(compiler) {
      compiler.hooks.emit.tap('WatchTSConfigPathsPlugin', compilation => {
        var missingDeps = Array.from(compilation.missingDependencies);
        var path = this.path;

        // If any missing files are expected to appear in node_modules...
        if (missingDeps.some(file => file.includes(path))) {
          // ...tell webpack to watch node_modules recursively until they appear.
          compilation.contextDependencies.add(path);
        }
      });
    }
  }

  module.exports = WatchMissingNodeModulesPlugin;



module.exports = function(config) {
    const isProduction  = config.mode == "production";
    const isDevelopment = !isProduction;

    return {
        mode: config.mode,

        // Stop compilation early in production
        bail: isProduction,

        devtool: isProduction ? (config.shouldUseSourceMap && "source-map") : "cheap-module-source-map",

        entry: [
            // This will display syntax errors in the browser
            isDevelopment && require.resolve("react-dev-utils/webpackHotDevClient"),

            // Actual entry point
            config.entryPath
        ].filter(Boolean),

        output: {
            // Build folder (only for production)
            path: isProduction ? config.outputPath : undefined,

            // One main bundle and one file per chunk, no real files in development
            filename: isProduction ? "static/js/[name].[contenthash:8].js" :
                                     `static/js/${config.bundleName}`,

            // Used to determine where the app is being served from
            //  *Requires trailing slash
            publicPath: "/"
        },

        resolve: {
            alias: getAliases(),
            extensions: [".ts", ".js", ".tsx", ".jsx", ".json"]
        },

        module: {
            rules: [
                // // First run linter:
                // config.lint && {
                //     test: /\.(js|jsx|ts|tsx)$/,
                //     enforce: "pre",
                //     use: [{
                //         options: {
                //             cache: true,
                //             formatter: require.resolve("react-dev-utils/eslintFormatter"),
                //             eslintPath: require.resolve("eslint"),
                //         },
                //         loader: require.resolve("eslint-loader")
                //     }]
                // },
                {
                    oneOf: [
                        { // Images (GIF/JPEG/PNG)
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve("url-loader"),
                            options: {
                                name: "static/img/[name].[hash:8].[ext]"
                            }
                        },
                        { // JS + TypeScript
                            test: /\.(js|jsx|ts|tsx)$/,
                            loader: require.resolve("babel-loader"),
                            options: {
                                presets: [
                                    [
                                        require.resolve("babel-preset-react-app"),
                                        {
                                            runtime: "automatic"
                                        }
                                    ]
                                ],

                                customize: require.resolve("babel-preset-react-app/webpack-overrides"),

                                // Load SVGs as components
                                plugins: [
                                    [
                                        require.resolve("babel-plugin-named-asset-import"),
                                        {
                                            loaderMap: {
                                                svg: { ReactComponent: "@svgr/webpack?-svgo,+titleProp,+ref![path]" }
                                            }
                                        }
                                    ]
                                ],

                                // Allow caching for faster rebuilds
                                cacheDirectory: true,
                                compact: isProduction
                            }
                        },
                        { // Stylings (CSS/SCSS/SASS)
                            test: /\.s?[ac]ss$/i,
                            use: [
                                isDevelopment ?
                                    require.resolve("style-loader") :
                                    MiniCssExtractPlugin.loader,
                                require.resolve("css-loader"),
                                require.resolve("sass-loader")
                            ]
                        },
                        { // "File" loader makes sure assets get served by dev server
                          //  no "test" so it acts as a catch-all if no other loaders fit
                            loader: require.resolve("file-loader"),
                            exclude: [/\.(js|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: "static/media[name].[hash:8].[ext]"
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            // Generate index.html with all assets injected
            new HtmlWebpackPlugin({
                template: path.join(config.publicPath, config.mainHtml),
                // Only minify for production
                minify: isProduction && {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true
                }
            }),

            // Give access to environment variables in index.html
            //  like PUBLIC_URL as %PUBLIC_URL% in index.html
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, { PUBLIC_URL: "" }),

            // Gives context to module-not-found errors
            new ModuleNotFoundPlugin(config.appPath),

            // Provide some environment variables to the JS code
            new webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": JSON.stringify(config.mode)
                }
            }),

            // Necessary for hot updates
            isDevelopment && new webpack.HotModuleReplacementPlugin(),

            // Makes it so you don't have to restart dev server when updating node_modules
            isDevelopment && new WatchMissingNodeModulesPlugin(config.nodeModulesPath),

            isDevelopment && new WatchTSConfigPathsPlugin(config.packageTSConfigPathsPath),

            // Extract css files in production build
            isProduction && new MiniCssExtractPlugin({
                // Use contenthash to ensure unique names even if filenames are same
                filename: "static/css/[name].[contenthash:8].css",
                chunkFilename: "static/css/[id].[contenthash:8].chunk.css"
            }),

            // Allow hot updates in dev build
            isDevelopment && (new webpack.HotModuleReplacementPlugin()),

            new ForkTsCheckerWebpackPlugin({
                typescript: resolve.sync("typescript", { basedir: config.nodeModulesPath }),
                async: isDevelopment,
                useTypescriptIncrementalApi: true,
                checkSyntacticErrors: true,
                tsconfig: config.packageTSConfigPath,
                reportFiles: ['src/**'],
                silent: true,
                formatter: isProduction ? typescriptFormatter : undefined
            })
        ].filter(Boolean), /* Filter out all boolean values from non-included plugins */

        performance: false
    }
}
