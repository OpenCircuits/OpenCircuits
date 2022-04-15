module.exports = {
    "plugins": [
        "jsx-a11y",
    ],
    "extends": [
        "plugin:jsx-a11y/strict",
    ],
    "rules": {
        "jsx-a11y/autocomplete-valid": ["error", {
            "inputComponents": ["InputField"],
        }],
        "jsx-a11y/lang": "error",
    },
}