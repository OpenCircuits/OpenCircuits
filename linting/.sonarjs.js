module.exports = {
    "plugins": [
        "sonarjs",
    ],
    "extends": [
        "plugin:sonarjs/recommended",
    ],
    "rules": {
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-duplicate-string": "off",
    },
}