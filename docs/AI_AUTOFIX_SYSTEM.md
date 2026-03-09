# AI Auto-Fix System: Architecture & Design

## Overview
The AI Auto-Fix System is a semi-autonomous diagnostic and remediation framework designed for the Qunt Edge project. It leverages Agentic Workflows to maintain codebase health, prevent "technical debt creep," and ensure architectural consistency across localized routes and complex dashboard surfaces.

## Core Pillars

### 1. Automated Diagnostics
The system utilizes a "Validation First" approach. Before any feature is considered "Done," it must pass a battery of checks:
- **Strict TypeScript**: No implicit `any` and mandatory interface compliance for all UI components.
- **Aesthetic Integrity**: Automatic verification that UI components (Cards, Buttons, Sidebars) adhere to the "Matte Cyberpunk" (Obsidian/Cobalt) palette.
- **Data Normalization**: Ensuring financial calculations are processed through the centralized `lib/data-types.ts` layer.

### 2. Intelligent Remediation
Using the `/autofix` workflow, AI agents can:
- Resolve type regressions caused by Prisma schema updates.
- Standardize prop usage across 40+ dashboard components.
- Bulk-fix linting violations that don't require semantic changes.

### 3. Change Transparency
Every fix is logged in the `docs/CHANGE_CATALOG_MANUAL.md`. This provides a human-readable trail of "Why" and "How" for every technical patch, which is essential for auditing financial software.

## Safety Boundaries
- **Financial Math**: The system will NEVER automatically modify calculation logic in `lib/metrics/` or `server/database.ts` without human oversight if the change involves rounding or currency conversion.
- **Security Paths**: Auth and permission checks are audited manually; the Auto-Fix system only ensures type compliance in these areas.

## Deployment Status
- [x] Master Workflow (`.agent/workflows/autofix.md`)
- [x] Manual Indexing (`docs/PROJECT_MANUAL_INDEX.md` integration)
- [x] Built-in Validation Gates (CI/CD alignment)
