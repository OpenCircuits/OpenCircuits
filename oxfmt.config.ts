import { defineConfig } from "oxfmt";

const sites = ["shared", "digital", "analog"] as const;
const apiDirs = ["circuit", "circuitdesigner"] as const;
// handle data separately
const siteDirs = ["utils", "tools", "api", "proto", "state", "containers"] as const;

const groups = [
    ...apiDirs.flatMap((apiDir) =>
        sites.map((site) => ({
            groupName: `${site}-api-${apiDir}`,
            elementNamePattern: [`${site}/api/${apiDir}/**/*`, `${site}/api/${apiDir}`],
        })),
    ),

    ...sites.flatMap((site) =>
        siteDirs.map((siteDir) => ({
            groupName: `${site}-site-${siteDir}`,
            elementNamePattern: [`${site}/site/${siteDir}/**/*`, `${site}/site/${siteDir}`],
        })),
    ),
];

export default defineConfig({
    // This endOfLine behavior matches the auto behavior we have in .gitignore
    endOfLine: process.platform === "win32" ? "crlf" : "lf",
    ignorePatterns: ["*.md", "**/proto/*.ts", "**/TestCircuitData/**/*.json"],
    printWidth: 120,
    quoteProps: "preserve",
    tabWidth: 4,
    overrides: [
        {
            files: ["*.yml", "*.yaml", "*.json"],
            options: {
                tabWidth: 2,
            },
        },
    ],
    sortImports: {
        customGroups: [...groups, { groupName: "data", elementNamePattern: ["**/data/**/*"] }],
        newlinesBetween: true,
        groups: [
            ["value-external", "type-external"],
            ...groups.map(({ groupName }) => groupName),
            ["parent", "sibling"],
            ["data"],
            ["side_effect_style", "style"],
            "unknown",
        ],
    },
});
