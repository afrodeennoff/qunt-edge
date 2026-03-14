# Architecture Refactor Program - 2026-03-15

## 1) Architecture Analysis

### Repository topology snapshot
- Total tracked source files (`rg --files`): `1338`
- TS/TSX counts by top-level area:
  - `app`: `491`
  - `components`: `129`
  - `lib`: `135`
  - `server`: `28`
  - `store`: `29`
- Top dense app directories:
  - `app/[locale]/dashboard/components/filters` (`22` files)
  - `app/[locale]/dashboard/components` (`20` files)
  - `app/[locale]/(home)/components` (`20` files)
  - `app/[locale]/(landing)/components` (`18` files)
  - `app/api/ai/chat/tools` (`17` files)
  - `app/[locale]/dashboard/components/charts` (`15` files)

### High-level architectural picture
- App Router + API routes currently carry mixed concerns (transport, orchestration, domain logic).
- Dashboard and import flows have become feature hubs with cross-layer coupling.
- AI stack has strong foundational modules (`lib/ai/router`, guard, safety), but handlers still own orchestration logic.
- Data access is spread across `app`, `server`, `lib` instead of repository-only boundaries.

## 2) Structural Problem List (Severity + Evidence)

### Critical
1. API handlers with heavy domain logic
- Evidence:
  - `app/api/cron/compute-trade-data/route.ts` (`504` LOC)
  - `app/api/admin/reports/route.ts` (`463` LOC)
  - `app/api/cron/investing/route.ts` (`383` LOC)
  - `app/api/ai/mappings/route.ts` (`373` LOC)
  - `app/api/ai/chat/route.ts` (`362` LOC)

### High
2. API -> UI import boundary violations in import sync
- Evidence:
  - `app/api/tradovate/sync/route.ts` imported from UI path (fixed in this batch)
  - `app/api/tradovate/synchronizations/route.ts` imported from UI path (fixed in this batch)
  - `app/api/rithmic/synchronizations/route.ts` imported from UI path (fixed in this batch)

3. Route-group and marketing sprawl
- Evidence:
  - parallel route groups: `(home)`, `(landing)`, `(authentication)`
  - duplicated public trees: `/updates` and `/_updates`
  - legacy namespace scattering: `deals`, `prop-firm-deals`, `propfirmperk`

4. Dashboard components as dumping ground
- Evidence:
  - `app/[locale]/dashboard/components` large density + mega files
  - many client components importing server/prisma concerns

### Medium
5. Chart duplication across modules
- Evidence:
  - duplicated chart basenames in dashboard + embed
  - repeated net-PnL transformations and tooltip scaffolding

6. Data access boundary leakage
- Evidence:
  - direct `prisma` usage spread across `app` (`33` files), `server` (`23`), `lib` (`9`)

## 3) Before vs After Structure

### Before (current)
- `app/[locale]/(home)`, `app/[locale]/(landing)`, `app/[locale]/(authentication)` all carry mixed ownership.
- `app/[locale]/dashboard/components/import/**` contains UI + integration actions + domain logic.
- `app/api/**` contains thin and non-thin handlers intermixed.
- `lib/ai/**` plus `app/api/ai/**` split responsibilities inconsistently.

### After (target)
```text
apps/
  web/
    app/
      api/
      [locale]/
        auth/
        marketing/
        dashboard/
        teams/
        admin/
        embed/

packages/
  ai/
  trading/
  database/
  charts/
  ui/
  utils/

infrastructure/
  scripts/
  ci/
  configs/
```

### Practical in-repo intermediate target (without monorepo jump)
- `server/imports/*`, `server/services/*`, `server/repositories/*`
- `lib/ai/features/*`, `lib/ai/tools/*`, `lib/ai/prompts/*`, `lib/ai/http/*`
- `app/[locale]/dashboard/charting/*`
- route handlers import only service/orchestrator modules

## 4) File Move Plan (Incremental)

### Batch A (completed in this run)
- `app/[locale]/dashboard/components/import/tradovate/actions.ts` -> `server/imports/tradovate-actions.ts`
- `app/[locale]/dashboard/components/import/rithmic/sync/actions.ts` -> `server/imports/rithmic-sync-actions.ts`
- left compatibility shims at old paths exporting from new server modules
- updated API imports to server modules:
  - `app/api/tradovate/sync/route.ts`
  - `app/api/tradovate/synchronizations/route.ts`
  - `app/api/rithmic/synchronizations/route.ts`

### Batch B (next)
- Extract thor/etp route business logic into `server/imports/thor-service.ts`, `server/imports/etp-service.ts`
- Introduce `server/repositories/synchronization-repo.ts` + migrate sync flows

### Batch C (next)
- Extract AI orchestration from routes to `lib/ai/features/*`
- unify shared handler lifecycle in `lib/ai/http/handlers.ts`

### Batch D (next)
- Introduce dashboard charting shared module and migrate duplicate transforms/tooltips

## 5) Safe Delete Candidates

1. Public `/_updates` route exposure once redirects are explicit and validated.
2. Legacy alias route internals under `propfirmperk/*` once redirect-only wrappers are consolidated.
3. Duplicate chart utility code after extraction to shared charting module.
4. dead/stale inline helper blocks in large route files after service extraction.

All deletes require: route parity checks + grep for import references + targeted tests.

## 6) Implemented Refactor Summary (This Execution)

### What changed
- Removed direct API dependency on UI-owned import action modules.
- Introduced server-owned import action modules.
- Preserved backward compatibility for existing UI imports via re-export shims.

### Files changed
- `server/imports/tradovate-actions.ts` (new, moved)
- `server/imports/rithmic-sync-actions.ts` (new, moved)
- `app/[locale]/dashboard/components/import/tradovate/actions.ts` (shim)
- `app/[locale]/dashboard/components/import/rithmic/sync/actions.ts` (shim)
- `app/api/tradovate/sync/route.ts` (import path update)
- `app/api/tradovate/synchronizations/route.ts` (import path update)
- `app/api/rithmic/synchronizations/route.ts` (import path update)

## 7) Verification Results

- `npx eslint <touched files>`: passes with warnings only (`0` errors).
- `npm run -s typecheck`: passes (`exit 0`).

Notes:
- Warnings in moved tradovate module are pre-existing quality issues (complexity/any/unused), not introduced by this move.

## 8) Residual Risks and Follow-up Backlog

1. Large route handlers still embed domain logic; need service extraction by risk order.
2. AI routes still contain orchestration/policy coupling.
3. Dashboard component coupling and chart duplication remain high.
4. Data access is still not fully repository-bounded.
5. Need import-boundary lint guards to prevent regression (`app/api/**` must never import `app/**/components/**`).

Recommended next execution batch:
- enforce boundary lint rule
- extract thor/etp service layer
- extract one AI route orchestrator (`ai/mappings`) as reference pattern
