# 🤖 AI Agent Engineering Log

This file tracks significant architectural changes, engineering insights, and critical fixes to provide context for future AI agents working on this codebase.

---

# Developer Guide

## Essential Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Production build  
npm run start            # Start production server
```

### Quality Gates
```bash
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run self-heal        # Auto-fix lint issues + validate
```

### Testing
```bash
npm run test             # Run all tests (vitest)
npm run test:coverage    # Run tests with coverage
npm run test:smoke       # Run HTTP smoke tests

# Run a SINGLE test file:
npx vitest run tests/logger.test.ts

# Run a SINGLE test by name:
npx vittest run -t "should redact secrets"
```

### Performance & Analysis
```bash
npm run check:route-budgets     # Check route bundle sizes
npm run analyze:bundle          # Analyze bundle composition
npm run check:color-contract   # Verify monochrome color usage
npm run check:dead-code        # Check for dead code
npm run perf:verify            # Full perf validation
```

### Database
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to DB
npx prisma migrate dev # Run migrations
```

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix
- Group: external libs → internal libs → components → utils
- Example:
```typescript
import { useState } from 'react'
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
```

### TypeScript
- Explicit types for parameters/returns
- Use `unknown` instead of `any`
- Example:
```typescript
interface FetchResult {
  data: Data[];
  error?: string;
}
export async function fetchData(id: string): Promise<FetchResult> { }
```

### React Components
- Functional components with hooks
- Use `React.forwardRef` for ref forwarding
- Set `displayName` for named components
- Use `cva` for variants

### Server Actions
- Add `'use server'` at top
- Use `getDatabaseUserId()` for auth
- Use `next/cache` tags for revalidation:
```typescript
import { updateTag } from 'next/cache'
updateTag(`trades-${userId}`)
```

### CSS & Styling
- Use `cn()` from lib/utils for class merging
- Follow monochrome: `white/5`, `white/10`, `white/20`
- No raw colors - use semantic tokens

### Testing
- Tests use Vitest with jsdom
- Test files: `tests/*.test.ts`

---

## Entry Structure for Future Agents
When documenting feature updates, **YOU MUST** follow this conversational structure to ensure context is preserved:

- **What changed:** A clear, high-level summary of the update (e.g., "Added a new specific widget").
- **What I want:** The user-centric goal or desired behavior. Why are we doing this? (e.g., "Users should see risk metrics immediately").
- **What I don't want:** The problem, regression, or anti-pattern we are avoiding. This is critical for preventing future regressions (e.g., "I don't want a full page reload").
- **How we fixed that:** The technical implementation details, architectural decisions, and specific libraries used.
- **Key Files:** The most critical files modified or created during this task.
- **Verification:** Specific manual steps or observations to confirm the change (e.g., "Go to dashboard -> Click Edit -> See Widget").

---

## �🛡️ Core Infrastructure & Security
- **2026-02-14: Prisma TLS Hardening.** 
  - Added explicit SSL controls (`PGSSL_ENABLE`, `PGSSL_REJECT_UNAUTHORIZED`) in `lib/prisma.ts`.
  - **Context:** Prevents "self-signed certificate in certificate chain" errors common when connecting to managed DB pools (e.g., Supabase/Neon) from serverless environments.
- **2026-02-13: Supabase Storage Scaling.**
  - Updated configuration to support production-level asset management and scaling.
- **2026-02-13: GLM AI Client.**
  - Implemented environment-driven AI client selection for GLM integration.

## 🎨 UI/UX & Design System

### 2026-03-10: One-Shot Lag + Cache Stabilization Sweep (No UX Contract Changes)
- **What changed:** Applied a focused one-shot performance/caching stabilization pass across dashboard data flows, cache invalidation consistency, and background runtime overhead while preserving existing user-facing behavior.
- **What I want:** Reduce avoidable rerender/fetch churn and stale-cache windows without removing existing interactions, layouts, or dashboard workflows.
- **What I don't want:** Breaking widget/table/accounts UX contracts, introducing forced refresh behavior, or changing route-level private/public cache guarantees.
- **How we fixed that:**
  - Removed duplicate trades refresh fetch path in `context/trades-context.tsx` by reusing a single `getTradesAction` response for UI + cache writes.
  - Reduced load-time auth/user-id lookup churn in `context/data-provider.tsx` by resolving `userId` once per load sequence and reusing it for layout/trade/user-data branches.
  - Optimized trade sorting path in `context/providers/derived-selectors.ts` to avoid repeated Date parsing during sort/filter preparation.
  - Lowered background runtime pressure:
    - `app/[locale]/dashboard/components/global-sync-button.tsx`: slowed next-sync ticker updates from 1s to 5s, paused updates when tab hidden, removed infinite pulsing glow animation loop.
    - `app/[locale]/dashboard/trader-profile/page-client.tsx`: replaced fixed 30s benchmark polling interval with visibility-aware scheduled refresh (60s cadence + immediate refresh on tab visibility restore).
    - `components/motion/global-motion-effects.tsx`: disabled global scroll/progress motion effects on non-desktop viewports.
    - `components/motion/smooth-scroll-provider.tsx`: disabled smooth-scroll listener wiring on mobile widths.
  - Standardized cache freshness invalidation in mutation paths:
    - `server/groups.ts`: added user-scoped `updateTag(...)` invalidation for user-data/trades/dashboard tags after group/account/trade-grouping mutations.
    - `server/shared.ts`: added shared-view tag invalidation on create/delete and reduced shared-view revalidate window from 1h to 5m.
  - Preserved current public/private cache-header policy model and verified no regressions.
- **Key Files:** `context/trades-context.tsx`, `context/data-provider.tsx`, `context/providers/derived-selectors.ts`, `app/[locale]/dashboard/components/global-sync-button.tsx`, `app/[locale]/dashboard/trader-profile/page-client.tsx`, `components/motion/global-motion-effects.tsx`, `components/motion/smooth-scroll-provider.tsx`, `server/groups.ts`, `server/shared.ts`, `app/[locale]/(home)/components/DeferredHomeSections.tsx`, `app/[locale]/(landing)/pricing/pricing-page-client.tsx`.
- **Verification:**
  - `npm run -s build` -> passes with full route generation.
  - `npm run -s check:route-budgets` -> all monitored routes within budget.
  - `npm run -s analyze:bundle` -> artifact regenerated at `docs/audits/artifacts/bundle-summary.json`.
  - `npm run -s perf:headers` -> expected private/public cache policy split holds.
  - `npm run -s perf:baseline` -> baseline artifact regenerated.
  - `npm run -s perf:lighthouse` -> still failing current strict thresholds (mobile TBT/LCP + desktop TBT), but values improved from prior worst-case spikes and now show the remaining hotspot scope.
  - `npm run -s typecheck` remains flaky in this workspace due `.next/types/cache-life.d.ts` clean/regenerate race from current script flow; build/type generation during build succeeds.

### 2026-03-10: Home Motion Runtime Trim (Static Section Pass)
- **What changed:** Removed non-essential `framer-motion` wrappers from key home marketing sections and cleaned follow-up lint issues from prior motion-removal edits.
- **What I want:** Lower home-page runtime overhead and hydration work without changing copy, layout structure, CTA paths, or dashboard behavior.
- **What I don't want:** Decorative in-view animation wrappers keeping unnecessary client runtime cost on static marketing content, or leaving unused callback vars/imports after motion cleanup.
- **How we fixed that:**
  - Converted `CTA` and `PricingSection` from `motion.div` wrappers to static containers and removed `framer-motion` imports.
  - Kept pricing CTA behavior unchanged (`Pro AI` still uses `buildWhopCheckoutUrl`, `Desk` still routes to support, `Starter` keeps auth onboarding).
  - Cleaned map callback signatures in already-converted sections to remove unused iterator variables introduced during staged motion cleanup (`WhyChooseUs`, `AIFuturesSection`, `ComparisonSection`).
  - Preserved interactive/client components where still needed (`AIFuturesSection` tabs, `AnalysisDemo` behavior), limiting this pass to low-risk static wrapper removal.
- **Key Files:** `app/[locale]/(home)/components/CTA.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `AGENTS.md`.
- **Verification:**
  - `npx eslint app/[locale]/(home)/components/WhyChooseUs.tsx app/[locale]/(home)/components/AIFuturesSection.tsx app/[locale]/(home)/components/ComparisonSection.tsx app/[locale]/(home)/components/CTA.tsx app/[locale]/(home)/components/PricingSection.tsx` -> passes (no errors).
  - `npm run -s typecheck` -> passes (route types generated).
  - `npm run -s build` -> passes with full route generation.
  - `npm run -s check:route-budgets` -> all monitored routes within budget.
  - `npm run -s analyze:bundle` -> artifact regenerated at `docs/audits/artifacts/bundle-summary.json`.
  - `npm run -s perf:lighthouse` -> blocked in this environment by Chrome interstitial/runtime load failure.


### 2026-03-08: Team Analytics Duplicate Fix
- **What changed:** Removed duplicate analytics calculation block and aligned best-member PnL with groupBy result shape.
- **What I want:** Clean typecheck/build for team analytics routes.
- **What I don't want:** Duplicate variable declarations or invalid best-member fields.
- **How we fixed that:** Kept a single analytics calculation block, used `bestMemberResult[0]?._sum?.pnl` for PnL, and re-ran verification.
- **Key Files:** `server/teams.ts`, `tasks/todo.md`.
- **Verification:** `npm run -s typecheck`, `npm run -s lint -- --max-warnings=999999`, `npm run -s build`.


### 2026-03-08: Runtime Stabilization Sweep (Console Logs + Typecheck Recovery)
- **What changed:** Removed runtime `console.log(...)` noise across app/context/hooks/lib runtime files and restored clean typecheck after interim schema/type drift.
- **What I want:** Quiet production logs, preserved `warn/error` diagnostics, and a reliable green typecheck while performance/security fixes continue.
- **What I don't want:** Debug logging in runtime paths, type regressions from partial enum/schema refactors, or false completion claims without verification.
- **How we fixed that:**
  - Removed `console.log(...)` from scoped runtime surfaces (`app/**`, `components/**`, `context/**`, targeted `hooks/**` and `lib/**`) while keeping `console.warn/error`.
  - Fixed `billing-management` status handling by switching UI status guards to normalized string matching instead of Prisma enum import coupling.
  - Fixed `suggestion-input` hook-order issue by stabilizing `validateInput` with `useCallback` and correcting memo placement.
  - Reverted incomplete schema enum refactor path to maintain current codebase compatibility and regenerated Prisma client.
- **Key Files:** `app/api/**`, `app/[locale]/dashboard/billing/components/billing-management.tsx`, `app/[locale]/dashboard/components/accounts/suggestion-input.tsx`, `hooks/use-tradovate-token-manager.ts`, `lib/widget-*.ts`, `lib/browser-sandbox.ts`, `prisma/schema.prisma`, `tasks/todo.md`.
- **Verification:** `npm run -s typecheck` exits `0`; scoped grep confirms runtime `console.log(` removal in targeted paths.


### 2026-03-08: Team Analytics Typecheck Fix
- **What changed:** Removed duplicated analytics variables and ensured averageRr/bestMember values are defined once during team analytics update.
- **What I want:** Restore clean build/typecheck for team analytics route.
- **What I don't want:** Duplicate variable declarations triggering Turbopack errors.
- **How we fixed that:** Normalized the analytics block to a single set of computed values and kept a single upsert update path.
- **Key Files:** `server/teams.ts`.
- **Verification:** `npm run -s typecheck`, `npm run -s lint -- --max-warnings=999999`, `npm run -s build`.


### 2026-03-08: Typecheck Fix (server/teams.ts)
- **What changed:** Fixed Prisma join usage, removed duplicate update block, and defined averageRr fallback for team analytics updates.
- **What I want:** Restore successful typecheck after performance fixes.
- **What I don't want:** Build and typecheck failures from undefined symbols or duplicate keys.
- **How we fixed that:** Swapped `prisma.join` -> `Prisma.join`, removed duplicate update block, and used computed `averageRr` fallback.
- **Key Files:** `server/teams.ts`, `tasks/todo.md`.
- **Verification:** `npm run -s typecheck`, `npm run -s lint -- --max-warnings=999999`, `npm run -s build`.


### 2026-03-08: Performance Verification Complete (Typecheck Fix + Full Pass)
- **What changed:** Fixed all remaining TypeScript/Prisma enum typing errors across billing/subscription code and verified complete build/test/lint suite.
- **What I want:** Green typecheck, successful build, and passing tests after migrating from string-based status fields to strict Prisma enums.
- **What I don't want:** Type errors blocking deployment or runtime status mismatches between code and database schema.
- **How we fixed that:**
  - Added `@@schema("public")` to Prisma enums (`SubscriptionStatus`, `PayoutStatus`) and moved enum definitions before models.
  - Updated `Subscription` model to use `status SubscriptionStatus @default(ACTIVE)` instead of `String`.
  - Fixed all status comparisons across codebase:
    - `billing-management.tsx`: Imported Prisma enum, removed local type alias, updated switch cases
    - `team-subscription-badge*.tsx`: Used enum values (`ACTIVE`, `CANCELLED`, `PAST_DUE`, `PENDING`)
    - `accounts-overview.tsx`: Added proper type casting for payout status
    - `admin/reports/route.ts`: Changed `TRIAL` → `PENDING`
    - `admin/subscriptions/route.ts`: Added `as const` to all status strings
    - `server/billing.ts`: Added enum type cast for `dbStatus` variable
    - `server/subscription-manager.ts`: Fixed type definition, status variable, and `PAUSED` → `PENDING`
    - `server/subscription.ts`: Fixed `TRIAL` → `PENDING` comparison
    - `server/webhook-service.ts`: Fixed all `TRIAL` → `PENDING` assignments
  - Removed invalid `VALIDATED` payout status from `accounts-table-view.tsx`.
- **Key Files:** `prisma/schema.prisma`, `app/[locale]/dashboard/components/billing-management.tsx`, `app/[locale]/teams/components/team-subscription-badge*.tsx`, `app/[locale]/dashboard/components/accounts/*.tsx`, `app/api/admin/*.ts`, `server/billing.ts`, `server/subscription*.ts`, `server/webhook-service.ts`, `tasks/todo.md`, `AGENTS.md`.
- **Verification:**
  - `npm run -s typecheck` → `✓ Types generated successfully` (0 errors)
  - `npm run -s lint` → `1504 problems (0 errors, 1504 warnings)`
  - `npm run -s build` → `✓ Compiled successfully`, `Generated 41 routes`
  - `npm test` → `156 passed | 46 skipped` (37 files)
  - All changes committed to `fix/performance-optimization` branch (commit `85635c8`)


### 2026-03-08: Provider Hook Migration (Import Cleanup)
- **What changed:** Migrated dashboard hook imports to dedicated provider files and aligned provider files to re-export existing slice hooks.
- **What I want:** Clearer separation of trades/filters/derived/actions imports without changing runtime behavior.
- **What I don't want:** Broad refactors that risk behavior changes during performance work.
- **How we fixed that:** Rewrote provider files to re-export `useDashboard*` hooks and updated imports across app/components/context to consume the new provider modules.
- **Key Files:** `context/providers/*.tsx`, various dashboard components importing slice hooks.
- **Verification:** Not run in this environment; requires TypeScript + dashboard smoke check.


### 2026-03-08: Data Provider File Split (Hook Re-exports)
- **What changed:** Added focused provider hook files for trades, filters, derived stats, and actions.
- **What I want:** Clearer module boundaries and easier incremental migration away from the monolithic data-provider file.
- **What I don't want:** Confusion over which slice hook to use or accidental reliance on a giant provider file for simple imports.
- **How we fixed that:** Created `context/providers/*-provider.tsx` modules that re-export the slice hooks and types from `context/data-provider.tsx` without changing runtime behavior.
- **Key Files:** `context/providers/trades-provider.tsx`, `context/providers/filters-provider.tsx`, `context/providers/derived-provider.tsx`, `context/providers/actions-provider.tsx`.
- **Verification:** Not run in this environment; hook imports should resolve to existing slice contexts.


### 2026-03-08: Performance Rescue (Memoized Charts + Widgets)
- **What changed:** Memoized remaining dashboard chart + widget components to reduce re-render churn.
- **What I want:** Ensure charts/widgets do not re-render unless their props change.
- **What I don't want:** Filter or layout changes causing every chart/widget to re-render.
- **How we fixed that:** Wrapped dashboard chart and widget components with `React.memo`.
- **Key Files:** `app/[locale]/dashboard/components/charts/*.tsx`, `app/[locale]/dashboard/components/widgets/*.tsx`, `app/[locale]/dashboard/components/calendar/*.tsx`.
- **Verification:** Not run in this environment; requires dashboard render check.


### 2026-03-08: Performance Rescue (Memoized Charts + Widgets)
- **What changed:** Memoized remaining dashboard chart + widget components to reduce re-render churn.
- **What I want:** Ensure charts/widgets do not re-render unless their props change.
- **What I don't want:** Filter or layout changes causing every chart/widget to re-render.
- **How we fixed that:** Wrapped dashboard chart and widget components with `React.memo`.
- **Key Files:** `app/[locale]/dashboard/components/charts/*.tsx`, `app/[locale]/dashboard/components/widgets/*.tsx`.
- **Verification:** Not run in this environment; requires dashboard render check.


### 2026-03-08: Performance Rescue (Memoized Stats + Lazy Widgets)
- **What changed:** Memoized statistics widgets and switched widget registry to lazy-load dashboard widgets via `next/dynamic`.
- **What I want:** Reduce dashboard re-render cost and initial JS load by only loading active widgets and preventing repeated stat widget renders.
- **What I don't want:** All widgets re-rendering on filter changes or every widget JS bundle loading upfront.
- **How we fixed that:**
  - Wrapped all statistics widgets with `React.memo`.
  - Replaced static widget imports in `widget-registry.tsx` with `dynamic` imports (named exports handled via `.then(m => ({ default: m.X }))`).
- **Key Files:** `app/[locale]/dashboard/components/statistics/*.tsx`, `app/[locale]/dashboard/config/widget-registry.tsx`.
- **Verification:** Not run in this environment; requires manual dashboard load + widget edit to confirm dynamic widgets render correctly.
- **2026-02-14: Dashboard Navigation Recovery.**
  - Restored legacy `Navbar` in `app/[locale]/dashboard/layout.tsx`.
  - **Insight:** The modern sidebar refactor accidentally hid `Edit Layout` and `Lock Grid` controls; reverting to the legacy navbar ensures these tools remain accessible for layout management.
- **2026-02-12: Monochrome & Glassmorphism Overhaul.**
  - Shifted away from standard Tailwind colors (emerald/rose for everything) to a premium monochrome aesthetic.
  - **Standard:** Use `white/5`, `white/10`, `white/20` for surfaces. Text uses `white/90` (primary) and `white/50` (secondary).
  - See `MONOCHROME_UPDATE_NOTES.md` for full design tokens.
- **2026-02-13: Home Page V2.**
  - Full landing page redesign using `shadcn` components for better pricing clarity and conversion hierarchy.

## 🚀 Recent Feature Updates

### 2026-03-09: UI Hotspot Memoization Follow-Up (Trade Table Row + Draggable Account Card Split)
- **What changed:** Applied a focused render-churn reduction pass on the two highest-traffic dashboard UI surfaces by extracting memoized row/card primitives from large in-file render blocks.
- **What I want:** Reduce avoidable rerenders in table/card-heavy dashboard views while preserving current behavior, interactions, and component contracts.
- **What I don't want:** Massive rewrites of table/accounts logic that risk regressions during stabilization, or keeping large inline render maps that rerender unnecessarily.
- **How we fixed that:**
  - Added memoized trade row renderer directly in `trade-table-review.tsx` (`TradeTableDataRow`) and replaced inline `<tr>` render mapping with component calls.
  - Added dedicated memoized draggable account-card component `draggable-account-card.tsx` and migrated `accounts-overview.tsx` to consume it instead of local in-file drag wrapper implementation.
  - Removed transient helper files from an intermediate refactor attempt to keep the tree clean and avoid dead code/type drift.
- **Key Files:** `app/[locale]/dashboard/components/tables/trade-table-review.tsx`, `app/[locale]/dashboard/components/accounts/draggable-account-card.tsx`, `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`, `tasks/todo.md`, `AGENTS.md`.
- **Verification:** Available static checks pass: `node scripts/check-route-security.mjs`, `node scripts/check-color-contract.mjs`. Full typecheck/build remain blocked in this environment due missing local deps (`next: command not found`).

### 2026-03-09: Dashboard Provider Decomposition Follow-Up (Derived Selector Extraction)
- **What changed:** Extracted the heaviest derived/filter/statistics computations out of the monolithic dashboard data provider into a dedicated selector module.
- **What I want:** Reduce `context/data-provider.tsx` complexity and isolate high-churn computation paths for safer performance iteration.
- **What I don't want:** Breaking existing dashboard consumer hooks while refactoring internals, or leaving large inline derived logic blocks tightly coupled to provider state plumbing.
- **How we fixed that:**
  - Added `context/providers/derived-selectors.ts` with focused pure selectors:
    - `getSortedTrades(...)`
    - `getFormattedTrades(...)`
    - `getStatisticsWithProfitFactor(...)`
    - `getTimeRangeKey(...)`
  - Updated `context/data-provider.tsx` to call the extracted selectors inside existing `useMemo` boundaries.
  - Removed the in-file `getTimeRangeKey(...)` helper and large inline filter/statistics derivation blocks now handled by the selector module.
- **Key Files:** `context/providers/derived-selectors.ts`, `context/data-provider.tsx`, `tasks/todo.md`, `AGENTS.md`.
- **Verification:** `npm run -s typecheck` remains blocked in this environment (`next: command not found`). Available static checks still pass: `node scripts/check-route-security.mjs`, `node scripts/check-color-contract.mjs`.

### 2026-03-09: One-Shot Stability Hardening (Identity + Status + Rate Limit + CI Workflow Repair)
- **What changed:** Executed an immediate stabilization pass across identity resolution, subscription status normalization, rate-limit failure mode controls, and stale CI workflow cleanup.
- **What I want:** Eliminate high-risk auth/user-id drift, reduce subscription status mismatch regressions, fail closed for sensitive API throttling when distributed limiter is unavailable, and keep CI workflows executable in-repo.
- **What I don't want:** Silent user auto-bootstrap in security-sensitive identity resolution paths, duplicated status alias logic across billing/subscription services, production fallback to weak in-memory throttling on sensitive endpoints, or workflows referencing missing scripts.
- **How we fixed that:**
  - Added shared identity resolver utility in `lib/identity-resolver.ts` and migrated core resolution callsites:
    - `server/auth.ts` `getDatabaseUserId()` now resolves strictly (with email lookup fallback only) and no longer auto-creates synthetic user records.
    - `server/trades.ts` and `server/team-membership.ts` now use the shared resolver to avoid duplicate resolution logic.
  - Added canonical subscription status utility in `lib/subscription-status.ts`:
    - normalized status aliases (`trial`, `trialing`, `paused`, etc.) into canonical values,
    - updated `server/billing.ts`, `server/subscription-manager.ts`, and `server/subscription.ts` to consume shared normalization and active-status checks.
  - Hardened rate limit behavior in `lib/rate-limit.ts`:
    - added `requireDistributedInProduction` option,
    - in strict mode, production now fails closed with `reason: limiter_unavailable` instead of silently degrading to memory-only limiter.
    - enabled strict distributed mode for sensitive routes under `app/api/ai/**`, `app/api/admin/subscriptions/route.ts`, ingestion/sync routes (`etp`, `thor`, `rithmic`, `tradovate`, `ibkr/ocr`).
  - Replaced stale widget policy workflow with an executable sanity workflow:
    - `.github/workflows/widget-policy-compliance.yml` now runs schema JSON checks, manifest checks, and targeted widget-policy tests when present.
  - Added centralized locale contract and removed locale drift between middleware and client loaders:
    - new `locales/config.ts` defines `SUPPORTED_LOCALES` and `DEFAULT_LOCALE`.
    - updated `proxy.ts` to consume shared locale constants.
    - updated `locales/client.ts` to include all middleware locales (with explicit fallback to `en` where locale files are missing).
  - Reduced middleware blast radius by extracting route/cache classification logic into `lib/security/route-policy.ts` and wiring `proxy.ts` to the shared policy module.
  - Strengthened CI security/style governance by adding `check:route-security` and `check:color-contract` steps to `.github/workflows/ci.yml`.
- **Key Files:** `lib/identity-resolver.ts`, `server/auth.ts`, `server/trades.ts`, `server/team-membership.ts`, `lib/subscription-status.ts`, `server/billing.ts`, `server/subscription-manager.ts`, `server/subscription.ts`, `lib/rate-limit.ts`, `app/api/ai/**`, `app/api/admin/subscriptions/route.ts`, `app/api/etp/v1/store/route.ts`, `app/api/thor/store/route.ts`, `app/api/rithmic/synchronizations/route.ts`, `app/api/tradovate/sync/route.ts`, `app/api/imports/ibkr/ocr/route.ts`, `.github/workflows/widget-policy-compliance.yml`, `tasks/todo.md`, `AGENTS.md`.
- **Key Files (Additional):** `locales/config.ts`, `locales/client.ts`, `proxy.ts`, `lib/security/route-policy.ts`, `.github/workflows/ci.yml`, `server/payment-service.ts`.
- **Verification:** `npm run -s typecheck` attempted but blocked in this environment because project dependencies are not installed (`next: command not found`). Additional static checks executed successfully: `node scripts/check-route-security.mjs`, `node scripts/check-color-contract.mjs`, `node .github/scripts/check-manifests.js`.

### 2026-03-08: Consolidated Remediation Sweep (Logs + Typing + Memo + Hook Hygiene)
- **What changed:** Ran a single repo-wide remediation pass focused on safe mechanical hardening across runtime logs, straightforward typing cleanup, memoization, hook cleanup, and config safety.
- **What I want:** Quiet runtime surfaces (no `console.log` spam), better local type safety in touched utilities, lower avoidable re-renders on heavy calendar components, and stable verification gates.
- **What I don't want:** Behavior-changing refactors, risky schema/enum migrations, or non-actionable claims without typecheck/lint evidence.
- **How we fixed that:**
  - Removed remaining `console.log(...)` calls from touched runtime/debug paths and kept `console.warn/error`.
  - Replaced straightforward `any` usage with specific types in touched files (`BrowserPerformanceWithMemory`, `ManagedEventHandler`, typed window leak-tracking fields).
  - Added `React.memo` wrappers to expensive dashboard calendar components with stable prop surfaces (`weekly-calendar`, `mobile-calendar`).
  - Fixed obvious hook hygiene issues in touched files (effect cleanup ref snapshot pattern, dead state/import removal).
  - Added defensive logger serialization fallback + stdout writer path and capped `PG_POOL_MAX` with warning in Prisma config.
  - Audited `"use client"` in touched scope and kept directives where client APIs/hooks are still required (no safe removals).
- **Key Files:** `lib/logger.ts`, `lib/debug/performance-monitor.ts`, `lib/debug/event-tracker.ts`, `lib/debug/render-tracker.tsx`, `lib/performance/memory-leak-detector.ts`, `app/[locale]/dashboard/components/calendar/weekly-calendar.tsx`, `app/[locale]/dashboard/components/calendar/mobile-calendar.tsx`, `lib/prisma.ts`, `tasks/todo.md`, `AGENTS.md`.
- **Verification:** `npm run -s typecheck` exits `0`; `npm run -s lint -- --max-warnings=999999` exits `0` (warnings-only baseline, no errors).

### 2026-03-08: App Lag Audit (Runtime Bottleneck Analysis)
- **What changed:** Completed a full lag/slow-performance audit across dashboard runtime architecture, provider flows, render hot paths, and current quality/perf gates.
- **What I want:** Identify real runtime bottlenecks (re-render churn, duplicate fetch work, oversized client surfaces) instead of guessing from bundle size alone.
- **What I don't want:** Misdiagnosing lag as a bundle-budget issue when route payloads are already within budget.
- **How we fixed that:**
  - Ran verification gates: `npm run -s typecheck`, `npm run -s check:route-budgets`, `npm run -s analyze:bundle`, `npm run -s lint`.
  - Confirmed route payloads are within threshold while lint/runtime signals still indicate heavy UI complexity (`1513` warnings, many dashboard complexity/hook warnings).
  - Identified duplicate/overlapping dashboard data flows:
    - server fetch in `app/[locale]/dashboard/page.tsx`,
    - client fetch in `context/data-provider.tsx` mount effect,
    - additional trade fetch path in `context/trades-context.tsx` (including refresh path that calls trade API multiple times).
  - Identified rerender hotspots:
    - monolithic `context/data-provider.tsx` (`2070` lines),
    - broad context subscriptions for narrow fields (for example `useDashboardTrades()` for `isMobile` in widget wrappers),
    - low `React.memo` coverage in dashboard components.
  - Identified heavy UI surfaces (large component files and high map/filter/sort density) and widget-canvas animation/grid overhead.
- **Key Files:** `context/data-provider.tsx`, `context/trades-context.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/components/tables/trade-table-review.tsx`, `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`, `app/[locale]/dashboard/page.tsx`, `docs/audits/artifacts/bundle-summary.json`, `AGENTS.md`
- **Verification:**
  - `npm run -s typecheck` -> exits `0`.
  - `npm run -s check:route-budgets` -> all monitored routes within budget.
  - `npm run -s analyze:bundle` -> artifact updated at `docs/audits/artifacts/bundle-summary.json`.
  - `npm run -s lint` -> exits `0` with `1513` warnings (`0` errors).

### 2026-03-08: Runtime Lag Fix Pass (Duplicate Data Flow + Narrow Selectors)
- **What changed:** Removed duplicate dashboard provider/data flow layers, narrowed high-frequency context subscriptions, and converted behavior route shell to server-wrapper + client island.
- **What I want:** Reduce avoidable fetch/state churn and rerender fan-out in the dashboard shell so interactions feel faster under live trade/filter updates.
- **What I don't want:** Dashboard mounting multiple overlapping trade/account/filter providers or components subscribing to broad trade context when they only need tiny flags (`isMobile`, `isLoading`, `isSharedView`).
- **How we fixed that:**
  - Removed redundant provider stack from `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`:
    - deleted `TradesProvider`, `AccountsProvider`, and `FiltersProvider` wrappers.
    - dashboard tabs now consume the existing `DataProvider` from layout-level `DashboardProviders`.
  - Simplified `app/[locale]/dashboard/page.tsx`:
    - removed duplicate server prefetch pipeline for trades/accounts/groups/layout.
    - page now only resolves auth + tab and renders `DashboardTabShell`.
  - Added narrow selector hooks in `context/data-provider.tsx`:
    - `useDashboardIsMobile()`
    - `useDashboardIsLoading()`
    - `useDashboardIsSharedView()`
  - Migrated narrow consumers to selector hooks:
    - `app/[locale]/dashboard/components/add-widget-sheet.tsx`
    - `app/[locale]/dashboard/components/filters/filter-dropdown.tsx`
    - `app/[locale]/dashboard/components/filters/filter-command-menu.tsx`
    - `app/[locale]/dashboard/components/navbar.tsx`
    - `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`
    - `app/[locale]/dashboard/components/charts/equity-chart.tsx`
    - `app/[locale]/dashboard/components/widget-canvas.tsx` (wrapper-level mobile subscription)
  - Converted behavior route entry to server wrapper:
    - `app/[locale]/dashboard/behavior/page.tsx` now renders `page-client.tsx` only.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`, `app/[locale]/dashboard/page.tsx`, `context/data-provider.tsx`, `app/[locale]/dashboard/components/add-widget-sheet.tsx`, `app/[locale]/dashboard/components/filters/filter-dropdown.tsx`, `app/[locale]/dashboard/components/filters/filter-command-menu.tsx`, `app/[locale]/dashboard/components/navbar.tsx`, `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`, `app/[locale]/dashboard/components/charts/equity-chart.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/behavior/page.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run -s typecheck` -> fails on pre-existing unrelated `server/teams.ts` errors.
  - `npm run -s build` -> compiles, then fails at page-data stage with missing `.next/server/pages-manifest.json` in this environment.

### 2026-03-08: Runtime Lag Micro-Optimization (WidgetCanvas Subscription Narrowing)
- **What changed:** Narrowed `WidgetCanvas` Zustand subscriptions so it no longer subscribes to the entire user store object.
- **What I want:** Keep widget-grid rerenders scoped to fields that actually affect layout rendering.
- **What I don't want:** `useUserStore(state => state)` broad subscriptions causing `WidgetCanvas` rerenders whenever unrelated user-store fields change.
- **How we fixed that:**
  - Replaced broad store subscription with field selectors in `widget-canvas.tsx`:
    - `isMobile`
    - `dashboardLayout`
    - `setDashboardLayout`
  - Kept existing widget-grid logic unchanged; only subscription surface was narrowed.
- **Key Files:** `app/[locale]/dashboard/components/widget-canvas.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `npx eslint app/[locale]/dashboard/components/widget-canvas.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.
  - `npm run -s build` -> fails on pre-existing Prisma schema issue (`@@schema` missing on enums in `prisma/schema.prisma`), unrelated to touched files.

### 2026-03-08: Runtime Lag Sweep (Remaining Broad Subscriptions)
- **What changed:** Completed a sweep to remove remaining broad dashboard-trades subscriptions from dashboard components and validated memoization status on heavy surfaces.
- **What I want:** Avoid broad dashboard state subscriptions in UI surfaces that only need small slices, to reduce avoidable rerender fan-out under live updates.
- **What I don't want:** Debug/UI support components subscribing to `useDashboardTrades()` and rerendering for unrelated account/trade/state changes.
- **How we fixed that:**
  - Eliminated remaining `useDashboardTrades()` usage from dashboard components.
  - `app/[locale]/dashboard/components/data-debug.tsx` now consumes granular hooks:
    - `useDashboardTradeItems()`
    - `useDashboardAccountsList()`
    - `useDashboardIsLoading()`
  - Confirmed heavy dashboard surfaces remain memoized:
    - `AccountsOverview` exported via `memo(AccountsOverviewComponent)`
    - `TradeTableReview` exported via `React.memo(TradeTableReviewComponent)`
- **Key Files:** `app/[locale]/dashboard/components/data-debug.tsx`, `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`, `app/[locale]/dashboard/components/tables/trade-table-review.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `rg -n "useDashboardTrades\(" app/[locale]/dashboard/components --glob "*.tsx"` -> no matches.
  - `npx eslint app/[locale]/dashboard/components/data-debug.tsx app/[locale]/dashboard/components/accounts/accounts-overview.tsx app/[locale]/dashboard/components/tables/trade-table-review.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> fails on pre-existing unrelated backend typing drift in currently modified workspace files (`server/subscription-manager.ts`, `server/subscription.ts`, `server/shared.ts`, billing/admin subscription status typing).

### 2026-03-08: Trader Profile Lag Closure (Server Wrapper + Narrow Selectors)
- **What changed:** Finalized dashboard lag cleanup by removing the remaining broad trade-context usage in trader-profile and converting trader-profile route entry to server-wrapper + client island.
- **What I want:** Eliminate avoidable rerender fan-out from broad context reads and keep dashboard route entries server-oriented unless they own client state.
- **What I don't want:** `useDashboardTrades()` broad subscriptions for simple flags/data and large client route entry files when a server wrapper is sufficient.
- **How we fixed that:**
  - Updated trader-profile client page to use narrow selectors:
    - `useDashboardAccountsList()`
    - `useDashboardIsLoading()`
    - preserved `useDashboardStats()` for formatted trades.
  - Replaced `app/[locale]/dashboard/trader-profile/page.tsx` with a minimal server wrapper that renders `page-client.tsx`.
  - Re-verified dashboard grep for `useDashboardTrades(` now returns no matches under dashboard route files.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `app/[locale]/dashboard/trader-profile/page-client.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `npx eslint app/[locale]/dashboard/trader-profile/page.tsx app/[locale]/dashboard/trader-profile/page-client.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.

### 2026-03-08: Lag Root-Cause Closure Verification
- **What changed:** Performed a final closure pass to verify the lag root-cause fixes are fully applied across dashboard route files.
- **What I want:** Ensure there are no remaining broad dashboard trade-context subscriptions and route shells remain server-oriented with client islands.
- **What I don't want:** Hidden regressions where broad hooks (`useDashboardTrades`) reappear or route entries regress into unnecessary client-heavy shells.
- **How we fixed that:**
  - Re-verified `useDashboardTrades(` has zero callsites under `app/[locale]/dashboard/**/*.tsx`.
  - Re-confirmed server-wrapper route entries:
    - `app/[locale]/dashboard/page.tsx`
    - `app/[locale]/dashboard/behavior/page.tsx`
    - `app/[locale]/dashboard/trader-profile/page.tsx`
  - Re-ran typecheck as final guard.
- **Key Files:** `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/behavior/page.tsx`, `app/[locale]/dashboard/trader-profile/page.tsx`, `app/[locale]/dashboard/trader-profile/page-client.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - Grep check for `useDashboardTrades(` under dashboard files returns no matches.
  - `npm run -s typecheck` -> exits `0`.

