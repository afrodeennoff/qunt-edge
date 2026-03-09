# Import Contracts

## Canonical Trade DTO

All importer pipelines should normalize into the canonical DTO before persistence.

Source: `lib/trade-types.ts`

Key fields:
- `accountNumber: string`
- `instrument: string`
- `side: string | null`
- `quantity: number | string`
- `entryPrice: number | string`
- `closePrice: number | string`
- `pnl: number | string`
- `commission: number | string`
- `entryDate: string` (ISO timestamp)
- `closeDate: string` (ISO timestamp)

## Validation Rules

- Dates are normalized to UTC via `normalizeToUtcTimestamp`.
- `closeDate` must be >= `entryDate` (`isChronologicalRange`).
- Monetary and quantity fields are parsed as decimal-safe values server side.
- Duplicate imports are idempotent through trade signature/UUID generation.

## Compatibility

- Importers can keep source-specific parsers.
- Final handoff into persistence must use the canonical DTO shape.
- Any schema expansion should be backward compatible (optional fields first, adapters in bridge period).

