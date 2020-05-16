module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "BigInt": "readonly"
    },
    "parserOptions": {
        "project": "./tsconfig.json",
        "projectFolderIgnoreList": [
            "/node_modules/",
            "/build/",
            "/test/"
        ],
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [ "@typescript-eslint" ],
    "rules": {
        "@typescript-eslint/ban-ts-ignore": "warn",
        "accessor-pairs": "error",
        "array-bracket-newline": "error",
        "array-bracket-spacing": [
            "error",
            "always",
            {
                "singleValue": true,
                "objectsInArrays": false,
                "arraysInArrays": true,
            }
        ],
        "array-callback-return": "error",
        "array-element-newline": "error",
        "arrow-body-style": "error",
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "arrow-spacing": [
            "error",
            {
                "after": true,
                "before": true
            }
        ],
        "block-scoped-var": "error",
        "block-spacing": "error",
        "brace-style": [
            "error",
            "stroustrup"
        ],
        "callback-return": "error",
        "camelcase": "warn",
        "capitalized-comments": "off",
        "class-methods-use-this": "off",
        "comma-dangle": [
            "error",
            {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "never"
            }
        ],
        "comma-spacing": [
            "error",
            {
                "after": true,
                "before": false
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "complexity": "error",
        "computed-property-spacing": [
            "error",
            "always"
        ],
        "consistent-return": "off",
        "consistent-this": "error",
        "curly": "error",
        "default-case": "error",
        "default-param-last": "error",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": "error",
        "eol-last": "error",
        "eqeqeq": "error",
        "func-call-spacing": "error",
        "func-name-matching": "error",
        "func-names": "error",
        "func-style": "off",
        "function-paren-newline": [
            "error",
            "multiline"
        ],
        "generator-star-spacing": "error",
        "global-require": "error",
        "grouped-accessor-pairs": "error",
        "guard-for-in": "error",
        "handle-callback-err": "error",
        "id-blacklist": "error",
        "id-length": "off",
        "id-match": "error",
        "implicit-arrow-linebreak": "error",
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "MemberExpression": 1,
                "CallExpression": { "arguments": 1 },
                "ArrayExpression": 1,
                "ObjectExpression": 1,
                "ImportDeclaration": 1,
                "flatTernaryExpressions": false,
                "ignoreComments": false
            }
        ],
        "indent-legacy": "error",
        "init-declarations": "error",
        "jsx-quotes": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "line-comment-position": [
            "error",
            {
                "position": "above"
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "lines-around-comment": [
            "error",
            {
                "beforeBlockComment": true,
                "beforeLineComment": true,
                "allowBlockStart": true,
                "allowObjectStart": true,
                "allowArrayStart": true,
                "allowClassStart": true
            }
        ],
        "lines-around-directive": "error",
        "lines-between-class-members": [
            "warn",
            "always"
        ],
        "max-classes-per-file": "error",
        "max-depth": "error",
        "max-len": [
            "error",
            {
                "code": 120,
                "tabWidth": 4,
                "ignoreComments": true,
                "ignoreRegExpLiterals": true,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true,
                "ignoreTrailingComments": false,
                "ignoreUrls": true
            }
        ],
        "max-lines": [
            "error",
            {
                "max": 300,
                "skipBlankLines": true,
                "skipComments": true
            },
        ],
        "max-lines-per-function": "warn",
        "max-nested-callbacks": "error",
        "max-params": "error",
        "max-statements": "off",
        "max-statements-per-line": "error",
        "multiline-comment-style": "off",
        "multiline-ternary": "warn",
        "new-cap": "error",
        "new-parens": "error",
        "newline-after-var": "off",
        "newline-before-return": "warn",
        "newline-per-chained-call": [
            "error",
            {
                "ignoreChainWithDepth": 2
            }
        ],
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-await-in-loop": "warn",
        "no-bitwise": [
            "error",
            {
                "allow": [
                    "~"
                ]
            }
        ],
        "no-buffer-constructor": "error",
        "no-caller": "error",
        "no-catch-shadow": "error",
        "no-confusing-arrow": "error",
        "no-console": "off",
        "no-constructor-return": "error",
        "no-continue": "warn",
        "no-div-regex": "error",
        "no-dupe-else-if": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-empty-function": "warn",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": [
            "error",
            "all",
            {
                "nestedBinaryExpressions": false,
                "ignoreJSX": "all",
                "returnAssign": false,
                "enforceForArrowConditionals": false,
                "enforceForSequenceExpressions": true,
                "enforceForNewInMemberExpressions": false
            }
        ],
        "no-floating-decimal": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-import-assign": "error",
        "no-inline-comments": "error",
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-loop-func": "error",
        "no-magic-numbers": "off",
        "no-mixed-operators": "error",
        "no-mixed-requires": "error",
        "no-multi-assign": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-multiple-empty-lines": "error",
        "no-native-reassign": "error",
        "no-negated-condition": "error",
        "no-negated-in-lhs": "error",
        "no-nested-ternary": "off",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "error",
        "no-path-concat": "error",
        "no-plusplus": "error",
        "no-process-env": "off",
        "no-process-exit": "error",
        "no-proto": "error",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-properties": "error",
        "no-restricted-syntax": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-setter-return": "error",
        "no-shadow": "warn",
        "no-spaced-func": "error",
        "no-sync": "error",
        "no-tabs": "error",
        "no-template-curly-in-string": "error",
        "no-ternary": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-undefined": "error",
        "no-underscore-dangle": "warn",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-unused-expressions": "error",
        "no-unused-vars": [
            "error",
            { "varsIgnorePattern": "should|expect" }
        ],
        "no-use-before-define": "error",
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "no-void": "error",
        "no-warning-comments": "error",
        "no-whitespace-before-property": "error",
        "nonblock-statement-body-position": "error",
        "object-curly-newline": "error",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "object-property-newline": "error",
        "object-shorthand": "error",
        "one-var": "off",
        "one-var-declaration-per-line": "error",
        "operator-assignment": "error",
        "operator-linebreak": "error",
        "padded-blocks": "off",
        "padding-line-between-statements": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-destructuring": "off",
        "prefer-exponentiation-operator": "error",
        "prefer-named-capture-group": "error",
        "prefer-numeric-literals": "error",
        "prefer-object-spread": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-reflect": "off",
        "prefer-regex-literals": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "quote-props": [
            "error",
            "consistent",
            {
                "keywords": true
            }
        ],
        "quotes": "off",
        "radix": "error",
        "require-atomic-updates": "error",
        "require-await": "off",
        "require-jsdoc": "error",
        "require-unicode-regexp": "off",
        "rest-spread-spacing": [
            "error",
            "never"
        ],
        "semi": "error",
        "semi-spacing": "error",
        "semi-style": [
            "warn",
            "last"
        ],
        "sort-imports": "warn",
        "sort-keys": "off",
        "sort-vars": "warn",
        "space-before-blocks": "error",
        "space-before-function-paren": "error",
        "space-in-parens": "off",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": [
            "warn",
            "always"
        ],
        "strict": "error",
        "switch-colon-spacing": "error",
        "symbol-description": "error",
        "template-curly-spacing": [
            "error",
            "never"
        ],
        "template-tag-spacing": "error",
        "unicode-bom": [
            "error",
            "never"
        ],
        "valid-jsdoc": "warn",
        "vars-on-top": "error",
        "wrap-iife": "error",
        "wrap-regex": "error",
        "yield-star-spacing": "error",
        "yoda": [
            "error",
            "never"
        ]
    }
};
