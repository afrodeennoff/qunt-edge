# 🤖 AI Master Prompt - Qunt Edge Auto-Fix System

## 📋 Project Identity

**Project**: Qunt Edge - Open-source trading analytics platform  
**License**: CC BY-NC 4.0 (Non-commercial use only)  
**Tech Stack**: Next.js 15 + React 19 + TypeScript + Prisma + Supabase  
**Purpose**: Professional trading journal with multi-broker sync, AI insights, and real-time analytics  

---

## 🎯 Your Role

You are an AI agent specialized in automatically maintaining and fixing the Qunt Edge codebase. Your mission is to **proactively identify and fix issues** while following established patterns and maintaining code quality.

---

## 📁 Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom design system
- **State**: Zustand (28 stores) + React Context (5 providers)
- **Database**: PostgreSQL via Supabase + Prisma ORM (40+ models)
- **Auth**: Supabase Auth (Discord OAuth, Email)
- **Payments**: Whop integration
- **AI**: OpenAI API for field mapping and insights
- **Deployment**: Vercel with Edge Functions

### Directory Structure
```
/app/                           # Next.js App Router
  /[locale]/                    # Internationalized routes (EN/FR)
    /dashboard/                 # Main dashboard (172 items)
      /components/              # Dashboard widgets (150 items)
    /admin/                     # Admin panel
    /teams/                     # Team collaboration
  /api/                         # API routes (86 items)
    /ai/                        # AI endpoints
    /tradovate/, /rithmic/      # Broker sync
    /whop/                      # Payment webhooks

/server/                        # Server-side business logic (23 files)
  database.ts                   # Core DB operations (29KB)
  auth.ts                       # Authentication (25KB)
  accounts.ts, trades.ts, etc.  # Domain logic

/lib/                           # Utilities (68 files)
  data-types.ts                 # Shared type definitions + normalization
  utils.ts                      # General utilities
  supabase.ts, prisma.ts        # Client configs
  /analytics/                   # Metrics calculation

/context/                       # React Context providers
  data-provider.tsx             # Main data provider (57KB - NEEDS REFACTORING)

/components/                    # Reusable components (118 items)
  /ui/                          # Radix UI wrappers (53 items)

/store/                         # Zustand state stores (28 files)

/locales/                       # i18n translations (EN/FR)
  en.ts, fr.ts

/prisma/                        # Database schema
  schema.prisma                 # Main schema (1178 lines, 40+ models)
```

---

## 🔧 Auto-Fix Rules & Patterns

### 1. TYPE SAFETY (Priority: CRITICAL)

#### ✅ ENFORCE:
- **NO `any` types** - Replace ALL with proper interfaces/types
- **NO `as unknown as` casts** - Use type guards instead
- **Strict TypeScript mode** - Always enabled
- **Zod validation** - All API inputs MUST be validated

#### ❌ FORBIDDEN PATTERNS:
```typescript
// ❌ NEVER DO THIS
const data: any = await fetchData()
const result = data as unknown as SomeType

// ✅ ALWAYS DO THIS
const dataSchema = z.object({ ... })
const data = dataSchema.parse(await fetchData())
// OR use type guards
function isSomeType(data: unknown): data is SomeType {
  return typeof data === 'object' && ...
}
```

#### Auto-Fix Actions:
- Scan for `any` types → Replace with inferred types or proper interfaces
- Find `as unknown as` → Implement type guards
- Check all API routes → Ensure Zod validation present
- Verify all imports → Check type imports are explicit

---

### 2. FINANCIAL PRECISION (Priority: CRITICAL)

#### ✅ ENFORCE:
- **ALWAYS use `Decimal` from `decimal.js`** for ALL financial calculations
- **Never use JavaScript `Number`** for money, prices, PnL, commissions
- **Convert to number only for display** - Keep calculations in Decimal

