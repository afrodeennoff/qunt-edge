# Publication Readiness Audit Todo

## Scope
- Conduct comprehensive end-to-end audit across frontend, backend, database, API security, authz/authn, logging, dependencies, infra, and performance.
- Collect evidence-backed findings with severity ratings, root cause, remediation steps, and launch recommendation.

## Acceptance Criteria
- [ ] Findings include severity, impacted area/files, root cause, remediation, and verification approach.
- [ ] Verification commands executed and results documented.
- [ ] Pre-launch checklist status mapped as pass/fail/partial with blockers.
- [ ] Final go/no-go recommendation delivered with rationale.

## Plan Checklist
- [x] Create task artifacts (`tasks/todo.md`, `tasks/lessons.md`)
- [ ] Collect baseline project signals (scripts, routes, security-related files)
- [ ] Run automated checks (typecheck, tests, lint/build where feasible)
- [ ] Run dependency vulnerability scan
- [ ] Run static security sweeps (auth bypass, injection sinks, secret exposure, CSP/header posture)
- [ ] Review frontend architecture risks (rerender/memory/error-boundary/input handling)
- [ ] Review backend/API/auth/database/infra risks
- [ ] Draft prioritized remediation plan with estimates
- [ ] Produce final report and go/no-go recommendation

## Current Step
- **In progress:** Collect baseline project signals (scripts, routes, security-related files)

## Progress Notes
- 2026-02-22: Initialized audit artifacts and started baseline repository inventory.

## Final Review / Results
- Pending
