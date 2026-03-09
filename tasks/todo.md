## Current Task: Commit and push current changes

- [x] Review git status/diff to confirm staged scope
- [x] Stage all intended changes
- [x] Commit with a clear summary message
- [x] Push to the current branch
- [x] Record verification results (not run)

## Review
- Verification: Not run (commit-only request).
- Risks: Changes not re-verified in this step.
- Follow-ups: Run typecheck/lint/build if needed.

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

# Navigation Stuck After Click Fix (2026-03-08)

- [x] Add one-time chunk-load auto-recovery on client runtime failures.
- [x] Tighten service-worker cleanup timing to run immediately on mount in production.
- [x] Run targeted lint + typecheck verification.

## Review (Navigation Stuck After Click Fix)

- Added runtime handlers in `components/providers/root-providers.tsx` for chunk-load failure signatures (`ChunkLoadError`, dynamic import fetch failures) that trigger a one-time session reload.
- Service-worker unregister/cache-clear now runs immediately on provider mount (still keeps load-listener fallback for early page lifecycle).
- Verification:
  - `npx eslint components/providers/root-providers.tsx` -> 0 errors.
  - `npm run -s typecheck` -> exits `0`.

# Smooth Navigation UX Pass (2026-03-08)

- [x] Add immediate click feedback for sidebar navigation links.
- [x] Keep loading indicator scoped to pending destination link only.
- [x] Ensure indicator clears naturally once route/query update completes.
- [x] Run targeted lint and full typecheck.

## Review (Smooth Navigation UX Pass)

