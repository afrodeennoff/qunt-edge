# Security Logging Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the five sensitive API routes so that logs never leak raw PII or full error payloads while keeping diagnostics available for debugging.

**Architecture:** Each route will emit structured, sanitized log payloads and reuse a small helper where convenient instead of printing raw identifiers or error bodies. The cron/renewal/email/benchmark routes will log contextual details without leaking user emails, and each log will carry a sanitized error summary.

**Tech Stack:** Next.js API routes, Prisma-backed services, Resend email client, built-in `console` logging.

---

## Chunk 1: Cron route logging

### Task 1: `app/api/cron/route.ts`

- **Files:** Modify `app/api/cron/route.ts`
- **Testing:** `npm run lint -- app/api/cron/route.ts`
- [ ] **Step 1: Define sanitized logger helper.** Add a helper at the top of the file that accepts a `level`, event string, and context object (masking user identifiers and emoji) and writes a structured `console[level]` entry with only `userId`, `batchId`, `statusCode`, or `message`. Include a minimal code sample that shows the helper signature and usage.
- [ ] **Step 2: Replace raw logs throughout the route.** Update the `console.warn` and `console.error` calls (batch fetch failures, missing emails, resend failures) to call the helper with sanitized context (e.g. `event: 'cron.user-fetch'`, `userId: user.id?.slice(0, 6)` or `userIdHash`, `status: response.status`, `error: safeMessage`). Keep success metrics logging minimal.
- [ ] **Step 3: Run lint.** Execute `npm run lint -- app/api/cron/route.ts` and confirm it stays clean; capture the command output as verification.
- [ ] **Step 4: Validate no new type/regression warnings.** Review the lint output and, if needed, adjust helper typing or log arguments to keep warnings at zero.
- [ ] **Step 5: Document completion.** Record the sanitized logging change in `tasks/todo.md` (checklist entry) and include the lint command outcome.

## Chunk 2: Renewal notice cron

### Task 2: `app/api/cron/renewal-notice/route.ts`

- **Files:** Modify `app/api/cron/renewal-notice/route.ts`
- **Testing:** `npm run lint -- app/api/cron/renewal-notice/route.ts`
- [ ] **Step 1:** Replace `console.error`/`console.warn` calls that interpolate `userEmail` or `account.id` directly with structured logs (avoid exposing `userEmail` even in sanitized form). Include only context such as `userHash`, `accountId`, `errorMessage`, `daysUntilRenewal`.
- [ ] **Step 2:** Ensure the catch-all `console.error('Renewal notice cron job error:', error)` also uses sanitized message (e.g. `error?.message` and `service: 'renewal-notice'`).
- [ ] **Step 3:** Run `npm run lint -- app/api/cron/renewal-notice/route.ts` to verify no warnings/errors.
- [ ] **Step 4:** Confirm the lint output and note the timestamp/result for verification.
- [ ] **Step 5:** Mark the task as done in `tasks/todo.md`.

## Chunk 3: Email formatting & weekly summary routes

### Task 3: `app/api/email/format-name/route.ts`

- **Files:** Modify `app/api/email/format-name/route.ts`
- **Testing:** `npm run lint -- app/api/email/format-name/route.ts`
- [ ] **Step 1:** Replace `console.error` calls that include subscriber emails or raw errors with structured logs that only carry a hash of the email plus `errorMessage: error.message` (no stack) and `context: inference.phase`.
- [ ] **Step 2:** Use `console.error` in the GET handler similarly (avoid printing `error` object directly) and log the request phase (GET vs POST).
- [ ] **Step 3:** Run lint to ensure no new warnings.
- [ ] **Step 4:** Capture lint output for verification.
- [ ] **Step 5:** Update `tasks/todo.md`.

### Task 4: `app/api/email/weekly-summary/[userid]/route.ts`

- **Files:** Modify `app/api/email/weekly-summary/[userid]/route.ts`
- **Testing:** `npm run lint -- app/api/email/weekly-summary/[userid]/route.ts`
- [ ] **Step 1:** Sanitize the final `console.error('API error:', error)` to log only `error?.message`, `phase: 'weekly-summary POST'`, and a masked `userId` (e.g. first 8 chars).
- [ ] **Step 2:** Ensure `toErrorResponse` still receives the original error and no new PII is added.
- [ ] **Step 3:** Run lint to ensure coverage.
- [ ] **Step 4:** Record lint output.
- [ ] **Step 5:** Mark task as done in `tasks/todo.md`.

## Chunk 4: Trader benchmark route

### Task 5: `app/api/trader-profile/benchmark/route.ts`

- **Files:** Modify `app/api/trader-profile/benchmark/route.ts`
- **Testing:** `npm run lint -- app/api/trader-profile/benchmark/route.ts`
- [ ] **Step 1:** Replace the `console.warn`/`console.error` messages that currently print long strings with structured logs containing only `event`, `reason`, and sanitized `errorMessage` (no error stack or meta). Keep the `snapshotTableAvailable` flag and event tags for context.
- [ ] **Step 2:** Ensure the catch-all `console.error` logs the sanitized message and `userId` if available (masked) while returning a generic error response.
- [ ] **Step 3:** Run lint on this file.
- [ ] **Step 4:** Capture lint output for verification.
- [ ] **Step 5:** Add checklist entry to `tasks/todo.md`.

## Chunk 5: Verification summary

### Task 6: Verification

- **Files:** None
- **Testing:** `npm run lint -- app/api/cron/route.ts app/api/cron/renewal-notice/route.ts app/api/email/format-name/route.ts app/api/email/weekly-summary/[userid]/route.ts app/api/trader-profile/benchmark/route.ts`
- [ ] **Step 1:** Run the combined lint command to confirm all touched routes are clean.
- [ ] **Step 2:** Capture the command output.
- [ ] **Step 3:** Update `tasks/todo.md` with the verification status.
- [ ] **Step 4:** Summarize the verification results for the final response.
