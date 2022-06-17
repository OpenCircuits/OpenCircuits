module.exports = {
    "extends": [
        "eslint:recommended",
    ],
    "rules": {
        "max-len": ["warn", {
            "code": 120,
            "ignoreUrls": true,
            "ignoreTrailingComments": true,
        }],
        "quotes": ["error", "double"],
        "no-self-compare": "error",
        "default-case-last": "error",
        "eqeqeq": "error",
        "no-else-return": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "sort-imports": ["error", { // sort only within {} of an import statement
            "ignoreCase": true,
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
    },
}