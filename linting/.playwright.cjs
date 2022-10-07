module.exports = {
    "plugins": [
        "playwright",
    ],
    "extends": [
        "plugin:playwright/playwright-test",
    ],
    "rules": {
        "playwright/prefer-to-have-length": "error",
    },
}
