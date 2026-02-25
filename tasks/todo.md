# Route Redesign Todo (No-Gradient Unified Look)

## Scope
- Redesign requested routes to use one cohesive monochrome visual language aligned with the current site.
- Remove gradient-driven visuals from those routes and shared landing shell.

## Acceptance Criteria
- [ ] All requested routes share consistent page shell/header/surface treatment.
- [ ] Explicit gradient usage is removed from requested routes and landing shell.
- [ ] Dashboard route functionality remains intact (no behavior regressions).
- [ ] Verification command(s) run and results recorded.

## Plan Checklist
- [x] Audit requested routes and map each to source files.
- [x] Implement shared no-gradient unified page components/utilities.
- [x] Refactor requested routes to use unified shell styles.
- [x] Run verification and record outcomes.

## Current Step
- **Completed:** Redesign implementation and verification pass.

## Progress Notes
- 2026-02-25: Mapped all requested routes to concrete page files in `app/[locale]/dashboard/*`, `app/[locale]/(landing)/*`, and `app/[locale]/teams/(landing)/page.tsx`.
- 2026-02-25: Identified gradient sources: landing shell radial overlays and support-page Discord banner gradient block.
- 2026-02-25: Added shared unified shell component (`components/layout/unified-page-shell.tsx`) and migrated requested routes to cohesive monochrome surfaces.
- 2026-02-25: Removed gradient overlays from landing shell and gradient banner styles from support route.
- 2026-02-25: Refined dashboard card/surface consistency for `settings`, `behavior`, and `trader-profile`.
- 2026-02-25: Verification rerun: `npm run typecheck` still fails due existing test file issues in `tests/performance/rendering-performance.test.tsx` (not introduced by route redesign).
- 2026-02-25: Rewrote homepage messaging for stronger trader-identity positioning across hero, problem framing, features, proof, and CTA sections.
- 2026-02-25: Removed remaining homepage gradient text/overlay treatments from `Hero` and `HomeContent` for stricter no-gradient consistency.
- 2026-02-25: Verification rerun after homepage rewrite: `npm run typecheck` fails with the same pre-existing `tests/performance/rendering-performance.test.tsx` issues.
- 2026-02-25: Updated About page founder copy to direct personal profile messaging ("THE TRADER BEHIND TIMON|") with the user-provided text.
- 2026-02-25: Refined home page design system for stronger premium cohesion: hero surface polish, section rhythm improvements, pricing cards modernization, and comparison/CTA visual consistency.
- 2026-02-25: Targeted verification passed: `npx eslint` on touched home components exited `0`.

## Completion Notes
- Unified no-gradient redesign applied across requested routes; remaining verification blocker is pre-existing test typing failures.

---

# Deployment Hotfix Todo (Lockfile Sync for `npm ci`)

## Scope
- Resolve deployment failure where Nixpacks `npm ci` exits with lockfile sync errors.
- Keep change scoped to dependency lockfile integrity and verification evidence.

## Acceptance Criteria
- [x] Lockfile is synchronized with current dependency graph.
- [x] Local `npm ci` completes successfully.
- [x] Results are recorded with concrete command evidence.

## Plan Checklist
- [x] Reproduce/analyze failure signal from deploy logs.
- [x] Regenerate lockfile metadata without changing declared dependencies.
- [x] Re-run `npm ci` to verify deploy parity.

## Current Step
- Completed.

## Progress Notes
- 2026-02-25: Confirmed deploy error signature: `npm ci` reported lockfile desync and missing entries for `@csstools/css-parser-algorithms` and `@csstools/css-tokenizer`.
- 2026-02-25: Ran `npm install --package-lock-only --ignore-scripts` to resynchronize `package-lock.json`.
- 2026-02-25: Verified with `npm ci` (including `postinstall` Prisma generation) and observed exit code `0`.

## Completion Notes
- Changed file: `package-lock.json` (lockfile metadata sync only).
- Verification evidence:
  - `npm install --package-lock-only --ignore-scripts` -> success.
  - `npm ci` -> success (`added 1468 packages`, `prisma generate` completed).

---

