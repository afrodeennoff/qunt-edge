# Authentication Security Audit Report
**Date:** 2026-02-21  
**Repository:** `/Users/timon/Downloads/final-qunt-edge-main`  
**Auditor:** Codex (static code and configuration review)

## Executive Summary
The authentication system has a strong foundation (Supabase-managed sessions, secure cookie hardening, internal redirect normalization, and hashed API tokens for ETP/THOR), but it contains several high-impact gaps. The most critical issues are in OAuth/token handling for Tradovate and missing online attack controls (no brute-force throttling and no account lockout policy). MFA is not implemented, creating a major compliance and risk gap for account takeover resistance.

Overall posture: **Moderate to High Risk** until high-severity findings are remediated.

## Scope
Audit covered:
- Login flows (magic link, password, OAuth providers)
- Session management and auth middleware
- Password policy handling
- MFA controls
- OAuth integration security
- API authentication for service and token-based endpoints
- Brute-force/lockout protections
- Token expiration and credential storage

Primary files reviewed:
- `/Users/timon/Downloads/final-qunt-edge-main/server/auth.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/proxy.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/app/api/auth/callback/route.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/(authentication)/components/user-auth-form.tsx`
- `/Users/timon/Downloads/final-qunt-edge-main/server/authz.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/lib/api-auth.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/lib/rate-limit.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/prisma/schema.prisma`
- `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/tradovate/actions.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/app/api/cron/compute-trade-data/route.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/app/api/etp/v1/store/route.ts`
- `/Users/timon/Downloads/final-qunt-edge-main/app/api/thor/store/route.ts`

## Methodology
- Static review of authentication and authorization code paths.
- Control validation against common requirements (OWASP ASVS/NIST-aligned patterns).
- Targeted verification of:
  - Brute-force protections
  - Account lockout mechanisms
  - Token expiration logic
  - Secure credential/token storage behavior

## Authentication Architecture (Observed)
- **Primary identity provider:** Supabase Auth (`email OTP`, `password`, `Google OAuth`, `Discord OAuth`).
- **Session path:** Edge middleware (`proxy.ts`) refresh/check with secure cookie settings.
- **App-level user identity mapping:** `auth_user_id` to internal user records in `prisma.user`.
- **Service authentication:** `requireServiceAuth()` with timing-safe comparison in `server/authz.ts`.
- **API token auth:** SHA-256 hashed bearer tokens for ETP/THOR (`lib/api-auth.ts`) with expirations.
- **Additional OAuth integration:** Tradovate custom OAuth and token persistence in Synchronization table.

## Test Results (Requested Control Checks)
### 1) Brute-force protection
- **Result:** **Fail**
- **Evidence:** Password and OTP login server actions in `/Users/timon/Downloads/final-qunt-edge-main/server/auth.ts` and form submit paths in `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/(authentication)/components/user-auth-form.tsx` do not apply `rateLimit()` from `/Users/timon/Downloads/final-qunt-edge-main/lib/rate-limit.ts`.
- **Risk:** Credential stuffing and password spraying are not constrained at application layer.

### 2) Account lockout
- **Result:** **Fail**
- **Evidence:** No failed-attempt counters, lockout timestamps, or lock policy fields/logic found in auth flow or schema.
- **Risk:** Unlimited online guesses when upstream provider controls are insufficient/misconfigured.

### 3) Token expiration
- **Result:** **Partial Pass**
- **Strengths:** ETP/THOR token expiry enforced (`TOKEN_EXPIRY_MS`, `verifySecureToken()` expiry check) in `/Users/timon/Downloads/final-qunt-edge-main/lib/api-auth.ts`.
- **Gaps:** Tradovate tokens are validated for expiry but returned in clear form from server actions and stored unencrypted in DB (`Synchronization.token`).

### 4) Secure credential/token storage
- **Result:** **Partial Pass**
- **Strengths:** ETP/THOR tokens stored hashed (`etpTokenHash`, `thorTokenHash`).
- **Gaps:** Tradovate access tokens are stored plaintext in `/Users/timon/Downloads/final-qunt-edge-main/prisma/schema.prisma` (`Synchronization.token`) and extensively logged/returned by server actions.

## Findings and Remediation
### F-01: Missing auth rate limiting and lockout controls
- **Severity:** High
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/server/auth.ts`, `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/(authentication)/components/user-auth-form.tsx`
- **Issue:** No app-layer throttle/lockout for password/OTP attempts.
- **Remediation:**
  1. Apply route-level + account-level limits (IP + email keying) on login/OTP endpoints.
  2. Add progressive delays and temporary lockouts after N failures (for example 5/15m).
  3. Store attempt metadata server-side (Redis/DB) rather than in-memory map.
  4. Add alerting for anomalous auth failure spikes.

### F-02: No MFA support for privileged or high-risk accounts
- **Severity:** High
- **Affected:** Auth system-wide (no MFA/TOTP/WebAuthn implementation)
- **Issue:** No second factor requirement, including admin-sensitive paths.
- **Remediation:**
  1. Enable MFA in Supabase and enforce for admin users first.
  2. Add step-up authentication for sensitive actions (billing changes, token generation, linked account changes).
  3. Add backup codes and recovery flow controls.

### F-03: Tradovate OAuth `state` generated but not validated
- **Severity:** High
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/tradovate/actions.ts` (init/callback)
- **Issue:** `state` is generated and returned, but no server-side persistence and validation in callback.
- **Remediation:**
  1. Persist `state` server-side (short TTL, one-time use, user/session-bound).
  2. Validate exact match in callback before code exchange.
  3. Reject missing/mismatched/replayed state.

