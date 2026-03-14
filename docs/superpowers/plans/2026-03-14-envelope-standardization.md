# Envelope Standardization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for realtime tracking.

**Goal:** Force all validation failures and handled API errors in the targeted endpoints into the `{ error: { code, message, details? } }` envelope without touching unrelated files.

**Architecture:** `apiError` becomes the single surface for structured errors, while `RequestValidationError` and `toValidationErrorResponse` are kept aligned so validation failures carry consistent codes and metadata back to every route. Routes stay responsible for success payloads but delegate all error paths to the helper.

**Tech Stack:** Next.js App Router (`NextResponse`), `zod` for runtime validation, shared `lib/api-response.ts`, and `vitest` for fast unit checks.

---

### Task 1: Harden the validation helpers

**Files:**
- Modify: `app/api/_utils/validate.ts`
- Modify: `lib/api-response.ts`
- Test: `tests/app/api/_utils/validate.test.ts`

- [ ] **Step 1: Extend `RequestValidationError` to carry an explicit `ApiErrorCode` (defaulting to `"VALIDATION_FAILED"`) and expose it outside the helper.**

```ts
constructor(message: string, status = 400, details?: unknown, code: ApiErrorCode = "VALIDATION_FAILED") {
  super(message);
  this.status = status;
  this.details = details;
  this.code = code;
}
```

- [ ] **Step 2: Surface the `code` on every validation throw and keep `parseJson`, `parseQuery` aligned with `VALIDATION_FAILED`.**

- [ ] **Step 3: Reimplement `toValidationErrorResponse` to import `apiError` and return `apiError(code, message, status, details)` for `RequestValidationError` and `z.ZodError`, falling back to `apiError("INTERNAL_ERROR", "Internal server error", 500)`.**

- [ ] **Step 4: Write a unit test in `tests/app/api/_utils/validate.test.ts` that instantiates the helper, calls `toValidationErrorResponse` with each error path, and asserts the envelope, status, and detail payload.**

### Task 2: Update the targeted routes

**Files:**
- Modify: `app/api/rithmic/synchronizations/route.ts`
- Modify: `app/api/team/invite/route.ts`
- Modify: `app/api/team/accept-invitation/route.ts`

- [ ] **Step 1: Import `apiError` from `@/lib/api-response` at the top of each route and replace inline `NextResponse.json({ error: ... })` responses with `apiError(code, message, status, details?)`.**

```ts
return apiError("FORBIDDEN", "Forbidden", 403);
```

- [ ] **Step 2: Keep request validation handling (e.g., `parseJson`) and rate-limit helpers unchanged, but funnel fallback `catch` branches into `toValidationErrorResponse` and `apiError("INTERNAL_ERROR", ...)` so every error path returns the envelope (include `requestId` under `details`).**

- [ ] **Step 3: Preserve existing logging and success payloads while ensuring the new error payloads carry status codes such as `UNAUTHORIZED`, `VALIDATION_FAILED`, `BAD_REQUEST`, `NOT_FOUND`, and `INTERNAL_ERROR`.**

### Task 3: Add regression tests

**Files:**
- Create: `tests/lib/api-response.test.ts`
- Modify: (none)

- [ ] **Step 1: Write a test that calls `apiError("BAD_REQUEST", "Bad payload", 400, { foo: "bar" })`, awaits `response.json()`, and asserts the standardized envelope plus the `Cache-Control` header.**

- [ ] **Step 2: Add the new tests to `vitest` command lists and run `npx vitest tests/lib/api-response.test.ts tests/app/api/_utils/validate.test.ts` to prove the helpers behave as expected.**

- [ ] **Step 3: Confirm `npm run -s typecheck` still passes after touching the shared helper.**

Plan complete and saved to `docs/superpowers/plans/2026-03-14-envelope-standardization.md`. Ready to execute?