### 2026-03-08: Provider Migration Verification Closure
- **What changed:** Closed the remaining pending verification step for provider import migration after lag sweep work.
- **What I want:** Confirm dashboard hook/provider import updates are still type-safe and lint-clean at error level.
- **What I don't want:** Leaving migration tasks open without rerunning guard checks.
- **How we fixed that:**
  - Re-ran `npm run -s typecheck`.
  - Re-ran dashboard scoped lint pass (`npx eslint app/[locale]/dashboard/components --max-warnings=999999`).
- **Key Files:** `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `npm run -s typecheck` -> exits `0`.
  - Dashboard eslint pass -> `0` errors (warnings-only baseline).

### 2026-03-08: Navigation Stall Recovery (Chunk Error Auto-Reload + Immediate SW Cleanup)
- **What changed:** Added client-side recovery for stale chunk/module-load navigation failures and tightened service-worker cleanup timing.
- **What I want:** If route clicks fail due to stale cached chunks, the app should self-recover without requiring the user to manually hard refresh.
- **What I don't want:** "Click does nothing until hard reset" behavior caused by outdated `_next` assets or delayed service-worker cleanup.
- **How we fixed that:**
  - Updated `components/providers/root-providers.tsx` with global production-only listeners for:
    - `unhandledrejection`
    - `error`
  - Added chunk-failure detection for common signatures:
    - `ChunkLoadError`
    - `Loading chunk`
    - `Failed to fetch dynamically imported module`
    - `Importing a module script failed`
  - Added one-time session guard (`sessionStorage`) to prevent reload loops and trigger a single automatic reload on first detected chunk failure.
  - Service-worker unregister/cache-clear now runs immediately on mount (and still keeps load-event fallback).
- **Key Files:** `components/providers/root-providers.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `npx eslint components/providers/root-providers.tsx` -> 0 errors.
  - `npm run -s typecheck` -> exits `0`.

### 2026-03-08: Smooth Navigation UX (Immediate Sidebar Click Feedback)
- **What changed:** Added immediate per-link pending feedback in sidebar navigation and a client-to-hard-navigation fallback for stalled transitions.
- **What I want:** Users should always get instant visual confirmation when they click a sidebar link, even if route transition takes a moment.
- **What I don't want:** “Did my click work?” uncertainty when navigation is in-flight and the active route hasn’t switched yet.
- **How we fixed that:**
  - Updated `components/ui/unified-sidebar.tsx` to track clicked destination href as `pendingHref`.
  - Sidebar now shows a loading spinner for the clicked item while it is pending and not yet active.
  - Pending state naturally clears when the destination becomes active (no effect-driven reset required).
  - Added an 8s stall fallback that upgrades stuck client-side transitions to `window.location.assign(...)` for the clicked href.
- **Key Files:** `components/ui/unified-sidebar.tsx`, `tasks/todo.md`, `AGENTS.md`
- **Verification:**
  - `npx eslint components/ui/unified-sidebar.tsx` -> 0 errors (warnings only).
  - `npm run -s typecheck` -> exits `0`.

### 2026-03-07: Client/Server Render Boundary Cleanup
- **What changed:** Reworked provider ownership, shared-page bootstrapping, home-page SSR, and dashboard scroll reset so route shells stop doing unnecessary client work.
- **What I want:** Public/home/shared routes should retain meaningful server-rendered HTML, shared pages should use the server fetch as the first render source, and dashboard route shells should stay server-oriented unless they genuinely own client state.
- **What I don't want:** Pathname-based provider branching in a global client wrapper, duplicate shared-data fetches after SSR, `ssr: false` marketing sections gutting home-page HTML, or route entrypoints becoming client pages only to call `window.scrollTo`.
- **How we fixed that:**
  - Reduced `app/[locale]/layout.tsx` to locale wiring only.
  - Split provider responsibilities in `components/providers/root-providers.tsx` into structural route stacks (`RootProviders`, `PublicRootProviders`, `SidebarRootProviders`) and removed `usePathname()` branching.
  - Moved shared-route `DataProvider` ownership into `app/[locale]/shared/[slug]/page.tsx` and added `initialSharedData` / `initialSharedSlug` bootstrapping in `context/data-provider.tsx` so shared pages skip the initial duplicate fetch.
  - Removed shared-page hydration boot logic from `app/[locale]/shared/[slug]/shared-page-client.tsx`.
  - Replaced the client-only deferred home-section gate with direct section rendering in `app/[locale]/(home)/components/DeferredHomeSections.tsx`.
  - Centralized dashboard scroll reset in `app/[locale]/dashboard/components/dashboard-scroll-reset.tsx` and removed route-level scroll effects from dashboard page entrypoints.
- **Key Files:** `app/[locale]/layout.tsx`, `components/providers/root-providers.tsx`, `context/data-provider.tsx`, `app/[locale]/shared/[slug]/page.tsx`, `app/[locale]/shared/[slug]/shared-page-client.tsx`, `app/[locale]/(home)/components/DeferredHomeSections.tsx`, `app/[locale]/dashboard/layout.tsx`
- **Verification:**
  - Source checks confirm `RootProviders` no longer uses `usePathname()`.
  - Source checks confirm `DeferredHomeSections` no longer uses `ssr: false` or intersection-only rendering.
  - Source checks confirm shared pages now have a bootstrapped `initialSharedData` path and skip the initial duplicate `loadData()` call when server data exists.
  - Runtime verification is still pending in this workspace because dependencies are not installed (`next: command not found`).

### 2026-02-27: Non-Dashboard Spacing Balance Alignment (Landing/Teams Only)
- **What changed:** Applied a balanced container width policy for public non-dashboard routes while explicitly keeping dashboard spacing untouched.
- **What I want:** `/en` public pages (for example `/en/propfirms`, `/en/teams`, `/en/pricing`, `/en/support`) should have consistent, premium side spacing similar to the home-page visual rhythm.
- **What I don't want:** Dashboard layout spacing changes when the user requests public-page spacing only.
- **How we fixed that:**
  - Kept dashboard shell defaults unchanged.
  - Applied `widthClassName="max-w-[1280px]"` to landing/teams pages using `UnifiedPageShell`.
  - Constrained `/app/[locale]/(landing)/propfirms/page.tsx` outer container to `max-w-[1280px]` for consistent side gaps.
  - Preserved existing page content and behavior; only adjusted outer container width.
- **Key Files:** `app/[locale]/(landing)/about/page.tsx`, `app/[locale]/(landing)/community/page.tsx`, `app/[locale]/(landing)/disclaimers/page.tsx`, `app/[locale]/(landing)/faq/page.tsx`, `app/[locale]/(landing)/_updates/page.tsx`, `app/[locale]/(landing)/privacy/page.tsx`, `app/[locale]/(landing)/support/page.tsx`, `app/[locale]/(landing)/terms/terms-page-client.tsx`, `app/[locale]/(landing)/pricing/pricing-page-client.tsx`, `app/[locale]/(landing)/propfirms/page.tsx`, `app/[locale]/teams/(landing)/page.tsx`, `AGENTS.md`
- **Verification:**
  - `rg -n "<UnifiedPageShell" app/[locale]/(landing) app/[locale]/teams/(landing)` confirms targeted pages now use `max-w-[1280px]`.
  - `npx eslint <touched landing files>` exits with warnings only (`0` errors).

### 2026-02-22: Dashboard Hard-Reload Cache Fix (SW Gating + No-Store + Prefetch Control)
- **What changed:** Fixed dashboard route stale-update behavior that required hard reloads by tightening service-worker lifecycle, dashboard cache headers, and sidebar navigation fetch behavior.
- **What I want:** Dashboard routes (especially `/en/dashboard/strategies`) should reflect updates on standard refresh/navigation without forcing hard reload.
- **What I don't want:** Persistent stale dashboard shell state from old service-worker control, implicit browser document caching, or confusing repeated route prefetch requests in logs.
- **How we fixed that:**
  - Added service-worker kill switch in `components/providers/root-providers.tsx`:
    - register SW only when `NEXT_PUBLIC_SW_ENABLED === "true"`,
    - otherwise unregister existing service workers and clear `quntedge-static-*` caches on load.
  - Added cache-debug lifecycle logging (`[CacheDebug]`) for:
    - SW registration,
    - SW controller changes,
    - sidebar route clicks (when `NEXT_PUBLIC_CACHE_DEBUG === "true"`).
  - Hardened middleware cache policy in `proxy.ts` for dashboard/auth routes:
    - `Cache-Control: no-store, max-age=0, must-revalidate`,
    - `Pragma: no-cache`,
    - `Expires: 0`.
  - Updated sidebar route links in `components/ui/unified-sidebar.tsx`:
    - set `prefetch={false}` to stop aggressive route prefetch churn.
  - Updated `public/sw.js` strategy:
    - bumped cache namespace to `quntedge-static-v2`,
    - excluded HTML/document navigation requests from SW caching,
    - kept static asset caching with background revalidation.
