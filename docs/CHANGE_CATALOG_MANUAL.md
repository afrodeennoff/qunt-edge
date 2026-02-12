# Change Catalog Manual

This catalog summarizes recent repository changes with practical context.
Format per entry: `Commit` + `Why` + `How Fixed` + `Key File IDs`.

> Note: `Why` and `How Fixed` are inferred from commit messages and touched files.

## c3e6411 (2026-02-12)
- Commit: `Clarify auth redirect handling`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/(authentication)/components/user-auth-form.tsx`
  - `app/[locale]/(landing)/components/card-showcase.tsx`
  - `app/[locale]/dashboard/components/daily-summary-modal.tsx`
  - `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`
  - `app/api/auth/callback/route.ts`
  - `components/ui/action-card.tsx`
  - `lib/__tests__/setup.ts`
  - `lib/domain/pnl-calculator.ts`
  - `server/teams.ts`

## 40c920c (2026-02-12)
- Commit: `Update authentication page styling`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/(authentication)/authentication/page.tsx`
  - `app/[locale]/(authentication)/components/user-auth-form.tsx`
  - `lib/score-calculator.ts`

## ec22828 (2026-02-12)
- Commit: `Clean dashboard UI alignment`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/chat/bot-message.tsx`
  - `app/[locale]/dashboard/components/chat/chat.tsx`
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/[locale]/dashboard/components/shared-layouts-manager.tsx`
  - `app/[locale]/dashboard/components/statistics/average-position-time-card.tsx`
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`
  - `app/[locale]/dashboard/components/statistics/long-short-card.tsx`
  - `app/[locale]/dashboard/components/statistics/profit-factor-card.tsx`
  - `app/[locale]/dashboard/components/statistics/risk-reward-ratio-card.tsx`
  - `app/[locale]/dashboard/components/statistics/statistics-widget.tsx`
  - `app/[locale]/dashboard/components/statistics/trade-performance-card.tsx`
  - `app/[locale]/dashboard/components/statistics/winning-streak-card.tsx`
  - `... 14 more files`

## a72038b (2026-02-12)
- Commit: `Redesign trader profile and add avatar in hero`
- Why: New capability or UX upgrade was needed
- How Fixed: Added/updated components and connected supporting logic
- Key File IDs:
  - `app/[locale]/dashboard/trader-profile/page.tsx`

## 89905c6 (2026-02-12)
- Commit: `Fix login issue on main`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `server/auth.ts`

## 015b855 (2026-02-12)
- Commit: `feat: finalize unified dashboard theme and trader profile components`
- Why: New capability or UX upgrade was needed
- How Fixed: Added/updated components and connected supporting logic
- Key File IDs:
  - `app/[locale]/(landing)/actions/github.ts`
  - `app/[locale]/(landing)/components/footer.tsx`
  - `app/[locale]/dashboard/trader-profile/page.tsx`
  - `app/globals.css`

## 86d02d3 (2026-02-12)
- Commit: `Replace timeframe buttons with Seged`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/chart-the-future-panel.tsx`
  - `app/[locale]/dashboard/components/top-nav.tsx`
  - `app/[locale]/teams/dashboard/page.tsx`
  - `app/globals.css`
  - `app/layout.tsx`
  - `components/ui/segmented-control.tsx`
  - `components/ui/stat-tile.tsx`

## 2be2147 (2026-02-12)
- Commit: `Check thread changes applied`
- Why: Maintenance/housekeeping task
- How Fixed: Applied non-feature maintenance updates
- Key File IDs:
  - `LAST_2_DAYS_CHANGES.txt`
  - `LAST_2_DAYS_UNIQUE_FILES.txt`
  - `app/[locale]/(landing)/components/footer.tsx`
  - `app/[locale]/dashboard/components/chart-the-future-panel.tsx`
  - `app/[locale]/dashboard/components/charts/tradingview-chart.tsx`
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/[locale]/dashboard/components/lazy-widget.tsx`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
  - `app/[locale]/dashboard/config/widget-registry.tsx`
  - `app/[locale]/dashboard/data/page.tsx`
  - `app/[locale]/dashboard/page.tsx`
  - `app/[locale]/dashboard/strategies/page.tsx`
  - `... 10 more files`

## b44459e (2026-02-12)
- Commit: `fix: avoid import-time supabase admin client crashes`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/admin/actions/send-email.ts`
  - `app/[locale]/admin/actions/stats.ts`
  - `app/[locale]/admin/actions/weekly-recap.ts`
  - `app/[locale]/teams/actions/stats.ts`

## 9b83e0a (2026-02-12)
- Commit: `docs: update combined documentation`
- Why: Documentation drift or context gap existed
- How Fixed: Updated reference docs and summaries
- Key File IDs:
  - `COMBINED_DOCUMENTATION.md`

