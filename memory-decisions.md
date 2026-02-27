# Memory: Decisions

- 2026-02-28: Vercel analytics scripts are now opt-in via `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true` using `components/providers/vercel-insights.tsx` to avoid non-Vercel runtime `/_vercel/*` failures.
- 2026-02-28: Landing mobile navbar sheet in `app/[locale]/(landing)/components/navbar.tsx` now includes `SheetTitle` and `SheetDescription` for accessibility compliance and clean mobile dialog behavior.
