import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    ...tseslint.configs.recommended, // TypeScript ESLint 推荐规则
    pluginReact.configs.flat.recommended, // React 推荐规则
    {
        plugins: { prettier: eslintPluginPrettier },
        rules: {
            ...eslintConfigPrettier.rules, // 让 Prettier 规则覆盖 ESLint 规则
            "prettier/prettier": "error",
            "react/react-in-jsx-scope": "off", // 适用于 React 18+
        },
    },
];
