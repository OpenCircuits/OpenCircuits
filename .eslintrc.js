const path = require("path");
const fs = require("fs");


/**
 * Returns an array of subdirectory paths (not including prefix) found in a depth first search
 * 
 * @param {string} prefix prefix of the path to search
 * @param {string} topDir path to search
 * @returns {string[]} An array of all subdirectories in a depth first recursive manner
 */
function getSubdirectories(prefix, topDir) {
    const paths = [];
    if (fs.existsSync(path.join(prefix, topDir))) {
        fs.readdirSync(path.join(prefix, topDir))
          .map(fileName => { return topDir + "/" + fileName; })
          .filter(dir => fs.lstatSync(path.join(prefix, dir)).isDirectory())
          .forEach(dir => {
              paths.push(dir);
              getSubdirectories(prefix, dir).forEach(subDir => paths.push(subDir));
          });
    }
    return paths;
}

/**
 * Modifies pathGroupsIn, adding pattern to it both with and without "/*" appended to the end.
 * The "group" will be "external" and the "position" will be "after".
 * 
 * @param {string} pathGroupsIn the array of pathGroups to add to
 * @param {string} pattern the new pattern to add
 */
function addPath(pathGroupsIn, pattern) {
    pathGroupsIn.push({ "pattern": pattern, "group": "external", "position": "after" });
    pathGroupsIn.push({ "pattern": pattern + "/*", "group": "external", "position": "after" });
}

const appDirectories = ["core", "digital"];
const appSubDirectories = ["utils", "actions", "tools", "rendering", "models"];
const siteDirectories = ["shared", "digital", "landing"];
const siteSubDirectories = ["utils", "api", "state", "components", "containers"];
const pathGroups = [
    {"pattern": "react", "group": "external"},
    {"pattern": "{**,**/,,./}{C,c}onstants{**,/**,,}", "group": "external", "position": "after"},
    {"pattern": "Vector", "group": "external", "position": "after"},
    {"pattern": "math/**", "group": "external", "position": "after"},
];
appDirectories.forEach(dir => {
    appSubDirectories.forEach(sub => {
        const pattern = `${dir}/${sub}`;
        addPath(pathGroups, pattern);
        getSubdirectories("./src/app", pattern).forEach(subDir => {
            if (!subDir.includes("Constants") && !subDir.includes("constants"))
                addPath(pathGroups, subDir);
        });
    });
});
siteDirectories.forEach(dir => {
    siteSubDirectories.forEach(sub => {
        const pattern = `${dir}/${sub}`;
        const shared = dir === "shared";
        addPath(pathGroups, (shared ? "" : "site/") + pattern);
        const prefix = shared ? "./src/site" : "./src/site/pages";
        const topDir = shared ? pattern : `${dir}/src/${sub}`;
        getSubdirectories(prefix, topDir).forEach(subDir => {
            if (!subDir.includes("Constants") && !subDir.includes("constants"))
                addPath(pathGroups, (shared ? "" : "site/") + subDir.replace("/src/", "/"));
        });
    });
});
pathGroups.push({"pattern": "**.json", "group": "sibling", "position": "after"});

module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jest": true,
        "jest/globals": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:react-redux/recommended",
        "plugin:jsx-a11y/strict",
        "plugin:sonarjs/recommended",
        "plugin:unicorn/recommended",
        "plugin:jest/recommended",
        "plugin:jest/style",
        "plugin:jest-formatting/strict",
    ],
    "ignorePatterns": ["*.js", "scripts/**"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.base.json",
        "ecmaFeatures": {
            "jsx": true,
        },
    },
    "plugins": [
        "@typescript-eslint",
        "opencircuits",
        "import",
        "align-import",
        "react",
        "react-redux",
        "jsx-a11y",
        "jsdoc",
        "sonarjs",
        "unicorn",
        "jest",
        "jest-formatting",
    ],
    "overrides": [
        {
            "files": ["**/tests/**"],
            "rules": {
                '@typescript-eslint/unbound-method': 'off',
                'jest/unbound-method': 'error',
            }
        },
    ],
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
        "import/named": "error",
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
        // TODO: enable import/no-cycle after model refactor
        "import/no-cycle": "off",
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
                "newlines-between": "always",
                "warnOnUnassignedImports": true,
            },
        ],
        "import/newline-after-import": ["error", { "count": 2 }],
        "align-import/align-import": "error",
        "align-import/trim-import": "error",

        "react/button-has-type": "error",
        // TODO: Decide on destructuring behavior, "always" can also be "never"
        "react/destructuring-assignment": ["off", "always"],
        "react/forbid-elements": ["error", {"forbid": [
            {"element": "input", "message": "use <InputField> instead"},
        ]}],
        "react/forbid-foreign-prop-types": "error",
        "react/function-component-definition": ["error", {
            "namedComponents": "arrow-function",
            "unnamedComponents": "arrow-function",
        }],
        // TODO: uncomment below when it is actually released https://github.com/yannickcr/eslint-plugin-react/blob/master/CHANGELOG.md
        // "react/hook-use-state": "error",
        "react/no-adjacent-inline-elements": "error",
        "react/no-arrow-function-lifecycle": "error",
        "react/no-danger": "error",
        "react/no-did-mount-set-state": "error",
        "react/no-did-update-set-state": "error",
        "react/no-multi-comp": "error",
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
        "react/self-closing-comp": ["error", {
            "component": true,
            "html": true,
        }],
        "react/sort-comp": "error",
        // TODO: decide if this should be set to something
        "react/sort-prop-types": "off",
        // TODO: this one also
        "react/static-property-placement": "off",
        "react/style-prop-object": "error",
        "react/void-dom-elements-no-children": "error",
        // TODO: this one also
        "react/jsx-boolean-value": ["off", "never"],
        "react/jsx-closing-tag-location": "error",
        "react/jsx-curly-newline": ["error", {
            "multiline": "consistent",
            "singleline": "consistent",
        }],
        "react/jsx-equals-spacing": ["error", "never"],
        "react/jsx-filename-extension": ["error", {"extensions": [".tsx"]}],
        "react/jsx-fragments": ["error", "syntax"],
        "react/jsx-handler-names": "error",
        "react/jsx-indent": "error",
        "react/jsx-no-constructed-context-values": "error",
        "react/jsx-no-literals": "error",
        "react/jsx-no-script-url": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-one-expression-per-line": "error",
        "react/jsx-pascal-case": "error",
        "react/jsx-props-no-multi-spaces": "error",
        "react/jsx-tag-spacing": ["error", {
            "beforeClosing": "never",
        }],
        "react/jsx-wrap-multilines": "error",

        "jsx-a11y/autocomplete-valid": ["error", {
            "inputComponents": ["InputField"],
        }],
        "jsx-a11y/lang": "error",

        "jsdoc/check-access": "error",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
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
        "unicorn/prefer-at": "error",
        "unicorn/prefer-string-replace-all": "error",
        "unicorn/prevent-abbreviations": "off",

        "jest/prefer-comparison-matcher": "error",
        "jest/prefer-equality-matcher": "error",
        "jest/prefer-expect-resolves": "error",
        "jest/prefer-hooks-on-top": "error",
        "jest/prefer-strict-equal": "error",
        // Disabled jest/valid-title because it is not type aware
        "jest/valid-title": "off",
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
        },
        "react": {
            "version": "detect",
        },
    },
}
