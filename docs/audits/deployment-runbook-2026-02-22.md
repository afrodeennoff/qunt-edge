# Deployment Runbook - Publication Window 2026-02-23

## Launch Criteria
- All Critical and High issues in `docs/audits/publication-remediation-tracker-2026-02-22.md` are closed and verified.
- Build, typecheck, test, and smoke checks pass on release commit.
- Security headers and CSP enforcement validated in production response headers.

## Pre-Deploy Steps
1. Freeze deploy branch and tag release candidate.
2. Confirm rotated secrets are present in deployment platform (not in repo).
3. Run checks:
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
   - `npm run check:route-budgets`
   - `npm run analyze:bundle`
4. Validate CI workflows are green on release commit.

## Deployment Steps
1. Deploy release candidate to preview.
2. Execute smoke tests against preview URL:
   - `/api/health`
   - `/en`
   - `/api`
3. Validate critical user flows manually:
   - registration/login
   - dashboard navigation
   - core data submission/import
   - billing/checkout redirect path
4. Verify production headers with `curl -I` on key routes.

## Rollback Procedure
1. Trigger platform rollback to last known-good deployment.
2. If DB migrations were applied, execute tested down migration or restore from backup snapshot.
3. Validate app liveness and key auth flows after rollback.
4. Open incident record with timeline and root cause owner.

## Post-Launch Monitoring (First 24 Hours)
- SLO watch windows:
  - API error rate
  - p95 latency
  - auth failures
  - payment/webhook failures
- Alert channels:
  - PagerDuty/Slack/email (critical only)
- Escalation chain:
  1. On-call engineer
  2. Backend lead
  3. Security lead
  4. Product owner for go/no-go communication

## Escalation Triggers
- Any Critical security regression
- >2% 5xx sustained for 5 minutes
- Authentication outage >2 minutes
- Payment/webhook processing failure >5 minutes

## Final Go/No-Go Checkpoint
- Deadline: **2026-02-22 24:00 local** (24 hours pre-publication target).
- Required sign-off: Engineering lead + Security owner + Product owner.
