const deepMerge = require("deepmerge");

module.exports = deepMerge.all([{
        "extends": ["plugin:diff/diff"],
    },
    require("./.eslintrc.cjs"),
]);
