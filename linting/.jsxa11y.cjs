module.exports = {
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": "true",
        },
    },
    "plugins": [
        "jsx-a11y",
    ],
    // Disabled since we want warnings, not errors
    // "extends": [
    //     "plugin:jsx-a11y/strict",
    // ],
    "rules": {
        "jsx-a11y/autocomplete-valid": ["warn", {
            "inputComponents": ["InputField"],
        }],
        "jsx-a11y/lang": "warn",

        "jsx-a11y/alt-text": "warn",
        "jsx-a11y/anchor-has-content": "warn",
        "jsx-a11y/anchor-is-valid": "warn",
        "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
        "jsx-a11y/aria-props": "warn",
        "jsx-a11y/aria-proptypes": "warn",
        "jsx-a11y/aria-role": "warn",
        "jsx-a11y/aria-unsupported-elements": "warn",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/control-has-associated-label": ["off", {
            "ignoreElements": [
                "audio",
                "canvas",
                "embed",
                "input",
                "textarea",
                "tr",
                "video",
            ],
            "ignoreRoles": [
                "grid",
                "listbox",
                "menu",
                "menubar",
                "radiogroup",
                "row",
                "tablist",
                "toolbar",
                "tree",
                "treegrid",
            ],
            "includeRoles": [
                "alert",
                "dialog",
            ],
        }],
        "jsx-a11y/heading-has-content": "warn",
        "jsx-a11y/html-has-lang": "warn",
        "jsx-a11y/iframe-has-title": "warn",
        "jsx-a11y/img-redundant-alt": "warn",
        "jsx-a11y/interactive-supports-focus": [
            "warn",
            {
                "tabbable": [
                    "button",
                    "checkbox",
                    "link",
                    "progressbar",
                    "searchbox",
                    "slider",
                    "spinbutton",
                    "switch",
                    "textbox",
                ],
            },
        ],
        "jsx-a11y/label-has-for": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/media-has-caption": "warn",
        "jsx-a11y/mouse-events-have-key-events": "warn",
        "jsx-a11y/no-access-key": "warn",
        "jsx-a11y/no-autofocus": "warn",
        "jsx-a11y/no-distracting-elements": "warn",
        "jsx-a11y/no-interactive-element-to-noninteractive-role": "warn",
        "jsx-a11y/no-noninteractive-element-interactions": [
            // TODO: Enable one day when we really dive into making the site accessible
            "off",
            // {
            //     "body": ["onwarning", "onLoad"],
            //     "iframe": ["onwarning", "onLoad"],
            //     "img": ["onwarning", "onLoad"],
            // },
        ],
        "jsx-a11y/no-noninteractive-element-to-interactive-role": "warn",
        "jsx-a11y/no-noninteractive-tabindex": "warn",
        "jsx-a11y/no-redundant-roles": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/role-has-required-aria-props": "warn",
        "jsx-a11y/role-supports-aria-props": "warn",
        "jsx-a11y/scope": "warn",
        "jsx-a11y/tabindex-no-positive": "warn",
    },
}
