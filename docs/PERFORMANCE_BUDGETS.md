# Performance Budgets

## Route Payload Budgets

- Home route (`/[locale]/(home)`): `<= 80 KB` app client-reference manifest.
- Dashboard-family routes (`/[locale]/dashboard*`): `<= 80 KB` app client-reference manifest.
- Default app/page routes: `<= 300 KB` combined client payload.
- Enforcement command: `npm run check:route-budgets`.

## Core Web Vitals Budgets

- Desktop LCP (`/en`): `< 1.8s`
- Mobile simulated LCP (`/en`): `< 3.5s`
- FID/INP proxy target: `< 100ms` interaction delay
- CLS: `< 0.1`

## Interactivity Budgets

- Desktop TBT (`/en`): `< 200ms`
- Mobile simulated TBT (`/en`): `< 1200ms`
- Dashboard desktop initial TBT: `< 300ms`
- TTI: `< 3.0s` on core landing routes
- Interaction response: `< 500ms` under typical user actions

## Build and Bundle Budgets

- Bundle manifest audit: `npm run analyze:bundle`
- Keep dashboard-family app-route client manifests below `80 KB`.
- Investigate and block merges when dashboard-family routes exceed `60 KB` sustained trend.

## Dashboard State Budgets

- High-churn dashboard surfaces (`filters`, `statistics`, `tables`) must use slice hooks, not umbrella `useData()`.
- Budget target in scoped surfaces:
  - `useData()` usages: `0`
  - Use `useDashboardFilters/useDashboardStats/useDashboardActions/useDashboardTrades` instead.

## Cache and Navigation Budgets

- Private documents (`dashboard`, `authentication`, `admin`) must send:
  - `Cache-Control: no-store, max-age=0, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`
- Public documents (`/en`, pricing, updates, faq, docs, terms, privacy, etc.) must send:
  - `Cache-Control: public, max-age=0, must-revalidate`
- Service worker is opt-in only:
  - `NEXT_PUBLIC_SW_ENABLED` must be explicitly set to `"true"` to register `/sw.js`.
- Sidebar dashboard navigation should avoid automatic prefetch churn:
  - keep sidebar route links `prefetch={false}` unless a measured experiment proves benefit.
- Enable cache diagnostics only when needed:
  - `NEXT_PUBLIC_CACHE_DEBUG="true"` logs route + SW lifecycle events in browser console.

## Operational Policy

- Every performance-related change must include:
  - Updated `docs/audits/artifacts/bundle-summary.json`
  - `npm run check:route-budgets` result
  - `npm run perf:headers` result
  - `npm run perf:lighthouse` artifacts for affected route(s)