### F-04: Sensitive token leakage via logs and response payloads
- **Severity:** Critical
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/import/tradovate/actions.ts`
- **Issue:** Logging full token responses and returning access/refresh tokens increases exfiltration risk.
- **Remediation:**
  1. Remove token-bearing logs immediately (`fullResponse`, token fields, verbose debug paths).
  2. Return opaque success state to client; avoid returning refresh/access tokens unless strictly required.
  3. Introduce centralized secret redaction at logger transport level.

### F-05: Tradovate tokens stored plaintext at rest
- **Severity:** High
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/prisma/schema.prisma` (`Synchronization.token`) and related actions
- **Issue:** Access tokens in plaintext increase blast radius on DB read exposure.
- **Remediation:**
  1. Encrypt tokens at application layer (AEAD with key rotation; KMS-backed key where possible).
  2. Limit token retrieval functions to server-only workflows.
  3. Add migration to re-encrypt existing records.

### F-06: Inconsistent service-auth implementations
- **Severity:** Medium
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/app/api/cron/compute-trade-data/route.ts`
- **Issue:** Uses direct header equality instead of centralized timing-safe helper.
- **Remediation:**
  1. Replace custom auth comparison with `requireServiceAuth()` from `/Users/timon/Downloads/final-qunt-edge-main/server/authz.ts`.
  2. Standardize all cron/internal routes on one auth utility.
  3. Add unit tests to prevent reintroduction.

### F-07: Authentication flow auto-signs-up on failed password sign-in
- **Severity:** Medium
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/server/auth.ts` (`signInWithPasswordAction`)
- **Issue:** Login endpoint conditionally becomes signup flow, complicating abuse controls and user-consent boundaries.
- **Remediation:**
  1. Separate login and registration explicitly.
  2. Preserve generic failure responses on login.
  3. Require explicit user intent for account creation.

### F-08: User enumeration through differentiated auth errors
- **Severity:** Medium
- **Affected:** `/Users/timon/Downloads/final-qunt-edge-main/server/auth.ts`, `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/(authentication)/components/user-auth-form.tsx`
- **Issue:** Different responses reveal account states (exists/no password/not confirmed).
- **Remediation:**
  1. Return consistent external messaging for auth failures.
  2. Keep detailed reason codes internal-only (logs/telemetry).
  3. Couple with rate limiting to reduce enumeration speed.

## Risk Assessment Matrix
| ID | Finding | Likelihood | Impact | Severity |
|---|---|---:|---:|---|
| F-04 | Token leakage via logs/responses | High | Critical | Critical |
| F-01 | No brute-force / lockout controls | High | High | High |
| F-02 | MFA missing | Medium-High | High | High |
| F-03 | OAuth state not validated | Medium | High | High |
| F-05 | Plaintext token storage (Tradovate) | Medium | High | High |
| F-06 | Inconsistent service auth checks | Medium | Medium | Medium |
| F-07 | Login auto-signup behavior | Medium | Medium | Medium |
| F-08 | Account enumeration via errors | Medium | Medium | Medium |

## Prioritized Action Plan and Timeline
### Immediate (0-3 days)
1. Remove sensitive token logs and sanitize logger outputs (F-04).
2. Stop returning refresh/access tokens to client where avoidable (F-04).
3. Enforce centralized `requireServiceAuth()` on all cron/internal routes (F-06).

### Short Term (3-14 days)
1. Implement login and OTP rate limiting + progressive lockout (F-01).
2. Implement Tradovate OAuth `state` persistence/validation (F-03).
3. Normalize auth error responses to remove enumeration signals (F-08).

### Medium Term (2-6 weeks)
1. Add MFA (at least admin-first mandatory rollout, then broader optional/required policy) (F-02).
2. Encrypt Tradovate tokens at rest and migrate existing token records (F-05).
3. Split login and signup into explicit independent flows (F-07).

### Longer Term (6-10 weeks)
1. Add security regression test suite for auth controls (rate-limit/lockout/state validation).
2. Add periodic auth control verification and incident runbooks.
3. Add centralized compliance control mapping (ASVS/NIST/SOC2 evidence trail).

## Positive Controls Observed
- Secure cookie hardening in middleware (`secure`, `httpOnly`, `sameSite`) in `/Users/timon/Downloads/final-qunt-edge-main/proxy.ts`.
- Internal redirect normalization and open redirect mitigation in `/Users/timon/Downloads/final-qunt-edge-main/app/api/auth/callback/route.ts`.
- Timing-safe service secret compare in `/Users/timon/Downloads/final-qunt-edge-main/server/authz.ts`.
- Hashed ETP/THOR API token design with expiration checks in `/Users/timon/Downloads/final-qunt-edge-main/lib/api-auth.ts`.

## Recommendations to Improve Overall Authentication Security Posture
1. Establish a formal authentication policy baseline: MFA policy, lockout thresholds, password standards, and token lifecycle.
2. Move all auth-sensitive checks into centralized, reusable guards and reject custom one-off implementations.
3. Adopt secure secrets handling standards for logs and telemetry (default redact).
4. Introduce continuous auth security tests in CI: brute-force simulation, lockout, token expiry, OAuth state replay.
5. Add quarterly access-control and auth hardening reviews with evidence artifacts.

## Assumptions and Limitations
- This audit is based on repository code/config review and targeted control checks; it does not include external penetration testing, Supabase tenant policy inspection, or live infrastructure traffic captures.
- Upstream provider controls (Supabase built-in anti-abuse settings) may add protection not visible in code and should be validated separately in environment configuration.
