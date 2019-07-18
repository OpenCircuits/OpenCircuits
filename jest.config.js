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
    testRegex: "/tests/.*\\.(test.ts)$"
};
