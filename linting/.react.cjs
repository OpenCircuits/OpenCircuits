module.exports = {
    "plugins": [
        "react",
    ],
    "overrides": [
        {
            "files": ["src/site/**/*.tsx"],
            "extends": [
                "plugin:react/recommended",
                "plugin:react/jsx-runtime",
                "plugin:react-hooks/recommended",
            ],
            "rules": {
                "react/button-has-type": "error",
                "react/destructuring-assignment": ["error", "always"],
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
                "react/hook-use-state": "off",
                "react/no-adjacent-inline-elements": "error",
                "react/no-arrow-function-lifecycle": "error",
                "react/no-danger": "error",
                "react/no-did-mount-set-state": "error",
                "react/no-did-update-set-state": "error",
                "react/no-multi-comp": "off",
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
                "react/prop-types": "off", // This just does what TypeScript already does (but worse)
                "react/self-closing-comp": ["error", {
                    "component": true,
                    "html": false,
                }],
                "react/sort-comp": "error",
                "react/sort-prop-types": ["error", {
                    "callbacksLast": true,
                    "requiredFirst": true,
                    "sortShapeProp": true,
                    "noSortAlphabetically": false,
                    "ignoreCase": false,
                }],
                // Applies only to React classes which we do not use
                "react/static-property-placement": "off",
                "react/style-prop-object": "error",
                "react/void-dom-elements-no-children": "error",
                "react/jsx-boolean-value": ["error", "never"],
                "react/jsx-closing-bracket-location": ["error", {
                    selfClosing: "after-props",
                    nonEmpty: "after-props",
                }],
                "react/jsx-curly-brace-presence": ["error", {
                    "props": "never",
                    "children": "never",
                    "propElementValues": "always",
                }],
                "react/jsx-curly-spacing": ["error", { "when": "never" }],
                "react/jsx-curly-newline": ["error", {
                    "multiline": "consistent",
                    "singleline": "consistent",
                }],
                "react/jsx-equals-spacing": ["error", "never"],
                "react/jsx-filename-extension": ["error", {"extensions": [".tsx"]}],
                "react/jsx-fragments": ["error", "syntax"],
                "react/jsx-handler-names": "error",
                "react/jsx-indent": "error",
                "react/jsx-indent-props": ["error", "first"],
                "react/jsx-newline": "off",
                "react/jsx-no-constructed-context-values": "error",
                "react/jsx-no-literals": "off",
                "react/jsx-no-script-url": "error",
                "react/jsx-no-useless-fragment": "error",
                "react/jsx-one-expression-per-line": "off",
                "react/jsx-pascal-case": "error",
                "react/jsx-props-no-multi-spaces": "off", // It's useful to align things vertically
                "react/jsx-sort-props": ["error", {
                    "callbacksLast": true,
                    "shorthandFirst": false,
                    "shorthandLast": true,
                    "multiline": "last",
                    "ignoreCase": false,
                    "reservedFirst": ["key", "ref"],
                    "noSortAlphabetically": true, // TODO: Maybe consider this as false
                }],
                "react/jsx-space-before-closing": "off", // Deprecated rule
                "react/jsx-tag-spacing": ["error", {
                    "closingSlash": "never",
                    "beforeSelfClosing": "always",
                    "afterOpening": "never",
                    "beforeClosing": "never",
                }],
                // TODO: would be good to have parens-new-line, but only for non-fragment children
                //  i.e.
                //  return (<>
                //     {...}
                //  </>);
                //  would still be fine, but
                //  return (<div>
                //     {...}
                //  </div>)
                //  would need to be
                //  return (
                //      <div>
                //         {...}
                //      </div>
                //  );
                //  (this would require custom plugin)
                "react/jsx-wrap-multilines": ["error", {
                    "declaration": "parens",
                    "assignment": "parens",
                    "return": "parens",
                    "arrow": "parens",
                    "condition": "parens",
                    "logical": "parens",
                    "prop": "parens"
                }],
            },
        },
    ],
    "settings": {
        "react": {
            "version": "detect",
        },
    },
}
