import {existsSync} from "fs";
import path from "path";

import dotEnv from "dotenv";
import dotEnvExpand from "dotenv-expand";


/**
 * @param {string} dir
 * @param {string} publicRoot
 * @returns {Object}
 */
export default function getEnv(dir, publicRoot) {
    const NODE_ENV = process.env.NODE_ENV || "development";
    const dotenv = path.resolve(dir, ".env");

    // Load dotenv files
    [
        `${dotenv}.${NODE_ENV}.local`,
        `${dotenv}.${NODE_ENV}`,
        `${dotenv}`,
    ].filter(existsSync)
     .map(path => ({ path }))
     .forEach(cfg => dotEnvExpand.expand(dotEnv.config(cfg)));

    return Object.keys(process.env)
                 .filter(k => k.startsWith("OC"))
                 .reduce(
                     (env, key) => ({...env, [key]: process.env[key]}),
                     {
                         NODE_ENV, PUBLIC_URL: publicRoot.slice(0, -1),
                     }
                 );
}
