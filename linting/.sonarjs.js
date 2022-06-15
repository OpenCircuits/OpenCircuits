module.exports = {
    "overrides": [
        {
            "files": ["**.test.ts"],
            "rules": {
                "sonarjs/no-duplicate-string": "off", // Complained about similar test names
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