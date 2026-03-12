# Three-Track Remediation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver production-safe remediation across Architecture, Security, and Performance with test-first changes and no behavior regressions.

**Architecture:** Execute in 3 independent tracks (Security first, then Architecture boundaries, then Performance hot paths). Each task is small, test-first, and ends with verification + commit. Keep changes DRY/YAGNI and avoid broad refactors outside scoped files.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Prisma, Supabase, Zustand, ESLint.

---

## Scope and Execution Rules

- Work in a dedicated worktree before Task 1.
- Do not bundle unrelated fixes in the same commit.
- For each task: write failing test -> run fail -> minimal fix -> run pass -> commit.
- Run full verification at chunk boundaries.

---

## File Structure Map (What changes where)

### Security Track
- Modify: `server/accounts.ts` (payout ownership, group ownership, delete cache invalidation)
- Modify: `server/layouts.ts` (layout ownership enforcement in version APIs)
- Modify: `server/tags.ts` (derive user from auth, remove caller userId trust)
- Modify: `lib/rate-limit.ts` (production fail-closed + trusted IP precedence)
- Modify: `app/[locale]/admin/actions/weekly-recap.ts` (target user authorization)
- Test: `tests/logger.test.ts`
- Create: `tests/server/accounts-payout-authz.test.ts`
- Create: `tests/server/layout-version-authz.test.ts`
- Create: `tests/server/tags-authz.test.ts`
- Create: `tests/lib/rate-limit-production.test.ts`
- Create: `tests/admin/weekly-recap-authz.test.ts`

### Architecture Track
- Modify: `context/data-provider.tsx` (extract hard boundaries, reduce provider fanout)
- Create: `context/providers/data-state-provider.tsx`
- Create: `context/providers/data-actions-provider.tsx`
- Create: `context/providers/data-derived-provider.tsx`
- Modify: `components/providers/dashboard-providers.tsx` (wire new provider boundaries)
- Modify: selected consumers under `app/[locale]/dashboard/components/**` to narrow hooks
- Create: `tests/context/provider-boundary-regression.test.tsx`

### Performance Track
- Modify: `app/[locale]/dashboard/components/global-sync-button.tsx` (reduce interval churn)
- Modify: `context/rithmic-sync-context.tsx` (visibility-aware ticks, cleanup correctness)
- Modify: `context/tradovate-sync-context.tsx` (visibility-aware ticks, dependency stability)
- Modify: `server/trades.ts` (replace per-row mutation where feasible)
- Modify: `app/[locale]/dashboard/components/tables/trade-table-review.tsx` (memoized selectors/hot path guards)
- Create: `tests/performance/dashboard-polling-regression.test.ts`
- Create: `tests/performance/trades-mutation-batch.test.ts`

---

## Chunk 1: Security Remediation (P0/P1)

### Task 1: Fix logger test instrumentation mismatch

**Files:**
- Modify: `tests/logger.test.ts`
- Test: `tests/logger.test.ts`

- [ ] **Step 1: Write/adjust failing assertion target**
```ts
// Spy on process.stdout.write instead of console.log
const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
```

- [ ] **Step 2: Run test to verify pre-fix failure**
Run: `npx vitest run tests/logger.test.ts`
Expected: FAIL (if still using console.log spy)

- [ ] **Step 3: Implement minimal test fix**
Update test reads from `stdoutSpy.mock.calls[0]?.[0]`.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/logger.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add tests/logger.test.ts
git commit -m "test: align logger assertions with stdout writer"
```

### Task 2: Enforce payout ownership in mutation path

**Files:**
- Modify: `server/accounts.ts`
- Create: `tests/server/accounts-payout-authz.test.ts`
- Test: `tests/server/accounts-payout-authz.test.ts`

- [ ] **Step 1: Write failing authz test**
```ts
it('rejects updating payout not owned by current user', async () => {
  // setup foreign payout id
  await expect(savePayoutAction(payloadWithForeignId)).rejects.toThrow()
})
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/server/accounts-payout-authz.test.ts`
Expected: FAIL (currently allows overwrite path)

- [ ] **Step 3: Implement minimal ownership-safe update/create logic**
In `savePayoutAction`:
- resolve current user
- verify existing payout ownership before update
- create new payout only under owned account

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/server/accounts-payout-authz.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/accounts.ts tests/server/accounts-payout-authz.test.ts
git commit -m "fix(security): enforce payout ownership on updates"
```

