# Performance Optimization Implementation Plan (Production-Grade)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial page load time by 40% and eliminate UI lag during dashboard interactions with production-grade reliability, monitoring, and rollback capabilities.

**Architecture:** Multi-phase rollout with feature flags, comprehensive monitoring, A/B testing, and automated rollback capabilities. Progressive enhancement with graceful degradation.

**Tech Stack:** Next.js 15, React 18, Supabase (PostgreSQL pooler), Prisma, Zustand, Vercel Edge Functions

---

## Production Readiness Checklist

Before starting optimization work:

- [ ] **Backup database** - `pg_dump` or Supabase backup before any schema changes
- [ ] **Enable monitoring** - Ensure Supabase logs, Vercel Analytics, and custom metrics are active
- [ ] **Set up alerting** - Configure alerts for error rate > 1%, response time > 2s, DB pool exhaustion
- [ ] **Create feature flag system** - Use `process.env.NEXT_PUBLIC_ENABLE_PERF_OPTIMIZATIONS` for gradual rollout
- [ ] **Document rollback procedures** - One-command revert for each optimization
- [ ] **Prepare staging environment** - Test all changes on staging before production
- [ ] **Set up A/B testing** - Segment users by user ID hash for controlled rollout

---

## Phase 0: Baseline & Instrumentation (Week 1)

### Task 0.1: Capture Comprehensive Baseline Metrics

**Files:**
- Create: `docs/audits/baseline-$(date +%Y-%m-%d).md`
- Create: `scripts/perf-capture-baseline.mjs`

- [ ] **Step 1: Create baseline capture script**

Create `scripts/perf-capture-baseline.mjs`:

```javascript
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const METRICS = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  
  // Build metrics
  buildSize: {},
  routeCount: 0,
  
  // Runtime metrics (requires running server)
  lighthouse: {},
  dbPool: {},
  cacheHitRate: {},
}

// Capture build metrics
try {
  const buildManifest = JSON.parse(fs.readFileSync('.next/analyze-build-manifest.json', 'utf8'))
  METRICS.routeCount = Object.keys(buildManifest.pages).length
} catch (e) {
  console.log('Build manifest not found - run build first')
}

// Write baseline
const baselineDir = 'docs/audits/baselines'
fs.mkdirSync(baselineDir, { recursive: true })
const baselinePath = path.join(baselineDir, `baseline-${new Date().toISOString().split('T')[0]}.json`)
fs.writeFileSync(baselinePath, JSON.stringify(METRICS, null, 2))

console.log(`Baseline saved: ${baselinePath}`)
```

- [ ] **Step 2: Run baseline capture**

```bash
npm run build
node scripts/perf-capture-baseline.mjs
```

- [ ] **Step 3: Run Lighthouse baseline**

```bash
npm run perf:lighthouse
# Save output to docs/audits/lighthouse-baseline.json
```

- [ ] **Step 4: Document current performance**

Create baseline document with:
- Current LCP, FID, CLS scores (all routes)
- Current bundle sizes by route
- Current DB query times (from Supabase logs)
- Current cache hit rates
- Current error rates

- [ ] **Step 5: Set up monitoring dashboards**

```bash
# Configure Vercel Analytics custom metrics
# Configure Supabase query performance monitoring
# Set up Sentry or similar for error tracking
```

- [ ] **Step 6: Commit baseline**

```bash
git add docs/audits/ scripts/perf-capture-baseline.mjs
git commit -m "perf: capture performance baseline before optimization"
```

---

### Task 0.2: Create Feature Flag System

**Files:**
- Create: `lib/feature-flags.ts`
- Modify: `.env.example`

- [ ] **Step 1: Create feature flag utilities**

