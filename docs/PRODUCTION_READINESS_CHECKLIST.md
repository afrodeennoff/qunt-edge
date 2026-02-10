# Production Readiness Checklist

## Build and Quality Gates

- [x] `npm run typecheck` passes
- [x] `npm run lint` has 0 errors
- [x] `npm run test` passes
- [x] `npm run build` passes
- [x] Prisma schema validates (`npx prisma validate`)

## Data and Migrations

- [ ] Migration reviewed for reversibility
- [ ] Backfill plan documented (if schema changes require it)
- [ ] Rollback command documented
- [ ] Index impact reviewed for high-traffic queries

## Security and Privacy

- [x] Secrets present in environment and rotated as required
- [ ] AuthZ checks validated on critical endpoints
- [ ] Import/webhook input validation paths tested
- [x] Audit/security scan reviewed (`npm audit`)

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
