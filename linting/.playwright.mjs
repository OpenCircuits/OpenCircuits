import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright"


export default tseslint.config([
    {
        ...playwright.configs["flat/recommended"],
        files: ["tests/**/*"],
        rules: {
            ...playwright.configs["flat/recommended"].rules,
            "playwright/prefer-to-have-length": "error",
        },
    },
]);