# Widget Audit Fixes Todo (Canvas/Layout + Mindset + Propfirm)

## Scope
- Implement minimal fixes for the 4 widget audit findings without unrelated refactors.

## Acceptance Criteria
- [x] Widget canvas uses consistent widget source for rendered children and grid layouts.
- [x] Widget canvas guards active breakpoint slices safely when missing.
- [x] Mindset carousel listener is cleaned up to prevent duplicate handler accumulation.
- [x] Propfirm widget no longer mutates React state during render sorting.
- [x] Verification command(s) run and results recorded.

## Plan Checklist
- [x] Patch `widget-canvas.tsx` for layout/render sync and safe active-slice handling.
- [x] Patch `mindset-widget.tsx` effect listener cleanup.
- [x] Patch `propfirm-catalogue-widget.tsx` to avoid in-place state mutation.
- [x] Run verification and record outcomes.

## Current Step
- **Completed:** Patch + verification evidence captured.

## Progress Notes
- 2026-02-25: Removed duplicate-type filtering from canvas render path and aligned `currentLayout` with `responsiveLayout` source.
- 2026-02-25: Added safe active-layout fallback arrays for layout operations (`layout change`, `remove`, `resize`).
- 2026-02-25: Added Embla `select` listener cleanup in mindset widget.
- 2026-02-25: Replaced in-render `stats.sort(...)` mutation with memoized sorted copy in propfirm widget.
- 2026-02-25: Verification run completed; typecheck failure is pre-existing in `tests/performance/rendering-performance.test.tsx`; touched files pass targeted ESLint with warnings only.

## Completion Notes
- Updated files:
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
  - `app/[locale]/dashboard/components/mindset/mindset-widget.tsx`
  - `app/[locale]/dashboard/components/widgets/propfirm-catalogue-widget.tsx`
- Verification evidence:
  - `npm run typecheck` -> failed due pre-existing errors in `tests/performance/rendering-performance.test.tsx` (`@testing-library/react` module/type and test typing issues), unrelated to this patch set.
  - `npx eslint <3 touched files>` -> exit `0` with warnings, no errors.

---

# Backend Hardening + Quality Remediation

## Scope
- Implement P0/P1/P2/P3 backend hardening items: data integrity, shared-link enforcement, rate-limiting architecture, endpoint bounds, performance optimization, and quality remediation.

## Acceptance Criteria
- [x] ETP order writes are tenant-scoped (`userId + orderId` uniqueness).
- [x] Shared pages deny private/expired links.
- [x] Referral application is atomic/idempotent under concurrency.
- [x] Health endpoint defaults to safe/minimal public response.
- [x] Rate limiting supports distributed backend in production with safe local fallback.
- [x] Admin subscriptions endpoint removes N+1 aggregates.
- [x] Benchmark endpoint serves snapshot-first with refresh fallback.
- [x] ETP/THOR ingestion rejects oversized payloads and abusive pagination.
- [x] Typecheck/lint/test/build/audit verification captured.

## Plan Checklist
- [x] Create branch `codex/backend-full-hardening`.
- [x] Apply schema updates + migration scaffolding for order uniqueness, referral redemptions, benchmark snapshot.
- [x] Implement shared visibility/expiry enforcement and secure slug generation.
- [x] Implement ETP tenant-safe upsert and ingestion bounds (ETP/THOR).
- [x] Implement benchmark snapshot route and admin subscriptions batching.
- [x] Implement distributed-capable rate limiter and health output hardening.
- [x] Add regression tests for ETP scoped upsert and shared visibility guard.
- [x] Run full verification commands and record results.
- [x] Update AGENTS engineering log with this change set.

## Current Step
- **Completed:** Full verification pass and documentation updates.

