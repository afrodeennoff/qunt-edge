# Qunt Edge V2 UI Audit (End-to-End)

## Scope Evaluated
- `components/ui` primitives and custom wrappers
- dashboard shell + widget canvas + widget registry
- dashboard charts (`app/[locale]/dashboard/components/charts/*`)
- shared lazy chart loading (`components/lazy/charts.tsx`)
- global app shell flag integration (`app/layout.tsx`)

## What Was Implemented

## 1) V2 Feature Flag Contract
- Added `NEXT_PUBLIC_UI_V2_ENABLED` to env schema.
- Added `lib/ui-v2.ts` with:
  - `isUiV2Enabled()`
  - `getUiVariant()`
- Wired variant onto root DOM:
  - `app/layout.tsx` now sets `data-ui-variant="v1|v2"` on `<html>` and `<body>`.

## 2) Primitive + Loading Contract
- Added loading API to button:
  - `components/ui/button.tsx`
  - New props: `isLoading`, `loadingText`
  - Built-in spinner + disabled/busy behavior.
- Previously updated primitive pass remains active:
  - card/input/textarea/badge/action-card/media-card/stats-card/glass-card alignment.

## 3) New Shared V2 Contracts
- Added `components/ui/widget-shell.tsx`
  - Standard header/body/footer/actions + `ready/loading/empty/error`.
- Added `components/ui/chart-surface.tsx`
  - Standard chart wrapper with unified state handling.
  - Pass-through body when no header/state overlays to avoid layout regressions.

## 4) Widget Migration
- Migrated all dedicated dashboard widgets in `app/[locale]/dashboard/components/widgets/*`:
  - `trading-score-widget.tsx`
  - `expectancy-widget.tsx`
  - `risk-metrics-widget.tsx`
- Standardized to `WidgetShell` with empty-state behavior.

## 5) Dashboard Chart Wrapper Migration
- Migrated dashboard chart shells to `ChartSurface`:
  - `equity-chart.tsx`
  - `pnl-bar-chart.tsx`
  - `weekday-pnl.tsx`
  - `pnl-by-side.tsx`
  - `pnl-per-contract.tsx`
  - `pnl-per-contract-daily.tsx`
  - `pnl-time-bar-chart.tsx`
  - `tick-distribution.tsx`
  - `trade-distribution.tsx`
  - `commissions-pnl.tsx`
  - `contract-quantity.tsx`
  - `time-in-position.tsx`
  - `time-range-performance.tsx`
- Note: `account-selection-popover.tsx` and `daily-tick-target.tsx` are utility/partial chart flows and not migrated to `ChartSurface` yet.

## 6) Loading State Unification
- Updated lazy chart loading to V2 contract:
  - `components/lazy/charts.tsx` uses `ChartSurface state="loading"`.

## 7) Dashboard Shell/Canvas Refinement
- Updated deprecated widget fallback in `widget-canvas.tsx` to use `WidgetShell`.
- Added conditional V2 chrome styling in widget canvas based on feature flag.

## Validation
- `npm run -s typecheck` passes.
- `npm run build` could not complete in this environment due native runtime crash (`Signal 6`, canvas/sharp dylib conflict), not TypeScript contract issues.

## Findings and Remaining Work

## P0 (Must do before full production cutover)
1. Build stability in CI/runtime environment
- Why: production gate requires successful build artifact.
- Evidence: local sandbox build aborts with native module conflict.
- Action: run the same branch in CI/preview infra where native deps are stable; verify full build and smoke.

2. Complete V2 chart contract outside dashboard main charts
- Why: V2 consistency target includes bars/diagrams across app surfaces.
- Remaining areas:
  - `app/[locale]/embed/components/*` chart cards still use legacy shell
  - `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx`
  - `app/[locale]/teams/components/user-equity/user-equity-chart.tsx`

## P1 (Should do in V2 before broad rollout)
1. WidgetShell adoption for non-`/widgets` dashboard modules
- Why: still mixed shell patterns in statistics/calendar/chat and table widgets.
- Remaining:
  - `app/[locale]/dashboard/components/statistics/*`
  - `app/[locale]/dashboard/components/calendar/*`
  - `app/[locale]/dashboard/components/chat/*`
  - `app/[locale]/dashboard/components/tables/*` where widget-like panels exist

2. Registry preview alignment
- Why: widget add-sheet previews still use mixed card wrappers.
- Remaining:
  - `app/[locale]/dashboard/config/widget-registry.tsx` preview creators.

3. Feature-flag cutover checkpoints
- Why: safe rollout needs explicit staged policy.
- Required:
  - staging enable, smoke pass, selective prod enable, rollback runbook.

## P2 (V2.1 acceptable)
1. Replace remaining precision-only custom snippets with shadcn-first compositions where appropriate.
2. Extend loading button adoption to critical async forms/actions app-wide.
3. Reduce duplicate tooltip/title implementations by centralizing chart header content.

## Ranked “Implement Next” Queue
1. CI/preview build + smoke verification for this branch.
2. Migrate `embed` chart components to `ChartSurface`.
3. Migrate dashboard data/team-equity charts to `ChartSurface`.
4. Migrate statistics/calendar/chat widget panels to `WidgetShell`.
5. Normalize widget-registry previews to `ChartSurface`/`WidgetShell`.
6. Roll out `ui_v2_enabled` progressively in production.

## Why This Order
- It removes release blockers first (P0), then closes user-visible consistency gaps (P1), then performs polish/DRY cleanup (P2) with lower risk.
