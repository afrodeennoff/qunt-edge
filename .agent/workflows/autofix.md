---
description: "Automatically identify and fix common codebase issues (linting, type errors, build failures)"
---

# AI Auto-Fix Workflow

This workflow is designed to systematically resolve common technical issues in the Qunt Edge codebase while maintaining high standards for code quality and aesthetic consistency.

## 1. Diagnostics Phase

// turbo
1. Run target diagnostics to identify issues:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

2. Categorize errors:
   - **Type Mismatch**: Look for recent changes in `lib/data-types.ts` or `prisma/schema.prisma`.
   - **Lint Violation**: Focus on `no-explicit-any` and `no-unused-vars`.
   - **Build Failure**: Check for missing props in shared components (e.g., `Card`, `ActionCard`).

## 2. Fixing Phase

3. Apply targeted fixes:
   - For **Prop Mismatches**: Sync the component definition with its registry usage.
   - For **Aesthetic Regressions**: Ensure `variant="matte"` is used in UI cards.
   - For **Data Types**: Use `decimalToNumber` or centralized normalization from `lib/data-types.ts`.

// turbo
4. Run automatic lint fixer:
   ```bash
   npm run lint -- --fix
   ```

## 3. Validation Phase

// turbo
5. Confirm the fix resolved the issue:
   ```bash
   npm run typecheck
   npm run build
   ```

6. Perform a manual (visual) check of impacted dashboard widgets if applicable.

## 4. Documentation Phase

7. Update `docs/CHANGE_CATALOG_MANUAL.md` with:
   - `Commit`: [hash]
   - `Why`: [The specific error/warning fixed]
   - `How Fixed`: [Brief technical explanation]
   - `Key File IDs`: [List of files]
