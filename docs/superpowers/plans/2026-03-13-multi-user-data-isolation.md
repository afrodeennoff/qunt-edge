# Multi-User Data Isolation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce strict per-user isolation for trades/accounts/uploads/edit-delete flows, remove cross-user duplicate conflicts, and prove with regression tests that same content can exist for different users.

**Architecture:** Bind all data reads/writes to authenticated actor by default, isolate trusted integration imports into explicit internal paths, and make backend the source of truth for duplicate detection. Frontend duplicate pre-checks become advisory/non-blocking and user-switch state is guarded to prevent stale cross-user behavior.

**Tech Stack:** Next.js App Router, Server Actions, Prisma, Supabase Storage, Zustand, Vitest.

---

## File Map

- **Core isolation boundary**
  - Modify: `server/trades.ts`
  - Modify: `server/database.ts`
  - Modify: `app/api/thor/store/route.ts`
  - Modify: `app/[locale]/dashboard/components/import/tradovate/actions.ts`
- **Layout ownership boundary**
  - Modify: `server/user-data.ts`
  - Modify: `context/data-provider.tsx`
- **Unsafe latent mutation path**
  - Modify: `server/optimized-trades.ts`
- **Frontend duplicate conflict behavior**
  - Modify: `app/[locale]/dashboard/components/import/atas/atas-processor.tsx`
  - Modify: `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`
  - Modify: `app/[locale]/dashboard/components/import/manual/manual-processor.tsx`
  - Modify: `app/[locale]/dashboard/components/import/import-button.tsx`
- **User-switch persistence guard**
  - Modify: `store/user-store.ts`
  - Modify: `context/data-provider.tsx`
- **Upload ownership defense-in-depth**
  - Modify: `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
  - (optional if needed after tests) Modify: `hooks/use-hash-upload.ts`
- **Tests**
  - Modify: `tests/save-trades-action.test.ts`
  - Create: `tests/server/layout-isolation.test.ts`
  - Create: `tests/server/optimized-trades-isolation.test.ts`
  - Create: `tests/frontend/import-duplicate-isolation.test.tsx`
  - Create: `tests/frontend/user-switch-store-isolation.test.tsx`

---

## Chunk 1: Trade Write Isolation + Cross-User Duplicate Semantics

### Task 1: Lock public trade save to authenticated actor

**Files:**
- Modify: `server/trades.ts`
- Modify: `server/database.ts`
- Test: `tests/save-trades-action.test.ts`

- [ ] **Step 1: Write failing tests for user-id injection blocking**

```ts
it('ignores caller userId override on public saveTradesAction', async () => {
  // Arrange auth user A, pass options.userId for user B
  // Expect persisted trade userId remains user A
})

it('throws or rejects when caller attempts forbidden user override', async () => {
  // If design chooses fail-closed: expect explicit Forbidden
})
```

- [ ] **Step 2: Run targeted test and verify failure**

Run: `npx vitest run tests/save-trades-action.test.ts`
Expected: at least 1 new test fails due current `options.userId` path.

- [ ] **Step 3: Implement split API in trades service**

```ts
// public path: actor-only
export async function saveTradesAction(data: any[]): Promise<TradeResponse> {
  const actorAuthUserId = await getUserId()
  const actorDbUserId = await resolveWritableUserId(actorAuthUserId)
  return saveTradesForResolvedUser(data, actorDbUserId)
}

// internal trusted path for token-auth import routes
export async function saveTradesForUserAction(data: any[], rawUserId: string): Promise<TradeResponse> {
  const resolvedUserId = await resolveWritableUserId(rawUserId)
  return saveTradesForResolvedUser(data, resolvedUserId)
}
```

- [ ] **Step 4: Re-export trusted function intentionally**

```ts
// server/database.ts
export { saveTradesAction, saveTradesForUserAction } from './trades'
```

- [ ] **Step 5: Re-run tests**

Run: `npx vitest run tests/save-trades-action.test.ts`
Expected: all tests pass; old per-user same-payload test remains green.

- [ ] **Step 6: Commit**

```bash
git add server/trades.ts server/database.ts tests/save-trades-action.test.ts
git commit -m "fix: bind trade saves to authenticated actor by default"
```

### Task 2: Update trusted import callers to explicit trusted save path

**Files:**
- Modify: `app/api/thor/store/route.ts`
- Modify: `app/[locale]/dashboard/components/import/tradovate/actions.ts`
- Test: `tests/save-trades-action.test.ts`

- [ ] **Step 1: Add failing test coverage for trusted path behavior**

```ts
it('allows trusted save path for explicit integration user id', async () => {
  // call saveTradesForUserAction(data, 'auth-user-b')
  // assert writes for db-user-b
})
```

- [ ] **Step 2: Run test to confirm failure pre-change**

Run: `npx vitest run tests/save-trades-action.test.ts -t "trusted save path"`
Expected: fails until function exists/callers updated.

- [ ] **Step 3: Update import callers**

```ts
// app/api/thor/store/route.ts
import { saveTradesForUserAction } from '@/server/database'
await saveTradesForUserAction(trades, user.id)

