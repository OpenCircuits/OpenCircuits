import path from "node:path";
import fs from "node:fs";

/**
 * Gets the file aliases.
 *
 * @param cwd    The directory that contains `tsconfig.json`.
 * @param format The format for the aliases: bundler or jest.
 * @returns      A record of the alias configuration from the TypeScript aliases.
 */
export default function getAliases(cwd = process.cwd(), format: "bundler" | "jest" = "bundler") {
    const file = path.join(cwd, "tsconfig.json");

    const content = fs.readFileSync(file, "utf-8");
    const rawConfig = new Function("return " + content)();

    const aliases: Record<string, string> = {};
    if (rawConfig?.compilerOptions?.paths) {
        const paths = rawConfig.compilerOptions.paths;
        Object.entries(paths).forEach(([n, pArr]) => {
            const p = (pArr as string[])[0];
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
