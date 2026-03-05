# Memory: Decisions

- 2026-02-28: Vercel analytics scripts are now opt-in via `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true` using `components/providers/vercel-insights.tsx` to avoid non-Vercel runtime `/_vercel/*` failures.
- 2026-02-28: Landing mobile navbar sheet in `app/[locale]/(landing)/components/navbar.tsx` now includes `SheetTitle` and `SheetDescription` for accessibility compliance and clean mobile dialog behavior.
- 2026-02-28: Dashboard contrast recovery uses a strict ladder: primary `text-foreground`/`text-foreground/95`, secondary `text-muted-foreground/85`, helper `text-muted-foreground/70`, tertiary `text-muted-foreground/55`, with card/border floors aligned to `bg-card/92+` and `border-border/55+`.
- 2026-03-01: Compact Risk/Reward widget is standardized to a single centered presentation with larger metric text and no nested inner card chrome.
- 2026-03-01: Sidebar header trigger in `components/ui/unified-sidebar.tsx` is now rendered as a sibling of `SidebarMenuButton` to avoid invalid nested button markup and hydration failures on teams pages.
- 2026-03-01: Dashboard header now lazy-loads heavy action modules (`filters`, `import`, `share`, `sync`, `daily summary`, widget controls) to keep dashboard-family app-route manifests under the 80 KB budget.
- 2026-03-01: CSP builder omits `upgrade-insecure-requests` when `CSP_REPORT_ONLY` mode is active to prevent recurring browser console report-only warnings.
- 2026-03-01: Next config now sets `turbopack.root` and `outputFileTracingRoot` to project root for consistent root detection during local dev/build audits.
- 2026-03-03: Repository understanding workflow now uses a skill applicability matrix (applicable vs conditional vs not-applicable) plus parallel explorer subagent cross-checks before sharing architecture summaries.
- 2026-03-03: Theme token contract now uses `styles/tokens.css` as canonical source; duplicate semantic token blocks were removed from `app/globals.css`, and compatibility alias `--sidebar -> --sidebar-background` is retained for one migration cycle.
- 2026-03-03: Completed token migration Phase C by removing `--sidebar` compatibility alias after zero internal usage was confirmed; canonical sidebar token is now only `--sidebar-background`.
- 2026-03-04: All-surfaces polish pass stays on premium monochrome direction; no brand-color re-theme was introduced.
- 2026-03-04: Dashboard sidebar now consumes `useDashboardActions()` instead of `useData()` to reduce broad context subscription churn in navigation shell renders.
- 2026-03-05: Decided to standardize Redis access behind a single utility (local Redis first, Upstash fallback) and apply it to high-traffic read/auth paths with explicit invalidation on trade writes.
- 2026-03-05: Cache policy behavior for protected redirects/private APIs is enforced as strict private no-store and validated via strict header checks.
- 2026-03-05: Warning-budget governance is treated as an active CI gate with current baseline cap and planned ratchet reductions.
- 2026-03-05: Pricing page now lazy-loads `PricingPlans` behind a lightweight fallback to shift heavy subscription UI off initial execution path.
- 2026-03-05: Deferred home sections now use tighter intersection thresholds and idle-callback scheduling to reduce immediate main-thread contention during first paint.