- **Key Files:** `components/providers/root-providers.tsx`, `components/ui/unified-sidebar.tsx`, `proxy.ts`, `public/sw.js`, `docs/audits/performance-initiative-2026-02-21.md`, `docs/PERFORMANCE_BUDGETS.md`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0`.
  - `npm run check:route-budgets` -> exits `0`.
  - `npm run analyze:bundle` -> exits `0`.

### 2026-02-21: Dashboard Overlay Lazy-Loading + Performance Artifact Refresh
- **What changed:** Moved dashboard overlay modules behind a client-only lazy wrapper and refreshed bundle/Lighthouse artifacts with explicit before/after route-manifest deltas.
- **What I want:** Keep dashboard routes responsive by loading critical shell first and deferring non-critical overlay UI.
- **What I don't want:** Always-on dashboard overlays increasing initial hydration payload and degrading route responsiveness.
- **How we fixed that:**
  - Added `DashboardClientOverlays` wrapper with dynamic client-only imports for:
    - `Modals`
    - `RithmicSyncNotifications`
  - Updated dashboard layout to consume the wrapper instead of direct eager imports.
  - Regenerated and documented performance artifacts:
    - `docs/audits/artifacts/bundle-summary.json`
    - Lighthouse HTML artifacts for `/en` and `/en/updates`
  - Added documented performance budgets in `docs/PERFORMANCE_BUDGETS.md`.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-client-overlays.tsx`, `app/[locale]/dashboard/layout.tsx`, `docs/audits/artifacts/bundle-summary.json`, `docs/audits/performance-initiative-2026-02-21.md`, `docs/PERFORMANCE_BUDGETS.md`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0`.
  - `npm run check:route-budgets` -> exits `0`.
  - `npm run analyze:bundle` -> exits `0`.
  - Dashboard app-route client manifests reduced by ~`2.5 KB` per route (`~5%`) from prior artifact snapshot.

### 2026-02-22: Dashboard Lag Refactor (State Slice Isolation + Table Virtualization)
- **What changed:** Refactored dashboard data consumption into focused context slices, added selector hooks, migrated high-churn dashboard consumers off umbrella `useData()`, and introduced virtualized row rendering in trade table.
- **What I want:** Dashboard interactions (tab switch, filter typing, table scroll) should avoid broad rerender cascades and stay responsive under larger trade sets.
- **What I don't want:** Monolithic `useData()` subscriptions in high-frequency UI surfaces, or full table row rendering on every scroll/update.
- **How we fixed that:**
  - Added internal contexts in `context/data-provider.tsx`:
    - `DashboardDataStateContext`
    - `DashboardFiltersContext`
    - `DashboardDerivedContext`
    - `DashboardActionsContext`
  - Added hooks:
    - `useDashboardTrades()`
    - `useDashboardFilters()`
    - `useDashboardStats()`
    - `useDashboardActions()`
  - Preserved `useData()` as a compatibility facade.
  - Migrated scoped high-churn consumers:
    - `app/[locale]/dashboard/components/filters/*`
    - `app/[locale]/dashboard/components/statistics/*`
    - `app/[locale]/dashboard/components/tables/*`
  - Added trade table render optimizations in `trade-table-review.tsx`:
    - `useDeferredValue` for trade input stream,
    - row-window virtualization for `>100` rows with spacer rows,
    - requestAnimationFrame-throttled scroll state updates.
- **Key Files:** `context/data-provider.tsx`, `app/[locale]/dashboard/components/filters/*`, `app/[locale]/dashboard/components/statistics/*`, `app/[locale]/dashboard/components/tables/trade-table-review.tsx`, `docs/audits/performance-initiative-2026-02-21.md`, `docs/PERFORMANCE_BUDGETS.md`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0`.
  - `npm run analyze:bundle` -> exits `0`.
  - `npm run check:route-budgets` -> exits `0`.
  - Scoped usage migration result:
    - `useData()` in `filters+statistics+tables`: `32 -> 0`.
    - Slice-hook calls in `filters+statistics+tables`: `0 -> 39`.
  - Lighthouse was blocked in this environment (`npx lighthouse` requires npm registry access; offline error `ENOTFOUND registry.npmjs.org`).

### 2026-02-21: Production Readiness Audit Hardening (Observability + Build Reliability + Security Consistency)
- **What changed:** Hardened logging/monitoring primitives, standardized cron authorization checks, fixed failing performance audit tooling, restored smoke-test script coverage, and stabilized production build behavior.
- **What I want:** Reliable, production-grade diagnostics and repeatable verification gates with consistent auth enforcement and deterministic build outcomes.
- **What I don't want:** Leaky logs in non-production, inconsistent cron auth implementations, flaky production builds from Turbopack manifest races, or broken audit scripts that hide real bottlenecks.
- **How we fixed that:**
  - Upgraded logger infrastructure in `lib/logger.ts`:
    - async context propagation via request/correlation IDs,
    - redaction applied consistently in both development and production output,
    - centralized in-process error-threshold alerting (`ERROR_ALERT_THRESHOLD`, `ERROR_ALERT_WINDOW_MS`).
  - Standardized cron auth in high-risk routes:
    - replaced ad-hoc bearer comparisons with `requireServiceAuth(...)` in:
      - `app/api/cron/investing/route.ts`,
      - `app/api/cron/compute-trade-data/route.ts`.
  - Reduced sensitive data exposure in onboarding webhook:
    - removed raw payload logging and switched to structured, low-sensitivity event logging in `app/api/email/welcome/route.ts`.
  - Added health monitoring thresholds in `app/api/health/route.ts`:
    - DB latency threshold alerts (`DB_LATENCY_ALERT_MS`),
    - memory snapshot in response payload,
    - structured degraded/down signaling.
  - Fixed broken audit and verification tooling:
    - repaired `scripts/performance-audit.mjs` command output handling and terminal color output,
    - created missing `scripts/smoke-http.mjs` used by `npm run test:smoke`.
  - Stabilized build pipeline:
    - switched build command to webpack backend in `package.json` (`next build --webpack`) to avoid intermittent Turbopack manifest ENOENT failures during page-data collection.
  - Quality cleanup for previously lint-blocking performance helpers:
    - fixed rule-breaking patterns in:
      - `lib/performance/code-splitting.tsx`,
      - `lib/performance/optimized-components.tsx`.
  - Added regression coverage:
    - new `tests/logger.test.ts` validates redaction and request/correlation context injection.
- **Key Files:** `lib/logger.ts`, `app/api/cron/investing/route.ts`, `app/api/cron/compute-trade-data/route.ts`, `app/api/email/welcome/route.ts`, `app/api/health/route.ts`, `scripts/performance-audit.mjs`, `scripts/smoke-http.mjs`, `package.json`, `lib/performance/code-splitting.tsx`, `lib/performance/optimized-components.tsx`, `tests/logger.test.ts`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm test` -> exits `0` (`137 passed | 46 skipped`).
  - `npm run lint -- --max-warnings=999999` -> exits `0` (`0` errors, warnings remain).
  - `npm run build` -> exits `0` after webpack switch.
  - `npm run check:route-budgets` -> exits `0` (dashboard routes now under budget thresholds).
  - `npm run analyze:bundle` -> exits `0`.
  - `SMOKE_BASE_URL=http://127.0.0.1:3001 npm run test:smoke` -> all checks pass.

### 2026-02-20: Unified Next.js Optimization System (Config Conflict Fix + Safety + Verification)
- **What changed:** Replaced the split optimization setup with a single authoritative config path, fixed optimization build/type failures, expanded route/static/code-splitting strategy, and added verification tests/scripts.
- **What I want:** One stable optimization implementation for code splitting, images, fonts, static generation, caching, and monitoring that works consistently across local/dev/prod without config drift.
- **What I don't want:** Engineers swapping between `next.config.ts` and `next.config.optimized.ts`, invalid env values silently degrading builds, missing optional performance dependencies breaking builds, or hydration/caching regressions from optimization work.
- **How we fixed that:**
  - Added shared Next config builder in `lib/performance/next-config.ts` with:
    - env validation and safe fallback for `NEXT_BUILD_CPUS`,
    - robust URL validation for `NEXT_PUBLIC_CDN_URL` and Supabase image host extraction,
    - consolidated image optimization/security settings and cache headers.
  - Updated `next.config.ts` to consume shared builder and emit warning diagnostics.
  - Removed stale `next.config.optimized.ts` to eliminate source-of-truth drift.
  - Hardened optimization runtime helpers:
    - `components/performance/performance-observer.tsx` now safely handles missing Web Vitals runtime with non-fatal fallback;
    - added `types/web-vitals.d.ts` and `tsconfig.json` include update for declaration discovery;
    - improved URL/error safety in `lib/performance/image-optimization.ts`;
    - changed `lib/performance/isr-utils.ts` revalidation calls to fail-safe boolean behavior.
  - Added static and splitting improvements:
    - home route now explicitly static ISR (`app/[locale]/(home)/page.tsx`);
    - deferred home sections now use `next/dynamic` split points (`DeferredHomeSections.tsx`);
    - removed server cookie read from `app/[locale]/layout.tsx` and moved sidebar cookie sync to client-side mount logic in `components/ui/sidebar.tsx` to reduce dynamic forcing and hydration mismatch risk.
  - Added optimization verification coverage:
    - tests for config/env fallbacks, image URL safety, and ISR failure safety;
    - scripts: `check:route-budgets`, `analyze:bundle`, `perf:verify`.
- **Key Files:** `lib/performance/next-config.ts`, `next.config.ts`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/(home)/page.tsx`, `app/[locale]/(home)/components/DeferredHomeSections.tsx`, `components/ui/sidebar.tsx`, `components/performance/performance-observer.tsx`, `lib/performance/image-optimization.ts`, `lib/performance/isr-utils.ts`, `types/web-vitals.d.ts`, `tests/performance/next-config.test.ts`, `tests/performance/image-optimization.test.ts`, `tests/performance/isr-utils.test.ts`, `package.json`, `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> pending (to run after this change set).
  - `npm test -- tests/performance/*.test.ts` -> pending.
  - `npm run build` + `npm run check:route-budgets` + `npm run analyze:bundle` -> pending.

### 2026-02-17: Sidebar Redirect Stall Fix (Locale-Aware Dashboard Auth Redirect)
- **What changed:** Fixed dashboard layout unauthenticated redirect to use locale-aware authentication path with a safe `next` target.
- **What I want:** Unauthenticated users navigating dashboard routes should redirect once to the correct localized auth page, without mid-session redirect stalls/bounces.
- **What I don't want:** Non-localized `/authentication` redirects from localized dashboard layouts causing extra middleware redirect hops and stuck sidebar navigation behavior.
- **How we fixed that:**
  - Updated `app/[locale]/dashboard/layout.tsx` to consume route `params`.
  - Replaced hardcoded `redirect("/authentication")` with locale-safe redirect:
    - `redirect(\`/${locale}/authentication?next=/${locale}/dashboard\`)` (URL-encoded).
  - Kept fix scope minimal and did not alter dashboard data/auth logic beyond redirect target correctness.
- **Key Files:** `app/[locale]/dashboard/layout.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0`.
### 2026-02-17: Safe CSP Reintroduction (Report-Only + Nonce + Strict Toggle)
- **What changed:** Reintroduced CSP as a focused security follow-up on top of rollback state, using nonce-based script authorization with safe rollout controls (`report-only` by default, optional strict mode).
- **What I want:** Restore browser-side security hardening (XSS/script-injection defense) without reintroducing blank-page regressions from overly strict policy rollout.
- **What I don't want:** Another production white-screen caused by blocked Next.js runtime scripts, or a policy rollout that cannot be quickly relaxed during incident response.
- **How we fixed that:**
  - Added CSP helper module:
    - `lib/security/csp.ts` now provides:
      - `createNonce()`,
      - `buildAppCsp({ nonce, isDev, strictMode })`,
      - `buildEmbedCsp(allowedOrigins)`.
  - Updated middleware/proxy wiring in `proxy.ts`:
    - generates per-request nonce and sets `x-nonce`,
    - applies app CSP for non-embed routes through shared helper,
    - keeps embed route CSP separate,
    - supports env-driven rollout controls:
      - `CSP_ENABLED` (default on unless `false`),
      - `CSP_REPORT_ONLY` (default report-only unless explicitly `false`),
      - `CSP_STRICT_MODE` (default off unless `true`).
  - Updated root layout script nonce wiring in `app/layout.tsx`:
    - reads `x-nonce` from request headers (`next/headers`),
    - applies nonce to `beforeInteractive` theme bootstrap script.
  - Safe/default behavior:
    - report-only mode by default,
    - strict mode opt-in,
    - fallback path available by toggling env without code rollback.
- **Key Files:** `lib/security/csp.ts`, `proxy.ts`, `app/layout.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm test` -> exits `0` (`88 passed | 46 skipped`).
  - Build was not used as CSP correctness gate in this environment due known external font DNS fetch limitation (`fonts.googleapis.com`), unrelated to CSP wiring.

### 2026-02-17: Full Rollback of Optimization Wave (Preserve Security Hardening)
- **What changed:** Reverted the optimization/performance/UI wave from `0d76a1b..HEAD` back to pre-wave baseline behavior (`9ece39f`) using file-level restore, while explicitly preserving security/auth/RLS hardening files.
- **What I want:** Remove unstable optimization changes that contributed to production/runtime regressions (including blank-page risk), while keeping backend security posture improvements intact.
- **What I don't want:** Reintroduce insecure API/auth behavior, cron secret bypass risk, unsubscribe token weakness, or Supabase/RLS hardening regressions.
- **How we fixed that:**
  - Created rollback branch and checkpoint tag:
    - branch: `codex/revert-optimization-wave`
    - tag: `rollback-pre-opt-wave-20260217-0938`
  - Built rollback manifest from commit window `0d76a1b..HEAD` and restored non-security files to `9ece39f`.
  - Preserved security file set from protected commits (`649615e`, `a1b5dee`, `a8b57f9`, `22b5645`) and validated none of these files changed after rollback.
  - Removed optimization-era artifacts/scripts/routes introduced by the wave where absent in baseline:
    - perf/bundle artifact docs,
    - perf-quality workflow files,
    - optimization helper scripts.
  - Corrected baseline wiring break found during verification by restoring `app/[locale]/dashboard/page.tsx` to `9ece39f` behavior and keeping `scripts/ensure-next-type-stubs.mjs` for current `typecheck` script compatibility.
- **Key Files:** `next.config.ts`, `app/layout.tsx`, `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/ui/unified-sidebar.tsx`, `proxy.ts`, `server/authz.ts`, `app/api/_utils/validate.ts`, `lib/supabase.ts`, `lib/supabase/route-client.ts`, `lib/unsubscribe-token.ts`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm test` -> exits `0` (`88 passed | 46 skipped`).
  - `npm run build` -> fails in this environment due blocked DNS/network fetch to `fonts.googleapis.com` (`next/font` Google fetch), not due rollback compile wiring after page fix.
  - Security-preservation check confirms `0` drift in protected file allowlist after rollback application.

### 2026-02-17: Next.js Optimization Audit (Current Main Baseline)
- **What changed:** Ran a full optimization audit on current `main` using build, route-budget, bundle-summary, lint/typecheck, and configuration/middleware inspection.
- **What I want:** A verifiable baseline for launch-readiness decisions with clear P0/P1 blockers and measurable optimization priorities.
- **What I don't want:** Assumption-based “optimized” claims, silent production blank-page regressions, or bundle/cache checks that pass without reflecting real App Router risk.
- **How we fixed that:**
  - Verified quality gates and optimization scripts:
    - `npm run build` passes,
    - `npm run check:route-budgets` passes for current configured thresholds,
    - `node scripts/analyze-bundle.mjs` updates `docs/audits/artifacts/bundle-summary.json`.
  - Captured core optimization metrics:
    - `336` `"use client"` boundaries in `app` + `components`,
    - `0` raw `<img>` matches in `app` + `components`,
    - `0` `next/font` imports detected,
    - `47` API route handlers, but only `5` parse helper (`parseJson`/`parseQuery`) usages,
    - `10` `force-dynamic` route declarations.
  - Confirmed route-budget surface is app-route aware but still high-level:
    - top App Router client manifest routes are dashboard family (`~49–51KB`) and within current 80KB threshold,
    - bundle summary still reports `/_app` as only pages route with `0 KB`, which is expected for App Router-heavy apps but weak as a sole governance indicator.
  - Reconfirmed likely production blank-page risk area:
    - app-wide CSP uses nonce + `strict-dynamic` in `lib/security/csp.ts` and is applied in `proxy.ts`,
    - this remains a high-risk area for script loading regressions if nonce propagation is inconsistent in deployed environment.
  - Captured maintainability/perf debt signal from lint:
    - `1223` warnings (`0` errors), including React render/effect anti-pattern warnings in dashboard account components.
- **Key Files:** `next.config.ts`, `proxy.ts`, `lib/security/csp.ts`, `scripts/check-route-budgets.mjs`, `docs/audits/artifacts/bundle-summary.json`, `AGENTS.md`
- **Verification:**
  - `npm run build` -> exits `0`.
  - `npm run check:route-budgets` -> exits `0`.
  - `node scripts/analyze-bundle.mjs` -> exits `0`.
  - `npm run typecheck` -> exits `0`.
  - `npm run lint` -> exits `0` with `1223` warnings.

### 2026-02-16: Launch Optimization Pass (Preload + CDN + Image + Cache + Dashboard Read Path)
- **What changed:** Completed a targeted production optimization pass across Next.js delivery config, preload hints, dashboard rendering behavior, and backend read caching.
- **What I want:** Lower overhead on low-end devices, fewer unnecessary network prefetches, faster dashboard shell loads, and reduced repeated DB pressure on authenticated dashboard visits.
- **What I don't want:** Sidebar-triggered over-prefetching, expensive uncached dashboard layout reads on every request, weak image optimization defaults, or avoidable dynamic rendering overhead on dashboard tab routing.
- **How we fixed that:**
  - Hardened and tuned `next.config.ts` image pipeline:
    - added explicit `deviceSizes`/`imageSizes`/`qualities`,
    - kept modern formats (`avif`, `webp`) with long TTL,
    - added safer image hardening (`dangerouslyAllowSVG: false`, image CSP, `maximumRedirects: 0`).
  - Improved preload/connect setup in root layout:
    - added `preconnect` hints for primary origin and optional CDN/Supabase origins.
  - Reduced unnecessary navigation prefetch pressure:
    - disabled automatic prefetch for dense dashboard sidebar link list in `UnifiedSidebar`.
  - Reduced client-side auth/admin overhead:
    - removed client-side `checkAdminStatus()` fetch/effect in dashboard sidebar,
    - computed `isAdmin` server-side in dashboard layout and passed as prop.
  - Improved rendering/caching behavior:
    - removed redundant `force-dynamic` from dashboard tab page shell,
    - added `unstable_cache` for `getDashboardLayout(userId)` with tag invalidation (`dashboard-${userId}`), aligned with existing `updateTag` in layout save action.
- **Key Files:** `next.config.ts`, `app/layout.tsx`, `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/sidebar/dashboard-sidebar.tsx`, `components/ui/unified-sidebar.tsx`, `server/user-data.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint` on touched optimization files -> `0` errors.
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0` with full route generation.
  - `npm run check:route-budgets` -> all thresholds pass.
  - `node scripts/analyze-bundle.mjs` -> bundle artifact updated at `docs/audits/artifacts/bundle-summary.json`.

### 2026-02-16: Unified Widget Tightness Pass (Gap + Legend Alignment + Overflow Fit)
- **What changed:** Removed fixed chart min-height forcing and unified chart fill/spacing behavior so widgets render tighter without dead bottom space; aligned donut legends and tightened stats overflow behavior.
- **What I want:** All chart widgets should keep a consistent tight vertical composition, with legend alignment matching across donut widgets and no clipped/overflowing rows in statistics blocks.
- **What I don't want:** Persistent blank bottom bands under charts, mismatched donut legend alignment between widgets, or trade-distribution/streak rows spilling outside the card body.
- **How we fixed that:**
  - Removed per-widget `ResponsiveContainer minHeight={180}` overrides across chart widgets.
  - Updated shared chart shell behavior:
    - `ChartSurface` body now uses `flex flex-col`,
    - global Recharts sizing in `app/globals.css` now enforces `height: 100%`/`min-height: 0` through widget shell + chart body selectors (instead of fixed min-height).
  - Unified chart margin baseline to tighter bottom spacing (`bottom: 8`) for targeted chart widgets.
  - Aligned donut legends (`trade-distribution`, `commissions-pnl`) to matching compact stacked layout with consistent spacing.
  - Reduced overflow pressure in `statistics-widget` by tightening typography/spacing and limiting streak row density for non-large sizes.
- **Key Files:** `app/globals.css`, `components/ui/chart-surface.tsx`, `app/[locale]/dashboard/components/charts/*.tsx`, `app/[locale]/dashboard/components/statistics/statistics-widget.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - Manual check on `/dashboard?tab=widgets`:
    - chart bottom gap is tighter/unified,
    - donut legend alignment is consistent,
    - statistics distribution rows no longer overflow container bounds.

### 2026-02-16: Complete RLS Policy Coverage Across All Public Tables
- **What changed:** Added explicit RLS policy definitions so every table in `public` now has authenticated-role policy coverage (including explicit deny policies for system-only tables).
- **What I want:** No table should rely on implicit deny behavior for `authenticated`/`anon`; policy posture should be explicit, auditable, and consistent across the full schema.
- **What I don't want:** Any `public` table with only a `service_role` policy and no explicit authenticated-role policy definition.
- **How we fixed that:**
  - Identified remaining tables without `authenticated` policies:
    - `FinancialEvent`, `HistoricalData`, `Newsletter`, `Organization`, `ProcessedWebhook`, `Promotion`, `SubscriptionFeedback`, `TickDetails`, `_UserOrganizations`, `_prisma_migrations`.
  - Added explicit deny-all policies on each:
    - `authenticated_no_access` (`to authenticated`, `using false`, `with check false`)
    - `anon_no_access` (`to anon`, `using false`, `with check false`)
  - Kept `service_role_all` policies for backend/system operations.
- **Key Files:** `AGENTS.md` (DB changes applied directly via Supabase migration)
- **Verification:**
  - Query for tables missing authenticated policy returns `0` rows.
  - Policy inspection confirms every former system-only table now has:
    - `authenticated_no_access`,
    - `anon_no_access`,
    - `service_role_all`.
  - Supabase security advisor remains clean except one auth setting warning:
    - leaked password protection disabled.

### 2026-02-16: Bank-Grade Security Hardening Pass (API + Supabase RLS + Access Controls)
- **What changed:** Executed a comprehensive security hardening pass across backend API surfaces and Supabase data access controls with defense-in-depth defaults.
- **What I want:** User data and operational endpoints should be protected by strict authentication, signed action links, fail-closed secrets, and enforced least-privilege access at the database layer.
- **What I don't want:** Unauthenticated mutation endpoints, fail-open secret checks, public unsubscribe abuse, indirect ownership tables missing user-scoped policies, or DB table-owner RLS bypass paths.
- **How we fixed that:**
  - Hardened high-risk API routes:
    - `app/api/email/format-name/route.ts`: now requires internal bearer authorization (`CRON_SECRET`) for both `GET` and `POST`.
    - `app/api/email/unsubscribe/route.ts`: replaced email-only unsubscribe with signed-token validation.
    - `app/api/email/weekly-summary/[userid]/route.ts`: fail-closed cron secret check + removed stack trace exposure in API responses.
    - `app/api/email/welcome/route.ts`: webhook auth now fails closed when secret missing.
    - `app/api/cron/route.ts`, `app/api/cron/renewal-notice/route.ts`, `app/api/cron/renew-tradovate-token/route.ts`: explicit `CRON_SECRET` presence checks to prevent `Bearer undefined` bypass conditions.
  - Added signed unsubscribe utility:
    - `lib/unsubscribe-token.ts` provides HMAC-based token issuance/verification (expiry + constant-time signature comparison).
    - Updated email send paths to include signed unsubscribe URLs in headers.
  - Hardened privileged team stats server actions:
    - `app/[locale]/teams/actions/stats.ts` now gates global/service-role analytics actions with `assertAdminAccess()` for admin-only execution.
  - Strengthened Supabase DB posture:
    - ensured RLS is enabled and **forced** (`FORCE ROW LEVEL SECURITY`) on all `public` tables,
    - expanded authenticated user-scope policies to indirect ownership tables (`BusinessInvitation`, `BusinessManager`, `LayoutVersion`, `Payout`, `TeamAnalytics`, `TeamInvitation`, `TeamManager`, `TradeAnalytics`),
    - revoked `anon`/`authenticated` grants from system/non-user tables (`FinancialEvent`, `HistoricalData`, `Newsletter`, `Organization`, `ProcessedWebhook`, `Promotion`, `SubscriptionFeedback`, `TickDetails`, `_UserOrganizations`, `_prisma_migrations`).
- **Key Files:** `app/api/email/format-name/route.ts`, `app/api/email/unsubscribe/route.ts`, `app/api/email/welcome/route.ts`, `app/api/email/weekly-summary/[userid]/route.ts`, `app/api/cron/route.ts`, `app/api/cron/renewal-notice/route.ts`, `app/api/cron/renew-tradovate-token/route.ts`, `app/[locale]/teams/actions/stats.ts`, `lib/unsubscribe-token.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint` on touched files -> warnings-only, no errors.
  - `npm run typecheck` -> exits `0`.
  - Supabase checks:
    - all `public` tables report `rls_enabled=true` and `rls_forced=true`,
    - targeted system tables show no remaining `anon`/`authenticated` grants,
    - security advisor reduced to one platform setting warning only:
      - leaked password protection disabled.

### 2026-02-16: Full Database Audit (User-Specific Access Coverage)
- **What changed:** Performed a full Supabase database audit across all `public` tables and upgraded user-specific RLS coverage wherever ownership could be derived directly or through parent relations.
- **What I want:** Every table that can be tied to an authenticated user should enforce user-scoped access under RLS, including relation-only tables that do not store `userId` directly.
- **What I don't want:** RLS enabled but practically service-role-only access on tables that are still user-owned through parent links (`teamId`, `businessId`, `layoutId`, `accountId`, `tradeId`).
- **How we fixed that:**
  - Audited:
    - table-level RLS status,
    - full policy inventory (`pg_policies`),
    - direct ownership columns (`userId`, `auth_user_id`),
    - FK graph to detect derivable ownership paths.
  - Added authenticated user-scoped policies for indirect ownership tables:
    - `BusinessInvitation` via `Business.userId`,
    - `BusinessManager` via `Business.userId`,
    - `LayoutVersion` via `DashboardLayout.userId`,
    - `Payout` via `Account.userId`,
    - `TeamAnalytics` via `Team.userId`,
    - `TeamInvitation` via `Team.userId`,
    - `TeamManager` via `Team.userId`,
    - `TradeAnalytics` via `Trade.userId`.
  - Kept `service_role_all` policies for backend/system workflows.
  - Re-validated security advisor and policy inventory after migration.
- **Key Files:** `AGENTS.md` (database changes applied via Supabase migrations)
- **Verification:**
  - All `public` tables now have `rowsecurity = true`.
  - Authenticated-scope policy coverage expanded to all user-derivable tables listed above.
  - Remaining tables without authenticated policies are system/global by design (`FinancialEvent`, `HistoricalData`, `Newsletter`, `Organization`, `ProcessedWebhook`, `Promotion`, `SubscriptionFeedback`, `TickDetails`, `_UserOrganizations`, `_prisma_migrations`).
  - Supabase security advisor now reports only one auth setting warning:
    - leaked password protection disabled.

### 2026-02-16: Supabase Hardening Pass (RLS Baseline + Client Env Fail-Closed)
- **What changed:** Completed a Supabase-focused hardening pass across project security posture and app-side Supabase client configuration.
- **What I want:** Public API exposure through PostgREST should be guarded by RLS/policies by default, and Supabase clients should fail closed in production when required env is missing.
- **What I don't want:** Public tables reachable without RLS, sensitive columns exposed through Supabase API, or production silently using fallback/dummy Supabase client credentials.
- **How we fixed that:**
  - Applied Supabase migrations to enforce baseline RLS:
    - enabled RLS on exposed `public` tables,
    - added `service_role` full-access policy (`service_role_all`) for backend/admin operations,
    - added authenticated owner policy (`authenticated_owner`) for tables with `userId`,
    - added authenticated owner policy for `public."User"` using `auth_user_id`,
    - optimized policy expressions to use `(select auth.uid())` to resolve `auth_rls_initplan` warnings.
  - Added FK coverage indexes flagged by Supabase advisor:
    - `Account_userId_idx`,
    - `Payout_accountId_idx`,
    - `Trade_accountNumber_userId_idx`.
  - Hardened app-side Supabase client env behavior:
    - `lib/supabase/route-client.ts` now throws in production if Supabase env vars are missing (non-production still allows local test fallback),
    - `lib/supabase.ts` now throws in production if Supabase public env vars are missing instead of constructing empty-client config.
  - Re-ran Supabase advisors after migration to confirm security posture shift.
- **Key Files:** `lib/supabase/route-client.ts`, `lib/supabase.ts`, `AGENTS.md`
- **Verification:**
  - Supabase advisor (`security`) now reports only one remaining warning:
    - leaked password protection disabled (`auth_leaked_password_protection`).
  - Supabase advisor (`performance`) no longer reports:
    - unindexed FK warnings for `Account_userId_fkey`, `Payout_accountId_fkey`, `Trade_accountNumber_userId_fkey`,
    - `auth_rls_initplan` warnings for owner policies.
  - `npx eslint lib/supabase.ts lib/supabase/route-client.ts` exits `0`.
  - `npm run typecheck` exits `0`.

### 2026-02-16: Backend Audit (Auth Surface + Public Endpoint Abuse Risks)
- **What changed:** Completed a backend-focused audit pass across API routes, server actions, and backend utility modules; validated findings with lint/typecheck/test/build quality gates.
- **What I want:** Sensitive backend routes should require explicit authorization, cron handlers should fail closed when secrets are missing, and error responses should not leak internal stack traces.
- **What I don't want:** Public callers being able to trigger privileged newsletter/AI operations, silent auth bypass under env misconfiguration, or production responses exposing internals.
- **How we fixed that:**
  - Audit-only pass in this task (no functional code changes applied yet).
  - Confirmed high-risk unauthenticated mutation/read endpoint in `app/api/email/format-name/route.ts` (database reads/writes + AI invocation + result disclosure without auth checks).
  - Confirmed insecure unsubscribe flow in `app/api/email/unsubscribe/route.ts` (email-only query parameter allows third-party unsubscribe requests).
  - Confirmed cron auth guard weakness in routes that compare directly against ``Bearer ${process.env.CRON_SECRET}`` without first validating secret presence.
  - Confirmed stack trace disclosure in weekly summary API error payload.
  - Captured backend quality-gate status for prioritization.
- **Key Files:** `app/api/email/format-name/route.ts`, `app/api/email/unsubscribe/route.ts`, `app/api/cron/route.ts`, `app/api/cron/renewal-notice/route.ts`, `app/api/cron/renew-tradovate-token/route.ts`, `app/api/email/weekly-summary/[userid]/route.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint server app/api lib --max-warnings=999999` -> exits `0` (`287` warnings, `0` errors).
  - `npm run typecheck` -> exits `0`.
  - `npm test` -> exits `0` (`101 passed | 46 skipped`).
  - `npm run build` -> exits `0` with full route generation.

### 2026-02-15: Widget Blank-State Root Cause Fix (IndexedDB Trade Cache Normalization)
- **What changed:** Fixed a data-shape regression where dashboard charts could render blank despite visible trade counts due to stale cached trade payloads entering state without normalization.
- **What I want:** Widgets should always receive normalized numeric/date trade fields, whether trades come from live fetches or IndexedDB cache.
- **What I don't want:** Cached trade objects with legacy/invalid numeric shapes causing `NaN` propagation (for example `Average Loss = -$NaN`) and blank Recharts render paths.
- **How we fixed that:**
  - Updated `DataProvider` cache-read paths in `context/data-provider.tsx` to normalize cached trades via `normalizeTradesForClient(...)` before `setTrades(...)`.
  - Applied this in both:
    - initial load path (`loadData` local cache branch),
    - dev refresh path (`refreshTradesOnly` IndexedDB shortcut branch).
  - This ensures stale cache payloads cannot bypass numeric/date sanitization.
- **Key Files:** `context/data-provider.tsx`, `AGENTS.md`
- **Verification:** 
  - Open `/dashboard?tab=widgets` with existing cached data and confirm widgets render instead of blank cards.
  - Confirm Trading Statistics no longer shows `-$NaN` for average loss.

### 2026-02-15: Widget Chart Visibility Fix (Collapsed `ChartSurface` Body Regression)
- **What changed:** Fixed a dashboard widget rendering regression where chart widgets appeared blank even when trade data existed.
- **What I want:** Widget charts should consistently render their chart area when data is available, regardless of whether the widget provides a custom internal header or uses `ChartSurface` header props.
- **What I don't want:** Global shell CSS to force chart bodies to a fixed header height and accidentally collapse chart render space, making widgets look like data failed to load.
- **How we fixed that:**
  - Updated the dashboard chart-surface spacing selector in `app/globals.css`:
    - header-height normalization now applies only when the first `ChartSurface` child is an actual header node (`:first-child:not(.flex-1)`),
    - avoids treating single-child body-only `ChartSurface` layouts as headers.
  - Kept existing second-child body padding rule for true header+body surfaces.
- **Key Files:** `app/globals.css`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets` and confirm previously blank chart widgets (e.g., `Daily Profit/Loss`, `Average P/L by Day`, `P/L by Side`, `Trade Distribution`, `P/L vs Commissions`) render chart content again when trade data exists.

### 2026-02-15: Full Widget Reliability Hardening (V2 Visuals + V1 Behavior Parity)
- **What changed:** Completed a full reliability hardening pass across targeted/missed chart widgets, shared chart shell contracts, cache schema handling, and numeric guardrails to prevent blank-chart regressions with valid trade data.
- **What I want:** Keep V2 visuals while restoring V1 reliability behavior so widgets always choose a deterministic render state (loading/data/empty), ignore malformed trade fields safely, and recover from stale local cache entries.
- **What I don't want:** Blank black chart panels, stale IndexedDB payloads re-introducing `NaN` math after refresh, or chart `hasData` checks returning false positives/false negatives due to non-finite values.
- **How we fixed that:**
  - Stabilized shared chart shell contract:
    - added explicit `ChartSurface` structure hooks (`data-chart-surface-layout`, `data-chart-surface-header`, `data-chart-surface-body`) in `components/ui/chart-surface.tsx`,
    - replaced brittle child-index CSS selectors with attribute-scoped selectors in `app/globals.css`.
  - Hardened cache/data pipeline:
    - added cache schema version parsing/invalidation helpers in `lib/indexeddb/trades-cache.ts`,
    - added finite math helpers in `lib/utils.ts` (`toFiniteNumber`, `safeDivide`) and applied them to statistics/calendar/trading-day transforms,
    - reinforced filtered trade normalization in `context/data-provider.tsx` so filtered render paths only consume finite numeric fields.
  - Standardized widget behavior guards across targeted + missed chart widgets:
    - finite/date guard updates in `pnl-bar-chart.tsx`, `pnl-time-bar-chart.tsx`, `commissions-pnl.tsx`, `time-range-performance.tsx`, `weekday-pnl.tsx`, `pnl-by-side.tsx`, `trade-distribution.tsx`, `pnl-per-contract.tsx`, `pnl-per-contract-daily.tsx`, `tick-distribution.tsx`, `equity-chart.tsx`, `time-in-position.tsx`, `contract-quantity.tsx`, and `daily-tick-target.tsx`,
    - introduced reusable chart data guard helpers in `lib/chart-guards.ts` and used them in representative widget `hasData` paths (tick/equity).
  - Added regression tests for reliability-critical paths:
    - cache schema/version behavior,
    - cache-read trade normalization,
    - finite numeric/stat helpers,
    - shared chart `hasData` guard utilities.
- **Key Files:** `components/ui/chart-surface.tsx`, `app/globals.css`, `context/data-provider.tsx`, `lib/indexeddb/trades-cache.ts`, `lib/utils.ts`, `lib/chart-guards.ts`, `app/[locale]/dashboard/components/charts/*.tsx`, `tests/trades-cache-schema.test.ts`, `tests/cache-read-normalization.test.ts`, `tests/utils-finite-guards.test.ts`, `tests/chart-guards.test.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint` on all touched shared/chart/test files -> exits `0` (warnings-only baseline, no errors).
  - `npm run typecheck` -> exits `0`.
  - `npm run build` -> exits `0` with full route generation.
  - `npm test` -> exits `0` (`101 passed | 46 skipped`), including new reliability tests:
    - `tests/trades-cache-schema.test.ts`
    - `tests/cache-read-normalization.test.ts`
    - `tests/utils-finite-guards.test.ts`
    - `tests/chart-guards.test.ts`

### 2026-02-15: Frontend + Backend Audit (Quality Gates + Security Posture)
- **What changed:** Performed a full frontend/backend audit pass across lint, typecheck, build, and tests; documented concrete risk areas with file-level evidence.
- **What I want:** A reliable engineering baseline where CI quality gates are trustworthy, production TLS defaults remain secure, and frontend render paths avoid state anti-patterns that can regress UX/performance.
- **What I don't want:** False-green confidence from partially broken scripts, production DB connections running with disabled certificate verification, or React render/effect anti-patterns that produce subtle UI bugs.
- **How we fixed that:**
  - Audit-only pass completed and findings documented (no functional code changes made in this task).
  - Identified `typecheck` script gate mismatch:
    - `package.json` currently runs `clean:build-artifacts` before `next typegen`,
    - `tsconfig.json` includes `.next/types/**/*.ts`,
    - resulting run fails on missing `.next/types/cache-life.d.ts` immediately after clean.
  - Identified backend TLS posture risk:
    - build logs confirm Prisma pool initialization with `rejectUnauthorized: false`,
    - `lib/prisma.ts` allows non-verifying TLS under common runtime modes (including Supabase pooler defaults) unless explicitly overridden.
  - Identified frontend React correctness risks:
    - `account-card.tsx` uses synchronous `setState` in `useEffect`,
    - `account-table.tsx` mutates render-scope accumulator during map render path.
  - Captured lint baseline status for prioritization:
    - `npm run lint` exits successfully but reports `1255` warnings (many low-priority, some behavior-affecting).
- **Key Files:** `package.json`, `tsconfig.json`, `lib/prisma.ts`, `app/[locale]/dashboard/components/accounts/account-card.tsx`, `app/[locale]/dashboard/components/accounts/account-table.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run lint` -> exits `0`, reports `1255` warnings.
  - `npm run typecheck` -> fails with `TS6053` missing `.next/types/cache-life.d.ts`.
  - `npm test` -> passes (`20 passed | 1 skipped`, `88 passed | 46 skipped`).
  - `npm run build` -> passes and generates routes; build log confirms Prisma pool runtime state with `rejectUnauthorized: false`.

### 2026-02-15: User Data Isolation Hardening (ETP Orders + Account Actions)
- **What changed:** Closed several cross-user write/isolation gaps in API and server actions by enforcing authenticated-user ownership at mutation time.
- **What I want:** Every write/update/delete must stay scoped to the currently authenticated user, even if a client submits foreign IDs.
- **What I don't want:** Global-ID upserts or client-provided fallback IDs that can overwrite, relink, or delete another user’s records.
- **How we fixed that:**
  - Hardened `ETP` order ingestion in `app/api/etp/v1/store/route.ts`:
    - replaced global `upsert({ where: { orderId } })` with user-scoped lookup (`userId + orderId`) followed by `update`/`create`.
  - Hardened `deleteInstrumentGroupAction` in `server/accounts.ts`:
    - removed fallback to client-provided user id and now requires authenticated database user context.
  - Hardened `setupAccountAction` in `server/accounts.ts`:
    - validates `groupId` ownership (`group.userId === currentUserId`) before account-group connect operations.
  - Hardened `savePayoutAction` in `server/accounts.ts`:
    - removed global payout `upsert` by arbitrary id,
    - now updates only if payout belongs to current user; otherwise creates a new payout for the authenticated user’s account.
  - Hardened shared-layout server actions in `server/shared.ts`:
    - `createShared` now uses authenticated database user id server-side (ignores client-supplied user id),
    - `getUserShared` now lists only the current authenticated user’s shared links,
    - `deleteShared` now authorizes against the authenticated owner server-side (no caller-provided user id trust).
  - Hardened layout version actions in `server/layouts.ts`:
    - `createLayoutVersionAction`, `getLayoutVersionHistoryAction`, `getLayoutVersionByNumberAction`, and `cleanupOldLayoutVersionsAction` now verify `layoutId` ownership against authenticated user context before read/write/delete.
  - Hardened `fetchGroupedTradesAction` in `server/accounts.ts` to derive user scope from authenticated context instead of accepting a caller-provided user id.
  - Updated caller in `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx` to match the tightened delete action signature.
  - Updated shared-layout manager callsites to match hardened server action signatures (`getUserShared()`, `deleteShared(slug)`).
- **Key Files:** `app/api/etp/v1/store/route.ts`, `server/accounts.ts`, `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx`, `AGENTS.md`
- **Key Files (Additional):** `server/shared.ts`, `server/layouts.ts`, `app/[locale]/dashboard/components/shared-layouts-manager.tsx`
- **Verification:** 
  - `npx eslint app/api/etp/v1/store/route.ts server/accounts.ts app/[locale]/dashboard/data/components/data-management/data-management-card.tsx` exits with warnings only (no errors).
  - `npx eslint server/shared.ts server/layouts.ts server/accounts.ts app/[locale]/dashboard/components/shared-layouts-manager.tsx` exits with warnings only (no errors).
  - Manual logic validation confirms reads/writes/deletes now enforce authenticated ownership for shared links, layout versions, orders, payouts, and instrument-group deletes.

### 2026-02-15: Runtime Security Hardening (TLS Override Removal + Lazy Key Warnings)
- **What changed:** Hardened runtime/build security defaults by removing global TLS bypass behavior and reducing noisy module-import warnings for optional provider keys.
- **What I want:** Production builds should not silently disable TLS certificate checks globally, and missing optional provider keys should only surface when relevant functionality is actually used.
- **What I don't want:** Build-time security anti-patterns (`NODE_TLS_REJECT_UNAUTHORIZED=0`) or misleading warning spam triggered by module imports during static generation.
- **How we fixed that:**
  - Updated `build` script in `package.json` to explicitly unset `NODE_TLS_REJECT_UNAUTHORIZED` before running Next build.
  - Removed `NODE_TLS_REJECT_UNAUTHORIZED="0"` from `.env` and `.env.local`.
  - Updated Prisma TLS policy in `lib/prisma.ts`:
    - `PGSSL_REJECT_UNAUTHORIZED` now defaults to secure behavior in production unless explicitly overridden,
    - added explicit warning when insecure DB cert mode is intentionally enabled.
  - Refactored AI client warnings in `lib/ai/client.ts` from import-time to lazy one-time warnings when models are requested.
  - Refactored Whop client initialization in `lib/whop.ts`:
    - suppressed missing-key warning during Next production build phase,
    - switched exported `whop` to lazy proxy to avoid eager SDK initialization at import.
- **Key Files:** `package.json`, `.env`, `.env.local`, `lib/prisma.ts`, `lib/ai/client.ts`, `lib/whop.ts`, `AGENTS.md`
- **Verification:** `npm run typecheck` passes; `npm run build` passes; build no longer prints the global `NODE_TLS_REJECT_UNAUTHORIZED=0` warning; Prisma now emits a targeted warning only when `PGSSL_REJECT_UNAUTHORIZED=false` remains configured.

### 2026-02-15: Full Optimization Pass (UI/UX + Dashboard Server-Shell + Performance Guardrails)
- **What changed:** Implemented a high-impact optimization pass focused on visual consistency, UX clarity, and frontend performance foundations across dashboard and shared UI primitives.
- **What I want:** The app should feel premium and readable, with clearer dashboard navigation, lower hydration pressure on core routes, and measurable bundle governance instead of subjective “feels faster” claims.
- **What I don't want:** Generic-looking surfaces, monolithic client-rendered dashboard entrypoints, typography bloat, and optimization work without enforceable checks.
- **How we fixed that:**
  - Added semantic token layer + strict 4px rhythm/typography/radius/shadow primitives in `styles/tokens.css`.
  - Refined global visual baseline in `app/globals.css`:
    - stronger semantic typography mapping,
    - shared surface helpers,
    - improved negative metric readability (`.metric-negative` opacity/weight),
    - compatibility for both legacy/new widget shell data attributes.
  - Standardized UI shell contracts:
    - upgraded `WidgetShell` and `ChartSurface` container hierarchy/contrast,
    - normalized `StatsCard` visual style to the new surface system.
  - Reduced root font payload and simplified typography stack in `app/layout.tsx`:
    - removed unused `Inter` + `IBM Plex Mono`,
    - switched to `Geist` + `Geist Mono` + `Manrope` mapping.
  - Migrated dashboard root route from full client page to server-shell architecture:
    - `app/[locale]/dashboard/page.tsx` is now server-rendered and tab-sanitized,
    - created client island `app/[locale]/dashboard/components/dashboard-tab-shell.tsx` with dynamic tab panel loading + clearer top-level tab chips.
  - Improved nav confidence and interaction semantics in `components/ui/unified-sidebar.tsx` (active label emphasis + better aria labeling).
  - Reduced production console noise in `components/providers/root-providers.tsx` service-worker registration path.
  - Added measurable performance governance:
    - `scripts/analyze-bundle.mjs`,
    - `scripts/check-route-budgets.mjs`,
    - new npm scripts: `analyze`, `check:route-budgets`,
    - artifact output to `docs/audits/artifacts/bundle-summary.json`.
  - Optimized shared media card image delivery by moving `components/ui/media-card.tsx` from `<img>` to `next/image`.
- **Key Files:** `styles/tokens.css`, `app/globals.css`, `components/ui/widget-shell.tsx`, `components/ui/chart-surface.tsx`, `components/ui/stats-card.tsx`, `app/layout.tsx`, `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`, `components/ui/unified-sidebar.tsx`, `components/providers/root-providers.tsx`, `components/ui/media-card.tsx`, `scripts/analyze-bundle.mjs`, `scripts/check-route-budgets.mjs`, `package.json`, `AGENTS.md`
- **Verification:** `npx eslint` on all touched TS/TSX/MJS files passes (CSS files intentionally ignored by ESLint config); `npm run typecheck` passes; `npm run build` passes with full route generation; `node scripts/analyze-bundle.mjs && node scripts/check-route-budgets.mjs` passes and writes `docs/audits/artifacts/bundle-summary.json`.

### 2026-02-15: Full Dashboard Widget Audit (34 Widgets) + Cross-Widget Visibility Fixes
- **What changed:** Audited all registered dashboard widgets (34 total) and fixed recurring visibility/UX regressions across chart widgets in one consistency pass.
- **What I want:** Every widget should present data with clear contrast and consistent empty-state behavior, so users don’t mistake styling inconsistencies for missing data.
- **What I don't want:** Hardcoded “No data available” strings, inconsistent empty-state wording, and low-contrast negative/secondary labels making widgets feel broken or unreadable.
- **How we fixed that:**
  - Audited widget set from `WIDGET_REGISTRY` (`34` widget types).
  - Replaced hardcoded chart empty text in chart components with localized `widgets.emptyState` fallback (`No trades yet.`) across all chart implementations.
  - Improved global negative metric readability by raising `.metric-negative` opacity (`0.58` -> `0.78`) in `app/globals.css`.
  - Tightened shared chart fallback defaults in `ChartSurface` (`emptyMessage` default + stronger empty text visibility).
  - Kept the previously requested donut design refresh and applied matching legend spacing/contrast language for consistency.
- **Key Files:** `app/[locale]/dashboard/components/charts/*.tsx`, `components/ui/chart-surface.tsx`, `app/globals.css`, `app/[locale]/dashboard/config/widget-registry.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets` and cycle through chart widgets; confirm empty widgets show localized “No trades yet.” messaging and active widgets have improved negative-value/readout contrast.

### 2026-02-15: Widget Donut Design Refresh (Trade Distribution + Commissions)
- **What changed:** Refined donut-style dashboard widgets to match the requested visual reference: centered ring, stronger contrast, cleaner legend spacing, and more readable label hierarchy.
- **What I want:** Widget charts should feel premium and immediately readable, with white/gray monochrome contrast and balanced spacing so the graph is the visual focus.
- **What I don't want:** Cramped legends, low-visibility text, or inconsistent donut styling across widgets that makes charts feel disconnected.
- **How we fixed that:**
  - Reworked `TradeDistribution` donut presentation:
    - removed center text clutter,
    - tuned ring thickness/position for stronger center composition,
    - switched to a vertical bottom legend with clearer dots and labels,
    - increased contrast using intentional white/gray token shades.
  - Aligned `CommissionsPnL` legend structure to the same vertical, high-visibility style for consistency.
- **Key Files:** `app/[locale]/dashboard/components/charts/trade-distribution.tsx`, `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets` and confirm both donut widgets render with a centered ring, stronger white/gray contrast, and a clean bottom legend similar to the design reference.

### 2026-02-14: Sidebar Collapse Behavior Stabilization (State Toggle Hardening)
- **What changed:** Hardened the core sidebar open/collapse state setter to remove stale-state edge cases during rapid toggles (button + keyboard).
- **What I want:** Sidebar collapse/expand should feel consistent and deterministic even with quick repeated interactions.
- **What I don't want:** Intermittent mis-toggles caused by stale closure values when toggling quickly or from multiple controls.
- **How we fixed that:**
  - Added a `ref` mirror of the current `open` state in `SidebarProvider`.
  - Updated `setOpen` to resolve functional updates against `openRef.current` instead of a captured render value.
  - Narrowed `setOpen` callback dependencies to avoid recreating it on every open-state change.
- **Key Files:** `components/ui/sidebar.tsx`, `AGENTS.md`
- **Verification:** Run `npx eslint components/ui/sidebar.tsx components/ui/unified-sidebar.tsx` (clean). Toggle collapse rapidly (header trigger + keyboard shortcut) and confirm stable, predictable behavior.

### 2026-02-14: Unified Sidebar Aligned to shadcn Default Trigger Pattern
- **What changed:** Simplified the unified sidebar header collapse control to match shadcn default behavior and removed custom style-specific collapse-button variants.
- **What I want:** A sidebar interaction model that feels like standard shadcn across all style variants, with one predictable trigger behavior.
- **What I don't want:** Extra custom collapse styling/logic per visual variant that drifts from shadcn baseline behavior.
- **How we fixed that:**
  - Kept `SidebarTrigger` as the single header collapse control.
  - Removed custom `collapseButton` style-token plumbing from `SIDEBAR_STYLES`.
  - Normalized trigger classes to the compact shadcn pattern (`h-7 w-7`, desktop header visibility).
- **Key Files:** `components/ui/unified-sidebar.tsx`, `AGENTS.md`
- **Verification:** Run `npx eslint components/ui/unified-sidebar.tsx components/ui/sidebar.tsx` (clean). Open dashboard and verify the header collapse control behaves like standard shadcn trigger.

### 2026-02-14: Sidebar Collapse Control Migrated to shadcn Trigger
- **What changed:** Replaced the custom chevron collapse button in the unified sidebar header with the native `SidebarTrigger` from the shadcn sidebar primitive.
- **What I want:** Collapse/expand behavior should follow one consistent shadcn interaction model across dashboard sidebars.
- **What I don't want:** A custom collapse control drifting from shadcn behavior or creating inconsistent toggle handling between header/rail/mobile controls.
- **How we fixed that:**
  - Removed bespoke chevron-toggle UI logic from `UnifiedSidebar`.
  - Wired the header control directly to `SidebarTrigger` while preserving explicit `aria-label`/`title` for expand/collapse states.
  - Kept footer actions and existing nav grouping intact to avoid behavioral regressions.
- **Key Files:** `components/ui/unified-sidebar.tsx`, `AGENTS.md`
- **Verification:** Run `npx eslint components/ui/unified-sidebar.tsx` (clean). Open dashboard and confirm the sidebar header toggle uses shadcn trigger behavior and collapses/expands correctly.

### 2026-02-14: Whop Checkout Flow Hardening (Locale-Safe Redirects + Frontend/Backend Alignment)
- **What changed:** Hardened the Whop payment flow end-to-end so checkout/auth redirects remain locale-safe and purchase entry points consistently route into dynamic Whop checkout with preserved params.
- **What I want:** Users should be able to start checkout from pricing surfaces without broken query strings or locale drops, then return to the correct localized dashboard/auth pages after sign-in and Whop redirect.
- **What I don't want:** Redirects to non-localized paths (`/dashboard`, `/authentication`) in a locale-routed app, malformed query strings (`?` + `&` mixing), or frontend entry points that bypass checkout while claiming paid upgrade behavior.
- **How we fixed that:**
  - Added shared checkout URL builder utilities in `lib/whop-checkout.ts` and shared currency detection hook in `hooks/use-currency.ts`.
  - Updated `components/pricing-plans.tsx` to use deterministic checkout URL redirects (instead of ad-hoc DOM form creation) and include locale/referral context.
  - Updated Home pricing CTA routing in `app/[locale]/(home)/components/PricingSection.tsx`:
    - Pro AI now links directly into dynamic Whop checkout (`plus_monthly_{currency}`),
    - Starter keeps auth onboarding flow,
    - Desk remains support/sales-oriented.
  - Fixed auth “next” URL composition in `app/[locale]/(authentication)/components/user-auth-form.tsx`:
    - proper query param assembly via `URLSearchParams`,
    - locale-aware next-path normalization,
    - safe redirect defaults to `/${locale}/dashboard`.
  - Hardened callback and checkout APIs for locale-aware redirects:
    - `app/api/auth/callback/route.ts`,
    - `app/api/whop/checkout/route.ts`,
    - `app/api/whop/checkout-team/route.ts`.
  - Improved checkout plan-id resolution in `app/api/whop/checkout/route.ts` with support for interval/currency-derived env lookups and legacy fallbacks.
- **Key Files:** `lib/whop-checkout.ts`, `hooks/use-currency.ts`, `components/pricing-plans.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(authentication)/components/user-auth-form.tsx`, `app/api/auth/callback/route.ts`, `app/api/whop/checkout/route.ts`, `app/api/whop/checkout-team/route.ts`, `AGENTS.md`
- **Verification:** Run `npm run build` and confirm successful compile, TypeScript pass, and route generation including `/api/whop/checkout` + `/api/whop/checkout-team` without checkout/auth redirect type errors.

### 2026-02-14: Trader Profile Calendar Build Compatibility (`react-day-picker` v9)
- **What changed:** Fixed trader-profile calendar customization to match current `react-day-picker` component API so production build no longer fails on removed legacy types/components.
- **What I want:** Trader Profile should keep custom per-day PnL rendering while remaining compatible with the installed DayPicker version.
- **What I don't want:** Build failures from deprecated/removed `react-day-picker` symbols like `DayContentProps` and unsupported `components.DayContent`.
- **How we fixed that:**
  - Removed deprecated `DayContentProps` import.
  - Migrated custom calendar renderer from `components.DayContent` to supported `components.DayButton` override in `app/[locale]/dashboard/trader-profile/page.tsx`.
  - Kept the visual behavior (day number + compact PnL text) inside the new DayButton implementation.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** `npm run build` completes successfully after TypeScript + static generation, with no `DayContentProps`/`DayContent` errors.

### 2026-02-14: Sidebar Reliability + Active-State Accuracy + Collapse UX Fix
- **What changed:** Audited and fixed the shared sidebar system end-to-end: active-route matching, locale handling, collapse persistence, mobile close behavior, provider layering, and sidebar wrapper cleanup.
- **What I want:** Sidebar navigation should always highlight the correct active item (including locale-prefixed routes), collapse controls should feel predictable across desktop/mobile, and sidebar state should persist after refresh.
- **What I don't want:** Non-highlighted active links, inconsistent locale routing between sidebars, duplicated provider state/listeners, dead sidebar code paths, or collapse controls that behave inconsistently.
- **How we fixed that:**
  - Fixed active-link matching in `UnifiedSidebar` by normalizing both `pathname` and item `href` via locale-stripping before comparisons.
  - Expanded locale stripping to support both `xx` and `xx-XX` patterns.
  - Improved sidebar functionality on mobile:
    - sidebar now closes automatically after selecting a nav link or action item,
    - collapse icon button in sidebar header is now desktop-only to avoid mobile control overlap.
  - Added cookie-backed restore for sidebar open/collapsed state by reading `sidebar:state` on provider init.
  - Removed nested `SidebarProvider` wrappers from dashboard and team layouts (root provider remains the single source of truth).
  - Cleaned sidebar wrappers:
    - removed unused imports/vars in `dashboard-sidebar.tsx`,
    - removed abandoned duplicate nav-building block in `aimodel-sidebar.tsx`,
    - unified `AIModelSidebar` links to locale-prefixed routes for consistency.
- **Key Files:** `components/ui/unified-sidebar.tsx`, `components/ui/sidebar.tsx`, `components/sidebar/dashboard-sidebar.tsx`, `components/sidebar/aimodel-sidebar.tsx`, `app/[locale]/dashboard/layout.tsx`, `app/[locale]/teams/manage/layout.tsx`, `app/[locale]/teams/dashboard/layout.tsx`, `AGENTS.md`
- **Verification:** Run `npx eslint` on all edited sidebar/layout files (clean), open dashboard and team/admin contexts, confirm active item highlight works on locale routes, collapse state persists after refresh, and mobile sidebar closes after nav selection.

### 2026-02-14: Dashboard Not Loading Fix (Mobile-Safe Timeouts + IndexedDB Fail-Open)
- **What changed:** Hardened dashboard data loading so it cannot hang forever on mobile browsers, and removed fragile type coupling that could block builds.
- **What I want:** On iOS Safari (including private mode), `/dashboard` should either load real data or gracefully fall back without an infinite “Loading your trades…” state.
- **What I don't want:** A single stalled network call or IndexedDB open to keep `isLoading=true` indefinitely, leaving users stuck with a permanent loading toast.
- **How we fixed that:**
  - Added a `withTimeout()` wrapper inside `DataProvider` to cap the duration of critical async steps (`supabase.auth.getUser`, trades fetch, user data fetch, metrics calc).
  - Made IndexedDB cache opening fail-open with a short timeout so cache issues never block dashboard loading.
  - Relaxed overly strict Recharts tooltip typings and generalized risk-metric trade typing to accept client-normalized trades, unblocking `npm run typecheck`.
- **Key Files:** `context/data-provider.tsx`, `lib/indexeddb/trades-cache.ts`, `lib/analytics/metrics-v1.ts`, `lib/advanced-metrics.ts`
- **Verification:** `npm run typecheck` exits 0; on slow/mobile networks the dashboard no longer hangs indefinitely and `isLoading` reliably clears.

### 2026-02-14: True Self-Heal Pass (Build OOM + Local Build Stability)
- **What changed:** Implemented a real self-heal workflow and fixed the actual failing issue that blocked smooth runs: production build OOM during trace collection.
- **What I want:** Commands should run reliably in local development without crashing at the end of `next build`, and one command should handle lint auto-fix + validation.
- **What I don't want:** A fake “self-heal” that only reruns lint while build still crashes due memory pressure or aggressive local trace/worker settings.
- **How we fixed that:**
  - Added a reusable `self-heal` command (`npm run self-heal`) via `scripts/self-heal.mjs` that performs:
    - `npm run lint -- --fix`
    - `npm run lint` validation
  - Increased Node heap for build command to reduce memory failures (`--max-old-space-size=12288`).
  - Hardened Next.js local build memory profile in `next.config.ts`:
    - made build workers configurable and defaulted local builds to `cpus: 1` (`NEXT_BUILD_CPUS` override supported),
    - switched standalone output to explicit opt-in (`NEXT_STANDALONE=1`) instead of always-on for local runs,
    - kept `outputFileTracingRoot` pinned to workspace root for deterministic tracing.
  - Verified build now completes successfully end-to-end in this environment.
- **Key Files:** `package.json`, `scripts/self-heal.mjs`, `next.config.ts`, `AGENTS.md`
- **Verification:** `npm run self-heal` exits 0 (warnings only); `npm run build` now exits 0 and prints full route manifest instead of crashing with heap OOM.

### 2026-02-14: Auto-Fix Self-Heal Command Added
- **What changed:** Added a dedicated `self-heal` workflow command that runs lint auto-fixes and then immediately validates with a second lint pass.
- **What I want:** A single command future agents and maintainers can run to apply safe ESLint auto-fixes and confirm the workspace is in a stable lint state.
- **What I don't want:** Repeating manual two-step lint routines every time (`--fix` then verification), or assuming auto-fix completed without validation.
- **How we fixed that:**
  - Added `scripts/self-heal.mjs` to orchestrate:
    - `npm run lint -- --fix`
    - `npm run lint`
  - Added `self-heal` script entry in `package.json` mapped to `node scripts/self-heal.mjs`.
  - Verified execution by running `npm run self-heal` end-to-end; command exits successfully and reports remaining non-auto-fixable warnings.
- **Key Files:** `scripts/self-heal.mjs`, `package.json`, `AGENTS.md`
- **Verification:** Run `npm run self-heal` and confirm the command completes both phases and prints `[Self-Heal] Completed. Auto-fix pass + validation pass are done.`

### 2026-02-14: Complete Project End-to-End Audit (Code, Build, Tests, Security Signals)
- **What changed:** Performed a full-project audit sweep across static quality gates, runtime build behavior, test suites, dependency/security checks, and high-risk server/client patterns.
- **What I want:** A release-ready confidence snapshot that distinguishes hard blockers from operational risks and clearly documents coverage gaps caused by environment/network limits.
- **What I don't want:** False confidence from partial checks (for example tests passing while production build/runtime environment is misconfigured or security defaults are weak).
- **How we fixed that:**
  - Executed `npm run typecheck` successfully.
  - Executed `npm test` and `npm run test:payment`; both suites passed in this environment (with expected skipped DB-backed tests when `DATABASE_URL` is absent).
  - Executed production `npm run build` and observed successful compile + static page generation, but also captured high-risk runtime warnings:
    - `NODE_TLS_REJECT_UNAUTHORIZED=0` warning during build execution,
    - missing `OPENAI_API_KEY`,
    - missing `WHOP_API_KEY`,
    - Prisma pool logging `rejectUnauthorized: false`.
  - Dependency audit commands requiring registry network access could not complete (`npm audit` / `npm outdated` blocked by DNS/network).
  - Identified security/code-health hotspots:
    - non-cryptographic slug generation via `Math.random` in server slug/referral helpers,
    - extensive `@ts-ignore` usage in consent UI,
    - large persistent ESLint warning backlog from prior baseline.
- **Key Files:** `lib/prisma.ts`, `lib/ai/client.ts`, `lib/whop.ts`, `server/referral.ts`, `server/shared.ts`, `components/consent-banner.tsx`, `AGENTS.md`
- **Verification:** 
  - `npm run typecheck` -> success.
  - `npm test` -> `20 passed | 1 skipped`, `88 passed | 46 skipped`.
  - `npm run test:payment` -> `10 passed | 1 skipped`, `65 passed | 46 skipped`.
  - Build logs show static generation completed (`86/86`) and captured env/security warnings above.
  - `npm audit` failed due `getaddrinfo ENOTFOUND registry.npmjs.org` (environment network limitation).

### 2026-02-14: End-to-End Repository Audit (Build Gate + Test Gate)
- **What changed:** Ran a full audit pass across lint, production build, tests, and high-risk changed files; documented a release-blocking TypeScript regression in account save flow.
- **What I want:** CI and deploy gates should reflect true production health, with failing build blockers surfaced before release and test status clearly separated from lint-noise.
- **What I don't want:** Shipping with a green test suite but a broken production build caused by type-model drift in server actions.
- **How we fixed that:**
  - Executed `npm run lint` (no hard errors; warning backlog remains).
  - Executed `npm run build` and identified a blocking compile/type failure in `setupAccountAction` destructuring.
  - Executed `npm test` to confirm unit/integration baseline is healthy despite build break.
  - Isolated failure root: `updatedAt` is destructured from `Account` in `server/accounts.ts`, but `Account` type no longer includes that property.
- **Key Files:** `server/accounts.ts`, `lib/data-types.ts`, `AGENTS.md`
- **Verification:** `npm run build` fails at `server/accounts.ts:215` with `Type error: Property 'updatedAt' does not exist on type 'Account'.`; `npm test` passes (`20 passed | 1 skipped`, `88 passed | 46 skipped`).

### 2026-02-14: Account Update Prisma Validation Fix (`updatedAt` payload leak)
- **What changed:** Fixed a server-action regression where saving account settings could crash with `PrismaClientValidationError` because `updatedAt` was passed into `prisma.account.update()`.
- **What I want:** Account save/update flows from Dashboard should succeed reliably without schema-validation crashes on managed deployments.
- **What I don't want:** Client-normalized account objects leaking immutable/system timestamp fields into Prisma update payloads (`Unknown argument 'updatedAt'`).
- **How we fixed that:**
  - Updated `setupAccountAction` payload sanitization to explicitly strip `createdAt` and `updatedAt` before building Prisma `data` objects for both update/create paths.
  - Kept the rest of relation handling (`group` connect/disconnect and `considerBuffer`) unchanged.
- **Key Files:** `server/accounts.ts`, `AGENTS.md`
- **Verification:** Trigger an account edit/save from `/dashboard` and confirm no Prisma validation error appears in logs; verify account values persist correctly.

### 2026-02-14: Dashboard Chart Widgets Data Visibility Fix (Hidden Group Filter Guard)
- **What changed:** Fixed a data-filtering regression that could hide all chart-widget data by incorrectly treating ungrouped accounts as hidden.
- **What I want:** Chart widgets should consistently show real trade data whenever the user has trades, unless accounts are intentionally placed in the `Hidden Accounts` group.
- **What I don't want:** A fallback comparison against an undefined hidden-group id that silently filters out all ungrouped account trades and makes widgets appear empty.
- **How we fixed that:**
  - Updated `formattedTrades` filtering in `DataProvider` so hidden-account filtering is only applied when the `Hidden Accounts` group actually exists.
  - Added a small defensive date-shape guard in `formatCalendarData` so side fallback logic remains stable even if trade date fields arrive in mixed formats.
- **Key Files:** `context/data-provider.tsx`, `lib/utils.ts`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets` and confirm chart widgets render real values again for users with existing trades; verify hidden-account behavior still works when an actual `Hidden Accounts` group is present.

### 2026-02-14: Home End-to-End Audit + Conversion-Focused Content Redesign
- **What changed:** Audited the Home page end-to-end and reworked the section architecture + copy strategy to clearly answer: problem, features, process, why us, why different, AI value, and pricing/CTA.
- **What I want:** A high-conviction marketing flow that explains product value fast and makes differentiation obvious to both individual traders and team leads.
- **What I don't want:** Generic landing copy, missing trust narrative, duplicate section anchors, or disconnected component flow that forces users to infer why Qunt Edge is better.
- **How we fixed that:**
  - Expanded the active Home flow in `DeferredHomeSections` to include stronger narrative sequencing:
    - `ProblemStatement` -> `Features` -> `HowItWorks` -> `AnalysisDemo` -> `WhyChooseUs` -> `ComparisonSection` -> `AIFuturesSection` -> `PricingSection` -> `CTA`.
  - Rewrote core messaging across sections:
    - clearer value props in `Features`,
    - process-first pipeline in `HowItWorks`,
    - stronger trust and positioning statements in `WhyChooseUs`,
    - explicit “why we are different” language in `ComparisonSection`,
    - sharper AI-benefit messaging in `AIFuturesSection`,
    - more conversion-oriented pricing/CTA wording.
  - Standardized typography usage in updated sections to align with current Home type tokens (`--home-display`, `--home-copy`).
  - Fixed audit issue: removed duplicate anchor ID usage by changing `WhyChooseUs` section from `id="features"` to `id="why-us"`.
- **Key Files:** `app/[locale]/(home)/components/DeferredHomeSections.tsx`, `app/[locale]/(home)/components/ProblemStatement.tsx`, `app/[locale]/(home)/components/Features.tsx`, `app/[locale]/(home)/components/HowItWorks.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/CTA.tsx`, `AGENTS.md`
- **Verification:** Run ESLint on all edited Home components and confirm no errors; open `/` and verify the full narrative stack renders in the order above with unique section IDs and stronger differentiation messaging.

### 2026-02-14: Accounts Header Simplification (Workspace Badge Removed)
- **What changed:** Removed the `WORKSPACE` badge from the Accounts dashboard header so the section reads as a clean `ACCOUNTS` title with the existing subtitle.
- **What I want:** The Accounts view should have a unified, direct heading style focused on account context without an extra workspace tag.
- **What I don't want:** A mixed header treatment where Accounts looks like a nested workspace label instead of its own clear section.
- **How we fixed that:**
  - Added a targeted visibility condition in `DashboardHeader` to hide the section badge when `activeTab === "accounts"` on the dashboard root.
  - Kept title/subtitle behavior unchanged so only the badge treatment was simplified.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=accounts` and confirm the badge is gone, title shows `ACCOUNTS`, and subtitle remains: "Track account growth, balances, and consistency in one place."

### 2026-02-14: Home Redesign Inspired by CodeWiki (Google-Style Product Surface)
- **What changed:** Reworked the Home page visual language toward a cleaner CodeWiki-inspired product-doc style with typography-led hierarchy and lighter UI texture.
- **What I want:** A modern Google-like product marketing feel: crisp sans headings, readable copy, structured information blocks, and clear CTA hierarchy without terminal-like type treatment.
- **What I don't want:** A heavy IBM Plex Mono visual tone across hero/sections or overly editorial/ornamental typography that conflicts with product SaaS clarity.
- **How we fixed that:**
  - Switched Home typography mapping to a sans-first stack:
    - `--home-display` -> `--font-geist`
    - `--home-copy` -> `--font-manrope`
    - `--home-mono` -> `--font-geist` (for consistent non-mono microtype styling)
  - Removed Cormorant usage from root font loading in `app/layout.tsx` and kept `Manrope` as the complementary readable body font.
  - Updated Home components to consistently use display/copy typography utilities so badges, labels, CTA text, and metadata no longer render with a terminal-like mono feel.
  - Preserved existing component structure and flow while refining typography hierarchy for Hero, Analysis Demo, Why Choose Us, Comparison, AI Futures, Pricing, and CTA sections.
- **Key Files:** `app/layout.tsx`, `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/CTA.tsx`, `AGENTS.md`
- **Verification:** Open `/` and confirm Home no longer appears mono-heavy; headings/body follow a clean sans hierarchy; run ESLint on edited files and confirm no errors.

### 2026-02-14: Home Typography Regression Fix (Mono Leak)
- **What changed:** Corrected a typography regression where Home text appeared overly mono/terminal-like.
- **What I want:** Home should keep the editorial display + clean body typography while reserving true mono only for explicit code/terminal contexts.
- **What I don't want:** A global or page-wide IBM Plex Mono feel that makes marketing copy look technical and harms readability.
- **How we fixed that:**
  - Updated Home token mapping in `HomeContent` so `--home-mono` resolves to `Manrope` instead of IBM Plex Mono, preventing mono styling from dominating labels/buttons.
  - Fixed a global utility typo in `app/globals.css` by changing `--font-ibm-plex-mono` to the correct `--font-ibm-mono` so mono utilities are explicit and predictable.
- **Key Files:** `app/[locale]/(home)/components/HomeContent.tsx`, `app/globals.css`, `AGENTS.md`
- **Verification:** Open `/` and confirm Home typography no longer reads as mono; run ESLint on edited TSX file and confirm no errors.

### 2026-02-14: Prop Firm Catalogue Analytics Redesign (Stacked + Multi-Line)
- **What changed:** Rebuilt the Prop Firm Catalogue analytics surface with richer database-driven metrics, including a stacked payout chart, multi-line overlays, and expanded firm cards with account value + size-mix context.
- **What I want:** Users should instantly understand each firm’s scale and quality through one glance: registered accounts (blue), total account value (red), and size participation/mix (yellow), plus paid/pending/refused payout composition.
- **What I don't want:** A thin single-bar chart and shallow cards that hide key insights like aggregate account capital and real account-size distribution (e.g., `2x25k + 1x100k`).
- **How we fixed that:**
  - Extended `getPropfirmCatalogueData` to aggregate:
    - `totalAccountValue` from `Account.startingBalance` sums per prop firm,
    - `sizedAccountsCount` from accounts with positive starting balance,
    - per-size distribution buckets grouped by starting balance and formatted into compact labels (`25k`, `100k`, `1m`),
    - `sizeBreakdown` strings for card/chart context (`2x25k + 1x100k`).
  - Upgraded shared types to carry the new distribution/value fields.
  - Replaced the old single-series chart with a composed shadcn/recharts view:
    - stacked bars for payout statuses (`Paid`, `Pending`, `Refused`),
    - red line for `Total Account Value`,
    - blue line for `Registered Accounts`,
    - yellow dashed line for `Sized Accounts`.
  - Redesigned firm cards to include a stronger KPI row (Registered, Total Paid, Total Account Value, Size Mix) while preserving payout status blocks below.
  - Added sorting support for `Account Value`.
- **Key Files:** `app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue.ts`, `app/[locale]/(landing)/propfirms/actions/types.ts`, `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`, `app/[locale]/(landing)/propfirms/components/sort-controls.tsx`, `app/[locale]/(landing)/propfirms/page.tsx`, `AGENTS.md`
- **Verification:** Open `/propfirms` and confirm the chart shows stacked payout bars + red/blue/yellow lines, cards show `Total Account Value` and `Size Mix` per firm, and sort control includes `Account Value`.

### 2026-02-14: Prop Firm Catalogue De-Dupe + Monochrome Polish
- **What changed:** Removed the duplicated “Registered Accounts” blocks in each firm card and unified KPI + chart styling to a monochrome palette (no rainbow tiles/lines).
- **What I want:** A clean, premium monochrome surface where key numbers are bold and readable without competing colors, and each metric is shown once.
- **What I don't want:** Repeating the same “Registered” count in multiple places (header + tile + badges) or using multiple bright colors that fight the overall theme.
- **How we fixed that:**
  - Replaced the 2x2 colored KPI tiles with a single monochrome KPI badge strip (Paid, Account Value, Size Mix, Sized).
  - Kept only one registered count (top-right in the card header) and removed the extra “Registered Accounts” KPI tile + the duplicate “Registered Accounts” badge row.
  - Updated the composed chart series colors to grayscale and differentiated lines by dash patterns instead of red/blue/yellow strokes.
- **Key Files:** `app/[locale]/(landing)/propfirms/page.tsx`, `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`, `AGENTS.md`
- **Verification:** Open `/propfirms` and confirm each card shows only one “Registered” count, KPI strip is monochrome, and chart lines/bars are grayscale with distinct dash styles.

### 2026-02-14: Prop Firm Chart UX Polish (Toggles + Integer Axis)
- **What changed:** Improved the Prop Firm Catalogue chart to be cleaner and more readable with a compact shadcn toolbar, integer-only count axis, and automatic hiding of zero-firms by default.
- **What I want:** The chart should tell a story immediately even when most firms are zero: fewer labels, no decimal count ticks, and quick series toggles to focus.
- **What I don't want:** A cluttered legend, unreadable flat lines across many zero firms, or count axes showing decimals like `0.75`.
- **How we fixed that:**
  - Added shadcn `Button` chips to toggle: Payouts, Account Value, Registered, Sized, and Hide/Include Zeros.
  - Defaulted the plotted dataset to non-zero firms and limited to a readable top slice for the chart, while leaving the full firm grid below unchanged.
  - Forced the counts Y-axis to `allowDecimals={false}` and rounded the domain so ticks stay integer-friendly.
  - Removed chart dots and the bulky legend to reduce noise; tooltip now shows the firm name in a stronger label.
- **Key Files:** `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`, `AGENTS.md`
- **Verification:** Open `/propfirms` and confirm: no decimal ticks on the right axis, legend is gone, chips toggle layers, and “Hide Zeros” meaningfully changes the plotted firms.

### 2026-02-14: Prop Firm Chart Minimal Mode (Calmer Surface)
- **What changed:** Tuned the chart UI toward a more minimal, premium surface with quieter gridlines, fewer label distractions, and calmer default layers.
- **What I want:** A clean first impression where the chart reads instantly without feeling busy; users can layer in details only when they want them.
- **What I don't want:** A dense, “dashboardy” look with loud gridlines, overlong axis labels, and every series enabled by default.
- **How we fixed that:**
  - Defaulted layers to `Value + Reg` only; payouts and sized accounts are opt-in.
  - Reduced grid noise (horizontal grid only, lighter dash).
  - Improved x-axis readability (slightly less rotation, truncation, preserve start/end ticks).
  - Made the toggle chips smaller/subtler and shortened labels (`Value`, `Reg`, `Zeros: Off/On`).
- **Key Files:** `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`, `AGENTS.md`
- **Verification:** Open `/propfirms` and confirm the chart is calmer by default (only Value + Reg), with lighter grid and fewer label distractions.

### 2026-02-14: Prop Firm Catalogue Controls + Payout Rows Monochrome Unification
- **What changed:** Unified the remaining out-of-theme UI pieces in Prop Firm Catalogue: timeframe/sort selects and payout statistic rows now use the same monochrome surface styling as the rest of the page.
- **What I want:** The entire catalogue page should feel like one coherent design system: same borders, same surface tone, same text contrast.
- **What I don't want:** Default-styled selects that look like a different UI kit and payout rows with inconsistent emphasis/contrast.
- **How we fixed that:**
  - Restyled `SelectTrigger` and `SelectContent` in timeframe + sort controls to match the monochrome black/glass palette.
  - Normalized Paid/Pending/Refused payout rows to the same `bg-white/5` + `border-white/10` surface treatment with consistent text contrast.
- **Key Files:** `app/[locale]/(landing)/propfirms/components/timeframe-controls.tsx`, `app/[locale]/(landing)/propfirms/components/sort-controls.tsx`, `app/[locale]/(landing)/propfirms/page.tsx`, `AGENTS.md`
- **Verification:** Open `/propfirms` and verify the dropdowns match the dark theme and all payout rows share one consistent surface style.

### 2026-02-14: Home Typography-Only Rewrite (Editorial Pass)
- **What changed:** Rewrote Home page typography only, introducing a distinct display/body font pairing and re-tuning type scale, tracking, and line-height across active Home sections.
- **What I want:** The Home page should feel clearly premium through typography alone, with visible contrast between headline voice, body readability, and micro-label metadata.
- **What I don't want:** Another "light tweak" that keeps the same visual voice, or any unintended layout/color/component refactors while trying to improve type.
- **How we fixed that:**
  - Added dedicated Home typography fonts in `app/layout.tsx` (`Cormorant Garamond` for display and `Manrope` for copy) via `next/font/google` variables.
  - Scoped Home tokens in `HomeContent`:
    - `--home-display: var(--font-cormorant)`
    - `--home-copy: var(--font-manrope)`
    - `--home-mono: var(--font-ibm-mono)`
  - Updated typography classes only in Hero, Analysis Demo, Why Choose Us, Comparison, AI Futures, Pricing, and CTA:
    - headline clamp sizes + tighter display tracking/leading,
    - mono uppercase kicker/button label rhythm,
    - improved body text leading for readability.
  - Kept structure, spacing system, component composition, and color styling intact.
- **Key Files:** `app/layout.tsx`, `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/CTA.tsx`, `AGENTS.md`
- **Verification:** Open `/` and confirm the new serif-forward headline voice, mono micro-labels, and improved body rhythm across all Home sections; run ESLint on edited files with no errors.

### 2026-02-14: Dashboard Data Visibility + Color Parity Restore (Commit 198b8ed)
- **What changed:** Restored dashboard default widget visibility behavior and reverted widget-canvas surface styling to match the data display look from commit `198b8ed`.
- **What I want:** Users should immediately see dashboard data in the widget view with the same high-contrast monochrome presentation that made chart and metric values clearly readable.
- **What I don't want:** Dashboard opening in a non-widget context by default or widget surfaces inheriting theme token colors that can reduce contrast and make data appear missing.
- **How we fixed that:**
  - Reverted dashboard tab default behavior to `widgets` in `page.tsx` when no `tab` query param is provided.
  - Removed temporary debug overlay rendering from dashboard page.
  - Restored widget-canvas interactive/surface classes to the commit-matching dark style (`bg-black/95`, white-border hover, white-tinted overlays/popovers) for data readability consistency.
- **Key Files:** `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard` with and without `?tab=` query params and confirm widget data is visible by default and card/chart contrast matches the previous commit aesthetic.

### 2026-02-15: Merged Payment Gateway Fixes & Dashboard Data Hardening
- **What changed:** Merged `fix/payment-gateway-whop` into `main`, resolving conflicts in `AGENTS.md` and `context/data-provider.tsx`.
- **What I want:** synchronised `main` branch with the latest payment gateway fixes, empty-state improvements for widgets, and data-provider hardening (hidden accounts guard + safe timezone conversion).
- **What I don't want:** Conflicting logic between the main dashboard data provider and the new payment flow enhancements.
- **How we fixed that:**
  - Merged branch `fix/payment-gateway-whop`.
  - Resolved `AGENTS.md` conflict by preserving both history logs.
  - Resolved `context/data-provider.tsx` conflict by retaining the `hiddenCoversAllTradedAccounts` safety check from the fix branch while keeping the more specific Safari-timezone comment from `HEAD`.
- **Key Files:** `context/data-provider.tsx`, `AGENTS.md`
- **Verification:** `git log` shows the merge commit `1d0f3cc`; the codebase now contains both the Whop payment fixes and the dashboard data hardening.

### 2026-02-15: Widget Charts “No Data” Fix (Hidden Accounts Guard + Safe Timezone Conversion)
- **What changed:** Fixed a regression where widget charts (including white donut/pie charts) could show “No data” even when trades existed, because `formattedTrades` was being filtered down to empty.
- **What I want:** Charts should render reliably across browsers (including Safari) and typical account setups (ungrouped accounts, grouped accounts, optional Hidden Accounts group).
- **What I don't want:** All trades being filtered out because ungrouped accounts are accidentally treated as hidden, or because timezone conversion relies on parsing non-ISO date strings.
- **How we fixed that:**
  - Updated hidden-account filtering so it only applies when the `Hidden Accounts` group actually exists.
  - Replaced timezone conversion that formatted `rawDate` into a non-ISO string (`yyyy-MM-dd HH:mm:ssXXX`) and re-parsed it with `Date(...)` (browser-dependent) with `toZonedTime(...)` from `date-fns-tz`.
- **Key Files:** `context/data-provider.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets` and confirm the donut charts (`Commissions PnL share`, `Trade Distribution`) and other charts render with real values when trades exist; validate in Safari as well.

### 2026-02-14: Widget Tab Empty-State (Prevent “Invisible Data” When Layout Is Empty)
- **What changed:** Added a clear empty-state UI to the Widgets tab when the dashboard layout has zero widgets, plus a loading skeleton while layout is still being fetched.
- **What I want:** If a user has trades but no widgets (or a fresh/empty layout), they should not see a blank screen; they should get a one-click way to restore the default widget layout and immediately see charts/stats.
- **What I don't want:** A blank Widgets view that looks like “no data” even though the underlying trade data is present.
- **How we fixed that:**
  - In `WidgetCanvas`, added:
    - a `!layouts` loading skeleton,
    - a `currentLayout.length === 0` panel with `Restore default layout` and `Edit` actions.
  - Added i18n strings for the new empty-state message in English and French.
- **Key Files:** `app/[locale]/dashboard/components/widget-canvas.tsx`, `locales/en.ts`, `locales/fr.ts`, `AGENTS.md`
- **Verification:** Remove all widgets (or start with an empty layout) -> open `/dashboard?tab=widgets` -> confirm the empty-state appears and `Restore default layout` repopulates widgets and makes data visible.

### 2026-02-14: Unified Master Prompt Consolidation
- **What changed:** Consolidated a fragmented, overlapping instruction set into a single coherent master prompt template.
- **What I want:** One copy-paste prompt that is consistent, reusable, and easy to run without conflicting directives.
- **What I don't want:** Repetitive or contradictory instruction blocks that dilute output quality and create execution ambiguity.
- **How we fixed that:**
  - Merged answering, self-reflection, persistence, planning, and code-editing guidance into one structured prompt.
  - Removed structural duplication while keeping core behavioral constraints and UX/engineering standards intact.
  - Preserved explicit format sections (`<request>`, `<instructions>`, `<constraints>`) for one-shot reuse.
- **Key Files:** `AGENTS.md`
- **Verification:** Review the generated unified prompt and confirm it contains all major rule groups in one contiguous block.

### 2026-02-14: Unified Prompt Refinement (Single-Block)
- **What changed:** Refined the merged prompt into an even cleaner single-block format that preserves all core rule groups while removing repeated phrasing.
- **What I want:** A copy-paste-ready prompt that stays strict, readable, and predictable in one place.
- **What I don't want:** Duplicated sections (`self_reflection`, repeated planning rules, repeated completion checks) that create ambiguity.
- **How we fixed that:**
  - Reorganized content into compact sections: core mandates, answering rules, execution behavior, problem-solving framework, and code-editing rules.
  - Kept user-specified structure markers (`<request>`, `<instructions>`, `<constraints>`) for immediate reuse.
  - Preserved intent while de-duplicating overlapping directives.
- **Key Files:** `AGENTS.md`
- **Verification:** Confirm the delivered prompt is one contiguous block and includes both answering + code-editing constraints.

### 2026-02-14: Prompt Rule Added - Always Read/Update AGENTS
- **What changed:** Added an explicit instruction to always read `AGENTS.md` at task start and update `AGENTS.md` at task completion.
- **What I want:** Guaranteed project-memory continuity so future agents retain context and avoid repeating mistakes.
- **What I don't want:** Silent changes with no engineering-log trace or agents working without current project guidance.
- **How we fixed that:**
  - Introduced a dedicated mandatory rule in the unified prompt under core instructions.
  - Kept wording direct so it can be reused as a non-optional workflow gate.
- **Key Files:** `AGENTS.md`
- **Verification:** Check the newest prompt version includes: "Always read AGENTS.md when starting work and update AGENTS.md when finishing work."

### 2026-02-14: Final Unified Master Prompt Delivery
- **What changed:** Delivered a final single-block master prompt that consolidates all user-provided directives into one reusable template.
- **What I want:** One authoritative prompt users can paste directly without missing rules or duplicated sections.
- **What I don't want:** Partial/fragmented prompt versions that omit required behaviors or create conflicting instructions.
- **How we fixed that:**
  - Re-read full thread requirements and merged all mandatory parts: answering rules, self-reflection, tool preambles, persistence, problem-solving flow, code editing standards, and output constraints.
  - Explicitly included the project-memory rule to always read and update `AGENTS.md`.
  - Preserved `<request>`, `<instructions>`, and `<constraints>` blocks for direct reuse.
- **Key Files:** `AGENTS.md`
- **Verification:** Confirm final delivered prompt is one contiguous block and includes all sections requested across the thread.

### 2026-02-14: Memory Protocol Added to Master Prompt
- **What changed:** Added a dedicated user-identification and memory-management protocol section to the master prompt.
- **What I want:** Consistent handling of identity assumptions, memory retrieval language, and memory updates across every interaction.
- **What I don't want:** Inconsistent memory behavior where key personal context or relationship data is missed between turns.
- **How we fixed that:**
  - Embedded a new required section covering user identification (`default_user`), memory retrieval phrasing, memory categories, and memory update logic.
  - Preserved the rest of the consolidated prompt structure unchanged to avoid regressions.
- **Key Files:** `AGENTS.md`
- **Verification:** Confirm the final master prompt includes the four-step memory protocol exactly as requested.

### 2026-02-14: Final All-Round Master Prompt (Thread Re-Read)
- **What changed:** Produced one final all-round master prompt after re-reading the entire thread and consolidating every required directive.
- **What I want:** A single authoritative prompt that is robust across coding, analysis, conversation, planning, and execution workflows.
- **What I don't want:** Additional revisions caused by missing rules, repeated blocks, or partial coverage of earlier thread requirements.
- **How we fixed that:**
  - Kept all mandatory rule groups: answering rules, self-reflection, AGENTS workflow, tool preambles, persistence, execution framework, code editing guidance, and memory protocol.
  - Maintained a strict but reusable structure with clear section tags and reusable request/constraint placeholders.
  - Ensured wording stays implementation-ready for direct copy-paste use.
- **Key Files:** `AGENTS.md`
- **Verification:** Confirm the delivered prompt contains all requested sections in one contiguous block with no missing required directives.

### 2026-02-14: Home Page Typography Rewrite
- **What changed:** Refined the Home page visual hierarchy and rewrote typography across Hero + deferred sections to use a single editorial type system.
- **What I want:** The home experience should feel premium and intentional, with clear contrast between display headlines, data labels, and body copy.
- **What I don't want:** Mixed typography patterns (inconsistent heading scales, mismatched label styles, and undefined font variables) that make the page feel stitched together.
- **How we fixed that:**
  - Introduced scoped typography variables at the home-page wrapper level (`--home-display`, `--home-copy`, `--home-mono`) in `HomeContent`.
  - Updated Hero, Analysis Demo, Why Choose Us, Comparison, AI Futures, Pricing, and CTA sections to share:
    - tighter display heading tracking/leading,
    - mono uppercase kicker/label styling,
    - consistent body copy sizing and rhythm,
    - unified CTA/button label letterspacing.
  - Removed direct `font-poppins` usage from active Home page sections in favor of the scoped home typography variables.
- **Key Files:** `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/CTA.tsx`, `AGENTS.md`
- **Verification:** Open `/` (home) -> confirm section titles share the same display style, labels are consistently mono uppercase, body copy has uniform rhythm, and CTA labels match the new typographic system.

### 2026-02-14: Engineering Log Restructure
- **What changed:** Updated `AGENTS.md` to enforce a strict, conversational log structure.
- **What I want:** Highly contextual documentation that explains the *why* and *how* of changes, not just the *what*.
- **What I don't want:** Generic "Updated X" logs that leave future agents guessing about intent or trade-offs.
- **How we fixed that:**
  - Defined a mandatory template based on "What I want" / "What I don't want" / "How we fixed that".
  - Refactored all previous valid entries (Smart Insights, Sidebar, etc.) to match this legacy-proof format.
- **Key Files:** `AGENTS.md`
- **Verification:** Read the file header; observe the new conversational format instructions.

### 2026-02-14: Smart Insights Widget
- **What changed:** Added a new "Smart Insights" widget to the dashboard.
- **What I want:** Provide users with actionable, AI-driven feedback (e.g., risk warnings, opportunities) instead of just raw data charts.
- **What I don't want:** A static, boring widget that just lists numbers without context or intelligence.
- **How we fixed that:** 
  - Created a dedicated Server Action (`get-smart-insights.ts`) to simulate AI analysis of trading patterns.
  - Built a modern, glassmorphic UI (`smart-insights-widget.tsx`) that dynamically renders alerts and recommendations based on confidence scores.
- **Key Files:** `app/[locale]/dashboard/actions/get-smart-insights.ts`, `components/widgets/smart-insights-widget.tsx`
- **Verification:** Enter dashboard edit mode -> Add "Smart Insights" -> Confirm insights load with correct risk/opportunity styling.

### 2026-02-14: Sidebar Modernization
- **What changed:** Completely replaced the old dashboard sidebar with a new `shadcn/ui` version.
- **What I want:** A collapsible, responsive, and aesthetically premium sidebar that matches the new landing page design.
- **What I don't want:** The clunky, rigid legacy sidebar that had poor mobile support and didn't fit the "monochrome" theme.
- **How we fixed that:**
  - Implemented the `sidebar-07` pattern using the `SidebarProvider` context for smooth state management.
  - Refactored navigation into logical groups (Trading, Analytics, System) and added keyboard shortcuts (`Cmd+B`).
  - Proactively updated Teams layouts to ensure the new sidebar works everywhere, not just on the main dashboard.
- **Key Files:** `components/sidebar/dashboard-sidebar.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/ui/sidebar.tsx`
- **Verification:** Press `Cmd+B` to toggle sidebar; Resize to mobile width to verify Sheet/Hamburger menu behavior.

### 2026-02-14: Dashboard Navigation Recovery
- **What changed:** Restored the legacy `Navbar` component to the dashboard layout.
- **What I want:** To keep the "Edit Layout" and "Lock Grid" controls accessible to users.
- **What I don't want:** Losing critical functionality because the new sidebar implementation accidentally removed the header where these controls lived.
- **How we fixed that:**
  - Re-imported and integrated the legacy `Navbar` into `app/[locale]/dashboard/layout.tsx` so it sits alongside the new sidebar, restoring full layout management capabilities.
- **Key Files:** `app/[locale]/dashboard/layout.tsx`, `app/[locale]/dashboard/components/dashboard-header.tsx`
- **Verification:** Navigate to `/dashboard` -> Verify top header contains "Edit Layout" and "Global Sync" buttons.

### 2026-02-13: Trader Profile Metrics Overhaul
- **What changed:** Redesigned the Trader Profile metrics panel to focus on Profit/Withdrawals instead of redundant win rates.
- **What I want:** A clear, financial summary of a trader's success (Total Profit + Total Withdrawals) that is instantly readable.
- **What I don't want:** Confusing duplicate stats (Win Rate shown 3 times) or mixing up "unrealized" gains with actual paid-out profits.
- **How we fixed that:**
  - Removed the red-marked `Win Rate` and `Expectancy` cards from the quick-view row.
  - Calculated `Total Profit` from aggregated account trading profit (`account.metrics.totalProfit`) across all accounts.
  - Split `Total Withdraw` into its own distinct metric (counting only `PAID` status) to separate realized withdrawals from trading profit.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`
- **Verification:** Check Trader Profile -> Ensure "Total Profit" and "Total Withdraw" are displayed distinctly in the right panel.

### 2026-02-13: Trader Profile UI Polish
- **What changed:** Refined spacing and added a `shadcn` Avatar to the profile header; removed duplicate navigation.
- **What I want:** A clean, professional profile header that feels spacious and properly aligned.
- **What I don't want:** Double navigation bars eating up vertical space or awkward gaps around the user avatar.
- **How we fixed that:**
  - Removed the duplicate secondary top nav spacing element.
  - Implemented the standard `shadcn` `Avatar` component for consistent sizing and fallback handling.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`

### 2026-02-14: Trader Profile Header Re-Arrangement
- **What changed:** Re-arranged the user header to a social-style layout with a larger avatar, stronger name hierarchy, and compact badge row.
- **What I want:** The profile top area should visually match a creator-style identity block while still using only existing account/trade data.
- **What I don't want:** A flat header where name/avatar feel disconnected and badges look scattered or data is duplicated without purpose.
- **How we fixed that:**
  - Switched to left-aligned large avatar + stacked name/subtitle.
  - Added structured badges using existing metrics only (`Trader Profile`, `Total Trades`, `Withdraw`).
  - Kept downstream cards intact so no analytics data was removed.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and confirm avatar/name/badge block appears in one compact row with improved visual hierarchy.

### 2026-02-14: Trader Profile Right Panel Component Match
- **What changed:** Rebuilt the right-side stats stack to mirror the requested component structure (radar, avg cards, win-rate card, total-trades card with badge, break-even/sum-gain, footer button).
- **What I want:** Right column should match the reference component order and composition 1:1 while keeping the existing app theme intact.
- **What I don't want:** A redesigned look, missing cards, or mixed metric groups that diverge from the provided reference layout.
- **How we fixed that:**
  - Replaced Profit/Withdraw summary block with `Avg. Win`, `Avg. Loss`, and `Avg. Return` block.
  - Added dedicated `Win Rate` card with dual progress bars.
  - Added `Total Trades` card with `Serial Trader` badge and split progress bars.
  - Preserved existing `Break Even Rate` + `Sum Gain` card and added `Show All Stats` footer action.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and verify the right panel card order/structure matches the screenshot component-by-component.

### 2026-02-14: Trader Profile Capital + Payout Metrics Swap
- **What changed:** Replaced the top right-panel pair from `Avg. Win` / `Avg. Loss` to `Total Capital` / `Total Payouts`.
- **What I want:** Those two headline stats should reflect real account-level user data (capital and payouts), including compact values like `100k` when users have multiple accounts.
- **What I don't want:** Percentage-style averages in that slot when the user expects account aggregates.
- **How we fixed that:**
  - Updated `totalCapitalAllAccounts` to equity-style aggregation across all accounts: `startingBalance + metrics.totalProfit - paidWithdraw`.
  - Added `totalWithdrawAllAccounts` as sum of payout amounts with `PAID` status across all user accounts.
  - Rendered both values with compact `k/m` formatting for quick readability.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and confirm first right-side two stats now show `Total Capital` and `Total Withdraw` based on real user account data.

### 2026-02-14: Trader Profile Win-Rate Guide + Trade Calendar
- **What changed:** Tuned the secondary win-rate guide line away from 50/50 look and added a trade calendar card above `Trade Feed`.
- **What I want:** Right-side progress guidance should visually sit around a 25–30% band, and the left panel should show a calendar with user trade-day context before feed rows.
- **What I don't want:** Equal-looking split bars that imply 50/50 when not intended, or no date context before reading raw trade list items.
- **How we fixed that:**
  - Added `winRateGuidePercent` clamped to `25..30` and wired it to the second line in the Win Rate card.
  - Inserted a `Trade Calendar` card above `Trade Feed` using `shadcn` `Calendar`.
  - Mapped user `formattedTrades` into unique calendar days and highlighted them via `modifiers` (`traded`).
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and confirm the second Win Rate guide line stays in ~25–30% range and a trade-highlight calendar appears above Trade Feed.

### 2026-02-14: Trader Profile Date Filtering (Preset + Custom)
- **What changed:** Added a shadcn-based date filter system on Trader Profile with presets and custom calendar range selection.
- **What I want:** Users should be able to switch metrics/feed context quickly between `Last Week`, `Last Month`, `Last 3 Months`, `Last 6 Months`, `Last Year`, and a custom range.
- **What I don't want:** Static all-time metrics that cannot be sliced by period, or custom date selection without a proper calendar UX.
- **How we fixed that:**
  - Added `Select` presets for the requested time windows plus `Custom`.
  - Added `Popover` + `Calendar` (range mode) for custom date range selection.
  - Introduced `filteredTrades` and wired all trade-driven sections to it (`metrics`, `recentTrades`, and trade-calendar highlights).
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** On Trader Profile, switch each preset and confirm cards/feed update; select a custom range and confirm the same sections update immediately.

### 2026-02-14: Trader Profile Full Filter Binding + Standalone PnL Calendar
- **What changed:** Extended date filter coverage to capital/withdraw metrics and converted calendar block into a standalone PnL calendar.
- **What I want:** All visible Trader Profile data should respond to the selected date filter, and the calendar should show day-level PnL context (not only marked trade presence).
- **What I don't want:** Mixed behavior where some cards ignore the selected range or calendar acts as a passive date marker without PnL meaning.
- **How we fixed that:**
  - Applied active date range to `Total Withdraw` by filtering payout dates (`PAID`) within the selected range.
  - Updated `Total Capital` to use filtered period math: opening capital + filtered trade net PnL - filtered paid withdraw.
  - Added daily PnL map for filtered trades and calendar modifiers for positive/negative day coloring.
  - Added selected-day PnL readout under the calendar and bound calendar selection state.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Change date preset/custom range and confirm all cards update; in calendar, click a date and verify selected-day PnL value updates with positive/negative styling.

### 2026-02-14: Trader Profile PnL Calendar Redesign (Day-Cell PnL)
- **What changed:** Redesigned the Trader Profile PnL calendar to render compact per-day PnL values inside each day cell, added a legend, and stabilized selection behavior when the date filter changes.
- **What I want:** The calendar should visually behave like a true PnL calendar (scanable day-by-day), not just a colored grid, and it should always remain consistent with the selected date filter.
- **What I don't want:** Losing the default shadcn calendar chevrons when customizing day rendering, or a selected date that becomes invalid/out-of-range after changing presets.
- **How we fixed that:**
  - Updated the shared shadcn `Calendar` wrapper to merge caller-provided `components` with the default `Chevron` renderer (instead of overwriting it).
  - Added a custom `DayContent` renderer on Trader Profile to show a signed compact PnL label for trade days (and nothing for no-trade days) while preserving selection states.
  - Added a small legend row (Profit/Loss/No trades) and extended the selected-day row to show the selected date label plus PnL.
  - Added an effect guard to auto-reset selection to the latest in-range trade day when the active date filter changes.
- **Key Files:** `components/ui/calendar.tsx`, `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile, switch date presets and custom ranges, and confirm: day cells show signed PnL for trade days, legend appears, and selected-day readout stays in-range after filter changes.

### 2026-02-14: Trader Profile Layout Refinement (Filter Above PnL + Closed Trade Pagination)
- **What changed:** Refined Trader Profile layout so the date filter sits directly above the PnL calendar and upgraded Trade Feed to closed-trades-only with 5 items per page using shadcn pagination controls.
- **What I want:** Filtering controls should be visually attached to the calendar they drive, and Trade Feed should stay clean/readable by showing a small paged slice of closed trades.
- **What I don't want:** A detached top-level filter block that feels disconnected from the calendar, or a long unpaginated feed that overwhelms the profile view.
- **How we fixed that:**
  - Removed the standalone top Date Filter card and embedded the full filter toolbar (preset select + custom range popover calendar) inside the PnL Calendar card header area.
  - Added `closedTrades` derivation from filtered trades using valid `closeDate`, then paginated at `5` items per page.
  - Switched Trade Feed rows to render close timestamp context and added shadcn `Pagination` with `Previous` / `Next` and current-page indicator.
  - Added feed page reset behavior whenever date filter/range changes so pagination stays valid.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and confirm Date Filter appears directly above PnL calendar; Trade Feed shows only closed trades, 5 rows max per page, and pagination updates results correctly across date presets/custom range.

### 2026-02-14: Trader Profile Gap + Visual Rhythm Refinement
- **What changed:** Tightened spacing and card rhythm across Trader Profile to remove excess visual gaps and create a cleaner, more consistent shadcn-style surface.
- **What I want:** The page should feel compact and premium with balanced spacing between sections/cards, without changing the existing data behavior.
- **What I don't want:** Uneven blank space between major blocks, oversized paddings that make the profile feel stretched, or mismatched left/right column rhythm.
- **How we fixed that:**
  - Reduced outer page padding and centered the content in a max-width container for better desktop balance.
  - Normalized section/card spacing (`gap` + `space-y`) across both columns and tightened inner card paddings.
  - Refined header block density (avatar/name/badge row + KPI tiles) and tightened Trade Feed row vertical spacing.
  - Kept all metric logic and filter behavior intact while improving pure layout cadence.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Open Trader Profile and confirm reduced empty gaps, tighter but readable card spacing, and consistent left/right visual rhythm across desktop/mobile.

### 2026-02-14: Trader Profile Real-Time + Cache Isolation Hardening
- **What changed:** Hardened benchmark data fetching to prevent stale/shared-cache behavior and improve real-time freshness.
- **What I want:** Trader Profile metrics should stay fresh and user-scoped behavior should never be affected by cross-session caching artifacts.
- **What I don't want:** Browser/CDN cache accidentally serving old benchmark payloads or delayed updates that feel non-realtime.
- **How we fixed that:**
  - Marked benchmark API route as fully dynamic (`force-dynamic`) with `revalidate = 0`.
  - Added `Cache-Control: no-store` headers on benchmark responses.
  - Updated client fetch to `cache: "no-store"` and added periodic refresh every 30 seconds.
- **Key Files:** `app/api/trader-profile/benchmark/route.ts`, `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Lint passes for edited files; benchmark route and client fetch now explicitly disable caching and auto-refresh.

### 2026-02-14: Trader Profile Audit Pass
- **What changed:** Audited Trader Profile metric logic and removed stale internal fields from the page model.
- **What I want:** Clear metric semantics with minimal technical debt so future agents can safely iterate.
- **What I don't want:** Silent confusion where `Total Profit` is interpreted as payouts, or extra unused fields lingering in the metrics object.
- **How we fixed that:**
  - Confirmed metric intent in code: `Total Profit` = trading profit across accounts, `Total Withdraw` = sum of `PAID` withdrawals.
  - Removed unused fields (`avgWin`, `avgLoss`, `expectancy`) from the `TraderMetrics` return type/object in `trader-profile/page.tsx`.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Lint `app/[locale]/dashboard/trader-profile/page.tsx` passes and Trader Profile shows distinct Profit vs Withdraw values.

### 2026-02-14: Dashboard Editor Polish
- **What changed:** Re-added "Restore Defaults" and "Remove All" buttons to the widget editor toolbar.
- **What I want:** Give users an easy way to reset their dashboard if they make a mess or want to start fresh.
- **What I don't want:** Users getting stuck with a broken layout and having no "nuclear option" to fix it.
- **How we fixed that:**
  - Audit of the widget editor component revealed missing button handlers.
  - Re-implemented the standard `RestoreDefaults` and `RemoveAll` actions in the editor navigation bar.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/navbar.tsx`

### 2026-02-13: PnL Visual Logic
- **What changed:** Updated the trade table PnL styling to use emerald green for profits and muted colors for losses.
- **What I want:** A table that draws the eye to wins (positive reinforcement) while keeping losses readable but not screamingly red.
- **What I don't want:** A "Christmas tree" effect where everything is neon, or a depressing dashboard filled with bright red negative numbers.
- **How we fixed that:**
  - Applied the `text-emerald-500` class conditionally only to positive PnL values.
  - Kept negative values in the standard monochrome/muted palette to align with the new design system.
- **Key Files:** `components/ui/data-table/columns.tsx`

### 2026-02-13: VaR Codepath Trace
- **What changed:** Located and mapped all Value at Risk (VaR) implementation touchpoints across logic, action, UI, and tests.
- **What I want:** Future agents (and users) should find VaR calculation and rendering code immediately without hunting through unrelated files.
- **What I don't want:** Repeated time loss from searching broad terms and missing the core analytics file.
- **How we fixed that:**
  - Identified core VaR engine functions in `lib/analytics/var.ts` (`computeHistoricalVar`, `computeParametricVar`, `computeVarSummary`).
  - Confirmed server action usage in `app/[locale]/teams/actions/user.ts` via `getTraderVarSummary`.
  - Confirmed UI rendering in `app/[locale]/teams/components/trader-info.tsx` for Hist/Param VaR at 95%/99%.
  - Confirmed test coverage in `tests/var.test.ts` and `tests/trader-var-action.test.ts`.
- **Key Files:** `lib/analytics/var.ts`, `app/[locale]/teams/actions/user.ts`, `app/[locale]/teams/components/trader-info.tsx`, `tests/var.test.ts`, `tests/trader-var-action.test.ts`
- **Verification:** Run `rg -n "Value at Risk|VaR|computeVarSummary|getTraderVarSummary" .` and verify matches in the files above.

### 2026-02-13: VaR Runtime Usage Clarification
- **What changed:** Traced where VaR is actually used in live app flow (not just defined/tested).
- **What I want:** Make it obvious which route renders VaR to end users.
- **What I don't want:** Confusion between helper/test references and real runtime usage.
- **How we fixed that:**
  - Verified `getTraderVarSummary` is called inside `TraderInfo`.
  - Verified `TraderInfo` is rendered by the trader detail page route.
- **Key Files:** `app/[locale]/teams/actions/user.ts`, `app/[locale]/teams/components/trader-info.tsx`, `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`
- **Verification:** Open `/teams/dashboard/trader/[slug]` and confirm the "1-Day Value at Risk" section appears.

### 2026-02-14: Build Repair - Trader Profile Type
- **What changed:** Added explicit `string` types to map callbacks in `TraderProfile`.
- **What I want:** Resolve `Parameter "value" implicitly has an "any" type` errors blocking the build.
- **What I don't want:** TypeScript strict mode failures in the production pipeline.
- **How we fixed that:**
  - Added `: string` annotation to arguments in the `profileInitials` calculation logic.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`
- **Verification:** Run `npm run build` locally.

### 2026-02-14: Build Repair - Lazy Widget Registration
- **What changed:** Manually registered `smartInsights` and `propFirmCatalogue` in `lazy-widget.tsx`.
- **What I want:** To pass the production build type-check for the dashboard's lazy loader.
- **What I don't want:** Build faillures because the `widgetLoaders` map is missing keys defined in the `WidgetType` union.
- **How we fixed that:**
  - Added dynamic imports for the missing widgets in `app/[locale]/dashboard/components/lazy-widget.tsx`.
  - Used named export resolution for `SmartInsightsWidget` since it's not a default export.
- **Key Files:** `app/[locale]/dashboard/components/lazy-widget.tsx`
- **Verification:** Run `npm run build` locally to confirm the type error is resolved.

### 2026-02-14: Navigation System Unification
- **What changed:** Unified the sidebar across Dashboard and Teams using the `UnifiedSidebar` component; streamlined the `DashboardHeader` to prevent double-navigation visuals.
- **What I want:** A single, cohesive navigation experience with consistent header heights, clear collapse buttons, and smooth global animations.
- **What I don't want:** Multiple sidebar implementations, stacked/wrapping navigation headers, and missing mobile-to-desktop parity for sidebar controls.
- **How we fixed that:**
  - Migrated `DashboardSidebar` to use the same logic and component as `TeamsSidebar`.
  - Added a persistent collapse button (`ChevronsLeft/Right`) to the sidebar and a `SidebarTrigger` to the desktop header.
  - Standardized all top-level headers to `h-14` with a synchronized border-bottom line.
  - Added a global CSS layer for smooth transitions on background and interactive color changes.
- **Key Files:** `components/sidebar/dashboard-sidebar.tsx`, `components/ui/unified-sidebar.tsx`, `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/globals.css`.
- **Verification:** Verify the sidebar collapses and expands correctly on both desktop and mobile; check that the top line of the sidebar and main content aligns perfectly at the same height.

### 2026-02-14: Sidebar Collapse De-duplication + Theme Blend
- **What changed:** Removed duplicate sidebar collapse controls in Dashboard and unified sidebar color tokens with the monochrome design system.
- **What I want:** One clear collapse control at desktop (inside the sidebar) and sidebar surfaces that visually blend with the app’s unified black/neutral palette.
- **What I don't want:** Two collapse buttons visible at once or mismatched sidebar tones (light/default shadcn colors) that break visual consistency.
- **How we fixed that:**
  - Limited `SidebarTrigger` in `DashboardHeader` to mobile only (`md:hidden`) so desktop keeps a single collapse button in `UnifiedSidebar`.
  - Replaced legacy shadcn sidebar token values (`--sidebar*`) in `app/globals.css` with monochrome tokens aligned to existing project theme values.
  - Applied the same sidebar token set for both `:root` and `.dark` to prevent theme drift and keep the sidebar consistent.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/globals.css`, `AGENTS.md`
- **Verification:** Open `/dashboard` on desktop and confirm only one collapse button is shown; switch between routes/themes and confirm sidebar background, borders, and hover accents stay in the unified monochrome scheme.

- **Status:** All requested UI fixes (Sidebar alignment, Collapse button, Color unification) are deployed.
- **Next Steps:** Monitor for any layout regressions on extreme screen sizes (1024px-1280px range).
- **What changed:** Removed `@import "tw-animate-css";` from `globals.css`.
- **What I want:** A clean CSS build without missing dependency errors.
- **What I don't want:** The Vercel build crashing because it can't resolve a CSS package that isn't in `package.json`.
- **How we fixed that:**
  - Identified the build error: `Can't resolve 'tw-animate-css'`.
  - Removed the invalid import line as the package was not actually installed/used.
- **Key Files:** `app/globals.css`
- **Verification:** Run `npm run build` locally.

## 🛠️ Build & Type Safety
- **2026-02-14: Codebase Cleanup and Quality Pass.**
  - Removed 8+ redundant root files (`COMBINED_DOCUMENTATION.md`, `IMPORT_FIX_SUMMARY.md`, etc.).
  - Organized documentation by moving essential guides to `/docs`.
  - Deleted unused UI component `context-menu.tsx`.
  - Fixed 1300+ lint warnings primarily related to unused variables in Zustand stores.
  - Enhanced type safety in `trades-store.ts` and test files by reducing `any` usage.
- **2026-02-13: Vercel Build Fix.** 
  - Resolved i18n tooltip typing issues in commissions charts that were causing production build failures.
- **2026-02-13: Mobile Responsiveness.**
  - Optimized navbar triggers and filter groups for mobile screens to prevent layout overflow in `app/[locale]/dashboard/components/navbar.tsx`.

## 📌 Maintenance Notes for Agents
- **i18n:** Always use the `t` function with proper casting (e.g., `t as any`) in widget components to avoid complex translation object type errors until the schema is fully unified.
- **Tailwind:** This project uses Tailwind CSS v4 features. If you see `@config` or `@plugin` errors in the IDE, they are likely false positives from an older linter.
- **Zustand stores:** When creating or updating stores, avoid unused parameters (like `get` in the create callback) and use `unknown` or specific types instead of `any` for persisted state migrations.

### 2026-02-14: Vercel Log Export Audit + Normalization
- **What changed:** Audited the exported Vercel log JSON and produced a cleaned, deduplicated version with consistent numeric/null typing.
- **What I want:** A log file that can be safely consumed by analytics/ETL tooling without schema drift or parser failures.
- **What I don't want:** Mixed field types (`number` vs empty string) and duplicate entries causing ingestion errors or skewed metrics.
- **How we fixed that:**
  - Validated source JSON integrity and record count.
  - Removed one exact duplicate record (503 -> 502).
  - Normalized `maxMemoryUsed`, `memorySize`, and `concurrency` from empty strings to `null` while preserving numeric values.
  - Kept original export unchanged and wrote a fixed artifact for downstream use.
- **Key Files:** `final-qunt-edge-log-export-2026-02-13T18-57-08.fixed.json`, `AGENTS.md`
- **Verification:** `jq` confirms 502 records, 0 exact duplicates, and no non-number/non-null values for normalized fields.

### 2026-02-14: Mobile-Only UX + Performance Optimization Pass
- **What changed:** Reworked high-traffic home/landing and dashboard surfaces for a phone-first experience with lighter rendering and tighter touch ergonomics, while intentionally leaving desktop behavior secondary.
- **What I want:** Fast first paint and smooth interaction on mobile: smaller visual overhead, easier tap targets, compact headers, and less expensive animation work on constrained devices.
- **What I don't want:** Mobile users downloading/rendering heavy chart and background effects upfront, cramped header actions, or layout shifts from desktop-oriented spacing and controls.
- **How we fixed that:**
  - Split the Home analysis chart into a lazily loaded component (`analysis-demo-chart.tsx`) and replaced mobile with lightweight KPI cards instead of immediate Recharts rendering.
  - Reduced mobile hero/marketing overhead by simplifying fixed grid/orb effects, trimming motion usage, and tightening mobile CTA/text rhythm.
  - Optimized dashboard mobile rendering by removing animated mesh/texture background layers on phone breakpoints and using simpler gradients for the same visual direction.
  - Refined dashboard mobile header ergonomics with larger touch trigger sizing, compact action grouping, mobile-safe filtering presentation, and less non-essential control noise.
  - Improved sidebar sheet behavior on mobile with narrower width constraints and larger trigger hit area.
  - Added CSS mobile performance guardrails to disable expensive decorative animations and reduce blur/shadow cost on small screens.
- **Key Files:** `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/(home)/components/analysis-demo-chart.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(landing)/components/navbar.tsx`, `app/[locale]/(landing)/components/marketing-layout-shell.tsx`, `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/layout.tsx`, `app/[locale]/dashboard/page.tsx`, `components/ui/sidebar.tsx`, `app/globals.css`, `AGENTS.md`
- **Verification:** Ran ESLint against all edited TSX files with no errors; confirmed mobile-specific CSS/perf changes compile cleanly (CSS file is intentionally outside ESLint config and reports one ignore warning).

### 2026-02-14: Mobile Dashboard Clarity + NaN Guard Fix
- **What changed:** Fixed broken mobile stat chips (`NaN%`) and reduced stacked visual density in the dashboard mobile header/action row.
- **What I want:** Mobile dashboard should read clearly at a glance with stable percentages, valid empty-state copy, and less layered/chunky top navigation styling.
- **What I don't want:** Raw translation keys (`widgets.emptyState`), `NaN%` badges, or cramped header wrappers that feel stacked and hard to parse on phone screens.
- **How we fixed that:**
  - Added explicit `widgets.emptyState` translations in English/French locale dictionaries.
  - Added safe percentage guards (zero/invalid denominator handling) in trade-performance, long/short, and statistics widget calculations.
  - Added finite-number guards for summary and profit-factor outputs to prevent `NaN` rendering.
  - Simplified mobile dashboard header styling by reducing nested chrome/wrappers and keeping controls visually lighter.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/pnl-summary.tsx`, `app/[locale]/dashboard/components/statistics/trade-performance-card.tsx`, `app/[locale]/dashboard/components/statistics/long-short-card.tsx`, `app/[locale]/dashboard/components/statistics/statistics-widget.tsx`, `app/[locale]/dashboard/components/statistics/profit-factor-card.tsx`, `locales/en.ts`, `locales/fr.ts`, `AGENTS.md`
- **Verification:** Ran ESLint on all edited dashboard/locale files; no errors (remaining warnings are pre-existing in `statistics-widget.tsx` and unrelated to this regression fix).

### 2026-02-14: Mobile Clarity Hardening (Charts + Widget Density)
- **What changed:** Extended the NaN-safe mobile cleanup across additional dashboard chart tooltips and tightened mobile widget vertical density to reduce the “stacked card” look.
- **What I want:** No percentage tooltip should ever show `NaN%`, and mobile dashboard cards should feel more compact and readable when data is sparse.
- **What I don't want:** Hidden remaining divide-by-zero paths in chart tooltips, oversized empty mobile widgets, or unstable numeric rendering from non-finite metric inputs.
- **How we fixed that:**
  - Added guarded win-rate formatters for `pnl-by-side`, `pnl-per-contract`, and `pnl-per-contract-daily` tooltip displays.
  - Hardened `trade-distribution` percentage math with safe denominator checks.
  - Added non-finite numeric guards in `risk-metrics-widget` and `pnl-summary`, plus robust stat sanitization in `cumulative-pnl-card`.
  - Protected `daily-summary-modal` and calendar distribution percentage math against zero/invalid totals.
  - Reduced mobile widget stacking pressure by tuning mobile grid sizing (`medium` and `large`) and lowering mobile row height in `widget-canvas`.
- **Key Files:** `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`, `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`, `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`, `app/[locale]/dashboard/components/charts/trade-distribution.tsx`, `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`, `app/[locale]/dashboard/components/pnl-summary.tsx`, `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`, `app/[locale]/dashboard/components/daily-summary-modal.tsx`, `app/[locale]/dashboard/components/calendar/charts.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `AGENTS.md`
- **Verification:** ESLint run on all touched files completed with 0 errors (warnings are pre-existing project debt); production build reached compile/type/static generation stages successfully before failing at final trace collection due environment memory exhaustion (OOM), not type/runtime code errors.

### 2026-02-14: Vercel Build Fix - Prop Firms Translator Type Simplification
- **What changed:** Replaced an overly complex inferred translator type in the Prop Firms landing page with a minimal callable translator signature.
- **What I want:** Keep i18n typing safe enough for page usage while ensuring TypeScript can complete production builds on Vercel.
- **What I don't want:** Build failures from `Expression produces a union type that is too complex to represent` caused by deep inference from `Awaited<ReturnType<typeof getI18n>>`.
- **How we fixed that:**
  - Updated `Translator` in `app/[locale]/(landing)/propfirms/page.tsx` to a lightweight function type: `(key: string, params?: Record<string, unknown>) => string`.
  - Kept all call sites unchanged (`t('key')` and `t('key', { ... })`) to preserve runtime behavior.
- **Key Files:** `app/[locale]/(landing)/propfirms/page.tsx`, `AGENTS.md`
- **Verification:** Run `npm run build` and confirm the prior type error at line 13 in the Prop Firms page no longer appears.

### 2026-02-14: Build Fix - Trader Profile Duplicate Variable Removal
- **What changed:** Removed a duplicate `totalWithdrawAllAccounts` declaration in Trader Profile.
- **What I want:** Keep strict TypeScript checks passing so production builds are not blocked by local symbol redeclaration.
- **What I don't want:** `TS2451: Cannot redeclare block-scoped variable` failures that stop `next build` during type-check.
- **How we fixed that:**
  - Deleted the repeated `useMemo` block and kept a single source of truth for paid-withdraw aggregation.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Run `npx tsc --noEmit --pretty false` and confirm zero errors.

### 2026-02-14: Pricing Strategy Audit (Project-Wide Capability Mapping)
- **What changed:** Audited implemented product capabilities and current billing surfaces to define a coherent Free/Paid pricing architecture aligned with existing code.
- **What I want:** A pricing model that matches real feature depth (AI workflows, multi-platform imports, team analytics, embeds/sharing) and removes conflicting plan narratives across Home and Billing.
- **What I don't want:** Inconsistent tier messaging (`Basic/Plus` vs `Starter/Pro AI/Desk`) or pricing that over-promises features not enforced by entitlement logic.
- **How we fixed that:**
  - Reviewed billing and checkout flow (`/api/whop/checkout`, `components/pricing-plans.tsx`, `server/billing.ts`) to confirm live intervals and lookup-key behavior.
  - Mapped actual product scope from dashboard, import platform config, team modules, AI routes, and share/embed surfaces.
  - Identified plan-surface drift: Home page presents 3 tiers while Billing currently sells 2 tiers + lifetime.
  - Produced a unified recommendation: `Free -> Pro -> Desk` (with optional lifetime upsell), plus account/history/AI/team/export/embedding limits that can be instrumented via existing `UsageMetric` and `AiRequestLog` models.
- **Key Files:** `components/pricing-plans.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `locales/en/pricing.ts`, `server/billing.ts`, `server/payment-service.ts`, `server/subscription-manager.ts`, `app/api/whop/checkout/route.ts`, `app/api/whop/checkout-team/route.ts`, `prisma/schema.prisma`, `AGENTS.md`
- **Verification:** Cross-check proposed tiers against implemented capabilities/routes and ensure pricing copy is consistent across Home + Billing before rollout.

### 2026-02-14: Referral Page Redesign + Whop Affiliate Link Integration
- **What changed:** Redesigned the referral landing page with a conversion-focused hero, added the Whop affiliate link, and surfaced a clear “Get Earn Up To 30% Commission” message in both the referral page and referral popover.
- **What I want:** Users should instantly understand the affiliate value proposition and have a direct path to join the affiliate program.
- **What I don't want:** A generic referral page without a strong CTA, or users needing extra steps to find where to apply for affiliate commissions.
- **How we fixed that:**
  - Added a new referral hero block with stronger hierarchy, CTA button, and direct affiliate URL display in `app/[locale]/(landing)/referral/page.tsx`.
  - Integrated the affiliate link `https://whop.com/quantedge-solutions/affiliates` as the primary outbound CTA.
  - Added a compact affiliate CTA card inside `components/referral-button.tsx` so users can access the same flow from the in-app popover.
  - Extended referral locale copy in both English and French with new hero/CTA translation keys.
- **Key Files:** `app/[locale]/(landing)/referral/page.tsx`, `components/referral-button.tsx`, `locales/en/referral.ts`, `locales/fr/referral.ts`, `AGENTS.md`
- **Verification:** Run `npx eslint app/[locale]/(landing)/referral/page.tsx components/referral-button.tsx locales/en/referral.ts locales/fr/referral.ts` and confirm no errors (one pre-existing warning remains: unused `getProgressPercentage` in `components/referral-button.tsx`).

### 2026-02-14: Authentication Security Audit (Findings Only)
- **What changed:** Completed a targeted audit of authentication and authorization flows across middleware, callback redirects, and identity resolution helpers.
- **What I want:** A clear, severity-ranked list of concrete auth risks with file/line evidence to prioritize remediation.
- **What I don't want:** Hidden auth regressions (header trust, redirect abuse, and identity bootstrap side effects) that go undocumented and resurface later.
- **How we fixed that:**
  - Audited core auth boundaries in `server/auth.ts`, `proxy.ts`, `app/api/auth/callback/route.ts`, and API routes consuming `getDatabaseUserId`.
  - Confirmed exploitable issues: trust of client-supplied identity headers, weak callback redirect normalization, and redirect host construction from forwarded headers.
  - Prepared a severity-ordered report with affected paths and practical exploit implications.
- **Key Files:** `server/auth.ts`, `proxy.ts`, `app/api/auth/callback/route.ts`, `app/api/referral/route.ts`, `AGENTS.md`
- **Verification:** Re-read all cited code paths with line numbers and validated each finding against current control flow before publishing the audit.

### 2026-02-14: Authentication Hardening Fixes (Header Trust + Redirect Safety)
- **What changed:** Implemented direct fixes for the authentication audit findings in identity resolution, callback redirects, and auth-cookie handling.
- **What I want:** Ensure authenticated identity is derived from verified Supabase session state, prevent callback redirect abuse, and keep session cookies protected from client-side script access.
- **What I don't want:** Trusting caller-controlled headers for user identity, protocol-relative/host-poisoned post-auth redirects, or weakened cookie flags that amplify XSS impact.
- **How we fixed that:**
  - Reworked identity helpers in `server/auth.ts` to require a live Supabase-authenticated user for `getUserId`, `getDatabaseUserId`, and `getUserEmail` (removed `x-user-id`/`x-user-email` trust path).
  - Hardened `app/api/auth/callback/route.ts` by rejecting absolute/protocol-relative `next` values, normalizing to single-slash internal paths, and redirecting via canonical `getWebsiteURL()` base instead of `x-forwarded-host`.
  - Updated `proxy.ts` cookie writes to preserve Supabase options while defaulting `httpOnly` to `true` and keeping secure production behavior.
- **Key Files:** `server/auth.ts`, `app/api/auth/callback/route.ts`, `proxy.ts`, `AGENTS.md`
- **Verification:** Ran `npx eslint server/auth.ts app/api/auth/callback/route.ts proxy.ts` (0 errors). `npx tsc --noEmit` currently fails due existing project config include for missing `.next/types/cache-life.d.ts`.

### 2026-02-14: Frontend + Backend Audit (Findings Only)
- **What changed:** Completed a full-stack audit pass with static verification (`lint`, `typecheck`, tests) and targeted code review over auth, middleware, account mutation, and landing/community frontend paths.
- **What I want:** A severity-ranked, file-referenced issue list that clearly separates blocking defects from hygiene warnings so fixes can be prioritized quickly.
- **What I don't want:** Another broad warning dump without concrete impact analysis, or hidden regressions in security and build safety.
- **How we fixed that:**
  - Ran `npm run lint` and captured warning-heavy frontend/backend hotspots.
  - Ran `npm run typecheck` and confirmed one build-blocking TypeScript error in account setup payload handling.
  - Ran `npm test` and confirmed the current test suite passes (20 files passed, 1 skipped).
  - Re-read high-risk auth/session files (`proxy.ts`, `app/api/auth/callback/route.ts`, `server/auth.ts`) and surfaced concrete security issues with line-level evidence.
  - Flagged additional frontend/backend correctness and maintainability issues from lint + direct file inspection.
- **Key Files:** `proxy.ts`, `app/api/auth/callback/route.ts`, `server/accounts.ts`, `app/[locale]/(landing)/community/post/[id]/page.tsx`, `app/[locale]/(authentication)/components/user-auth-form.tsx`, `AGENTS.md`
- **Verification:** `npm run lint` (0 errors, 1419 warnings), `npm run typecheck` (fails with `server/accounts.ts(215,5)`), `npm test` (passes: 20 files, 88 tests; 1 file skipped).

### 2026-02-14: Frontend + Backend Audit Remediation Pass
- **What changed:** Implemented direct fixes for the concrete audit findings and re-ran full verification.
- **What I want:** Eliminate blocking security/type/runtime issues while keeping behavior stable and measurable.
- **What I don't want:** Leaving known high-impact findings unresolved, especially auth redirect/cookie risk and build-breaking type errors.
- **How we fixed that:**
  - Fixed account setup type regression by removing non-existent `updatedAt` destructuring from `Account` in `setupAccountAction`.
  - Refactored community post page to only wrap data fetching in `try/catch` and moved JSX rendering outside the catch scope (error-boundary-safe pattern).
  - Removed dead/unreferenced OAuth query-param variables in the auth form Google submit handler.
  - Replaced benchmark endpoint in-memory all-user trade aggregation with a DB-side window/aggregate query (`$queryRaw`) to reduce app server memory/CPU pressure and return the same benchmark shape.
  - Confirmed auth hardening already present from earlier pass (`httpOnly` cookie default and canonical callback redirects).
- **Key Files:** `server/accounts.ts`, `app/[locale]/(landing)/community/post/[id]/page.tsx`, `app/[locale]/(authentication)/components/user-auth-form.tsx`, `app/api/trader-profile/benchmark/route.ts`, `AGENTS.md`
- **Verification:** `npm run typecheck` (pass), `npm test` (pass: 20 files, 88 tests; 1 file skipped), targeted ESLint run on touched files (0 errors; warnings only).

### 2026-02-14: Authentication Re-Audit (Post-Hardening Validation)
- **What changed:** Re-audited authentication after header-trust and callback hardening changes to confirm closures and identify any remaining auth weaknesses.
- **What I want:** Verify that previously reported web-session auth issues are closed and isolate residual high-risk paths for the next patch.
- **What I don't want:** Assuming auth is fully secure after partial fixes while API-token and auxiliary identity flows still carry exploitable risk.
- **How we fixed that:**
  - Re-checked patched files (`server/auth.ts`, `app/api/auth/callback/route.ts`, `proxy.ts`) and verified prior findings were addressed.
  - Audited residual auth surfaces (`server/trades.ts`, token import APIs, token-generation actions) for plaintext token usage, expiry enforcement, and identity resolution behavior.
  - Documented remaining critical/high findings with line-level evidence and exploit context.
- **Key Files:** `server/auth.ts`, `app/api/auth/callback/route.ts`, `proxy.ts`, `server/trades.ts`, `app/api/thor/store/route.ts`, `app/api/etp/v1/store/route.ts`, `server/thor.ts`, `app/[locale]/dashboard/components/import/thor/action.ts`, `app/[locale]/dashboard/components/import/etp/action.ts`, `AGENTS.md`
- **Verification:** Used targeted code-path review with line references to confirm fixed items and remaining vulnerabilities before publishing re-audit findings.

### 2026-02-14: Complete Authentication Re-Audit (Full API Surface)
- **What changed:** Performed a complete re-audit of authentication/authorization across all API routes, middleware/session boundaries, callback flow, admin gates, cron/webhook endpoints, and token-based ingestion routes.
- **What I want:** A complete, current-state auth risk map that distinguishes already-fixed issues from remaining exploitable paths across the full backend surface.
- **What I don't want:** Narrow auth confidence that only covers dashboard session flows while cron, webhook, AI-cost, and API-token endpoints remain weakly protected.
- **How we fixed that:**
  - Enumerated API routes and reviewed auth guards (`getDatabaseUserId`, `supabase.auth.getUser`, `assertAdminAccess`, bearer checks, webhook verification).
  - Validated previous hardening remained effective (header-trust removal in core auth helpers, callback redirect hardening, httpOnly cookie protection).
  - Identified remaining high-impact issues: unauthenticated cron DB-write paths, unsigned welcome-email webhook endpoint, plaintext long-lived ETP/THOR bearer token auth, and unauthenticated high-cost AI endpoints.
- **Key Files:** `server/auth.ts`, `app/api/auth/callback/route.ts`, `proxy.ts`, `app/api/cron/investing/route.ts`, `app/api/cron/compute-trade-data/route.ts`, `app/api/email/welcome/route.ts`, `app/api/thor/store/route.ts`, `app/api/etp/v1/store/route.ts`, `server/thor.ts`, `app/[locale]/dashboard/components/import/thor/action.ts`, `app/[locale]/dashboard/components/import/etp/action.ts`, `app/api/ai/support/route.ts`, `app/api/ai/transcribe/route.ts`, `app/api/ai/analysis/accounts/route.ts`, `AGENTS.md`
- **Verification:** Re-checked line-level control flow for every cited route and confirmed exploitability conditions before issuing final findings.

### 2026-02-14: Authentication Hardening Completion (Complete Re-Audit Fix Pass)
- **What changed:** Implemented a full hardening pass for the complete re-audit findings across cron/webhook authentication, API token verification, AI route abuse controls, and redirect/user-resolution edge paths.
- **What I want:** Close the remaining high-impact auth and abuse vectors so sensitive operations are gated by verified secrets/sessions and API tokens are validated with expiry-aware secure checks.
- **What I don't want:** Publicly callable heavy cron jobs, unsigned webhook side effects, long-lived plaintext bearer-token auth, or expensive AI routes callable anonymously at scale.
- **How we fixed that:**
  - Locked cron DB-write/compute endpoints behind `Authorization: Bearer ${CRON_SECRET}` checks in `app/api/cron/investing/route.ts` and `app/api/cron/compute-trade-data/route.ts`.
  - Added webhook authorization gate for welcome-email ingestion using `WELCOME_WEBHOOK_SECRET` (fallback `SUPABASE_WEBHOOK_SECRET`) with timing-safe comparison in `app/api/email/welcome/route.ts`.
  - Migrated ETP/THOR token handling to hashed+expiry verification by:
    - switching generation to `generateSecureToken(...)` and clearing legacy plaintext fields,
    - switching API ingestion auth to `verifySecureToken(...)`,
    - and preserving only one-time token return on generation flows.
  - Added auth + rate-limit protection to high-cost AI endpoints:
    - `app/api/ai/support/route.ts`,
    - `app/api/ai/transcribe/route.ts`,
    - `app/api/ai/analysis/accounts/route.ts`.
  - Hardened client `next` path normalization to reject protocol-relative values in `app/[locale]/(authentication)/components/user-auth-form.tsx`.
  - Removed unsafe user auto-bootstrap fallback in `resolveWritableUserId` so unresolved identities now fail closed in `server/trades.ts`.
- **Key Files:** `app/api/cron/investing/route.ts`, `app/api/cron/compute-trade-data/route.ts`, `app/api/email/welcome/route.ts`, `lib/api-auth.ts`, `app/api/thor/store/route.ts`, `app/api/etp/v1/store/route.ts`, `server/thor.ts`, `app/[locale]/dashboard/components/import/thor/action.ts`, `app/[locale]/dashboard/components/import/etp/action.ts`, `app/api/ai/support/route.ts`, `app/api/ai/transcribe/route.ts`, `app/api/ai/analysis/accounts/route.ts`, `app/[locale]/(authentication)/components/user-auth-form.tsx`, `server/trades.ts`, `AGENTS.md`
- **Verification:** Ran `npx eslint` on all touched auth/security files (0 errors, warnings only); re-checked token auth paths now route through `verifySecureToken(...)` and cron/webhook endpoints now enforce secret authorization.

### 2026-02-14: Auto Logout After 30m Inactivity
- **What changed:** Reduced the inactivity auto-logout window from 1 hour to 30 minutes.
- **What I want:** Users should be automatically signed out if they are inactive for 30 minutes to reduce session exposure on unattended devices.
- **What I don't want:** Long-lived unattended sessions remaining active when the user walks away.
- **How we fixed that:**
  - Updated `TIMEOUT_DURATION` in the existing `AuthTimeout` client component from `60m` to `30m`.
  - Kept the same activity reset events and existing sign-out flow.
- **Key Files:** `components/auth/auth-timeout.tsx`, `components/providers/root-providers.tsx`, `AGENTS.md`
- **Verification:** Load an authenticated page, remain inactive for 30 minutes, and confirm the app signs out; interact (mouse/keyboard/scroll/touch) within 30 minutes and confirm the timer resets.

### 2026-02-14: Auth Re-Audit Closure (AI + Header Fallback Removal)
- **What changed:** Closed the remaining re-audit auth gaps by gating AI routes behind authenticated sessions and removing leftover header-derived email fallbacks.
- **What I want:** All AI-cost routes and subscription/layout entitlement logic should rely on verified Supabase session state, not caller-influenced headers.
- **What I don't want:** Anonymous access to AI endpoints or any security-sensitive decisions falling back to `x-user-email` headers.
- **How we fixed that:**
  - Added Supabase session checks to `app/api/ai/chat/route.ts` and `app/api/ai/editor/route.ts` (editor already rate-limited; chat remains rate-limited).
  - Updated `server/subscription.ts` to derive email strictly from `supabase.auth.getUser()`.
  - Updated `server/layouts.ts` to stop using `x-user-email` as a fallback when ensuring user records.
- **Key Files:** `app/api/ai/chat/route.ts`, `app/api/ai/editor/route.ts`, `server/subscription.ts`, `server/layouts.ts`, `AGENTS.md`
- **Verification:** Ran `npx eslint` on touched files (0 errors; existing warning baseline remains).

### 2026-02-15: Widget Data Visibility Debug Badge (`debugData=1`)
- **What changed:** Added a temporary per-widget debug badge to quickly confirm whether trades are loaded but filtered out before chart rendering.
- **What I want:** When users report "black widgets with titles only," we should immediately see if the root cause is empty `formattedTrades` (filtering) versus missing raw `trades` (load failure).
- **What I don't want:** Blind troubleshooting where widget shells render but it is unclear whether data is absent, filtered, or blocked by layout state.
- **How we fixed that:**
  - Extended `WidgetCanvas` to read data context counts (`trades`, `formattedTrades`) and active filter signals (`instruments`, `accountNumbers`, `dateRange`).
  - Added a small overlay badge on each widget card showing `T:<trades> F:<formattedTrades>` with an additional `filtered` indicator when relevant filters are active.
  - Gated the badge behind query param `?debugData=1` so normal users are unaffected and debugging can be toggled on demand.
- **Key Files:** `app/[locale]/dashboard/components/widget-canvas.tsx`, `AGENTS.md`
- **Verification:** Open `/dashboard?tab=widgets&debugData=1`; confirm each widget shows `T` and `F` counts. If `T>0` and `F=0`, filtering is the direct cause of empty widget bodies.

### 2026-02-15: Performance Rescue Pass (Server Shells + Domain Provider Scaffolding + Perf Gates + Minimal UI Normalization)
- **What changed:** Implemented a cross-cutting performance rescue pass focused on reducing route-level hydration pressure, stabilizing dashboard/trader behavior fetches, introducing domain-scoped provider boundaries, and enforcing bundle/route budget checks in CI while tightening the shared UI surface language.
- **What I want:** Faster and more predictable first render on core routes, lower network churn on behavior/trader pages, and a cleaner premium-minimal visual baseline where performance gains are visible to users.
- **What I don't want:** Duplicated dashboard section controls, page-level client-heavy shells on high-traffic flows, hidden polling loops hammering APIs, and unchecked route payload regressions that silently degrade UX over time.
- **How we fixed that:**
  - Removed duplicate dashboard tab navigation row from `dashboard-tab-shell` so section navigation has one deterministic source.
  - Converted high-traffic behavior and trader-profile routes to server shell wrappers (`page.tsx`) with client island implementations in `page-client.tsx`.
  - Behavior page now lazy-loads heavy modules (mindset, analysis, chat) and uses abortable fetch dedup to avoid stale/overlapping requests.
  - Trader profile benchmark refresh changed from interval-driven polling to on-load + manual refresh with explicit “updated at” status and abortable request handling.
  - Added provider decomposition scaffolding under `context/providers/*` (`trades`, `accounts`, `filters`, `subscription`) while preserving `useData()` compatibility.
  - Wired domain providers into `components/providers/dashboard-providers.tsx` so consumers can migrate to focused hooks incrementally.
  - Added perf CI workflow `.github/workflows/perf-quality.yml` with production build, route-budget enforcement, and bundle artifact upload.
  - Added `perf:check` npm script to mirror CI perf checks locally.
  - Applied clean premium minimal normalization in core shared surfaces (`widget-shell`, `chart-surface`, `stats-card`) and reduced global font payload to two loaded families (`Geist` + `Geist Mono`).
- **Key Files:** `app/[locale]/dashboard/components/dashboard-tab-shell.tsx`, `app/[locale]/dashboard/behavior/page.tsx`, `app/[locale]/dashboard/behavior/page-client.tsx`, `app/[locale]/dashboard/trader-profile/page.tsx`, `app/[locale]/dashboard/trader-profile/page-client.tsx`, `context/providers/trades-provider.tsx`, `context/providers/accounts-provider.tsx`, `context/providers/filters-provider.tsx`, `context/providers/subscription-provider.tsx`, `components/providers/dashboard-providers.tsx`, `.github/workflows/perf-quality.yml`, `package.json`, `components/ui/widget-shell.tsx`, `components/ui/chart-surface.tsx`, `components/ui/stats-card.tsx`, `app/layout.tsx`, `app/globals.css`, `app/[locale]/(home)/components/HomeContent.tsx`, `AGENTS.md`
- **Verification:** Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `node scripts/check-route-budgets.mjs`, and `node scripts/analyze-bundle.mjs`; validate dashboard/trader/behavior routes manually for stable nav state, no default polling loops, and responsive manual refresh behavior.

### 2026-02-15: Auth TLS Recovery + Dashboard UX Simplification + Newsletter Builder Build Stabilization
- **What changed:** Applied a focused rescue pass to resolve auth callback TLS failures, reduce noisy dashboard header UX density, and fix a production build blocker in admin newsletter-builder.
- **What I want:** Auth callback should not fail with `P1011` TLS chain errors on pooled Supabase connections, dashboard controls should feel cleaner and less visually noisy, and full production build should stay stable.
- **What I don't want:** Login loops caused by Prisma TLS mismatch, cluttered header UI that feels heavy/confusing, and build breaks from client-only newsletter modules being evaluated in server-page collection.
- **How we fixed that:**
  - Updated Prisma TLS policy resolution in `lib/prisma.ts`:
    - honor `sslmode` semantics (`verify-full`/`verify-ca` => verify cert; `require`/`prefer`/`allow` => encrypted transport without strict verification),
    - default Supabase pooler hosts to non-strict verification unless explicitly overridden,
    - keep env override support via `PGSSL_REJECT_UNAUTHORIZED`.
  - Simplified dashboard header surface in `app/[locale]/dashboard/components/dashboard-header.tsx`:
    - removed decorative overlay layer,
    - normalized panels/borders/backgrounds for clean premium minimal appearance,
    - reduced aggressive visual accents (pulsing upgrade/save states, destructive icon treatment),
    - unified filter-tag container styling for desktop/mobile.
  - Refined behavior page hero density in `app/[locale]/dashboard/behavior/page-client.tsx`:
    - replaced heavy gradient hero shell with calmer card surface,
    - hid non-essential badge cluster on smaller widths,
    - switched secondary CTA buttons to restrained `outline` style.
  - Fixed `admin/newsletter-builder` build regression by using server wrapper + client page split:
    - added `app/[locale]/admin/newsletter-builder/page-client.tsx` (client-only dynamic modules),
    - `app/[locale]/admin/newsletter-builder/page.tsx` now server wrapper.
- **Key Files:** `lib/prisma.ts`, `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/behavior/page-client.tsx`, `app/[locale]/admin/newsletter-builder/page.tsx`, `app/[locale]/admin/newsletter-builder/page-client.tsx`, `AGENTS.md`
- **Verification:**
  - `npx eslint lib/prisma.ts app/[locale]/dashboard/components/dashboard-header.tsx app/[locale]/dashboard/behavior/page-client.tsx app/[locale]/admin/newsletter-builder/page.tsx app/[locale]/admin/newsletter-builder/page-client.tsx` (0 errors),
  - `npm run typecheck` (pass),
  - `npm run build` (pass; routes include `/[locale]/admin/newsletter-builder` and auth callback routes).

### 2026-02-15: Immediate Rescue Follow-Up (Header Weight Reduction + Build Safety + TLS Semantics)
- **What changed:** Performed a follow-up emergency pass to reduce dashboard interaction weight and ensure the full app remains build-safe after recent performance/UX changes.
- **What I want:** Dashboard should feel lighter/faster in day-to-day interaction and builds should stay green while auth/TLS behavior remains stable.
- **What I don't want:** Animation-heavy header logic inflating client cost, server-build failures in admin newsletter route, or TLS mismatch regressions during auth callback DB access.
- **How we fixed that:**
  - Removed `framer-motion` usage from dashboard header and replaced animated wrappers with static conditional blocks for lower client overhead and cleaner UX rhythm.
  - Preserved the simplified clean/minimal header styling introduced in the rescue pass.
  - Kept Prisma TLS behavior aligned to `sslmode` + Supabase pooler characteristics in `lib/prisma.ts`.
  - Fixed `admin/newsletter-builder` route to a correct server wrapper + client page split using `page-client.tsx` for client-only dynamic modules.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/admin/newsletter-builder/page.tsx`, `app/[locale]/admin/newsletter-builder/page-client.tsx`, `lib/prisma.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint app/[locale]/dashboard/components/dashboard-header.tsx lib/prisma.ts app/[locale]/admin/newsletter-builder/page.tsx app/[locale]/admin/newsletter-builder/page-client.tsx app/[locale]/dashboard/behavior/page-client.tsx` (no errors),
  - `npm run build` (pass; includes `/[locale]/dashboard/*`, `/api/auth/callback`, `/[locale]/admin/newsletter-builder`).

### 2026-02-15: Prisma Build-Phase Noise Reduction + Pool Sizing Guard
- **What changed:** Refined Prisma runtime logging/connection behavior to reduce build-time noise and unnecessary pool pressure while preserving auth/TLS reliability.
- **What I want:** Production builds should be quieter and deterministic, without repeated Prisma warning/info spam during static generation.
- **What I don't want:** Noisy Prisma initialization logs on every build page-data pass or oversized build-phase pool settings.
- **How we fixed that:**
  - Added Next build-phase detection (`NEXT_PHASE === 'phase-production-build'`) in `lib/prisma.ts`.
  - Suppressed Prisma pool init info logs during build phase.
  - Suppressed insecure TLS warning during build phase (warning still available for runtime when explicitly configured insecure).
  - Reduced default production pool size to `1` during build phase while keeping normal production runtime defaults unchanged.
- **Key Files:** `lib/prisma.ts`, `AGENTS.md`
- **Verification:** `npx eslint lib/prisma.ts` (clean), `npm run build` (pass) with Prisma build-time logs reduced.

### 2026-02-15: Next.js Optimization Wave (Provider Scope Split + Home Lazy Boundaries + Cache/CI Guardrails)
- **What changed:** Implemented a low-risk optimization wave across provider scoping, dashboard initial-layout hydration handoff, home-section lazy loading, route/cache policy tightening, and CI performance/monitoring guardrails.
- **What I want:** Reduce unnecessary hydration on public routes, keep dashboard/auth experiences stable, enforce measurable perf gates in CI, and standardize cache behavior by route family without changing product behavior.
- **What I don't want:** Global provider overhead on every locale route, avoidable dashboard client waterfalls, ad-hoc cache semantics on API routes, and perf regressions slipping through PRs.
- **How we fixed that:**
  - Split global and protected providers:
    - `RootProviders` now keeps only global UI concerns (`Tooltip`, `Theme`, `Sidebar`, service-worker registration).
    - Added `ProtectedRouteProviders` (`QueryProvider` + `AuthTimeout`) and applied to protected layouts (`dashboard`, `teams/manage`, `teams/dashboard`, `admin`).
  - Added dashboard initial hydration contract:
    - `DataProvider` now accepts `initialData` with optional `dashboardLayout`.
    - `DashboardLayout` preloads `getDashboardLayout(user.id)` server-side and passes it into `DashboardProviders` to reduce first-load layout fetch waterfall.
    - Marked dashboard route surfaces explicitly dynamic (`export const dynamic = "force-dynamic"` in layout/page).
  - Improved home route strategy:
    - Added ISR for public home route (`export const revalidate = 3600` in `app/[locale]/(home)/page.tsx`).
    - Converted `DeferredHomeSections` to dynamic section loading with skeleton fallbacks for non-critical below-fold sections.
  - Cache policy hardening:
    - Added default `no-store` header for `/api/:path*` in `next.config.ts`.
    - Added short public cache policy for health endpoint (`/api/health`: `max-age=15`, `stale-while-revalidate=60`).
  - Asset/script compliance updates:
    - Migrated dropzone thumbnail preview from `<img>` to `next/image` (with `unoptimized` for local previews).
    - Updated non-critical PostHog script strategy reference to `lazyOnload` in `app/layout.tsx`.
  - CI/monitoring guardrails:
    - Updated perf workflow to run canonical `npm run perf:check`.
    - Added new Lighthouse CI workflow (`.github/workflows/lighthouse-ci.yml`) for home/dashboard smoke URLs.
- **Key Files:** `components/providers/root-providers.tsx`, `components/providers/protected-route-providers.tsx`, `components/providers/dashboard-providers.tsx`, `app/[locale]/dashboard/layout.tsx`, `app/[locale]/dashboard/page.tsx`, `context/data-provider.tsx`, `app/[locale]/teams/manage/layout.tsx`, `app/[locale]/teams/dashboard/layout.tsx`, `app/[locale]/admin/layout.tsx`, `app/[locale]/(home)/components/DeferredHomeSections.tsx`, `app/[locale]/(home)/page.tsx`, `next.config.ts`, `app/api/health/route.ts`, `components/ui/dropzone.tsx`, `app/layout.tsx`, `.github/workflows/perf-quality.yml`, `.github/workflows/lighthouse-ci.yml`, `AGENTS.md`
- **Verification:**
  - `npm run check:route-budgets` passes.
  - `node scripts/analyze-bundle.mjs` writes `docs/audits/artifacts/bundle-summary.json`.
  - `npm run typecheck` passes.
  - `npm run perf:check` passes (build + route budgets + bundle analysis).
  - `npx eslint` on all touched code/config files passes with warnings only and no errors.

### 2026-02-15: Auth-First RLS Policy Rewrite (Supabase `auth.uid()` Mapping)
- **What changed:** Rewrote authenticated RLS ownership policies to consistently anchor on Supabase Auth identity (`auth.uid()`) via `public."User".auth_user_id`, including parent-joined tables.
- **What I want:** Every authenticated query/write should be user-scoped by the signed-in Supabase auth identity first, even when domain tables use internal `User.id` references.
- **What I don't want:** Mixed policy semantics where some tables compare directly to `auth.uid()` and others compare against internal ids, creating gaps or inconsistent access behavior.
- **How we fixed that:**
  - Applied migration `rewrite_user_policies_to_auth_uid_mapping`.
  - Recreated `authenticated_owner` policies for direct-owner tables with `EXISTS (...)` mapping:
    - `table.userId -> User.id` and `User.auth_user_id = auth.uid()`.
  - Recreated parent-chain policies (`authenticated_owner_via_parent`) for indirect-owner tables (`BusinessInvitation`, `BusinessManager`, `LayoutVersion`, `Payout`, `TeamAnalytics`, `TeamInvitation`, `TeamManager`, `TradeAnalytics`) with explicit joins to `User` and `auth.uid()`.
  - Recreated `public."User"` owner policy as `auth_user_id = auth.uid()`.
  - Verified `DashboardLayout.userId` FK targets `User.auth_user_id`, keeping `LayoutVersion` parent policy semantics consistent.
- **Key Files:** `AGENTS.md` (DB migration applied on Supabase project; no local SQL file in repo for this step)
- **Verification:**
  - `pg_policies` inspection confirms authenticated policies now reference `auth.uid()` through user mapping.
  - Query for public tables lacking authenticated policies returns empty.
  - `anon` policies that remain are explicit deny policies (`anon_no_access` with `false` conditions).
  - Supabase security advisors now only report one remaining auth setting warning: leaked password protection disabled.

### 2026-02-15: Supabase User Isolation Hardening (Storage + Auth-Scoped Upload Paths)
- **What changed:** Completed a user-isolation hardening pass for Supabase Storage and upload/read code paths so authenticated users can only operate inside their own object prefix.
- **What I want:** Logged-in users can upload, list, view, update, and delete only their own files; storage access is scoped by Supabase Auth identity and no longer relies on public bucket exposure.
- **What I don't want:** Cross-user object access via permissive/missing Storage RLS, public object URLs that bypass user isolation, or client-provided upload paths that are not auth-scoped.
- **How we fixed that:**
  - Applied Supabase migration `harden_storage_user_isolation_auth_uid_v3`:
    - ensured `trade-images` bucket exists and is private (`public=false`),
    - set file constraints (`5MB`, image-only MIME allowlist),
    - created authenticated Storage object policies (`SELECT/INSERT/UPDATE/DELETE`) requiring first path segment to match `auth.uid()`.
  - Hardened upload hooks to enforce auth-scoped object keys:
    - `hooks/use-hash-upload.ts` now resolves authenticated user and scopes uploads under `auth.uid()/...`,
    - `hooks/use-supabase-upload.ts` now resolves authenticated user and scopes uploads under `auth.uid()/...`.
  - Hardened trade image UI for private storage:
    - `trade-image-editor.tsx` now stores uploaded object paths (not public URLs),
    - creates signed URLs for rendering private images,
    - supports backward compatibility for legacy public URLs while deleting via normalized object path extraction.
  - Hardened server-side storage listing in `server/storage.ts`:
    - requires authenticated user,
    - enforces user-root prefix scoping before listing.
- **Key Files:** `hooks/use-hash-upload.ts`, `hooks/use-supabase-upload.ts`, `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`, `server/storage.ts`, `AGENTS.md`
- **Verification:**
  - Storage policy inspection confirms four authenticated owner policies exist on `storage.objects` and all require `(storage.foldername(name))[1] = auth.uid()`.
  - Bucket inspection confirms `trade-images` exists with `public=false`, `file_size_limit=5242880`, and MIME allowlist.
  - `npx eslint` on touched files passes with warnings-only baseline (no errors).
  - `npm run typecheck` exits `0`.
  - Follow-up hardening: Storage object policies are also bucket-scoped to app buckets (`trade-images`, `quntedge`) in addition to auth-uid folder scoping.

### 2026-02-15: Production Admin Surface Lockdown (Service-Role Action Gating)
- **What changed:** Added mandatory admin authorization guards to all admin server actions that use Supabase Admin APIs or can access tenant-wide data.
- **What I want:** Service-role powered admin actions should be executable only by authorized admin users, even if an action endpoint is invoked directly.
- **What I don't want:** Un-gated `app/[locale]/admin/actions/*` server actions callable by non-admin authenticated users and exposing cross-tenant user/email/stats data.
- **How we fixed that:**
  - Imported and enforced `assertAdminAccess()` in:
    - `app/[locale]/admin/actions/stats.ts` (`getUserStats`, `getFreeUsers`)
    - `app/[locale]/admin/actions/send-email.ts` (`renderEmailPreview`, `getUsersList`, `sendEmailsToUsers`)
    - `app/[locale]/admin/actions/weekly-recap.ts` (`generateAnalysis`, `renderEmail`, `loadInitialContent`, `listUsers`)
  - Kept existing service-role client setup but gated all exported sensitive entry points before use.
- **Key Files:** `app/[locale]/admin/actions/stats.ts`, `app/[locale]/admin/actions/send-email.ts`, `app/[locale]/admin/actions/weekly-recap.ts`, `AGENTS.md`
- **Verification:**
  - `npx eslint app/[locale]/admin/actions/stats.ts app/[locale]/admin/actions/send-email.ts app/[locale]/admin/actions/weekly-recap.ts` (warnings only, no errors).
  - `npm run typecheck` passes.

### 2026-02-15: Schema Consistency Fix (DashboardLayout RLS vs FK Mapping)
- **What changed:** Corrected `DashboardLayout` authenticated ownership RLS predicate to match its real foreign-key target (`User.auth_user_id`) instead of `User.id`.
- **What I want:** Users can access only their own dashboard layouts while preserving the schema’s auth-UID based ownership model.
- **What I don't want:** A policy condition that joins `DashboardLayout.userId` to the wrong `User` key and silently blocks legitimate owner access.
- **How we fixed that:**
  - Applied Supabase migration `fix_dashboardlayout_rls_auth_uid_fk_mapping` to recreate `public."DashboardLayout"` `authenticated_owner` policy.
  - New `USING` / `WITH CHECK` conditions require:
    - `User.auth_user_id = DashboardLayout.userId`
    - `User.auth_user_id = auth.uid()`
  - Added matching repo migration file for traceability:
    - `prisma/migrations/20260215193000_fix_dashboardlayout_rls_auth_uid_fk_mapping/migration.sql`
- **Key Files:** `prisma/migrations/20260215193000_fix_dashboardlayout_rls_auth_uid_fk_mapping/migration.sql`, `AGENTS.md`
- **Verification:**
  - `pg_policies` check confirms `DashboardLayout.authenticated_owner` now matches `auth_user_id` on both ownership and auth predicates.

### 2026-02-17: Latest Commit Study (`5a5ebf7`) - Production Smoke Checks + Service Worker Kill Switch
- **What changed:** Reviewed commit `5a5ebf754b82d59cc4af51585df46b18e3f4d865` adding CI smoke checks and a production service-worker kill switch toggle.
- **What I want:** CI should validate post-build HTTP behavior (locale redirect + auth redirect) and production should have an emergency flag to disable/unregister the service worker without code rollback.
- **What I don't want:** False confidence from weak smoke readiness checks, or stale SW behavior when the load handler does not run in edge timing cases.
- **How we fixed that:**
  - Commit-level analysis only (no behavior changes in this pass).
  - Confirmed additions:
    - `test:smoke` script in `package.json`.
    - New `scripts/smoke-http.mjs` spawning `next start` and validating `/`, `/en`, `/en/dashboard` behavior.
    - CI integration of smoke step after build in `.github/workflows/ci.yml`.
    - `NEXT_PUBLIC_SW_ENABLED` kill switch in `components/providers/root-providers.tsx` with unregister path.
  - Highlighted follow-up risks:
    - readiness gate currently accepts any status `>= 200` (including 4xx/5xx),
    - SW registration/unregister is bound to `window.load` only (can be skipped if effect runs after load).
- **Key Files:** `.github/workflows/ci.yml`, `package.json`, `scripts/smoke-http.mjs`, `components/providers/root-providers.tsx`, `AGENTS.md`
- **Verification:**
  - `git log -1 --pretty=fuller` confirms commit id/message/date.
  - `git show --stat -1` confirms `4` files changed, `118` insertions, `3` deletions.
  - `git show -1 -- <file>` reviewed patch contents for all touched files.

### 2026-02-17: Home Page Locale Crash Fix (Middleware/Client Locale Parity)
- **What changed:** Fixed client i18n locale mapping so all locales emitted by middleware are recognized by the client provider.
- **What I want:** Home/marketing pages should render for every locale the edge middleware can redirect to, including fallback locales.
- **What I don't want:** Client-side runtime failures on locale-prefixed routes (e.g. `/de`) because `createI18nClient` lacks that locale while middleware/server support it.
- **How we fixed that:**
  - Added missing fallback locale handlers in `locales/client.ts` for `de`, `pt`, `vi`, `zh`, and `yo` (mapped to `./en` placeholders).
  - Kept existing server/middleware locale list unchanged; aligned client to that contract.
- **Key Files:** `locales/client.ts`, `AGENTS.md`
- **Verification:** `npm run -s typecheck` exits `0` after patch.

### 2026-02-17: Home Page Reliability Hardening (Old + New Users)
- **What changed:** Hardened locale routing and service worker initialization so both cached existing users and fresh users reliably reach a working home page.
- **What I want:** Home route should load consistently across user cohorts regardless of browser cache/service worker state.
- **What I don't want:** Middleware redirecting to locale prefixes that can mismatch client expectations, or SW kill-switch logic silently not running when the page is already loaded.
- **How we fixed that:**
  - Tightened middleware locale routing set in `proxy.ts` to `en/fr/es/it/hi/ja` (the stable client-supported set).
  - Updated `RootProviders` SW logic to run immediately when `document.readyState === "complete"`, and to register/remove `load` listener cleanup to avoid missed execution and listener leaks.
- **Key Files:** `proxy.ts`, `components/providers/root-providers.tsx`, `AGENTS.md`
- **Verification:** `npm run -s typecheck` exits `0`.

### 2026-02-17: Immediate Root-Cause Resolution (Home Page Reliability)
- **What changed:** Finalized the true home-page root-cause fix by aligning locale support across middleware/server/client while preserving legacy locale URLs for existing users.
- **What I want:** Both old users (already routed/cached on legacy locale prefixes) and new users should load the home page reliably with no i18n runtime mismatch.
- **What I don't want:** Partial fixes that solve only first-paint animation visibility but still leave locale-contract divergence between edge routing and client i18n providers.
- **How we fixed that:**
  - Kept middleware locale surface in `proxy.ts` at full supported set (`en, fr, de, es, it, pt, vi, hi, ja, zh, yo`) to avoid breaking existing locale paths.
  - Ensured client i18n parity in `locales/client.ts` by adding fallback handlers for `de, pt, vi, zh, yo`.
  - Retained service-worker control hardening in `components/providers/root-providers.tsx` so register/unregister logic also executes when document is already loaded.
- **Key Files:** `proxy.ts`, `locales/client.ts`, `components/providers/root-providers.tsx`, `AGENTS.md`
- **Verification:**
  - `npm run -s typecheck` -> exits `0`.
  - `npm run -s build` -> exits `0` (full route generation).
  - `npm run -s test:smoke` -> `Smoke checks passed.`

### 2026-02-17: English-Only Routing Lockdown (Immediate)
- **What changed:** Switched runtime locale routing to English-only while preserving minimal internal typing compatibility for existing en/fr conditional UI logic.
- **What I want:** Public routing should resolve only English locale paths to simplify behavior and prevent non-English route variants.
- **What I don't want:** Broken builds from strict locale-type narrowing across many components that still branch on `fr` labels/formatting.
- **How we fixed that:**
  - Updated `proxy.ts` locale middleware and locale set to `['en']` only.
  - Reduced SEO language alternates in `app/layout.tsx` to English canonical only.
  - Kept `fr` registered in `locales/client.ts` and `locales/server.ts` strictly for compile-time/runtime compatibility with existing `en/fr` checks; non-English locale routing is still blocked at middleware.
- **Key Files:** `proxy.ts`, `locales/client.ts`, `locales/server.ts`, `app/layout.tsx`, `AGENTS.md`
- **Verification:** `npm run -s typecheck` exits `0`.

### 2026-02-17: Immediate Safe-Mode Stabilization (Crash Prevention Defaults)
- **What changed:** Applied immediate safe defaults to high-risk optimization surfaces so production behavior stays stable unless explicitly enabled.
- **What I want:** Prevent homepage/runtime crashes from optimization toggles by making heavy features opt-in instead of implicitly on.
- **What I don't want:** New deploys accidentally enabling service worker or aggressive motion paths that can amplify hydration/runtime failures.
- **How we fixed that:**
  - Changed service worker gate in `components/providers/root-providers.tsx` to enable only when `NEXT_PUBLIC_SW_ENABLED === "true"`.
  - Added marketing motion feature gate in `app/[locale]/(home)/components/Hero.tsx` via `NEXT_PUBLIC_ENABLE_MARKETING_MOTION === 'true'`.
  - Added same motion gate in `app/[locale]/(landing)/components/navbar.tsx` and removed hidden-first animation default (`initial={false}`) for safer first paint.
- **Key Files:** `components/providers/root-providers.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(landing)/components/navbar.tsx`, `AGENTS.md`
- **Verification:** `npm run -s typecheck` exits `0`.

### 2026-02-17: Full Optimization Wave Rollback (User-Requested Revert)
- **What changed:** Reverted the recent optimization wave across dashboard, providers, scripts, CI perf workflows, and related UI/performance/security refactors in one consolidated rollback.
- **What I want:** Restore pre-optimization baseline behavior and file structure exactly as requested.
- **What I don't want:** Partial rollback leaving mixed old/new behavior, orphan scripts, or inconsistent route/provider patterns.
- **How we fixed that:**
  - Reverted optimization-era additions and refactors across app routes, dashboard shells, provider decomposition, chart guards, perf scripts, CI perf workflows, and service-worker/security helper changes.
  - Removed optimization-specific files added in the wave (e.g. perf artifacts/scripts/provider splits) and restored prior implementations for modified files.
  - Kept rollback as one coherent changeset to simplify review and recovery if needed.
- **Key Files:** `app/[locale]/dashboard/**`, `components/providers/**`, `components/ui/**`, `context/data-provider.tsx`, `next.config.ts`, `proxy.ts`, `scripts/**`, `.github/workflows/**`, `AGENTS.md`
- **Verification:** `npm run typecheck` after rollback snapshot.

### 2026-02-18: Sidebar Hydration Fix (Server-Side Cookie)
- **What changed:** Updated `app/[locale]/layout.tsx` to read the `sidebar:state` cookie and pass it as a `defaultOpen` prop to `RootProviders`, ensuring correct initial state on the server.
- **What I want:** Eliminate the "FOUC" (Flash of Unstyled Content) or hydration mismatch where the sidebar flickers from expanded to collapsed on initial load.
- **What I don't want:** Client-side only cookie reading in `SidebarProvider` causing a hydration error because server rendered default (true) and client rendered cookie state (false).
- **How we fixed that:**
  - `RootProviders` now accepts `defaultOpen`.
  - `SidebarProvider` receives `defaultOpen` from `RootProviders`.
  - `RootLayout` reads cookie via `next/headers` and passes the boolean value.
- **Key Files:** `app/[locale]/layout.tsx`, `components/providers/root-providers.tsx`, `AGENTS.md`
- **Verification:** `npm run typecheck` (skipped due to env limitations). Manual code review confirms prop drilling is correct.

### 2026-02-18: Sidebar Refactor & Dokpoly Deployment Optimization
- **What changed:** Refactored the sidebar to use a unified premium shadcn design and optimized the project configuration for Dokpoly/Nixpacks deployment.
- **What I want:** A clean, consistent sidebar with accurate route highlighting across all sections (Dashboard, Teams, Admin) and a stable Docker/Nixpacks build process.
- **What I don't want:** Fragmented designs between different sidebars, broken active-link indicators, or container build failures due to missing dependencies or incorrect build commands.
- **How we fixed that:**
  - Unified all sidebars into a single `UnifiedSidebar` component with a premium shadcn aesthetic.
  - Improved `useActiveLink` to handle locale prefixes, nested routes, and dashboard tab-specific highlighting.
  - Standardized all icons to `size-4` and moved user settings to a dropdown in the footer.
  - Created `nixpacks.toml` and updated `package.json` with standalone mode and Node 20 requirements.
  - Added required `binaryTargets` to `prisma/schema.prisma` for Linux container compatibility.
- **Key Files:** `components/ui/unified-sidebar.tsx`, `components/sidebar/dashboard-sidebar.tsx`, `package.json`, `nixpacks.toml`, `prisma/schema.prisma`, `AGENTS.md`
- **Verification:** Successfully pushed to `main` after resolving merge conflicts. Build process verified via nixpacks syntax check.

### 2026-02-25: Full Backend Hardening + Quality Remediation (P0-P3)
- **What changed:** Completed the backend hardening plan across schema integrity, secure access controls, distributed rate-limiting, ingestion bounds, performance query paths, dependency remediation, and CI confidence fixes.
- **What I want:** Ensure tenant-safe writes, enforce share/referral correctness under concurrency, reduce sensitive exposure and query overhead, and keep backend verification deterministic.
- **What I don't want:** Cross-tenant overwrite risk, public/expired shared-link leakage, referral race duplicates, in-memory-only rate limiting in production, expensive N+1 admin queries, and flaky backend verification.
- **How we fixed that:**
  - **Data integrity + schema**
    - Updated `Order` uniqueness from global `orderId` to scoped composite `@@unique([userId, orderId])`.
    - Added `ReferralRedemption` relational model and removed array-based referral tracking.
    - Added `TraderBenchmarkSnapshot` model for snapshot-first benchmark serving.
    - Added migration `20260225170000_backend_hardening_core` with referral backfill and constraint transitions.
  - **P0/P1 security-hardening**
    - Enforced shared-read access guard (`isPublic` and non-expired) in shared data fetch path used by page + opengraph.
    - Replaced weak slug generation with crypto-safe helper `createSecureSlug(...)` in shared/referral services.
    - Hardened referral apply flow with transactional uniqueness semantics (`referredUserId` unique + `(referralId,referredUserId)` unique) and idempotent conflict handling.
    - Hardened `/api/health` default response to public-safe minimal shape; detailed diagnostics require service auth or explicit public override.
    - Confirmed distributed-capable limiter in `lib/rate-limit.ts` (Upstash production path + trusted IP extraction + memory fallback).
  - **P2 performance/reliability**
    - Removed admin subscription N+1 aggregate loop by batching transaction/invoice/refund groupBy queries by `userId`.
    - Refactored benchmark endpoint to serve fresh `TraderBenchmarkSnapshot` first, recomputing/upserting only when stale/missing.
    - Added strict ETP/THOR ingestion bounds: payload-size guards, max items, payload normalization, and pagination clamping.
    - Fixed ETP upsert key to `userId_orderId` to prevent cross-tenant overwrites.
  - **P3 quality/remediation**
    - Stabilized AI route typing for `streamText` tool contracts while preserving tool guards.
    - Fixed server-action export violations by moving shared visibility helper to `lib/security/shared-access.ts` and removing `use server` from referral service module used by API routes.
    - Added/updated regression tests:
      - `tests/api/etp-store-route.test.ts`
      - `tests/server/shared-access.test.ts`
      - updated `tests/performance/rendering-performance.test.tsx` for deterministic `requestAnimationFrame` behavior.
    - Addressed baseline failing test contracts (`sanitize` SSR fallback and sidebar trigger contract) to restore CI test pass.
  - **Dependency remediation**
    - Upgraded direct deps: `ajv` and `jspdf`.
    - Added minimatch overrides and lockfile refresh.
    - Installed missing csstools parser/tokenizer packages required by current dependency graph.
    - Residual audit findings remain transitive via Prisma tooling path and `markdown-it` (non-dev audit still reports moderate vulnerabilities).
- **Key Files:** `prisma/schema.prisma`, `prisma/migrations/20260225170000_backend_hardening_core/migration.sql`, `app/api/etp/v1/store/route.ts`, `app/api/thor/store/route.ts`, `app/api/health/route.ts`, `app/api/admin/subscriptions/route.ts`, `app/api/trader-profile/benchmark/route.ts`, `server/referral.ts`, `server/shared.ts`, `lib/security/slug.ts`, `lib/security/shared-access.ts`, `tests/api/etp-store-route.test.ts`, `tests/server/shared-access.test.ts`, `package.json`, `package-lock.json`, `tasks/todo.md`, `tasks/lessons.md`, `AGENTS.md`
- **Verification:**
  - `npm run typecheck` -> exits `0`.
  - `npm run lint -- app/api server lib` -> exits `0` with warnings only (`0` errors).
  - `npm test` -> exits `0` (`145 passed`, `46 skipped`).
  - `npm run build` -> exits `0`.
  - `npm audit --omit=dev` -> fails with residual moderate transitive findings (Prisma toolchain + `markdown-it`), no safe non-breaking direct fix available in current lockstep.

### 2026-02-26: Lightning Performance Program (Cache Split + Render Matrix + CI Gates)
- **What changed:** Implemented a Vercel-style performance baseline across middleware cache policies, public-route revalidation, performance automation scripts, CI gates, and reporting templates.
- **What I want:** Public marketing/docs surfaces should be cacheable and precomputed while private/auth/dashboard surfaces stay strict no-store, with automated regression detection for route payload and Lighthouse thresholds.
- **What I don't want:** Over-broad no-store on public routes, accidental caching of private responses, or performance regressions landing without CI visibility.
- **How we fixed that:**
  - Added route-class cache policy helpers in `proxy.ts`:
    - `isPrivateDocumentRoute(...)`
    - `isPublicDocumentRoute(...)`
    - `isPublicReadApiRoute(...)`
  - Enforced cache split:
    - private docs -> `no-store, max-age=0, must-revalidate` (+ pragma/expires)
    - public docs -> `public, max-age=0, must-revalidate`
    - API default -> private no-store; explicit allowlist for public read cache.
  - Added explicit revalidation for key public surfaces:
    - `app/[locale]/(home)/page.tsx`
    - `app/[locale]/(landing)/pricing/page.tsx` (with server wrapper + client component split)
    - `app/[locale]/(landing)/_updates/page.tsx`
    - `app/[locale]/(landing)/_updates/[slug]/page.tsx`
    - `app/[locale]/(landing)/about/page.tsx`
    - `app/[locale]/(landing)/faq/page.tsx`
    - `app/[locale]/(landing)/docs/page.tsx`
    - `app/[locale]/(landing)/privacy/page.tsx`
  - Added performance tooling:
    - `scripts/perf-lighthouse.mjs`
    - `scripts/perf-header-check.mjs`
    - `scripts/perf-baseline.mjs`
    - new npm scripts: `perf:lighthouse`, `perf:headers`, `perf:baseline`, `perf:ci`.
  - Hardened budget governance:
    - updated `scripts/check-route-budgets.mjs` with explicit home/dashboard budget map.
    - updated `scripts/analyze-bundle.mjs` to emit budget metadata + route budget status.
  - Extended CI in `.github/workflows/ci.yml`:
    - route budget check, bundle analysis, production server spin-up, header cache validation, Lighthouse gate, artifact upload.
  - Added planning/report docs:
    - `docs/perf-execution-plan.md`
    - `docs/perf-route-tracker.md`
    - `docs/audits/performance-weekly-report.md`
    - baseline section in `docs/audits/performance-initiative-2026-02-21.md`.
- **Key Files:** `proxy.ts`, `app/[locale]/(home)/page.tsx`, `app/[locale]/(landing)/pricing/*`, `app/[locale]/(landing)/_updates/*`, `scripts/perf-*.mjs`, `scripts/check-route-budgets.mjs`, `scripts/analyze-bundle.mjs`, `.github/workflows/ci.yml`, `docs/PERFORMANCE_BUDGETS.md`, `docs/audits/performance-initiative-2026-02-21.md`, `AGENTS.md`
- **Verification:** `npm run typecheck`, `npm run build`, `npm run check:route-budgets`, `npm run analyze:bundle`, `npm run perf:headers`, `npm run perf:lighthouse`, `npm run perf:baseline`.

### 2026-02-26: Monochrome Color Contract (Token-Only UI Colors)
- **What changed:** Established an app-wide color usage contract for monochrome token usage and added enforcement tooling.
- **What I want:** UI colors should come from CSS tokens/semantic aliases; no ad-hoc hue classes or literal color values in app UI code.
- **What I don't want:** Reintroduction of `blue/red/emerald/...` Tailwind hues, raw hex/rgb/hsl literals in UI, or undocumented brand-color exceptions.
- **How we fixed that:**
  - Added semantic neutral token aliases in theme config (`semantic.success|warning|error|info`, fg/bg/border variants).
  - Introduced brand exception annotation convention: `brand-color-exception`.
  - Added guard script `scripts/check-color-contract.mjs` to detect forbidden hue utilities and color literals with explicit allowlist support.
  - Kept external partner branding as the only allowed literal-color exception.
- **Key Files:** `styles/tokens.css`, `app/globals.css`, `tailwind.config.ts`, `lib/color-tokens.ts`, `scripts/check-color-contract.mjs`, `package.json`, `AGENTS.md`
- **Verification:** Run `npm run check:color-contract` and review violations output + allowlist deltas.

### 2026-03-08: Freeze Recovery + Typecheck Stub Hardening
- **What changed:** Added global error recovery UI, tightened chunk-load recovery handling, and ensured Next typecheck stubs are always present.
- **What I want:** Users should recover from stale chunks or runtime crashes without manual hard reloads, and typecheck should run reliably after clean builds.
- **What I don't want:** Silent freezes from missing chunks, broken navigation that requires force refresh, or typecheck failures caused by missing .next cache-life stubs.
- **How we fixed that:**
  - Added a global error boundary page () with reload/try-again actions.
  - Expanded chunk error detection and hardened sessionStorage guards in  so auto-reload works even if storage is blocked.
  - Added timeout guards to subscription refresh paths and reused the shared subscription loader in DataProvider.
  - Updated  to always write cache-life stubs for both  and .
- **Key Files:** , , , , .
- **Verification:** [clean-build] removed tsconfig.tsbuildinfo
[clean-build] removed .next
[typecheck] Ensured cache-life.d.ts stubs
Generating route types...
✓ Types generated successfully
[typecheck] Ensured cache-life.d.ts stubs passes.
