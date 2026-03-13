# Full-App Redesign & Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize all pages/routes, standardize widget styling, unify the color palette, and automate SEO meta-tag generation project-wide.

**Architecture:**
1.  **Color System**: Replace all hardcoded hex values with semantic tokens.
2.  **SEO System**: Implement central `MetadataGenerator` utility and enforce semantic heading structure.
3.  **UI/Widget System**: Standardize `WidgetSurface` usage and unified typography/spacing/glassmorphism effects.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Prisma, shadcn/ui.

---

## Chunk 1: Infrastructure, Tokens & SEO Utility

- [ ] **Step 1: Create central SEO Metadata Generator**
  Create `lib/metadata.ts` to standardize title/description/OG tags generation.
- [ ] **Step 2: Initialize Color Cleanup Script**
  Verify `scripts/check-color-contract.mjs` is configured to detect *all* remaining hardcoded colors.
- [ ] **Step 3: Define Layout Typography Utility**
  Ensure typography tokens are consistently applied at the layout level (`app/layout.tsx`).

## Chunk 2: Parallel Implementation Swarm

- [ ] **Step 4: Execute Color Refactor (Lane 1)**
  Agent refactor high-priority targets (`user-growth-chart.tsx`, `newsletter-audio-player.tsx`, etc.).
- [ ] **Step 5: Execute UI/Typography Modernization (Lane 2)**
  Agent refactor widget shells, card surfaces, and button styles for glassmorphism/spacing.
- [ ] **Step 6: Execute SEO Implementation (Lane 3)**
  Agent apply `MetadataGenerator` across all `app/[locale]/**/page.tsx` routes.

## Chunk 3: Final Verification

- [ ] **Step 7: Global Lint & Token Audit**
  Run `npm run lint` and `scripts/check-color-contract.mjs`.
- [ ] **Step 8: Build Verification**
  Run `npm run build` and `npm run check:route-budgets`.
- [ ] **Step 9: Automated Test Suite**
  Run all vitest tests (`npm run test`).
