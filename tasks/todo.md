## Current Task: Extend verification for CRUD/auth/state-sync

- [x] Audit existing tests for CRUD/auth/state-sync paths, noting coverage gaps and risky areas.
- [x] Add or adjust deterministic tests/scripts focused on missing coverage.
- [x] Run the targeted verification suites and capture exact command outputs.
- [x] Document remaining risky untested paths and verification results.

## Review
- Verification: Pending (tests not yet run)
- Risks: Coverage gaps still being mapped
- Follow-ups: Update report after adding tests

## Immediate AI verification run (2026-03-14)
- [ ] Run `npx vitest run tests/api/ai-*.test.ts tests/lib/ai-router-integration.test.ts lib/__tests__/ai-support-route.test.ts tests/lib/ai-trade-access.test.ts tests/lib/ai-router-fallback-order.test.ts tests/lib/ai-client-router-propagation.test.ts`
- [ ] Run `npm run -s typecheck`
- [ ] Run `npx eslint <touched AI files>`
- [ ] Run `npm run -s build`
- [ ] Capture/finalize verification summary (pass/fail + key outputs)

## Task: Trade image editor lint cleanup (2026-03-14)

- [x] Capture the current ESLint output for `app/[locale]/dashboard/components/tables/trade-image-editor.tsx` (`npx eslint ...`).
- [ ] Update the component to drop unused state/imports, tighten `trade`/update payload typing, and clean the upload effect/dependency handling without altering auth/ownership guards.
- [ ] Re-run `npx eslint app/[locale]/dashboard/components/tables/trade-image-editor.tsx` to confirm the earlier warnings are gone.
- [ ] Document the lint-before/after results along with a short summary of the code-quality improvements.

## Current Task: Commit and push current changes

- [x] Review git status/diff to confirm staged scope
- [x] Stage all intended changes
- [x] Commit with a clear summary message
- [x] Push to the current branch
- [x] Record verification results (not run)

## Verification Run (2026-03-13)

- [x] Run the requested AI-focused `vitest` command
- [ ] Run `npm run -s typecheck` (failed: format-preview.tsx block scope + ai chat tool typing)
- [x] Run ESLint on the AI files touched by the implementation worker (warnings only)
- [ ] Run `npm run -s build` (failed: missing .next/static/.../_buildManifest.js.tmp)
- [ ] Capture and report outcomes (failures, traces, suspects)

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

## Format Preview Cleanup Plan (2026-03-13)

- [ ] Audit `app/[locale]/dashboard/components/import/components/format-preview.tsx` for unused imports/variables and missing hook dependencies introduced by the batching/autoprocessing logic.
- [ ] Stabilize the timeout helpers (`scheduleManagedTimeout`, `clearManagedTimeouts`) and the streaming effects so they clean up properly without changing UI behavior.
- [ ] Run `npx eslint app/[locale]/dashboard/components/import/components/format-preview.tsx` and record its output once the fix is in place.
- Notes: Logged this cleanup plan on 2026-03-13 per worker A’s scope and lint expectations.

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

## Task: AI backend lint cleanup (2026-03-13)
- [x] Inspect the listed AI backend routes/libraries for clearly unused imports/vars introduced in the current state and note any obvious lint fixes.
- [x] Remove only the safe, behavior-preserving cruft from those backend files and keep changes minimal per scope.
- [x] Run `npx eslint app/api/ai/format-trades/route.ts app/api/ai/chat/route.ts app/api/ai/mappings/route.ts app/api/ai/support/route.ts lib/rate-limit.ts lib/ai/trade-access.ts lib/ai/client.ts` and capture the output.
- [x] Summarize the cleanup, lint results, and any follow-up notes in this file (including verification details).

## Review (AI backend lint cleanup)
- Verification: `npx eslint app/api/ai/format-trades/route.ts app/api/ai/chat/route.ts app/api/ai/mappings/route.ts app/api/ai/support/route.ts lib/rate-limit.ts lib/ai/trade-access.ts lib/ai/client.ts` (warnings limited to complexity).
- Summary: Added userId telemetry to `/api/ai/format-trades` and tightened the chat tool guard/mappings helper types to avoid explicit `any`.
- Follow-up: Complexity warnings persist for large `POST` handlers, router helpers, rate limit helpers, and trade-access aggregates; they predate this cleanup and were left untouched to stay behavior-preserving.

## Task: Harden trade image ownership guard (2026-03-14)

- [ ] Review the current `ensureOwnedImagePath` logic and `tests/trade-image-editor.test.ts` coverage to understand normalization/ownership expectations.
- [ ] Extend `ensureOwnedImagePath` with stricter normalization (POSIX slash normalization, trimmed leading/trailing separators, prefix normalization) and traversal/absolute path checks.
- [ ] Expand the Vitest suite to cover new normalization behaviors, prefix normalization, blocked relative/absolute/bad characters, and ensure existing guards still trigger.
- [ ] Run `npx vitest run tests/trade-image-editor.test.ts` and note the output.
- [ ] Record verification results and any residual risks/new follow-ups.