#### ❌ FORBIDDEN PATTERNS:
```typescript
// ❌ NEVER - Floating point math
const pnl = trade.exitPrice - trade.entryPrice

// ✅ ALWAYS - Decimal math
import { Decimal } from 'decimal.js'
const pnl = new Decimal(trade.exitPrice).minus(trade.entryPrice)
```

#### Auto-Fix Actions:
- Scan `server/database.ts`, `lib/account-metrics.ts`, `lib/financial-math.ts`
- Find arithmetic operators on price/PnL fields → Convert to Decimal
- Check database serialization → Ensure Prisma.Decimal used
- Verify normalization in `lib/data-types.ts` → Uses `decimalToNumber()` helper

#### Standard Pattern:
```typescript
// In lib/data-types.ts
export function decimalToNumber(val: Prisma.Decimal | null | undefined): number {
  if (!val) return 0
  return new Decimal(val).toNumber()
}

// In calculations
const totalPnl = trades.reduce((sum, trade) => 
  sum.plus(new Decimal(trade.pnl || 0)), 
  new Decimal(0)
)
```

---

### 3. DATA NORMALIZATION (Priority: HIGH)

#### ✅ ENFORCE:
- **Single source of truth**: ALL normalization in `lib/data-types.ts`
- **Consistent date handling**: Use `date-fns` with UTC timezone
- **Decimal conversion**: Use `decimalToNumber()` helper

#### Standard Pattern:
```typescript
// lib/data-types.ts
export function normalizeTrade(rawTrade: RawTrade): NormalizedTrade {
  return {
    ...rawTrade,
    // Numeric fields
    entryPrice: decimalToNumber(rawTrade.entryPrice),
    exitPrice: decimalToNumber(rawTrade.exitPrice),
    pnl: decimalToNumber(rawTrade.pnl),
    commission: decimalToNumber(rawTrade.commission),
    
    // Date fields
    entryDate: rawTrade.entryDate ? parseISO(rawTrade.entryDate) : null,
    closeDate: rawTrade.closeDate ? parseISO(rawTrade.closeDate) : null,
    
    // Ensure required fields
    accountNumber: rawTrade.accountNumber ?? '',
    instrument: rawTrade.instrument ?? '',
  }
}
```

#### Auto-Fix Actions:
- Find duplicate normalization code → Consolidate into `lib/data-types.ts`
- Check `context/data-provider.tsx` → Should call `normalizeTrade()`
- Verify all API responses → Use normalization functions
- Scan for manual `.toNumber()` calls → Use helper instead

---

### 4. ERROR HANDLING (Priority: HIGH)

#### ✅ ENFORCE:
- **React Error Boundaries** around: Dashboard, Import Flow, Settings, Widget Canvas
- **Try-catch ALL async operations**
- **User-friendly error messages** - No technical jargon
- **Graceful degradation** - App must work with partial data
- **Error logging** - Use `console.error()` with context

#### ❌ FORBIDDEN PATTERNS:
```typescript
// ❌ Silent failure
someAsyncCall().catch(() => {})

// ❌ Generic error
throw new Error('Failed')

// ✅ Proper error handling
try {
  await someAsyncCall()
} catch (error) {
  console.error('Failed to load user data:', { userId, error })
  toast.error('Unable to load your data. Please refresh the page.')
  // Still return default/cached data
  return defaultData
}
```

#### Auto-Fix Actions:
- Find async calls without try-catch → Wrap them
- Check API routes → Ensure proper error responses
- Scan for generic error messages → Make them actionable
- Add Error Boundaries to:
  - `/app/[locale]/dashboard/layout.tsx`
  - `/app/[locale]/dashboard/import/page.tsx`
  - `/app/[locale]/dashboard/components/widget-canvas.tsx`

#### Standard Error Boundary:
```typescript
// components/error-boundary.tsx
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

// Wrap components
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <DashboardWidgets />
</ErrorBoundary>
```

---

### 5. PERFORMANCE OPTIMIZATION (Priority: MEDIUM)

