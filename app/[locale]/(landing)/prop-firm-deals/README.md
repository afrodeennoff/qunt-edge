# Prop Firm Deals Page

This route powers `/{locale}/prop-firm-deals`.

## Edit content

1. Open `app/[locale]/(landing)/prop-firm-deals/data/mock-data.ts`.
2. Update:
   - `firms` for comparison table rows.
   - `deals` for featured/latest deal cards.
   - `faqItems` for FAQ accordion + FAQ schema.

## Data model

Types are defined in `app/[locale]/(landing)/prop-firm-deals/data/types.ts`.
When replacing mock data with API data, keep the same shapes so the UI component works without refactor.

## Main UI

`app/[locale]/(landing)/prop-firm-deals/components/prop-firm-deals-experience.tsx`
contains filtering, search, sorting, responsive table/cards, trust block, tools/community CTAs, and FAQ accordion.
