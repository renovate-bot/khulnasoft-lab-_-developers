import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, prettier, {
  ignores: [
    "node_modules/**",
    "dist/**",
    ".wrangler/**",
    ".wrangler/**/*",
    "**/.wrangler/**",
    "**/.wrangler/**/*",
    "build/**",
    "coverage/**",
  ],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
});
