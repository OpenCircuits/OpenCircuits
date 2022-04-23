const mergeDeep = require("./scripts/utils/merge");

module.exports = mergeDeep({
        "root": true,
        "env": {
            "browser": true,
            "es6": true,
        },
        "ignorePatterns": ["*.js", "scripts/**", "*.d.ts"],
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "project": "./tsconfig.base.json",
            "ecmaFeatures": {
                "jsx": true,
            },
        },
    },
    require("./linting/.core.js"),
    require("./linting/.ts.js"),
    require("./linting/.imports.js"),
    require("./linting/.jsdoc.js"),
    require("./linting/.react.js"),
    require("./linting/.jestRules.js"),
    require("./linting/.custom.js"),
    require("./linting/.unicorn.js"),
    require("./linting/.sonarjs.js"),
    require("./linting/.jsxa11y.js"),
);
