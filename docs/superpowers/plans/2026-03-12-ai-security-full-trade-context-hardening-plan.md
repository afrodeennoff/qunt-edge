# AI Security + Full-Trade Context Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure all AI routes against data leakage/prompt injection/cost abuse while preserving a strong user experience where AI can analyze the user's full trade history safely.

**Architecture:** Add a shared AI route guard layer (auth + entitlement + per-user/IP rate limiting + usage budget), a safe trade-access layer (full-history access with field-level sanitization and request-scoped caching), and a prompt safety layer (input sanitization + injection detection + tool scope controls). Migrate all AI routes/tools to those shared primitives and add regression tests for security, UX quality, and performance.

**Tech Stack:** Next.js route handlers, Vercel AI SDK (`streamText`, tools), Zod, Prisma, Upstash rate limiter, Vitest.

---

## Chunk 1: Guard Rails (Auth, Entitlement, Rate, Budget)

### Task 1: Create shared AI route guard utilities

**Files:**
- Create: `lib/ai/route-guard.ts`
- Create: `lib/ai/entitlements.ts`
- Create: `lib/ai/usage-budget.ts`
- Modify: `lib/rate-limit.ts`
- Test: `tests/api/ai-route-guard.test.ts`

- [ ] **Step 1: Write failing tests for route guard behavior**

```ts
// tests/api/ai-route-guard.test.ts
it("returns 401 when user missing", async () => {})
it("returns 403 when plan lacks AI entitlement", async () => {})
it("returns 429 when user budget exceeded", async () => {})
it("allows request when all checks pass", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/api/ai-route-guard.test.ts`
Expected: FAIL (missing module/behavior)

- [ ] **Step 3: Implement minimal route guard**

Implementation requirements:
- `lib/ai/route-guard.ts` exports `guardAiRequest(req, feature, limitConfig)` that returns either:
  - `{ ok: true, userId, email, headers }`
  - `{ ok: false, response }` (prebuilt NextResponse)
- Guard order:
  1. Auth check (`createRouteClient(req).auth.getUser()`)
  2. Entitlement check (`canAccessAiFeature(userId, feature)`)
  3. Rate limit check (user+IP composite key)
  4. Usage budget check (`assertWithinAiBudget(userId, feature)`)

- `lib/ai/entitlements.ts`:
  - Read subscription state (`server/subscription.ts` or direct Prisma query)
  - Define feature matrix (chat/support/editor/analysis/transcribe)
  - Return typed decision `{ allowed: boolean; reason?: string; plan?: string }`

- `lib/ai/usage-budget.ts`:
  - Derive monthly token usage from `AiRequestLog.totalTokens`
  - Enforce per-plan monthly token ceilings
  - Return structured over-limit response metadata

