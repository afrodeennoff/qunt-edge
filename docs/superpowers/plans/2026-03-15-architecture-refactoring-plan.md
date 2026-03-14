# Qunt Edge Architecture Refactoring Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Refactor the Next.js + TypeScript SaaS repository into a clean, scalable, production-ready architecture while preserving current behavior.

**Architecture:** Phased modular refactoring with backward-compatibility shims, targeting domain-driven boundaries (AI, Trading, Charts, Database, UI).

**Tech Stack:** Next.js 14+ App Router, TypeScript, Prisma, shadcn/ui, Recharts, Zustand, Supabase Auth

---

## Phase 1: Structural Discovery Summary

### Repository Topology (Before)

```
qunt-edge/
├── app/
│   ├── [locale]/
│   │   ├── (home)/          # Landing home variants
│   │   ├── (landing)/       # Marketing pages (massive)
│   │   ├── (authentication)/ # Auth routes
│   │   ├── dashboard/       # Main SaaS dashboard
│   │   │   └── components/  # 50+ subfolders - DUMPING GROUND
│   │   ├── teams/           # Team features
│   │   ├── admin/           # Admin tools
│   │   ├── embed/           # Embedded charts
│   │   └── shared/          # Shared layouts
│   └── api/                 # 50+ API routes
│       ├── ai/
│       ├── cron/
│       ├── email/
│       ├── imports/
│       ├── whop/
│       └── ...
├── components/
│   ├── ui/                  # shadcn primitives
│   └── ...                  # Shared components
├── context/                 # React context (large)
├── hooks/                   # Custom hooks (30+)
├── lib/                     # Utilities, clients
├── server/                  # Server actions, services
├── store/                   # Zustand stores (25+)
├── prisma/                  # Schema + migrations
├── tests/                   # Test suites
├── docs/                    # Scattered documentation
└── scripts/                 # Build/analysis scripts
```

---

## Phase 2: Structural Problems Identified

### CRITICAL (Severity 1)

| # | Problem | Evidence | Impact |
|---|---------|----------|--------|
| C1 | **Client imports server actions directly into UI components** | `context/data-provider.tsx` imports Prisma models + server actions; `import-button.tsx` calls `saveTradesAction` | Hard to test, high blast radius for domain changes |
| C2 | **Business logic in API routes instead of orchestration** | `app/api/admin/reports/route.ts:106`, `app/api/cron/compute-trade-data/route.ts:133` embed full workflows | Maintenance nightmare, inconsistent error handling |
| C3 | **Rithmic credentials in localStorage (includes password)** | `lib/rithmic-storage.ts:3,27,49` stores passwords in plaintext | Critical security vulnerability |
| C4 | **Admin auth policy split** | Middleware uses raw env IDs while API uses `assertAdminAccess` | Policy drift risk |

### HIGH (Severity 2)

| # | Problem | Evidence | Impact |
|---|---------|----------|--------|
| H1 | **Duplicate chart implementations** | Dashboard + embed have identical charts: `pnl-bar-chart.tsx`, `trade-distribution.tsx`, etc. | Bugfixes must be repeated, drift already visible |
| H2 | **Route group boundary leakage** | `(home)` depends on `(landing)` internals: `layout.tsx:1` imports marketing shell | Route groups don't represent clear boundaries |
| H3 | **Monolith service files** | `server/trades.ts:175`, `server/accounts.ts:264`, `server/webhook-service.ts:313` | Single points of failure, impossible to test in isolation |
| H4 | **Import UI logic leaked into client** | ATAS processor, Rithmic order processor in UI components | Tight coupling, hard to reuse |
| H5 | **Token storage inconsistency** | Tradovate encrypted tokens skipped in renewal path | Data integrity risk |

### MEDIUM (Severity 3)

| # | Problem | Evidence | Impact |
|---|---------|----------|--------|
| M1 | **Dashboard components directory is a dumping ground** | 50+ subfolders mixing nav, charts, imports, chat, filters | Ownership ambiguity, low discoverability |
| M2 | **No repository layer** | Direct `prisma.*` calls everywhere | Query duplication, inconsistent transactions |
| M3 | **Marketing component scatter** | Duplicate Hero/Features/HowItWorks in `(home)` and `(landing)` | Brand drift, duplicated work |
| M4 | **Inconsistent transport concerns** | Some routes thin, others duplicate auth/validation inline | Non-uniform behavior |
| M5 | **Tests split across locations** | `tests/` and `lib/__tests__/` with overlapping scope | Confusion, duplicate config |

---

## Phase 3: Target Architecture (After)

### Proposed Structure

