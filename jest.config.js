// Options for Jest

module.exports = {
    collectCoverage: true,
    testEnvironment: "jsdom",
    setupFiles: ["core-js"],
    moduleFileExtensions: ["ts", "js"],
    transform: {
        "\\.(ts)$": "ts-jest"
    },
    testRegex: "/tests/.*\\.(test.ts)$",
    moduleNameMapper: {
        "Vector": "<rootDir>/app/core/ts/utils/math/Vector.ts",
        "math/(.*)$": "<rootDir>/app/core/ts/utils/math/$1.ts",
        "core/(.*)$": "<rootDir>/app/core/ts/$1.ts",
        "digital/(.*)$": "<rootDir>/app/digital/ts/$1.ts",
        "analog/(.*)$": "<rootDir>/app/analog/ts/$1.ts",
        "test/helpers/(.*)": "<rootDir>/tests/helpers/$1.ts"
    }
};
