# 🤖 AI Agent Engineering Log

This file tracks significant architectural changes, engineering insights, and critical fixes to provide context for future AI agents working on this codebase.

## � Entry Structure for Future Agents
When documenting feature updates, **YOU MUST** follow this conversational structure to ensure context is preserved:

- **What changed:** A clear, high-level summary of the update (e.g., "Added a new specific widget").
- **What I want:** The user-centric goal or desired behavior. Why are we doing this? (e.g., "Users should see risk metrics immediately").
- **What I don't want:** The problem, regression, or anti-pattern we are avoiding. This is critical for preventing future regressions (e.g., "I don't want a full page reload").
- **How we fixed that:** The technical implementation details, architectural decisions, and specific libraries used.
- **Key Files:** The most critical files modified or created during this task.
- **Verification:** Specific manual steps or observations to confirm the change (e.g., "Go to dashboard -> Click Edit -> See Widget").

---

## �🛡️ Core Infrastructure & Security
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

### 2026-02-14: Home Page Typography Rewrite
- **What changed:** Refined the Home page visual hierarchy and rewrote typography across Hero + deferred sections to use a single editorial type system.
- **What I want:** The home experience should feel premium and intentional, with clear contrast between display headlines, data labels, and body copy.
- **What I don't want:** Mixed typography patterns (inconsistent heading scales, mismatched label styles, and undefined font variables) that make the page feel stitched together.
- **How we fixed that:**
  - Introduced scoped typography variables at the home-page wrapper level (`--home-display`, `--home-copy`, `--home-mono`) in `HomeContent`.
  - Updated Hero, Analysis Demo, Why Choose Us, Comparison, AI Futures, Pricing, and CTA sections to share:
    - tighter display heading tracking/leading,
    - mono uppercase kicker/label styling,
    - consistent body copy sizing and rhythm,
    - unified CTA/button label letterspacing.
  - Removed direct `font-poppins` usage from active Home page sections in favor of the scoped home typography variables.
- **Key Files:** `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(home)/components/Hero.tsx`, `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/(home)/components/WhyChooseUs.tsx`, `app/[locale]/(home)/components/ComparisonSection.tsx`, `app/[locale]/(home)/components/AIFuturesSection.tsx`, `app/[locale]/(home)/components/PricingSection.tsx`, `app/[locale]/(home)/components/CTA.tsx`, `AGENTS.md`
- **Verification:** Open `/` (home) -> confirm section titles share the same display style, labels are consistently mono uppercase, body copy has uniform rhythm, and CTA labels match the new typographic system.

### 2026-02-14: Engineering Log Restructure
- **What changed:** Updated `AGENTS.md` to enforce a strict, conversational log structure.
- **What I want:** Highly contextual documentation that explains the *why* and *how* of changes, not just the *what*.
- **What I don't want:** Generic "Updated X" logs that leave future agents guessing about intent or trade-offs.
- **How we fixed that:**
  - Defined a mandatory template based on "What I want" / "What I don't want" / "How we fixed that".
  - Refactored all previous valid entries (Smart Insights, Sidebar, etc.) to match this legacy-proof format.
- **Key Files:** `AGENTS.md`
- **Verification:** Read the file header; observe the new conversational format instructions.

### 2026-02-14: Smart Insights Widget
- **What changed:** Added a new "Smart Insights" widget to the dashboard.
- **What I want:** Provide users with actionable, AI-driven feedback (e.g., risk warnings, opportunities) instead of just raw data charts.
- **What I don't want:** A static, boring widget that just lists numbers without context or intelligence.
- **How we fixed that:** 
  - Created a dedicated Server Action (`get-smart-insights.ts`) to simulate AI analysis of trading patterns.
  - Built a modern, glassmorphic UI (`smart-insights-widget.tsx`) that dynamically renders alerts and recommendations based on confidence scores.
- **Key Files:** `app/[locale]/dashboard/actions/get-smart-insights.ts`, `components/widgets/smart-insights-widget.tsx`
- **Verification:** Enter dashboard edit mode -> Add "Smart Insights" -> Confirm insights load with correct risk/opportunity styling.