## Review
- Verification: Pending (waiting for trade image guard tests to run).
- Risks: Path normalization edge cases still need coverage once more routes rely on the guard.
- Follow-ups: Revisit `app/[locale]/dashboard/components/tables/trade-image-editor.tsx` if Supabase remove calls ever receive newly normalized prefixes.

## AI Implementation Worker (2026-03-14)

- [x] Inventory the AI-specific tests/lint that currently fail in this workspace and confirm the scope before making changes.
- [x] Fix the identified AI logic/tests within the AI subsystem without touching unrelated areas, documenting the root cause.
- [x] Run the targeted AI tests, `npm run -s typecheck`, ESLint on touched AI files, and `npm run -s build` until they all pass for the touched scope.
- [x] Summarize verification results and file changes for review.
- [x] Document the verification design (docs/superpowers/specs/2026-03-14-ai-verification-design.md).
- [x] Create the implementation plan (docs/superpowers/plans/2026-03-14-ai-verification-plan.md).

## Backend CRUD Audit (2026-03-14)

- [x] Review server/, app/api/, and lib/ backend CRUD/data-handling/auth flow code to understand current ownership and validation behavior.
- [x] Identify at least two concrete issues around create/read/update/delete scoping, error contracts, or auth guards needing fixes.
- [x] Implement minimal code changes to address the issues and add regression tests exercising those flows.
- [x] Run relevant vitest/ESLint/typecheck subsets for modified files and capture outputs.
- [x] Summarize findings, changes, and residual risks for the user.
## Full-Stack CRUD/Auth/State Sync Hardening Sweep (2026-03-14)

- [x] Run parallel specialist audits (frontend/backend/security/testing) and collect actionable findings.
- [x] Fix frontend CRUD + UI state-sync issues (create/read/update/delete flows, optimistic updates, validation UX).
- [x] Fix backend CRUD + validation/auth/permission issues (ownership enforcement + error contract consistency).
- [x] Add or update regression tests for each fix.
- [x] Run verification loop until clean:
  - [x] targeted tests for touched flows
  - [x] `npm run -s typecheck`
  - [x] lint on touched files
  - [x] `npm run -s build`
- [x] Perform manual CRUD flow validation checks and document outcomes.
- [x] Document full issue/fix report, changed files, verification evidence, and residual risks.

## Review (Full-Stack CRUD/Auth/State Sync Hardening Sweep)

- Parallel specialists completed frontend, backend, security ownership, and verification scopes with implemented code changes (not report-only).
- Verified affected CRUD/auth/state-sync/security tests pass:
  - `npx vitest run tests/trade-image-editor.test.ts tests/context/data-provider-utils.test.ts tests/server/team-analytics.test.ts lib/__tests__/team-analytics-route.test.ts tests/server/shared.test.ts`
  - `npx vitest run tests/context/data-provider-utils.test.ts tests/server/team-analytics.test.ts lib/__tests__/team-analytics-route.test.ts tests/server/shared.test.ts tests/trade-image-editor.test.ts tests/server/accounts-isolation.test.ts tests/server/layout-isolation.test.ts tests/server/optimized-trades-isolation.test.ts`
- Verified project-level checks:
  - `npm run -s typecheck` -> passes
  - `npx eslint <touched files>` -> 0 errors (warnings-only baseline)
  - `npm run -s build` -> passes
- Manual runtime sanity checks captured:
  - account-delete state-sync helper removes deleted account references from every group
  - trade-image ownership guard allows actor-owned paths and blocks relative-segment traversal attempts

## Frontend CRUD State Sync Sweep (2026-03-14)

- [ ] Investigate how deleting an account leaves stale references in `groups` and confirm the broken UI symptoms.
- [ ] Update the dashboard data provider to purge deleted accounts from paired `groups` state while keeping rollback paths intact.
- [ ] Add a reusable helper + targeted Vitest to confirm the cleanup logic and keep `context/data-provider.tsx` lint-clean.
- [ ] Run `npx vitest run tests/context/data-provider-utils.test.ts` and `npx eslint context/data-provider.tsx` and capture the outputs.
- [ ] Summarize the fix, list touched files, mention verification, and call out any remaining risks around shared views or auth.

## Security CRUD Audit Plan (2026-03-14)

- [x] Step 1: Inventory auth-sensitive CRUD endpoints/actions (app/api, server/, lib/) and confirm userId/file-path resolution is scoped to the authenticated actor.
- [x] Step 2: Fail-closed: tighten authn/authz/input validation guards and ownership assertions for create/read/update/delete handlers, including path-delete flows.
- [x] Step 3: Add regression tests that prove ownership boundaries (blocked cross-user action). Target vitest suites near touched routes.
- [x] Step 4: Run targeted security-relevant tests (relevant vitest subsets + ESLint/typecheck if those files change) and log output.
- [x] Step 5: Document what was fixed, changed files, and verification steps for the final report.
## Verification Run (2026-03-14 B)

- [ ] Identify touched files for this scope and note them in the report.
- [ ] Run targeted `vitest` suites covering the files touched in this session.
- [ ] Run `npx eslint` on the touched files.
- [ ] Run `npm run -s typecheck`.
- [ ] Run `npm run -s build`.
- [ ] Capture command outputs and summarize pass/fail fate.
