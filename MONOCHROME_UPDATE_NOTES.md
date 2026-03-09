# Monochrome UI Update Notes

## Overview
This document summarizes the changes made to apply a consistent monochrome and glassmorphism aesthetic to the Qunt Edge trading platform, as per the "Expectancy" widget inspiration.

## Changes Implemented

### 1. Palette Standardization
- **Text Colors**: Replaced functional colors (e.g., `text-emerald-500`, `text-rose-500`, `text-fg-primary`, `text-fg-muted`) with monochrome variants:
  - Primary text: `text-white`
  - Secondary text: `text-white/50` or `text-white/40`
  - Disabled/Tertiary text: `text-white/20` or `text-white/30`
- **Backgrounds**: Replaced colored backgrounds with glassmorphism effects:
  - `bg-white/5` (default surface)
  - `bg-white/10` (hover/active states)
  - `bg-white/20` (prominent elements)
- **Borders**: Standardized borders to:
  - `border-white/10` (subtle separators)
  - `border-white/20` (active/focus states)

### 2. Component Updates
All dashboard widgets, key table components, and auxiliary UI elements have been updated:
- **Widgets**:
  - `TradingScoreWidget`: Updated grid styles, text colors, and icon colors.
  - `RiskMetricsWidget`: Unified typography and removed "fg-primary/muted" variables in favor of direct white/opacity values.
  - `ExpectancyWidget`: Applied consistent styling for "Positive/Negative edge" badges using monochrome backgrounds.
  - `StatisticsWidget`: Removed red/green/teal highlights in favor of a clean, terminal-like aesthetic.
  - `LongShortPerformanceCard` & `RiskRewardRatioCard`: Updated to match the widget theme.
- **Tables & Cells**:
  - `TradeTableReview`: Footer and filter icons updated to monochrome.
  - `TradeTag`: Tags now default to monochrome; spinner color fixed.
  - `EditableInstrumentCell` & `EditableTimeCell`: Hover effects modernized to `bg-white/5`.
- **Modals & Overlays**:
  - `DailySummaryModal`: Progress bars and text updated to monochrome gradients.
  - `RithmicSyncNotifications`: Success/Info alerts updated to `bg-white/5`, `border-white/20`, and white icons.
- **Import Processors**:
  - `AtasProcessor`: Replaced colored alerts (yellow/blue) with monochrome `Card` components (`bg-white/5`).
  - `NinjaTraderPerformanceProcessor`: Removed `text-red-600` and `text-green-600` in favor of `text-white` and `text-white/50` for PnL values.
- **Header Actions**:
  - `DashboardHeader`: "Delete All" action now uses monochrome `hover:bg-white/10` instead of destructive red.


### 3. Toolbar Removal
- The bottom toolbar component (`app/[locale]/dashboard/components/toolbar.tsx`) has been **removed** as requested.
- Its internal functionalities (Edit Layout, Filter, etc.) are preserved in `Navbar` (`app/[locale]/dashboard/components/navbar.tsx`) and `DashboardHeader` (`app/[locale]/dashboard/components/dashboard-header.tsx`), eliminating redundancy.

### 4. Code Quality & Linting
- **Globals.css**: The presence of `@config`, `@plugin`, `@source`, `@utility` directives was investigated. These are valid Tailwind CSS v4 syntax and are necessary for the project configuration. Linting errors related to these might be due to an older linter configuration not fully supporting v4 yet.
- **Type Safety**: Fixed potential type errors in widget components by ensuring proper casting for i18n functions (`t` as `any`).

## Next Steps
- Verify the build to ensure no dead references to the deleted toolbar remain (none were found in static analysis).
- Continue to monitor UI consistency as new features are added.