### 2026-02-14: Sidebar Modernization
- **What changed:** Completely replaced the old dashboard sidebar with a new `shadcn/ui` version.
- **What I want:** A collapsible, responsive, and aesthetically premium sidebar that matches the new landing page design.
- **What I don't want:** The clunky, rigid legacy sidebar that had poor mobile support and didn't fit the "monochrome" theme.
- **How we fixed that:**
  - Implemented the `sidebar-07` pattern using the `SidebarProvider` context for smooth state management.
  - Refactored navigation into logical groups (Trading, Analytics, System) and added keyboard shortcuts (`Cmd+B`).
  - Proactively updated Teams layouts to ensure the new sidebar works everywhere, not just on the main dashboard.
- **Key Files:** `components/sidebar/dashboard-sidebar.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/ui/sidebar.tsx`
- **Verification:** Press `Cmd+B` to toggle sidebar; Resize to mobile width to verify Sheet/Hamburger menu behavior.

### 2026-02-14: Dashboard Navigation Recovery
- **What changed:** Restored the legacy `Navbar` component to the dashboard layout.
- **What I want:** To keep the "Edit Layout" and "Lock Grid" controls accessible to users.
- **What I don't want:** Losing critical functionality because the new sidebar implementation accidentally removed the header where these controls lived.
- **How we fixed that:**
  - Re-imported and integrated the legacy `Navbar` into `app/[locale]/dashboard/layout.tsx` so it sits alongside the new sidebar, restoring full layout management capabilities.
- **Key Files:** `app/[locale]/dashboard/layout.tsx`, `app/[locale]/dashboard/components/dashboard-header.tsx`
- **Verification:** Navigate to `/dashboard` -> Verify top header contains "Edit Layout" and "Global Sync" buttons.

### 2026-02-13: Trader Profile Metrics Overhaul
- **What changed:** Redesigned the Trader Profile metrics panel to focus on Profit/Withdrawals instead of redundant win rates.
- **What I want:** A clear, financial summary of a trader's success (Total Profit + Total Withdrawals) that is instantly readable.
- **What I don't want:** Confusing duplicate stats (Win Rate shown 3 times) or mixing up "unrealized" gains with actual paid-out profits.
- **How we fixed that:**
  - Removed the red-marked `Win Rate` and `Expectancy` cards from the quick-view row.
  - Calculated `Total Profit` from aggregated account trading profit (`account.metrics.totalProfit`) across all accounts.
  - Split `Total Withdraw` into its own distinct metric (counting only `PAID` status) to separate realized withdrawals from trading profit.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`
- **Verification:** Check Trader Profile -> Ensure "Total Profit" and "Total Withdraw" are displayed distinctly in the right panel.

### 2026-02-13: Trader Profile UI Polish
- **What changed:** Refined spacing and added a `shadcn` Avatar to the profile header; removed duplicate navigation.
- **What I want:** A clean, professional profile header that feels spacious and properly aligned.
- **What I don't want:** Double navigation bars eating up vertical space or awkward gaps around the user avatar.
- **How we fixed that:**
  - Removed the duplicate secondary top nav spacing element.
  - Implemented the standard `shadcn` `Avatar` component for consistent sizing and fallback handling.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`