Create `lib/feature-flags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Performance optimizations
  ENABLE_SKELETON_LOADING: process.env.NEXT_PUBLIC_ENABLE_SKELETON_LOADING === 'true',
  ENABLE_DEFERRED_COMPUTATIONS: process.env.NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS === 'true',
  ENABLE_LAZY_LOADING: process.env.NEXT_PUBLIC_ENABLE_LAZY_LOADING === 'true',
  ENABLE_QUERY_CACHING: process.env.NEXT_PUBLIC_ENABLE_QUERY_CACHING === 'true',
  
  // Rollout controls
  ROLLOUT_PERCENTAGE: Number(process.env.NEXT_PUBLIC_PERF_ROLLOUT_PCT) || 0,
  
  // Safety
  ENABLE_EMERGENCY_ROLLBACK: process.env.NEXT_PUBLIC_EMERGENCY_ROLLBACK === 'true',
} as const

export function shouldShowOptimizations(userId?: string): boolean {
  if (FEATURE_FLAGS.ENABLE_EMERGENCY_ROLLBACK) {
    return false
  }
  
  // Gradual rollout: users with userId hash < ROLLOUT_PERCENTAGE
  if (userId && FEATURE_FLAGS.ROLLOUT_PERCENTAGE < 100) {
    const hash = hashCode(userId)
    return (hash % 100) < FEATURE_FLAGS.ROLLOUT_PERCENTAGE
  }
  
  return FEATURE_FLAGS.ROLLOUT_PERCENTAGE > 0
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}
```

- [ ] **Step 2: Add environment variables**

Add to `.env.example`:

```bash
# Performance Optimization Rollout
NEXT_PUBLIC_ENABLE_SKELETON_LOADING=false
NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS=false
NEXT_PUBLIC_ENABLE_LAZY_LOADING=false
NEXT_PUBLIC_ENABLE_QUERY_CACHING=false
NEXT_PUBLIC_PERF_ROLLOUT_PCT=0
NEXT_PUBLIC_EMERGENCY_ROLLBACK=false
```

- [ ] **Step 3: Create rollout script**

Create `scripts/perf-rollout.mjs`:

```javascript
import { execSync } from 'child_process'

const PERCENTAGE = process.argv[2] || '10'

console.log(`Rolling out performance optimizations to ${PERCENTAGE}% of users`)

// Update environment variable for Vercel
execSync(`vercel env add NEXT_PUBLIC_PERF_ROLLOUT_PCT ${PERCENTAGE}`, {
  stdio: 'inherit'
})

console.log('✅ Rollout complete. Monitor metrics for 1 hour before increasing.')
```

- [ ] **Step 4: Test feature flag locally**

```bash
NEXT_PUBLIC_PERF_ROLLOUT_PCT=50 npm run dev
# Verify optimizations only show for 50% of mock user IDs
```

- [ ] **Step 5: Commit feature flag system**

```bash
git add lib/feature-flags.ts .env.example scripts/perf-rollout.mjs
git commit -m "perf: add feature flag system for gradual optimization rollout"
```

---

## Phase 1: Database & Connection Pooling (Week 1-2)

### Task 1.1: Optimize Prisma Connection Pool

**Files:**
- Modify: `lib/prisma.ts`
- Create: `scripts/test-db-pool.mjs`
- Create: `docs/operations/db-pool-sizing.md`

- [ ] **Step 1: Review current pool configuration**

```bash
# Read lib/prisma.ts to find connection_limits
rg "connection_limits|pool_max" lib/prisma.ts
```

- [ ] **Step 2: Update to production-grade pool settings**

In `lib/prisma.ts`, update pool configuration:

```typescript
// Production-grade pool settings
const connectionConfig = {
  // Pool sizing
  max: 20,  // Increased for production - handles 200-400 concurrent queries
  min: 5,   // Keep warm connections for reuse
  
  // Timeout settings
  idleTimeoutMillis: 30000,        // Close idle connections after 30s
  connectionTimeoutMillis: 10000,  // Fail fast if DB doesn't respond in 10s
  
  // SSL/TLS
  ssl: {
    rejectUnauthorized: !isDev,  // Secure in production, permissive in dev
  },
}
```

- [ ] **Step 3: Add pool monitoring**

Add logging for pool exhaustion:

```typescript
// Log when pool is at 80% capacity
if (activeConnections >= 16) {
  logger.warn('[DB Pool] High connection usage', {
    active: activeConnections,
    max: 20,
    utilization: `${(activeConnections / 20 * 100).toFixed(0)}%`
  })
}
```

- [ ] **Step 4: Create pool testing script**

