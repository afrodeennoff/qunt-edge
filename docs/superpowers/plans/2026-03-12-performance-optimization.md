# Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial page load time by 40% and eliminate UI lag during dashboard interactions

**Architecture:** Multi-pronged approach: (1) Remove blocking operations from critical paths, (2) Progressive data loading, (3) Reduce client-side JavaScript overhead, (4) Optimize database queries

**Tech Stack:** Next.js 15, React 18, Supabase, Prisma, Zustand

---

## Pre-Flight Analysis

- [ ] Run baseline metrics: `npm run perf:lighthouse` to capture current Lighthouse scores
- [ ] Run bundle analysis: `npm run analyze:bundle` to identify largest routes
- [ ] Run route budget check: `npm run check:route-budgets` to see which routes are over budget
- [ ] Document baseline numbers in `docs/audits/baseline-{date}.md`

---

## Chunk 1: Critical Path Optimizations (Auth Flow)

### Task 1.1: Remove Auth Callback Timeout

**Context:** The current 800ms timeout on `ensureUserInDatabase` was causing user creation failures. Already fixed in commit 9bfa2ca.

**Files:**
- Already modified: `app/api/auth/callback/route.ts`

- [ ] **Verify the fix is correct**

```bash
# Check that ensureUserInDatabase is called without timeout wrapper
rg "ensureUserInDatabaseWithBudget" app/api/auth/callback/route.ts
# Expected: No results (function removed)
```

- [ ] **Test login flow locally**

```bash
# Start dev server
npm run dev

# In browser: Login with new user
# Expected: User is created successfully, no timeout errors in console
```

---

### Task 1.2: Increase Prisma Pool Size

**Files:**
- Modify: `lib/prisma.ts:20-35`

- [ ] **Step 1: Read current pool configuration**

```bash
# Look for connection_limits object in lib/prisma.ts
```

- [ ] **Step 2: Update pool limits**

```typescript
// Find the connection_limits configuration
// Update max from 2 to 10:

connection_limits: {
  max: 10,  // Increased from 2
  min: 1,
}
```

- [ ] **Step 3: Test database connection**

```bash
# Run a database query to verify connection works
npx prisma db pull --print
# Expected: Successfully connects with new pool size
```

- [ ] **Step 4: Commit**

```bash
git add lib/prisma.ts
git commit -m "perf: increase Prisma pool size to 10 for better concurrent connection handling"
```

---

## Chunk 2: Progressive Dashboard Loading

### Task 2.1: Implement Skeleton States

**Context:** Dashboard currently waits for all data before rendering. Add skeleton loading for immediate visual feedback.

**Files:**
- Create: `app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx`
- Modify: `app/[locale]/dashboard/page.tsx`
- Modify: `context/data-provider.tsx`

- [ ] **Step 1: Create skeleton component**

Create `app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx`:

```typescript
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-1/3" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update dashboard page to show skeleton immediately**

In `app/[locale]/dashboard/page.tsx`, modify to return skeleton while loading:

```typescript
import { DashboardSkeleton } from './components/skeletons/dashboard-skeleton'

