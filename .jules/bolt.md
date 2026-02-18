## 2024-05-22 - [Repeated Array Sorting in Hot Path]
**Learning:** `calculateTicksAndPoints` was sorting `Object.keys(tickDetails)` on every call, causing significant overhead in list rendering (22x slower benchmark).
**Action:** Use `WeakMap` to cache derived data (sorted keys) when the source object (Zustand store state) is referentially stable but expensive to process.
