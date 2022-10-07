module.exports = {
    "env": {
        "jest": true,
        "jest/globals": true,
    },
    "overrides": [
        {
            "files": ["**.test.ts?(x)"],
            "rules": {
                "jest/unbound-method": "error", // Typescript version disabled in .ts.js
            }
        },
    ],
    "plugins": [
        "jest",
        "jest-formatting",
    ],
    "extends": [
        "plugin:jest/recommended",
        "plugin:jest/style",
        "plugin:jest-formatting/recommended",
    ],
    "rules": {
        "jest/prefer-comparison-matcher": "error",
        "jest/prefer-equality-matcher": "error",
        "jest/expect-expect": ["warn", {
            "assertFunctionNames": ["expect**"],
        }],
        "jest/prefer-expect-resolves": "error",
        "jest/prefer-hooks-on-top": "error",
        "jest/prefer-strict-equal": "off",
        // Disabled jest/valid-title because it is not type aware
        "jest/valid-title": "off",

        "jest-formatting/padding-around-test-blocks": "off",
    },
}
