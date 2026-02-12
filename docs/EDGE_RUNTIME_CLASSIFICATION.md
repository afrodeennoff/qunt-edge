# Edge Runtime Classification

## Edge-safe routes

| Route | Runtime | Reason |
| --- | --- | --- |
| `/api` | `edge` | Simple JSON response, no Node-only dependencies |

## Node-required routes

| Route | Runtime | Reason |
| --- | --- | --- |
| `/api/health` | `nodejs` | Uses Prisma and process uptime |
| `/api/ai/chat` | `nodejs` | AI SDK streaming + server-side tooling |
| `/api/ai/format-trades` | `nodejs` | AI object streaming and provider integration |
| `/api/imports/ibkr/ocr` | `nodejs` | PDF parsing and binary buffer work |
| `/api/whop/webhook` | `nodejs` | Signature verification and payment side effects |

## Rollout guardrails

1. Add `export const runtime = "edge"` only when route has no Node-only modules.
2. Keep payment, DB, and heavy compute routes on `nodejs`.
3. Add route smoke tests whenever runtime classification changes.
