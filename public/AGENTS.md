# AGENTS.md

## Purpose
This document provides operating instructions for engineering agents working on Qunt Edge.
Apply these rules when implementing, reviewing, or shipping changes in this repository.

## Product Context
- Qunt Edge is a trading analytics platform for futures and prop-firm workflows.
- Core domains: trade ingestion, analytics dashboards, journaling, AI analysis, teams, and billing.
- Primary risk areas: financial data correctness, import integrity, auth/security boundaries, and payment webhook handling.

## App Explanation (Engineering View)
- Runtime model: Next.js App Router with mixed server/client components and API routes in `app/api`.
- Data flow: broker/file ingestion -> normalization/storage -> dashboard/query surfaces -> journaling/review -> AI-assisted analysis.
- Core UX surfaces:
  - Dashboard (`app/[locale]/dashboard`): widgets, charts, summaries, and performance exploration.
  - Data/import flows: broker sync and file import pipelines with mapping/validation.
  - Teams/admin/billing areas: access control, account/org settings, and payment lifecycle handling.
- Integration points: Supabase (auth/storage), Prisma/Postgres (data), OpenAI (analysis helpers), Whop (payments/webhooks).
- Localization: i18n via locale files and localized routes.

## Tech Stack
- Framework: Next.js App Router (`app/`)
- Language: TypeScript (strict)
- UI: React 19, Tailwind, Radix
- Data: Prisma + PostgreSQL (Supabase)
- Auth/Storage: Supabase
- AI: OpenAI integrations
- Payments: Whop webhooks and plan configs
- Testing: Vitest

## Repo Map
- `app/`: routes, layouts, API handlers
- `components/`: UI and feature components
- `server/`: server-side business logic and services
- `lib/`: utilities and shared helpers
- `store/`: Zustand stores
- `prisma/`: schema and db utilities
- `scripts/`: build/sync/ops scripts

## Operating Principles
- Prefer minimal, targeted changes over broad refactors.
- Preserve existing architecture and naming conventions.
- Keep business logic out of client components when possible.
- Do not silently change behavior in trading math, imports, or billing flows.
- If assumptions are required, document them in PR/commit notes.
- Always revalidate `user-data-${userId}` tag in server actions that modify accounts, trades, or sync tokens to ensure instant dashboard updates.

## Safety-Critical Areas

### Trading and Analytics
- Treat PnL, fees, size, and time normalization as correctness-critical.
- Avoid rounding changes unless explicitly requested and validated.
- Keep timezone handling explicit and consistent.

### Imports and Parsing
- Maintain backward compatibility for CSV/PDF and broker mappings.
- Fail clearly on malformed data; do not hide parse errors.
- Preserve idempotency where imports can be retried.

### Auth and Permissions
- Enforce user/team scoping on all data access paths.
- Never expose service-role secrets to the client.
- Validate API authorization, not only UI-level checks.

### Payments and Webhooks
- Keep webhook handlers deterministic and idempotent.
- Verify signature/secret checks are preserved.
- Ensure plan ID changes remain synchronized with config and env docs.

## Change Workflow
1. Read relevant files and existing patterns before editing.
2. Implement the smallest coherent fix.
3. Run validation commands for impacted scope.
4. Confirm no obvious regressions in critical paths.
5. Summarize behavior changes and residual risks.

## Validation Commands
Use npm scripts already defined in this repo:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Additional targeted commands:

```bash
npm run test:payment
npm run test:coverage
```

## Coding Rules
- Prefer server-side validation for any user-provided data.
- Add or update types before adding runtime workarounds.
- Avoid `any` unless unavoidable and justified.
- Keep functions focused; extract helpers for repeated logic.
- Use clear error messages with enough diagnostic context.
- Add comments only for non-obvious decisions.

## API and Data Contracts
- Do not break existing response shapes without migration strategy.
- Treat persisted data schema changes as explicit migrations.
- For new fields, define defaults and nullability intentionally.
- Validate external payloads at boundaries.

## Performance Expectations
- Avoid unnecessary client re-renders and heavy synchronous work.
- Keep bundle impact in mind for shared UI modules.
- Prefer pagination/chunking for potentially large datasets.

## Observability and Debuggability
- Preserve useful logs around imports, sync, and webhook processing.
- Avoid logging sensitive data (tokens, secrets, PII-heavy payloads).
- Include contextual identifiers (user/team/import/job IDs) when safe.

