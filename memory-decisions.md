# Memory: Decisions

- 2026-02-28: Vercel analytics scripts are now opt-in via `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true` using `components/providers/vercel-insights.tsx` to avoid non-Vercel runtime `/_vercel/*` failures.
- 2026-02-28: Landing mobile navbar sheet in `app/[locale]/(landing)/components/navbar.tsx` now includes `SheetTitle` and `SheetDescription` for accessibility compliance and clean mobile dialog behavior.
- 2026-02-28: Dashboard contrast recovery uses a strict ladder: primary `text-foreground`/`text-foreground/95`, secondary `text-muted-foreground/85`, helper `text-muted-foreground/70`, tertiary `text-muted-foreground/55`, with card/border floors aligned to `bg-card/92+` and `border-border/55+`.
- 2026-03-01: Compact Risk/Reward widget is standardized to a single centered presentation with larger metric text and no nested inner card chrome.
