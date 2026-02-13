## 2026-02-13 - [TypeScript Compiler Directives in Tests]
**Vulnerability:** Unused `@ts-expect-error` directives in test files cause compilation failures in strict TypeScript environments, breaking CI.
**Learning:** Type-checking logic in tests (e.g., verifying mocks or conditional logic) can be brittle. If a condition (like `window` existence) makes a block unreachable or valid in one environment but not another, static directives may fail.
**Prevention:** Avoid suppressing type errors unless verifying a specific type failure. For environment-specific logic, ensure types (like `global.window`) are correctly defined in the environment setup or use safe access patterns without needing suppression.
