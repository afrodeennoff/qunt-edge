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