```
qunt-edge/
├── apps/
│   └── web/                        # Main Next.js application
│       ├── app/
│       │   ├── api/               # API routes (THIN - orchestration only)
│       │   ├── [locale]/
│       │   │   ├── auth/          # Authentication routes
│       │   │   ├── marketing/      # Consolidated marketing pages
│       │   │   ├── dashboard/     # Main dashboard
│       │   │   ├── teams/         # Team features
│       │   │   ├── admin/         # Admin tools
│       │   │   └── embed/        # Embedded charts
│       │   ├── layout.tsx
│       │   └── error.tsx
│       ├── components/
│       │   ├── ui/               # shadcn primitives
│       │   └── shared/           # Cross-cutting components
│       ├── hooks/               # Application hooks
│       └── lib/                 # Application utilities
│
├── packages/
│   ├── ai/                       # AI services
│   │   ├── client/              # AI client abstraction
│   │   ├── router/              # Provider routing
│   │   ├── prompts/             # Prompt templates
│   │   ├── tools/               # AI tool definitions
│   │   ├── safety/              # Prompt safety, filtering
│   │   └── telemetry/           # Usage tracking
│   │
│   ├── trading/                 # Trading domain
│   │   ├── analytics/           # PnL, metrics, VaR
│   │   ├── imports/             # Trade import integrations
│   │   │   ├── core/           # Shared import contracts
│   │   │   ├── tradovate/      # Tradovate integration
│   │   │   ├── rithmic/        # Rithmic integration
│   │   │   ├── atas/           # ATAS integration
│   │   │   ├── etp/            # ETP integration
│   │   │   ├── thor/           # THOR integration
│   │   │   └── ibkr/           # IBKR integration
│   │   └── performance/         # Performance calculations
│   │
│   ├── charts/                   # Chart system
│   │   ├── core/                # Base chart primitives
│   │   ├── pnl/                 # PnL charts
│   │   ├── distribution/        # Distribution charts
│   │   ├── time/                # Time-based charts
│   │   └── adapters/            # Route-specific adapters
│   │       ├── dashboard/
│   │       └── embed/
│   │
│   ├── database/                 # Data access layer
│   │   ├── prisma/             # Schema + generated client
│   │   └── repositories/        # Repository implementations
│   │       ├── trade.repository.ts
│   │       ├── account.repository.ts
│   │       ├── team.repository.ts
│   │       └── subscription.repository.ts
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── components/         # Feature-agnostic UI
│   │   ├── layout/             # Layout components
│   │   └── widgets/            # Reusable widgets
│   │
│   └── shared/                  # Cross-cutting concerns
│       ├── auth/               # Auth utilities
│       ├── errors/             # Error handling
│       ├── rate-limit/         # Rate limiting
│       ├── cache/              # Caching utilities
│       └── telemetry/          # Logging, monitoring
│
├── infrastructure/             # DevOps & configs
│   ├── scripts/                # Build scripts
│   ├── ci/                    # CI/CD configurations
│   └── configs/               # Shared configs
│
├── docs/                      # Documentation
│   ├── architecture/         # Architecture decisions
│   ├── api/                   # API documentation
│   └── guides/                # How-to guides
│
├── tests/                     # Test suites (consolidated)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── public/                    # Static assets
```

### Architecture Rules (Enforced)