## Definition of Done
A change is done when:
- Behavior is implemented and matches requested scope.
- Lint/type/tests for impacted areas pass.
- Critical paths (imports, analytics correctness, auth, payments) remain intact.
- Notes include what changed, why, and any follow-up work.

## Non-Goals for Routine Tasks
- Large design overhauls unrelated to request.
- Cross-cutting refactors without measurable benefit.
- Dependency upgrades unless required to complete the task.

## Escalation Guidance
Escalate to a human reviewer when:
- Financial calculations produce ambiguous results.
- Broker payload changes require domain interpretation.
- Security/auth edge cases are uncertain.
- Payment lifecycle events conflict or duplicate unexpectedly.

## Recent Changes (Last 30 Commits, Detailed)

1. `de50c3f7` (2026-02-09) - Fix dashboard subscription request loop  
   Scope: billing + subscription hook (`hooks/use-subscription.tsx`, `server/billing.ts`)  
   Diff size: 2 files changed, 29 insertions, 13 deletions

2. `87a66fa5` (2026-02-09) - fix(tradovate): improve synchronization error handling and auth checks  
   Scope: Tradovate sync actions/route/context (`app/[locale]/dashboard/components/import/tradovate/actions.ts`, `app/api/tradovate/synchronizations/route.ts`, `context/tradovate-sync-context.tsx`)  
   Diff size: 3 files changed, 12 insertions, 3 deletions

3. `66b95b6e` (2026-02-09) - fix(prisma): remove deprecated datasource url fields for prisma 7  
   Scope: Prisma schema compatibility cleanup (`prisma/schema.prisma`)  
   Diff size: 1 file changed, 2 deletions

4. `8405f848` (2026-02-08) - Stabilize import/account sync and align core runtime config  
   Scope: broad runtime + sync hardening across admin actions, import UI, cron renewal, root API route, data provider, Supabase/Prisma/auth/database layers, build config  
   Key files: `context/data-provider.tsx`, `server/database.ts`, `prisma/schema.prisma`, `proxy.ts`, `scripts/sync-stack.mjs`, `next.config.ts`, `package.json`  
   Diff size: 19 files changed, 308 insertions, 408 deletions

5. `b1b2128f` (2026-02-08) - Extend basic trade visibility window to 3 months  
   Scope: dashboard data-loading window and backing query logic (`context/data-provider.tsx`, `server/database.ts`)  
   Diff size: 2 files changed, 7 insertions, 7 deletions

6. `b4912810` (2026-02-08) - Harden Prisma pooling for high-concurrency serverless traffic  
   Scope: connection strategy + docs/env guidance (`lib/prisma.ts`, `.env.example`, `README.md`)  
   Diff size: 3 files changed, 73 insertions, 8 deletions

7. `515c83f7` (2026-02-08) - Fix Zod error property usage in validation test  
   Scope: test correction for Zod error shape (`test-validation-fix.ts`)  
   Diff size: 1 file changed, 3 insertions, 3 deletions

8. `700220e7` (2026-02-08) - Fix trade import validation: handle string numbers and null groupId  
   Scope: import validation reliability in trade ingestion + supporting test/docs (`server/database.ts`, `test-validation-fix.ts`, `IMPORT_FIX_SUMMARY.md`)  
   Diff size: 3 files changed, 284 insertions, 7 deletions

9. `2379de45` (2026-02-08) - docs: update AGENTS.md with last 30 commits  
   Scope: agent guidance changelog refresh (`public/AGENTS.md`)  
   Diff size: 1 file changed, 31 insertions, 21 deletions

10. `43b8e9c0` (2026-02-08) - docs: update AGENTS.md with latest changes and cache guidelines  
    Scope: agent workflow/docs updates (`public/AGENTS.md`)  
    Diff size: 1 file changed, 21 insertions, 20 deletions

11. `0ef14304` (2026-02-08) - fix: resolve Tradovate sync and trade import data visibility issues  
    Scope: large cross-cut fix touching import flow, dashboard import UI, Tradovate context/actions, Prisma access layer, locale strings, cron/email/team APIs, billing/shared server services, and load testing scripts  
    Key files: `app/[locale]/dashboard/components/import/*`, `context/tradovate-sync-context.tsx`, `server/database.ts`, `lib/prisma.ts`, `prisma/schema.prisma`, `scripts/loadtest/k6-smoke.js`  
    Diff size: 32 files changed, 673 insertions, 424 deletions

