# Architecture Refactoring Plan: Qunt Edge

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current monolithic Next.js app structure into a modular, feature-based architecture with separated concerns (AI, Trading, Charts, UI).

**Architecture:** Monorepo-style reorganization within existing Next.js structure. Move from "UI folder by type" to "Feature folder by domain."

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Recharts, Prisma

---

## Current State (Problems Identified)

### 1. Route Groups Overused
```
app/[locale]/(home)
app/[locale]/(landing)
app/[locale]/(authentication)
```
These are Next.js route groups used like regular folders - confusing.

### 2. Dashboard Component Dumping Ground
```
app/[locale]/dashboard/components/
├── charts/          (15 files)
├── tables/
├── widgets/
├── filters/
├── imports/         (10+ integrations)
├── mindset/
├── calendar/
├── accounts/
├── chat/
└── statistics/
```
35+ subdirectories - impossible to maintain.

### 3. AI System Mixed with API Layer
```
app/api/ai/
├── chat/tools/           (10+ tool files)
├── chat/prompts/         (6 prompt files)
├── editor/tools/
├── support/tools/
├── analysis/accounts/
├── analysis/instrument/
├── analysis/time-of-day/
└── analysis/global/
```
Business logic living inside API routes - backwards.

### 4. Chart Duplication
- `app/[locale]/dashboard/components/charts/*` (16 chart components)
- Potential duplicates in embed/components

### 5. Import System is Massive
```
app/[locale]/dashboard/components/import/
├── tradovate/
├── rithmic/
├── atas/
├── ninjatrader/
├── topstep/
├── quantower/
├── ibkr/
├── tradezella/
├── ftmo/
├── etp/
├── thor/
└── manual/
```
12 integrations in a UI folder - should be backend module.

---

## Target Architecture

```
qunt-edge/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (thin)
│   │   └── ai/
│   │       ├── chat/route.ts
│   │       ├── editor/route.ts
│   │       └── support/route.ts
│   └── [locale]/
│       ├── (marketing)/          # Route group for public pages
│       │   ├── home/
│       │   ├── pricing/
│       │   ├── propfirms/
│       │   ├── community/
│       │   └── deals/
│       ├── (auth)/               # Authentication routes
│       │   └── authentication/
│       ├── dashboard/            # Core app (flat structure)
│       │   ├── page.tsx
│       │   ├── accounts/
│       │   ├── trades/
│       │   ├── calendar/
│       │   ├── mindset/
│       │   └── chat/
│       ├── teams/
│       └── admin/
│
├── packages/                     # Shared packages (exports)
│   ├── ai/
│   │   ├── tools/               # Extracted from app/api/ai
│   │   ├── prompts/
│   │   ├── router/
│   │   ├── safety/
│   │   └── models/
│   │
│   ├── trading/
│   │   ├── analytics/           # Performance calculations
│   │   ├── imports/             # Integration adapters
│   │   │   ├── tradovate/
│   │   │   ├── rithmic/
│   │   │   ├── atas/
│   │   │   ├── ibkr/
│   │   │   └── ...
│   │   └── performance/
│   │
│   ├── charts/                  # Shared chart components
│   │   ├── pnl/
│   │   ├── distribution/
│   │   ├── time/
│   │   └── equity/
│   │
│   └── ui/                      # Shared UI (exists partially)
│       ├── components/
│       ├── layout/
│       └── widgets/
│
├── server/                      # Server actions & logic
│   ├── trades.ts
│   ├── accounts.ts
│   ├── groups.ts
│   └── ...
│
├── lib/                         # Utilities (exists)
│
├── components/                  # Shared components (exists)
│   └── ui/
│
└── context/                     # React contexts (exists)
```

---

## Phase 1: Create Package Structure

### Task 1.1: Create packages directory and exports

**Files:**
- Create: `packages/ai/index.ts` - Main AI package exports
- Create: `packages/ai/tools/index.ts` - Tool exports
- Create: `packages/ai/prompts/index.ts` - Prompt exports
- Create: `packages/trading/index.ts` - Trading package exports
- Create: `packages/trading/analytics/index.ts`
- Create: `packages/trading/imports/index.ts`
- Create: `packages/charts/index.ts` - Chart exports

