# Performance Execution Plan

## Goal
Achieve Vercel-style responsiveness without removing existing features or weakening security.

## Success Criteria
1. Desktop Lighthouse Performance >= 90 on `/en`.
2. Mobile simulated Lighthouse Performance >= 75 on `/en`.
3. Desktop TBT < 200ms on `/en`.
4. Mobile simulated TBT < 1200ms on `/en`.
5. Route budgets pass (`npm run check:route-budgets`).
6. No auth/privacy cache leaks for private routes.

## Route Policy
1. Public routes: cacheable HTML + ISR/SSG where possible.
2. Private/auth routes: `private, no-store`.
3. Static assets: immutable long cache.
4. Public read APIs: short SWR cache only where explicitly allowlisted.
5. Private/mutation APIs: no-store.

## Delivery Phases
1. Baseline lock and artifact capture.
2. Cache policy split in middleware.
3. Render-mode matrix updates for public routes.
4. Main-thread/hydration reduction in high-traffic routes.
5. Budget + Lighthouse CI governance.
6. Weekly observability reporting.

## Verification Commands
1. `npm run typecheck`
2. `npm run build`
3. `npm run check:route-budgets`
4. `npm run analyze:bundle`
5. `npm run perf:headers`
6. `npm run perf:lighthouse`
7. `npm run perf:baseline`

## Rollout Safety
1. Keep private route no-store policy mandatory.
2. Canary and monitor error rates + freshness incidents.
3. Roll back cache policy quickly if stale-content incidents appear.
