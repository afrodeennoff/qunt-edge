## 2026-02-13 - [Navigator/Window Access in Tests]
**Vulnerability:** Accessing browser globals like `navigator` or `window` in Node.js test environments causes ReferenceErrors, breaking CI.
**Learning:** Checking for `typeof navigator === 'undefined'` or `typeof window === 'undefined'` is insufficient if the code accesses properties directly without a guard.
**Prevention:** Always mock browser globals on `global` (e.g., `global.navigator`) or use strict `typeof` checks before accessing them in isomorphic code or tests.
