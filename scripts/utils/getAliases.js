const ts = require("typescript");
const path = require("path");

module.exports = function getAliases(cwd = process.cwd()) {
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