- [ ] Create `packages/ai/package.json` with name `@quntedge/ai`
- [ ] Create `packages/trading/package.json` with name `@quntedge/trading`
- [ ] Create `packages/charts/package.json` with name `@quntedge/charts`
- [ ] Create root `tsconfig.json` references to packages
- [ ] Update root `next.config.ts` to support package imports

---

## Phase 2: Extract AI System

### Task 2.1: Move AI tools to packages/ai/tools

**Files to move (17 files):**
- Move: `app/api/ai/chat/tools/get-trades-details.ts` → `packages/ai/tools/get-trades-details.ts`
- Move: `app/api/ai/chat/tools/get-trades-summary.ts` → `packages/ai/tools/get-trades-summary.ts`
- Move: `app/api/ai/chat/tools/get-overall-performance-metrics.ts` → `packages/ai/tools/get-overall-performance-metrics.ts`
- Move: `app/api/ai/chat/tools/get-week-summary-for-date.ts` → `packages/ai/tools/get-week-summary-for-date.ts`
- Move: `app/api/ai/chat/tools/get-previous-week-summary.ts` → `packages/ai/tools/get-previous-week-summary.ts`
- Move: `app/api/ai/chat/tools/get-current-week-summary.ts` → `packages/ai/tools/get-current-week-summary.ts`
- Move: `app/api/ai/chat/tools/generate-equity-chart.ts` → `packages/ai/tools/generate-equity-chart.ts`
- Move: `app/api/ai/chat/tools/get-most-traded-instruments.ts` → `packages/ai/tools/get-most-traded-instruments.ts`
- Move: `app/api/ai/chat/tools/get-performance-trends.ts` → `packages/ai/tools/get-performance-trends.ts`
- Move: `app/api/ai/chat/tools/get-time-of-day-performance.ts` → `packages/ai/tools/get-time-of-day-performance.ts`
- Move: `app/api/ai/chat/tools/get-instrument-performance.ts` → `packages/ai/tools/get-instrument-performance.ts`
- Move: `app/api/ai/chat/tools/get-last-trade-data.ts` → `packages/ai/tools/get-last-trade-data.ts`
- Move: `app/api/ai/chat/tools/ask-for-location.ts` → `packages/ai/tools/ask-for-location.ts`
- Move: `app/api/ai/chat/tools/get-financial-news.ts` → `packages/ai/tools/get-financial-news.ts`
- Move: `app/api/ai/chat/tools/get-journal-entries.ts` → `packages/ai/tools/get-journal-entries.ts`
- Move: `app/api/ai/chat/tools/ask-for-confirmation.ts` → `packages/ai/tools/ask-for-confirmation.ts`
- Move: `app/api/ai/chat/tools/get-previous-conversation.ts` → `packages/ai/tools/get-previous-conversation.ts`

**Editor tools (2 files):**
- Move: `app/api/ai/editor/tools/get-trading-summary.ts` → `packages/ai/tools/editor/trading-summary.ts`
- Move: `app/api/ai/editor/tools/get-current-day-data.ts` → `packages/ai/tools/editor/current-day-data.ts`

**Support tools (5 files):**
- Move: `app/api/ai/support/tools/ask-for-email-form.ts` → `packages/ai/tools/support/ask-for-email-form.ts`
- Move: `app/api/ai/support/tools/provide-initial-response.ts` → `packages/ai/tools/support/provide-initial-response.ts`
- Move: `app/api/ai/support/tools/gather-user-context.ts` → `packages/ai/tools/support/gather-user-context.ts`
- Move: `app/api/ai/support/tools/analyze-issue-complexity.ts` → `packages/ai/tools/support/analyze-issue-complexity.ts`
- Move: `app/api/ai/support/tools/ask-for-human-help.ts` → `packages/ai/tools/support/ask-for-human-help.ts`

