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
- Completed a focused readability/contrast/consistency audit for home/landing/auth pages and identified a route-level locale-link regression plus multiple small-text/low-contrast readability hotspots with line-level evidence.
- Completed a code-and-runtime security posture audit with Supabase live checks (RLS/policies/advisors), identified priority gaps (API cache policy scope, open redirect path, non-enforcing CSP defaults, and DB RLS consistency drift), and prepared a bank-grade hardening/isolation plan.
- Implemented the bank-grade hardening campaign across middleware/API/database layers: fail-closed API caching, redirect sanitization, checkout side-effect GET removal (POST-only), CSRF/content-type checks for checkout entrypoints, internal error-detail suppression with request IDs in high-risk token ingestion routes, and Supabase RLS-force/policy alignment on previously flagged tables.
- Re-verified with `typecheck`, `build`, targeted `eslint`, route budgets, bundle analysis, and Supabase advisor/SQL checks (remaining advisor item: leaked password protection disabled in Supabase Auth settings).
- Ran full TestSprite MCP workflow for requested E2E coverage using provided credentials and target URL context.
- Unblocked TestSprite pipeline initialization by creating required artifact directories/files under `testsprite_tests/tmp` and authoring a PRD seed in `testsprite_tests/tmp/prd_files`.
- Executed two end-to-end TestSprite runs; second run corrected auth-route assumptions to `/en/authentication` and produced improved pass rate (7/13 = 53.85%).
- Generated finalized grouped report at `testsprite_tests/testsprite-mcp-test-report.md` and captured raw evidence in `testsprite_tests/tmp/raw_report.md` + `testsprite_tests/tmp/test_results.json`.
- Expanded TestSprite frontend plan with `TC014`-`TC019` and executed via direct MCP `generate_code_and_execute` call plus returned terminal runner.
- Latest expanded run executed 15 tests with 9 pass / 6 fail (60.00%); improvements came from explicit `/en/authentication` login and billing/settings route checks.
- Persistent failures still show generator fallback to `/en/login` in several cases plus Strategies-nav assumptions and import-route modal blocking.
- Expanded TestSprite backend plan with additional API/security coverage (`TC005`-`TC008`) and executed backend run twice via direct generate+execute flow.
- Backend executions remained blocked by connection-layer reachability errors (urllib3 connection/getresponse traces) with 0/8 passing.
- Local probe to `http://localhost:3001/api/health` from this runtime returned `000`, indicating local endpoint not reachable from the backend test runtime path.
