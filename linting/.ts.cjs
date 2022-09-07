module.exports = {
    "extends": [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "plugins": [
        "@typescript-eslint",
    ],
    "overrides": [
        {
            "files": ["**.test.ts?(x)"],
            "rules": {
                "@typescript-eslint/unbound-method": "off", // Jest has its own version
            }
        },
    ],
    "rules": {
        "@typescript-eslint/adjacent-overload-signatures": "off",
        "@typescript-eslint/array-type": ["error", {"default": "array-simple"}],
        "@typescript-eslint/ban-types": ["error", {
            "types": {
                "null": {
                    "message": "Use undefined instead",
                    "fixWith": "undefined",
                },
            },
            "extendDefaults": true,
        }],
        "@typescript-eslint/explicit-function-return-type": ["off"],
        "@typescript-eslint/explicit-member-accessibility": "error",

        // Apparently broken, see https://github.com/typescript-eslint/typescript-eslint/issues/1824
        // TODO: Can some parts of this be enabled?
        "indent": "off",
        "@typescript-eslint/indent": ["off", 4, {
            "ImportDeclaration": "first",
            "ArrayExpression": "first",
            "MemberExpression": 2,
            "FunctionDeclaration": {"parameters": "first"},
            "FunctionExpression": {"parameters": "first"},
            "CallExpression": {"arguments": "first"},
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
        "@typescript-eslint/comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "ignore",
            "enums": "always-multiline",
            "generics": "ignore",
            "tuples": "always-multiline",
        }],
        "@typescript-eslint/no-angle-bracket-type-assertion": "off",
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/no-parameter-properties": "error",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "_",
            "varsIgnorePattern": "_",
            "caughtErrorsIgnorePattern": "_",
            "args": "after-used",
            "ignoreRestSiblings": false,
        }],
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
        // TODO: Finalize this
        "@typescript-eslint/naming-convention": [
            "error",
            { // General default, only camelCase with no leading/trailing underscores
                "selector": "default",
                "format": ["camelCase"],
            },
            { // class, interface, typeAlias, enum, typeParameter are Pascalcase by default, no leading underscore
                "selector": "typeLike",
                "format": ["PascalCase"],
            },
            { // parameters and variables can be camelCase or PascalCase with a leading underscore
                "selector": ["parameter", "variable"],
                "format": ["camelCase", "PascalCase"],
                "leadingUnderscore": "allow",
            },
            { // const non-exported variables can be camelCase, PascalCase, or UPPER_CASE with a leading underscore
                "selector": "variable",
                "modifiers": ["const"],
                "format": ["camelCase", "PascalCase", "UPPER_CASE"],
                "leadingUnderscore": "allow",
            },
            { // const exported non-function variables can only be UPPER_CASE, no leading underscore allowed
                "selector": "variable",
                "modifiers": ["exported", "const"],
                "types": ["boolean", "string", "number", "array"],
                "format": ["UPPER_CASE"],
            },
            { // object literal methods can be camelCase, PascalCase, or UPPER_CASE with a leading underscore
                "selector": "objectLiteralMethod",
                "format": ["camelCase", "PascalCase", "UPPER_CASE"],
                "leadingUnderscore": "allow",
            },
            { // functions, typeProperties, and object literal properties can be camelCase or PascalCase, no leading underscore allowed
                "selector": ["typeProperty", "objectLiteralProperty"],
                "format": ["camelCase", "PascalCase"],
                // TODO: see if "format": ["camelCase"], is reasonable
            },
            { // functions, typeProperties, and object literal properties can be camelCase or PascalCase, no leading underscore allowed
                "selector": ["function"],
                "format": ["camelCase", "PascalCase"],
                // TODO: see if "format": ["PascalCase"], is reasonable
            },
            { // enum members must be PascalCase, no leading underscore
                "selector": "enumMember",
                "format": ["PascalCase"],
            },
            { // static class properties must be UPPER_CASE, no leading underscore
                "selector": "classProperty",
                "modifiers": ["static"],
                "format": ["UPPER_CASE"],
            },
            { // static class methods can be camelCase or PascalCase, no leading underscore
                "selector": "classMethod",
                "modifiers": ["static"],
                "format": ["PascalCase"],
            },
            {
                "selector": [
                    "classProperty",
                    "objectLiteralProperty",
                    "typeProperty",
                    "classMethod",
                    "objectLiteralMethod",
                    "typeMethod",
                    "accessor",
                    "enumMember"
                ],
                "format": null,
                "modifiers": ["requiresQuotes"]
            },

            // Act as ignores for client_id and no_auth keys
            {
                "selector": "objectLiteralProperty",
                "format": null,
                "filter": {
                    "regex": "^(client_id)$",
                    "match": true,
                }
            },
            {
                "selector": "objectLiteralMethod",
                "format": null,
                "filter": {
                    "regex": "^(no_auth)$",
                    "match": true,
                }
            },
        ],

        "@typescript-eslint/keyword-spacing": ["error"],
        "@typescript-eslint/space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always",
        }],

        "@typescript-eslint/prefer-readonly": "error",
    },
}