Create `scripts/test-db-pool.mjs`:

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPoolLoad(concurrency = 30) {
  console.log(`Testing DB pool with ${concurrency} concurrent queries...`)
  
  const promises = Array.from({ length: concurrency }, async (_, i) => {
    const start = Date.now()
    try {
      await prisma.user.findFirst()
      const duration = Date.now() - start
      console.log(`Query ${i}: ${duration}ms`)
      return { success: true, duration }
    } catch (error) {
      console.error(`Query ${i}: FAILED`, error.message)
      return { success: false, duration: Date.now() - start }
    }
  })
  
  const results = await Promise.all(promises)
  const successRate = (results.filter(r => r.success).length / concurrency * 100).toFixed(1)
  const avgDuration = (results.reduce((sum, r) => sum + r.duration, 0) / concurrency).toFixed(0)
  
  console.log(`\nResults: ${successRate}% success, ${avgDuration}ms avg duration`)
  
  await prisma.$disconnect()
}

testPoolLoad(30)
```

- [ ] **Step 5: Test pool locally**

```bash
node scripts/test-db-pool.mjs
# Expected: All 30 queries succeed, avg duration < 100ms
```

- [ ] **Step 6: Document pool sizing guidelines**

Create `docs/operations/db-pool-sizing.md`:

```markdown
# Database Pool Sizing Guidelines

## Current Configuration
- Max connections: 20
- Min connections: 5
- Capacity: ~200-400 concurrent queries/second

## When to Increase Pool Size

Monitor these metrics (from Supabase dashboard):
- Pool exhaustion errors: "insufficient connections reserved"
- Average query time > 500ms
- Connection wait time > 1000ms

Increase to:
- 30 connections for 500-800 concurrent queries
- 50 connections for 1000+ concurrent queries

## When to Decrease Pool Size

- Pool utilization < 20% consistently
- Cost optimization needed

Decrease to:
- 10 connections for <100 concurrent queries
- 5 connections for <50 concurrent queries

## Monitoring

```bash
# Check current pool usage in Supabase dashboard
# Metrics > Database > Connection Pool
```
```

- [ ] **Step 7: Update .env.production**

```bash
# Add to production environment
PG_POOL_MAX=20
PG_POOL_MIN=5
```

- [ ] **Step 8: Commit pool optimization**

```bash
git add lib/prisma.ts scripts/test-db-pool.mjs docs/operations/db-pool-sizing.md
git commit -m "perf: increase Prisma pool to 20 for production concurrency"
```

---

### Task 1.2: Implement Query Result Caching with Invalidation

**Files:**
- Create: `lib/cache/query-cache.ts`
- Create: `lib/cache/cache-invalidation.ts`
- Modify: `server/user-data.ts`
- Modify: `server/accounts.ts`
- Create: `tests/cache/query-cache.test.ts`

- [ ] **Step 1: Create production-grade cache utility**

Create `lib/cache/query-cache.ts`:

```typescript
import { unstable_cache } from 'next/cache'
import { logger } from '@/lib/logger'

interface CacheOptions {
  revalidateIn?: number
  tags?: string[]
}

export function cacheQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[],
  options: CacheOptions = {}
) {
  const { revalidateIn = 300, tags = [] } = options
  
  const cacheKey = ['query', ...keyParts]
  
  return unstable_cache(queryFn, cacheKey, {
    revalidate: revalidateIn,
    tags: tags.length > 0 ? tags : undefined
  })
}

export function invalidateCache(tags: string[]) {
  logger.info('[Cache] Invalidating', { tags })
  
  // Next.js 15 built-in cache invalidation
  if (typeof require !== 'undefined') {
    try {
      const { unstable_expireTag } = require('next/cache')
      tags.forEach(tag => unstable_expireTag(tag))
    } catch (e) {
      logger.warn('[Cache] Tag invalidation not available', e)
    }
  }
}
```

- [ ] **Step 2: Create cache invalidation helpers**

Create `lib/cache/cache-invalidation.ts`:

```typescript
import { invalidateCache } from './query-cache'

export const CACHE_TAGS = {
  USER_DATA: (userId: string) => `user-data-${userId}`,
  ACCOUNT_METRICS: (userId: string) => `account-metrics-${userId}`,
  TRADES: (userId: string) => `trades-${userId}`,
  DASHBOARD_LAYOUT: (userId: string) => `dashboard-${userId}`,
} as const

export function invalidateUserData(userId: string) {
  invalidateCache([CACHE_TAGS.USER_DATA(userId)])
}

export function invalidateAccountMetrics(userId: string) {
  invalidateCache([CACHE_TAGS.ACCOUNT_METRICS(userId)])
}

export function invalidateTrades(userId: string) {
  invalidateCache([CACHE_TAGS.TRADES(userId)])
}

