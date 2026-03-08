import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "**/__tests__/**/*.test.ts",
      "**/__tests__/**/*.test.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "out",
      "components/sidebar/__tests__/**",
      "tests/performance/performance-regression.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 2,
        functions: 18,
        statements: 2,
        branches: 40,
      },
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
        "out/",
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
