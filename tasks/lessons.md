# Delivery Lessons

**Last Updated:** 2026-03-08

---

## Lesson: Do not claim work is finished when it is partial

### What happened
I reported completion while significant performance fixes (data-provider split + heavy computation memoization) were still pending.

### Fix
Explicitly state remaining work and ask for confirmation before claiming completion.

### Rule
Never mark work finished unless all agreed fixes are implemented and verified.

---

# Performance Optimization Lessons Learned

**Last Updated:** 2026-03-08

---

## Lesson: Deliver a Full End-to-End Audit on Request

### What happened
The user explicitly asked for an end-to-end audit. A partial summary is not enough.

### Fix
When asked for an end-to-end audit, provide: bundle/route budgets, client-render hotspots, context architecture, large component analysis, rendering patterns, and explicit root-cause evidence.

### Rule
If the request says "end to end audit", run a holistic sweep and present all sections in one consolidated report.

---


**Last Updated:** 2026-03-08

---

## Key Insight: Bundle Size ≠ Runtime Performance

### The Problem
Previous optimization attempts focused on reducing bundle sizes and lazy-loading overlays. While these are important, they **didn't address the root cause** of lag and slowness.

### The Reality
- ✅ Bundle sizes are within budget (dashboard routes: 54-63 KB)
- ❌ Runtime performance is terrible due to React rendering issues
- ❌ Users experience lag despite small bundles

### Lesson Learned
**Before optimizing bundle size, optimize React rendering patterns.**

---

## Root Cause: Monolithic Context Architecture

### What We Found
- `context/data-provider.tsx`: **2070 lines** of monolithic context
- Combines 4 separate concerns: data, filters, derived values, actions
- Every state change triggers re-renders across entire dashboard

### Why It's Slow
```typescript
// BAD: One giant context
const DataContext = createContext({
  trades: [],
  filters: {},
  statistics: {},
  actions: {}
})

// When filters change:
// 1. Context value updates
// 2. ALL consumers re-render
// 3. Statistics recompute (expensive)
// 4. All widgets re-render (unnecessary)
```

### The Fix
```typescript
// GOOD: Split contexts
context/providers/
  ├── trades-provider.tsx    // Only trade consumers
  ├── filters-provider.tsx   // Only filter consumers
  ├── derived-provider.tsx   // Only stats consumers
  └── actions-provider.tsx   // Only action consumers

// When filters change:
// 1. Filter context updates
// 2. Only filter consumers re-render
// 3. Derived context recomputes (memoized)
// 4. Only affected widgets re-render
```

---

## The Memoization Gap

### What We Found
- **Zero** `React.memo` usage in dashboard components
- **Zero** `useMemo` for expensive computations
- **Zero** `useCallback` for event handlers

