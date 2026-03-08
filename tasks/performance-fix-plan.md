# Performance Fix Plan - Quick Start Guide

**Created:** 2026-03-08  
**Status:** Ready to implement

---

## 🎯 The Problem

The app is **laggy and slow** because:
1. ❌ 2070-line monolithic context causes cascading re-renders
2. ❌ Zero memoization (no React.memo, useMemo, useCallback)
3. ❌ Expensive calculations run on every render
4. ❌ Large components (1700+ lines) slow to mount
5. ❌ All widgets load upfront (no lazy loading)

---

## ⚡ Quick Win (1 Hour, Immediate Relief)

Add `React.memo` to all widget components. This alone will reduce re-renders by 30-50%.

### Step 1: Memoize Chart Components

Run this command to find all chart files:
```bash
find app/[locale]/dashboard/components/charts -name "*.tsx" -type f
```

Then wrap each component:
```typescript
// BEFORE
export default function EquityChart({ data, size }) {
  // ...
}

// AFTER
export default React.memo(function EquityChart({ data, size }) {
  // ...
})
```

### Step 2: Memoize Statistics Cards

Same for statistics:
```bash
find app/[locale]/dashboard/components/statistics -name "*.tsx" -type f
```

Wrap each card component with `React.memo`.

**Expected Result:** 30-50% fewer widget re-renders immediately.

---

## 🔥 Phase 1: Critical Fixes (1 Week, Major Impact)

### Fix 1.1: Split the Monolithic Context (Day 1-2)

Create 4 new files in `context/providers/`:

**`context/providers/trades-provider.tsx`**
```typescript
"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { Trade } from "@/lib/data-types"

interface TradesContextType {
  trades: Trade[]
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>
  refreshTrades: () => Promise<void>
}

const TradesContext = createContext<TradesContextType | null>(null)

export function TradesProvider({ children }: { children: React.ReactNode }) {
  // Move all trade-related state here from data-provider.tsx
  const [trades, setTrades] = useState<Trade[]>([])
  
  // Move trade fetching logic here
  const refreshTrades = async () => {
    // Implementation from data-provider.tsx
  }
  
  return (
    <TradesContext.Provider value={{ trades, setTrades, refreshTrades }}>
      {children}
    </TradesContext.Provider>
  )
}

export function useTrades() {
  const context = useContext(TradesContext)
  if (!context) throw new Error("useTrades must be used within TradesProvider")
  return context
}
```

**`context/providers/filters-provider.tsx`**
```typescript
"use client"
import { createContext, useContext } from "react"
import { DateRange, TickRange, PnlRange, TimeRange } from "@/lib/data-types"

interface FiltersContextType {
  instruments: string[]
  setInstruments: React.Dispatch<React.SetStateAction<string[]>>
  accountNumbers: string[]
  setAccountNumbers: React.Dispatch<React.SetStateAction<string[]>>
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  // ... other filter state
}

const FiltersContext = createContext<FiltersContextType | null>(null)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  // Move all filter state here
  const [instruments, setInstruments] = useState<string[]>([])
  // ... rest of filter state
  
  return (
    <FiltersContext.Provider value={{ instruments, setInstruments, /* ... */ }}>
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (!context) throw new Error("useFilters must be used within FiltersProvider")
  return context
}
```

