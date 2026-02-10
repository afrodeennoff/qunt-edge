# Incident Runbook

## Scope

This runbook covers production incidents for:
- API availability and latency
- import pipeline failures
- webhook processing failures
- billing/payment regression signals

## Severity Levels

- `SEV-1`: critical outage or data corruption risk
- `SEV-2`: major feature degradation with customer impact
- `SEV-3`: partial degradation with workaround available

## Triage Checklist

1. Confirm symptom and blast radius.
2. Check `/api/health` status and database check latency.
3. Review structured logs for correlation/request IDs.
4. Validate latest deployment and recent config changes.
5. Identify safe rollback target if behavior changed after deploy.

## Import Failure Procedure

1. Inspect import route logs and validation errors.
2. Verify dedup/idempotency behavior on retry (no duplicate writes).
3. Retry with a minimal known-good sample.
4. If parser regression suspected, disable affected importer path and route to fallback/manual import.

## Webhook Failure Procedure

1. Validate signature verification path and secret freshness.
2. Check idempotency log entries for repeated event IDs.
3. Reprocess dead-letter/failed events in order.
4. Ensure no duplicate side effects (subscription/payment state).

## Rollback Guidance

1. Roll back application deployment to previous known-good release.
2. If migration-related issue:
   - execute documented down migration
   - switch reads to compatibility/bridge path if available
3. Re-run smoke checks:
   - health endpoint
   - import sample
   - billing webhook sample

## Post-Incident

1. Write incident summary with timeline and root cause.
2. Add regression tests for the failure mode.
3. Create follow-up tasks for prevention and observability improvements.

