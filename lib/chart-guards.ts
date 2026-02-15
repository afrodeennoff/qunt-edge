import { toFiniteNumber } from "@/lib/utils"

export function hasPositiveFiniteByKey(
  rows: Array<Record<string, unknown> | object>,
  key: string
): boolean {
  return rows.some((row) => {
    const value = toFiniteNumber(
      (row as Record<string, unknown>)[key],
      Number.NaN
    )
    return Number.isFinite(value) && value > 0
  })
}

export function hasFiniteKeyPrefix(
  rows: Array<Record<string, unknown> | object>,
  prefix: string
): boolean {
  return rows.some((row) =>
    Object.entries(row as Record<string, unknown>).some(([key, value]) => {
      if (!key.startsWith(prefix)) return false
      return Number.isFinite(toFiniteNumber(value, Number.NaN))
    })
  )
}
