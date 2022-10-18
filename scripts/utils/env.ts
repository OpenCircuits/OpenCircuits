import {existsSync} from "node:fs";
import path         from "node:path";

import dotEnv       from "dotenv";
import dotEnvExpand from "dotenv-expand";


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
                     }
                 );
}
