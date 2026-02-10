# Production Readiness Checklist

## Build and Quality Gates

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` has 0 errors
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Prisma schema validates (`npx prisma validate`)

## Data and Migrations

- [ ] Migration reviewed for reversibility
- [ ] Backfill plan documented (if schema changes require it)
- [ ] Rollback command documented
- [ ] Index impact reviewed for high-traffic queries

## Security and Privacy

- [ ] Secrets present in environment and rotated as required
- [ ] AuthZ checks validated on critical endpoints
- [ ] Import/webhook input validation paths tested
- [ ] Audit/security scan reviewed (`npm audit`)

## Reliability and Observability

- [ ] `/api/health` returns healthy in production
- [ ] Structured logs include request/correlation context
- [ ] Alert hooks configured for import and webhook failures
- [ ] Incident runbook is up to date

## Functional Smoke Checks

- [ ] Import sample file succeeds and is idempotent on retry
- [ ] Dashboard metrics load and match expected values
- [ ] Team analytics page loads without contract errors
- [ ] Billing webhook test event processes successfully

