# Publication Readiness Audit - 2026-02-22

## Executive Summary
- Decision: **NO-GO for publication on 2026-02-23**.
- Reason: Multiple **Critical** and **High** findings remain open, including exposed secret-bearing env files in git, disabled effective auth-attempt protection, non-enforced CSP posture by default, and broken compliance/security CI workflow coverage.
- Scope audited: frontend, backend/API, auth, DB schema/query patterns, security headers/CSP, dependency posture, CI/CD, Docker/runtime, and performance budgets.

## Evidence Collected
- `npm run typecheck` -> pass (`EXIT:0`)
- `npm test` -> pass (`137 passed | 46 skipped`)
- `npm run lint` -> pass with `1651` warnings (`0` errors)
- `npm run build` -> pass (`EXIT:0`) after sandbox permission escalation
- `npm run check:route-budgets` -> pass
- `npm run analyze:bundle` -> pass
- `npm audit --production` -> **blocked** (`ENOTFOUND registry.npmjs.org`)
- `npm run test:smoke` -> fail (no reachable runtime in this environment)

## Severity Legend
- Critical: Immediate launch blocker, exploitable/high business impact.
- High: Serious production risk; should be fixed before launch.
- Medium: Important risk; fix immediately after launch window if not blocked.
- Low: Hygiene/maintainability risk.

## Findings

### 1) Critical - Secret-bearing env files are tracked in git
- Area: Dependency & Environment Security
- Evidence:
  - `.env.production.local:2` through `.env.production.local:88` contain populated secrets/tokens.
  - `git ls-files '.env*'` includes `.env.production.local`, `.env.preview.local`, `.env.development.local`.
- Root cause:
  - Environment-local files with sensitive values were committed and retained in tracked source.
- Impact:
  - Secret exposure risk (internal repo, logs, forks, artifacts, accidental sharing); key compromise can affect DB, cron, email, APIs, webhooks.
- Remediation:
  1. Revoke/rotate all secrets currently present in tracked env files.
  2. Remove secret-bearing `.env*.local` files from git history and current tree.
  3. Keep only `.env.example` placeholders in source.
  4. Enforce pre-commit secret scanning (e.g., gitleaks) and CI secret scan gate.
- Estimate: 4-8 hours (rotation + cleanup + verification).

### 2) Critical - Auth attempt guard is a no-op (no effective lockout/rate defense)
- Area: Authentication & Authorization Flows
- Evidence:
  - `lib/security/auth-attempts.ts:7-34` always allows attempts and ignores failure/success recording.
  - `server/auth.ts` calls these functions for magic link/password/OTP flows.
- Root cause:
  - Security interface implemented as stub and left in production path.
- Impact:
  - Brute-force and abuse resistance expected by code is not active; audit/lockout telemetry absent.
- Remediation:
  1. Implement `checkAuthGuard`, `recordAuthFailure`, `recordAuthSuccess` against persistent storage (`AuthAttempt` table already exists).
  2. Enforce thresholds from `lib/security/auth-config.ts`.
  3. Add tests for lockout escalation and retry-after behavior.
- Estimate: 6-10 hours.

### 3) High - CSP not enforced by default; baseline security headers incomplete
- Area: API/Frontend Security Headers
- Evidence:
  - `proxy.ts:125` sets `cspReportOnly = process.env.CSP_REPORT_ONLY !== "false"` (defaults to report-only, not enforce).
  - Only `X-Frame-Options` handling observed for embed route (`proxy.ts:152`); no explicit `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` set in middleware.
- Root cause:
  - Safe rollout defaults remained in non-enforcing mode and header hardening is partial.
- Impact:
  - Reduced client-side exploitation resistance; weak pre-launch hardening posture.
- Remediation:
  1. Switch production to enforced CSP (`CSP_REPORT_ONLY=false`) after quick validation.
  2. Add strict baseline headers in middleware for HTML responses.
  3. Add header regression tests in CI.
- Estimate: 3-5 hours.

### 4) High - Compliance/security workflow references missing scripts and missing npm scripts
- Area: CI/CD Pipeline Security
- Evidence:
  - `.github/workflows/widget-policy-compliance.yml` references missing files:
    - `.github/scripts/validate-risk-registers.js` (line 93)
    - `.github/scripts/run-monte-carlo.js` (line 116)
    - `.github/scripts/check-coverage.js` (line 146)
    - `.github/scripts/check-widget-imports.js` (line 167)
    - `.github/scripts/validate-risk-hoc-usage.js` (line 171)
    - `.github/scripts/check-error-handling.js` (line 175)
    - `.github/scripts/generate-compliance-report.js` (line 216)
  - Missing package scripts referenced by workflow: `validate:schemas`, `test:policy`, `check:policy-drift`.
