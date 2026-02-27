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

## 2026-02-26
- mistake pattern: Focused first on individual page headers while leaving broader widget visual inconsistency unresolved.
- prevention rule: For "overall design quality" feedback, prioritize shared primitives and global style contracts before touching individual feature pages.
- early trigger signals: User language points to global dissatisfaction ("all widgets", "looks bad") rather than one broken route.
- mistake pattern: Replaced a route implementation without preserving the dashboard shell, which removed navbar/navigation context.
- prevention rule: When swapping page implementations, keep route-level layout wrappers (e.g., `UnifiedPageShell`) unless explicitly changing navigation architecture.
- early trigger signals: New page file becomes a direct re-export of a client component and loses existing shell imports.

## 2026-02-26
- mistake pattern: Removed functional quick-navigation controls while removing duplicate visual headers.
- prevention rule: Distinguish between decorative headers and functional navigation actions; remove only decorative duplicates.
- early trigger signals: User reports "navbar removed" after a header cleanup pass.

## 2026-02-26
- mistake pattern: Assumed the user-reported UI regression was tied to the most recent backend fix before immediately validating the currently rendered dashboard layout wiring.
- prevention rule: For UI-regression reports, first verify active branch + target layout/component wiring + running process state before attributing cause to recent API or backend changes.
- early trigger signals: User reports a visible UI element missing (navbar/sidebar/header), working tree is clean, and recent commits include unrelated backend work.
- mistake pattern: Removed visible dashboard navigation (navbar) while refactoring route wiring for `/dashboard/behavior`.
- prevention rule: Before finalizing any route swap/refactor, verify shell invariants: navbar visible, sidebar visible, and route mounted inside the expected layout wrapper.
- early trigger signals: User reports "navbar missing" immediately after a page-level refactor; diff shows shell wrapper removal or direct component re-export.
- mistake pattern: Removed established dashboard navbar/header while chasing performance budget improvements.
- prevention rule: Treat navigation shell as non-negotiable product contract; optimize around it (lazy-load internals, split non-critical modules) instead of removing shared navigation components.
- early trigger signals: Any performance change proposal touches `app/[locale]/dashboard/layout.tsx` and removes `DashboardHeader`/`DashboardProvider` or equivalent shell components.

## 2026-02-26
- mistake pattern: Treated quick action controls as visual header duplication and removed them.
- prevention rule: During header deduplication, preserve all functional CTAs/navigation rows and only remove purely informational duplicates.
- early trigger signals: Cleanup diff removes `Link`/`Button` action rows from dashboard pages while user request mentions headers only.
