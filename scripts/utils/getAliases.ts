import path from "path";
import ts from "typescript";


/**
 *
 * @param {string?} cwd
 * @param {"webpack" | "jest"} format
 * @returns
 */
export default function getAliases(cwd = process.cwd(), format = "webpack") {
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
            if (format === "webpack") {
                const name = n.replace("/*", "");
                const url = path.resolve(cwd, p.replace("/*", ""));
                aliases[name] = url;
            } else {
                const name = n.replace("/*", "/(.*)$");
                const url = p.replace("./", "<rootDir>/").replace("/*", "/$1");
                aliases[name] = url;
            }
        });
    }

    return aliases;
}
