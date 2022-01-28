const appDirectories = ["core", "digital"];
const appSubDirectories = ["utils", "actions", "tools", "rendering", "models"];
const siteDirectories = ["shared", "site/*"];
const siteSubDirectories = ["utils", "api", "state", "components", "containers"];
const pathGroups = [
    {"pattern": "react", "group": "external"},
    {"pattern": "{**Constants**,**/Constants**,Constants/**,**/Constants/**}", "group": "external", "position": "after"},
    {"pattern": "Vector", "group": "external", "position": "after"},
    {"pattern": "math/**", "group": "external", "position": "after"},
];
appDirectories.forEach(dir => {
    appSubDirectories.forEach(sub => {
        pathGroups.push({
            "pattern": `${dir}/${sub}/**`,
            "group": "external",
            "position": "after"
        });
    });
});
siteDirectories.forEach(dir => {
    siteSubDirectories.forEach(sub => {
        pathGroups.push({
            "pattern": `${dir}/${sub}/**`,
            "group": "external",
            "position": "after"
        });
    });
});
pathGroups.push({"pattern": "**.json", "group": "sibling", "position": "after"});
// ./index.scss doesn't seem to be working, see https://github.com/import-js/eslint-plugin-import/issues/1239 for further reserach
pathGroups.push({"pattern": "{**.scss,./index.scss}", "group": "sibling", "position": "after"});           

module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jest": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
    ],
    "ignorePatterns": ["*.js", "scripts/**", "src/app/tests/**"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.base.json"
    },
    "plugins": ["@typescript-eslint", "opencircuits", "import"],
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
                "selector": ["function", "typeProperty", "objectLiteralProperty"],
                "format": ["camelCase", "PascalCase"],
            },
            { // enum members
                "selector": "enumMember",
                "format": ["PascalCase"],
            },
            { // static class properties must be UPPER_CASE, no leading underscore
                "selector": "classProperty",
                "modifiers": ["static"],
                "format": ["UPPER_CASE"],
            },
            { // static class methods can be camelCase or  PascalCase, no leading underscore
                "selector": "classMethod",
                "modifiers": ["static"],
                "format": ["camelCase", "PascalCase"],
            },
        ],
        "object-curly-spacing": ["off"],
        "opencircuits/object-curly-spacing": ["error", "always"],
        "import/no-unresolved": "error",
        "import/no-restricted-paths": [
            "error",
            {
                "zones": [
                    {
                        "target": "./src/app/core/**",
                        "from": "./src/app/!(core)/**",
                    },
                    {
                        "target": "./src/app/digital/**",
                        "from": "./src/app/!(core|digital)/**",
                    },
                    {
                        "target": "./src/app/**",
                        "from": "./src/site/**",
                    },
                    {
                        "target": "./src/site/shared/**",
                        "from": "./src/app/!(core)/**",
                    },
                    {
                        "target": "./src/site/shared/**",
                        "from": "./src/site/pages/**",
                    },
                    {
                        "target": "./src/site/pages/digital/**",
                        "from": "./src/site/pages/!(digital)/**",
                    },
                    {
                        "target": "./src/site/pages/landing/**",
                        "from": "./src/site/pages/!(landing)/**",
                    },
                ],
            },
        ],
        "import/no-self-import": "error",
        "import/no-cycle": "error",
        "import/no-useless-path-segments": "error",
        "import/no-relative-packages": "error",
        "import/no-deprecated": "warn",
        "import/no-mutable-exports": "error",
        "import/first": "error",
        "import/exports-last": "error",
        "import/no-duplicates": "error",
        "import/no-namespace": "error",
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                "ts": "never",
                "tsx": "never",
            }
        ],
        "import/order": [
            "error",
            {
                "pathGroups": pathGroups,
                "pathGroupsExcludedImportTypes": ["react"],
                "groups":
                [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object",
                    "type",
                ],
                "alphabetize":
                {
                    "order": "asc",
                    "caseInsensitive": true,
                },
                "newlines-between": "always-and-inside-groups",
            },
        ],
        "import/newline-after-import": ["error", { "count": 2 }],
    },
    "settings": {
        "import/resolver": {
            "typescript": {
                "project": [
                    "src/app/tsconfig.json",
                    "src/site/shared/tsconfig.json",
                    "src/site/pages/*/tsconfig.json",
                ]
            }
        }
    },
}
