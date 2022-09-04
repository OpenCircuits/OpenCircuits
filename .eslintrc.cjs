const deepMerge = require("deepmerge");

module.exports = deepMerge.all([{
        "root": true,
        "env": {
            "browser": true,
            "es6": true,
        },
        "ignorePatterns": ["*.js", "*.cjs", "*.d.ts"],
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "tsconfigRootDir": __dirname,
            "project": "./tsconfig.base.json",
            "ecmaFeatures": {
                "jsx": true,
            },
        },
    },
    require("./linting/.core.cjs"),
    require("./linting/.ts.cjs"),
    require("./linting/.imports.cjs"),
    require("./linting/.jsdoc.cjs"),
    require("./linting/.react.cjs"),
    require("./linting/.jestRules.cjs"),
    require("./linting/.custom.cjs"),
    require("./linting/.unicorn.cjs"),
    require("./linting/.sonarjs.cjs"),
    require("./linting/.jsxa11y.cjs"),
    require("./linting/.deprecation.cjs"),
]);
