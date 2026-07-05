import { defineConfig } from "oxfmt";

export default defineConfig({
    // This endOfLine behavior matches the auto behavior we have in .gitignore
    endOfLine: process.platform === "win32" ? "crlf" : "lf",
    ignorePatterns: ["*.md", "**/TestCircuitData/**/*.json"],
    printWidth: 120,
    quoteProps: "preserve",
    tabWidth: 4,
});
