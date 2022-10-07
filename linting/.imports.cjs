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
            .map(fileName => {return topDir + "/" + fileName;})
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
    if (pattern === "core/rendering/Styles")
        return;
    pathGroupsIn.push({"pattern": pattern, "group": "external", "position": "after"});
    pathGroupsIn.push({"pattern": pattern + "/*", "group": "external", "position": "after"});
}

const appDirectories = ["core", "analog", "digital"];
const appSubDirectories = ["utils", "actions", "tools", "rendering", "models"];
const siteDirectories = ["shared", "analog", "digital", "landing"];
const siteSubDirectories = ["utils", "api", "state", "components", "containers", "tests"];
const pathGroups = [
    {"pattern": "react", "group": "external"},
    {"pattern": "{**,**/,,./,../,*}{Constants,constants,core/rendering/Styles}{**,/**,,*}", "group": "external", "position": "after"},
    {"pattern": "Vector", "group": "external", "position": "after"},
    {"pattern": "math/**", "group": "external", "position": "after"},
    {"pattern": "test/helpers/*", "group": "external", "position": "after"},
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
pathGroups.push({"pattern": "{.,..}/**/*.json", "patternOptions": {"dot": true}, "group": "sibling", "position": "after"});
pathGroups.push({"pattern": "{.,..}/**/*.{css,sass,scss}", "patternOptions": {"dot": true}, "group": "sibling", "position": "after"});

module.exports = {
    "plugins": [
        "import",
        "align-import",
    ],
    "extends": [
        "plugin:import/typescript",
    ],
    "rules": {
        "import/no-unresolved": "off", // redundant because typescript
        "import/named": "off", // redundant because typescript
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
                        "target": "./src/app/analog/**",
                        "from": "./src/app/!(core|analog)/**",
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
                        "target": "./src/site/pages/analog/**",
                        "from": "./src/site/pages/!(analog)/**",
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
        "import/no-relative-packages": "off", // slow
        "import/no-deprecated": "off", // very few external imports
        "import/no-mutable-exports": "error",
        "import/first": "error",
        "import/exports-last": "off",
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
        "import/newline-after-import": ["error", {
            "count": 2,
            // TODO: uncomment when this gets released
            // "considerComments": true,
        }],

        "align-import/align-import": "error",
        "align-import/trim-import": "error",
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
    },
}
