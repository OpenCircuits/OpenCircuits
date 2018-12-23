// Options for Jest

module.exports = {
    collectCoverage: true,
    testEnvironment: "node",
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