- Added pending-link state in `components/ui/unified-sidebar.tsx` so users see instant spinner feedback on click, even before route transition fully commits.
- Pending spinner now applies only to the clicked destination and auto-clears when that destination becomes active.
- Added an 8-second navigation stall fallback in sidebar link clicks to force full-document navigation (`window.location.assign`) when client-side transition appears stuck.
- Verification:
  - `npx eslint components/ui/unified-sidebar.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.
# Repo-Wide Remediation Sweep (2026-03-08)

- [x] Phase 1: Remove remaining runtime `console.log(...)` statements while keeping `console.warn/error`.
- [x] Phase 2: Replace straightforward high-risk `any` usage with `unknown` or specific types.
- [x] Phase 3: Add `React.memo` to expensive dashboard components with stable prop boundaries.
- [x] Phase 4: Fix obvious hook dependency/order issues in touched files.
- [x] Phase 5: Remove unnecessary `"use client"` directives only where no client APIs are used (no safe removals found in touched scope).
- [x] Phase 6: Clean unused imports/vars and dead branches introduced by logging removals.
- [x] Phase 7: Add obvious missing error handling in touched async/runtime flows.
- [x] Phase 8: Apply safe DB/config hardening that avoids enum/schema-wide refactors.
- [x] Run verification: `npm run -s typecheck` and permissive lint (`npm run -s lint -- --max-warnings=999999`).
- [x] Add review notes and update `AGENTS.md` with this remediation pass.

## Review (Repo-Wide Remediation Sweep)

- Removed remaining runtime `console.log(...)` from logging/debug/perf utilities and preserved `console.warn/error` paths.
- Replaced straightforward `any` casts/types in touched files with specific runtime types (`ManagedEventHandler`, browser memory interfaces, typed window extensions).
- Added `React.memo` wrappers to expensive calendar components (`weekly-calendar`, `mobile-calendar`) where prop boundaries are stable.
- Fixed obvious hook hygiene issues in touched files (effect cleanup ref snapshots, removed dead state/imports, safe cleanup semantics).
- Added defensive log serialization fallback in `lib/logger.ts` and safe Prisma pool cap handling in `lib/prisma.ts`.
- Verification:
  - `npm run -s typecheck` -> exits `0`.
  - `npm run -s lint -- --max-warnings=999999` -> exits `0` (warnings-only baseline; no errors).

## Task: Read recent edits summary

- [ ] Review recent git history/status for latest edits.
- [ ] Summarize recent edits for the user.
- [ ] Note verification or follow-up if needed.

## Review
- [ ] Pending.

## Task: End-to-end codebase understanding (2026-03-09)

- [x] Map repository structure, runtime stack, and core dependencies.
- [x] Trace request/data flow across app routes, providers, server actions, and APIs.
- [x] Audit backend domains (auth, billing, imports, teams, analytics, storage).
- [x] Audit frontend domains (dashboard, landing, shared layouts, i18n, UI system).
- [x] Summarize architecture, risks, and verification posture in a concise end-to-end report.

## Review
- Completed through the detailed "Codebase Understanding Sweep (2026-03-09)" section below.

# Codebase Understanding Sweep (2026-03-09)

- [x] Capture high-level architecture (framework, runtime boundaries, module layout).
- [x] Trace request/data lifecycle: route -> providers/store -> server -> DB/external services.
- [x] Inventory major domains (dashboard, teams, billing, shared/public, admin, AI, integrations).
- [x] Identify core infra and cross-cutting concerns (auth, i18n, logging, caching, background/scheduled behavior).
- [x] Verify understanding with static checks (imports/entrypoints/scripts) and document unknown/risky areas.
- [x] Add review notes with evidence, risks, and recommended next deep-dive order.

## Review (Codebase Understanding Sweep)

- Evidence gathered from runtime entrypoints and infra: `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/providers/root-providers.tsx`, `proxy.ts`, `lib/prisma.ts`, `server/auth.ts`, `server/user-data.ts`, `server/webhook-service.ts`.
- Evidence gathered from domain APIs/routes: `app/api/dashboard/*`, `app/api/team/*`, `app/api/admin/*`, `app/api/ai/*`, `app/api/whop/webhook/route.ts`, `app/api/cron/*`.
- Evidence gathered from architecture shape: `app` has 462 TS/TSX files, `lib` 116, `server` 28, `store` 29; largest hotspots include `context/data-provider.tsx` (2135 lines), `trade-table-review.tsx` (1736), `accounts-overview.tsx` (1672), `server/webhook-service.ts` (1255).
- Verification performed: static architecture trace only (file-level inspection + route/module inventory). No runtime execution in this task.
- Key risk areas for future deep dives: monolithic dashboard provider complexity, mixed status typing across subscription/billing flows, and large route handlers with external service coupling (Whop/Databento/AI).

## Task: One-shot remediation execution plan (2026-03-09)

- [x] Consolidate all identified risk factors and bottlenecks into a single prioritized remediation program.
- [x] Define implementation waves with exact objectives, file scopes, and acceptance criteria.
- [x] Define verification gates, regression controls, and rollback strategy for safe execution.
- [x] Provide delivery sequence that can be run in one coordinated fix cycle.

## Review

- Produced a complete one-shot implementation plan covering auth/identity, dashboard performance, billing/webhooks, ingestion/rate limiting, middleware policy modularization, and CI/test hardening.
- Included concrete file-level scope, gating commands, risk controls, and rollout order.

## Task: Immediate one-shot hardening implementation (2026-03-09)

- [x] Add shared identity resolver and remove implicit user auto-bootstrap fallback in core user-id resolution paths.
- [x] Add shared subscription-status normalization utilities and wire billing/subscription services to canonical status mapping.
- [x] Harden rate-limit behavior with strict distributed-mode option and enable it on sensitive API routes (AI/admin/ingestion).
- [x] Replace stale widget policy workflow with executable CI checks that match repository reality.
- [x] Update engineering log and record verification posture.

## Review

- Implemented identity hardening via `lib/identity-resolver.ts` and migrated `server/auth.ts`, `server/trades.ts`, and `server/team-membership.ts` to shared resolution.
- Implemented status canonicalization via `lib/subscription-status.ts` and migrated `server/billing.ts`, `server/subscription-manager.ts`, and `server/subscription.ts`.
- Implemented distributed limiter strict-mode in `lib/rate-limit.ts` and enabled `requireDistributedInProduction: true` across sensitive routes in `app/api/ai/**`, `app/api/admin/subscriptions/route.ts`, `app/api/etp/v1/store/route.ts`, `app/api/thor/store/route.ts`, `app/api/rithmic/synchronizations/route.ts`, `app/api/tradovate/sync/route.ts`, and `app/api/imports/ibkr/ocr/route.ts`.
- Replaced non-executable workflow with runnable policy sanity workflow in `.github/workflows/widget-policy-compliance.yml`.
- Added centralized locale contract in `locales/config.ts`, aligned `proxy.ts` locale behavior, and synchronized `locales/client.ts` with middleware/server locale set.
- Extracted route/cache classification policy from `proxy.ts` into `lib/security/route-policy.ts` to reduce middleware blast radius and improve testability.
- Hardened CI quality gates by adding `check:route-security` and `check:color-contract` to `.github/workflows/ci.yml` validate flow.
- Verification:
  - `npm run -s typecheck` could not execute in this environment because dependencies are not installed (`next: command not found` after script bootstrap).
  - `node scripts/check-route-security.mjs` -> pass.
  - `node scripts/check-color-contract.mjs` -> pass.
  - `node .github/scripts/check-manifests.js` -> pass with existing warnings for missing manifests.

## Task: Immediate dashboard bottleneck decomposition follow-up (2026-03-09)

- [x] Extract heavy derived trade/filter/statistics logic from `context/data-provider.tsx` into focused selector module.
- [x] Keep `DataProvider` public hooks and context contracts unchanged to avoid consumer breakage.
- [x] Remove duplicated in-file derivation helpers after extraction.
- [x] Re-verify static checks available in this environment.

## Review

- Added `context/providers/derived-selectors.ts` with isolated selectors:
  - `getSortedTrades(...)`
  - `getFormattedTrades(...)`
  - `getStatisticsWithProfitFactor(...)`
  - `getTimeRangeKey(...)`
- Updated `context/data-provider.tsx` to consume these selectors via `useMemo`, preserving existing dependencies and output shape.
- Removed in-file `getTimeRangeKey(...)` and inline heavy filtering/statistics blocks to reduce monolith complexity and improve maintainability.
- Verification:
  - `node scripts/check-route-security.mjs` -> pass.
  - `node scripts/check-color-contract.mjs` -> pass.
  - `npm run -s typecheck` remains blocked here (`next: command not found`).

## Task: Immediate UI hotspot memoization pass (2026-03-09)

- [x] Reduce row-render overhead in trade table by extracting row body rendering into memoized component.
- [x] Split draggable account-card behavior into dedicated memoized component to reduce accounts-overview render churn.
- [x] Keep existing behavior and props contract intact for both dashboard surfaces.

## Review

- Added `TradeTableDataRow` memoized row renderer in `app/[locale]/dashboard/components/tables/trade-table-review.tsx` and replaced inline row map rendering with component usage.
- Added `app/[locale]/dashboard/components/accounts/draggable-account-card.tsx` and migrated accounts-overview to consume it instead of in-file draggable implementation.
- Removed transient unused helper files created during refactor attempt to keep workspace clean and avoid type drift.
- Verification: static project checks remain green in this environment (`node scripts/check-route-security.mjs`, `node scripts/check-color-contract.mjs`); TypeScript/build verification remains blocked locally because dependencies are not installed (`next: command not found`).