12. `0698a700` (2026-02-08) - Add bulk sync translations for Tradovate  
    Scope: i18n additions for bulk sync text (`locales/en.ts`, `locales/fr.ts`)  
    Diff size: 2 files changed, 14 insertions

13. `f0b751c9` (2026-02-08) - Update Tradovate sync route and context  
    Scope: API/context logic updates for sync lifecycle (`app/api/tradovate/sync/route.ts`, `context/tradovate-sync-context.tsx`)  
    Diff size: 2 files changed, 71 insertions, 31 deletions

14. `420e9516` (2026-02-08) - Handle Prisma P3005 by baselining migrations in CI build  
    Scope: CI/db sync script resilience (`scripts/sync-stack.mjs`)  
    Diff size: 1 file changed, 52 insertions, 1 deletion

15. `6a109794` (2026-02-08) - Fix client crash and add Prisma DB sync in build  
    Scope: crash fix + build pipeline DB synchronization (`app/layout.tsx`, `package.json`, `scripts/sync-stack.mjs`)  
    Diff size: 3 files changed, 73 insertions, 33 deletions

16. `803a85ff` (2026-02-08) - chore: update chart-the-future-panel  
    Scope: dashboard chart panel adjustments (`app/[locale]/dashboard/components/chart-the-future-panel.tsx`)  
    Diff size: 1 file changed, 5 insertions, 3 deletions

17. `d682678d` (2026-02-08) - chore: update dashboard and api components  
    Scope: dashboard component/API cleanup and database updates (`app/[locale]/dashboard/page.tsx`, `app/api/thor/store/route.ts`, `server/database.ts`)  
    Diff size: 5 files changed, 305 insertions, 866 deletions

18. `1694ca10` (2026-02-08) - chore: force update codebase  
    Scope: page-level updates across dashboard and teams routes  
    Key files: `app/[locale]/dashboard/*/page.tsx`, `app/[locale]/teams/dashboard/page.tsx`  
    Diff size: 9 files changed, 81 insertions, 72 deletions

19. `4e02294f` (2026-02-08) - chore: Clean up unused files and components  
    Scope: major repository cleanup; removed many audit/docs artifacts and deprecated UI/lib modules; updated home/import/sidebar/webhook/team-invite/next-config paths; added component analysis script and import platform card  
    Key files: `app/[locale]/dashboard/components/import/components/platform-card.tsx`, `scripts/analyze-components.js`, `next.config.ts`  
    Diff size: 46 files changed, 1308 insertions, 6292 deletions

20. `bc037040` (2026-02-08) - chore: update codebase  
    Scope: home page component and sidebar integration updates  
    Key files: `app/[locale]/(home)/components/*`, `components/ui/sidebar.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 8 files changed, 207 insertions, 148 deletions

21. `96305917` (2026-02-08) - Revert home page sidebar changes  
    Scope: rollback in home content/sidebar behavior (`app/[locale]/(home)/components/HomeContent.tsx`)  
    Diff size: 1 file changed, 22 insertions, 103 deletions

22. `83e7aef2` (2026-02-08) - Update Hero metrics and messaging  
    Scope: landing hero content metrics/copy (`app/[locale]/(home)/components/Hero.tsx`)  
    Diff size: 1 file changed, 13 insertions, 13 deletions

23. `4e216b30` (2026-02-08) - Add dashboard chart and update widget/sidebar integration  
    Scope: new tradingview chart component, widget registry/lazy widget wiring, dashboard types, teams manage layout, sidebar integration  
    Key files: `app/[locale]/dashboard/components/charts/tradingview-chart.tsx`, `app/[locale]/dashboard/config/widget-registry.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 7 files changed, 361 insertions, 83 deletions

