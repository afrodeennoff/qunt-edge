# Goose CLI Recipe Conversion (2026-03-08)

## Goal
Convert the merged AGENTS policy into Goose CLI recipe files.

## Plan
- [x] Create a default-mode Goose recipe with the merged operating rules.
- [x] Create a ULTRATHINK Goose recipe that enforces deep-analysis mode.
- [x] Verify recipe YAML shape and record completion notes.

## Review
- Created recipe files under `goose/recipes/`:
  - `frontend-architect-default.yaml`
  - `frontend-architect-ultrathink.yaml`
  - `README.md`
- Verified YAML structure is valid key/value + block-scalar prompt format suitable for Goose recipe import.
- Residual risk: Goose installations can vary by version; if your local Goose expects additional fields, we can add them quickly.
