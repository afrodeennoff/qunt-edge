I'm using the writing-plans skill to create the implementation plan.

# AI Backend Lint Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trim clearly unused imports/variables from the AI backend routes/helpers you scoped while keeping the behavior unchanged and confirming lint passes.

**Architecture:** Targeted inspection of the backend API routes + AI helper libraries. Keep each cleanup localized to the file that introduced the unused binding and leave any route logic untouched.

**Tech Stack:** Next.js API routes, TypeScript, `eslint.config.mjs` (Monorepo lint rules), `node`/`npm` toolchain.

---

### Task 1: Audit and tidy AI backend routes/helpers

**Files:**
- Modify: `/Users/timon/Downloads/qunt-edge/app/api/ai/format-trades/route.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/app/api/ai/chat/route.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/app/api/ai/mappings/route.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/app/api/ai/support/route.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/lib/rate-limit.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/lib/ai/trade-access.ts`
- Modify: `/Users/timon/Downloads/qunt-edge/lib/ai/client.ts`

- [ ] **Step 1: Gather the current import/variable list.** Open each file and note the imports/consts that are not referenced elsewhere (use `rg` or your IDE to spot unused bindings). Keep a quick note of the ones you plan to remove so you can explain them in the review.
- [ ] **Step 2: Remove the safe, clearly unused bindings.** For each file, delete unused imports/variables only when you are confident they were introduced in the current state and removing them keeps the same runtime behavior. Avoid touching any logic or introducing new code paths.
- [ ] **Step 3: Run `npm run lint` targeted via `npx eslint` on these files in fix/backport mode if necessary to satisfy formatting.** Expect the command to exit with `0` and no errors; capture the output for the final review text.

### Task 2: Record verification and follow-ups

- [ ] **Step 4: Update `tasks/todo.md` review section** (near the new plan) with the lint command results and any minor follow-ups discovered.
- [ ] **Step 5: Summarize the cleanup for the user** (final response) including what was removed, the lint output, and any residual risks.

Plan complete and saved to `docs/superpowers/plans/2026-03-13-ai-backend-lint-cleanup.md`. Ready to execute?
