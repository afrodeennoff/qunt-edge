# Memory: Decisions

- 2026-02-28: Vercel analytics scripts are now opt-in via `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true` using `components/providers/vercel-insights.tsx` to avoid non-Vercel runtime `/_vercel/*` failures.
- 2026-02-28: Landing mobile navbar sheet in `app/[locale]/(landing)/components/navbar.tsx` now includes `SheetTitle` and `SheetDescription` for accessibility compliance and clean mobile dialog behavior.
- 2026-02-28: Dashboard contrast recovery uses a strict ladder: primary `text-foreground`/`text-foreground/95`, secondary `text-muted-foreground/85`, helper `text-muted-foreground/70`, tertiary `text-muted-foreground/55`, with card/border floors aligned to `bg-card/92+` and `border-border/55+`.
- 2026-03-01: Compact Risk/Reward widget is standardized to a single centered presentation with larger metric text and no nested inner card chrome.
- 2026-03-01: Sidebar header trigger in `components/ui/unified-sidebar.tsx` is now rendered as a sibling of `SidebarMenuButton` to avoid invalid nested button markup and hydration failures on teams pages.
- 2026-03-01: Dashboard header now lazy-loads heavy action modules (`filters`, `import`, `share`, `sync`, `daily summary`, widget controls) to keep dashboard-family app-route manifests under the 80 KB budget.
- 2026-03-01: CSP builder omits `upgrade-insecure-requests` when `CSP_REPORT_ONLY` mode is active to prevent recurring browser console report-only warnings.
- 2026-03-01: Next config now sets `turbopack.root` and `outputFileTracingRoot` to project root for consistent root detection during local dev/build audits.
- 2026-03-01: Landing/auth readability audits should prioritize route-impacting regressions first (navigation/locale/link correctness), then contrast/typography issues that materially affect legibility.
- 2026-03-01: Checkout creation endpoints now enforce POST-only semantics; GET returns `405` with `Allow: POST` for `/api/whop/checkout` and `/api/whop/checkout-team`.
- 2026-03-01: Browser-initiated checkout mutations now enforce trusted-origin and form content-type checks before processing request payloads.
- 2026-03-01: Supabase security posture now explicitly forces RLS and deny-by-default policies on `AiRequestLog`, `AuthAttempt`, `OAuthState`, `RecoveryCode`, `ReferralRedemption`, and `TraderBenchmarkSnapshot` with `service_role_all` carve-out.
- 2026-03-01: TestSprite execution in this repo requires seeded PRD artifacts (`testsprite_tests/tmp/prd_files/*`) before frontend plan and code execution can produce stable outputs.
- 2026-03-01: Authentication route for automated E2E in this app is `/en/authentication` (not `/en/login`); tests assuming `/en/login` create false negatives.
- 2026-03-01: Keep adding explicit `/en/authentication` password-flow test cases in TestSprite plans because generated default `/en/login` steps frequently cause false negatives.
- 2026-03-01: In development-mode TestSprite execution, expect subset execution behavior (15-case run observed) even when the plan file contains more cases.
- 2026-03-01: Backend TestSprite runs in this environment are currently constrained by local endpoint reachability; until local API is reachable from the runner, backend test outcomes are transport failures rather than endpoint-contract validation.