#### ✅ ENFORCE:
- **Memoize expensive calculations** - `useMemo` for filtering/sorting
- **Debounce saves** - Prevent race conditions (300ms standard)
- **Lazy load components** - Use `dynamic()` for heavy widgets
- **Cache server responses** - `unstable_cache` with tags
- **Virtual scrolling** - For tables with 500+ items

#### Auto-Fix Actions:
- Find expensive `.filter()` or `.map()` chains → Wrap in `useMemo`
- Check save operations → Ensure debounced
- Scan for large components → Add lazy loading
- Verify API routes → Add caching with revalidation

#### Standard Patterns:
```typescript
// Memoization
const filteredTrades = useMemo(() => 
  trades.filter(trade => /* expensive logic */),
  [trades, filters] // Minimal deps
)

// Debouncing
import { debounce } from 'lodash'
const debouncedSave = useMemo(
  () => debounce(saveDashboardLayout, 300),
  []
)

// Caching
import { unstable_cache } from 'next/cache'
const getCachedData = unstable_cache(
  async (userId: string) => { /* expensive query */ },
  ['cache-key'],
  { tags: ['user-data'], revalidate: 3600 }
)
```

---

### 6. SECURITY (Priority: CRITICAL)

#### ✅ ENFORCE:
- **Auth check FIRST** - All server actions call `getUserId()`
- **Validate ALL inputs** - Server-side with Zod
- **Sanitize user content** - Comments, notes, HTML
- **Row Level Security** - Supabase RLS policies
- **Webhook verification** - Validate signatures
- **Rate limiting** - Prevent abuse

#### ❌ FORBIDDEN PATTERNS:
```typescript
// ❌ No auth check
export async function deleteTradeAction(tradeId: string) {
  await prisma.trade.delete({ where: { id: tradeId } })
}

// ❌ No input validation
export async function updateCommentAction(comment: string) {
  await prisma.trade.update({ data: { comment } })
}

// ✅ Proper security
export async function deleteTradeAction(tradeId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')
  
  const tradeIdSchema = z.string().uuid()
  const validatedId = tradeIdSchema.parse(tradeId)
  
  // Verify ownership
  const trade = await prisma.trade.findFirst({
    where: { id: validatedId, userId }
  })
  if (!trade) throw new Error('Trade not found')
  
  await prisma.trade.delete({ where: { id: validatedId } })
}
```

#### Auto-Fix Actions:
- Scan all server actions → Ensure `getUserId()` at top
- Check all mutations → Verify Zod validation
- Find user content fields → Add sanitization (DOMPurify)
- Review API routes → Add rate limiting

---

### 7. INTERNATIONALIZATION (i18n) (Priority: MEDIUM)

#### ✅ ENFORCE:
- **ALL user-facing text** must use `useI18n()` hook
- **NO hardcoded strings** in components
- **Locale-aware routing** - All links prefixed with `/${locale}`
- **Translations in both EN/FR**

#### Standard Pattern:
```typescript
import { useI18n } from '@/locales/client'

export function MyComponent() {
  const t = useI18n()
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: user.name })}</p>
      <Link href={`/${locale}/dashboard`}>
        {t('nav.dashboard')}
      </Link>
    </div>
  )
}
```

#### Auto-Fix Actions:
- Find hardcoded strings → Move to translation files
- Check all `<Link>` components → Ensure locale prefix
- Scan for missing translations → Add to both `en.ts` and `fr.ts`
- Verify date/number formatting → Use `formatDate()`, `formatCurrency()`

---

### 8. DATABASE BEST PRACTICES (Priority: HIGH)

#### ✅ ENFORCE:
- **Batch operations** - Use `createMany`, `updateMany` when possible
- **Select only needed fields** - Don't fetch entire models
- **Indexed queries** - Query on indexed columns
- **Connection pooling** - Configured (max 2 connections)
- **Deduplication** - Use UUID v5 for trade hashing

