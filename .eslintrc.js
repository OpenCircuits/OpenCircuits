module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jest": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "ignorePatterns": ["*.js", "scripts/**", "src/app/tests/**"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.base.json"
    },
    "plugins": ["@typescript-eslint", "opencircuits"],
    "rules": {
        "max-len": ["warn", {
            "code": 120,
            "ignoreUrls": true,
            "ignoreTrailingComments": true,
        }],
        "quotes": ["error", "double"],
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": ["error", { "default": "array-simple" }],
        "@typescript-eslint/ban-types": ["error", {
            "types": {
                "null": {
                    "message": "Use undefined instead",
                    "fixWith": "undefined",
                },
            },
            "extendDefaults": true,
        }],
        "camelcase": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-function-return-type": ["off"],
        "no-console": ["error", { "allow": ["warn", "error"] }],
        "@typescript-eslint/explicit-member-accessibility": "error",

        // Apparently broken, see https://github.com/typescript-eslint/typescript-eslint/issues/1824
        "indent": "off",
        "@typescript-eslint/indent": ["off", 4, {
            "ImportDeclaration": "first",
            "ArrayExpression": "first",
            "MemberExpression": 2,
            "FunctionDeclaration": { "parameters": "first" },
            "FunctionExpression": { "parameters": "first" },
            "CallExpression": { "arguments": "first" },
            "ignoredNodes": ["ConditionalExpression"]
        }],

        "@typescript-eslint/member-delimiter-style": ["error", {
            "multiline": {
                "delimiter": "semi",
                "requireLast": true
            },
            "singleline": {
                "delimiter": "comma",
                "requireLast": false
            }
        }],
        "prefer-const": "error",
        "comma-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
        "@typescript-eslint/no-angle-bracket-type-assertion": "off",
        "no-array-constructor": "off",
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/no-parameter-properties": "error",
        "@typescript-eslint/triple-slash-reference": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "_",
            "args": "after-used",
            "ignoreRestSiblings": false
        }],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["off"],
        "@typescript-eslint/no-var-requires": "error",
        //"@typescript-eslint/prefer-interface": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/type-annotation-spacing": ["error", {
            "before": false,
            "after": true,
            "overrides": {
                "arrow": {
                    "before": true,
                    "after": true
                }
            }
        }],
        "object-curly-spacing": ["off"],
        "opencircuits/object-curly-spacing": ["error", "always"]
    }
}
