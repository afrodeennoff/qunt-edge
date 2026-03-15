# Color Token Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox syntax for tracking.

**Goal:** Replace the remaining literal Tailwind `white/black/gray` utility classes in the dashboard import tutorial panels, propfirms landing filters, and FAQ surfaces with semantic design-system tokens so the UI stays theme-aware and easier to update.

**Architecture:** Each surface keeps its current layout and interactions; only the color utilities change. Video containers and cards use `bg-card`, `border-border`, and their dark variants so the neutral palette stays consistent. Landing controls and CTA text rely on `text-foreground`, `text-muted-foreground`, and `bg-card`/`bg-muted` tokens, preserving the induction gradient while allowing future palette tweaks via tokens instead of hard-coded colors.

**Tech Stack:** Next.js 14 app router, Tailwind CSS v4 semantic tokens, shadcn-ui components (`Button`, `Select`, `Card`), localized copy via `useI18n`.

---

### Task 1: Import tutorial video containers
**Files:**
- Modify `app/[locale]/dashboard/components/import/components/platform-tutorial.tsx`
- Modify `app/[locale]/dashboard/components/import/thor/thor-sync.tsx`
- Modify `app/[locale]/dashboard/components/import/etp/etp-sync.tsx`

- [ ] Step 1: Update each video wrapper (`aspect-video rounded-lg ...`) to `bg-card` (with `bg-muted/20` or other semantic fallback) instead of `bg-gray-100` and its dark counterpart; confirm `hover:scale` and animation classes remain.
- [ ] Step 2: Swap the explicit `border-gray-200`/`dark:border-gray-800` on the `<video>` containers for `border-border` (dark mode inherits via token) to keep outlines theme-aware.
- [ ] Step 3: Ensure the outer description container retains `text-muted-foreground` and `bg-muted/50` but remove any literal color utilities that remain.
- [ ] Step 4: Self-review to make sure no `gray`, `white`, or `black` utilities linger in these files.

### Task 2: Landing propfirms controls + chart copy
**Files:**
- Modify `app/[locale]/(landing)/propfirms/components/timeframe-controls.tsx`
- Modify `app/[locale]/(landing)/propfirms/components/sort-controls.tsx`
- Modify `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`

- [ ] Step 1: Replace the `SelectTrigger` background/border/text classes (`border-white/10 bg-black/40 text-white/90` etc.) with semantic tokens such as `border-border bg-card text-foreground` and keep `backdrop-blur-sm` and focus rings but point them at `ring-border`/`focus:ring-border`.
- [ ] Step 2: Update `SelectContent` to use `border-border bg-muted text-foreground` instead of literal black/white shades.
- [ ] Step 3: Replace the legend caption `text-white/60` in `AccountsBarChart` with `text-muted-foreground` so it respects the token palette.
- [ ] Step 4: Confirm no leftover `bg-black`/`text-white` classes remain in these files.

### Task 3: FAQ accordion surfaces
**Files:**
- Modify `app/[locale]/(landing)/faq/page.tsx`

- [ ] Step 1: Replace `border-white/10 bg-black/35` on the `AccordionItem` with `border-border bg-card/80` (or `bg-muted`/`bg-card`) so the panel uses tokens while preserving contrast.
- [ ] Step 2: Update the CTA link to use semantic tokens (e.g., `bg-foreground text-background` with `hover:bg-foreground/90` and `border-border`) instead of `bg-white text-black hover:bg-zinc-200`.
- [ ] Step 3: Keep the header text classes as `text-fg-primary`/`text-fg-muted` and ensure no new literal token classes appear.
- [ ] Step 4: Verify `AccordionContent` and `Trigger` still rely on semantic text tokens (they already do).

### Task 4: Verification
- [ ] Run `npx eslint app/[locale]/dashboard/components/import/components/platform-tutorial.tsx app/[locale]/dashboard/components/import/thor/thor-sync.tsx app/[locale]/dashboard/components/import/etp/etp-sync.tsx app/[locale]/(landing)/propfirms/components/timeframe-controls.tsx app/[locale]/(landing)/propfirms/components/sort-controls.tsx app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx app/[locale]/(landing)/faq/page.tsx` and confirm no new errors (warnings-only baseline).
- [ ] Summarize changed files and lint output in `tasks/todo.md` (per workflow requirements).
