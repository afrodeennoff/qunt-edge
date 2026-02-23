# Frontend-Backend Integration Audit Report

**Date:** 2026-02-22  
**Scope:** Full-stack integration analysis: middleware, API routes, authentication flows, data fetching, error handling, and security headers.

---

## Executive Summary

The application is a Next.js App Router project (Tailwind v4, Supabase auth, Prisma ORM, pg pool adapter) with **45 API route handlers**. Overall integration quality is **good** — auth patterns are consistent, error handling is present, and structured logging exists. However, the audit found **3 critical**, **4 high**, **5 medium**, and **3 low** severity issues requiring attention before production launch.

---

## Critical Issues (P0 — Fix Before Launch)

### 1. CORS Wildcard on Authenticated Cron Route
- **File:** `app/api/cron/compute-trade-data/route.ts` (lines 472-474, 487-489)
- **Severity:** 🔴 CRITICAL
- **Finding:** Response includes `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS` on a cron route that handles sensitive trade data. Although the route IS gated by `requireServiceAuth()`, the CORS wildcard means browsers will accept responses from this endpoint in cross-origin contexts.
- **Root Cause:** Copy-pasted boilerplate CORS headers that are unnecessary — this is a server-to-server cron route, not a browser-facing API.
- **Remediation:** Remove all `Access-Control-*` headers from this route. Cron endpoints should never expose CORS headers. ✅ **FIXED**

### 2. `apiError` Missing 'UNAUTHORIZED' in Type Union
- **File:** `lib/api-response.ts` (line 3-9)
- **Severity:** 🔴 CRITICAL (type safety gap)
- **Finding:** `ApiErrorCode` includes `'BAD_REQUEST' | 'PAYLOAD_TOO_LARGE' | 'RATE_LIMITED' | 'VALIDATION_FAILED' | 'INTERNAL_ERROR' | string` but `'UNAUTHORIZED'` is used extensively across routes (trades, accounts, chat) without being in the explicit union. The `| string` fallback makes this compile but loses intent documentation.
- **Remediation:** Add `'UNAUTHORIZED' | 'FORBIDDEN'` to the explicit union. ✅ **FIXED**

### 3. Mock Data Fallback in Production DataProvider
- **File:** `context/data-provider.tsx` (lines 527-528, 611-614)
- **Severity:** 🔴 CRITICAL
- **Finding:** When no real trades exist OR when a fatal load error occurs, the DataProvider falls back to `generateMockTrades()` **in all environments including production**. This means production users with no trades (new signups) or users who experience a temporary backend failure will see fake demo data that could be confused for real data.
- **Root Cause:** The mock data fallback was originally dev-only but the environment guard was removed (line 527 comment says "regardless of environment (for demo purposes)").
- **Remediation:** Gate mock data behind `process.env.NODE_ENV === 'development'` or an explicit `NEXT_PUBLIC_ENABLE_MOCK_DATA` flag. In production, show an empty state instead. ✅ **FIXED**

---

## High Issues (P1 — Fix This Week)

### 4. Behavior Insights Route Uses Server Auth in API Route Handler
- **File:** `app/api/behavior/insights/route.ts` (line 15)
- **Severity:** 🟠 HIGH
- **Finding:** Uses `getDatabaseUserId()` which calls `requireAuthenticatedUser()` → `cookies()` from `next/headers`. This works in App Router route handlers but relies on the implicit Next.js request scope. The other API routes (`/dashboard/trades`, `/dashboard/accounts`, `/ai/chat`) correctly use `createRouteClient(request)` which is request-scoped and testable. Inconsistency creates maintenance risk and testability gaps.
- **Remediation:** Migrate to `createRouteClient(request)` pattern for consistency.

### 5. Rate Limiter is In-Memory Only
- **File:** `lib/rate-limit.ts` (line 8)
- **Severity:** 🟠 HIGH
- **Finding:** Rate limiting uses a `Map` stored in Node process memory. In serverless/edge deployments (Vercel), each function invocation gets its own memory space, so rate limits are **not enforced across invocations**. An attacker can bypass rate limits simply by hitting different serverless instances.
- **Root Cause:** No external store (Redis/Upstash) is configured.
- **Remediation:** For launch, this is acceptable if the primary attack surface (AI chat) has additional Vercel/provider-level rate limiting. Long-term, integrate Upstash Redis rate limiting via `@upstash/ratelimit`.

### 6. CSP `connect-src` Missing Application API Host
- **File:** `lib/security/csp.ts` (lines 7-13)
- **Severity:** 🟠 HIGH
- **Finding:** The production `connect-src` lists `'self'`, Supabase, and Vercel analytics. However, if the app makes fetch requests to external services (Databento, Resend, OpenAI) from the **client side**, those would be blocked by CSP. Currently OK because these calls happen server-side, but any future client-side API integration will break silently.
- **Remediation:** Document this constraint. If any external API calls need to happen client-side in future, add their origins to `PROD_CONNECT_SOURCES`.

### 7. Auth Callback `'use server'` Directive on Route Handler
- **File:** `app/api/auth/callback/route.ts` (line 1)
- **Severity:** 🟠 HIGH
- **Finding:** The file starts with `'use server'` but this is a **route handler** (exports `GET`), not a server action. The `'use server'` directive is designed for server actions only. In current Next.js versions this doesn't cause a runtime error for route handlers, but it's semantically incorrect and could cause issues in future Next.js updates.
- **Remediation:** Remove `'use server'` from route handler files. ✅ **FIXED**