- [ ] Create `packages/ai/tools/index.ts` exporting all tools
- [ ] Update imports in `app/api/ai/chat/route.ts` to use `from '@/packages/ai/tools'`
- [ ] Update imports in `app/api/ai/editor/route.ts`
- [ ] Update imports in `app/api/ai/support/route.ts`
- [ ] Run `npm run typecheck` to verify

### Task 2.2: Move AI prompts to packages/ai/prompts

**Files to move (6 files):**
- Move: `app/api/ai/chat/prompts/style.ts` → `packages/ai/prompts/style.ts`
- Move: `app/api/ai/chat/prompts/index.ts` → `packages/ai/prompts/index.ts`
- Move: `app/api/ai/chat/prompts/tools.ts` → `packages/ai/prompts/tools.ts`
- Move: `app/api/ai/chat/prompts/formatting.ts` → `packages/ai/prompts/formatting.ts`
- Move: `app/api/ai/chat/prompts/initialization.ts` → `packages/ai/prompts/initialization.ts`
- Move: `app/api/ai/chat/prompts/capabilities.ts` → `packages/ai/prompts/capabilities.ts`
- Move: `app/api/ai/chat/prompts/base.ts` → `packages/ai/prompts/base.ts`

- [ ] Create `packages/ai/prompts/index.ts` exporting all prompts
- [ ] Update imports in chat route

### Task 2.3: Consolidate AI Analysis endpoints

**Current (4 endpoints):**
```
/api/ai/analysis/accounts
/api/ai/analysis/instrument
/api/ai/analysis/time-of-day
/api/ai/analysis/global
```

**After (1 endpoint):**
```
/api/ai/analyze
```

**Input:**
```json
{
  "type": "accounts" | "instrument" | "time-of-day" | "global"
}
```

- [ ] Create `packages/ai/analysis/index.ts` with unified analysis logic
- [ ] Create `app/api/ai/analyze/route.ts` (new single endpoint)
- [ ] Deprecate old endpoints (add redirects or 410 Gone)
- [ ] Update any frontend callers

---

## Phase 3: Extract Charts System

### Task 3.1: Move dashboard charts to packages/charts

**Files to move (16 files):**
- Move: `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx` → `packages/charts/pnl-bar-chart.tsx`
- Move: `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx` → `packages/charts/pnl-time-bar-chart.tsx`
- Move: `app/[locale]/dashboard/components/charts/contract-quantity.tsx` → `packages/charts/contract-quantity.tsx`
- Move: `app/[locale]/dashboard/components/charts/commissions-pnl.tsx` → `packages/charts/commissions-pnl.tsx`
- Move: `app/[locale]/dashboard/components/charts/trade-distribution.tsx` → `packages/charts/trade-distribution.tsx`
- Move: `app/[locale]/dashboard/components/charts/equity-chart.tsx` → `packages/charts/equity-chart.tsx`
- Move: `app/[locale]/dashboard/components/charts/daily-tick-target.tsx` → `packages/charts/daily-tick-target.tsx`
- Move: `app/[locale]/dashboard/components/charts/time-range-performance.tsx` → `packages/charts/time-range-performance.tsx`
- Move: `app/[locale]/dashboard/components/charts/tick-distribution.tsx` → `packages/charts/tick-distribution.tsx`
- Move: `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx` → `packages/charts/pnl-per-contract-daily.tsx`
- Move: `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx` → `packages/charts/pnl-per-contract.tsx`
- Move: `app/[locale]/dashboard/components/charts/time-in-position.tsx` → `packages/charts/time-in-position.tsx`
- Move: `app/[locale]/dashboard/components/charts/pnl-by-side.tsx` → `packages/charts/pnl-by-side.tsx`
- Move: `app/[locale]/dashboard/components/charts/account-selection-popover.tsx` → `packages/charts/account-selection-popover.tsx`
- Move: `app/[locale]/dashboard/components/charts/weekday-pnl.tsx` → `packages/charts/weekday-pnl.tsx`

- [ ] Create `packages/charts/index.ts` exporting all charts
- [ ] Create `packages/charts/components/` wrapper for shared chart UI
- [ ] Update imports in dashboard components to use `@quntedge/charts`
- [ ] Check for duplicate charts in embed/ and remove duplicates