## Progress Notes
- 2026-02-25: Created implementation branch `codex/backend-full-hardening`.
- 2026-02-25: Added schema changes for `Order` composite uniqueness, `ReferralRedemption`, and `TraderBenchmarkSnapshot`.
- 2026-02-25: Added migration `20260225170000_backend_hardening_core`.
- 2026-02-25: Replaced weak slug generation with crypto-safe helper in shared/referral flows.
- 2026-02-25: Reworked referral write path to atomic relational redemptions.
- 2026-02-25: Enforced shared link visibility/expiry in server read path.
- 2026-02-25: Hardened `/api/health` to default minimal public payload, with optional authorized diagnostics.
- 2026-02-25: Added distributed production path for rate limiting (`UPSTASH_REDIS_REST_*`) with local fallback.
- 2026-02-25: Added ingestion payload/pagination bounds for ETP/THOR endpoints.
- 2026-02-25: Removed admin subscriptions N+1 by batching aggregate queries by `userId`.
- 2026-02-25: Added benchmark snapshot-first serving with refresh fallback.
- 2026-02-25: Verification results captured:
  - `npm run typecheck` -> pass.
  - `npm run lint -- app/api server lib` -> pass with warnings (`0` errors).
  - `npm test` -> pass (`145 passed`, `46 skipped`).
  - `npm run build` -> pass.
  - `npm audit --omit=dev` -> residual moderate transitive vulnerabilities remain in Prisma toolchain (`hono`, `lodash` via `@mrleebo/prisma-ast`) and `markdown-it`.

## Completion Notes
- Core backend hardening scope delivered on `codex/backend-full-hardening`:
  - composite order uniqueness (`userId + orderId`) with migration and tenant-safe upserts,
  - shared-link visibility + expiry enforcement,
  - relational referral redemption model with atomic concurrency protection,
  - health endpoint public-safe output with authorized detail gating,
  - distributed-capable rate limiting,
  - admin subscriptions N+1 removal,
  - benchmark snapshot-first serving,
  - ingestion payload/pagination bounds for ETP/THOR.

---

# Runtime Slowness Investigation Todo

## Scope
- Find concrete reasons why the app runtime feels slow and prioritize fixes with the highest impact and lowest regression risk.

## Acceptance Criteria
- [x] Gather measurable evidence for at least the top 3 likely bottlenecks.
- [x] Apply minimal, production-safe fixes for confirmed bottlenecks.
- [x] Run verification checks and record outcomes.
- [x] Provide residual risk and follow-up actions.

## Plan Checklist
- [x] Collect baseline performance signals (route/build/client boundaries and hot-path files).
- [x] Confirm root causes in code paths tied to slow interactions.
- [x] Implement targeted fixes.
- [x] Verify and document results.

## Current Step
- **Completed:** Root-cause analysis + expanded dashboard subscription-scope migration.

## Progress Notes
- 2026-02-25: Started runtime slowness investigation with focused plan and evidence-first workflow.
- 2026-02-25: Quantified client complexity signals: `344` client components and `47` total `useData()` call sites (`32` inside dashboard components).
- 2026-02-25: Confirmed heavy hot path in `context/data-provider.tsx` where `formattedTrades` runs full filter/sort/date-time transformations (`lines 841-967`) and fans into `statistics` + `calendarData`.
- 2026-02-25: Confirmed broad context subscription in top-level dashboard chrome (`dashboard-header`, `navbar`, `global-sync-button`, `user-menu`) via `useData()`, causing rerenders from unrelated state changes.
- 2026-02-25: Confirmed expensive equity chart client computation (`equity-chart.tsx`, `computeClientSideData`, lines `660-737`) re-sorts and rebuilds date series per dependency change.
- 2026-02-25: Applied targeted rerender fan-out reduction by migrating high-level UI components from umbrella `useData()` to slice hooks (`useDashboardActions`, `useDashboardFilters`, `useDashboardTrades`).
- 2026-02-25: Extended migration across dashboard chart/widget hot paths (`formattedTrades` + filter consumers) to use slice hooks (`useDashboardStats`, `useDashboardFilters`, `useDashboardActions`, `useDashboardTrades`) instead of umbrella `useData()`.
- 2026-02-25: Optimized equity chart client path by removing redundant in-component trade sorting and removing verbose render/computation logging in hot paths.
- 2026-02-25: Build verification rerun now passes (`npm run build` exit `0`); Prisma relation blocker no longer reproduces.
- 2026-02-25: Route/bundle verification rerun passes (`npm run check:route-budgets`, `npm run analyze:bundle`).

