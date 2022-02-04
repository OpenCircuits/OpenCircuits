const {existsSync} = require("fs");
const path = require("path");


/**
 * @param {string} dir
 * @param {string} publicRoot
 * @returns {Object}
 */
module.exports = function getEnv(dir, publicRoot) {
    const NODE_ENV = process.env.NODE_ENV || "development";
    const dotenv = path.resolve(dir, ".env");

    // Load dotenv files
    [
        `${dotenv}.${NODE_ENV}.local`,
        `${dotenv}.${NODE_ENV}`,
        `${dotenv}`,
    ].filter(existsSync)
     .map(path => ({ path }))
     .forEach(cfg => require("dotenv-expand")(require("dotenv").config(cfg)));

    return Object.keys(process.env)
                 .filter(k => k.startsWith("OC"))
                 .reduce(
                     (env, key) => ({...env, [key]: process.env[key]}),
                     {
                         NODE_ENV, PUBLIC_URL: publicRoot.slice(0, -1),
                     }
                 );
}