## ff5eb2b (2026-02-12)
- Commit: `Summarize trader profile updates`
- Why: Documentation drift or context gap existed
- How Fixed: Updated reference docs and summaries
- Key File IDs:
  - `app/[locale]/teams/actions/stats.ts`

## 825b4ad (2026-02-12)
- Commit: `Summarize trader profile updates`
- Why: Documentation drift or context gap existed
- How Fixed: Updated reference docs and summaries
- Key File IDs:
  - `app/[locale]/dashboard/components/add-widget-sheet.tsx`
  - `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx`
  - `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`
  - `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`
  - `app/[locale]/teams/actions/analytics.ts`
  - `app/[locale]/teams/actions/stats.ts`
  - `app/[locale]/teams/components/team-management.tsx`
  - `app/[locale]/teams/components/teams-sidebar.tsx`
  - `app/[locale]/teams/components/user-equity/team-equity-grid-client.tsx`
  - `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx`
  - `app/[locale]/teams/dashboard/[slug]/members/page.tsx`
  - `app/[locale]/teams/dashboard/page.tsx`
  - `... 2 more files`

## a27b406 (2026-02-10)
- Commit: `chore: create combined documentation and update multiple components`
- Why: Maintenance/housekeeping task
- How Fixed: Applied non-feature maintenance updates
- Key File IDs:
  - `COMBINED_DOCUMENTATION.md`
  - `ROUTE_MAPPING_VERIFICATION.md`
  - `app/[locale]/(authentication)/authentication/page.tsx`
  - `app/[locale]/(home)/components/CTA.tsx`
  - `app/[locale]/(home)/components/Footer.tsx`
  - `app/[locale]/(home)/components/Hero.tsx`
  - `app/[locale]/(home)/components/Navigation.tsx`
  - `app/[locale]/(landing)/components/footer.tsx`
  - `app/[locale]/(landing)/components/navbar.tsx`
  - `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
  - `app/[locale]/dashboard/components/charts/daily-tick-target.tsx`
  - `... 40 more files`

## a5454a7 (2026-02-10)
- Commit: `Refactor: Centralize data normalization and fix type mismatches across the dashboard`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/admin/actions/stats.ts`
  - `app/[locale]/admin/components/dashboard/free-users-table.tsx`
  - `app/[locale]/dashboard/components/accounts/account-card.tsx`
  - `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
  - `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
  - `app/[locale]/dashboard/components/accounts/accounts-table-view.tsx`
  - `app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx`
  - `app/[locale]/dashboard/components/calendar/daily-modal.tsx`
  - `app/[locale]/dashboard/components/calendar/desktop-calendar.tsx`
  - `app/[locale]/dashboard/components/calendar/weekly-calendar.tsx`
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx`
  - `... 24 more files`

## 146a0a6 (2026-02-10)
- Commit: `Refactor: Normalize trade and account data types across the application. Centralized types in lib/data-types.ts, updated DataProvider for consistent normalization, and ensured server-side actions handle standard JS numbers.`
- Why: Type/architecture consistency needed
- How Fixed: Reorganized code and normalized shared logic
- Key File IDs:
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/[locale]/dashboard/components/tables/trade-comment.tsx`
  - `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
  - `app/[locale]/dashboard/components/tables/trade-tag.tsx`
  - `app/[locale]/dashboard/components/user-menu.tsx`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
  - `app/[locale]/dashboard/page.tsx`
  - `app/[locale]/dashboard/settings/page.tsx`
  - `app/[locale]/teams/components/logout-button.tsx`
  - `app/[locale]/teams/components/teams-sidebar.tsx`
  - `app/api/ai/chat/tools/get-previous-week-summary.ts`
  - `components/auth/auth-timeout.tsx`
  - `... 17 more files`

## 78d30f2 (2026-02-10)
- Commit: `Fix TypeScript decimal errors`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/(home)/components/DeferredHomeSections.tsx`
  - `app/[locale]/(home)/components/HomeContent.tsx`
  - `app/[locale]/(landing)/components/footer.tsx`
  - `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
  - `app/[locale]/(landing)/components/navbar.tsx`
  - `app/[locale]/dashboard/components/add-widget-sheet.tsx`
  - `app/[locale]/dashboard/components/navbar.tsx`

## 1d6979a (2026-02-10)
- Commit: `Implement enterprise hardening sweep`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `.github/workflows/ci.yml`
  - `README.md`
  - `app/[locale]/(home)/components/AnalysisDemo.tsx`
  - `app/[locale]/(home)/components/CTA.tsx`
  - `app/[locale]/(home)/components/Features.tsx`
  - `app/[locale]/(home)/components/Hero.tsx`
  - `app/[locale]/(home)/components/HomeContent.tsx`
  - `app/[locale]/(home)/components/HowItWorks.tsx`
  - `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
  - `app/[locale]/(landing)/components/navbar.tsx`
  - `app/[locale]/dashboard/components/accounts/account-card.tsx`
  - `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
  - `... 88 more files`

## 2b5cda3 (2026-02-10)
- Commit: `fix: resolve build errors in free-users-table.tsx by correctly handling Date objects`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/admin/components/dashboard/free-users-table.tsx`