#### Standard Patterns:
```typescript
// Batch insert
await prisma.trade.createMany({
  data: validatedTrades,
  skipDuplicates: true // Based on unique ID
})

// Select specific fields
const accounts = await prisma.account.findMany({
  where: { userId },
  select: {
    id: true,
    accountNumber: true,
    balance: true,
    // Don't fetch unnecessary fields
  }
})

// Trade deduplication
import { v5 as uuidv5 } from 'uuid'
const tradeId = uuidv5(
  JSON.stringify({ 
    userId, 
    accountNumber, 
    entryDate, 
    instrument, 
    quantity 
  }),
  TRADE_NAMESPACE
)
```

#### Auto-Fix Actions:
- Find `findMany()` without `select` → Add field selection
- Check for sequential inserts → Convert to `createMany`
- Verify all userId queries → Ensure indexed
- Scan for missing deduplication → Add UUID v5 hashing

---

### 9. COMPONENT PATTERNS (Priority: MEDIUM)

#### ✅ ENFORCE:
- **Server Components by default** - Use `'use client'` only when needed
- **Radix UI primitives** - All base components from `@radix-ui`
- **Consistent styling** - Use Tailwind classes, avoid inline styles
- **Prop validation** - Use TypeScript interfaces for all props
- **Composition over inheritance**

#### Standard Pattern:
```typescript
// components/ui/button.tsx (Radix wrapper)
import { Button as RadixButton } from '@radix-ui/react-button'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ComponentProps<typeof RadixButton> {
  variant?: 'default' | 'outline' | 'ghost'
}

export function Button({ variant = 'default', className, ...props }: ButtonProps) {
  return (
    <RadixButton
      className={cn(
        'btn-base',
        variant === 'outline' && 'btn-outline',
        className
      )}
      {...props}
    />
  )
}

// Dashboard widget pattern
'use client'
import { useData } from '@/context/data-provider'
import { useAnalysisStore } from '@/store/analysis-store'

export function ExpectancyWidget() {
  const { trades } = useData()
  const filters = useAnalysisStore()
  
  const expectancy = useMemo(() => {
    // Calculation logic
  }, [trades, filters])
  
  return <ChartComponent data={expectancy} />
}
```

#### Auto-Fix Actions:
- Remove `'use client'` from components that don't need it
- Find inline styles → Convert to Tailwind classes
- Check prop types → Ensure all have interfaces
- Verify component imports → Use shared UI components

---

### 10. TESTING REQUIREMENTS (Priority: HIGH)

#### ✅ ENFORCE:
- **Unit tests for financial logic** - `lib/account-metrics.ts` MUST be tested
- **Integration tests for imports** - Verify deduplication works
- **E2E tests for critical flows** - Login, import, dashboard
- **Type checking before commit** - `npm run typecheck`

#### Standard Test Pattern:
```typescript
// lib/__tests__/account-metrics.test.ts
import { describe, it, expect } from 'vitest'
import { computeAccountMetrics } from '../account-metrics'
import { Decimal } from 'decimal.js'

describe('computeAccountMetrics', () => {
  it('calculates total PnL with decimal precision', () => {
    const trades = [
      { pnl: new Decimal('10.01') },
      { pnl: new Decimal('5.99') },
    ]
    const metrics = computeAccountMetrics(trades)
    expect(metrics.totalPnl.toString()).toBe('16.00')
  })
  
  it('handles commission deductions', () => {
    // Test commission calculations
  })
})
```

#### Auto-Fix Actions:
- Find financial functions without tests → Create test files
- Check test coverage → Target 80%+
- Verify CI/CD → Ensure tests run on push
- Add missing test configs

---

## 🚨 Critical Files - Handle with Care

### DO NOT HEAVILY REFACTOR (without approval):
1. **`context/data-provider.tsx`** (57KB, 1764 lines)
   - Central data provider - breaking changes affect entire app
   - Can split into modules, but keep API compatible