export default function DashboardPage() {
  // Show skeleton immediately, then hydrate with data
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

- [ ] **Step 3: Modify data provider to support progressive hydration**

In `context/data-provider.tsx`, add `isInitialLoad` state:

```typescript
const [isInitialLoad, setIsInitialLoad] = useState(true)

// After first data fetch completes:
setIsInitialLoad(false)
```

- [ ] **Step 4: Test skeleton appears immediately**

```bash
npm run dev
# Navigate to /dashboard
# Expected: Skeleton appears instantly, then replaced with actual content
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/dashboard/page.tsx app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx context/data-provider.tsx
git commit -m "perf: add skeleton loading states for immediate dashboard visual feedback"
```

---

### Task 2.2: Defer Heavy Widget Computations

**Context:** Some dashboard widgets (TraderStats, risk metrics) do expensive calculations. Defer these.

**Files:**
- Modify: `context/data-provider.tsx`
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`

- [ ] **Step 1: Identify expensive computations**

```bash
# Search for heavy computation in data provider
rg "computeTradingStats|calculateRiskMetrics" context/
```

- [ ] **Step 2: Add deferred computation flag**

In `context/data-provider.tsx`, add state for deferred computations:

```typescript
const [deferredComputed, setDeferredComputed] = useState<Record<string, any>>({})

useEffect(() => {
  if (trades.length > 0) {
    // Defer expensive stats calculation
    const timer = setTimeout(() => {
      const stats = computeTradingStats(trades, user.language)
      setDeferredComputed(prev => ({ ...prev, stats }))
    }, 0) // Schedule after current render

    return () => clearTimeout(timer)
  }
}, [trades])
```

- [ ] **Step 3: Update widget canvas to use deferred data**

```typescript
const stats = deferredComputed.stats || null
```

- [ ] **Step 4: Test progressive loading**

```bash
npm run dev
# Navigate to /dashboard?tab=widgets
# Expected: Widgets render with basic data immediately, stats populate shortly after
```

- [ ] **Step 5: Commit**

```bash
git add context/data-provider.tsx app/[locale]/dashboard/components/widget-canvas.tsx
git commit -m "perf: defer expensive widget computations for progressive loading"
```

---

## Chunk 3: Reduce JavaScript Overhead

### Task 3.1: Lazy Load Non-Critical Components

**Context:** Home page marketing sections load eagerly. Defer below-fold content.

**Files:**
- Modify: `app/[locale]/(home)/components/DeferredHomeSections.tsx`

- [ ] **Step 1: Review current deferred sections**

```bash
# Check which sections are already deferred
rg "dynamic" app/[locale]/(home)/components/DeferredHomeSections.tsx
```

- [ ] **Step 2: Ensure all below-fold sections use dynamic imports**

```typescript
// Verify sections are wrapped with dynamic():
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'))
const ComparisonSection = dynamic(() => import('./ComparisonSection'))
const PricingSection = dynamic(() => import('./PricingSection'))
const CTA = dynamic(() => import('./CTA'))
```

- [ ] **Step 3: Add loading fallbacks**

```typescript
const AIFuturesSection = dynamic(() => import('./AIFuturesSection'), {
  loading: () => <div className="h-64 bg-white/5 animate-pulse" />
})
```

- [ ] **Step 4: Test lazy loading**

```bash
npm run build
npm run start
# Check Network tab in DevTools
# Expected: Below-fold sections load as separate chunks after initial paint
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/(home)/components/DeferredHomeSections.tsx
git commit -m "perf: add loading fallbacks to lazy-loaded home sections"
```

---

### Task 3.2: Remove Unused Dependencies

**Files:**
- Modify: `package.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Identify unused dependencies**

```bash
# Run dependency check
npx depcheck
# Document findings
```

- [ ] **Step 2: Remove unused font imports**

In `app/layout.tsx`, check for unused fonts:

```typescript
// Current: Loads Geist, Geist Mono, Manrope
// Verify all are used. If not, remove the import.
```

- [ ] **Step 3: Remove unused npm packages**

Based on depcheck results, remove unused packages:

```bash
npm uninstall <unused-package>
```

- [ ] **Step 4: Verify build still works**

```bash
npm run build
# Expected: Build succeeds without missing import errors
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/layout.tsx
git commit -m "perf: remove unused dependencies and fonts"
```

---

## Chunk 4: Database Query Optimization

### Task 4.1: Add Query Result Caching

**Context:** Repeated queries for user data, account metrics. Add Redis/turbo caching.

**Files:**
- Create: `lib/cache/query-cache.ts`
- Modify: `server/accounts.ts`
- Modify: `server/user-data.ts`

- [ ] **Step 1: Create query cache helper**

Create `lib/cache/query-cache.ts`:

```typescript
import { unstable_cache } from 'next/cache'

export function cacheQuery<T>(
  queryFn: () => Promise<T>,
  keys: string[],
  revalidateIn: number = 60
) {
  return unstable_cache(queryFn, keys, { revalidate: revalidateIn })
}
```

- [ ] **Step 2: Apply to getUserData query**

In `server/user-data.ts`, wrap expensive queries:

```typescript
import { cacheQuery } from '@/lib/cache/query-cache'

export const getUserData = cacheQuery(
  async (userId: string) => {
    // Existing query logic
  },
  ['user-data', userId],
  300 // 5 minutes
)
```

- [ ] **Step 3: Apply to account metrics**

In `server/accounts.ts`, cache account metrics:

```typescript
export const getAccountMetrics = cacheQuery(
  async (userId: string) => {
    // Existing metrics logic
  },
  ['account-metrics', userId],
  60 // 1 minute
)
```

- [ ] **Step 4: Test cache hit/miss**

```bash
npm run dev
# Navigate to dashboard
# Check console for cache logs
# Expected: First request hits DB, subsequent requests use cache
```

- [ ] **Step 5: Commit**

```bash
git add lib/cache/query-cache.ts server/accounts.ts server/user-data.ts
git commit -m "perf: add unstable_cache wrapper for repeated queries"
```

---

### Task 4.2: Optimize N+1 Query Patterns

**Context:** Team analytics was doing N+1 queries. Already fixed with batch queries. Verify it's still optimal.

**Files:**
- Check: `app/api/teams/[id]/analytics/route.ts`

- [ ] **Step 1: Review analytics query pattern**

```bash
# Check for batch query usage
rg "groupBy|aggregate" app/api/teams/\[id\]/analytics/route.ts
# Expected: Single query with groupBy, not N+1 pattern
```

- [ ] **Step 2: Verify no N+1 in other routes**

```bash
# Search for potential N+1 patterns
rg "prisma\.\w+\.find.*forEach|map.*prisma\.\w+\.find" server/
# If found: These are N+1 patterns that need batching
```

- [ ] **Step 3: Document query patterns**

Create `docs/query-patterns.md` documenting do's and don'ts.

- [ ] **Step 4: Commit**

```bash
git add docs/query-patterns.md
git commit -m "docs: add query pattern guidelines to prevent N+1 issues"
```

---

## Chunk 5: Monitoring and Verification

### Task 5.1: Set Up Performance Budget Enforcement

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/check-route-budgets.mjs`

- [ ] **Step 1: Add route budget check to CI**

In `.github/workflows/ci.yml`, add budget enforcement step:

```yaml
- name: Check route budgets
  run: npm run check:route-budgets
```

- [ ] **Step 2: Fail build if budgets exceeded**

Modify `scripts/check-route-budgets.mjs` to exit with error code:

```javascript
process.exit(budgetsExceeded ? 1 : 0)
```

- [ ] **Step 3: Test CI enforcement**

```bash
# Intentionally exceed a budget to test
# Push to trigger CI
# Expected: CI fails with budget exceeded error
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml scripts/check-route-budgets.mjs
git commit -m "ci: enforce route budgets in CI pipeline"
```

---

### Task 5.2: Capture Performance Baseline

**Files:**
- Create: `docs/audits/performance-baseline-YYYY-MM-DD.md`

- [ ] **Step 1: Run Lighthouse CI**

```bash
npm run perf:lighthouse
```

- [ ] **Step 2: Document baseline metrics**

Create baseline document with:
- Home page LCP, FID, CLS scores
- Dashboard route bundle size
- Time to Interactive (TTI)
- First Contentful Paint (FCP)

- [ ] **Step 3: Set improvement targets**

Document specific targets:
- LCP < 2.5s
- Dashboard route < 80KB
- TTI < 3.5s

- [ ] **Step 4: Commit baseline**

```bash
git add docs/audits/performance-baseline-YYYY-MM-DD.md
git commit -m "docs: capture performance baseline for optimization tracking"
```

---

### Task 5.3: Verify All Optimizations

**Files:**
- No modifications

- [ ] **Step 1: Run full performance suite**

```bash
npm run perf:verify
```

- [ ] **Step 2: Compare to baseline**

```bash
# Compare new metrics to baseline documented in Task 5.2
# Expected: 40% improvement in load metrics
```

- [ ] **Step 3: Test on slow 3G network**

```bash
# Chrome DevTools > Network > Throttling > Slow 3G
# Load home and dashboard
# Document performance
```

- [ ] **Step 4: Run accessibility audit**

```bash
npm run build
# Lighthouse accessibility should remain 90+
```

- [ ] **Step 5: Final summary**

Create `docs/audits/performance-improvement-summary.md` with before/after comparison.

---

## Execution Order

Execute chunks in order:
1. Chunk 1 (Critical Path) - Fixes auth timeout immediately
2. Chunk 2 (Progressive Loading) - Improves perceived performance
3. Chunk 3 (JS Overhead) - Reduces download/parse time
4. Chunk 4 (Database) - Improves server response time
5. Chunk 5 (Monitoring) - Ensures gains are maintained

---

## Success Criteria

After completing all chunks:

- [ ] Home page LCP < 2.5s (on 4G)
- [ ] Dashboard TTI < 3.5s
- [ ] Dashboard route bundle < 80KB
- [ ] No regressions in Lighthouse accessibility score
- [ ] Auth callback success rate > 99%
- [ ] Average DB query time < 100ms

---

## Rollback Plan

If any optimization causes issues:

1. **Auth timeout removal:** Revert to timeout wrapper with longer duration (2000ms)
2. **Skeleton states:** Remove Suspense wrapper
3. **Deferred computations:** Remove setTimeout wrapper
4. **Lazy loading:** Revert to static imports
5. **Query caching:** Remove unstable_cache wrapper

Each chunk can be independently reverted using:
```bash
git revert <commit-hash>
```

---

**Plan complete.** Ready to execute?
