# Route Redesign Todo (No-Gradient Unified Look)

## Scope
- Redesign requested routes to use one cohesive monochrome visual language aligned with the current site.
- Remove gradient-driven visuals from those routes and shared landing shell.

## Acceptance Criteria
- [ ] All requested routes share consistent page shell/header/surface treatment.
- [ ] Explicit gradient usage is removed from requested routes and landing shell.
- [ ] Dashboard route functionality remains intact (no behavior regressions).
- [ ] Verification command(s) run and results recorded.

## Plan Checklist
- [x] Audit requested routes and map each to source files.
- [ ] Implement shared no-gradient unified page components/utilities.
- [ ] Refactor requested routes to use unified shell styles.
- [ ] Run verification and record outcomes.

## Current Step
- **In Progress:** Implement shared no-gradient unified page components/utilities.

## Progress Notes
- 2026-02-25: Mapped all requested routes to concrete page files in `app/[locale]/dashboard/*`, `app/[locale]/(landing)/*`, and `app/[locale]/teams/(landing)/page.tsx`.
- 2026-02-25: Identified gradient sources: landing shell radial overlays and support-page Discord banner gradient block.

## Completion Notes
- Pending.

---

# Deployment Hotfix Todo (Lockfile Sync for `npm ci`)

## Scope
- Resolve deployment failure where Nixpacks `npm ci` exits with lockfile sync errors.
- Keep change scoped to dependency lockfile integrity and verification evidence.

## Acceptance Criteria
- [x] Lockfile is synchronized with current dependency graph.
- [x] Local `npm ci` completes successfully.
- [x] Results are recorded with concrete command evidence.

## Plan Checklist
- [x] Reproduce/analyze failure signal from deploy logs.
- [x] Regenerate lockfile metadata without changing declared dependencies.
- [x] Re-run `npm ci` to verify deploy parity.

## Current Step
- Completed.

## Progress Notes
- 2026-02-25: Confirmed deploy error signature: `npm ci` reported lockfile desync and missing entries for `@csstools/css-parser-algorithms` and `@csstools/css-tokenizer`.
- 2026-02-25: Ran `npm install --package-lock-only --ignore-scripts` to resynchronize `package-lock.json`.
- 2026-02-25: Verified with `npm ci` (including `postinstall` Prisma generation) and observed exit code `0`.

## Completion Notes
- Changed file: `package-lock.json` (lockfile metadata sync only).
- Verification evidence:
  - `npm install --package-lock-only --ignore-scripts` -> success.
  - `npm ci` -> success (`added 1468 packages`, `prisma generate` completed).
