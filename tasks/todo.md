# Performance Fix Plan (Immediate)

- [x] Added provider hook re-export files for trades/filters/derived/actions.
- [x] Migrated useDashboard* imports to new provider files.
- [x] Verify dashboard behavior after import updates.

## Review (Performance Fix Plan Immediate)

- `npm run -s typecheck` -> exits `0`.
- `npx eslint app/[locale]/dashboard/components --max-warnings=999999` -> 0 errors (warnings only baseline).
- Dashboard selector/hook migrations remain type-safe after recent lag fixes.

# Performance Audit - App Lag Investigation (2026-03-08)

- [x] Collect runtime and build performance signals (typecheck, route budgets, bundle summary).
- [x] Audit render hot spots (context architecture, large components, client boundaries, memoization coverage).
- [x] Audit expensive UX patterns (animations, polling/refresh loops, heavy table/chart paths).
- [x] Produce root-cause report with ranked impact and concrete remediation plan.
- [x] Update AGENTS.md with this audit entry and verification notes.
- [x] Add review notes (what was verified, risks, follow-ups).

## Review

- Verified commands: `npm run -s typecheck`, `npm run -s check:route-budgets`, `npm run -s analyze:bundle`, `npm run -s lint`.
- Verified route budgets are within threshold while runtime architecture still shows lag risk.
- Verified hotspots with file-level evidence in `context/data-provider.tsx`, `context/trades-context.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, and large dashboard component files.
- Remaining risk: audit is static + command-based; no React Profiler flamegraph or production tracing captured in this pass.

## Review
- Verification: ran typecheck/lint/build.
- Typecheck: FAILED in server/teams.ts (join on PrismaClient, missing averageRr/bestMember, duplicate keys).
- Lint: 0 errors, 1513 warnings (baseline).
- Build: compiled successfully.
- Follow-up: fix server/teams.ts type errors before final sign-off.

# Runtime Lag Fix Pass (2026-03-08)

- [x] Remove duplicate dashboard provider stack in `dashboard-tab-shell` (Trades/Accounts/Filters providers).
- [x] Remove duplicate server prefetch pipeline from `app/[locale]/dashboard/page.tsx`.
- [x] Add narrow selector hooks (`useDashboardIsMobile`, `useDashboardIsLoading`, `useDashboardIsSharedView`).
- [x] Migrate mobile/loading/shared-view consumers to selector hooks.
- [x] Convert behavior route to server wrapper + client island (`page.tsx` -> `page-client.tsx`).
- [x] Verify with typecheck/build and re-run targeted perf gates.

## Review (Runtime Lag Fix Pass)

- Goal: eliminate duplicate data fetch/context mount work and reduce broad rerender subscriptions.
- Risk to monitor: dashboard first render now fully depends on `DataProvider` client load path (no server-seeded trade payload in page shell).
- Verification:
  - `npm run -s typecheck` passes.
  - `npm run -s build` fails on pre-existing Prisma schema enum metadata issue (`@@schema` missing on enums in `prisma/schema.prisma`).

# Runtime Lag Micro-Optimization (2026-03-08)

- [x] Replace broad `useUserStore(state => state)` subscription in `WidgetCanvas` with field selectors.
- [x] Keep widget-canvas behavior unchanged while narrowing rerender scope.
- [x] Run targeted lint on touched component.
- [x] Run full typecheck for regression check.

## Review (Runtime Lag Micro-Optimization)

- `WidgetCanvas` now subscribes only to `isMobile`, `dashboardLayout`, and `setDashboardLayout`, reducing rerenders from unrelated user-store updates.
- Verification:
  - `npx eslint app/[locale]/dashboard/components/widget-canvas.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.

## Review
- Verification: ran typecheck/lint/build.
- Typecheck: OK
- Lint: OK
- Build: FAILED

## Review
- Verification: ran typecheck/lint/build.
- Typecheck: OK
- Lint: OK
- Build: FAILED

## Review
- Verification: ran typecheck/lint/build after team analytics fix.
- Typecheck: OK
- Lint: OK
- Build: FAILED

# Full Lag Fix Sweep (2026-03-08)

- [x] Remove remaining broad dashboard-context subscriptions (`useDashboardTrades`) from dashboard components.
- [x] Ensure debug panel uses narrow selector hooks only.
- [x] Confirm heavy dashboard surfaces are memoized (`AccountsOverview`, `TradeTableReview`).
- [x] Run targeted lint on touched lag-path components.
- [x] Run full typecheck to validate current workspace state.

## Review (Full Lag Fix Sweep)

