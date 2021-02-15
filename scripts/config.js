const path = require("path");
// const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

const defaultNames = {
    entry: "src/site/pages/digital/",
    public: "src/site/pages/digital/public",
    output: "build/site",
    mainHtml: "index.html",
    bundleName: "bundle.js"
};

module.exports = function getConfig(mode, names) {
    names = {...defaultNames, ...names};

    const cwd = process.cwd();

    // const publicUrlOrPath = getPublicUrlOrPath(
    //     mode == "development",
    //     names.public
    // )

    return {
        mode,
        ...names,
        appPath: cwd,
        nodeModulesPath: path.join(cwd, "node_modules"),
        entryPath: path.join(cwd, names.entry),
        publicPath: path.join(cwd, names.public),
        outputPath: path.join(cwd, names.output),
        packageJsonPath: path.join(cwd, "package.json"),
        packageTSConfigPath: path.join(cwd, "tsconfig.json"),
        packageTSConfigPathsPath: path.join(cwd, "tsconfig.paths.json"),
        lint: false,
        shouldUseSourceMap: false
    };
}
