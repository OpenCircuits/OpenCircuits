// Options for Jest

module.exports = {
    collectCoverage: true,
    testEnvironment: "jsdom",
    moduleFileExtensions: [
        "js",
        "ts"
    ],
    transform: {
        "\\.(ts)$": "ts-jest"
    },
    testRegex: "/tests/.*\\.(test.ts)$",
    moduleNameMapper: {
        "Vector": "<rootDir>/app/core/ts/utils/math/Vector.ts",
        "math/(.*)$": "<rootDir>/app/core/ts/utils/math/$1.ts",
        "core/utils/(.*)$": "<rootDir>/app/core/ts/utils/$1.ts",
        "digital/(.*)$": "<rootDir>/app/digital/ts/$1.ts",
    }
};
