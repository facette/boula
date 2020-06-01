module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "prettier/@typescript-eslint",
    ],
    overrides: [
        {
            files: ["*.js"],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        "@typescript-eslint/array-type": ["error", {default: "generic"}],
        "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
        "@typescript-eslint/explicit-function-return-type": ["error", {allowExpressions: true}],
        "eqeqeq": ["error", "always"],
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "prettier/prettier": [
            process.env.NODE_ENV === "production" ? "error" : "warn",
            {
                arrowParens: "avoid",
                bracketSpacing: false,
                printWidth: 120,
                quoteProps: "consistent",
                tabWidth: 4,
                trailingComma: "all",
            },
        ],
        "sort-imports": ["error", {ignoreDeclarationSort: true}],
    },
};
