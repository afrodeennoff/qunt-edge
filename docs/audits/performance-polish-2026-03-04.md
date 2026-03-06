# Performance + Polish Implementation Audit (2026-03-04)

## Scope
- Implement and verify the "Full Performance + Polish Plan (All Surfaces, Premium Monochrome)".
- Keep visual direction monochrome while improving hierarchy/surface polish and running performance gates.

## Implementation Changes

### Public / Marketing polish
- `app/[locale]/(home)/components/HomeContent.tsx`
  - Kept hero-shell structure with broader container (`max-w-[1360px]`) and lighter atmospheric layers.
  - Replaced fixed decorative layers with absolute layers to reduce full-viewport repaint pressure.
- `app/[locale]/(home)/components/Hero.tsx`
  - Converted hardcoded white/black surfaces to semantic token-based surfaces (`border-border`, `bg-card`, `bg-background`).
  - Kept existing motion but tightened card/CTA styling for better contrast hierarchy.
- `app/[locale]/(landing)/components/navbar.tsx`
  - Increased max container width (`1320px`) and refined active/hover/CTA visual hierarchy.
- `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
  - Standardized max content width to `1320px` and adjusted top spacing rhythm (`pt-20 sm:pt-28 lg:pt-32`).

### Dashboard / Admin / Teams polish + performance
- `components/sidebar/dashboard-sidebar.tsx`
  - Switched from broad `useData()` subscription to `useDashboardActions()` for narrower rerender scope.
- `components/ui/unified-sidebar.tsx`
  - Refined shell/header/footer borders/surfaces and active/hover row states with token-safe classes.
- `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
  - Added small scroll update guard (`lastScrollTopRef`) to reduce redundant state updates.
  - Polished card/header/footer/table shell surfaces and borders for consistency.
- `app/[locale]/admin/components/dashboard/admin-dashboard.tsx`
  - Merged user/payments fetch into single `Promise.all` pass to reduce staggered loading.
  - Updated loading skeleton and cards to semantic token-based surfaces.
- `app/[locale]/admin/page.tsx`
  - Kept server-safe `Suspense` boundary with improved loading fallback text style.
- `app/[locale]/teams/dashboard/page.tsx`
  - Refined container surface/border/shadow to align with premium monochrome shell.

### Global accessibility polish
- `app/globals.css`
  - Added global `:focus-visible` ring/offset baseline.

## Verification Evidence

### Static / Quality
- `npm run -s typecheck` -> pass (`0`).
- `npm run -s lint` -> pass with warnings only (`0` errors, many pre-existing warnings).
- `npm run -s build` -> pass (`0`).

### Performance Gates
- `npm run -s check:route-budgets` -> pass; dashboard family remains under 80 KB budget.
- `npm run -s analyze:bundle` -> pass; artifact updated.
- `PERF_BASE_URL=http://127.0.0.1:3001 npm run -s perf:headers` -> executed; non-strict mode completed.
- `PERF_BASE_URL=http://127.0.0.1:3001 npm run -s perf:baseline` -> executed; artifact updated.
- `PERF_BASE_URL=http://127.0.0.1:3001 npm run -s perf:lighthouse` -> executed, threshold failures captured.

### Route Sweep (local server)
- `/en` -> `200`
- `/en/pricing` -> `200`
- `/en/support` -> `200`
- `/en/propfirms` -> `200`
- `/en/dashboard` -> `307` (expected auth redirect)
- `/en/dashboard?tab=widgets` -> `307` (expected auth redirect)
- `/en/teams/dashboard` -> `307` (expected auth redirect)
- `/en/admin` -> `307` (expected auth redirect)

## Key Metrics Captured
- `docs/audits/artifacts/performance-baseline.json`
  - `/en`: ttfbP50 `~0.498s`, totalP50 `~0.499s`
  - `/en/pricing`: ttfbP50 `~0.500s`, totalP50 `~0.501s`
  - `/en/updates`: ttfbP50 `~0.474s`, totalP50 `~0.475s`
- `docs/audits/artifacts/lighthouse-summary.json`
  - `/en` mobile score `0.61`, desktop score `0.73`
  - `/en/pricing` mobile score `0.57`, desktop score `0.74`
  - Main budget failures: high TBT on both routes and both profiles.

## Residual Risks / Next Focus
1. Lighthouse TBT remains the biggest blocker (mobile + desktop) on `/en` and `/en/pricing`.
2. High lint warning volume is still repo-wide technical debt, though no new lint errors were introduced.
3. Further performance gains should focus on client-side execution cost reduction on home/pricing above-the-fold blocks.
