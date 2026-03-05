# Memory: Sessions

## 2026-02-28
- Completed a mobile optimization end-to-end audit with fresh verification (`typecheck`, `build`, route budgets, Lighthouse, Playwright mobile flow checks).
- Implemented fixes for mobile dialog accessibility metadata and non-Vercel analytics script failures.
- Confirmed unresolved performance risks remain: dashboard route bundle budget overruns and Lighthouse mobile/desktop threshold failures.
- Implemented full dashboard opacity/contrast recovery sweep across shared shells, widgets, charts, calendar, statistics, and table surfaces with typecheck passing and lint warnings-only.

## 2026-03-01
- Updated the compact `RiskRewardRatioCard` styling to remove nested/double-card appearance and render a single centered RR metric row with larger value typography.
- Followed up with a full-center alignment pass so the compact RR icon/label/value/help cluster is centered as one unit.
- Updated compact RR again to match the shared compact widget visual pattern (`precision-panel`) while preserving centered alignment and larger metric text.
- Finalized compact RR to exactly mirror the same compact-stat widget structure/classes used by similar widgets.
- Completed a focused `/strategies` audit and identified high-impact trade-update consistency and table-accuracy issues with command-backed evidence.
- Completed an end-to-end page-surface audit (public + protected/admin/team entry routes) with Playwright route sweeps and static verification gates.
- Fixed a hydration defect by removing nested button markup in the unified sidebar header (`SidebarTrigger` moved outside `SidebarMenuButton`), then re-verified `/en/teams/join` and `/en/teams/manage`.
- Captured remaining risk: dashboard route-budget violations (~95 KB vs 80 KB target) still failing `check:route-budgets`.
- Implemented complete remediation pass: community missing-post no longer emits noisy generic error logs, CSP report-only warning noise removed, and dev root config aligned.
- Reduced dashboard app-route manifests from ~85 KB to ~52-55 KB by removing heavy dashboard-context coupling and dynamically loading non-critical dashboard-header modules; route-budget gate now passes.
- Re-verified with `typecheck`, `build`, `check:route-budgets`, `analyze:bundle`, focused lint/tests, and Playwright redirects/hydration/missing-post checks plus a 32-route sequential dev crawl.
- Mapped all dashboard pages/flows reusing `TradeTableReview` and confirmed shared issue propagation beyond `/strategies` (table tab, data/trades tab, calendar modal table, widget table, import processor table).
- Implemented shared trade-table consistency fixes across server action + provider + table UI: hard-fail update path with rollback signaling, raw-trade footer counts, and row expandability alignment, then verified via typecheck and targeted eslint.

## 2026-03-03
- Completed a full repository reconnaissance pass driven by all currently installed skills and produced a skill-to-codebase applicability map.
- Validated core architecture surface counts and entry points (`46` page routes, `45` API route handlers; Next `16.1.6` + React `19.2.1` stack).
- Used parallel explorer subagents to cross-check frontend architecture, backend/auth/data model, and CI/deploy workflows; merged only locally validated findings.
- Captured operational risks during understanding pass: stale stack claims in `README.md` and missing helper scripts referenced by `.github/workflows/widget-policy-compliance.yml`.
- Implemented approved theme-token migration: moved canonical semantic tokens and color-only `@theme inline` bridge into `styles/tokens.css`, removed duplicate token blocks from `app/globals.css`, and added `docs/THEME_TOKEN_CONTRACT.md`.
- Preserved compatibility with temporary alias `--sidebar -> --sidebar-background`; re-verified with `typecheck`, `lint` (warnings-only), and `build`.
- Completed Phase B migration sweep for legacy `--sidebar` usage and confirmed no internal dependencies outside canonical token source/docs; added `docs/audits/theme-token-phase-b-2026-03-03.md` with ready Phase C alias-removal diff.
- Executed Phase C: removed legacy `--sidebar` alias from `styles/tokens.css`, updated token contract docs, and verified with alias/reference grep sweep plus `typecheck` (`0`).

## 2026-03-04
- Implemented full performance + polish pass across public/home, landing navbar/shell, dashboard sidebar/table shell, admin dashboard surfaces, and teams dashboard shell.
- Added safe performance-focused adjustments: removed fixed decorative home layers, narrowed dashboard sidebar context subscription (`useDashboardActions`), and reduced redundant trade-table scroll updates.
- Executed full verification gates (`typecheck`, `lint`, `build`, route budgets, bundle analysis) and generated fresh performance artifacts (`performance-baseline.json`, Lighthouse reports/summary).
- Captured current bottleneck: Lighthouse thresholds fail on `/en` and `/en/pricing` mainly from high TBT; documented next-focus actions in `docs/audits/performance-polish-2026-03-04.md`.
- 2026-03-05: Implementing full Redis setup for split frontend/backend VM deployment readiness: unified Redis utility + caching for AI trade aggregation, secure token verification, and behavior insights, plus invalidation hooks on trade mutations.

## 2026-03-05
- Continued implementation of the 30-issue remediation program with verified focus on cache correctness and performance governance controls.
- Re-ran strict header audits and confirmed private route/API cache contract behavior is enforced in practice.
- Refreshed baseline and Lighthouse artifacts; confirmed TBT on `/en` and `/en/pricing` remains the primary unresolved performance bottleneck.
- Added remediation progress report at `docs/audits/master-remediation-phase1-3-2026-03-05.md` and updated task tracking for current phase state.
- Implemented additional Phase 3 reductions by tightening deferred home-section load thresholds and lazy-loading pricing plans on `/en/pricing` with skeleton fallback.
- Re-verified full gates; route budgets and strict header checks remain green, pricing HTML payload dropped materially, and desktop home TBT improved, but mobile TBT on `/en` and `/en/pricing` still fails threshold targets.
