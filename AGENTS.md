# 🤖 AI Agent Engineering Log

This file tracks significant architectural changes, engineering insights, and critical fixes to provide context for future AI agents working on this codebase.

## 🛡️ Core Infrastructure & Security
- **2026-02-14: Prisma TLS Hardening.** 
  - Added explicit SSL controls (`PGSSL_ENABLE`, `PGSSL_REJECT_UNAUTHORIZED`) in `lib/prisma.ts`.
  - **Context:** Prevents "self-signed certificate in certificate chain" errors common when connecting to managed DB pools (e.g., Supabase/Neon) from serverless environments.
- **2026-02-13: Supabase Storage Scaling.**
  - Updated configuration to support production-level asset management and scaling.
- **2026-02-13: GLM AI Client.**
  - Implemented environment-driven AI client selection for GLM integration.

## 🎨 UI/UX & Design System
- **2026-02-14: Dashboard Navigation Recovery.**
  - Restored legacy `Navbar` in `app/[locale]/dashboard/layout.tsx`.
  - **Insight:** The modern sidebar refactor accidentally hid `Edit Layout` and `Lock Grid` controls; reverting to the legacy navbar ensures these tools remain accessible for layout management.
- **2026-02-12: Monochrome & Glassmorphism Overhaul.**
  - Shifted away from standard Tailwind colors (emerald/rose for everything) to a premium monochrome aesthetic.
  - **Standard:** Use `white/5`, `white/10`, `white/20` for surfaces. Text uses `white/90` (primary) and `white/50` (secondary).
  - See `MONOCHROME_UPDATE_NOTES.md` for full design tokens.
- **2026-02-13: Home Page V2.**
  - Full landing page redesign using `shadcn` components for better pricing clarity and conversion hierarchy.

## 🚀 Recent Feature Updates
- **2026-02-13: Dashboard Empty-State Guard.**
  - Updated `app/[locale]/dashboard/page.tsx` to default to the `table` tab when no widgets exist in saved layout state.
  - **Context:** The dashboard route defaults to `widgets`; users with empty widget layouts could see a blank workspace and interpret it as missing data.
- **2026-02-14: Dashboard Editor Polish.**
  - Added back missing "Restore Defaults" and "Remove All" buttons in the widget editor navigation (`6ee3386`).
- **2026-02-13: PnL Visual Logic.**
  - Updated trade table PnL styling: Positive values now render in emerald for visual emphasis, while negative values maintain the muted monochrome style.

## 🛠️ Build & Type Safety
- **2026-02-14: Codebase Cleanup and Quality Pass.**
  - Removed 8+ redundant root files (`COMBINED_DOCUMENTATION.md`, `IMPORT_FIX_SUMMARY.md`, etc.).
  - Organized documentation by moving essential guides to `/docs`.
  - Deleted unused UI component `context-menu.tsx`.
  - Fixed 1300+ lint warnings primarily related to unused variables in Zustand stores.
  - Enhanced type safety in `trades-store.ts` and test files by reducing `any` usage.
- **2026-02-13: Vercel Build Fix.** 
  - Resolved i18n tooltip typing issues in commissions charts that were causing production build failures.
- **2026-02-13: Mobile Responsiveness.**
  - Optimized navbar triggers and filter groups for mobile screens to prevent layout overflow in `app/[locale]/dashboard/components/navbar.tsx`.

## 📌 Maintenance Notes for Agents
- **i18n:** Always use the `t` function with proper casting (e.g., `t as any`) in widget components to avoid complex translation object type errors until the schema is fully unified.
- **Tailwind:** This project uses Tailwind CSS v4 features. If you see `@config` or `@plugin` errors in the IDE, they are likely false positives from an older linter.
- **Zustand stores:** When creating or updating stores, avoid unused parameters (like `get` in the create callback) and use `unknown` or specific types instead of `any` for persisted state migrations.