### Task 3: Enforce layout ownership for version APIs

**Files:**
- Modify: `server/layouts.ts`
- Create: `tests/server/layout-version-authz.test.ts`
- Test: `tests/server/layout-version-authz.test.ts`

- [ ] **Step 1: Write failing tests for each action**
```ts
it('blocks createLayoutVersionAction for foreign layout', async () => { ... })
it('blocks getLayoutVersionHistoryAction for foreign layout', async () => { ... })
it('blocks getLayoutVersionByNumberAction for foreign layout', async () => { ... })
it('blocks cleanupOldLayoutVersionsAction for foreign layout', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/server/layout-version-authz.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ownership guard helper**
Add `assertLayoutOwnership(layoutId)` and call it in all 4 actions.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/server/layout-version-authz.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/layouts.ts tests/server/layout-version-authz.test.ts
git commit -m "fix(security): require ownership for layout version operations"
```

### Task 4: Remove caller userId trust from tags API

**Files:**
- Modify: `server/tags.ts`
- Create: `tests/server/tags-authz.test.ts`
- Test: `tests/server/tags-authz.test.ts`

- [ ] **Step 1: Write failing test**
```ts
it('derives tag query scope from authenticated user', async () => {
  const tags = await getTagsAction()
  expect(tags.every(t => t.userId === mockedAuthUserId)).toBe(true)
})
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/server/tags-authz.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal fix**
Change `getTagsAction(userId)` -> `getTagsAction()` and derive `userId` via `getDatabaseUserId()`.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/server/tags-authz.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/tags.ts tests/server/tags-authz.test.ts
git commit -m "fix(security): scope tag queries to authenticated user"
```

### Task 5: Harden production rate limiting and IP trust

**Files:**
- Modify: `lib/rate-limit.ts`
- Create: `tests/lib/rate-limit-production.test.ts`
- Test: `tests/lib/rate-limit-production.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
it('fails closed in production when redis is unavailable', async () => { ... })
it('prefers cf-connecting-ip over spoofable headers', async () => { ... })
```

