import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default tseslint.config(
  { ignores: ["dist", "build", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      //Existing rules
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...reactHooks.configs.recommended.rules,

      //Add new rules here
      "no-console": "warn",              // Warning when use console.log
      "eqeqeq": ["error", "always"],     // Always use === instead ==
      "no-unused-vars": ["warn"],        // Warning unused variable
      "curly": ["error", "all"],         // Always use {} in if, for, while
      "no-alert": "warn",
      "no-empty-function": "warn",
      "prefer-const": "warn",
      "arrow-body-style": ["warn", "as-needed"],
      "object-shorthand": ["error", "always"],
      "no-multi-spaces": "error",

      //Rules
      indent: ["error", 2],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "prettier/prettier": [
        "error",
        {
          printWidth: 120,
          useTabs: false,
          tabWidth: 2,
          trailingComma: "es5",
          semi: true,
          singleQuote: false,
          bracketSpacing: true,
          arrowParens: "always",
          jsxSingleQuote: false,
          bracketSameLine: false,
          endOfLine: "auto",
        },
      ],
    },
  },
);
