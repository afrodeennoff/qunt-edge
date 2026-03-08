# Performance Fix Implementation Guide

**Created:** 2026-03-08  
**Status:** Ready to implement

---

## ⚡ QUICK WIN (1 Hour - Do This First)

Add `React.memo` to all widget components. This will provide **immediate relief**.

### Step 1: Memoize All Chart Components

Run this to find all charts:
```bash
find app/[locale]/dashboard/components/charts -name "*.tsx" -type f
```

For each file, wrap with `React.memo`:

```typescript
// BEFORE
export default function EquityChart({ data, size }) {
  // Component code
}

// AFTER
export default React.memo(function EquityChart({ data, size }) {
  // Component code
})
```

### Step 2: Memoize All Statistics Cards

```bash
find app/[locale]/dashboard/components/statistics -name "*.tsx" -type f
```

Same pattern - wrap each with `React.memo`.

**Expected Result:** 30-50% fewer re-renders within 1 hour.

---

## 🔥 DAY 1-2: Split the Monolithic Context

Create 4 new provider files to replace the 2070-line monolith.

### 1. Create `context/providers/trades-provider.tsx`

```typescript
"use client"
import { createContext, useContext, useState, useCallback } from "react"
import { Trade } from "@/lib/data-types"

interface TradesContextType {
  trades: Trade[]
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>
  refreshTrades: () => Promise<void>
  updateTrades: (ids: string[], update: Partial<Trade>) => Promise<void>
  deleteTrades: (ids: string[]) => Promise<void>
}

const TradesContext = createContext<TradesContextType | null>(null)

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([])
  
  // Move trade-related logic from data-provider.tsx here
  const refreshTrades = useCallback(async () => {
    // Implementation from data-provider.tsx
  }, [])
  
  const updateTrades = useCallback(async (ids, update) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const deleteTrades = useCallback(async (ids) => {
    // Implementation from data-provider.tsx
  }, [])
  
  return (
    <TradesContext.Provider value={{ trades, setTrades, refreshTrades, updateTrades, deleteTrades }}>
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

### 2. Create `context/providers/filters-provider.tsx`

```typescript
"use client"
import { createContext, useContext, useState } from "react"
import { DateRange, TickRange, PnlRange } from "@/lib/data-types"

interface FiltersContextType {
  instruments: string[]
  setInstruments: React.Dispatch<React.SetStateAction<string[]>>
  accountNumbers: string[]
  setAccountNumbers: React.Dispatch<React.SetStateAction<string[]>>
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  tickRange: TickRange
  setTickRange: React.Dispatch<React.SetStateAction<TickRange>>
  pnlRange: PnlRange
  setPnlRange: React.Dispatch<React.SetStateAction<PnlRange>>
}