- Root cause:
  - Workflow drift from repository contents.
- Impact:
  - Security/compliance gates are unreliable; “green” workflow confidence is degraded.
- Remediation:
  1. Restore missing scripts or remove failing jobs.
  2. Align workflow to real scripts and fail hard for required checks.
- Estimate: 4-6 hours.

### 5) High - Input validation consistency gap across API surface
- Area: Backend Services / API Security
- Evidence:
  - `app/api/_utils/validate.ts` exists, but only two routes use `parseJson/parseQuery` (`app/api/email/format-name/route.ts`, `app/api/email/welcome/route.ts`).
  - `route_files=46`, `validated_routes=2`.
- Root cause:
  - No enforced validation convention across route handlers.
- Impact:
  - Increased risk of malformed input handling, business-logic abuse, and future injection vulnerabilities.
- Remediation:
  1. Standardize request/query schema validation for every mutating route first.
  2. Add lint/check rule to fail routes without schema validation.
- Estimate: 1-2 days for full migration; 4-6 hours for highest-risk routes.

### 6) High - Error boundaries expose raw runtime error messages to end users
- Area: Error Handling & Logging
- Evidence:
  - `app/error.tsx:21` renders `error.message`.
  - `app/[locale]/dashboard/error.tsx:21` renders `error.message`.
- Root cause:
  - User-facing boundary directly interpolates internal exception messages.
- Impact:
  - Potential information leakage (stack-adjacent content, internal identifiers/messages).
- Remediation:
  1. Show generic message to users.
  2. Keep detailed error in server logs only (request correlation ID).
- Estimate: 1 hour.

### 7) Medium - Upload endpoint lacks explicit size/type constraints
- Area: API Endpoint Security Review
- Evidence:
  - `app/api/ai/transcribe/route.ts:29-46` accepts file from form-data and forwards to model without explicit MIME allowlist/size caps.
- Root cause:
  - Missing explicit guardrails for file upload path.
- Impact:
  - Resource exhaustion risk and malformed content handling risk.
- Remediation:
  1. Enforce MIME allowlist.
  2. Add max file size and duration caps.
  3. Return clear `413/415` responses.
- Estimate: 2-3 hours.

### 8) Medium - In-memory rate limiter is not distributed and mostly scoped to AI routes
- Area: Backend Services / Scalability
- Evidence:
  - `lib/rate-limit.ts:8` uses in-process `Map` store.
  - Rate limiting imports concentrated in AI routes; many non-AI endpoints lack protection.
- Root cause:
  - Local memory limiter not externalized; uneven endpoint adoption.
- Impact:
  - Weak abuse protection under horizontal scaling/serverless fan-out.
- Remediation:
  1. Move to shared backend limiter (Redis/Upstash).
  2. Apply route classes (auth, webhook, heavy compute, admin).
- Estimate: 6-8 hours.

### 9) Medium - N+1 query pattern in admin subscriptions endpoint
- Area: Database Queries / Performance
- Evidence:
  - `app/api/admin/subscriptions/route.ts:54-74` issues 3 additional queries per subscription entry.
- Root cause:
  - Per-item aggregation inside map loop.
- Impact:
  - Query amplification and latency under larger result sets.
- Remediation:
  1. Pre-aggregate with grouped queries keyed by `userId`.
  2. Join/merge in memory once.
- Estimate: 3-5 hours.

### 10) Medium - Health endpoint exposes operational internals publicly
- Area: Error Handling & Monitoring
- Evidence:
  - `app/api/health/route.ts` returns memory usage and DB latency metadata without auth.
- Root cause:
  - Detailed diagnostics mixed into unauthenticated health response.
- Impact:
  - Information disclosure useful for recon and load profiling.
- Remediation:
  1. Provide minimal public liveness response.
  2. Move detailed diagnostics behind service auth or internal network.
- Estimate: 1-2 hours.

### 11) Low - Route file hygiene issue (import at end-of-file)
- Area: Backend Code Quality / Failure Points
- Evidence:
  - `app/api/email/thumbnail/[...slug]/route.ts:91` contains import declaration after executable code.
