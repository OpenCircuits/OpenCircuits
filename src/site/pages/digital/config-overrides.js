const { removeModuleScopePlugin, override, babelInclude, addWebpackAlias } = require("customize-cra");
const path = require("path");
const ts = require("typescript");


function getAliases() {
    const root = "../../../..";
    const file = path.resolve(__dirname, "tsconfig.json");

    const rawConfig = ts.readConfigFile(file, ts.sys.readFile).config;
    const config = ts.parseJsonConfigFileContent(
        rawConfig,
        ts.sys,
        "."
    );

    let aliases = {};
    if (config.options.paths) {
        const paths = config.options.paths;
        Object.entries(paths).forEach(([n, [p]]) => {
            const name = n.replace("/*", "");
            const url = path.resolve(__dirname, root, p.replace("/*", ""));
            aliases[name] = url;
        });
    }

    return aliases;
}

module.exports = {
    paths: (paths, env) => {
        paths.appTsConfig = path.resolve(__dirname, "tsconfig.json");
        return paths;
    },
    webpack: override(
        removeModuleScopePlugin(),
        babelInclude([
            path.resolve(__dirname, "../../../app"),
            path.resolve(__dirname, "../../shared"),
            path.resolve(__dirname, "src")
        ]),
        addWebpackAlias(getAliases())
    )
}
