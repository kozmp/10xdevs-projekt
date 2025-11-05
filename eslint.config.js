import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  rules: {
    // Enforce structured logging - only warn and error allowed in production code
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
  },
});

const jsxA11yConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
  },
});

// Test files config - relaxed rules
const testConfig = tseslint.config({
  files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-console": "off",
  },
});

// Setup and config files - allow Node.js globals and console
const setupConfig = tseslint.config({
  files: ["check-env.js", "**/global-setup.ts", "**/global-teardown.ts", "**/*.config.{js,ts}"],
  languageOptions: {
    globals: {
      process: true,
      console: true,
      __dirname: true,
      __filename: true,
    },
  },
  rules: {
    "no-console": "off",
    "no-undef": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
});

// API routes - relaxed rules for unused params and any types
const apiConfig = tseslint.config({
  files: ["src/pages/api/**/*.ts"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
  },
});

// Service/lib files - allow any for external API types
const serviceConfig = tseslint.config({
  files: ["src/lib/**/*.ts", "src/db/**/*.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
  },
});

// Types and schemas - relaxed namespace rules
const typesConfig = tseslint.config({
  files: ["src/types.ts", "src/**/*.types.ts"],
  rules: {
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
});

// React components - relax react-compiler for now
const componentConfig = tseslint.config({
  files: ["src/components/**/*.{ts,tsx}"],
  rules: {
    "react-compiler/react-compiler": "warn",
  },
});

// Astro pages - disable prettier for now (has parsing issues)
const astroConfig = tseslint.config({
  files: ["src/pages/**/*.astro"],
  rules: {
    "prettier/prettier": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
});

// Test setup - allow any and empty interfaces for mocking
const testSetupConfig = tseslint.config({
  files: ["src/test/setup.ts", "**/*.setup.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-object-type": "off",
  },
});

// Logger utility - must use console methods directly
const loggerConfig = tseslint.config({
  files: ["src/lib/utils/logger.ts"],
  rules: {
    "no-console": "off",
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      "src/pages/forgot-password.astro",
      "src/pages/login.astro",
      "src/pages/signup.astro",
      "src/pages/demo-editor.astro",
    ],
  },
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  eslintPluginAstro.configs["flat/recommended"],
  eslintPluginPrettier,
  testConfig,
  setupConfig,
  apiConfig,
  serviceConfig,
  typesConfig,
  componentConfig,
  astroConfig,
  testSetupConfig,
  loggerConfig
);
