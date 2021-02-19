const { removeModuleScopePlugin, override, babelInclude, addWebpackAlias } = require("customize-cra");
const path = require("path");
const ts = require("typescript");


function getAliases(cwd = process.cwd()) {
    const file = path.join(cwd, "tsconfig.json");

    const rawConfig = ts.readConfigFile(file, ts.sys.readFile).config;
    const config = ts.parseJsonConfigFileContent(
        rawConfig,
        ts.sys,
        cwd
    );

    let aliases = {};
    if (config.options.paths) {
        const paths = config.options.paths;
        Object.entries(paths).forEach(([n, [p]]) => {
            const name = n.replace("/*", "");
            const url = path.resolve(cwd, p.replace("/*", ""));
            aliases[name] = url;
        });
    }

    return aliases;
}


module.exports = {
    paths: (paths, env) => {
        paths.appPublic = path.resolve(__dirname, "src/site/pages/digital/public");
        paths.appIndexJs = path.resolve(__dirname, "src/site/pages/digital/index.tsx");
        paths.appHtml = path.resolve(__dirname, "src/site/pages/digital/public/index.html");
        paths.appSrc = path.resolve(__dirname, "src/site/pages/digital");
        return paths;
    },
    webpack: override(
        removeModuleScopePlugin(),        // (1)
        babelInclude([
            path.resolve("src/app"),
            path.resolve("src/site/pages/digital"),
            path.resolve("src/site/shared"),  // (2)
        ]),
        addWebpackAlias(getAliases())
    ),
}
