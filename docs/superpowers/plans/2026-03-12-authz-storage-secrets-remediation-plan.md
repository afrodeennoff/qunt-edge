# AuthZ, Storage RPC, and Secret Hygiene Remediation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close authorization gaps in trader/team and trades reads, remove client-controlled identity from smart insights, restrict risky storage RPC execution, and eliminate committed secret env files safely.

**Architecture:** Move trust boundaries to server-authenticated identity (`getDatabaseUserId` / Supabase `auth.getUser`) and enforce access at action boundaries. Keep self-service actions strict, and introduce separate privileged paths only when explicitly needed. Apply DB privilege hardening and secret-incident hygiene in staged rollout with regression tests.

**Tech Stack:** Next.js server actions, Supabase Auth, Prisma, Postgres/Supabase SQL migration, Vitest, ESLint, TypeScript.

---

## Chunk 1: Identity and Access Controls

### Task 1: Team Trader Access Guard

**Files:**
- Modify: `app/[locale]/teams/actions/user.ts`
- Test: `tests/trader-var-action.test.ts`
- Create (if needed): `tests/teams-trader-access.test.ts`

- [ ] **Step 1: Write/extend failing tests for unauthorized trader access**
- [ ] **Step 2: Add `canAccessTrader` helper for owner/member/manager checks**
- [ ] **Step 3: Enforce access in `getTraderById` and `getTraderVarSummary`**
- [ ] **Step 4: Return safe errors (`null` or unauthorized) without over-disclosure**
- [ ] **Step 5: Run targeted tests and typecheck**

### Task 2: Self-Only Trades Read Boundary

**Files:**
- Modify: `server/trades.ts`
- Review callsites: `context/data-provider.tsx`, `context/trades-context.tsx`, `app/api/dashboard/trades/route.ts`, `lib/ai/get-all-trades.ts`, `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`
- Test: `tests/server/get-trades-authz.test.ts` (create)

- [ ] **Step 1: Write failing tests for cross-user `getTradesAction(userId)` reads**
- [ ] **Step 2: Enforce `authenticatedUserId = getDatabaseUserId()` and deny mismatched target user**
- [ ] **Step 3: Preserve existing self-read behavior when `userId` is omitted**
- [ ] **Step 4: If admin/team cross-user reads are required, define separate privileged action (do not weaken `getTradesAction`)**
- [ ] **Step 5: Verify all existing callsites compile and run**

### Task 3: Smart Insights Identity Hardening

**Files:**
- Modify: `app/[locale]/dashboard/actions/get-smart-insights.ts`
- Modify: `app/[locale]/dashboard/components/widgets/smart-insights-widget.tsx`
- Test: `tests/dashboard/smart-insights-auth.test.ts` (create or extend)

- [ ] **Step 1: Update tests to expect server-derived user identity (no `userId` argument)**
- [ ] **Step 2: Change action signature to `getSmartInsights()` and derive `userId` via `getDatabaseUserId()`**
- [ ] **Step 3: Update widget callsite to invoke zero-arg action**
- [ ] **Step 4: Keep allowed route-target whitelist unchanged**
- [ ] **Step 5: Run widget/action tests and typecheck**

## Chunk 2: Database Privilege Hardening

### Task 4: Restrict `storage.list_objects` RPC Execution

**Files:**
- Create: `prisma/migrations/20260312193000_restrict_storage_list_objects_rpc/migration.sql`
- Review: `server/storage.ts`
- Optional validation script: `scripts/verify-storage-rpc-privileges.mjs`

- [ ] **Step 1: Add migration to revoke execute from `anon, authenticated` and grant to `service_role`**
- [ ] **Step 2: Validate app storage listing flows in staging (auth user + service role paths)**
- [ ] **Step 3: Prepare rollback SQL (`GRANT EXECUTE ... TO authenticated, anon`) before prod rollout**
- [ ] **Step 4: Apply migration in prod with monitoring window (403/500 storage list failures)**

## Chunk 3: Secret Exposure Containment and Prevention

### Task 5: Remove Tracked Secret Env Files and Rotate Keys

**Files:**
- Delete from git: `.env.development.local`, `.env.preview.local`, `.env.production.local`
- Update (if needed): `.gitignore`
- Update docs: `docs/SECURITY_PR_CHECKLIST.md` (or nearest security runbook)

- [ ] **Step 1: Remove env files from git tracking and verify no `.env*.local` tracked files remain**
- [ ] **Step 2: Rotate leaked secrets (DB, Supabase service role, webhook secrets, encryption, AI/payment tokens)**
- [ ] **Step 3: Redeploy with rotated secrets across environments**
- [ ] **Step 4: Optionally rewrite git history if org policy allows; otherwise treat as permanently exposed and continue with full rotation**

### Task 6: CI Guardrails to Prevent Recurrence

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create/modify scripts: `scripts/check-tracked-env-files.mjs`, `scripts/check-secrets.mjs` (or gitleaks integration)

- [ ] **Step 1: Add CI gate to fail when tracked files match `.env*` except `.env.example`**
- [ ] **Step 2: Add secret scanning gate (`gitleaks` or equivalent)**
- [ ] **Step 3: Add DB privilege assertion check for `storage.list_objects` execution roles**
- [ ] **Step 4: Add focused authz test job for actions touched in this plan**

## Verification Matrix

- [ ] `npm run typecheck`
- [ ] `npx eslint "app/[locale]/teams/actions/user.ts" "server/trades.ts" "app/[locale]/dashboard/actions/get-smart-insights.ts" "app/[locale]/dashboard/components/widgets/smart-insights-widget.tsx"`
- [ ] `npx vitest run tests/trader-var-action.test.ts tests/server/get-trades-authz.test.ts tests/dashboard/smart-insights-auth.test.ts`
- [ ] Staging smoke: team trader profile access, dashboard table fetch, smart insights widget load, storage list/upload/delete
- [ ] Production post-deploy watch: auth failures, storage RPC errors, unexpected 403s

## Done Definition

- Authz bypass paths are closed for trader/team actions and trade reads.
- Smart insights no longer accepts caller-supplied identity.
- `storage.list_objects` execution is restricted per policy and verified in staging/prod.
- Secret env files are removed from tracking and keys are rotated.
- CI blocks recurrence (tracked env + secret scanning + authz regression tests).
