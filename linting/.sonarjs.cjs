module.exports = {
    "plugins": [
        "sonarjs",
    ],
    "extends": [
        "plugin:sonarjs/recommended",
    ],
    "overrides": [
        {
            "files": ["**.test.ts?(x)"],
            "rules": {
                // Verbosity can be nice in tests, so this check isn't necessary there
                "sonarjs/no-identical-functions": "off",
            }
        },
    ],
    "rules": {
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-duplicate-string": "off",
    },
}
