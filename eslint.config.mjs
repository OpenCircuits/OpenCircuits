import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import typescriptParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from 'eslint-plugin-react-hooks';
import pluginJest from "eslint-plugin-jest";

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.eslintRecommended,
    tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    reactCompiler.configs.recommended,
    reactHooks.configs['recommended-latest'],
    pluginJest.configs["flat/recommended"],
    pluginJest.configs["flat/style"],

    { // core rules
        "rules": {
            // "max-len": ["warn", {
            //     "code": 120,
            //     "ignoreUrls": true,
            //     "ignoreTrailingComments": true,
            //     "ignorePattern": "^import .*",
            // }],
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
                "overrides": {"while": "any"},
            }],

            "keyword-spacing": "off", // typescript eslint equivalent
            "space-before-function-paren": "off", // typescript eslint equivalent
            "space-in-parens": "error",
            "arrow-parens": "error",
            "arrow-body-style": "error",
            "arrow-spacing": "error",
            "eol-last": "error",
            "no-multiple-empty-lines": ["error", {
                "max": 2,
                "maxEOF": 0,
                "maxBOF": 0,
            }],
        },
    },
    { // core overrides
        "files": ["scripts/**"],
        "rules": {
            "no-console": "off", // Console logging actually has a purpose
        },
    },
    { // typescript rules
        "rules": {
            "@typescript-eslint/adjacent-overload-signatures": "off",
            "@typescript-eslint/array-type": ["error", {"default": "array-simple"}],
            "@typescript-eslint/no-restricted-types": ["error", {
                "types": {
                    "null": {
                        "message": "Use undefined instead",
                        "fixWith": "undefined",
                    },
                },
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

            // TODO: Move the following group to eslint stylistic plugin or formatter
            // "@typescript-eslint/member-delimiter-style": ["error", {
            //     "multiline": {
            //         "delimiter": "semi",
            //         "requireLast": true
            //     },
            //     "singleline": {
            //         "delimiter": "comma",
            //         "requireLast": false
            //     }
            // }],
            // "@typescript-eslint/comma-dangle": ["error", {
            //     "arrays": "always-multiline",
            //     "objects": "always-multiline",
            //     "imports": "always-multiline",
            //     "exports": "always-multiline",
            //     "functions": "ignore",
            //     "enums": "always-multiline",
            //     "generics": "ignore",
            //     "tuples": "always-multiline",
            // }],
            // "@typescript-eslint/type-annotation-spacing": ["error", {
            //     "before": false,
            //     "after": true,
            //     "overrides": {
            //         "arrow": {
            //             "before": true,
            //             "after": true
            //         }
            //     }
            // }],
            // "@typescript-eslint/keyword-spacing": ["error"],
            // "@typescript-eslint/space-before-function-paren": ["error", {
            //     "anonymous": "never",
            //     "named": "never",
            //     "asyncArrow": "always",
            // }],
            // TODO: Finalize this (or also move to formatter/eslint stylistic)
            // "@typescript-eslint/naming-convention": [
            //     "error",
            //     { // General default, only camelCase with no leading/trailing underscores
            //         "selector": "default",
            //         "format": ["camelCase"],
            //     },
            //     { // class, interface, typeAlias, enum, typeParameter are Pascalcase by default, no leading underscore
            //         "selector": "typeLike",
            //         "format": ["PascalCase"],
            //     },
            //     { // parameters and variables can be camelCase or PascalCase with a leading underscore
            //         "selector": ["parameter", "variable"],
            //         "format": ["camelCase", "PascalCase"],
            //         "leadingUnderscore": "allow",
            //     },
            //     { // const non-exported variables can be camelCase, PascalCase, or UPPER_CASE with a leading underscore
            //         "selector": "variable",
            //         "modifiers": ["const"],
            //         "format": ["camelCase", "PascalCase", "UPPER_CASE"],
            //         "leadingUnderscore": "allow",
            //     },
            //     { // const exported non-function variables can only be UPPER_CASE, no leading underscore allowed
            //         "selector": "variable",
            //         "modifiers": ["exported", "const"],
            //         "types": ["boolean", "string", "number", "array"],
            //         "format": ["UPPER_CASE"],
            //     },
            //     { // object literal methods can be camelCase, PascalCase, or UPPER_CASE with a leading underscore
            //         "selector": "objectLiteralMethod",
            //         "format": ["camelCase", "PascalCase", "UPPER_CASE"],
            //         "leadingUnderscore": "allow",
            //     },
            //     { // functions, typeProperties, and object literal properties can be camelCase or PascalCase, no leading underscore allowed
            //         "selector": ["typeProperty", "objectLiteralProperty"],
            //         "format": ["camelCase", "PascalCase"],
            //         // TODO: see if "format": ["camelCase"], is reasonable
            //     },
            //     { // functions, typeProperties, and object literal properties can be camelCase or PascalCase, no leading underscore allowed
            //         "selector": ["function"],
            //         "format": ["camelCase", "PascalCase"],
            //         // TODO: see if "format": ["PascalCase"], is reasonable
            //     },
            //     { // enum members must be PascalCase, no leading underscore
            //         "selector": "enumMember",
            //         "format": ["PascalCase"],
            //     },
            //     { // static class properties must be UPPER_CASE, no leading underscore
            //         "selector": "classProperty",
            //         "modifiers": ["static"],
            //         "format": ["UPPER_CASE"],
            //     },
            //     { // static class methods can be camelCase or PascalCase, no leading underscore
            //         "selector": "classMethod",
            //         "modifiers": ["static"],
            //         "format": ["PascalCase"],
            //     },
            //     {
            //         "selector": [
            //             "classProperty",
            //             "objectLiteralProperty",
            //             "typeProperty",
            //             "classMethod",
            //             "objectLiteralMethod",
            //             "typeMethod",
            //             "accessor",
            //             "enumMember"
            //         ],
            //         "format": null,
            //         "modifiers": ["requiresQuotes"]
            //     },

            //     // Act as ignores for client_id and no_auth keys
            //     {
            //         "selector": "objectLiteralProperty",
            //         "format": null,
            //         "filter": {
            //             "regex": "^(client_id)$",
            //             "match": true,
            //         }
            //     },
            //     {
            //         "selector": "objectLiteralMethod",
            //         "format": null,
            //         "filter": {
            //             "regex": "^(no_auth)$",
            //             "match": true,
            //         }
            //     },
            // ],

            "@typescript-eslint/no-angle-bracket-type-assertion": "off",
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-empty-interface": "off",
            // TODO: turn no-explicit-any back on
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-object-literal-type-assertion": "off",
            "@typescript-eslint/consistent-type-assertions": "error",
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

            "@typescript-eslint/prefer-readonly": "error",
        }
    },
    { // typescript overrides 
        "files": ["**.{test,spec}.ts?(x)"],
        "rules": {
            "@typescript-eslint/unbound-method": "off", // Jest has its own version
        }
    },
    { // jsdoc rules
        "plugins": {
            jsdoc
        },
        "rules": {
            "jsdoc/check-access": "error",
            "jsdoc/check-alignment": "error",
            "jsdoc/check-indentation": "off",
            "jsdoc/check-line-alignment": ["error", "always", {"preserveMainDescriptionPostDelimiter": true}],
            "jsdoc/check-param-names": "error",
            "jsdoc/check-property-names": "error",
            "jsdoc/check-tag-names": ["error", {
                "jsxTags": true,
            }],
            "jsdoc/check-values": "error",
            "jsdoc/empty-tags": "error",
            "jsdoc/multiline-blocks": "error",
            "jsdoc/newline-after-description": "error",
            "jsdoc/no-bad-blocks": "error",
            "jsdoc/no-multi-asterisks": "error",
            "jsdoc/no-types": "error",
            "jsdoc/require-asterisk-prefix": "error",
            "jsdoc/require-description": "error",
            "jsdoc/require-description-complete-sentence": ["warn", {
                "abbreviations": ["ex", "ie", "i.e."],
            }],
            // TODO: If all the code has jsdoc comments, consider turning this on
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-param-description": "error",
            "jsdoc/require-param-name": "error",
            "jsdoc/require-param": "error",
            "jsdoc/require-property": "error",
            "jsdoc/require-property-description": "error",
            "jsdoc/require-property-name": "error",
            "jsdoc/require-returns-check": "error",
            "jsdoc/require-returns-description": "error",
            "jsdoc/require-returns": "error",
            "jsdoc/require-throws": "error",
            "jsdoc/require-yields": "error",
            "jsdoc/require-yields-check": "error",
            "jsdoc/tag-lines": ["error", "never"],
            "jsdoc/valid-types": "error",
        },
    },
    { // react rules
        "files": ["src/**/*.tsx"],
        "plugins": {
            react,
        },
        "rules": {
            "react-compiler/react-compiler": "error",
            "react/button-has-type": "error",
            "react/destructuring-assignment": ["error", "always"],
            "react/forbid-elements": ["error", {
                "forbid": [
                    {"element": "input", "message": "use <InputField> instead"},
                ]
            }],
            "react/forbid-foreign-prop-types": "error",
            "react/function-component-definition": ["error", {
                "namedComponents": "arrow-function",
                "unnamedComponents": "arrow-function",
            }],
            "react/hook-use-state": "off",
            "react/no-adjacent-inline-elements": "error",
            "react/no-arrow-function-lifecycle": "error",
            "react/no-danger": "error",
            "react/no-did-mount-set-state": "error",
            "react/no-did-update-set-state": "error",
            "react/no-multi-comp": "off",
            "react/no-namespace": "error",
            "react/no-redundant-should-component-update": "error",
            "react/no-this-in-sfc": "error",
            "react/no-typos": "error",
            "react/no-unsafe": "error",
            "react/no-unstable-nested-components": "error",
            "react/no-unused-class-component-methods": "error",
            "react/no-unused-prop-types": "error",
            "react/no-unused-state": "error",
            "react/no-will-update-set-state": "error",
            "react/prefer-read-only-props": "error",
            "react/prop-types": "off", // This just does what TypeScript already does (but worse)
            "react/self-closing-comp": ["error", {
                "component": true,
                "html": false,
            }],
            "react/sort-comp": "error",
            "react/sort-prop-types": ["error", {
                "callbacksLast": true,
                "requiredFirst": true,
                "sortShapeProp": true,
                "noSortAlphabetically": false,
                "ignoreCase": false,
            }],
            // Applies only to React classes which we do not use
            "react/static-property-placement": "off",
            "react/style-prop-object": "error",
            "react/void-dom-elements-no-children": "error",
            "react/jsx-boolean-value": ["error", "never"],
            "react/jsx-closing-bracket-location": ["error", {
                selfClosing: "after-props",
                nonEmpty: "after-props",
            }],
            "react/jsx-curly-brace-presence": ["error", {
                "props": "never",
                "children": "never",
                "propElementValues": "always",
            }],
            "react/jsx-curly-spacing": ["error", {"when": "never"}],
            "react/jsx-curly-newline": ["error", {
                "multiline": "consistent",
                "singleline": "consistent",
            }],
            "react/jsx-equals-spacing": ["error", "never"],
            "react/jsx-filename-extension": ["error", {"extensions": [".tsx"]}],
            "react/jsx-fragments": ["error", "syntax"],
            "react/jsx-handler-names": "error",
            "react/jsx-indent": "error",
            "react/jsx-indent-props": ["error", "first"],
            "react/jsx-newline": "off",
            "react/jsx-no-constructed-context-values": "error",
            "react/jsx-no-literals": "off",
            "react/jsx-no-script-url": "error",
            "react/jsx-no-useless-fragment": "error",
            "react/jsx-one-expression-per-line": "off",
            "react/jsx-pascal-case": "error",
            "react/jsx-props-no-multi-spaces": "off", // It's useful to align things vertically
            "react/jsx-sort-props": ["error", {
                "callbacksLast": true,
                "shorthandFirst": false,
                "shorthandLast": true,
                "multiline": "last",
                "ignoreCase": false,
                "reservedFirst": ["key", "ref"],
                "noSortAlphabetically": true, // TODO: Maybe consider this as false
            }],
            "react/jsx-space-before-closing": "off", // Deprecated rule
            "react/jsx-tag-spacing": ["error", {
                "closingSlash": "never",
                "beforeSelfClosing": "always",
                "afterOpening": "never",
                "beforeClosing": "never",
            }],
            // TODO: would be good to have parens-new-line, but only for non-fragment children
            //  i.e.
            //  return (<>
            //     {...}
            //  </>);
            //  would still be fine, but
            //  return (<div>
            //     {...}
            //  </div>)
            //  would need to be
            //  return (
            //      <div>
            //         {...}
            //      </div>
            //  );
            //  (this would require custom plugin)
            "react/jsx-wrap-multilines": ["error", {
                "declaration": "parens",
                "assignment": "parens",
                "return": "parens",
                "arrow": "parens",
                "condition": "parens",
                "logical": "parens",
                "prop": "parens"
            }],
        },
    },
    { // jest rules
        "files": ["**.test.ts?(x)"],
        "plugins": { "jest": pluginJest },
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
    {
        "languageOptions": {
            "parserOptions": {
                "tsconfigRootDir": import.meta.dirname,
                "project": "./tsconfig.base.json",
                "ecmaFeatures": {
                    "jsx": true,
                },
            },
            "parser": typescriptParser,
            "globals": {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        // Note: there should be no other properties in this object
        ignores: ["*.js", "*.cjs", "*.d.ts", "**/proto/*.ts"],
    },
);
