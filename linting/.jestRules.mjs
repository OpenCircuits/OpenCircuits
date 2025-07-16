import pluginJest from "eslint-plugin-jest";
import tseslint from "typescript-eslint";


export default tseslint.config([
    pluginJest.configs["flat/recommended"],
    pluginJest.configs["flat/style"],
    {
        "files": ["**.test.ts?(x)"],
        "plugins": {"jest": pluginJest},
        "languageOptions": {
            "globals": pluginJest.environments.globals.globals,
        },
        "rules": {
            "jest/no-commented-out-tests": "off",
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

            "jest/unbound-method": "error", // Typescript version disabled in .ts.js

            // Previously part of jest-formatting recommended, now brought over to jest, see https://github.com/jest-community/eslint-plugin-jest/pull/1563
            'jest/padding-around-after-all-blocks': "error",
            'jest/padding-around-after-each-blocks': "error",
            'jest/padding-around-before-all-blocks': "error",
            'jest/padding-around-before-each-blocks': "error",
            'jest/padding-around-describe-blocks': "error",
        },
    },
]);