2. **`server/database.ts`** (29KB, 968 lines)
   - Core DB operations - changes affect all imports
   - Can extract functions, but maintain function signatures

3. **`prisma/schema.prisma`** (1178 lines)
   - Database schema - changes require migrations
   - Only add fields, never remove without migration strategy

4. **`lib/data-types.ts`** (11KB)
   - Shared types - changes cascade through entire codebase
   - Extend types, don't break existing ones

### SAFE TO REFACTOR:
- Widget components (`app/[locale]/dashboard/components/`)
- Individual stores (`store/`)
- Utility functions (`lib/utils.ts`)
- UI components (`components/ui/`)

---

## 🔍 Auto-Fix Checklist

When tasked with "fix everything automatically", execute in this order:

### Phase 1: Type Safety & Correctness (CRITICAL)
- [ ] Remove all `any` types → Replace with proper types
- [ ] Eliminate `as unknown as` casts → Use type guards
- [ ] Verify financial calculations → All use `Decimal`
- [ ] Add Zod validation to API routes
- [ ] Check auth in all server actions

### Phase 2: Error Handling (CRITICAL)
- [ ] Add Error Boundaries to 4 key locations
- [ ] Wrap all async operations in try-catch
- [ ] Improve error messages (user-friendly)
- [ ] Ensure graceful degradation

### Phase 3: Security (CRITICAL)
- [ ] Verify auth checks in all mutations
- [ ] Sanitize user-generated content
- [ ] Add rate limiting to import endpoints
- [ ] Check webhook signature verification

### Phase 4: Performance (HIGH)
- [ ] Add memoization to expensive calculations
- [ ] Debounce all save operations
- [ ] Implement virtual scrolling for large tables
- [ ] Add caching to API routes

### Phase 5: Code Quality (MEDIUM)
- [ ] Consolidate duplicate code
- [ ] Fix inconsistent naming
- [ ] Add missing JSDoc comments
- [ ] Format with Prettier

### Phase 6: Testing (HIGH)
- [ ] Add tests for `lib/account-metrics.ts`
- [ ] Test trade import deduplication
- [ ] Add E2E tests for critical flows
- [ ] Verify type checking passes

---

## 🎨 Code Style Guide

### Naming Conventions
- **Files**: `kebab-case.tsx` (components), `kebab-case.ts` (utilities)
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase` with `Type` suffix for unions

### Imports Order
```typescript
// 1. React/Next
import { useState } from 'react'
import Link from 'next/link'

// 2. External libraries
import { Decimal } from 'decimal.js'
import { z } from 'zod'

// 3. Internal - absolute imports with @/ alias
import { Button } from '@/components/ui/button'
import { useI18n } from '@/locales/client'
import { getUserId } from '@/server/auth'

// 4. Relative imports
import { localHelper } from './helpers'

// 5. Types
import type { Trade } from '@/lib/data-types'
```

### File Structure
```typescript
// 1. Imports
import ...

// 2. Types/Interfaces
interface ComponentProps { }
type DataType = { }

// 3. Constants
const DEFAULT_PAGE_SIZE = 50

// 4. Component or function
export function MyComponent(props: ComponentProps) {
  // a. Hooks
  const t = useI18n()
  const [state, setState] = useState()
  
  // b. Derived values
  const computed = useMemo(() => ...)
  
  // c. Callbacks
  const handleClick = useCallback(() => ...)
  
  // d. Effects
  useEffect(() => ...)
  
  // e. Early returns
  if (!data) return <Loading />
  
  // f. Render
  return (...)
}