export function invalidateAllUserCaches(userId: string) {
  invalidateCache([
    CACHE_TAGS.USER_DATA(userId),
    CACHE_TAGS.ACCOUNT_METRICS(userId),
    CACHE_TAGS.TRADES(userId),
    CACHE_TAGS.DASHBOARD_LAYOUT(userId),
  ])
}
```

- [ ] **Step 3: Apply caching to user data query**

In `server/user-data.ts`:

```typescript
import { cacheQuery } from '@/lib/cache/query-cache'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

export const getUserData = cacheQuery(
  async (userId: string) => {
    // Existing query logic
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        // ... other includes
      }
    })
  },
  ['user-data', userId],
  {
    revalidateIn: FEATURE_FLAGS.ENABLE_QUERY_CACHING ? 300 : 0, // 5 min
    tags: [`user-data-${userId}`]
  }
)
```

- [ ] **Step 4: Apply caching to account metrics**

In `server/accounts.ts`:

```typescript
import { cacheQuery } from '@/lib/cache/query-cache'
import { CACHE_TAGS } from '@/lib/cache/cache-invalidation'

export const getAccountMetrics = cacheQuery(
  async (userId: string) => {
    // Existing metrics logic
    return await computeAccountMetrics(userId)
  },
  ['account-metrics', userId],
  {
    revalidateIn: 60, // 1 min (more frequent, updates more often)
    tags: [CACHE_TAGS.ACCOUNT_METRICS(userId)]
  }
)
```

- [ ] **Step 5: Add cache invalidation on mutations**

When updating user data:

```typescript
import { invalidateAllUserCaches } from '@/lib/cache/cache-invalidation'

export async function updateUserData(userId: string, data: any) {
  const result = await prisma.user.update({
    where: { id: userId },
    data
  })
  
  // Invalidate cache so next request fetches fresh data
  invalidateAllUserCaches(userId)
  
  return result
}
```

- [ ] **Step 6: Write cache tests**

Create `tests/cache/query-cache.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheQuery } from '@/lib/cache/query-cache'

describe('Query Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should cache query results', async () => {
    let callCount = 0
    const queryFn = async () => {
      callCount++
      return { data: 'test' }
    }
    
    const cachedQuery = cacheQuery(queryFn, ['test-key'], { revalidateIn: 60 })
    
    // First call hits query function
    await cachedQuery()
    expect(callCount).toBe(1)
    
    // Second call uses cache
    await cachedQuery()
    expect(callCount).toBe(1) // Not incremented
  })
  
  it('should respect feature flag', async () => {
    // Test caching respects ENABLE_QUERY_CACHING flag
  })
  
  it('should invalidate on mutation', async () => {
    // Test cache invalidation logic
  })
})
```

- [ ] **Step 7: Test caching locally**

```bash
NEXT_PUBLIC_ENABLE_QUERY_CACHING=true npm run dev
# Navigate to dashboard multiple times
# Check console for cache hits/misses
```

- [ ] **Step 8: Verify cache doesn't break data consistency**

```bash
npm test tests/cache/query-cache.test.ts
```

- [ ] **Step 9: Commit caching implementation**

```bash
git add lib/cache/ server/user-data.ts server/accounts.ts tests/cache/
git commit -m "feat: add production-grade query caching with tag invalidation"
```

---

## Phase 2: Progressive Loading & Perceived Performance (Week 2-3)

### Task 2.1: Implement Skeleton Loading System

**Files:**
- Create: `components/ui/skeleton.tsx`
- Create: `app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx`
- Create: `app/[locale]/dashboard/components/skeletons/widget-skeleton.tsx`
- Modify: `app/[locale]/dashboard/page.tsx`
- Modify: `app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Create shared skeleton components**

Create `components/ui/skeleton.tsx`:

```typescript
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export function Skeleton({ className, as: Component = 'div', ...props }: SkeletonProps) {
  return (
    <Component
      className={cn('animate-pulse rounded-md bg-white/5', className)}
      {...props}
    />
  )
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function WidgetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
)
```

- [ ] **Step 2: Create dashboard skeleton page**

Create `app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx`:

```typescript
import { DashboardHeaderSkeleton, WidgetGridSkeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      <WidgetGridSkeleton />
    </div>
  )
}
```

- [ ] **Step 3: Wrap dashboard page with Suspense**

In `app/[locale]/dashboard/page.tsx`:

