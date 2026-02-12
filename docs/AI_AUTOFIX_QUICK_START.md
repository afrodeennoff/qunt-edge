# AI Auto-Fix: Quick Start Guide

Welcome to the autonomous maintenance suite for Qunt Edge. This guide shows you how to use the AI Auto-Fix system to keep your development velocity high and your codebase clean.

## Prerequisites
- **AI Agent Access**: Ensure your AI assistant has access to the `.agent/workflows/` directory.
- **Git State**: It is recommended to run autofix on a clean branch.

## Usage Scenarios

### 1. The "I just want it clean" Fix
If you have a bunch of lint warnings and small type errors after a refactor:
> **Command**: "Assistant, run /autofix to clean up the current branch."

### 2. Fixing a Specific Build Failure
If `npm run build` is failing due to a "missing prop" or "type mismatch":
> **Command**: "Assistant, use the /autofix workflow to resolve the build errors in [component-name]."

### 3. Periodic Maintenance (Monthly/Weekly)
To ensure no unused components or debt is accumulating:
> **Command**: "Assistant, audit the codebase using /autofix and report any architectural drift."

## What to Expect
1. **The Diagnostic Loop**: The AI will run `typecheck` and `lint` to map the current "error surface."
2. **Targeted Edits**: The AI will modify files one-by-one, following the rules in `public/AGENTS.md`.
3. **Double Verification**: Every fix is verified by a follow-up build attempt.
4. **Summary Report**: You will receive a list of files changed and the rationale behind each change.

## Important Note on Aesthetics
The Auto-Fix system is "Aesthetic Aware." If it detects a component using standard colors (e.g., `bg-white`) instead of the project-standard (e.g., `bg-card` or `bg-[#050505]`), it will attempt to correct the styling to match the **Matte Cyberpunk** theme.