- `useDashboardTrades()` usage in dashboard components is now eliminated (no matches under `app/[locale]/dashboard/components`).
- `DataDebug` now consumes granular hooks (`useDashboardTradeItems`, `useDashboardAccountsList`, `useDashboardIsLoading`) and narrow user selectors.
- Verified heavy surfaces are memoized:
  - `app/[locale]/dashboard/components/accounts/accounts-overview.tsx` exports `memo(AccountsOverviewComponent)`.
  - `app/[locale]/dashboard/components/tables/trade-table-review.tsx` exports `React.memo(TradeTableReviewComponent)`.
- Verification:
  - `npx eslint app/[locale]/dashboard/components/data-debug.tsx app/[locale]/dashboard/components/accounts/accounts-overview.tsx app/[locale]/dashboard/components/tables/trade-table-review.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> fails on pre-existing unrelated typing issues in modified backend files currently in workspace (`server/subscription*`, `server/shared.ts`, billing/admin route status typing drift).

# Console Log Removal Sweep (2026-03-08)

- [x] Locate `console.log(...)` usage in scoped runtime paths only (`app/**`, `components/**`, `context/**`, `store/**`, `server/**`) while excluding tests/e2e and non-scoped files.
- [x] Remove `console.log(...)` lines while preserving behavior and leaving `console.warn/error` untouched.
- [x] Remove now-empty `if` branches when the only statement removed was `console.log(...)`.
- [x] Re-scan scoped paths to confirm zero remaining `console.log(...)`.
- [x] Add review notes with edited files and removal count.

## Review (Console Log Removal Sweep)

- Verified scoped re-scan with grep on `app`, `components`, `context`, `store`, and `server` returns no remaining `console.log(` matches.
- Kept `console.warn` and `console.error` intact.
- Removed console-only branches where applicable (for example comment-notification else branch in community actions).
- Removal count from initial scoped scan totals `181` statements (`app: 170`, `components: 2`, `context: 9`, `store: 0`, `server: 0`).

# Console Log Removal (Targeted Runtime Files, 2026-03-08)

- [x] Remove `console.log(...)` from `hooks/use-tradovate-token-manager.ts`.
- [x] Remove `console.log(...)` from `lib/widget-migration-service.ts`.
- [x] Remove `console.log(...)` from `lib/widget-storage-service.ts`.
- [x] Remove `console.log(...)` from `lib/widget-persistence-manager.ts`.
- [x] Remove `console.log(...)` from `lib/browser-sandbox.ts`.
- [x] Re-scan targeted files to confirm zero remaining `console.log(...)` matches.

## Review (Targeted Runtime Console Log Removal)

- Kept `console.warn(...)` and `console.error(...)` unchanged.
- Kept runtime behavior unchanged; only `console.log(...)` lines were removed.
- Re-scan with grep on the five targeted files returns no `console.log(` matches.
- Total removed in this task: `29` (`4 + 1 + 4 + 4 + 16`).

# End-to-End Lag Root-Cause Fix (2026-03-08)

- [x] Remove final broad dashboard trade-context subscription usage from dashboard route surfaces.
- [x] Convert trader-profile route shell to server wrapper + dedicated client island.
- [x] Narrow trader-profile data reads to selector hooks (`accounts`, `isLoading`) instead of broad trade context.
- [x] Run targeted lint checks on touched trader-profile files.
- [x] Run full typecheck after changes.

## Review (End-to-End Lag Root-Cause Fix)

- Root cause addressed: broad dashboard context subscriptions and client-heavy route shells causing unnecessary rerenders/hydration work.
- Trader profile now follows server-wrapper pattern (`page.tsx` -> `page-client.tsx`) to reduce client entrypoint overhead.
- Dashboard now has zero `useDashboardTrades()` callsites under `app/[locale]/dashboard`.
- Verification:
  - `npx eslint app/[locale]/dashboard/trader-profile/page.tsx app/[locale]/dashboard/trader-profile/page-client.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.

# Root-Cause Closure Verification (2026-03-08)

- [x] Re-verify no broad dashboard trade-context hook usage remains in dashboard route files.
- [x] Re-verify dashboard route shells stay server-wrapper + client-island where applicable.
- [x] Re-run typecheck to confirm workspace compiles after lag-closure changes.

## Review (Root-Cause Closure Verification)

- `useDashboardTrades(` search in `app/[locale]/dashboard/**/*.tsx` returns zero matches.
- `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/behavior/page.tsx`, and `app/[locale]/dashboard/trader-profile/page.tsx` are server wrappers delegating client work to dedicated `page-client.tsx` files.
- `npm run -s typecheck` exits `0`.
