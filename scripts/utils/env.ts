import {existsSync, readFileSync} from "node:fs";
import path         from "node:path";
import childProcess from "node:child_process";

import dotEnv       from "dotenv";
import dotEnvExpand from "dotenv-expand";


function getGitCommit() {
    return childProcess.execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
}

function getVersion(dir: string) {
    const pkgPath = path.join(dir, "package.json");
    if (!existsSync(pkgPath))
        throw new Error(`No package.json found at ${pkgPath}`);
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (!pkg.version)
        throw new Error(`No version found in ${pkgPath}`);
    return "v" + pkg.version;
}

/**
 * Gets the current environment.
 *
 * @param dir        The directory of the environment variable file.
 * @param publicRoot Public root path to be included as a default environment variable.
 * @returns          Record of environment variables.
 */
export default function getEnv(dir: string, publicRoot: string) {
    const NODE_ENV = process.env.NODE_ENV || "development";
    const dotenv = path.resolve(dir, ".env");

    // Load dotenv files
    [
        `${dotenv}.${NODE_ENV}.local`,
        `${dotenv}.${NODE_ENV}`,
        `${dotenv}`,
    ].filter(existsSync)
     .map((path) => ({ path }))
     .forEach((cfg) => dotEnvExpand.expand(dotEnv.config(cfg)));

    return Object.keys(process.env)
                 .filter((k) => k.startsWith("OC"))
                 .reduce(
                     (env, key) => ({ ...env, [key]: process.env[key] }),
                     {
                         // eslint-disable-next-line @typescript-eslint/naming-convention
                         NODE_ENV, PUBLIC_URL: publicRoot.slice(0, -1),
                         OC_GIT_COMMIT: getGitCommit(),
                         OC_VERSION: getVersion(dir),
                     }
                 );
}
