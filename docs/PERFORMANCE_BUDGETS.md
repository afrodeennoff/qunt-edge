# Performance Budgets

## Route Payload Budgets

- High-priority app routes (`/dashboard`, home): `<= 80 KB` client manifest.
- Default app/page routes: `<= 300 KB`.
- Enforcement command: `npm run check:route-budgets`.

## Core Web Vitals Budgets

- LCP: `< 2.5s`
- FID/INP proxy target: `< 100ms` interaction delay
- CLS: `< 0.1`

## Interactivity Budgets

- TBT: `< 200ms`
- TTI: `< 3.0s` on core landing routes
- Interaction response: `< 500ms` under typical user actions

## Build and Bundle Budgets

- Bundle manifest audit: `npm run analyze:bundle`
- Keep dashboard-family app-route client manifests below `80 KB`.
- Investigate and block merges when dashboard-family routes exceed `60 KB` sustained trend.

## Operational Policy

- Every performance-related change must include:
  - Updated `docs/audits/artifacts/bundle-summary.json`
  - `npm run check:route-budgets` result
  - Lighthouse artifact for affected public route(s)