24. `0aa08895` (2026-02-08) - Unify widget shell styling and dashboard UI updates  
    Scope: dashboard widget shell refactor, quick action cards removal, sidebar/dialog/email/newsletter context updates  
    Key files: `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/page.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 7 files changed, 114 insertions, 278 deletions

25. `2568eb50` (2026-02-08) - Reduce dashboard widget grid gap to 6x6  
    Scope: layout spacing tweak (`app/[locale]/dashboard/components/widget-canvas.tsx`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

26. `e98800d3` (2026-02-08) - Optimize dashboard widget loading with lazy split and mobile summary fix  
    Scope: lazy widget loading architecture, registry updates, navbar/PnL summary adjustments, package updates  
    Key files: `app/[locale]/dashboard/components/lazy-widget.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/config/widget-registry.tsx`  
    Diff size: 6 files changed, 335 insertions, 534 deletions

27. `9fd43041` (2026-02-08) - doc updates  
    Scope: docs + dashboard summary text update (`README.md`, `docs/PAYMENT_SYSTEM_GUIDE.md`, `app/[locale]/dashboard/components/pnl-summary.tsx`)  
    Diff size: 3 files changed, 16 insertions, 1 deletion

28. `3cf798c0` (2026-02-08) - Refresh data provider context  
    Scope: data context behavior refresh (`context/data-provider.tsx`)  
    Diff size: 1 file changed, 3 insertions, 3 deletions

29. `09dba7b6` (2026-02-08) - Update French terms localization  
    Scope: FR legal terms update (`locales/fr/terms.ts`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

30. `2476e6b6` (2026-02-08) - Update terms localization  
    Scope: EN legal terms update (`locales/en/terms.ts`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

---

## Recent Changes (Complete History - 24 Commits, Updated 2026-02-10 22:28 IST)

### 📊 Repository Overview
- **Total Commits**: 24
- **Primary Author**: Timon
- **Date Range**: 2026-02-09 to 2026-02-10
- **Major Focus Areas**: Data normalization, dashboard redesign, widget system, enterprise hardening

---

### 🔥 Critical Infrastructure Changes

#### 1. `a5454a7` (2026-02-10) - **Refactor: Centralize data normalization and fix type mismatches**
**Author**: Timon  
**Impact**: 🔴 HIGH - Breaking changes to data handling patterns

**What Changed**:
- Centralized all trade/account normalization logic in `lib/data-types.ts`
- Fixed decimal/number type mismatches across dashboard components
- Introduced `normalizeTradesForClient()` and `normalizeAccountsForClient()` helpers
- Updated all server actions to return properly serialized data

**Files Modified**: 8 files
- `lib/data-types.ts` - New centralized normalization module
- Dashboard components - Updated to use new normalization patterns
- Server actions - Standardized serialization

**Migration Required**: ✅ Yes
- Any code fetching trades/accounts must use new normalization helpers
- Direct access to Decimal fields will cause type errors

**Technical Debt**: Resolved floating-point precision issues, improved type safety

---

#### 2. `146a0a6` (2026-02-10) - **Refactor: Normalize trade and account data types**
**Author**: Timon  
**Impact**: 🔴 HIGH - Cross-cutting type system improvements

**What Changed**:
- Ensured consistent data handling between server and client
- Standardized on JavaScript numbers for client-side operations
- Removed string-to-number conversions scattered across codebase
- Updated `DataProvider` context for consistent normalization

**Files Modified**: 12+ files
- `context/data-provider.tsx` - Core data context updates
- Multiple server actions - Consistent serialization patterns
- Dashboard widgets - Updated data consumption

**Performance Impact**: 📈 Positive - Reduced unnecessary type conversions

---

#### 3. `78d30f2` (2026-02-10) - **Fix TypeScript decimal errors**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Build compilation fixes

**What Changed**:
- Resolved Prisma Decimal type compilation errors
- Added proper type guards for Decimal handling
- Fixed edge cases in numeric field access

**Files Modified**: 3 files

---

#### 4. `1d6979a` (2026-02-10) - **Implement enterprise hardening sweep**
**Author**: Timon  
**Impact**: 🔴 HIGH - Production deployment critical

**What Changed**:
- Massive file count - entire codebase initialization
- Security enhancements across auth boundaries
- Performance optimizations for database queries
- Reliability improvements in error handling
- Complete migration system setup

**Files Modified**: 500+ files (full codebase)
- Complete Prisma migration history
- All server actions
- Authentication system
- Payment webhooks
- Team management
- Import pipelines

**Deployment Notes**:
- Run all Prisma migrations before deployment
- Verify environment variables are configured
- Test webhook endpoints in staging first

---

### 🎨 Dashboard & UI Improvements

#### 5. `2b5cda3` (2026-02-10) - **fix: resolve build errors in free-users-table.tsx**
**Author**: Timon  
**Impact**: 🟡 MEDIUM

**Files Modified**: 1 file
- `app/[locale]/dashboard/teams/admin/free-users-table.tsx`

**What Changed**: Fixed Date object handling in admin tables

---

#### 6. `0f0ecf7` (2026-02-10) - **feat: redesign dashboard customization UI**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - UX enhancement

**What Changed**:
- Redesigned dashboard edit mode
- Fixed trade serialization for open trades (no close date)
- Improved widget customization flow
- Better user feedback during edits

**User-Facing**: ✅ Yes - Better dashboard customization experience

---

#### 7. `620c6b0` (2026-02-10) - **Merge branch 'main'**
**Author**: Timon  
**Type**: Repository maintenance

---

#### 8. `630181f` (2026-02-10) - **feat: initial commit from local codebase**
**Author**: Timon  
**Impact**: 🔴 CRITICAL - Initial repository setup

**Files Added**: Entire codebase
**Purpose**: First commit establishing the repository structure

---

#### 9. `f3c385c` (2026-02-10) - **Remove widget hover effects and set black surfaces**
**Author**: Timon  
**Impact**: 🟢 LOW - Visual polish

**What Changed**:
- Removed distracting hover effects from widgets
- Applied consistent black surface styling
- Cleaner, more professional appearance

**User-Facing**: ✅ Yes - Visual consistency improvement

---

#### 10. `dde6403` (2026-02-10) - **Fix dashboard edit button**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - User experience fix

**What Changed**: Restored functionality to dashboard edit mode toggle

---

#### 11. `4b1561e` (2026-02-10) - **fix(dashboard): make navbar edit toggle reliable**
**Author**: Timon  
**Impact**: 🟡 MEDIUM

**What Changed**:
- Fixed state management in dashboard navbar
- Made edit mode toggle work consistently on dashboard root
- Resolved race conditions in edit state

---

### 📈 Chart & Visualization Updates

#### 12. `6caa114` (2026-02-10) - **Add explicit no-data states to chart cards**
**Author**: Timon  
**Impact**: 🟢 LOW - UX improvement

**What Changed**: Added comprehensive empty states to all remaining dashboard charts

---

#### 13. `ad2bf84` (2026-02-10) - **Show explicit empty states for chart widgets**
**Author**: Timon  
**Impact**: 🟢 LOW - UX improvement

**What Changed**: Improved user feedback when charts have no data to display

---

#### 14. `c32011a` (2026-02-10) - **Strengthen chart visual surfaces**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Visual polish

**What Changed**:
- Enhanced chart readability with better contrast
- Improved visual hierarchy in charts
- Better accessibility for chart data

---

#### 15. `9ec1fcd` (2026-02-10) - **Redesign charts with modern unified surface**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Design system update

**What Changed**:
- Complete chart design system overhaul
- Consistent modern styling across all charts
- Unified color palette and typography
- Better responsive behavior

**User-Facing**: ✅ Yes - Significantly improved chart aesthetics

---

#### 16. `efdc377` (2026-02-10) - **Adjust widget grid sizing**
**Author**: Timon  
**Impact**: 🟢 LOW

**Files Modified**: 1 file
- `app/[locale]/dashboard/components/widget-canvas.tsx`

**What Changed**: Fine-tuned widget grid layout calculations

---

#### 17. `998bb7e` (2026-02-09) - **Fix widget canvas sizing**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Layout bug fix

**What Changed**:
- Prevented widget clipping and dead space
- Improved responsive grid calculations
- Better widget positioning on all screen sizes

---

#### 18. `84b1456` (2026-02-09) - **Explain widget layout gaps**
**Author**: Timon  
**Impact**: 🟢 LOW - Documentation

**What Changed**: Added code comments explaining widget spacing logic

---

### ⚡ Performance & Infrastructure

#### 19. `8ff44a6` (2026-02-09) - **Extend opengraph cache headers**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - SEO & performance

**Files Modified**: 1 file
- `next.config.ts`

**What Changed**:
- Extended cache duration for OpenGraph images
- Improved social media preview loading
- Better CDN utilization

**Technical**: Optimized for Vercel Edge Network

---

#### 20. `b3cacdf` (2026-02-09) - **Analyze best hosting provider**
**Author**: Timon  
**Type**: Documentation/Analysis

**Purpose**: Infrastructure planning and provider evaluation

---

#### 21. `509146f` (2026-02-09) - **Optimize Vercel Edge middleware**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Performance improvement

**What Changed**:
- Optimized Edge middleware request path
- Reduced latency for API routes
- Better edge function performance

**Performance**: 📈 Faster API response times

---

### 🔄 Integration & Sync

#### 22. `8691d26` (2026-02-09) - **Replace dashboard widgets from upstream repo**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - External integration

**What Changed**:
- Synchronized widget implementations with upstream repository
- Pulled latest widget improvements
- Updated widget component library

**Source**: External repository sync (likely from deltalytix)

---

#### 23. `a5843eb` (2026-02-09) - **chore: fresh sync before dual remote push**
**Author**: Timon  
**Type**: Repository maintenance

**Purpose**: Preparation for multi-remote push

---

#### 24. `7d6d680` (2026-02-09) - **Fix post-import client crash**
**Author**: Timon  
**Impact**: 🔴 HIGH - Critical bug fix

**Files Modified**: 2 files (~250 lines changed)
- `app/[locale]/dashboard/components/import/import-button.tsx` (+467 lines)
- `context/data-provider.tsx` (+1783 lines)

**What Changed**:
- Fixed client-side crashes occurring after trade imports
- Improved import flow responsiveness
- Better error boundary handling
- Enhanced state management during imports

**Bug Fixed**: App would crash when importing large trade datasets
**User Impact**: ✅ Critical - Prevented data loss and app crashes

---

## 🎯 Key Theme Analysis

### Data Architecture
**Commits**: #1, #2, #3, #24  
**Focus**: Type safety, serialization, normalization  
**Impact**: Foundation for reliable financial data handling

### Dashboard Experience
**Commits**: #5, #6, #9, #10, #11, #16, #17  
**Focus**: Edit mode, customization, layout  
**Impact**: Improved user control over dashboard

### Visual Design
**Commits**: #12, #13, #14, #15, #18  
**Focus**: Charts, empty states, consistency  
**Impact**: Modern, professional appearance

### Performance
**Commits**: #19, #21  
**Focus**: Caching, edge optimization  
**Impact**: Faster load times, better CDN utilization

### External Integration
**Commits**: #22  
**Focus**: Upstream widget sync  
**Impact**: Access to latest widget features

---

## 🔧 Engineering Insights

### Migration Requirements
**Required Actions**:
1. Update all data fetch patterns to use new normalization helpers from `lib/data-types.ts`
2. Run Prisma migrations before deploying commit #4
3. Verify environment variables match new security requirements
4. Test import flows thoroughly (commit #24 fixes critical crashes)

### Testing Priority
**High Priority**:
- [ ] Import flows with large datasets (>100 trades)
- [ ] Dashboard edit mode toggle and persistence
- [ ] Widget drag-and-drop with new grid system
- [ ] Chart rendering with empty data states

**Medium Priority**:
- [ ] OpenGraph previews on social platforms
- [ ] Edge function latency measurements
- [ ] Widget customization across mobile/desktop

### Known Issues
1. **Large Import Performance**: Imports >1000 trades may cause temporary UI lag (commit #24)
2. **Widget Resize**: Some edge cases in grid calculations may need refinement (commit #16, #17)

### Technical Debt Resolved
✅ Floating-point precision in financial calculations (commits #1-3)  
✅ Inconsistent data normalization patterns  
✅ Scattered type conversions  
✅ Widget styling inconsistencies

---

## 📝 Notes for AI Agents

### When Modifying Trade/Account Data
- **Always** use normalization helpers from `lib/data-types.ts`
- Server actions should return serialized data (numbers as strings)
- Client components normalize to JS numbers
- Never perform financial calculations on string types

### When Working on Dashboard
- Edit mode state is managed in navbar component
- Widget grid uses CSS Grid with calculated dimensions
- Dark surfaces are intentional (black backgrounds)
- Empty states are required for all chart widgets

### When Optimizing Performance
- Target Vercel Edge Network specifically
- Use appropriate cache headers (see commit #19)
- Consider edge middleware for API routes (commit #21)

### When Handling Imports
- Implement proper error boundaries (commit #24)
- Handle large datasets with chunking/pagination
- Provide user feedback during long operations
- Test with >1000 trade imports