### Why It's Critical
Every time a parent re-renders:
- All children re-render (unless memoized)
- Expensive calculations run again (unless memoized)
- Event handlers are recreated (unless useCallback'd)

### The Fix Pattern
```typescript
// 1. Memoize expensive calculations
const formattedTrades = useMemo(() =>
  trades.filter(/* expensive logic */),
  [trades, filters] // Only recompute when these change
)

// 2. Memoize components
const MyWidget = React.memo(({ data }) => {
  // Component only re-renders when data changes
})

// 3. Memoize callbacks
const handleClick = useCallback(() => {
  // Function reference stays stable
}, [dependencies])
```

---

## Large Component Anti-Pattern

### What We Found
- `trade-table-review.tsx`: 1733 lines
- `accounts-overview.tsx`: 1668 lines
- `equity-chart.tsx`: 1029 lines

### Why It's a Problem
- Larger components = slower to mount
- Harder to optimize specific parts
- Difficult to reason about performance

### The Fix
Split into smaller, focused components:
```typescript
// BEFORE: 1733-line monolith
export default function TradeTableReview() {
  // 1733 lines of code
}

// AFTER: Focused components
export default function TradeTableReview() {
  return (
    <>
      <TradeTableFilters />
      <TradeTableList />
      <TradeTablePagination />
    </>
  )
}
```

---

## Static Widget Imports

### What We Found
```typescript
// widget-registry.tsx
import EquityChart from '../components/charts/equity-chart'
import TickDistributionChart from '../components/charts/tick-distribution'
// ... 30+ static imports
```

### Why It's Slow
- All widget code loads upfront
- Unused widgets still in bundle
- Slower initial dashboard load

### The Fix
```typescript
// Use next/dynamic for all widgets
const EquityChart = dynamic(() =>
  import('../components/charts/equity-chart')
)
```

---

## Animation Overkill

### What We Found
```typescript
// widget-canvas.tsx
<motion.div
  initial={{ opacity: 0, y: 18, scale: 0.985 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: "spring",
    stiffness: 165,
    damping: 21,
  }}
>
```

### Why It's Expensive
- Spring animations are CPU-intensive
- Running on 20+ widgets simultaneously
- Every widget animates on every load

### The Fix
```typescript
// 1. Limit to first 6 widgets
{index < 6 && <motion.div>...</motion.div>}

// 2. Use simpler animations
transition={{
  type: "tween",
  duration: 0.3,
}}

// 3. Respect reduced motion preference
const shouldAnimate = !prefersReducedMotion && index < 6
```

---

## Diagnostic Commands to Remember

### Find client components
```bash
rg -l '"use client"' app/ components/
```

### Find large components
```bash
find app/[locale]/dashboard/components -name "*.tsx" -exec wc -l {} + | sort -rn | head -15
```

### Check for memoization
```bash
rg -n "React.memo|memo\(" app/[locale]/dashboard/components/ | wc -l
```

### Find expensive operations
```bash
rg -n "\.map\(|\.filter\(|\.sort\(" app/[locale]/dashboard/components/ | head -30
```

---

## Performance Priority Order

### 1. Fix Rendering Patterns First (P0)
- Split monolithic contexts
- Add React.memo to components
- Memoize expensive computations
- Add useCallback to handlers

### 2. Then Optimize Code Loading (P1)
- Lazy load widgets
- Break down large components
- Code split routes

### 3. Finally Polish Animations (P2)
- Reduce animation scope
- Use simpler easing
- Better reduced motion support

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Optimizing Bundle Size First
Bundle size is important, but **runtime performance is more critical**. A small bundle that re-renders everything will still feel slow.

### ❌ Mistake 2: Premature Lazy Loading
Lazy loading helps initial load, but doesn't fix re-render performance. Fix rendering first, then lazy load.

### ❌ Mistake 3: Ignoring React DevTools Profiler
You can't optimize what you don't measure. Always use the Profiler to identify bottlenecks.

### ❌ Mistake 4: Over-Optimizing
Not everything needs memoization. Focus on:
- Components that re-render frequently
- Expensive calculations
- Large lists
- Complex components

### ❌ Mistake 5: Forgetting Dependency Arrays
`useMemo` and `useCallback` only work if dependency arrays are correct. Missing or wrong deps = no optimization.

---

## Quick Wins Checklist

When performance is bad, check these in order:

1. [ ] Are contexts split by concern?
2. [ ] Are expensive calculations memoized?
3. [ ] Are large components memoized with React.memo?
4. [ ] Are callbacks stable with useCallback?
5. [ ] Are large components split into smaller pieces?
6. [ ] Are heavy components lazy loaded?
7. [ ] Are animations limited in scope?
8. [ ] Have you profiled with React DevTools?

---

## Key Takeaway

**Performance is about rendering, not bundle size.**

Focus on:
1. **Minimizing re-renders** (memoization, context splitting)
2. **Minimizing calculation work** (useMemo, efficient algorithms)
3. **Minimizing mount cost** (code splitting, lazy loading)

Bundle size optimization comes AFTER these are addressed.

---

## References

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools#profiling-components)
- [React.memo](https://react.dev/reference/react/memo)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)