1. **UI must not contain business/domain logic** — Components only render and call hooks
2. **Business logic belongs in packages/** — Pure functions, no React/Next dependencies
3. **Database access through repositories** — No direct Prisma in routes/components
4. **API routes are thin orchestrators** — Parse → Validate → Call Service → Map Response
5. **AI requests go through packages/ai** — All AI interaction uses shared modules
6. **No cross-feature coupling** — Feature imports only from itself + shared packages
7. **Strict TypeScript boundaries** — No `any`, explicit types everywhere

---

## Phase 4: Migration Plan

### Batch 1: Chart Consolidation (Safe Start)

**Rationale:** Visual consistency, no business logic, clear duplication evidence

| From | To | Status |
|------|-----|--------|
| `app/[locale]/dashboard/components/charts/*.tsx` | `packages/charts/adapters/dashboard/` | Adapter |
| `app/[locale]/embed/components/*.tsx` | `packages/charts/adapters/embed/` | Adapter |
| Create `packages/charts/core/` | New | Core primitives |

**Compatibility:** Keep old files as thin re-exports until full migration

### Batch 2: AI Module Extraction

**Rationale:** Security hardening already done, clear boundaries exist

| From | To | Status |
|------|-----|--------|
| `lib/ai/client.ts` | `packages/ai/client/index.ts` | Move |
| `lib/ai/router/*` | `packages/ai/router/` | Move |
| `lib/ai/prompt-safety.ts` | `packages/ai/safety/index.ts` | Move |
| `app/api/ai/*/route.ts` | Thin to `app/api/ai/` | Refactor |

### Batch 3: Trading Imports Domain

**Rationale:** Critical security issues (Rithmic localStorage), clear provider boundaries

| From | To | Status |
|------|-----|--------|
| `server/imports/tradovate-actions.ts` | `packages/trading/imports/tradovate/` | Domain |
| `server/imports/rithmic-sync-actions.ts` | `packages/trading/imports/rithmic/` | Domain |
| `app/[locale]/dashboard/components/import/atas/atas-processor.tsx` | `packages/trading/imports/atas/` | Pure function |
| Create `packages/trading/imports/core/` | New | Contracts |

**Security Critical:** Fix Rithmic localStorage password storage in this batch

### Batch 4: Database Repository Layer

**Rationale:** Reduce direct Prisma coupling, enable testing

| From | To | Status |
|------|-----|--------|
| Create `packages/database/repositories/` | New | Repositories |
| Refactor `server/trades.ts` | Use repositories | Refactor |
| Refactor `server/accounts.ts` | Use repositories | Refactor |
| Refactor routes | Use repositories | Refactor |

### Batch 5: API Route Simplification

**Rationale:** Make routes thin orchestrators

| From | Action |
|------|--------|
| `app/api/admin/reports/route.ts` | Move logic to service, keep route as adapter |
| `app/api/cron/compute-trade-data/route.ts` | Move to `packages/trading/analytics/` |
| `app/api/cron/investing/route.ts` | Move to domain service |
| `app/api/team/invite/route.ts` | Move to application layer |

### Batch 6: UI/Domain Separation

**Rationale:** Remove client-side business logic

| From | Action |
|------|--------|
| `context/data-provider.tsx` | Remove direct server imports, use hooks |
| `app/[locale]/dashboard/components/import/import-button.tsx` | Use facade actions |
| `app/[locale]/dashboard/components/mindset/mindset-widget.tsx` | Use facade actions |

### Batch 7: Route Group Cleanup

**Rationale:** Clear boundaries

| From | To | Status |
|------|-----|--------|
| `app/[locale]/(home)/` | `app/[locale]/marketing/home/` | Move |
| `app/[locale]/(landing)/` | `app/[locale]/marketing/` | Consolidate |
| Create `components/layout/marketing-shell.tsx` | New | Shared |

---

## Phase 5: Safe Delete Candidates

### Immediately Safe (No Dependencies)

- `app/[locale]/(home)/components/ProblemStatement.tsx` → merged into marketing
- Duplicate component re-exports after Batch 1-7
- Legacy wrapper files after compatibility period
- `.next/` directory (build artifact, regenerated)

### After Migration Complete

- Old chart files in dashboard/embed after adapters mature
- Duplicate server action files (e.g., token generation copies)
- Legacy import paths in `server/` after all callers migrate

### Archive Instead of Delete

- Historical AGENTS.md snapshots → `docs/archive/`
- Old test configs → `docs/archive/configs/`

---

## Phase 6: Verification Gates

All refactors must pass before merge:

```bash
# Type safety
npm run typecheck

# Lint (zero errors required)
npm run lint

# Build
npm run build

# Tests (all passing)
npm test

# Route integrity
npm run check:route-budgets
```

### Migration-Specific Checks

- No new circular dependencies introduced
- No `any` types added to new code
- No direct Prisma imports outside `packages/database/`
- No server imports in UI components (except explicit action hooks)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Route breakage during file moves | Medium | High | Compatibility re-exports, incremental PRs |
| Circular dependencies | Medium | High | ESLint boundary rules, dependency audit |
| Test failures | Low | Medium | Run tests after each batch |
| Behavior regression | Low | High | Keep feature flags, verify manually |

---

## Implementation Priority

1. **Week 1:** Chart Consolidation (Batch 1) + ESLint rules
2. **Week 2:** AI Module Extraction (Batch 2)
3. **Week 3:** Trading Imports Security Fix (Batch 3) - CRITICAL
4. **Week 4:** Repository Layer (Batch 4)
5. **Week 5-6:** API Route Simplification (Batch 5)
6. **Week 7-8:** UI/Domain Separation (Batch 6)
7. **Week 9:** Route Group Cleanup (Batch 7)
8. **Week 10:** Verification + Documentation

---

## Success Criteria

- [ ] Zero direct Prisma imports outside `packages/database/`
- [ ] All API routes under 100 lines (orchestration only)
- [ ] No business logic in UI components
- [ ] Charts consolidated into single package with adapters
- [ ] AI routing through `packages/ai` only
- [ ] Trading imports have clear domain boundaries
- [ ] All tests passing
- [ ] Build passes
- [ ] Typecheck passes with zero errors
- [ ] ESLint passes with zero errors

---

*Document Version: 1.0*
*Created: 2026-03-15*
*Last Updated: 2026-03-15*