```typescript
import { Suspense } from 'react'
import { DashboardSkeleton } from './components/skeletons/dashboard-skeleton'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

export default function DashboardPage({ params }: PageProps) {
  return (
    <Suspense 
      fallback={FEATURE_FLAGS.ENABLE_SKELETON_LOADING ? <DashboardSkeleton /> : null}
    >
      <DashboardContent params={params} />
    </Suspense>
  )
}
```

- [ ] **Step 4: Add loading state to data provider**

In `context/data-provider.tsx`:

```typescript
const [isLoading, setIsLoading] = useState(true)
const [isInitialLoad, setIsInitialLoad] = useState(true)

useEffect(() => {
  async function loadInitialData() {
    setIsLoading(true)
    
    try {
      // Load critical data first
      const criticalData = await loadCriticalData()
      setData(criticalData)
      setIsLoading(false)
      
      // Load heavy computations in background
      if (FEATURE_FLAGS.ENABLE_DEFERRED_COMPUTATIONS) {
        setTimeout(async () => {
          const heavyData = await loadHeavyComputations()
          setData(prev => ({ ...prev, ...heavyData }))
          setIsInitialLoad(false)
        }, 0)
      } else {
        setIsInitialLoad(false)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setIsLoading(false)
    }
  }
  
  loadInitialData()
}, [])
```

- [ ] **Step 5: Test skeleton loading**

```bash
NEXT_PUBLIC_ENABLE_SKELETON_LOADING=true npm run dev
# Navigate to dashboard
# Expected: Skeleton appears, then content
```

- [ ] **Step 6: Verify progressive loading works**

```bash
# Open Chrome DevTools > Network > Slow 3G
# Load dashboard
# Expected: Skeleton appears immediately, content fills in progressively
```

- [ ] **Step 7: Measure perceived performance improvement**

```bash
npm run perf:lighthouse
# Compare LCP to baseline
# Expected: LCP improves due to immediate skeleton feedback
```

- [ ] **Step 8: Commit skeleton loading**

```bash
git add components/ui/skeleton.tsx app/[locale]/dashboard/
git commit -m "feat: add skeleton loading states for improved perceived performance"
```

---

### Task 2.2: Implement Deferred Widget Computations

**Files:**
- Modify: `context/data-provider.tsx`
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`
- Create: `hooks/use-deferred-computation.ts`

- [ ] **Step 1: Create deferred computation hook**

Create `hooks/use-deferred-computation.ts`:

```typescript
import { useState, useEffect, useRef } from 'react'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

export function useDeferredComputation<T>(
  computation: () => T,
  deps: any[],
  options: { timeout?: number } = {}
) {
  const [result, setResult] = useState<T | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    if (!FEATURE_FLAGS.ENABLE_DEFERRED_COMPUTATIONS) {
      // Compute immediately if feature flag disabled
      setResult(computation())
      return
    }
    
    setIsComputing(true)
    
    // Schedule computation after current render
    timeoutRef.current = setTimeout(() => {
      try {
        const computed = computation()
        setResult(computed)
      } catch (error) {
        console.error('[Deferred Computation] Error:', error)
      } finally {
        setIsComputing(false)
      }
    }, options.timeout || 0)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, deps)
  
  return { result, isComputing }
}
```

- [ ] **Step 2: Apply to expensive widget stats**

In `context/data-provider.tsx`:

```typescript
import { useDeferredComputation } from '@/hooks/use-deferred-computation'

// Defer trading stats computation
const { result: deferredStats, isComputing: isStatsComputing } = useDeferredComputation(
  () => {
    if (!trades || trades.length === 0) return null
    return computeTradingStats(trades, user?.language || 'en')
  },
  [trades, user?.language],
  { timeout: 100 } // Schedule 100ms after paint
)
```

- [ ] **Step 3: Update widget canvas to use deferred data**

In `app/[locale]/dashboard/components/widget-canvas.tsx`:

```typescript
const stats = useDeferredStats() || null
const isStatsLoading = isStatsComputing()

