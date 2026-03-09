# Publication Remediation Tracker - 2026-02-22

## Centralized Issue Tracker

| ID | Severity | Issue | Owner | Due Date | Status | Verification Steps |
|---|---|---|---|---|---|---|
| PUB-001 | Critical | Remove tracked `.env*.local` secrets and rotate compromised credentials | Security + DevOps | 2026-02-22 | Open | 1) `git ls-files '.env*'` excludes secret-bearing local env files 2) secret rotation log complete 3) smoke auth to DB/APIs passes with rotated keys |
| PUB-002 | Critical | Implement real auth-attempt lockout/telemetry in `lib/security/auth-attempts.ts` | Backend/Auth | 2026-02-22 | Open | 1) Add integration tests for lockout 2) failed attempts increment in DB 3) `Retry-After` behavior confirmed |
| PUB-003 | High | Enforce CSP in production + add missing hardening headers | Security Platform | 2026-02-22 | Open | 1) response headers include enforced CSP + HSTS + XCTO + Referrer-Policy 2) no major script breakages in smoke flows |
| PUB-004 | High | Repair broken widget compliance workflow script references | DevEx/Platform | 2026-02-22 | Open | 1) all referenced scripts exist 2) workflow passes on PR test branch |
| PUB-005 | High | Add request schema validation to all high-risk mutating API routes | Backend/API | 2026-02-23 | Open | 1) route-level validation coverage >90% for mutating routes 2) malformed request test cases return 400 |
| PUB-006 | High | Stop rendering raw `error.message` in user-facing boundaries | Frontend | 2026-02-22 | Open | 1) generic UI error text only 2) detailed error in logs with request IDs |
| PUB-007 | Medium | Add upload MIME/size limits on transcription and file ingestion routes | Backend/API | 2026-02-23 | Open | 1) oversized files rejected with 413 2) invalid MIME rejected with 415 |
| PUB-008 | Medium | Replace in-memory rate limiting with shared distributed limiter | Backend/Infra | 2026-02-24 | Open | 1) Redis-backed limiter in place 2) abuse test from multi-instance scenario throttles correctly |
| PUB-009 | Medium | Fix N+1 in admin subscriptions analytics endpoint | Backend/DB | 2026-02-24 | Open | 1) query count reduced under load 2) p95 latency improved in benchmark |
| PUB-010 | Medium | Reduce public diagnostics exposure from `/api/health` | Backend/SRE | 2026-02-22 | Open | 1) public endpoint returns minimal status only 2) detailed metrics moved behind internal auth |
| PUB-011 | Low | Normalize import ordering in thumbnail route | Backend/API | 2026-02-23 | Open | 1) import moved to file top 2) lint rule prevents recurrence |
| PUB-012 | Low | Remove/lock down placeholder `/api` hello endpoint | Backend/API | 2026-02-23 | Open | 1) endpoint removed or converted to controlled metadata |

## Priority Order for Next 24 Hours
1. PUB-001
2. PUB-002
3. PUB-003
4. PUB-004
5. PUB-005
6. PUB-006

## Daily Update Template
- Date:
- Issues closed today:
- Issues still blocked:
- New risks found:
- Verification evidence links:
- Updated launch confidence (%):