// tradovate/actions.ts
await saveTradesForUserAction(processedTrades, userId)
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/save-trades-action.test.ts`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add app/api/thor/store/route.ts app/[locale]/dashboard/components/import/tradovate/actions.ts tests/save-trades-action.test.ts
git commit -m "fix: route trusted imports through explicit user-scoped trade save path"
```

---

## Chunk 2: Read/Mutation Ownership Hardening

### Task 3: Enforce dashboard layout ownership on reads

**Files:**
- Modify: `server/user-data.ts`
- Modify: `context/data-provider.tsx`
- Test: `tests/server/layout-isolation.test.ts`

- [ ] **Step 1: Add failing ownership test**

```ts
it('rejects getDashboardLayout when requested userId differs from actor', async () => {
  // actor db-user-a requests db-user-b => throws Forbidden
})
```

- [ ] **Step 2: Run test and confirm fail**

Run: `npx vitest run tests/server/layout-isolation.test.ts`
Expected: fails before auth check is added.

- [ ] **Step 3: Implement ownership guard in layout read**

```ts
export async function getDashboardLayout(requestedUserId: string): Promise<DashboardLayout | null> {
  const actorUserId = await getDatabaseUserId()
  if (requestedUserId !== actorUserId) {
    throw new Error('Forbidden')
  }
  // existing cached findUnique by userId
}
```

- [ ] **Step 4: Ensure client caller uses authenticated user only**

```ts
// context/data-provider.tsx keeps getDashboardLayout(userId)
// userId must come from getUserId/getDatabaseUserId path, never props/query
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/server/layout-isolation.test.ts`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add server/user-data.ts context/data-provider.tsx tests/server/layout-isolation.test.ts
git commit -m "fix: enforce actor ownership for dashboard layout reads"
```

### Task 4: Scope optimized trade batch updates by owner

**Files:**
- Modify: `server/optimized-trades.ts`
- Test: `tests/server/optimized-trades-isolation.test.ts`

- [ ] **Step 1: Add failing test for foreign trade id update**

```ts
it('updates only trades owned by actor in batchUpdateTradesOptimized', async () => {
  // pass mixed trade ids; expect where includes { id, userId: actor }
})
```

- [ ] **Step 2: Run test and confirm fail**

Run: `npx vitest run tests/server/optimized-trades-isolation.test.ts`
Expected: fails because current code updates by id only.

- [ ] **Step 3: Implement user-bound signature + where filter**

```ts
export async function batchUpdateTradesOptimized(
  userId: string,
  updates: Array<{ id: string; data: any }>
) {
  return prisma.$transaction(
    updates.map((u) =>
      prisma.trade.updateMany({
        where: { id: u.id, userId },
        data: u.data,
      })
    )
  )
}
```

- [ ] **Step 4: Run test**

Run: `npx vitest run tests/server/optimized-trades-isolation.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add server/optimized-trades.ts tests/server/optimized-trades-isolation.test.ts
git commit -m "fix: scope optimized trade batch updates to actor user id"
```

---

## Chunk 3: Frontend Duplicate Conflict + Session Isolation

### Task 5: Remove client-side false duplicate blocking across users

**Files:**
- Modify: `app/[locale]/dashboard/components/import/atas/atas-processor.tsx`
- Modify: `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`
- Modify: `app/[locale]/dashboard/components/import/manual/manual-processor.tsx`
- Modify: `app/[locale]/dashboard/components/import/import-button.tsx`
- Test: `tests/frontend/import-duplicate-isolation.test.tsx`

- [ ] **Step 1: Add failing UI regression test**

```tsx
it('does not block import as duplicate based only on stale client trades store', async () => {
  // preload store with another user's trades
  // ensure processor/import flow still submits to saveTradesAction
})
```

- [ ] **Step 2: Run test and confirm fail**

Run: `npx vitest run tests/frontend/import-duplicate-isolation.test.tsx`
Expected: fails because current duplicate pre-check blocks.

- [ ] **Step 3: Replace hard duplicate blocking with advisory behavior**

```ts
// processors:
// keep optional local "possible duplicate" label
// do NOT remove rows or prevent save based solely on existingTrades store
```

- [ ] **Step 4: Keep backend duplicate contract as source of truth**

```ts
// import-button.tsx
// continue handling result.error === 'DUPLICATE_TRADES' from backend response
// no additional client-side global duplicate gate
```

- [ ] **Step 5: Run test**

Run: `npx vitest run tests/frontend/import-duplicate-isolation.test.tsx`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/dashboard/components/import/atas/atas-processor.tsx app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx app/[locale]/dashboard/components/import/manual/manual-processor.tsx app/[locale]/dashboard/components/import/import-button.tsx tests/frontend/import-duplicate-isolation.test.tsx
git commit -m "fix: move import duplicate authority to backend user-scoped checks"
```

### Task 6: Guard persisted store against cross-user bleed on user switch