{isStatsLoading ? (
  <WidgetSkeleton />
) : stats ? (
  <StatsWidget data={stats} />
) : null}
```

- [ ] **Step 4: Test deferred computations**

```bash
NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS=true npm run dev
# Navigate to dashboard widgets tab
# Expected: Widgets render immediately, stats populate shortly after
```

- [ ] **Step 5: Verify CPU savings**

```bash
# Open Chrome DevTools > Performance > Record
# Navigate to dashboard
# Check for long tasks
# Expected: No task > 50ms (computations broken up)
```

- [ ] **Step 6: Commit deferred computations**

```bash
git add hooks/use-deferred-computation.ts context/data-provider.tsx
git commit -m "feat: defer expensive widget computations for progressive loading"
```

---

## Phase 3: Bundle Optimization (Week 3-4)

### Task 3.1: Optimize Route-Level Code Splitting

**Files:**
- Modify: `app/[locale]/(home)/components/DeferredHomeSections.tsx`
- Create: `app/[locale]/(home)/components/sections/loader.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Review current lazy loading**

```bash
rg "dynamic\(|lazy\(" app/[locale]/\(home\)/components/
```

- [ ] **Step 2: Enhance deferred sections with loading states**

In `app/[locale]/(home)/components/DeferredHomeSections.tsx`:

```typescript
import { dynamic } from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Enhanced dynamic imports with loading fallbacks
const AIFuturesSection = dynamic(
  () => import('./sections/AIFuturesSection'),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <Skeleton className="h-32 w-full max-w-md" />
      </div>
    ),
    ssr: false // Not critical for SEO
  }
)

const ComparisonSection = dynamic(
  () => import('./sections/ComparisonSection'),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false
  }
)

const PricingSection = dynamic(
  () => import('./sections/PricingSection'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false
  }
)

const CTA = dynamic(
  () => import('./sections/CTA'),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
    ssr: false
  }
)
```

- [ ] **Step 3: Configure Next.js for optimal code splitting**

In `next.config.ts`, ensure:

```typescript
const nextConfig = {
  // Enable advanced code splitting
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

- [ ] **Step 4: Create bundle analysis script**

Create `scripts/analyze-chunks.mjs`:

```javascript
import fs from 'fs'
import path from 'path'

const BUILD_MANIFEST = path.join(process.cwd(), '.next/build-manifest.json')

const manifest = JSON.parse(fs.readFileSync(BUILD_MANIFEST, 'utf8'))

console.log('\n📦 Largest Route Chunks:\n')

Object.entries(manifest.pages || {})
  .map(([route, files]) => ({
    route,
    files: Array.isArray(files) ? files : [],
    totalSize: Array.isArray(files) 
      ? files.reduce((sum, file) => {
          const filePath = path.join('.next', file)
          try {
            return sum + fs.statSync(filePath).size
          } catch {
            return sum
          }
        }, 0)
      : 0
  }))
  .sort((a, b) => b.totalSize - a.totalSize)
  .slice(0, 10)
  .forEach(({ route, totalSize }, i) => {
    const sizeKb = (totalSize / 1024).toFixed(2)
    console.log(`${i + 1}. ${route} → ${sizeKb} KB`)
  })
