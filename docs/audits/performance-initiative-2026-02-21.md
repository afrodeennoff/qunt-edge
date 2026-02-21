# Performance Optimization Initiative - 2026-02-21

## Scope and Tooling

- `Chrome/Lighthouse`: executed with `npx lighthouse` against production server (`next start`) on:
  - `/en`
  - `/en/updates`
- `Bundle and route budgets`:
  - `npm run analyze:bundle`
  - `npm run check:route-budgets`
- `Type safety/regression guard`:
  - `npm run typecheck`
  - `npm run build`
- `Static code audit` for render churn, cleanup, and lazy-loading opportunities.

## Critical Findings (Severity + Impact)

1. **P1 - Main-thread blocking remains high on production pages**
   - Evidence:
     - `/en`: `TBT=1062ms`, `TTI=6494ms`
     - `/en/updates`: `TBT=2232ms`, `TTI=6467ms`
   - Impact: User interactions can exceed the `<500ms` response objective under throttled conditions.

2. **P1 - LCP still above Core Web Vitals target on home**
   - Evidence:
     - `/en`: `LCP=5158ms` (target `<2500ms`)
   - Impact: First meaningful visual completion is slower than required for CWV compliance.

3. **P2 - Dashboard shared client manifest was heavier than necessary**
   - Root cause: Always-on overlay modules in layout were part of dashboard hydration path.
   - Fix implemented (see below) reduced dashboard route client manifest size.

## Implemented Optimizations

### 1) Client-only lazy overlays for dashboard
- **What changed:** Introduced a dedicated client overlay wrapper that lazy-loads heavy non-critical dashboard overlays.
- **Files:**
  - `app/[locale]/dashboard/components/dashboard-client-overlays.tsx`
  - `app/[locale]/dashboard/layout.tsx`
- **Why:** Keeps dashboard core route shell lighter and defers non-critical UI overlays until client runtime.

### 2) Bundle artifact refresh and budget enforcement
- **What changed:** Regenerated bundle summary and validated app-route budgets on fresh production build artifacts.
- **Files:**
  - `docs/audits/artifacts/bundle-summary.json`
- **Why:** Provides current measurable payload budgets and prevents regressions in shared dashboard route chunks.

## Before/After Metrics

### A) Dashboard client-manifest payload (verifiable Git artifact diff)
- Source:
  - Before: `git show HEAD:docs/audits/artifacts/bundle-summary.json`
  - After: `docs/audits/artifacts/bundle-summary.json`

| Route | Before | After | Delta |
|---|---:|---:|---:|
| `/[locale]/dashboard` | 48.34 KB | 45.84 KB | -2.50 KB |
| `/[locale]/dashboard/behavior` | 49.85 KB | 47.35 KB | -2.50 KB |
| `/[locale]/dashboard/data` | 49.63 KB | 47.12 KB | -2.51 KB |
| `/[locale]/dashboard/strategies` | 49.55 KB | 47.05 KB | -2.50 KB |
| `/[locale]/dashboard/trader-profile` | 49.14 KB | 46.64 KB | -2.50 KB |
| `/[locale]/dashboard/settings` | 49.13 KB | 46.62 KB | -2.51 KB |
| `/[locale]/dashboard/billing` | 48.93 KB | 46.43 KB | -2.50 KB |
| `/[locale]/dashboard/import` | 48.88 KB | 46.38 KB | -2.50 KB |
| `/[locale]/dashboard/reports` | 48.84 KB | 46.34 KB | -2.50 KB |

Average reduction across dashboard family routes: **-2.50 KB (-5.09%)**

### B) Route budget gate
- Command: `npm run check:route-budgets`
- Result: **PASS** (all app routes within configured thresholds)

### C) Lighthouse (production server)
- Artifacts:
  - `docs/audits/artifacts/lighthouse-home-after.html`
  - `docs/audits/artifacts/lighthouse-updates-after.html`
  - `/tmp/lighthouse-home-prod-after.json`
  - `/tmp/lighthouse-updates-prod-after.json`

| Route | Perf Score | FCP | LCP | TBT | CLS | TTI |
|---|---:|---:|---:|---:|---:|---:|
| `/en` | 58 | 1.36s | 5.16s | 1.06s | 0.021 | 6.49s |
| `/en/updates` | 66 | 1.36s | 3.02s | 2.23s | 0.000 | 6.47s |

## Performance Budget (Current Working Budget)

- Dashboard app-route client manifest: **<= 80 KB** (currently ~46-47 KB)
- Landing app-route client manifest: **<= 300 KB**
- Lighthouse performance score target: **>= 90** (currently not met)
- LCP target: **< 2.5s** (currently not met on `/en`)
- TBT target: **< 200ms** (currently not met)
- CLS target: **< 0.1** (currently met)

## Known Constraints During Audit

- React DevTools Profiler and Chrome Performance panel traces were not runnable in this headless/sandboxed environment.
- Equivalent CLI-safe profiling was executed via Lighthouse plus bundle and route-manifest analysis.

## Validation Log

- `npm run typecheck` -> `0`
- `npm run build` -> `0`
- `npm run check:route-budgets` -> `0`
- `npm run analyze:bundle` -> `0`

## Changelog

- `v2026.02.21-perf-initiative.1`
  - Added client-only lazy dashboard overlays.
  - Reduced shared dashboard client-manifest payload by ~5%.
  - Regenerated and documented current performance artifacts and budgets.
