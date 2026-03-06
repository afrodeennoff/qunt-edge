# One-Shot Production Remediation (2026-03-06)

## Summary
Implemented a one-train remediation pass covering cache/auth correctness, edge runtime resilience, dashboard rendering cost reduction, and widget typography/color unification.

## What Changed
- Middleware route classification is now explicit in `proxy.ts` (`public-api`, `private-api`, `public-document`, `private-document`, `embed`, `static-asset`).
- Private route/API/auth redirect cache contract is centralized and enforced with no-store policy headers.
- Middleware no longer hard-crashes on strict env-policy violations at runtime; it logs and continues so the app does not return global 500s.
- Env parsing in `lib/env.ts` now treats empty-string env vars as undefined to prevent optional URL/token parse crashes in production runtime checks.
- Dashboard shell background effects were simplified to reduce paint/compositing overhead.
- Server user-data path replaced noisy console logging with structured logger calls and added cached dashboard layout reads with compatible tag invalidation (`dashboard-layout-*`, `dashboard-*`).
- KPI/stat card typography alignment was normalized across major dashboard compact/standard stat cards.
- Global transition cost reduced by removing universal transition rules and scoping transitions to interactive elements only.

## Verification Results
- `npm run -s typecheck` -> pass
- `npm run -s lint` -> pass (warnings only, no errors)
- `npm run -s build` -> pass
- `npm run -s check:route-budgets` -> pass
- `npm run -s analyze:bundle` -> pass
- `PERF_BASE_URL=http://127.0.0.1:3001 PERF_HEADER_STRICT=true npm run -s perf:headers` -> pass
- `PERF_BASE_URL=http://127.0.0.1:3001 npm run -s perf:baseline` -> pass and artifact refreshed
- `PERF_BASE_URL=http://127.0.0.1:3001 npm run -s perf:lighthouse` -> fails thresholds (TBT/LCP/score on `/en` and `/en/pricing`)

## Artifacts
- `docs/audits/artifacts/bundle-summary.json`
- `docs/audits/artifacts/performance-baseline.json`
- `docs/audits/artifacts/lighthouse-summary.json`

## Residual Risk
- Lighthouse thresholds still fail for public routes due high main-thread blocking time (`TBT`) and score deltas.
- This release materially hardens correctness/cache policy and removes runtime middleware crash paths, but public-route JS execution cost remains the next blocker for full perf SLA compliance.