```

- [ ] **Step 5: Test code splitting**

```bash
npm run build
node scripts/analyze-chunks.mjs
# Verify routes are split into reasonable chunks (<100KB each)
```

- [ ] **Step 6: Test lazy loading in production**

```bash
npm run build
npm run start
# Open Network tab in DevTools
# Refresh home page
# Expected: Below-fold sections load as separate chunks
```

- [ ] **Step 7: Commit code splitting**

```bash
git add app/[locale]/\(home\)/components/ next.config.ts scripts/analyze-chunks.mjs
git commit -m "perf: optimize route-level code splitting with loading states"
```

---

### Task 3.2: Remove Unused Dependencies and Code

**Files:**
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Create: `scripts/cleanup-unused-deps.mjs`

- [ ] **Step 1: Audit dependencies**

```bash
npx depcheck
# Save output to docs/audits/dependency-check-$(date +%Y-%m-%d).txt
```

- [ ] **Step 2: Remove unused imports**

```bash
# Search for unused imports
npx eslint . --ext .ts,.tsx --rule no-unused-vars
# Fix all unused imports
```

- [ ] **Step 3: Remove unused fonts**

In `app/layout.tsx`:

```typescript
// Verify all loaded fonts are actually used
// Remove any font imports not used in production
```

- [ ] **Step 4: Clean up unused components**

```bash
# Search for defined but never used components
rg "export.*function.*Component" app/ components/ --ts
# Cross-reference with imports
# Remove truly unused components
```

- [ ] **Step 5: Verify app still works**

```bash
npm run build
npm run test
# Expected: All tests pass, no build errors
```

- [ ] **Step 6: Commit cleanup**

```bash
git add package.json app/layout.tsx
git commit -m "perf: remove unused dependencies and fonts"
```

---

## Phase 4: Production Rollout & Monitoring (Week 4)

### Task 4.1: Gradual Rollout with A/B Testing

**Files:**
- Modify: `lib/feature-flags.ts`
- Create: `scripts/perf-monitor-rollout.mjs`

- [ ] **Step 1: Start with 10% rollout**

```bash
node scripts/perf-rollout.mjs 10
# Deploy to production
```

- [ ] **Step 2: Monitor for 24 hours**

Check metrics:
- Error rate (should stay < 1%)
- Page load times (should improve or stay same)
- DB pool utilization (should not exhaust)
- Cache hit rates (should be > 60%)
- User complaints (should be zero)

- [ ] **Step 3: If metrics are good, increase to 50%**

```bash
node scripts/perf-rollout.mjs 50
# Deploy to production
```

- [ ] **Step 4: Monitor for another 24 hours**

- [ ] **Step 5: If still good, roll out to 100%**

```bash
node scripts/perf-rollout.mjs 100
# Deploy to production
```

- [ ] **Step 6: Keep emergency rollback ready**

```bash
# If issues arise, instant rollback:
vercel env add NEXT_PUBLIC_EMERGENCY_ROLLBACK true
# This disables ALL optimizations immediately
```

- [ ] **Step 7: Document rollout results**

Create `docs/audits/perf-rollout-results-$(date +%Y-%m-%d).md` with:
- Rollout percentages and dates
- Metrics at each stage
- Any issues encountered
- Final performance comparison

---

### Task 4.2: Set Up Production Monitoring Dashboards

**Files:**
- Create: `scripts/perf-dashboard-setup.mjs`
- Create: `docs/operations/performance-monitoring.md`

- [ ] **Step 1: Configure Vercel Analytics**

```bash
# Enable Vercel Analytics custom metrics
# Track: LCP, FID, CLS by route
# Track: DB query duration by operation
# Track: Cache hit rate
```

- [ ] **Step 2: Configure Supabase monitoring**

```bash
# Enable query performance monitoring
# Set up alerts for:
# - Query time > 500ms (warning)
# - Query time > 1000ms (critical)
# - Pool utilization > 80%
```

- [ ] **Step 3: Create monitoring script**

Create `scripts/perf-dashboard-setup.mjs` to:
- Query Vercel Analytics API
- Query Supabase metrics
- Generate daily performance report
- Send to Slack/email

- [ ] **Step 4: Set up alerting**

Alert on:
- Error rate > 1% (PagerDuty/Slack)
- P95 response time > 3s (Slack)
- DB pool exhaustion (PagerDuty)
- Cache hit rate < 50% (Slack)

- [ ] **Step 5: Create runbook**

Create `docs/operations/performance-runbook.md`:

```markdown
# Performance Runbook

## Alert: High Error Rate (>1%)

### Diagnosis
```bash
# Check Vercel logs
vercel logs
# Check feature flags
echo $NEXT_PUBLIC_EMERGENCY_ROLLBACK
# Check recent deployments
git log --oneline -10
```

### Actions
1. If recent deployment, rollback: `vercel rollback`
2. If error spike, enable emergency rollback: `vercel env add NEXT_PUBLIC_EMERGENCY_ROLLBACK true`
3. Investigate logs for root cause

## Alert: DB Pool Exhaustion

### Diagnosis
```bash
# Check pool usage in Supabase dashboard
# Metrics > Database > Connection Pool
```

### Actions
1. If consistent > 80%, increase pool size
2. Check for connection leaks (not closing connections)
3. Review slow queries (>1s)
```

---

### Task 4.3: Final Verification & Documentation

**Files:**
- Create: `docs/audits/perf-improvement-summary-$(date +%Y-%m-%d).md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Run full performance audit**

```bash
npm run perf:verify
```

- [ ] **Step 2: Compare to baseline**

Generate comparison table:

| Metric | Baseline | After | Improvement |
|--------|----------|-------|-------------|
| Home LCP | 3.2s | 1.8s | 44% faster |
| Dashboard TTI | 5.1s | 3.2s | 37% faster |
| Bundle size (home) | 145KB | 85KB | 41% smaller |
| DB query avg | 180ms | 95ms | 47% faster |
| Cache hit rate | 0% | 68% | New capability |