## 0f0ecf7 (2026-02-10)
- Commit: `feat: redesign dashboard customization UI and fix trade serialization for open trades`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/api/ai/chat/tools/get-overall-performance-metrics.ts`
  - `app/api/ai/chat/tools/get-performance-trends.ts`
  - `app/api/ai/chat/tools/get-previous-week-summary.ts`
  - `app/api/ai/chat/tools/get-trades-summary.ts`
  - `app/api/email/weekly-summary/[userid]/actions/user-data.ts`
  - `app/api/imports/ibkr/extract-orders/route.ts`
  - `app/api/imports/ibkr/fifo-computation/route.ts`
  - `app/api/imports/ibkr/fifo-computation/schema.ts`
  - `context/data-provider.tsx`
  - `lib/__tests__/auto-save-service.test.ts`
  - `lib/__tests__/payment-flows.test.ts`
  - `... 18 more files`

## 620c6b0 (2026-02-10)
- Commit: `Merge branch 'main' of https://github.com/afrodeennoff/final-qunt-edge into main`
- Why: Branch synchronization required
- How Fixed: Merged upstream history and reconciled states
- Key File IDs:

## 630181f (2026-02-10)
- Commit: `feat: initial commit from local codebase`
- Why: New capability or UX upgrade was needed
- How Fixed: Added/updated components and connected supporting logic
- Key File IDs:
  - `.codex/environments/environment.toml`
  - `.dockerignore`
  - `.env.example`
  - `.github/scripts/check-manifests.js`
  - `.github/workflows/ci.yml`
  - `.github/workflows/widget-policy-compliance.yml`
  - `.gitignore`
  - `.vercelignore`
  - `CHANGELOG_SECURITY.md`
  - `Dockerfile.bun`
  - `IMPORT_FIX_SUMMARY.md`
  - `LICENSE`
  - `... 929 more files`

## f3c385c (2026-02-10)
- Commit: `Remove widget hover effects and set black widget surfaces`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/lazy-widget.tsx`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
  - `components/ui/card.tsx`

## dde6403 (2026-02-10)
- Commit: `Fix dashboard edit button`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/widget-canvas.tsx`

## 4b1561e (2026-02-10)
- Commit: `fix(dashboard): make navbar edit toggle reliable on dashboard root`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/dashboard-header.tsx`

## 6caa114 (2026-02-10)
- Commit: `Add explicit no-data states to remaining dashboard chart cards`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
  - `app/[locale]/dashboard/components/charts/equity-chart.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx`
  - `app/[locale]/dashboard/components/charts/time-in-position.tsx`

## ad2bf84 (2026-02-10)
- Commit: `Show explicit empty states for dashboard chart widgets`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`
  - `app/[locale]/dashboard/components/charts/tick-distribution.tsx`
  - `app/[locale]/dashboard/components/charts/time-range-performance.tsx`
  - `app/[locale]/dashboard/components/charts/trade-distribution.tsx`
  - `app/[locale]/dashboard/components/charts/weekday-pnl.tsx`

## c32011a (2026-02-10)
- Commit: `Strengthen chart visual surfaces and readability`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `app/globals.css`
  - `components/ui/chart.tsx`

## 9ec1fcd (2026-02-10)
- Commit: `Redesign charts with modern unified surface across app`
- Why: New capability or UX upgrade was needed
- How Fixed: Added/updated components and connected supporting logic
- Key File IDs:
  - `app/[locale]/(home)/components/AnalysisDemo.tsx`
  - `app/[locale]/(landing)/components/performance-visualization-chart.tsx`
  - `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`
  - `app/[locale]/admin/components/dashboard/user-growth-chart.tsx`
  - `app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx`
  - `app/[locale]/dashboard/components/calendar/charts.tsx`
  - `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
  - `app/[locale]/dashboard/components/charts/equity-chart.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`
  - `... 27 more files`

## efdc377 (2026-02-10)
- Commit: `Adjust widget grid sizing`
- Why: General maintenance and improvement
- How Fixed: Updated affected modules and aligned behavior
- Key File IDs:
  - `.codex/environments/environment.toml`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`

## 998bb7e (2026-02-09)
- Commit: `Fix widget canvas sizing to prevent clipping and dead space`
- Why: A bug or regression was identified
- How Fixed: Patched impacted paths and corrected runtime/data behavior
- Key File IDs:
  - `app/[locale]/dashboard/components/widget-canvas.tsx`
