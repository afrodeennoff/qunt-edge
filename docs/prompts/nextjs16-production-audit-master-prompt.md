# Final Production-Ready Prompt (with your checklist embedded)

## Summary
This plan produces a single reusable master prompt for Codex CLI that:
- Forces official Next.js App Router alignment.
- Requires non-mutating repo audit first.
- Outputs exec brief + prioritized findings + implementation-ready checklist.
- Includes your full checklist block as a mandatory baseline section.

## Production Prompt (copy/paste as-is)

```text
You are a Staff+ Next.js production auditor and remediation planner working in Codex CLI.

Objective:
Study the project end-to-end and deliver a decision-complete production readiness package covering:
- Performance optimization
- Security hardening
- Authentication/authorization correctness
- Vulnerability prevention
- Reliability/resilience
- Memory and resource efficiency
- Bug and regression risk
- UX and accessibility quality

Hard requirements:
1) Use official Next.js App Router guidance:
   - https://nextjs.org/docs/app/getting-started
   - Related official pages for caching, server/client components, route handlers, metadata, lazy loading, security, memory, and production checklist.
2) Start with non-mutating exploration only (read/search/analyze/build/test allowed; no file edits unless explicitly requested later).
3) Use evidence from this repo for every important finding (file path + short proof).
4) Do not guess. Mark uncertainty explicitly.
5) Output must be implementation-ready so another engineer can execute without making decisions.

Execution process:
A) Repo Grounding
- Map route structure (App Router), API handlers, middleware/proxy, server actions, auth boundaries, cache/revalidation paths, client/server boundaries, and heavy dependencies.
- Compute key pressure signals (use-client count, dynamic-route count, image/font/script usage, route budget coverage).

B) Architecture and Performance Audit
- Rendering strategy per route (static/dynamic/ISR/PPR suitability).
- Caching correctness (`revalidate`, tags, no-store usage, cache invalidation scope).
- Bundle/hydration pressure and dynamic import opportunities.
- Built-in optimizations (`next/image`, `next/font`, `next/script`) and CLS/LCP implications.

C) Security/Auth/Vulnerability Audit
- Route handler and server action authorization consistency.
- Secret handling fail-closed behavior.
- Redirect safety, CSRF posture, input validation boundaries, rate limiting.
- Security headers and CSP quality.
- Sensitive logging/data leakage risk.

D) Reliability/Memory/Operations Audit
- Build reproducibility and CI reliability.
- Timeout/retry/idempotency patterns for external systems.
- Memory pressure risks in server and client paths.
- Health/readiness coverage and deploy rollback safety.

E) UX/A11y Audit
- Loading/error/empty states in App Router segments.
- Perceived performance and hydration deferral.
- Keyboard/focus/contrast/ARIA checks on critical paths.

Output format (strict):
1. Executive Brief (max 12 lines)
2. Top Risks (P0/P1/P2) with:
   - Title
   - Impact domain
   - Evidence
   - Risk if unfixed
   - Recommended fix
   - Effort (S/M/L)
   - Confidence (0-1)
3. Decision-Complete Remediation Checklist
4. File-Level Change Plan
5. Test/Verification Matrix (commands + pass criteria)
6. Assumptions and defaults used
7. Official docs used (links)

Now include the following section verbatim in your output under:
"# Next.js 16 End-to-End Optimization, Security, Reliability, and UX Checklist (Qunt Edge)"

## Summary
This is a decision-complete checklist based on:
- Direct repo audit (`/Users/timon/Downloads/final-qunt-edge-main`)
- Official Next.js App Router docs (updated February 11, 2026)
- Your requested 2025-style optimization set (images/fonts/scripts, rendering, bundle control, SEO, CI/deploy)

Current repo signals to prioritize first:
- `P0`: `npm run analyze` fails during `next build` with missing `.next/server/pages-manifest.json` after clean.
- `P1`: `335` `"use client"` boundaries (high client JS pressure risk).
- `P1`: `6` raw `<img>` usages remain.
- `P1`: no `next/font` usage detected.
- `P1`: `check:route-budgets` currently reports only `/_app`, so App Router route budget governance is weak.

## Important public API / interface / type changes to plan
- Add shared API validation wrapper for Route Handlers:
  - `app/api/_utils/validate.ts` with typed `parseJson<T>()` + Zod.
- Add shared auth guard utilities:
  - `server/authz.ts` standard guards (`requireUser`, `requireAdmin`, `requireServiceAuth`).
- Add security header/CSP composer:
  - `lib/security/csp.ts` to generate per-request nonce CSP for `proxy.ts`.
- Add observability contracts:
  - `app/api/health/route.ts` and `app/api/ready/route.ts` with stable JSON schema.
- Add perf governance artifacts:
  - `docs/audits/artifacts/perf-baseline.json` and `docs/audits/artifacts/web-vitals.json`.

## Full checklist

### 1) Built-in Component Optimization (include this)
- [ ] Replace all remaining `<img>` with `next/image` in:
  - `/Users/timon/Downloads/final-qunt-edge-main/components/ai-elements/image.tsx`
  - `/Users/timon/Downloads/final-qunt-edge-main/components/ai-elements/prompt-input.tsx`
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/chat/input.tsx`
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/chat/chat.tsx`
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- [ ] Ensure above-the-fold images use `priority` and explicit dimensions to reduce CLS.
- [ ] Introduce `next/font` in root layout (replace ad-hoc font loading paths).
- [ ] Use `next/script` strategies per script class:
  - `beforeInteractive` only for critical anti-flash/theme bootstrap.
  - `lazyOnload` or worker pattern for analytics/third-party.
- [ ] Remove unnecessary inline scripts or protect with nonce-based CSP.

### 2) Rendering & Architecture (include this)
- [ ] Keep Server Components by default; reduce `"use client"` islands (target: cut 335 by 20–30% in first pass).
- [ ] Keep interactive leaves client-only; move data fetching and transforms to server.
- [ ] Expand `next/dynamic` for heavy dashboard widgets/charts not needed at first paint.
- [ ] Audit `force-dynamic` usage:
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/page.tsx`
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/layout.tsx`
- [ ] Add/standardize Suspense boundaries around slow async server branches.
- [ ] Normalize caching policy (`revalidate`, `revalidateTag`, `revalidatePath`) by route intent:
  - Marketing/static routes: ISR
  - User dashboards: dynamic or short revalidate + tag invalidation
  - APIs: explicit cache/no-store strategy

### 3) Quality & Bundle Control (include this)
- [ ] Fix build reliability first: resolve missing `pages-manifest.json` failure in `npm run analyze`.
- [ ] Harden bundle governance scripts to include App Router routes deterministically.
- [ ] Add `@next/bundle-analyzer` integration alongside custom scripts for cross-validation.
- [ ] Keep `optimizePackageImports` and verify impact with before/after route payload report.
- [ ] Lock high-priority route budgets:
  - Home route JS budget
  - Dashboard route JS budget
- [ ] Add CI fail gates for budget regressions (PR blocking).

### 4) SEO & Metadata (include this)
- [ ] Keep Metadata API as primary source; avoid conflicting manual `<head>` tags where redundant.
- [ ] Verify locale-aware canonical/alternate links for all localized routes.
- [ ] Keep and validate JSON-LD where present; add schema tests.
- [ ] Regenerate `robots`/`sitemap` for localized path coverage and route parity.
- [ ] Validate OG/Twitter images on key pages and dynamic OG routes.

### 5) Deployment & Automation (include this)
- [ ] CI pipeline on each PR: `lint`, `typecheck`, `test`, `build`, `check:route-budgets`.
- [ ] Add Lighthouse CI (lab) + field vitals ingest (`useReportWebVitals` path).
- [ ] Keep optional `output: "standalone"` path for Docker/self-host deploy profile.
- [ ] Add pre-commit hooks only for fast checks (lint-staged/typecheck subset), not full build.
- [ ] Add release checklist with rollback + smoke test scripts.

### 6) Security hardening
- [ ] Add strict nonce-based CSP in `proxy.ts` for non-embed routes; remove reliance on legacy `X-XSS-Protection`.
- [ ] Keep HSTS, nosniff, frame options, permissions policy; add COOP/CORP policies where compatible.
- [ ] Separate embed CSP policy from app CSP (already partially done) and restrict allowed origins further.
- [ ] Add request size/rate limits for mutation-heavy APIs.
- [ ] Standardize input validation for all route handlers with Zod at boundaries.
- [ ] Ensure sensitive errors never leak stack traces to clients.
- [ ] Run dependency vulnerability scan in CI and enforce severity threshold.

### 7) Authentication & authorization
- [ ] Enforce server-side re-auth inside every Server Action and Route Handler mutation.
- [ ] Ban trust of client/user headers for identity resolution (session-backed only).
- [ ] Ensure route-level auth matrix coverage:
  - Public
  - Authenticated
  - Admin
  - Service/cron signed
- [ ] Add regression tests for redirect safety (`next` param sanitization, protocol-relative blocking).
- [ ] Add CSRF review for any cookie-auth + form endpoints; verify origin/host constraints.

### 8) Vulnerability and bug prevention
- [ ] Add static audit checklist for `proxy.ts`, `route.ts`, and `"use server"` files.
- [ ] Add fuzz/negative tests for query/body params on high-risk endpoints.
- [ ] Add strict schema validation for external webhook payloads and provider callbacks.
- [ ] Add SAST/dependency checks in CI with actionable report artifact.

### 9) Reliability, resilience, and memory
- [ ] Fix current build reproducibility issue before optimization rollout.
- [ ] Add health/readiness endpoints with dependency checks (DB, auth provider, critical secrets).
- [ ] Keep timeouts/retries/circuit-breakers for external APIs (email, AI, broker sync).
- [ ] Add memory diagnostics job:
  - `next build --experimental-debug-memory-usage`
  - optional heap profile capture for regressions
- [ ] Tune Node memory only after profiling; avoid blind increases.
- [ ] Add background job idempotency and dead-letter strategy for cron/webhooks.

### 10) User experience and accessibility
- [ ] Add consistent loading/skeleton/error-empty states in App Router (`loading.tsx`, `error.tsx`, not-found paths).
- [ ] Reduce hydration cost on dashboard by deferring non-critical widgets.
- [ ] Improve perceived performance:
  - prefetch critical nav paths
  - prioritize hero content
  - lazy-load below-fold sections
- [ ] Add accessibility pass:
  - keyboard navigation
  - focus management in dialogs/sheets
  - color contrast
  - ARIA labels on interactive controls
- [ ] Add Web Vitals dashboards with SLOs for LCP, INP, CLS.

## Test cases and scenarios
- [ ] Build path: `npm run build` passes after clean in CI and locally.
- [ ] Route budgets: fail CI on JS payload regression for critical routes.
- [ ] Security headers: automated assertion for CSP/HSTS/nosniff/frame policies.
- [ ] Auth regression tests:
  - unauthenticated access blocked
  - cross-user IDOR attempts blocked
  - admin-only routes gated
- [ ] API validation tests:
  - malformed body/query rejected with safe errors
  - rate-limit behavior verified
- [ ] UX/perf tests:
  - Lighthouse CI budgets
  - Web Vitals event collection smoke test
  - no unexpected layout shifts for hero/dashboard shell.

## Assumptions and defaults
- App remains on Next.js App Router (`next@16.x`) and React 19.
- Supabase stays primary auth/data platform.
- Dashboard stays dynamic, but with tighter client-boundary control.
- Existing custom scripts remain, but CI truth source becomes reproducible build + explicit route budgets.
- Security posture defaults to fail-closed (missing secret/config => deny).

## Official docs used
- [App Router Getting Started](https://nextjs.org/docs/app/getting-started)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Image Optimization](https://nextjs.org/docs/pages/getting-started/images)
- [Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading)
- [Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Memory Usage](https://nextjs.org/docs/app/guides/memory-usage)
- [Content Security Policy Guide](https://nextjs.org/docs/pages/guides/content-security-policy)
```

## Test Cases and Scenarios
- Paste prompt into Codex CLI for `/Users/timon/Downloads/final-qunt-edge-main`.
- Confirm output preserves your full checklist section verbatim.
- Confirm findings include evidence + P0/P1/P2 prioritization.
- Confirm official Next.js links are cited in result.

## Assumptions and Defaults
- Target agent is Codex CLI.
- Deliverable is audit + plan (not immediate file mutation).
- Output style is exec brief + detailed engineering checklist.
