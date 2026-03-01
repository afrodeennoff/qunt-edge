# Lessons Log

## 2026-02-22
- Session started. No user corrections yet.

## 2026-02-25
- mistake pattern: Started with analysis/suggestion framing when the user had shifted intent to full implementation.
- prevention rule: When user says "fix everything" or requests implementation, immediately execute end-to-end changes and keep recommendations secondary.
- early trigger signals: User messages escalate from "suggestions" to "fix everything at one"/"please implement this plan".

## 2026-02-26
- mistake pattern: Missed duplicate header composition on some redesigned pages after fixing others.
- prevention rule: After UI unification requests, run a route-by-route structural checklist to verify exactly one primary page header on every targeted route.
- early trigger signals: User reports "same issue" with a screenshot showing stacked heading cards.
- mistake pattern: Left a secondary action card ("Next Step") above a page-level management module that already includes its own heading block, creating perceived double headers.
- prevention rule: When a page composes reusable modules, treat module-level hero headers as the single source and remove extra preface cards unless they are merged into the module.
- early trigger signals: User asks "why 2 header" even after removing an obvious top hero.

## 2026-02-27
- mistake pattern: Fixed a user-reported visual gap on one route first, while equivalent width-cap regressions still existed in sibling routes.
- prevention rule: For layout-gap reports, audit all top-level route shells and shared wrapper defaults before closing the task.
- early trigger signals: User asks for "all pages" or shares screenshots with the same side-gap pattern after an initial single-page fix.

## 2026-02-27
- mistake pattern: Claimed non-dashboard spacing standardization complete while a key route (`/en/propfirms`) still used a full-width outer container.
- prevention rule: After spacing rollouts, run a route-by-route verification checklist for all user-named pages before declaring completion.
- early trigger signals: User asks to recheck a specific page after a broad "done" claim and that page has custom wrapper markup outside shared shells.

## 2026-02-27
- mistake pattern: Optimized and fixed multiple concerns in one pass (layout, PR conflicts, CI, budgets), which increased risk of scope drift and status confusion.
- prevention rule: Split multi-concern threads into explicit phases (UI scope fix -> PR conflict cleanup -> CI unblock -> perf follow-up), and report each phase completion with concrete command evidence.
- early trigger signals: User asks for "entire app" + "non-dashboard only" + "zero error" in the same thread while PR status and CI checks are changing.

## 2026-02-27
- mistake pattern: Interpreted "zero error" as only merge conflicts first, while CI/runtime checks also needed explicit reconciliation.
- prevention rule: For "zero error" requests on PRs, treat success as three-part gate: mergeability (no conflicts), required checks green or explained, and local verification summary.
- early trigger signals: GitHub shows conflict banner plus failing/canceled checks simultaneously.

## 2026-02-28
- mistake pattern: Changed opacity work in a way that also impacted perceived spacing/gap hierarchy and caused visual regressions outside the requested contrast-only scope.
- prevention rule: For color/opacity-only requests, explicitly freeze geometry classes (`gap-*`, `p-*`, `m-*`, `h-*`, `w-*`, grid spans) and run a final diff scan to ensure only color/border/text/background token classes changed.
- early trigger signals: User calls out "gaps" or layout break right after a color-only change request.

## 2026-03-01
- mistake pattern: Drifted from the user’s explicitly approved compact RR style by reintroducing the shared `precision-panel` pattern after they had asked for a single centered row.
- prevention rule: When the user confirms a specific visual spec ("this exact version"), treat it as locked and only apply edits that preserve that exact structure until they request a change.
- early trigger signals: User repeats "same as before/exactly this" and references concrete class-level outcomes (size, centering, single-row/no card).
