# Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 security and quality issues identified in the codebase audit

**Architecture:** Each issue is an independent fix in a separate file. No architectural changes needed.

**Tech Stack:** TypeScript, Next.js, Prisma

---

## Pre-Flight Check

- [ ] Verify working directory is clean (`git status`)
- [ ] All tests pass before starting (`npm run test`)

---

## Chunk 1: Security Fixes

### Task 1: Fix Admin CSV Check in weekly-recap.ts

**Files:**
- Modify: `app/[locale]/admin/actions/weekly-recap.ts:115-130`
- Reference: `server/authz.ts:43-53` (has parseCsvEnv function)

- [ ] **Step 1: Read current code to understand context**

```bash
# Read lines 115-135 of weekly-recap.ts
```

- [ ] **Step 2: Write the failing test**

Create `tests/admin-weekly-recap-admin-check.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('weekly-recap admin check', () => {
  beforeEach(() => {
    delete process.env.ALLOWED_ADMIN_USER_ID
  })

  it('should use CSV parsing for admin check', () => {
    // Current code: admin.userId === process.env.ALLOWED_ADMIN_USER_ID
    // This fails when ALLOWED_ADMIN_USER_ID contains comma-separated values
    // Expected: use parseCsvEnv like server/authz.ts does
  })
})
```

- [ ] **Step 3: Fix the admin check logic**

In `app/[locale]/admin/actions/weekly-recap.ts`, around line 122:

```typescript
// BEFORE (broken):
const targetUserId = userId && admin.userId === process.env.ALLOWED_ADMIN_USER_ID 
  ? userId 
  : admin.userId

// AFTER (fixed):
function parseCsvEnv(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

const allowedAdminIds = parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID)
const isAllowedAdmin = allowedAdminIds.includes(admin.userId.toLowerCase())
const targetUserId = userId && isAllowedAdmin ? userId : admin.userId
```

Or import from server/authz.ts:

```typescript
import { parseCsvEnv } from '@/server/authz'
// Then use parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID)
```

- [ ] **Step 4: Verify fix compiles**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/admin/actions/weekly-recap.ts
git commit -m "fix: use CSV parsing for admin check in weekly-recap"
```

---

### Task 2: Fix Payout Ownership Check in accounts.ts

**Files:**
- Modify: `server/accounts.ts:400-444`

- [ ] **Step 1: Read current code to understand context**

```bash
# Read lines 395-460 of server/accounts.ts
```

- [ ] **Step 2: Identify the vulnerability**

There are TWO queries checking payout ownership:
1. Lines 401-413: Correct query with `account: { userId }` filter
2. Lines 416-418: **BROKEN** query without userId filter - allows updating any user's payout

- [ ] **Step 3: Fix the second query**

Replace lines 415-418:

```typescript
// BEFORE (broken - no ownership check):
const existingPayout = payout.id 
  ? await prisma.payout.findFirst({ where: { id: payout.id } })
  : null

// AFTER (fixed - always enforce ownership):
const existingPayout = payout.id
  ? await prisma.payout.findFirst({
      where: {
        id: payout.id,
        account: {
          userId: userId,
        },
      },
      select: {
        id: true,
        accountNumber: true,
      },
    })
  : null

if (payout.id && !existingPayout) {
  throw new Error('Payout not found or unauthorized')
}
```

- [ ] **Step 4: Verify fix compiles**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add server/accounts.ts
git commit -m "fix: enforce payout ownership in update query"
```

---

## Chunk 2: Code Quality Fixes

### Task 3: Fix Comment Typo in rate-limit.ts

**Files:**
- Modify: `lib/rate-limit.ts:33`

- [ ] **Step 1: Fix the typo**

```typescript
// BEFORE:
# Vercel sets x-vercel-forward-for with real client IP

// AFTER:
# Vercel sets x-vercel-forwarded-for with real client IP
```

- [ ] **Step 2: Commit**

```bash
git add lib/rate-limit.ts
git commit -m "fix: correct header name in comment"
```

---

### Task 4: Fix x-forwarded-for Logic in rate-limit.ts

**Files:**
- Modify: `lib/rate-limit.ts:45-55`

- [ ] **Step 1: Read current logic**

```bash
# Read lines 45-60 of lib/rate-limit.ts
```

- [ ] **Step 2: Fix the logic**

The issue: `normalizeHeaderIp()` already extracts first IP, so `forwardedIp` never contains commas.

```typescript
// BEFORE (broken):
const forwardedIp = normalizeHeaderIp(req.headers.get('x-forwarded-for'))
if (forwardedIp && forwardedIp !== 'undefined' && forwardedIp !== 'null') {
  const parts = forwardedIp.split(',')
  if (parts.length > 1) {
    return parts[0].trim()
  }
}

// AFTER (fixed):
const rawForwardedFor = req.headers.get('x-forwarded-for')
if (rawForwardedFor) {
  const parts = rawForwardedFor.split(',').map(p => p.trim()).filter(Boolean)
  // Only trust if request appears to come from a proxy (has multiple IPs)
  if (parts.length > 1 && parts[0] !== 'undefined' && parts[0] !== 'null') {
    return parts[0]
  }
}
```

- [ ] **Step 3: Verify fix compiles**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/rate-limit.ts
git commit -m "fix: check raw x-forwarded-for for proxy chain detection"
```

---

### Task 5: Normalize Bundle Summary Paths

**Files:**
- Modify: `scripts/analyze-bundle.mjs` (or similar)
- Check: `docs/audits/artifacts/bundle-summary.json`

- [ ] **Step 1: Find the bundle summary generator**

```bash
# Search for bundle summary generation code
rg -l "bundle-summary.json" scripts/
```

- [ ] **Step 2: Read the path normalization logic**

Look for functions like `generateBundleSummary`, `serializeBundleEntry`, or `writeArtifactEntry`.

- [ ] **Step 3: Add path normalization**

```typescript
// At the top of the file, add:
const WORKSPACE_ROOT = process.cwd()

function normalizePath(filePath: string): string {
  if (filePath.startsWith(WORKSPACE_ROOT)) {
    return filePath.replace(WORKSPACE_ROOT, '')
  }
  // Fallback: just return basename
  return '/' + filePath.split('/').pop()
}
```

- [ ] **Step 4: Apply normalization in serialization**

Find where file paths are written to the JSON and wrap with `normalizePath()`.

- [ ] **Step 5: Test the fix**

```bash
node scripts/analyze-bundle.mjs
cat docs/audits/artifacts/bundle-summary.json | head -20
# Verify paths are now relative (should start with /, not /Users/...)
```

- [ ] **Step 6: Commit**

```bash
git add scripts/analyze-bundle.mjs docs/audits/artifacts/bundle-summary.json
git commit -m "fix: normalize paths in bundle summary output"
```

---

## Chunk 3: Verification

- [ ] Run full test suite: `npm run test`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run lint: `npm run lint`
- [ ] Create a summary commit if needed

---

## Summary

| Issue | File | Status |
|-------|------|--------|
| Admin CSV check | `app/[locale]/admin/actions/weekly-recap.ts` | Pending |
| Payout ownership | `server/accounts.ts` | Pending |
| Comment typo | `lib/rate-limit.ts` | Pending |
| x-forwarded-for logic | `lib/rate-limit.ts` | Pending |
| Bundle paths | `scripts/analyze-bundle.mjs` | Pending |

---

**Plan complete.** Ready to execute?
