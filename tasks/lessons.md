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
