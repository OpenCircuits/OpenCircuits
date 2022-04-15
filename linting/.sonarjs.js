module.exports = {
    "overrides": [
        {
            "files": ["**.test.ts"],
            "rules": {
                "sonarjs/no-duplicate-string": "off",
            }
        },
    ],
    "plugins": [
        "sonarjs",
    ],
    "extends": [
        "plugin:sonarjs/recommended",
    ],
    "rules": {
        "sonarjs/cognitive-complexity": "off",
    },
}