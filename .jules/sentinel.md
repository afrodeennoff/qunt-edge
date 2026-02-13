## 2026-02-13 - [ESM/TypeScript Build Scripts]
**Vulnerability:** Using `ts-node` directly for build scripts in an ESM project (`"type": "module"`) can fail with `ERR_UNKNOWN_FILE_EXTENSION` for `.ts` files depending on configuration.
**Learning:** `ts-node` configuration for pure ESM is complex. `tsx` (TypeScript Execute) is a robust, zero-config alternative for running TypeScript scripts in ESM environments.
**Prevention:** Prefer `tsx` over `ts-node` for running one-off scripts (like database seeds, route generation) in Next.js/ESM codebases to avoid module resolution headaches.
