# Dashboard 2.0: Component Unification & Advanced Widget Plan

This plan outlines the roadmap to unify the Qunt Edge dashboard using the newly created Design System (`Card`, `StatsCard`, `ActionCard`) and implement advanced analytical features.

## Phase 1: Component Unification (The "Matte" Upgrade)
**Objective**: Replace inconsistent generic UI code with the new proprietary `Card` system to ensure a "Financial Terminal" aesthetic across all 25+ widgets.

### 1.1 KPI & Statistics Widgets Refactor
- **Target**: `CumulativePnl`, `ProfitFactor`, `WinRate`, `RiskReward`
- **Action**: detailed refactor to use `<StatsCard />`.
- **Benefit**: Automatic trend arrows (`↑/↓`), standardized currency formatting, and "glanceability".

### 1.2 Chart Widgets Refactor
- **Target**: `EquityChart`, `PnLChart`, `TimeOfDay`
- **Action**: Wrap all charts in `<Card variant="matte">`.
- **Benefit**: Removes distractions. The "matte" variant is specifically designed for heavy data, blending the container into the background so the chart pops.

### 1.3 Action & Setup Widgets
- **Target**: `AddWidgetSheet`, `ConnectAccount` visuals.
- **Action**: Use `<ActionCard />` for empty states and setup steps.

## Phase 2: Advanced "High-Value" Widgets
**Objective**: Build the missing analytical tools identified in the ecosystem analysis.

### 2.1 📉 Drawdown Simulator Widget
*   **Concept**: A dedicated chart showing "Distance from All-Time High".
*   **Why**: Equity charts hide the emotional pain of drawdowns.
*   **Tech**: Recharts area chart, red gradient fill.

### 2.2 🔥 Risk Heatmap Widget
*   **Concept**: A treemap or grid showing exposure by Asset Class or Instrument.
*   **Why**: "Am I over-leveraged in NQ while shorting ES?"
*   **Tech**: Custom grid layout using the `Card` system.

### 2.3 🧠 Mindset & Journaling 2.0
*   **Concept**: Enhance the `MindsetWidget` to allow text entry directly on the dashboard (Mini-Journal).
*   **Tech**: Rich text editor integrated into a `<Card variant="glass">`.

## Phase 3: "Persona" Layout System
**Objective**: Move beyond a single "Default" layout to role-based workspaces.

### 3.1 Layout Engine Update
- **File**: `lib/default-layouts.ts`
- **Action**: Export multiple layout constants:
    - `SCALPER_LAYOUT`: Focus on `TickDistribution`, `TimeInPosition`.
    - `SWING_LAYOUT`: Focus on `Calendar`, `EquityChart`.
    - `JOURNAL_LAYOUT`: Focus on `Mindset`, `Chat`, `history`.

### 3.2 UI Implementation
- **File**: `DashboardHeader` / `AddWidgetSheet`
- **Action**: Add a "Reset Layout" dropdown that lets the user choose their Persona.

## Phase 4: Implementation Roadmap & Checklist

- [ ] **Step 1**: Migrate `StatisticsWidget` (the 2x2 grid) to use new sub-components.
- [ ] **Step 2**: Create `DrawdownWidget`.
- [ ] **Step 3**: Update `widget-registry.tsx` to include new widgets.
- [ ] **Step 4**: Implement "Layout Selector" in the UI.

## Immediate Next Step
I recommend we start with **Step 1**: Refactoring the KPIs to prove the new design system, then build the **Drawdown Widget**.