- [ ] **Step 2: Run tests to verify fail**
Run: `npx vitest run tests/lib/rate-limit-production.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal fix**
- Remove production memory fallback.
- Require Upstash envs in production.
- Prioritize trusted IP headers.

- [ ] **Step 4: Run tests to verify pass**
Run: `npx vitest run tests/lib/rate-limit-production.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add lib/rate-limit.ts tests/lib/rate-limit-production.test.ts
git commit -m "fix(security): fail closed rate limiting in production"
```

### Task 6: Fix admin weekly recap target user authorization

**Files:**
- Modify: `app/[locale]/admin/actions/weekly-recap.ts`
- Create: `tests/admin/weekly-recap-authz.test.ts`
- Test: `tests/admin/weekly-recap-authz.test.ts`

- [ ] **Step 1: Write failing authz tests**
```ts
it('does not allow arbitrary target user without admin authorization context', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/admin/weekly-recap-authz.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal fix**
Use `assertAdminAccess()` context; only allow target selection under authorized admin path.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/admin/weekly-recap-authz.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add app/[locale]/admin/actions/weekly-recap.ts tests/admin/weekly-recap-authz.test.ts
git commit -m "fix(security): tighten weekly recap target user authorization"
```

### Task 7: Security chunk verification gate

**Files:**
- Modify: none
- Test: targeted + full gates

- [ ] **Step 1: Run targeted security tests**
Run:
```bash
npx vitest run tests/server/accounts-payout-authz.test.ts tests/server/layout-version-authz.test.ts tests/server/tags-authz.test.ts tests/lib/rate-limit-production.test.ts tests/admin/weekly-recap-authz.test.ts tests/logger.test.ts
```
Expected: PASS

- [ ] **Step 2: Run project gates**
Run:
```bash
npm run typecheck
npm run lint
npm test
```
Expected: typecheck PASS, lint 0 errors, tests PASS

- [ ] **Step 3: Commit verification checkpoint**
```bash
git add -A
git commit -m "chore: security remediation checkpoint verified"
```

---

## Chunk 2: Architecture Boundary Remediation

### Task 8: Create real provider boundaries for dashboard state

**Files:**
- Create: `context/providers/data-state-provider.tsx`
- Create: `context/providers/data-actions-provider.tsx`
- Create: `context/providers/data-derived-provider.tsx`
- Modify: `components/providers/dashboard-providers.tsx`
- Test: `tests/context/provider-boundary-regression.test.tsx`

- [ ] **Step 1: Write failing provider boundary test**
```ts
it('updates filter state without rerendering unrelated data consumers', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/context/provider-boundary-regression.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement minimal provider split**
Create focused providers with explicit value contracts; wire in `dashboard-providers.tsx`.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/context/provider-boundary-regression.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add context/providers/data-state-provider.tsx context/providers/data-actions-provider.tsx context/providers/data-derived-provider.tsx components/providers/dashboard-providers.tsx tests/context/provider-boundary-regression.test.tsx
git commit -m "refactor(architecture): introduce explicit dashboard provider boundaries"
```

### Task 9: Migrate highest-churn consumers to narrow providers

**Files:**
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`
- Modify: `app/[locale]/dashboard/components/filters/filter-dropdown.tsx`
- Modify: `app/[locale]/dashboard/components/filters/filter-command-menu.tsx`
- Modify: `app/[locale]/dashboard/components/navbar.tsx`
- Test: `tests/context/provider-boundary-regression.test.tsx`

- [ ] **Step 1: Add failing render-count assertions**
```ts
it('does not rerender widget canvas on unrelated filter text changes', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/context/provider-boundary-regression.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement minimal hook migration**
Replace broad context consumers with narrow state/action hooks.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/context/provider-boundary-regression.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add app/[locale]/dashboard/components/widget-canvas.tsx app/[locale]/dashboard/components/filters/filter-dropdown.tsx app/[locale]/dashboard/components/filters/filter-command-menu.tsx app/[locale]/dashboard/components/navbar.tsx tests/context/provider-boundary-regression.test.tsx
git commit -m "refactor(architecture): migrate hot consumers to narrow provider hooks"
```

### Task 10: Architecture chunk verification gate

**Files:**
- Modify: none

- [ ] **Step 1: Run focused dashboard tests**
Run: `npx vitest run tests/context/provider-boundary-regression.test.tsx`
Expected: PASS

- [ ] **Step 2: Run typecheck and build**
Run:
```bash
npm run typecheck
npm run build
```
Expected: PASS

- [ ] **Step 3: Commit checkpoint**
```bash
git add -A
git commit -m "chore: architecture remediation checkpoint verified"
```

---

## Chunk 3: Performance Hot-Path Remediation

### Task 11: Reduce background polling churn

**Files:**
- Modify: `app/[locale]/dashboard/components/global-sync-button.tsx`
- Modify: `context/rithmic-sync-context.tsx`
- Modify: `context/tradovate-sync-context.tsx`
- Create: `tests/performance/dashboard-polling-regression.test.ts`

- [ ] **Step 1: Write failing polling behavior tests**
```ts
it('skips polling while document is hidden', async () => { ... })
it('does not mount high-frequency ticker on inactive routes', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/performance/dashboard-polling-regression.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal interval guards**
- slow noncritical ticker cadence
- visibility-aware early returns
- ensure cleanup on unmount/route exit

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/performance/dashboard-polling-regression.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add app/[locale]/dashboard/components/global-sync-button.tsx context/rithmic-sync-context.tsx context/tradovate-sync-context.tsx tests/performance/dashboard-polling-regression.test.ts
git commit -m "perf: reduce dashboard polling churn with visibility-aware intervals"
```

### Task 12: Eliminate per-row trade mutation pattern where safe

**Files:**
- Modify: `server/trades.ts`
- Create: `tests/performance/trades-mutation-batch.test.ts`

- [ ] **Step 1: Write failing performance behavior test**
```ts
it('updates eligible trades in batch without per-row update loop', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/performance/trades-mutation-batch.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal batching**
Replace per-row update loops with `updateMany`/chunked writes where data semantics allow.

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/performance/trades-mutation-batch.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/trades.ts tests/performance/trades-mutation-batch.test.ts
git commit -m "perf(server): batch trade mutations to remove per-row update loop"
```

### Task 13: Stabilize trade table hot rendering path

**Files:**
- Modify: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- Modify: `context/data-provider.tsx`
- Test: `tests/performance/rendering-performance.test.tsx`

- [ ] **Step 1: Add failing render-budget assertion**
```ts
it('keeps render count under threshold when filter changes rapidly', async () => { ... })
```

- [ ] **Step 2: Run test to verify fail**
Run: `npx vitest run tests/performance/rendering-performance.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement minimal hot-path optimization**
- memoize expensive selector inputs
- avoid duplicate sort/filter passes
- keep virtualization boundaries stable

- [ ] **Step 4: Run test to verify pass**
Run: `npx vitest run tests/performance/rendering-performance.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add app/[locale]/dashboard/components/tables/trade-table-review.tsx context/data-provider.tsx tests/performance/rendering-performance.test.tsx
git commit -m "perf(ui): stabilize trade table render hot path"
```

### Task 14: Performance chunk verification gate

**Files:**
- Modify: none

- [ ] **Step 1: Run focused performance tests**
Run:
```bash
npx vitest run tests/performance/dashboard-polling-regression.test.ts tests/performance/trades-mutation-batch.test.ts tests/performance/rendering-performance.test.tsx
```
Expected: PASS

- [ ] **Step 2: Run performance checks**
Run:
```bash
npm run check:route-budgets
npm run analyze:bundle
```
Expected: PASS within configured route budgets

- [ ] **Step 3: Run final quality gates**
Run:
```bash
npm run typecheck
npm run lint
npm test
```
Expected: typecheck PASS, lint 0 errors, tests PASS

- [ ] **Step 4: Commit checkpoint**
```bash
git add -A
git commit -m "chore: performance remediation checkpoint verified"
```

---

## Final Integration and Handoff

### Task 15: Final review + branch handoff

**Files:**
- Modify: `AGENTS.md` (append new engineering log entry)
- Modify: `tasks/todo.md` (mark completion)

- [ ] **Step 1: Append AGENTS engineering log entry**
Use required format:
- What changed
- What I want
- What I don't want
- How we fixed that
- Key Files
- Verification

- [ ] **Step 2: Run final end-to-end verification**
Run:
```bash
npm run typecheck && npm run lint && npm test && npm run build
```
Expected: PASS (or documented pre-existing warnings only)

- [ ] **Step 3: Commit final integration**
```bash
git add AGENTS.md tasks/todo.md
git commit -m "docs: record three-track remediation completion and verification"
```

- [ ] **Step 4: Open/update PR**
Include:
- security fixes summary
- architecture boundary summary
- performance improvements summary
- verification evidence

---

## Plan Review Loop Instructions

- After each chunk, run the plan-document-reviewer subagent.
- If issues are found, fix and re-run reviewer until approved.
- Do not proceed to next chunk without reviewer approval.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-12-three-track-remediation-plan.md`. Ready to execute?