**`context/providers/derived-provider.tsx`**
```typescript
"use client"
import { createContext, useContext, useMemo } from "react"
import { useTrades } from "./trades-provider"
import { useFilters } from "./filters-provider"
import { calculateStatistics, formatCalendarData } from "@/lib/utils"

interface DerivedContextType {
  formattedTrades: Trade[]
  statistics: StatisticsProps
  calendarData: CalendarData
}

const DerivedContext = createContext<DerivedContextType | null>(null)

export function DerivedProvider({ children }: { children: React.ReactNode }) {
  const { trades } = useTrades()
  const { instruments, accountNumbers, dateRange } = useFilters()
  
  // Memoize expensive calculations
  const formattedTrades = useMemo(() => {
    return trades.filter(trade => {
      // Apply filters
      if (instruments.length && !instruments.includes(trade.instrument)) return false
      if (accountNumbers.length && !accountNumbers.includes(trade.accountNumber)) return false
      // ... other filters
      return true
    })
  }, [trades, instruments, accountNumbers, dateRange])
  
  const statistics = useMemo(() => {
    return calculateStatistics(formattedTrades)
  }, [formattedTrades])
  
  const calendarData = useMemo(() => {
    return formatCalendarData(formattedTrades)
  }, [formattedTrades])
  
  return (
    <DerivedContext.Provider value={{ formattedTrades, statistics, calendarData }}>
      {children}
    </DerivedContext.Provider>
  )
}

export function useDerived() {
  const context = useContext(DerivedContext)
  if (!context) throw new Error("useDerived must be used within DerivedProvider")
  return context
}
```

**`context/providers/actions-provider.tsx`**
```typescript
"use client"
import { createContext, useContext } from "react"
import { useTrades } from "./trades-provider"

interface ActionsContextType {
  updateTrades: (tradeIds: string[], update: Partial<Trade>) => Promise<void>
  deleteTrades: (tradeIds: string[]) => Promise<void>
  // ... other actions
}

const ActionsContext = createContext<ActionsContextType | null>(null)

export function ActionsProvider({ children }: { children: React.ReactNode }) {
  const { refreshTrades } = useTrades()
  
  const updateTrades = async (tradeIds: string[], update: Partial<Trade>) => {
    // Move action logic here
  }
  
  // ... other actions
  
  return (
    <ActionsContext.Provider value={{ updateTrades, deleteTrades /* ... */ }}>
      {children}
    </ActionsContext.Provider>
  )
}

export function useActions() {
  const context = useContext(ActionsContext)
  if (!context) throw new Error("useActions must be used within ActionsProvider")
  return context
}
```

Then update `components/providers/dashboard-providers.tsx`:
```typescript
import { TradesProvider } from "@/context/providers/trades-provider"
import { FiltersProvider } from "@/context/providers/filters-provider"
import { DerivedProvider } from "@/context/providers/derived-provider"
import { ActionsProvider } from "@/context/providers/actions-provider"

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <TradesProvider>
      <FiltersProvider>
        <DerivedProvider>
          <ActionsProvider>
            <SyncContextProvider>
              <Toaster />
              {children}
            </SyncContextProvider>
          </ActionsProvider>
        </DerivedProvider>
      </FiltersProvider>
    </TradesProvider>
  )
}
```

**Expected Result:** 70-90% reduction in unnecessary re-renders.

---

### Fix 1.2: Memoize Expensive Computations (Day 3)

In `context/providers/derived-provider.tsx`, ensure all expensive operations are wrapped in `useMemo`:

```typescript
// ✅ GOOD: Memoized
const statistics = useMemo(() => {
  return calculateStatistics(formattedTrades)
}, [formattedTrades])

// ❌ BAD: Runs every render
const statistics = calculateStatistics(formattedTrades)
```

**Expected Result:** 90% reduction in calculation overhead.

---

### Fix 1.3: Add useCallback to Actions (Day 4)

In `context/providers/actions-provider.tsx`, wrap all action functions:

```typescript
const updateTrades = useCallback(async (tradeIds: string[], update: Partial<Trade>) => {
  // Action logic
}, [/* dependencies */])
```

**Expected Result:** 20-30% reduction in re-renders.

---

## 🚀 Phase 2: High Priority (Week 2, Significant Impact)

### Fix 2.1: Lazy Load Widgets (Day 5-6)

Update `app/[locale]/dashboard/config/widget-registry.tsx`:

```typescript
import dynamic from "next/dynamic"

// BEFORE: Static imports
import EquityChart from '../components/charts/equity-chart'

// AFTER: Dynamic imports
const EquityChart = dynamic(() => 
  import('../components/charts/equity-chart')
  .then(m => ({ default: m.default })),
  { 
    loading: () => <div className="animate-pulse h-full w-full bg-muted" />,
    ssr: false 
  }
)
```