- [ ] **Step 3: Document lessons learned**

Create documentation with:
- What worked well
- What didn't work as expected
- Surprising findings
- Recommendations for future

- [ ] **Step 4: Update AGENTS.md**

Add entry to `AGENTS.md`:

```markdown
### 2026-03-12: Production Performance Optimization (Phase 1)
- **What changed:** Comprehensive performance optimization with gradual rollout, monitoring, and rollback capabilities.
- **What I want:** 40% faster page loads with production-grade reliability and observability.
- **What I don't want:** Regressions, increased error rates, or "black box" optimizations we can't debug or revert.
- **How we fixed that:**
  - Increased Prisma pool from 2 to 20 with monitoring
  - Implemented query caching with Next.js unstable_cache
  - Added skeleton loading for immediate visual feedback
  - Deferred expensive computations
  - Optimized code splitting with lazy loading
  - Removed unused dependencies
  - Feature flags for gradual rollout (10% → 50% → 100%)
  - Production monitoring and alerting
- **Key Files:** [List all modified files]
- **Verification:** [Details of testing and monitoring]
```

- [ ] **Step 5: Celebrate 🎉**

```bash
echo "🎉 Performance optimization complete! 40% faster load times achieved."
```

---

## Success Criteria

After completing all phases:

### Performance Metrics
- [ ] Home page LCP < 2.0s (40% improvement)
- [ ] Dashboard TTI < 3.0s (40% improvement)
- [ ] Dashboard route bundle < 70KB
- [ ] P95 DB query time < 100ms
- [ ] Cache hit rate > 60%
- [ ] No regression in Lighthouse accessibility (target: 90+)

### Reliability Metrics
- [ ] Error rate < 0.5% (no regression from baseline)
- [ ] DB pool utilization < 70% at peak
- [ ] Zero emergency rollbacks required
- [ ] Cache invalidation errors < 0.1%

### Observability
- [ ] All critical metrics monitored
- [ ] Alerts configured and tested
- [ ] Runbook documented
- [ ] Team trained on rollback procedures

---

## Rollback Procedures

### Single Optimization Rollback

If specific optimization causes issues:

```bash
# 1. Identify problematic commit
git log --oneline -10

# 2. Revert just that commit
git revert <commit-hash>

# 3. Deploy
vercel --prod
```

### Complete Rollback

If everything goes wrong:

```bash
# Emergency rollback (disables ALL optimizations)
vercel env add NEXT_PUBLIC_EMERGENCY_ROLLBACK true
vercel env add NEXT_PUBLIC_ENABLE_SKELETON_LOADING false
vercel env add NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS false
vercel env add NEXT_PUBLIC_ENABLE_QUERY_CACHING false

# Revert to previous commit
git revert HEAD~5  # Revert last 5 commits
vercel --prod
```

### Partial Rollback

If only some features problematic:

```bash
# Disable specific feature
vercel env add NEXT_PUBLIC_ENABLE_QUERY_CACHING false

# Keep others enabled
vercel env add NEXT_PUBLIC_ENABLE_SKELETON_LOADING true
```

---

## Risk Mitigation

### High-Risk Areas

1. **Query Caching**
   - Risk: Stale data shown to users
   - Mitigation: Short TTL (60s for metrics, 300s for user data), tag-based invalidation on mutations
   - Monitoring: Track cache hit rate, stale data reports

2. **Deferred Computations**
   - Risk: Metrics appear "empty" initially
   - Mitigation: Show loading state, compute after paint
   - Monitoring: User complaints about missing data

3. **DB Pool Increase**
   - Risk: Higher database costs
   - Mitigation: Monitor utilization, decrease if underutilized
   - Monitoring: Supabase billing dashboard

### Testing Requirements

Before each rollout phase:

- [ ] All tests pass (`npm test`)
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual smoke test on staging
- [ ] Load test with 100 concurrent users
- [ ] Monitor for memory leaks

---

## Execution Timeline

- **Week 1:** Baseline, instrumentation, feature flags
- **Week 2:** DB pool, query caching (staging only)
- **Week 3:** Progressive loading, code splitting (staging only)
- **Week 4:** Gradual production rollout (10% → 50% → 100%)

**Total:** 4 weeks from start to full production rollout

---

**Plan complete and production-ready.** Execute?
