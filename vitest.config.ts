import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "**/__tests__/**/*.test.ts",
      "**/*.test.ts",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "out",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
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