## Completion Notes
- Root-cause summary:
  - Heavy trade derivation pipeline in `DataProvider` recomputes and sorts across full trade sets on many filter changes.
  - Broad `useData()` fan-out in dashboard shell/components caused broad rerender cascades.
  - `EquityChart` client compute path had redundant sort work plus verbose logging in render-sensitive flows.
- Files updated for fix pass:
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/[locale]/dashboard/components/navbar.tsx`
  - `app/[locale]/dashboard/components/global-sync-button.tsx`
  - `app/[locale]/dashboard/components/user-menu.tsx`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
  - `app/[locale]/dashboard/components/charts/equity-chart.tsx`
  - `app/[locale]/dashboard/components/charts/time-range-performance.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`
  - `app/[locale]/dashboard/components/charts/trade-distribution.tsx`
  - `app/[locale]/dashboard/components/charts/weekday-pnl.tsx`
  - `app/[locale]/dashboard/components/charts/tick-distribution.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx`

---

# GitHub Actions Failure Triage Todo

## Scope
- Inspect currently failing GitHub Actions checks and identify actionable root cause.
- Provide a focused fix plan only (no implementation yet).

## Acceptance Criteria
- [x] Latest failing GitHub Actions runs identified with run/job links.
- [x] Failed step(s) isolated to concrete workflow step names.
- [x] Root-cause hypothesis stated with confidence and evidence limits.
- [x] Focused fix plan proposed for approval.

## Plan Checklist
- [x] Verify GitHub CLI access/auth context.
- [x] Collect failing workflow runs and failed jobs.
- [x] Map failures to workflow YAML and pinpoint failing steps.
- [x] Draft remediation plan with validation steps.

## Current Step
- **Completed:** Investigation complete; fix plan pending user approval.

## Progress Notes
- 2026-02-25: `gh` CLI unavailable in this environment (`command not found`), so triage used GitHub REST API endpoints.
- 2026-02-25: No open PR found for local branch `codex/backend-full-hardening`; investigation focused on latest failing repository workflow runs.
- 2026-02-25: Latest failures on `main` are:
  - CI run `22307725077` (`validate` job).
  - Widget Policy Compliance run `22307725110` (`Validate JSON Schemas` and downstream reporting jobs).
- 2026-02-25: Failed steps for both primary failing jobs are `Install Dependencies` / `Install dependencies` (`npm ci` path).
- 2026-02-25: Full action logs endpoint requires authenticated access (HTTP `403`) in current environment, so exact npm error line is unavailable here.

## Completion Notes
- High-confidence root cause: dependency installation failure at `npm ci` in both workflows, likely lockfile/dependency graph drift (consistent with prior lockfile-sync failure pattern already documented in this repo).
- Verification evidence:
  - `GET /actions/runs/<id>/jobs` shows failed jobs and failed install step names.
  - Workflow files confirm `npm ci` at those step locations.
  - `app/[locale]/dashboard/components/charts/daily-tick-target.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`
  - `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`
  - `app/[locale]/dashboard/components/charts/time-in-position.tsx`
  - `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`
  - `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx`
  - `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`
  - `app/[locale]/dashboard/components/pnl-summary.tsx`
  - `app/[locale]/dashboard/components/calendar/calendar-widget.tsx`
  - `app/[locale]/dashboard/components/import/import-button.tsx`
  - `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
  - `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
  - `app/[locale]/dashboard/components/daily-summary-modal.tsx`
  - `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- Verification evidence:
  - `npx eslint <touched dashboard files>` -> exit `0`, warnings only (no errors).
  - `npm run build` -> exit `0`.
  - `npm run check:route-budgets` -> exit `0`.
  - `npm run analyze:bundle` -> exit `0`.
- Residual risk:
  - Route budgets still pass close to threshold (dashboard routes ~`78.7-79.0 KB` vs `80 KB` budget), so future feature additions can regress quickly without continued splitting.
  - Remaining `useData()` call sites in dashboard scope are debug/import-specific (`data-debug`, `tradovate-credentials-manager`) and may still fan out when enabled.
