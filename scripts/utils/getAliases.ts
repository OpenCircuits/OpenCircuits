import path from "node:path";

import ts from "typescript";

/**
 * Gets the file aliases.
 *
 * @param cwd    The directory that contains `tsconfig.json`.
 * @param format The format for the aliases: bundler or jest.
 * @returns      A record of the alias configuration from the TypeScript aliases.
 */
export default function getAliases(cwd = process.cwd(), format: "bundler" | "jest" = "bundler") {
    const file = path.join(cwd, "tsconfig.json");

    const rawConfig = ts.readConfigFile(file, ts.sys.readFile).config;
    const config = ts.parseJsonConfigFileContent(rawConfig, ts.sys, cwd);

    const aliases: Record<string, string> = {};
    if (config.options.paths) {
        const paths = config.options.paths;
        Object.entries(paths).forEach(([n, [p]]) => {
            if (format === "bundler") {
                const name = n.replace("/*", "");
                const url = path.resolve(cwd, p.replace("/*", ""));
                aliases[name] = url;
            } else {
                const name = "^" + n.replace("/*", "/(.*)$");
                const url = p
                    .replace(/^\.\.\//, "<rootDir>/../")
                    .replace(/^\.\//, "<rootDir>/")
                    .replace("/*", "/$1");
                aliases[name] = url;
            }
        });
    }

    return aliases;
}
