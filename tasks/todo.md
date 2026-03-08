# Performance Fix Plan (Immediate)

- [x] Added provider hook re-export files for trades/filters/derived/actions.
- [x] Migrated useDashboard* imports to new provider files.
- [ ] Verify dashboard behavior after import updates.

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
- [ ] Verify with typecheck/build and re-run targeted perf gates.

## Review (Runtime Lag Fix Pass)

- Goal: eliminate duplicate data fetch/context mount work and reduce broad rerender subscriptions.
- Risk to monitor: dashboard first render now fully depends on `DataProvider` client load path (no server-seeded trade payload in page shell).
- Verification pending: run `npm run -s typecheck` and `npm run -s build` after this patch set.