### 2026-02-14: Trader Profile Audit Pass
- **What changed:** Audited Trader Profile metric logic and removed stale internal fields from the page model.
- **What I want:** Clear metric semantics with minimal technical debt so future agents can safely iterate.
- **What I don't want:** Silent confusion where `Total Profit` is interpreted as payouts, or extra unused fields lingering in the metrics object.
- **How we fixed that:**
  - Confirmed metric intent in code: `Total Profit` = trading profit across accounts, `Total Withdraw` = sum of `PAID` withdrawals.
  - Removed unused fields (`avgWin`, `avgLoss`, `expectancy`) from the `TraderMetrics` return type/object in `trader-profile/page.tsx`.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`, `AGENTS.md`
- **Verification:** Lint `app/[locale]/dashboard/trader-profile/page.tsx` passes and Trader Profile shows distinct Profit vs Withdraw values.

### 2026-02-14: Dashboard Editor Polish
- **What changed:** Re-added "Restore Defaults" and "Remove All" buttons to the widget editor toolbar.
- **What I want:** Give users an easy way to reset their dashboard if they make a mess or want to start fresh.
- **What I don't want:** Users getting stuck with a broken layout and having no "nuclear option" to fix it.
- **How we fixed that:**
  - Audit of the widget editor component revealed missing button handlers.
  - Re-implemented the standard `RestoreDefaults` and `RemoveAll` actions in the editor navigation bar.
- **Key Files:** `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/navbar.tsx`

### 2026-02-13: PnL Visual Logic
- **What changed:** Updated the trade table PnL styling to use emerald green for profits and muted colors for losses.
- **What I want:** A table that draws the eye to wins (positive reinforcement) while keeping losses readable but not screamingly red.
- **What I don't want:** A "Christmas tree" effect where everything is neon, or a depressing dashboard filled with bright red negative numbers.
- **How we fixed that:**
  - Applied the `text-emerald-500` class conditionally only to positive PnL values.
  - Kept negative values in the standard monochrome/muted palette to align with the new design system.
- **Key Files:** `components/ui/data-table/columns.tsx`

### 2026-02-13: VaR Codepath Trace
- **What changed:** Located and mapped all Value at Risk (VaR) implementation touchpoints across logic, action, UI, and tests.
- **What I want:** Future agents (and users) should find VaR calculation and rendering code immediately without hunting through unrelated files.
- **What I don't want:** Repeated time loss from searching broad terms and missing the core analytics file.
- **How we fixed that:**
  - Identified core VaR engine functions in `lib/analytics/var.ts` (`computeHistoricalVar`, `computeParametricVar`, `computeVarSummary`).
  - Confirmed server action usage in `app/[locale]/teams/actions/user.ts` via `getTraderVarSummary`.
  - Confirmed UI rendering in `app/[locale]/teams/components/trader-info.tsx` for Hist/Param VaR at 95%/99%.
  - Confirmed test coverage in `tests/var.test.ts` and `tests/trader-var-action.test.ts`.
- **Key Files:** `lib/analytics/var.ts`, `app/[locale]/teams/actions/user.ts`, `app/[locale]/teams/components/trader-info.tsx`, `tests/var.test.ts`, `tests/trader-var-action.test.ts`
- **Verification:** Run `rg -n "Value at Risk|VaR|computeVarSummary|getTraderVarSummary" .` and verify matches in the files above.

### 2026-02-13: VaR Runtime Usage Clarification
- **What changed:** Traced where VaR is actually used in live app flow (not just defined/tested).
- **What I want:** Make it obvious which route renders VaR to end users.
- **What I don't want:** Confusion between helper/test references and real runtime usage.
- **How we fixed that:**
  - Verified `getTraderVarSummary` is called inside `TraderInfo`.
  - Verified `TraderInfo` is rendered by the trader detail page route.
- **Key Files:** `app/[locale]/teams/actions/user.ts`, `app/[locale]/teams/components/trader-info.tsx`, `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`
- **Verification:** Open `/teams/dashboard/trader/[slug]` and confirm the "1-Day Value at Risk" section appears.

### 2026-02-14: Build Repair - Trader Profile Type
- **What changed:** Added explicit `string` types to map callbacks in `TraderProfile`.
- **What I want:** Resolve `Parameter "value" implicitly has an "any" type` errors blocking the build.
- **What I don't want:** TypeScript strict mode failures in the production pipeline.
- **How we fixed that:**
  - Added `: string` annotation to arguments in the `profileInitials` calculation logic.
- **Key Files:** `app/[locale]/dashboard/trader-profile/page.tsx`
- **Verification:** Run `npm run build` locally.

### 2026-02-14: Build Repair - Lazy Widget Registration
- **What changed:** Manually registered `smartInsights` and `propFirmCatalogue` in `lazy-widget.tsx`.
- **What I want:** To pass the production build type-check for the dashboard's lazy loader.
- **What I don't want:** Build faillures because the `widgetLoaders` map is missing keys defined in the `WidgetType` union.
- **How we fixed that:**
  - Added dynamic imports for the missing widgets in `app/[locale]/dashboard/components/lazy-widget.tsx`.
  - Used named export resolution for `SmartInsightsWidget` since it's not a default export.
- **Key Files:** `app/[locale]/dashboard/components/lazy-widget.tsx`
- **Verification:** Run `npm run build` locally to confirm the type error is resolved.

### 2026-02-14: Build Repair - CSS Import
- **What changed:** Removed `@import "tw-animate-css";` from `globals.css`.
- **What I want:** A clean CSS build without missing dependency errors.
- **What I don't want:** The Vercel build crashing because it can't resolve a CSS package that isn't in `package.json`.
- **How we fixed that:**
  - Identified the build error: `Can't resolve 'tw-animate-css'`.
  - Removed the invalid import line as the package was not actually installed/used.
- **Key Files:** `app/globals.css`
- **Verification:** Run `npm run build` locally.

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
