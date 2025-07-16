import globals from "globals";
import tseslint from "typescript-eslint";
import typescriptParser from "@typescript-eslint/parser";

import coreRules from "./linting/.core.mjs";
import tsRules from "./linting/.ts.mjs";
import jsdocRules from "./linting/.jsdoc.mjs";
import reactRules from "./linting/.react.mjs";
import jestRules from "./linting/.jestRules.mjs";
import unicornRules from "./linting/.unicorn.mjs";
import sonarjsRules from "./linting/.sonarjs.mjs";
import jsxa11yRules from "./linting/.jsxa11y.mjs"
import playwrightRules from "./linting/.playwright.mjs";
import importRules from "./linting/.imports.mjs";

export default tseslint.config(
    ...coreRules,
    ...tsRules,
    ...jsdocRules,
    ...reactRules,
    ...jestRules,
    ...unicornRules,
    ...sonarjsRules,
    ...jsxa11yRules,
    ...playwrightRules,
    ...importRules,

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
        "ignores": ["*.js", "*.cjs", "*.mjs", "*.d.ts", "**/proto/*.ts"],
    },
);