### Task 3.2: Create shared chart utilities

- [ ] Create `packages/charts/lib/formatters.ts` - Number/date formatting
- [ ] Create `packages/charts/lib/colors.ts` - Color tokens
- [ ] Create `packages/charts/lib/types.ts` - Shared chart types

---

## Phase 4: Extract Trading Imports

### Task 4.1: Move import integrations to packages/trading/imports

**Files to move (12 integrations):**
- Move: `app/[locale]/dashboard/components/import/tradovate/` → `packages/trading/imports/tradovate/`
- Move: `app/[locale]/dashboard/components/import/rithmic/` → `packages/trading/imports/rithmic/`
- Move: `app/[locale]/dashboard/components/import/atas/` → `packages/trading/imports/atas/`
- Move: `app/[locale]/dashboard/components/import/ninjatrader/` → `packages/trading/imports/ninjatrader/`
- Move: `app/[locale]/dashboard/components/import/topstep/` → `packages/trading/imports/topstep/`
- Move: `app/[locale]/dashboard/components/import/quantower/` → `packages/trading/imports/quantower/`
- Move: `app/[locale]/dashboard/components/import/ibkr-pdf/` → `packages/trading/imports/ibkr/`
- Move: `app/[locale]/dashboard/components/import/tradezella/` → `packages/trading/imports/tradezella/`
- Move: `app/[locale]/dashboard/components/import/ftmo/` → `packages/trading/imports/ftmo/`
- Move: `app/[locale]/dashboard/components/import/etp/` → `packages/trading/imports/etp/`
- Move: `app/[locale]/dashboard/components/import/thor/` → `packages/trading/imports/thor/`
- Move: `app/[locale]/dashboard/components/import/manual/` → `packages/trading/imports/manual/`

**Also move API routes:**
- Move: `app/api/imports/ibkr/*` → `packages/trading/imports/ibkr/api/`
- Move: `app/api/thor/store/route.ts` → `packages/trading/imports/thor/api/store.ts`
- Move: `app/api/etp/v1/store/route.ts` → `packages/trading/imports/etp/api/store.ts`

- [ ] Create `packages/trading/imports/index.ts` - Base interface for imports
- [ ] Create `packages/trading/imports/types.ts` - Common import types
- [ ] Update dashboard import UI to use package imports
- [ ] Run tests to verify import flows still work

### Task 4.2: Create import adapter pattern

- [ ] Define `ImportAdapter` interface in `packages/trading/imports/base.ts`
- [ ] Each import implements: `parse()`, `validate()`, `transform()`, `save()`
- [ ] Create factory function to get appropriate adapter

---

## Phase 5: Dashboard Restructure

### Task 5.1: Flatten dashboard components

**Before:**
```
dashboard/components/
├── charts/
├── tables/
├── widgets/
├── filters/
├── accounts/
├── calendar/
├── mindset/
├── chat/
└── statistics/
```

**After (Feature-based):**
```
dashboard/
├── page.tsx
├── accounts/
│   ├── overview/
│   ├── table/
│   └── config/
├── trades/
│   ├── table/
│   ├── editing/
│   └── import/
├── analytics/
│   ├── charts/
│   ├── statistics/
│   └── widgets/
├── calendar/
├── mindset/
└── chat/
```

- [ ] Create new feature directories under `app/[locale]/dashboard/`
- [ ] Move `components/tables/trade-table*.tsx` → `dashboard/trades/table/`
- [ ] Move `components/accounts/*` → `dashboard/accounts/`
- [ ] Move `components/statistics/*` → `dashboard/analytics/statistics/`
- [ ] Move `components/widgets/*` → `dashboard/analytics/widgets/`
- [ ] Move `components/calendar/*` → `dashboard/calendar/`
- [ ] Move `components/mindset/*` → `dashboard/mindset/`
- [ ] Move `components/chat/*` → `dashboard/chat/`
- [ ] Delete empty `components/` directory when done

### Task 5.2: Update imports across dashboard

