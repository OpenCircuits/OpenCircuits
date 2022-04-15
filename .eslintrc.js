const core      = require("./linting/.core.js");
const imports   = require("./linting/.imports.js");
const jsdoc     = require("./linting/.jsdoc.js");
const react     = require("./linting/.react.js");
const jestRules = require("./linting/.jestRules.js");
const custom    = require("./linting/.custom.js");
const unicorn   = require("./linting/.unicorn.js");
const sonarjs   = require("./linting/.sonarjs.js");
const jsxa11y   = require("./linting/.jsxa11y.js");


/**
 * Performs a recursive merge of the two provided objects
 * 
 * @param {object} object1 The first object to merge
 * @param {object} object2 The second object to merge
 * @returns {object} The merged objects
 */
function merge(object1, object2) {
    const newObject = {};
    for (const property in object1) {
        if (!(property in object2)) {
            newObject[property] = object1[property];
            continue;
        }

        const value1 = object1[property];
        const value2 = object2[property];
        if (Array.isArray(value1)) {
            if (!Array.isArray(value2)) {
                console.error(`Property ${property} of object1 is an array, but is not for object2`);
                throw new Error(`Not both arrays:\nvalue1: ${value1}\nvalue2: ${value2}`);
            }
            newObject[property] = value1.concat(value2);
        }
        else if(typeof value1 === 'object' && typeof value2 === 'object' && value1 && value2) {
            newObject[property] = merge(value1, value2);
        }
        else {
            console.error("Supplied objects are not objects");
            throw new Error(`Parameters are not objects:\nobject1: ${object1}\nobject2: ${object2}`);
        }
    }

    for (const property in object2) {
        if (!(property in object1))
            newObject[property] = object2[property];
    }

    return newObject;
}

/**
 * Merges all of the provided objects into a single object
 * 
 * @param {object[]} objects The objects to merge
 * @returns {object} The merged object
 */
function mergeAll(objects) {
    let ret = {};
    objects.forEach(object => {
        ret = merge(ret, object);
    });
    return ret;
}

ruleSets = [
    core,
    imports,
    jsdoc,
    react,
    jestRules,
    custom,
    unicorn,
    sonarjs,
    jsxa11y,
]
module.exports = mergeAll(ruleSets);
