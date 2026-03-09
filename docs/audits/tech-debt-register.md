# Tech Debt Register (2026-03-05)

## Purpose
Track high-impact debt items with owner and planned remediation phase so TODO/FIXME/HACK markers do not stay untracked.

## Debt Inventory Summary
- Total lint warnings (baseline): `1546`
- Type suppression markers (`@ts-ignore`/`@ts-expect-error`): `49`
- TODO/FIXME/HACK/XXX markers: `40`
- Console statements in app/server/lib: `813`

## Highest-Risk Modules (by lint warning concentration)
1. `server/webhook-service.ts` (`51`) - Phase 4
2. `context/data-provider.tsx` (`42`) - Phase 4
3. `app/[locale]/dashboard/components/import/components/format-preview.tsx` (`24`) - Phase 4
4. `app/[locale]/dashboard/components/chat/chat.tsx` (`23`) - Phase 4/6
5. `app/[locale]/dashboard/components/charts/equity-chart.tsx` (`23`) - Phase 4/6
6. `app/[locale]/dashboard/components/tables/trade-table-review.tsx` (`20`) - Phase 4

## Register
| ID | Area | Debt | Risk | Owner | Target Phase | Status |
|---|---|---|---|---|---|---|
| TD-001 | Middleware | Broad public API cache classification and redirect cache policy drift | Security + stale/private caching risk | Platform | Phase 1 | In Progress |
| TD-002 | Performance | High TBT on `/en` and `/en/pricing` | UX slowdown, Lighthouse gate failures | Frontend | Phase 3 | In Progress |
| TD-003 | Webhooks | Monolithic webhook service complexity | Regression risk in payment/subscription events | Backend | Phase 4 | Planned |
| TD-004 | Dashboard State | Overloaded provider and broad subscriptions | Rerender cost and maintenance burden | Frontend | Phase 4 | Planned |
| TD-005 | Trade Table | High-complexity monolith | Behavior regressions + low dev velocity | Frontend | Phase 4 | Planned |
| TD-006 | Logging | Direct `console.*` in production paths | Poor observability consistency | Platform | Phase 5 | Planned |
| TD-007 | Type Safety | `@ts-ignore`/`@ts-expect-error` accumulation | Hidden runtime/type regressions | Fullstack | Phase 5 | Planned |
| TD-008 | Lint Governance | High warning baseline without budget ratchet | Quality drift | Platform | Phase 6 | In Progress |
| TD-009 | Global Styles | Large global CSS blast radius | Unintended visual side effects | Frontend | Phase 7 | Planned |
| TD-010 | CI Perf Gates | Missing baseline artifact checks in release governance | Undetected perf regression over time | Platform | Phase 8 | In Progress |

## Ratchet Policy
- Warning budget starts at `1546` and must be reduced in each follow-up batch.
- No increases are allowed once CI warning budget gate is enabled.

## Next Reduction Target
- Next target budget: `1450` warnings.
- Scope: `server/webhook-service.ts`, `context/data-provider.tsx`, `trade-table-review.tsx`.