- Root cause:
  - Formatting/merge artifact.
- Impact:
  - Increased fragility and maintainability risk.
- Remediation:
  - Move imports to file top and add lint rule for import ordering.
- Estimate: <1 hour.

### 12) Low - Public debug endpoint in API root
- Area: API Surface Hardening
- Evidence:
  - `app/api/route.ts:6` returns static “Hello, world!”.
- Root cause:
  - Placeholder endpoint retained.
- Impact:
  - Unnecessary exposed surface (low risk).
- Remediation:
  - Remove route or convert to controlled health metadata endpoint.
- Estimate: <1 hour.

## Frontend Component Audit Summary
- `dangerouslySetInnerHTML` usage identified at:
  - `components/ui/chart.tsx:81` (style generation path)
  - `app/[locale]/dashboard/components/mindset/mindset-summary.tsx:124` (sanitized HTML rendering)
- Sanitizer implementation is regex-based (`lib/sanitize.ts`), which is weaker than parser-based sanitization.
- Error boundaries exist but leak raw messages (see Findings #6).
- Event/timer-heavy code paths exist; one concrete listener lifecycle concern in singleton storage service:
  - `lib/widget-storage-service.ts:44-45` adds anonymous listeners without removal lifecycle.

## Backend/API/Auth Summary
- Auth applied on many sensitive routes, but security controls are inconsistent:
  - Service auth improved in cron routes.
  - Auth-attempt guard ineffective (Finding #2).
  - Validation standard not consistently used (Finding #5).
- Raw SQL usage observed is mostly parameterized `prisma.$queryRaw` usage; no immediate `*Unsafe` production usage seen in app code paths.

## Database & Query Summary
- Prisma schema has broad indexing coverage on critical entities (`Trade`, `Account`, `Subscription`, etc.).
- Observed hot-path inefficiency: admin subscription N+1 query pattern (Finding #9).
- Backup/DR evidence is partially documented in docs, but not verifiable from runnable infra evidence in this environment.

## Performance & Scalability Summary
- Build/type/test/bundle budgets pass.
- Lint has very high warning volume (`1651`) with complexity and type-safety debt.
- Load testing executable exists (`scripts/loadtest/k6-smoke.js`) but `k6` binary is absent in this environment.
- Smoke runtime checks could not be validated due runtime constraints and local start command dependency issue.

## Pre-Launch Checklist Status (Requested 13 items)
1. Security Hardening (TLS headers/WAF/CSP enforce): **Partial/Fail**
2. Performance Benchmarks (<3s page, <500ms API): **Partial (insufficient runtime evidence)**
3. Cross-browser testing: **Not evidenced**
4. Mobile responsiveness: **Not evidenced**
5. Accessibility WCAG 2.1 AA: **Not evidenced**
6. SSL certificate chain/ciphers: **Not evidenced**
7. Domain/DNS/email config: **Not evidenced**
8. CDN implementation verification: **Partial**
9. DB backups + retention: **Not evidenced in runnable checks**
10. Monitoring/APM setup: **Partial**
11. Alerting (email/Slack/PagerDuty): **Partial**
12. Rollback strategy (DB/code): **Partial (docs/process evidence, no drill run)**
13. Production readiness smoke tests: **Fail in this environment**

## Go/No-Go Recommendation
- **Recommendation: NO-GO** for publication on **Monday, February 23, 2026** until at least all Critical + High findings are closed and re-verified.
- Minimum unblock set:
  1. Rotate/remove committed secrets and purge tracked env local files.
  2. Implement real auth-attempt guard/lockout.
  3. Enforce CSP in production and add missing security headers.
  4. Repair broken compliance workflow references.
  5. Add schema validation to highest-risk mutating API routes.

## Deliverables Mapping
- Comprehensive audit report: **This file**.
- Prioritized remediation plan with estimates: **See tracker file** `docs/audits/publication-remediation-tracker-2026-02-22.md`.
- Security assessment certificate / pentest report: **Not produced in this local code audit (external pentest required)**.
- Performance testing before/after metrics: **Partial (bundle/route budget available; load/cross-browser/mobile unavailable)**.
- Deployment runbook + launch procedures: **See** `docs/audits/deployment-runbook-2026-02-22.md`.
- Post-launch monitoring dashboard/escalation: **Included in runbook and remediation tracker action items**.