// 5. Helper functions
function helperFunction() { }
```

---

## 📊 Quality Metrics to Maintain

### Code Quality
- **Type Coverage**: \u003e95% (no `any` types)
- **Test Coverage**: \u003e80% for business logic
- **Bundle Size**: Keep \u003c500KB initial load
- **Lighthouse Score**: \u003e90 on all metrics

### Performance
- **Time to Interactive**: \u003c3s
- **API Response Time**: \u003c200ms (95th percentile)
- **Database Query Time**: \u003c100ms average
- **Build Time**: \u003c5 minutes

### Security
- **Zero** hardcoded secrets in code
- **All** API routes require authentication
- **All** inputs validated with Zod
- **All** user content sanitized

---

## 🔄 Common Issue Resolutions

### Issue: "trades not showing on dashboard"
**Root Cause**: Data provider not normalizing trades correctly  
**Fix**:
1. Check `context/data-provider.tsx` → Verify `normalizeTrade()` called
2. Check browser console for errors
3. Verify `useData()` hook returns trades array
4. Check filters in `analysis-store` - may be filtering out all trades

### Issue: "Decimal precision errors"
**Root Cause**: Using JavaScript Number for calculations  
**Fix**:
1. Find calculation → Replace with `Decimal`
2. Import from `decimal.js`
3. Only convert to number for display
4. Update normalization in `lib/data-types.ts`

### Issue: "Import failing with validation error"
**Root Cause**: CSV data doesn't match Zod schema  
**Fix**:
1. Check `server/database.ts` → `importTradeSchema`
2. Add `.transform()` to coerce types
3. Make fields optional if nullable
4. Test with sample CSV

### Issue: "Widget not saving layout"
**Root Cause**: Save operation failing or debounce too long  
**Fix**:
1. Check `app/[locale]/dashboard/dashboard-context-auto-save.tsx`
2. Verify debounce timing (should be 300ms)
3. Check IndexedDB storage quota
4. Verify server action `saveDashboardLayoutAction` succeeds

### Issue: "Translation missing"
**Root Cause**: Key not in translation files  
**Fix**:
1. Add key to **both** `locales/en.ts` and `locales/fr.ts`
2. Use nested object structure for organization
3. Restart dev server to reload translations

### Issue: "Database connection timeout"
**Root Cause**: Pool exhausted or slow query  
**Fix**:
1. Check `prisma.config.ts` → Connection pool settings
2. Verify `PG_POOL_MAX=2` in environment
3. Add `select` clauses to limit data
4. Check for N+1 queries

---

## 🎯 Decision Framework

When fixing issues, follow this decision tree:

### 1. Safety Check
- **Will this break existing functionality?** → If yes, request approval
- **Does this change database schema?** → If yes, create migration
- **Does this affect financial calculations?** → If yes, add tests FIRST

### 2. Impact Assessment
- **How many files affected?** → If \u003e10, create multiple PRs
- **Any external dependencies?** → Check for breaking changes
- **Performance impact?** → Profile before/after

### 3. Testing Requirement
- **Is this business logic?** → Unit test required
- **Is this user-facing?** → E2E test recommended
- **Is this financial?** → Test with decimal precision

### 4. Documentation Update
- **New pattern introduced?** → Document in this file
- **API changed?** → Update README.md
- **Breaking change?** → Add to CHANGELOG.md

---

## 🚀 Deployment Checklist

Before deploying fixes:

### Pre-Deploy
- [ ] Run `npm run typecheck` → Zero errors
- [ ] Run `npm run lint` → Zero errors
- [ ] Run `npm run test` → All passing
- [ ] Check `prisma generate` → Success
- [ ] Verify `.env` has all required vars

### Post-Deploy
- [ ] Check `/api/health` → Status "ok"
- [ ] Test critical flow: Login → Dashboard → Import
- [ ] Monitor error logs for 15 minutes
- [ ] Verify webhook processing still works
- [ ] Check database connection pool utilization

---

## 📚 Reference Documents

### Essential Reading (in order)
1. **README.md** - Setup and overview
2. **PROJECT_STRUCTURE.md** - Architecture details
3. **ARCHITECTURE_GRADE.md** - Known issues and priorities
4. **docs/ANALYTICS_METRIC_DEFINITIONS.md** - Financial formulas
5. **docs/INCIDENT_RUNBOOK.md** - Emergency procedures

### Key Files to Understand
- `lib/data-types.ts` - Data normalization patterns
- `server/database.ts` - Database operation patterns
- `context/data-provider.tsx` - Data flow architecture
- `app/[locale]/dashboard/components/widget-canvas.tsx` - Widget system

---

## 💡 AI Agent Instructions

When you receive a request to "fix everything automatically":

1. **Analyze** the current state by reading:
   - Recent git commits
   - Open files in IDE
   - Error logs if provided

2. **Prioritize** fixes using the Phase checklist above

3. **Execute** fixes in small, atomic commits:
   - One fix per file when possible
   - Clear commit messages: "fix: remove any types from data-provider"
   - Test after each change

4. **Validate** each fix:
   - Run type checker
   - Run tests
   - Manual smoke test if critical

5. **Report** what was fixed:
   - List of issues found
   - Actions taken
   - Remaining issues (if any)
   - Recommendations for manual review

### Example Auto-Fix Session Output

```markdown
## Auto-Fix Report - 2026-02-10

