module.exports = {
    "plugins": [
        "unicorn",
    ],
    "extends": [
        "plugin:unicorn/recommended",
    ],
    "rules": {
        "unicorn/catch-error-name": ["error", {"name": "e"}],
        "unicorn/consistent-function-scoping": "off",
        "unicorn/custom-error-definition": "error",
        "unicorn/expiring-todo-comments": "off",
        "unicorn/filename-case": ["error", {
            "cases": {
                "camelCase": true,
                "pascalCase": true,
            },
        }],
        "unicorn/no-array-for-each": "off",
        "unicorn/no-unsafe-regex": "error",
        "unicorn/no-unused-properties": "error",
        "unicorn/no-useless-undefined": ["error", {
            "checkArguments": false,
        }],
        "unicorn/prefer-at": "error",
        "unicorn/prefer-string-replace-all": "error",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/no-array-callback-reference": "off",
    },
}