# AI Verification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the AI-focused verification pipeline, diagnose the resulting failures, and fix the AI-specific logic so that the vitest suites, `npm run -s typecheck`, ESLint on the affected AI files, and `npm run -s build` all pass again without introducing unrelated changes.

**Architecture:** Sequential verification: rerun the AI vitest command to document failures, then tackle the blockers (typecheck, lint, build) in order, keeping each fix scoped to the files or helpers referenced by the failing command. Re-run the command after each fix to ensure it succeeded before moving to the next blocker.

**Tech Stack:** `vitest` (Node 20/Next 16 test harness), `tsc`/Next typegen, ESLint, Next build pipeline. AI layers implicated include `app/api/ai/*`, `lib/ai/*`, router helpers, and supporting rate-limit/budget modules.

---

### Task 1: Capture AI test failure details
**Files:** `tests/api/ai-*.test.ts`, `tests/lib/ai-router-integration.test.ts`, `lib/__tests__/ai-support-route.test.ts`, `tests/lib/ai-trade-access.test.ts`, `tests/lib/ai-router-fallback-order.test.ts`, `tests/lib/ai-client-router-propagation.test.ts`

- [x] **Step 1:** Run the AI-focused vitest command and record the full console output. The suite passed (14 files / 79 tests) while the router helpers emitted the expected fallback logs (`openrouter-byok`, `openrouter-free`, `openrouter-auto` attempts) plus Prisma guard errors from `aiUsageLedger` on the security routes.
- [x] **Step 2:** Summary: command succeeds but the router logs show forced provider failures and Prisma guard telemetry warnings that we can document for context; there were no failing tests to fix at this stage.

### Task 2: Fix the primary blocker uncovered in Task 1
**Files:** _(populate after seeing the log; update this plan entry with the file(s) or helper(s) that need editing.)_

- [x] **Step 1:** There was no failing test to fix; all vitest suites passed, so no targeted code changes were required here.
- [x] **Step 2:** N/A.
- [x] **Step 3:** The vitest command already ran successfully in Task 1, so nothing else to rerun.

### Task 3: Chase the remaining blockers (typecheck → lint → build)
**Files:** Depends on each failure; start with the files referenced in the typecheck output.

- [x] **Step 1:** `npm run -s typecheck` succeeded with no reported errors (it completed after generating route types and cleaning caches).
- [x] **Step 2:** No fixes were required because there were no errors.
- [x] **Step 3:** No additional rerun needed; the command was already clean.
- [x] **Step 4:** Ran `npx eslint app/api/ai lib/ai lib/rate-limit.ts`; it finished with 34 existing complexity/`no-explicit-any` warnings but no errors, so no changes were required.\n*** End Patch
- [x] **Step 5:** `npm run -s build` completed successfully; it showed the usual canvas/sharp duplicate class warnings but produced no blocking errors.

### Task 4: Capture verification report
**Files:** N/A (documentation)

- [x] **Step 1:** Verified commands: `npx vitest run ...` (all suites passed with routine router logs), `npm run -s typecheck` (clean), `npx eslint app/api/ai lib/ai lib/rate-limit.ts` (warnings only), `npm run -s build` (success, Canvas/Sharp duplicate class warning).
- [x] **Step 2:** Modified files tracking this work: `docs/superpowers/specs/2026-03-14-ai-verification-design.md`, `docs/superpowers/plans/2026-03-14-ai-verification-plan.md`. No logic files required changes because the pipeline already passed.