**Files:**
- Modify: `store/user-store.ts`
- Modify: `context/data-provider.tsx`
- Test: `tests/frontend/user-switch-store-isolation.test.tsx`

- [ ] **Step 1: Add failing test for persisted layout carryover**

```tsx
it('clears/isolates dashboardLayout when authenticated user changes', async () => {
  // user A persisted layout then user B login on same browser
  // expect B does not see A layout in store before load completes
})
```

- [ ] **Step 2: Run test and verify fail**

Run: `npx vitest run tests/frontend/user-switch-store-isolation.test.tsx`
Expected: fails pre-fix.

- [ ] **Step 3: Implement user-scoped layout persistence**

```ts
// option A (preferred): persist { dashboardLayoutByUser: Record<userId, layout> }
// option B: clear dashboardLayout on active user change in DataProvider before hydration
```

- [ ] **Step 4: Run test**

Run: `npx vitest run tests/frontend/user-switch-store-isolation.test.tsx`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add store/user-store.ts context/data-provider.tsx tests/frontend/user-switch-store-isolation.test.tsx
git commit -m "fix: prevent persisted dashboard layout bleed across users"
```

---

## Chunk 4: Upload/Edit/Delete Ownership Defense + Final Verification

### Task 7: Add defensive ownership check before storage remove operations

**Files:**
- Modify: `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- Test: `tests/frontend/import-duplicate-isolation.test.tsx` (or new targeted component test)

- [ ] **Step 1: Add failing unit/component test for foreign path deletion attempt**

```tsx
it('does not attempt storage remove when image path is outside actor prefix', async () => {
  // image path starts with other-user-id/
  // expect remove not called and error toast shown
})
```

- [ ] **Step 2: Run test and verify fail**

Run: `npx vitest run tests/frontend/import-duplicate-isolation.test.tsx`
Expected: fail pre-guard.

- [ ] **Step 3: Implement prefix guard**

```ts
const actorPrefix = `${supabaseUser?.id || user?.auth_user_id || ''}/`
if (!path.startsWith(actorPrefix)) {
  throw new Error('Forbidden image path')
}
```

- [ ] **Step 4: Run test**

Run: `npx vitest run tests/frontend/import-duplicate-isolation.test.tsx`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/dashboard/components/tables/trade-image-editor.tsx tests/frontend/import-duplicate-isolation.test.tsx
git commit -m "fix: enforce actor-owned storage path for image delete operations"
```

### Task 8: Full regression and quality gates

**Files:**
- Modify (if needed): any touched test fixtures/mocks

- [ ] **Step 1: Run targeted isolation tests**

Run:
```bash
npx vitest run tests/save-trades-action.test.ts tests/server/accounts-isolation.test.ts tests/server/layout-isolation.test.ts tests/server/optimized-trades-isolation.test.ts tests/frontend/import-duplicate-isolation.test.tsx tests/frontend/user-switch-store-isolation.test.tsx
```
Expected: all pass.

- [ ] **Step 2: Run static quality checks for touched scope**

Run:
```bash
npx eslint server/trades.ts server/database.ts server/user-data.ts server/optimized-trades.ts app/api/thor/store/route.ts "app/[locale]/dashboard/components/import/tradovate/actions.ts" "app/[locale]/dashboard/components/import/atas/atas-processor.tsx" "app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx" "app/[locale]/dashboard/components/import/manual/manual-processor.tsx" "app/[locale]/dashboard/components/import/import-button.tsx" store/user-store.ts context/data-provider.tsx "app/[locale]/dashboard/components/tables/trade-image-editor.tsx" tests/save-trades-action.test.ts tests/server/layout-isolation.test.ts tests/server/optimized-trades-isolation.test.ts tests/frontend/import-duplicate-isolation.test.tsx tests/frontend/user-switch-store-isolation.test.tsx
```
Expected: 0 errors.

- [ ] **Step 3: Run typecheck**

Run: `npm run -s typecheck`
Expected: pass.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "fix: enforce end-to-end multi-user isolation for trade/account/upload flows"
```

---

## Root Cause Analysis Template (for final deliverable)

Use this exact structure in final report after implementation:

1. **Root cause #1:** Public trade save accepted caller userId override (`server/trades.ts`).
2. **Root cause #2:** Dashboard layout read path trusted requested userId (`server/user-data.ts`).
3. **Root cause #3:** Client duplicate pre-check used local stale store and blocked valid imports.
4. **Root cause #4:** Latent optimized batch update path lacked ownership filter.
5. **Root cause #5:** Persisted layout state not user-scoped on browser reuse/user switch.

For each item include: attack/failure mode, file+line, fix, test that proves closure.

---

## Definition of Done

- All trade/account/upload read/write/delete operations in touched flows are actor-bound or explicitly authorized for trusted integration context.
- Same trade payload can be saved for user A and user B without cross-user duplicate rejection.
- Cross-user reads/updates/deletes fail closed with explicit forbidden/unauthorized behavior.
- Frontend import flow does not emit false “already uploaded” due to stale other-user state.
- Regression tests pass and are stable in CI.
