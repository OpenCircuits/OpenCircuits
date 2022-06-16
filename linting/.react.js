module.exports = {
    "plugins": [
        "react",
    ],
    "extends": [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
    ],
    "rules": {
        "react/button-has-type": "error",
        // TODO: Decide on destructuring behavior, "always" can also be "never"
        "react/destructuring-assignment": ["off", "always"],
        "react/forbid-elements": ["error", {
            "forbid": [
                {"element": "input", "message": "use <InputField> instead"},
            ]
        }],
        "react/forbid-foreign-prop-types": "error",
        "react/function-component-definition": ["error", {
            "namedComponents": "arrow-function",
            "unnamedComponents": "arrow-function",
        }],
        "react/hook-use-state": "error",
        "react/no-adjacent-inline-elements": "error",
        "react/no-arrow-function-lifecycle": "error",
        "react/no-danger": "error",
        "react/no-did-mount-set-state": "error",
        "react/no-did-update-set-state": "error",
        "react/no-multi-comp": "error",
        "react/no-namespace": "error",
        "react/no-redundant-should-component-update": "error",
        "react/no-this-in-sfc": "error",
        "react/no-typos": "error",
        "react/no-unsafe": "error",
        "react/no-unstable-nested-components": "error",
        "react/no-unused-class-component-methods": "error",
        "react/no-unused-prop-types": "error",
        "react/no-unused-state": "error",
        "react/no-will-update-set-state": "error",
        "react/prefer-read-only-props": "error",
        "react/self-closing-comp": ["error", {
            "component": true,
            "html": true,
        }],
        "react/sort-comp": "error",
        // TODO: decide if this should be set to something
        "react/sort-prop-types": "off",
        // TODO: this one also
        "react/static-property-placement": "off",
        "react/style-prop-object": "error",
        "react/void-dom-elements-no-children": "error",
        // TODO: this one also
        "react/jsx-boolean-value": ["off", "never"],
        // TODO: this one also
        "react/jsx-closing-bracket-location": "off",
        // TODO: this one also
        "react/jsx-curly-brace-presence": "off",
        // TODO: this one also
        "react/jsx-curly-spacing": "off",
        "react/jsx-curly-newline": ["error", {
            "multiline": "consistent",
            "singleline": "consistent",
        }],
        "react/jsx-equals-spacing": ["error", "never"],
        "react/jsx-filename-extension": ["error", {"extensions": [".tsx"]}],
        "react/jsx-fragments": ["error", "syntax"],
        "react/jsx-handler-names": "error",
        "react/jsx-indent": "error",
        // TODO: this one also
        "react/jsx-indent-props": "off",
        // TODO: this one also
        "react/jsx-newline": "off",
        "react/jsx-no-constructed-context-values": "error",
        // TODO: this one also
        "react/jsx-no-literals": "error",
        "react/jsx-no-script-url": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/jsx-one-expression-per-line": ["error", {"allow": "single-child"}],
        "react/jsx-pascal-case": "error",
        "react/jsx-props-no-multi-spaces": "error",
        // TODO: this one also
        "react/jsx-sort-props": "off",
        // TODO: this one also
        "react/jsx-space-before-closing": "off",
        // TODO: This has further settings to examine
        "react/jsx-tag-spacing": ["error", {
            "beforeClosing": "never",
        }],
    },
    "settings": {
        "react": {
            "version": "detect",
        },
    },
}