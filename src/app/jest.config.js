// Options for Jest
module.exports = {
  "roots": [
      "<rootDir>"
  ],
  "collectCoverageFrom": [
    "**/*.{js,jsx,ts,tsx}",
    "**/*.d.ts"
  ],
  "setupFiles": [
    "react-app-polyfill/jsdom"
  ],
  "testMatch": [
    "<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"
  ],
  "transform": {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/../../node_modules/babel-jest"
  },
  "transformIgnorePatterns": [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$"
  ],
  "modulePaths": [
    "<rootDir>/../../node_modules/"
  ],
  "moduleNameMapper": {
    "^react-native$": "react-native-web",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "Vector": "<rootDir>/core/utils/math/Vector.ts",
    "math/(.*)$": "<rootDir>/core/utils/math/$1.ts",
    "core/(.*)$": "<rootDir>/core/$1",
    "digital/(.*)$": "<rootDir>/digital/$1",
    "test/helpers/(.*)": "<rootDir>/tests/helpers/$1"
  },
  "moduleFileExtensions": [
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "node"
  ],
  "watchPlugins": [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ]
};
