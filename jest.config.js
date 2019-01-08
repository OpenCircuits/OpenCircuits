// Options for Jest

module.exports = {
    collectCoverage: true,
    testEnvironment: "jsdom",
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
    ],
    transform: {
      "\\.(ts|tsx)$": "ts-jest"
    },
    testRegex: "/tests/.*\\.(ts|tsx|js)$"
};
