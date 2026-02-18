## 2024-05-22 - [Repeated Array Sorting in Hot Path]
**Learning:** `calculateTicksAndPoints` was sorting `Object.keys(tickDetails)` on every call, causing significant overhead in list rendering (22x slower benchmark).
**Action:** Use `WeakMap` to cache derived data (sorted keys) when the source object (Zustand store state) is referentially stable but expensive to process.
## 2026-02-18 - [TypeScript Compilation Fixes]
**Learning:** CI environment revealed strict type errors in `context/data-provider.tsx` that were missed during local exploration. Specifically, accessing non-existent `price` property on `Trade` type and using undefined `cachedTrades` variable.
**Action:** Fixed by replacing `price` with `entryPrice` (valid property) and properly declaring/awaiting `cachedTrades` from `getTradesCache`.
## 2026-02-18 - [Fix ReferenceError in Tests]
**Learning:** Node.js test environments (Vitest) do not have  defined by default. Accessing it directly to mock  status throws a .
**Action:** Used  to ensure the object exists before patching properties in tests.
## 2026-02-18 - [Fix ReferenceError in Tests]
**Learning:** Node.js test environments (Vitest) do not have navigator defined by default. Accessing it directly to mock onLine status throws a ReferenceError.
**Action:** Used Object.defineProperty(global, 'navigator', ...) to ensure the object exists before patching properties in tests.
