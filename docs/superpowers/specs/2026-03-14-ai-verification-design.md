# AI Verification Design

## Goal
Resolve the workspace blockers exposed by the AI-focused verification pipeline (AI vitest suite, `npm run -s typecheck`, ESLint on the touched AI files, and `npm run -s build`) so that the AI subsystem is production-safe with clean error contracts and no dangling warnings. Changes must stay scoped to the AI stack unless a failure explicitly requires touching adjacent modules.

## Architecture
1. **Sequential verification loop** – rerun the AI-specific vitest command first to document the failing suites and narrow down the affected files (`app/api/ai/*`, `lib/ai/*`, `lib/ai/router/*`, `lib/rate-limit.ts`, etc.).
2. **Targeted fixes** – for each failing test or compile step, fix the smallest code surface needed while preserving ownership/auth flow, error envelopes, and existing signal semantics (e.g., `apiError` contracts, budget guards, per-user caching).
3. **Layered validation** – after each change set, re-run the impacted command (`typecheck`, `ESLint`, `build`) to confirm the failure is resolved before moving on.

## Testing & Verification
- `npx vitest run tests/api/ai-*.test.ts tests/lib/ai-router-integration.test.ts lib/__tests__/ai-support-route.test.ts tests/lib/ai-trade-access.test.ts tests/lib/ai-router-fallback-order.test.ts tests/lib/ai-client-router-propagation.test.ts`
- `npm run -s typecheck`
- `npx eslint` targeted at the AI files touched (e.g., `app/api/ai/**`, `lib/ai/**`, `lib/rate-limit.ts`, router helpers)
- `npm run -s build`

Failures will be recorded with the command and summarized (error message + suspect file) so we can clearly document what was fixed. Rinse-and-repeat until the full pipeline is green.

## Risks & Safeguards
- **Scope creep** – keep fixes localized to code referenced by the failing commands; raise new scope items if multiple modules require changes.
- **Regression** – rely on existing tests and error contracts; avoid behavior-changing refactors while cleaning up the blockers.
- **Verification** – capture command output snapshots so QA can re-run the same steps if needed.
