import { defineConfig } from "oxfmt";

export default defineConfig({
    // This endOfLine behavior matches the auto behavior we have in .gitignore
    endOfLine: process.platform === "win32" ? "crlf" : "lf",
    ignorePatterns: ["*.md"],
    printWidth: 120,
    tabWidth: 4,
});