- [ ] Run `npm run typecheck` to find broken imports
- [ ] Fix all import paths
- [ ] Run lint and fix any issues

---

## Phase 6: Marketing Pages Cleanup

### Task 6.1: Consolidate landing pages

**Current scattered:**
```
(landing)/home
(landing)/propfirms
(landing)/deals
(landing)/community
(landing)/updates
(landing)/pricing
(landing)/referral
(landing)/newsletter
(landing)/disclaimers
(landing)/faq
(landing)/about
(landing)/support
```

**After:**
```
[locale]/
├── (marketing)/          # Route group (rare use)
│   ├── home/
│   ├── pricing/
│   ├── propfirms/
│   ├── community/
│   ├── deals/
│   ├── blog/             # /updates → /blog
│   ├── referral/
│   └── legal/            # disclaimers, privacy, terms
```

- [ ] Create `(marketing)` route group
- [ ] Move all landing pages into group
- [ ] Rename `updates/` → `blog/`
- [ ] Create `legal/` for policy pages

### Task 6.2: Remove route group antipattern

- [ ] Remove `(home)` - make it `home/`
- [ ] Remove `(landing)` - consolidate to `(marketing)`
- [ ] Remove `(authentication)` - make it `auth/`

---

## Phase 7: Delete Legacy/Duplicates

### Task 7.1: Identify duplicates

Run analysis to find:
- [ ] Duplicate chart components
- [ ] Unused components
- [ ] Legacy import files
- [ ] Dead code in lib/

### Task 7.2: Delete confirmed duplicates

Based on analysis:
- [ ] Remove duplicate pnl-bar-chart if exists in embed/
- [ ] Remove unused components in `components/legacy/`
- [ ] Clean up `lib/deprecated/`

---

## Phase 8: Documentation

### Task 8.1: Create architecture docs

- [ ] Create `docs/architecture/app-structure.md` - Current structure
- [ ] Create `docs/architecture/packages.md` - Package organization
- [ ] Create `docs/architecture/imports.md` - Import system
- [ ] Update `docs/ai-system.md` to reflect new location
- [ ] Update `README.md` with new structure

---

## Execution Order (Critical Path)

```
Phase 1: Create Package Structure
    ↓
Phase 2: Extract AI System (HIGHEST RISK - many imports)
    ↓
Phase 3: Extract Charts (MEDIUM RISK - many consumers)
    ↓
Phase 4: Extract Trading Imports (MEDIUM RISK - API routes)
    ↓
Phase 5: Dashboard Restructure (HIGHEST IMPACT - visible)
    ↓
Phase 6: Marketing Cleanup (LOW RISK - isolated)
    ↓
Phase 7: Delete Duplicates (LOW RISK - cleanup only)
    ↓
Phase 8: Documentation (ALWAYS LAST)
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken imports | HIGH | Run typecheck after each task |
| Runtime errors | HIGH | Run full test suite before commit |
| Dashboard breaks | HIGH | Test each tab after restructure |
| Import failures | MEDIUM | Test each import integration |
| Build failures | HIGH | Run build before each commit |

---

## Verification Commands

Run after EACH task:

```bash
# 1. Type check
npm run typecheck

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Tests
npm test
```

All must pass before proceeding to next task.

---

## Estimated Timeline

- **Phase 1**: 30 min
- **Phase 2**: 2 hours (most complex)
- **Phase 3**: 1 hour
- **Phase 4**: 1.5 hours
- **Phase 5**: 2 hours
- **Phase 6**: 30 min
- **Phase 7**: 30 min
- **Phase 8**: 30 min

**Total**: ~8 hours (can be split across multiple sessions)

---

## Before Starting

1. Create backup branch: `git backup-before-refactor`
2. Commit all current changes
3. Run baseline tests: `npm test && npm run build`
4. Ensure clean state before starting

---

## Rollback Plan

If something goes wrong:

```bash
# Abort and restore
git checkout backup-before-refactor -- .
git branch -D backup-before-refactor
```

**Note:** This plan assumes no breaking changes to the database schema or API contracts. If those are needed, add migration tasks.