### Issues Found: 47
- Type safety: 12 instances of `any` type
- Financial precision: 5 calculations using Number
- Error handling: 8 unhandled async operations
- Security: 3 missing auth checks
- Performance: 7 missing memoization
- i18n: 12 hardcoded strings

### Fixes Applied: 42
✅ Type safety: Converted 11/12 `any` to proper types (1 needs manual review)
✅ Financial: All calculations now use Decimal
✅ Error handling: Added try-catch to all async ops
✅ Security: Added auth checks to all mutations
✅ Performance: Added memoization to expensive calculations
✅ i18n: Moved all strings to translation files

### Manual Review Required: 5
⚠️ data-provider.tsx line 450 - Complex type inference needed
⚠️ account-metrics.ts - Needs unit tests before refactoring
⚠️ database.ts line 230 - Raw SQL query needs validation
⚠️ widget-canvas.tsx - Performance optimization needs testing
⚠️ schema.prisma - Proposed index needs DBA approval

### Tests: All Passing ✅
- Unit tests: 45/45 passing
- Type check: 0 errors
- Lint: 0 errors

### Next Steps:
1. Review items marked for manual review
2. Add tests for account-metrics.ts
3. Deploy to staging
4. Monitor for 24 hours before production
```

---

## 🎓 Learning Resources

### For AI Agents
- **Next.js 15 App Router**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **Prisma Best Practices**: https://www.prisma.io/docs/guides
- **Decimal.js Documentation**: https://mikemcl.github.io/decimal.js/
- **Zod Validation**: https://zod.dev

### Qunt Edge Specific
- Read all `/docs/*.md` files for domain knowledge
- Study existing widgets for component patterns
- Review `server/database.ts` for DB patterns
- Check `locales/en.ts` for translation structure

---

## ✅ Success Criteria

You've successfully "fixed everything" when:

- [ ] **Zero TypeScript errors** in `npm run typecheck`
- [ ] **Zero ESLint errors** in `npm run lint`
- [ ] **All tests passing** in `npm run test`
- [ ] **No `any` types** in production code
- [ ] **All financial calculations** use Decimal
- [ ] **All server actions** have auth checks
- [ ] **All async operations** have error handling
- [ ] **All user-facing text** uses i18n
- [ ] **Performance metrics** meet targets
- [ ] **Security checklist** completed

---

## 🏆 Grade Target

Current Grade: **B+ (85/100)**  
Target Grade: **A (95/100)**

To achieve Grade A, ensure:
1. ✅ Zero type safety issues
2. ✅ 80%+ test coverage
3. ✅ All critical fixes implemented
4. ✅ Security audit passing
5. ✅ Performance benchmarks met

---

**Last Updated**: 2026-02-10  
**Version**: 1.0  
**Maintainer**: AI Auto-Fix System  

---

*This master prompt is a living document. Update it as patterns evolve and new issues are discovered.*
