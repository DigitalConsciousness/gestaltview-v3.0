/**
 * vitest.config.ts
 * ================
 * Vitest configuration for gestaltview-v2.
 * Covers unit tests in tests/ and any *.test.ts files in the project.
 *
 * Run all tests:   pnpm vitest run
 * Watch mode:      pnpm vitest
 * Single file:     pnpm vitest run tests/gate-compatibility.test.ts
 */
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Use Node environment for server-side and shared module tests
    environment: "node",

    // Include all test files in the tests/ directory and any *.test.ts files
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts",
      "**/*.test.ts",
      "**/*.spec.ts",
    ],

    // Exclude node_modules, build output, client-side UI component tests (require jsdom),
    // and isolated example packages that have their own deps / live API keys.
    exclude: [
      "node_modules/**",
      "dist/**",
      ".vercel/**",
      ".perplexity/**",
      "client/src/**/*.test.tsx",
      "client/src/**/*.spec.tsx",
      // Playwright E2E specs are run by Playwright, not Vitest.
      "tests/e2e/**",
      // llm-as-judge example has its own package.json and requires a live OpenAI key
      ".agents/skills/examples/**",
      // agent_trainer assistant test makes live HTTP calls — integration only
      "agent_trainer/**/tests/api/assistant.test.ts",
    ],

    // Path aliases to match the project's tsconfig paths
    alias: {
      "@shared": resolve(__dirname, "shared"),
      "@": resolve(__dirname, "client/src"),
    },

    // Globals for describe/it/expect without imports
    globals: false,

    // Reporter
    reporter: "verbose",

    // Coverage (optional, run with --coverage flag)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "config/**/*.ts",
        "shared/**/*.ts",
        "server/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "node_modules/**",
        "dist/**",
      ],
    },
  },

  resolve: {
    alias: {
      "@shared": resolve(__dirname, "shared"),
      "@": resolve(__dirname, "client/src"),
    },
  },
});