const FiltersContext = createContext<FiltersContextType | null>(null)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [instruments, setInstruments] = useState<string[]>([])
  const [accountNumbers, setAccountNumbers] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [tickRange, setTickRange] = useState<TickRange>({ min: undefined, max: undefined })
  const [pnlRange, setPnlRange] = useState<PnlRange>({ min: undefined, max: undefined })
  
  return (
    <FiltersContext.Provider value={{
      instruments, setInstruments,
      accountNumbers, setAccountNumbers,
      dateRange, setDateRange,
      tickRange, setTickRange,
      pnlRange, setPnlRange
    }}>
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

### 3. Create `context/providers/derived-provider.tsx`

```typescript
"use client"
import { createContext, useContext, useMemo } from "react"
import { useTrades } from "./trades-provider"
import { useFilters } from "./filters-provider"
import { calculateStatistics, formatCalendarData, startOfDay, endOfDay } from "@/lib/utils"
import { StatisticsProps, CalendarData, Trade } from "@/lib/data-types"

interface DerivedContextType {
  formattedTrades: Trade[]
  statistics: StatisticsProps
  calendarData: CalendarData
}

const DerivedContext = createContext<DerivedContextType | null>(null)

export function DerivedProvider({ children }: { children: React.ReactNode }) {
  const { trades } = useTrades()
  const { instruments, accountNumbers, dateRange, tickRange, pnlRange } = useFilters()
  
  // ✅ Memoize expensive filtering
  const formattedTrades = useMemo(() => {
    if (!trades.length) return []
    
    return trades.filter(trade => {
      // Apply filters
      if (instruments.length && !instruments.includes(trade.instrument)) return false
      if (accountNumbers.length && !accountNumbers.includes(trade.accountNumber)) return false
      if (dateRange?.from) {
        const tradeDate = new Date(trade.entryDate)
        if (tradeDate < startOfDay(dateRange.from)) return false
      }
      if (dateRange?.to) {
        const tradeDate = new Date(trade.entryDate)
        if (tradeDate > endOfDay(dateRange.to)) return false
      }
      if (tickRange.min !== undefined && trade.ticketCount < tickRange.min) return false
      if (tickRange.max !== undefined && trade.ticketCount > tickRange.max) return false
      if (pnlRange.min !== undefined && trade.pnl < pnlRange.min) return false
      if (pnlRange.max !== undefined && trade.pnl > pnlRange.max) return false
      
      return true
    })
  }, [trades, instruments, accountNumbers, dateRange, tickRange, pnlRange])
  
  // ✅ Memoize expensive statistics calculation
  const statistics = useMemo(() => {
    return calculateStatistics(formattedTrades)
  }, [formattedTrades])
  
  // ✅ Memoize expensive calendar formatting
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

### 4. Create `context/providers/actions-provider.tsx`

```typescript
"use client"
import { createContext, useContext, useCallback } from "react"
import { useTrades } from "./trades-provider"
import { Account, Group, Payout } from "@/lib/data-types"

interface ActionsContextType {
  saveAccount: (account: Account) => Promise<void>
  deleteAccount: (account: Account) => Promise<void>
  saveGroup: (name: string) => Promise<Group | undefined>
  deleteGroup: (groupId: string) => Promise<void>
  savePayout: (payout: Payout) => Promise<void>
  deletePayout: (payoutId: string) => Promise<void>
}

const ActionsContext = createContext<ActionsContextType | null>(null)

export function ActionsProvider({ children }: { children: React.ReactNode }) {
  const { refreshTrades } = useTrades()
  
  // ✅ Memoize action functions
  const saveAccount = useCallback(async (account: Account) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const deleteAccount = useCallback(async (account: Account) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const saveGroup = useCallback(async (name: string) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const deleteGroup = useCallback(async (groupId: string) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const savePayout = useCallback(async (payout: Payout) => {
    // Implementation from data-provider.tsx
  }, [])
  
  const deletePayout = useCallback(async (payoutId: string) => {
    // Implementation from data-provider.tsx
  }, [])
  
  return (
    <ActionsContext.Provider value={{
      saveAccount, deleteAccount, saveGroup, deleteGroup, savePayout, deletePayout
    }}>
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

### 5. Update Dashboard Providers

Edit `components/providers/dashboard-providers.tsx`:

```typescript
import { TradesProvider } from "@/context/providers/trades-provider"
import { FiltersProvider } from "@/context/providers/filters-provider"
import { DerivedProvider } from "@/context/providers/derived-provider"
import { ActionsProvider } from "@/context/providers/actions-provider"
import { SyncContextProvider } from "@/context/sync-context"
import { Toaster } from "@/components/ui/sonner"

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

### 6. Update Component Imports

Find all components using `useData()` and update to use specific hooks:

```typescript
// BEFORE
import { useData } from '@/context/data-provider'

function MyWidget() {
  const { trades, statistics, formattedTrades } = useData()
}

// AFTER
import { useTrades, useDerived } from '@/context/providers/trades-provider'

function MyWidget() {
  const { trades } = useTrades()
  const { statistics, formattedTrades } = useDerived()
}
```

**Expected Result:** 70-90% reduction in unnecessary re-renders.

---

## 🚀 DAY 3-4: Memoize Expensive Computations

### In All Widget Components

For every chart and statistics card, wrap expensive operations:

```typescript
// ❌ BEFORE: Runs on every render
export default function MyWidget() {
  const { trades } = useTrades()
  
  const filtered = trades.filter(t => t.pnl > 0)
  const stats = calculateStatistics(filtered)
  
  return <div>{/* render */}</div>
}

// ✅ AFTER: Only runs when trades change
export default React.memo(function MyWidget() {
  const { trades } = useTrades()
  
  const filtered = useMemo(() => 
    trades.filter(t => t.pnl > 0),
    [trades]
  )
  
  const stats = useMemo(() => 
    calculateStatistics(filtered),
    [filtered]
  )
  
  return <div>{/* render */}</div>
})
```

**Expected Result:** 90% reduction in calculation overhead.

---

## 📊 DAY 5-7: Lazy Load Widgets

### Update Widget Registry

Edit `app/[locale]/dashboard/config/widget-registry.tsx`:

```typescript
import dynamic from "next/dynamic"

// BEFORE: Static imports
import EquityChart from '../components/charts/equity-chart'

// AFTER: Dynamic imports
const EquityChart = dynamic(() => 
  import('../components/charts/equity-chart')
  .then(m => ({ default: m.default })),
  { 
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted" />
    ),
    ssr: false 
  }
)
```

Repeat for all 30+ widgets in the registry.

**Expected Result:** 40-60% faster initial dashboard load.

---

## 📏 Testing Your Changes

### Before Starting

```bash
# Open Chrome DevTools → Performance tab
# 1. Load dashboard and record
# 2. Note "Scripting" time
# 3. Note "Rendering" time
# 4. Change a filter and record
# 5. Count re-renders in React DevTools
```

### After Each Fix

- [ ] Dashboard loads without errors
- [ ] All widgets render correctly
- [ ] Filter changes work smoothly
- [ ] Trade updates work correctly
- [ ] No console errors
- [ ] Performance improved (measure it!)

---

## 🎯 Target Metrics

### After Week 1
- Dashboard load: 3-5s → 1-1.5s ⚡
- Filter changes: 500-1000ms → 50-100ms ⚡
- Re-renders: 20+ → 1-3 ⚡
- CPU usage: 80-100% → 20-30% ⚡

---

**Start with the Quick Win (React.memo) - you'll see immediate improvement!**
