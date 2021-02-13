const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const webpack = require("webpack");

const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const printBuildError = require("react-dev-utils/printBuildError");
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');

const getConfig = require("./config");

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

function build(config) {
    console.log('Creating an optimized production build...');

    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            let messages;
            if (err) {
                if (!err.message)
                    reject(err);

                messages = formatWebpackMessages({
                    errors: [err.message],
                    warnings: []
                });
            } else {
                const json = stats.toJson({ all: false, warnings: true, errors: true });
                messages = formatWebpackMessages({
                    errors: json.errors.map((err) => err.message),
                    warnings: json.warnings.map((warn) => warn.message)
                });
            }

            const {errors, warnings} = messages;

            if (errors.length) {
                // Only keep first error
                if (errors.length > 1)
                    errors.length = 1;
                reject(new Error(errors.join("\n\n")));
            }

            return resolve({stats, warnings});
        });
    })
}

module.exports = async function prodBuild(args) {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = "production";
    process.env.NODE_ENV = "production";

    const config = getConfig("production");
    const webpackConfig = require("./webpack.config.js")(config);

    // First, read current file sizes to see how much they changed later
    const previousFileSizes = await measureFileSizesBeforeBuild(config.outputPath);

    // Then empty out the build directory
    await fs.emptyDir(config.outputPath);

    // Then copy over the `public` folder (excluding index.html)
    await fs.copy(config.publicPath, config.outputPath, {
        dereference: true,
        filter: file => !file.endsWith("index.html")
    });

    // Now, build the project
    try {
        const {stats, warnings} = await build(webpackConfig);

        if (warnings.length) {
            console.log([
                chalk`{yellow Compiled with warnings.} \n\n`,
                chalk`${warnings.join("\n\n")} \n\n`,
                chalk`Search for the {underline.yellow keywords} to learn more about each warning. \n`,
                chalk`To ignore, add {cyan // eslint-disable-next-line} to the line before. \n\n`
            ].join(""));
        } else {
            console.log(chalk`{green Compiled successfully!}\n`);

            console.log("File sizes after gzip:\n");
            printFileSizesAfterBuild(stats, previousFileSizes, config.outputPath);
            console.log();
        }

    } catch (err) {
        console.log(chalk.red('Failed to compile.\n'));
        printBuildError(err);
        process.exit(1);
    }
}