- `lib/rate-limit.ts` changes:
  - Add optional `subject` override (e.g., `user:${userId}`)
  - Key format: `${identifier}:${subject}:${ip}`
  - Preserve current behavior when `subject` absent

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/api/ai-route-guard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ai/route-guard.ts lib/ai/entitlements.ts lib/ai/usage-budget.ts lib/rate-limit.ts tests/api/ai-route-guard.test.ts
git commit -m "feat(ai): add shared route guard with entitlement and budget checks"
```

---

### Task 2: Apply guard utility to every AI route

**Files:**
- Modify: `app/api/ai/chat/route.ts`
- Modify: `app/api/ai/support/route.ts`
- Modify: `app/api/ai/editor/route.ts`
- Modify: `app/api/ai/transcribe/route.ts`
- Modify: `app/api/ai/mappings/route.ts`
- Modify: `app/api/ai/format-trades/route.ts`
- Modify: `app/api/ai/analysis/accounts/route.ts`
- Modify: `app/api/ai/analysis/instrument/route.ts`
- Modify: `app/api/ai/analysis/global/route.ts`
- Modify: `app/api/ai/analysis/time-of-day/route.ts`
- Modify: `app/api/ai/search/date/route.ts`
- Test: `tests/api/ai-routes-authz-contract.test.ts`

- [ ] **Step 1: Write failing route contract tests**

```ts
// tests/api/ai-routes-authz-contract.test.ts
it.each(AI_ROUTES)("%s rejects anonymous with 401", async () => {})
it.each(AI_ROUTES)("%s rejects no-entitlement with 403", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/api/ai-routes-authz-contract.test.ts`
Expected: FAIL

- [ ] **Step 3: Replace per-route duplicated auth/rate code with guard**

Implementation requirements:
- In each route:
  - Call `guardAiRequest(...)` at top of handler
  - Return `guard.response` early when not ok
  - Use returned `userId` from guard for downstream telemetry/budget
- Keep existing route-specific rate limits, but route through shared guard interface

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/api/ai-routes-authz-contract.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/ai/**/route.ts tests/api/ai-routes-authz-contract.test.ts
git commit -m "refactor(ai): enforce shared authz guard across all ai routes"
```

---

## Chunk 2: Prompt Injection Hardening

### Task 3: Add prompt safety middleware and strict message normalization

**Files:**
- Create: `lib/ai/prompt-safety.ts`
- Modify: `app/api/ai/chat/route.ts`
- Modify: `app/api/ai/editor/route.ts`
- Modify: `app/api/ai/support/route.ts`
- Modify: `app/api/ai/analysis/accounts/route.ts`
- Modify: `app/api/ai/analysis/instrument/route.ts`
- Modify: `app/api/ai/analysis/global/route.ts`
- Modify: `app/api/ai/analysis/time-of-day/route.ts`
- Test: `tests/api/ai-prompt-injection-guard.test.ts`

- [ ] **Step 1: Write failing injection guard tests**

```ts
it("blocks known jailbreak patterns", async () => {})
it("strips system-role override attempts from user content", async () => {})
it("keeps normal user prompts intact", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/api/ai-prompt-injection-guard.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement prompt safety module**

Implementation requirements:
- `sanitizeUserMessages(messages)`:
  - Normalize accepted message structure (`role`, `text`), reject unknown shapes
  - Flatten `parts` safely
  - Cap per-message text length + total text length
- `detectPromptInjection(text)`:
  - Heuristic signatures (ignore previous instructions, reveal system prompt, tool abuse requests)
  - Return score + signals
- `enforcePromptSafety(messages)`:
  - If high-risk: return policy block response (400/422) with safe message
  - If medium-risk: keep request but append immutable safety preamble

Route integration:
- Replace permissive `z.unknown()` paths with normalized text-only extraction
- Apply safety check before `convertToModelMessages`
- Add telemetry field for `promptRiskScore` in metadata

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/api/ai-prompt-injection-guard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ai/prompt-safety.ts app/api/ai/**/route.ts tests/api/ai-prompt-injection-guard.test.ts
git commit -m "feat(ai): add prompt injection detection and message sanitization"
```

---

## Chunk 3: Full Trade Access + Data Minimization (Best UX + Safe)

### Task 4: Replace raw full-trade payload with safe projected full-history access

**Files:**
- Create: `lib/ai/trade-access.ts`
- Modify: `lib/ai/get-all-trades.ts`
- Modify: `lib/ai/trade-normalization.ts`
- Test: `tests/lib/ai-trade-access.test.ts`

- [ ] **Step 1: Write failing tests for safe projection/full-history behavior**

```ts
it("returns full history counts while excluding sensitive binary fields", async () => {})
it("supports profile-based projections (summary/detail/analysis)", async () => {})
it("sets dataQualityWarning when capped", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/lib/ai-trade-access.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement safe full-history access contract**

Implementation requirements:
- `trade-access.ts` exports:
  - `getAiTrades({ profile, forceRefresh })`
  - `profile` enum: `summary`, `analysis`, `detail`
  - all profiles can use full history, but projected fields differ
- Explicitly exclude sensitive fields from all profiles:
  - `imageBase64`, `imageBase64Second`, any large raw blobs
- Keep strong UX:
  - preserve full historical depth for metrics/trends
  - include all non-sensitive fields needed for high-quality AI answers
- Add request-scoped memoization so repeated tool calls in same request do not refetch

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/lib/ai-trade-access.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ai/trade-access.ts lib/ai/get-all-trades.ts lib/ai/trade-normalization.ts tests/lib/ai-trade-access.test.ts
git commit -m "feat(ai): add safe full-history trade access with profile projections"
```

---

### Task 5: Migrate chat/analysis tools to safe trade-access API

**Files:**
- Modify: `app/api/ai/chat/tools/get-trades-details.ts`
- Modify: `app/api/ai/chat/tools/get-trades-summary.ts`
- Modify: `app/api/ai/chat/tools/get-last-trade-data.ts`
- Modify: `app/api/ai/chat/tools/get-instrument-performance.ts`
- Modify: `app/api/ai/chat/tools/get-time-of-day-performance.ts`
- Modify: `app/api/ai/analysis/accounts/get-account-performance.ts`
- (and other tools currently calling `getAllTradesForAi`)
- Test: `tests/api/ai-tools-data-safety.test.ts`

- [ ] **Step 1: Write failing tool safety tests**

```ts
it("get-trades-details never returns image fields", async () => {})
it("analysis tools still compute metrics with full history", async () => {})
it("repeated tools share request-scoped cache", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/api/ai-tools-data-safety.test.ts`
Expected: FAIL

- [ ] **Step 3: Migrate tools**

Implementation requirements:
- Replace direct `getAllTradesForAi()` calls with `getAiTrades({ profile })`
- Ensure `get-trades-details` no longer returns `images` array
- Keep top-N row limits in detail tools for token safety
- Use `summary/analysis` profiles to reduce token bloat while preserving accuracy

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/api/ai-tools-data-safety.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/ai/**/tools/*.ts tests/api/ai-tools-data-safety.test.ts
git commit -m "refactor(ai): migrate tools to safe projected trade access"
```

---

## Chunk 4: Cost Control + Observability + Route Consistency

### Task 6: Enforce per-user AI budgets and consistent route error contract

**Files:**
- Modify: `lib/ai/telemetry.ts`
- Modify: `app/api/ai/chat/route.ts`
- Modify: `app/api/ai/support/route.ts`
- Modify: `app/api/ai/editor/route.ts`
- Modify: `app/api/ai/analysis/*.ts`
- Test: `tests/api/ai-budget-enforcement.test.ts`

- [ ] **Step 1: Write failing budget enforcement tests**

```ts
it("returns 429 when monthly token budget exhausted", async () => {})
it("logs budget denials with consistent error category", async () => {})
it("returns unified api error shape for ai routes", async () => {})
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run tests/api/ai-budget-enforcement.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement budget + error consistency**

Implementation requirements:
- Use shared `apiError(...)` shape in all AI routes
- Add budget metadata in telemetry:
  - `budgetLimit`, `budgetUsed`, `budgetRemaining` in metadata
- Denied calls should log with explicit `errorCategory: "rate_limit" | "policy"`
- Keep existing streaming behavior unchanged for successful calls

- [ ] **Step 4: Run tests to pass**

Run: `npx vitest run tests/api/ai-budget-enforcement.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ai/telemetry.ts app/api/ai/**/route.ts tests/api/ai-budget-enforcement.test.ts
git commit -m "feat(ai): enforce per-user ai budgets and unified route errors"
```

---

### Task 7: Add E2E AI security contract tests (regression suite)

**Files:**
- Create: `tests/api/ai-security-regression.test.ts`
- Create: `tests/api/ai-full-history-ux.test.ts`

- [ ] **Step 1: Write regression tests**

Coverage requirements:
- anonymous request -> 401
- no entitlement -> 403
- over budget -> 429
- prompt injection attempt -> blocked/sanitized
- full-history analytics still produce expected aggregate answer quality
- no `imageBase64` in tool payload/response

- [ ] **Step 2: Run tests to confirm initial failure**

Run:
`npx vitest run tests/api/ai-security-regression.test.ts tests/api/ai-full-history-ux.test.ts`

Expected: FAIL

- [ ] **Step 3: Fix any remaining route/tool regressions**

- [ ] **Step 4: Re-run tests to pass**

Run:
`npx vitest run tests/api/ai-security-regression.test.ts tests/api/ai-full-history-ux.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/api/ai-security-regression.test.ts tests/api/ai-full-history-ux.test.ts
git commit -m "test(ai): add end-to-end security and full-history ux regressions"
```

---

## Chunk 5: Verification + Documentation

### Task 8: Verify complete system and document rollout

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/audits/ai-system-comprehensive-analysis.md` (append remediation status)
- Create: `docs/audits/ai-security-remediation-checklist.md`

- [ ] **Step 1: Run focused AI test suite**

Run:
`npx vitest run tests/api/ai-*.test.ts tests/lib/ai-*.test.ts tests/api/ai-security-regression.test.ts tests/api/ai-full-history-ux.test.ts`

Expected: PASS

- [ ] **Step 2: Run typecheck + build gates**

Run:
- `npm run -s typecheck`
- `npm run -s build`

Expected: PASS

- [ ] **Step 3: Run full suite smoke**

Run:
- `npm test`

Expected: PASS (warnings-only baseline acceptable)

- [ ] **Step 4: Update documentation**

Document:
- What changed
- What I want
- What I don't want
- How we fixed that
- Key files
- Verification commands/results

- [ ] **Step 5: Final commit**

```bash
git add AGENTS.md docs/audits/ai-system-comprehensive-analysis.md docs/audits/ai-security-remediation-checklist.md
git commit -m "docs(ai): record security hardening and full-history safe access rollout"
```

---

## Definition of Done

- All AI routes use shared guard (`auth + entitlement + per-user/IP rate + budget`).
- Prompt injection checks active on all text-generation AI routes.
- AI can still analyze full trade history, but sensitive fields (notably image blobs) are never sent to model context.
- Tool layer migrated to safe trade-access profiles with request-scoped cache.
- AI routes emit consistent error shapes.
- Regression tests for security + UX + full-history analytics pass.
- Typecheck/build/tests pass.

---

## Rollout / Risk Controls

- Ship behind env flags for first deploy:
  - `AI_PROMPT_SAFETY_STRICT=true`
  - `AI_BUDGET_ENFORCEMENT=true`
  - `AI_TRADE_SAFE_PROJECTION=true`
- First 24h monitor:
  - AI 4xx/5xx rates
  - budget rejection counts
  - token usage per user/plan
  - chat success rate vs baseline
