import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";


export default tseslint.config([
    sonarjs.configs.recommended,
    {
        "rules": {
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/todo-tag": "off",

            // typescript eslint handles this already
            "sonarjs/no-unused-vars": "off",

            "sonarjs/no-commented-code": "off",
        }
    },
    {
        "files": ["**/*.{test,spec}.ts?(x)"],
        "rules": {
            // Verbosity can be nice in tests, so this check isn't necessary there
            "sonarjs/no-identical-functions": "off",

            "sonarjs/no-dead-store": "off",
        }
    },
]);
