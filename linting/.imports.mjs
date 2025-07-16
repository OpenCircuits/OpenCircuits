import importPlugin from 'eslint-plugin-import';
import tseslint from "typescript-eslint";

export default tseslint.config([
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        "rules": {
            "import/no-unresolved": "off", // redundant because typescript
            "import/named": "off", // redundant because typescript
            // TODO: set and reenable this
            "import/no-restricted-paths": "off",
            "import/no-self-import": "error",
            "import/no-useless-path-segments": "error",
            "import/no-relative-packages": "off", // slow
            "import/no-deprecated": "off", // very few external imports
            "import/no-mutable-exports": "error",
            "import/first": "error",
            "import/exports-last": "off",
            "import/no-duplicates": "error",
            "import/no-namespace": "off",
            "import/extensions": [
                "error",
                "ignorePackages",
                {
                    "ts": "never",
                    "tsx": "never",
                }
            ],
            // TODO: Replace with biome?
            "import/order": "off",

            "import/newline-after-import": ["error", {
                "count": 2,
                "considerComments": true,
            }],
            "import/no-cycle": "error",
        },
    },
]);