---

## Medium Issues (P2 — Track for Post-Launch)

### 8. Inconsistent Error Response Shapes
- **Severity:** 🟡 MEDIUM
- **Finding:** Three different error response patterns exist:
  - `apiError()` → `{ error: { code, message, details } }` (used in dashboard/ai routes)
  - `toErrorResponse()` → `{ error, code, requestId }` (used in authz/cron routes)
  - Raw `NextResponse.json({ error: "..." })` (used in behavior/referral routes)
- **Impact:** Frontend error handlers must account for all three shapes, or one failing API route won't show a proper error message.
- **Remediation:** Standardize all routes to use `apiError()` from `lib/api-response.ts`.

### 9. `shouldRejectUnauthorized` Fallback Logic Bug
- **File:** `lib/prisma.ts` (line 112)
- **Severity:** 🟡 MEDIUM
- **Finding:** `return override ?? isProduction` — but `override` is the result of `parseBooleanEnv()` which returns `undefined` (not `null`). The `??` operator treats `undefined` the same as `null`, so the fallback works. However, the `override` variable was already checked at line 91 (`if (override !== undefined) return override`), so by line 112 `override` is **always undefined**. This line is equivalent to `return isProduction`.
- **Remediation:** Simplify to `return isProduction` for clarity.

### 10. DataProvider Creates Supabase Client at Module Level
- **File:** `context/data-provider.tsx` (line 240)
- **Severity:** 🟡 MEDIUM
- **Finding:** `const supabase = createClient()` is called at module top-level, outside any component. This creates a single shared browser Supabase client instance. While this is technically fine for browser clients (they share auth state via cookies), it means the client is created even during SSR/prerendering where `window` might not exist.
- **Remediation:** Wrap in a `useMemo` or lazy initialization pattern inside the component.

### 11. Referral Route Leaks User Emails
- **File:** `app/api/referral/route.ts` (lines 30-43)
- **Severity:** 🟡 MEDIUM
- **Finding:** The GET endpoint returns `email` for all referred users. While the route is authenticated (via `getDatabaseUserId`), the referrer can see the email addresses of everyone they referred. This may be a privacy concern under GDPR.
- **Remediation:** Return only masked emails (e.g., `j***@example.com`) or just the count.

### 12. Missing `Cache-Control` Headers on Several API Routes
- **Severity:** 🟡 MEDIUM
- **Finding:** Routes like `/api/behavior/insights`, `/api/referral`, `/api/trader-profile/benchmark`, and several AI routes don't set `Cache-Control: no-store`. This could lead to stale authenticated data being cached by browsers or CDN layers.
- **Remediation:** Add `no-store` headers to all authenticated API responses.

---

## Low Issues (P3 — Nice to Have)

### 13. `timingSafeEqual` Length Mismatch Can Throw
- **File:** `server/authz.ts` (line 163)
- **Severity:** 🟢 LOW
- **Finding:** If `candidate` and `secret` have different byte lengths, `timingSafeEqual` throws. The catch block handles this, but it's a silent failure path.
- **Remediation:** Already handled by `catch` → `AuthzError`. No action needed.

### 14. Console Debugging Left in Auth Callback
- **File:** `app/api/auth/callback/route.ts` (lines 26-32)
- **Severity:** 🟢 LOW
- **Finding:** `console.log('Auth callback debug:', ...)` logs user-agent and origin on every callback. This should use the structured logger.
- **Remediation:** Replace with `logger.info(...)` or remove.

### 15. Health Endpoint Exposes Memory Metrics
- **File:** `app/api/health/route.ts` (lines 55-59)
- **Severity:** 🟢 LOW
- **Finding:** Returns `rssMb`, `heapUsedMb`, `heapTotalMb` to all callers. Could aid attackers in profiling the runtime.
- **Remediation:** Consider restricting detailed metrics to authenticated admin requests.

---

## Architecture Summary (No Issues Found)

| Area | Status | Notes |
|------|--------|-------|
| **Middleware Auth Flow** | ✅ Good | Session refresh with 5s timeout, proper cookie handling, redirect safety |
| **CSP Implementation** | ✅ Good | Nonce-based, configurable strict mode, report-only option |
| **Prisma Connection Pooling** | ✅ Good | IPv4 forcing, Supabase pooler normalization, build-phase detection |
| **Webhook Signature Verification** | ✅ Good | Whop webhook uses SDK `unwrap()` with signature verification |
| **Cron Route Authentication** | ✅ Good | `requireServiceAuth()` with timing-safe comparison |
| **Admin Authorization** | ✅ Good | `assertAdminAccess()` guards all admin server actions |
| **Structured Logging** | ✅ Good | Redacts sensitive keys, correlation IDs, error alerting threshold |
| **Error Boundaries** | ✅ Good | `toErrorResponse()` and `apiError()` prevent stack trace leaks |

---

## Changes Made in This Audit

1. ✅ Removed CORS wildcard from cron route
2. ✅ Added UNAUTHORIZED/FORBIDDEN to ApiErrorCode union
3. ✅ Gated mock data behind development environment
4. ✅ Removed `'use server'` from auth callback route handler
5. ✅ Merged competing middleware files to resolve Next.js 16 build error and secure API routes with CORS + CSP.
6. ✅ Fixed dead-code fallback bug in Prisma TLS connection pooler initialization.
