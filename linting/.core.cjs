module.exports = {
    "extends": [
        "eslint:recommended",
    ],
    "overrides": [
        {
            "files": ["scripts/**"],
            "rules": {
                "no-console": "off", // Console logging actually has a purpose
            }
        },
    ],
    "rules": {
        "max-len": ["warn", {
            "code": 120,
            "ignoreUrls": true,
            "ignoreTrailingComments": true,
            "ignorePattern": "^import .*",
        }],
        "quotes": ["error", "double"],
        "no-self-compare": "error",
        "default-case-last": "error",
        "eqeqeq": "error",
        "no-else-return": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "sort-imports": ["error", { // sort only within {} of an import statement
            "ignoreCase": false,
            "ignoreDeclarationSort": true,
        }],
        "spaced-comment": "error",
        "key-spacing": ["error", {"align": "value"}],
        "no-tabs": "error",
        "no-trailing-spaces": "error",
        "camelcase": "off",
        "no-console": ["error", {"allow": ["warn", "error"]}],

        // Apparently broken, see https://github.com/typescript-eslint/typescript-eslint/issues/1824
        "indent": "off",

        "prefer-const": "error",
        "comma-dangle": "off",
        "no-array-constructor": "off",
        "no-unused-vars": "off",
        "no-use-before-define": "off",
        "object-curly-spacing": ["off"],

        "no-case-declarations": "off",
        "no-empty-pattern": "off",

        "nonblock-statement-body-position": ["error", "below", {
            "overrides": { "while": "any" },
        }],

        "keyword-spacing": "off", // typescript eslint equivalent
        "space-before-function-paren": "off", // typescript eslint equivalent
        "space-in-parens": "error",
        "arrow-parens": "error",
        "arrow-body-style": "error",
        "arrow-spacing": "error",
        "eol-last": "error",
    },
}
