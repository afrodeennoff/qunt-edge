# Full Page Audit (2026-03-05)

- Route pages audited: 46
- page-client files audited: 6

## Findings (Critical)
- None

## Findings (Warnings by file)
- `app/[locale]/dashboard/settings/page.tsx`: warnings=8, complexity=1, any=3, unused=4
- `app/[locale]/(landing)/support/page.tsx`: warnings=7, complexity=2, any=2, unused=3
- `app/[locale]/admin/components/send-email/send-email-page-client.tsx`: warnings=5, complexity=3, any=0, unused=1
- `app/[locale]/embed/page.tsx`: warnings=4, complexity=1, any=1, unused=2
- `app/[locale]/dashboard/import/page.tsx`: warnings=3, complexity=1, any=0, unused=0
- `app/[locale]/teams/join/page.tsx`: warnings=3, complexity=1, any=0, unused=1
- `app/[locale]/(landing)/propfirms/page.tsx`: warnings=2, complexity=2, any=0, unused=0
- `app/[locale]/dashboard/behavior/page-client.tsx`: warnings=2, complexity=2, any=0, unused=0
- `app/[locale]/dashboard/behavior/page.tsx`: warnings=2, complexity=2, any=0, unused=0
- `app/[locale]/dashboard/trader-profile/page-client.tsx`: warnings=2, complexity=2, any=0, unused=0
- `app/[locale]/dashboard/trader-profile/page.tsx`: warnings=2, complexity=2, any=0, unused=0
- `app/[locale]/(landing)/_updates/[slug]/page.tsx`: warnings=1, complexity=1, any=0, unused=0
- `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx`: warnings=1, complexity=1, any=0, unused=0
- `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`: warnings=1, complexity=0, any=0, unused=1

## Full Route Matrix
- `app/[locale]/(authentication)/authentication/page.tsx` | lines=154 | warnings=0 | client
- `app/[locale]/(home)/page.tsx` | lines=30 | warnings=0 | server
- `app/[locale]/(landing)/_updates/[slug]/page.tsx` | lines=257 | warnings=1 | server
- `app/[locale]/(landing)/_updates/page.tsx` | lines=72 | warnings=0 | server
- `app/[locale]/(landing)/about/page.tsx` | lines=80 | warnings=0 | server
- `app/[locale]/(landing)/community/page.tsx` | lines=37 | warnings=0 | server
- `app/[locale]/(landing)/community/post/[id]/page.tsx` | lines=50 | warnings=0 | server
- `app/[locale]/(landing)/disclaimers/page.tsx` | lines=49 | warnings=0 | client
- `app/[locale]/(landing)/docs/page.tsx` | lines=54 | warnings=0 | server
- `app/[locale]/(landing)/faq/page.tsx` | lines=73 | warnings=0 | server
- `app/[locale]/(landing)/maintenance/page.tsx` | lines=32 | warnings=0 | server
- `app/[locale]/(landing)/newsletter/page.tsx` | lines=61 | warnings=0 | server
- `app/[locale]/(landing)/pricing/page.tsx` | lines=8 | warnings=0 | server
- `app/[locale]/(landing)/privacy/page.tsx` | lines=101 | warnings=0 | server
- `app/[locale]/(landing)/propfirms/page.tsx` | lines=326 | warnings=2 | server
- `app/[locale]/(landing)/referral/page.tsx` | lines=181 | warnings=0 | client
- `app/[locale]/(landing)/support/page.tsx` | lines=407 | warnings=7 | client
- `app/[locale]/(landing)/terms/page.tsx` | lines=8 | warnings=0 | server
- `app/[locale]/(landing)/updates/[slug]/page.tsx` | lines=10 | warnings=0 | server
- `app/[locale]/(landing)/updates/page.tsx` | lines=3 | warnings=0 | server
- `app/[locale]/[...not-found]/page.tsx` | lines=7 | warnings=0 | server
- `app/[locale]/admin/newsletter-builder/page.tsx` | lines=51 | warnings=0 | server
- `app/[locale]/admin/page.tsx` | lines=11 | warnings=0 | server
- `app/[locale]/admin/send-email/page.tsx` | lines=15 | warnings=0 | server
- `app/[locale]/admin/weekly-recap/page.tsx` | lines=19 | warnings=0 | server
- `app/[locale]/admin/welcome-email/page.tsx` | lines=20 | warnings=0 | server
- `app/[locale]/dashboard/behavior/page.tsx` | lines=450 | warnings=2 | client, noStoreFetch
- `app/[locale]/dashboard/billing/page.tsx` | lines=20 | warnings=0 | client
- `app/[locale]/dashboard/data/page.tsx` | lines=38 | warnings=0 | client
- `app/[locale]/dashboard/import/page.tsx` | lines=274 | warnings=3 | client, usesData
- `app/[locale]/dashboard/page.tsx` | lines=19 | warnings=0 | server
- `app/[locale]/dashboard/reports/page.tsx` | lines=20 | warnings=0 | client
- `app/[locale]/dashboard/settings/page.tsx` | lines=644 | warnings=8 | client
- `app/[locale]/dashboard/strategies/page.tsx` | lines=19 | warnings=0 | client
- `app/[locale]/dashboard/trader-profile/page.tsx` | lines=800 | warnings=2 | client, usesData, noStoreFetch, interval
- `app/[locale]/embed/page.tsx` | lines=277 | warnings=4 | client
- `app/[locale]/shared/[slug]/page.tsx` | lines=25 | warnings=0 | server
- `app/[locale]/teams/(landing)/page.tsx` | lines=164 | warnings=0 | client
- `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx` | lines=329 | warnings=1 | client
- `app/[locale]/teams/dashboard/[slug]/members/page.tsx` | lines=56 | warnings=0 | client
- `app/[locale]/teams/dashboard/[slug]/page.tsx` | lines=29 | warnings=0 | server
- `app/[locale]/teams/dashboard/[slug]/traders/page.tsx` | lines=31 | warnings=0 | client
- `app/[locale]/teams/dashboard/page.tsx` | lines=18 | warnings=0 | server
- `app/[locale]/teams/dashboard/trader/[slug]/page.tsx` | lines=28 | warnings=1 | server
- `app/[locale]/teams/join/page.tsx` | lines=341 | warnings=3 | client
- `app/[locale]/teams/manage/page.tsx` | lines=12 | warnings=0 | client

## Full page-client Matrix
- `app/[locale]/(landing)/pricing/pricing-page-client.tsx` | lines=28 | warnings=0 | client
- `app/[locale]/(landing)/terms/terms-page-client.tsx` | lines=99 | warnings=0 | client
- `app/[locale]/admin/components/send-email/send-email-page-client.tsx` | lines=522 | warnings=5 | client
- `app/[locale]/dashboard/behavior/page-client.tsx` | lines=469 | warnings=2 | client, noStoreFetch
- `app/[locale]/dashboard/trader-profile/page-client.tsx` | lines=801 | warnings=2 | client, usesData, noStoreFetch, interval
- `app/[locale]/shared/[slug]/shared-page-client.tsx` | lines=260 | warnings=0 | client, usesData