Repeat for all 30+ widgets in the registry.

**Expected Result:** 40-60% faster initial dashboard load.

---

### Fix 2.2: Break Down Large Components (Day 7)

**`trade-table-review.tsx` (1733 lines)**

Split into:
```
components/tables/
  ├── trade-table-review.tsx (main, ~200 lines)
  ├── trade-table-row.tsx (row component, ~150 lines)
  ├── trade-table-filters.tsx (filters, ~200 lines)
  └── trade-table-pagination.tsx (pagination, ~100 lines)
```

**`accounts-overview.tsx` (1668 lines)**

Split into:
```
components/accounts/
  ├── accounts-overview.tsx (main, ~200 lines)
  ├── account-card.tsx (card component, ~200 lines)
  ├── account-stats.tsx (stats, ~150 lines)
  └── account-filters.tsx (filters, ~100 lines)
```

**Expected Result:** Faster component mounting, easier optimization.

---

## 📊 Measuring Success

### Before Starting

Run these commands to establish baselines:

```bash
# 1. Build and analyze bundle
npm run build
npm run analyze:bundle

# 2. Check route budgets
npm run check:route-budgets

# 3. Count client components
rg -l '"use client"' app/[locale]/dashboard/ | wc -l

# 4. Find largest components
find app/[locale]/dashboard/components -name "*.tsx" -exec wc -l {} + | sort -rn | head -10
```

### After Each Fix

1. Open Chrome DevTools → Performance tab
2. Record dashboard load
3. Check "Scripting" time (should decrease)
4. Check "Rendering" time (should decrease)
5. Count re-renders in React DevTools Profiler

### Target Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Dashboard load | 3-5s | 1-1.5s | 70% faster |
| Filter change | 500-1000ms | 50-100ms | 90% faster |
| Re-renders | All widgets | Affected only | 80% reduction |
| CPU during interactions | 80-100% | 20-30% | 75% reduction |

---

## 🎯 Execution Order

1. **Day 1:** Quick Win (React.memo on all widgets) → Test → Deploy
2. **Day 2-3:** Split contexts → Test → Deploy
3. **Day 4:** Add useMemo/useCallback → Test → Deploy
4. **Day 5-6:** Lazy load widgets → Test → Deploy
5. **Day 7:** Break down large components → Test → Deploy

**Deploy after each phase** to monitor impact and catch issues early.

---

## ⚠️ Common Pitfalls

### ❌ Don't: Split Everything
Not all components need splitting. Focus on:
- Components > 500 lines
- Components that re-render frequently
- Components with expensive calculations

### ❌ Don't: Memo Everything
Memoization has a cost. Only memoize:
- Expensive calculations
- Components that re-render often
- Functions passed to many children

### ❌ Don't: Forget Dependency Arrays
```typescript
// ❌ WRONG: Missing deps
useMemo(() => compute(data), [])

// ✅ RIGHT: Correct deps
useMemo(() => compute(data), [data])
```

### ❌ Don't: Optimize Blindly
Use React DevTools Profiler to identify actual bottlenecks before optimizing.

---

## 📝 Testing Checklist

After each fix:

- [ ] Dashboard loads without errors
- [ ] All widgets render correctly
- [ ] Filter changes work smoothly
- [ ] Trade updates work correctly
- [ ] Layout customization works
- [ ] Mobile responsiveness maintained
- [ ] No console errors
- [ ] Performance improved (measure it!)

---

## 🚀 Ready to Start?

1. ✅ Read the full analysis: `docs/audits/PERFORMANCE_ROOT_CAUSE_ANALYSIS.md`
2. ✅ Review the lessons: `tasks/lessons.md`
3. ✅ Start with Quick Win (React.memo)
4. ✅ Measure before and after
5. ✅ Deploy incrementally

**Let's make this app fast! 🏎️**
