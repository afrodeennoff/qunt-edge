import Decimal from 'decimal.js'

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

export type DecimalLike = Decimal.Value | null | undefined

export function toDecimal(value: DecimalLike): Decimal {
  return new Decimal(value ?? 0)
}

export function addMoney(...values: DecimalLike[]): Decimal {
  return values.reduce<Decimal>((sum, value) => sum.plus(toDecimal(value)), new Decimal(0))
}

export function subMoney(left: DecimalLike, right: DecimalLike): Decimal {
  return toDecimal(left).minus(toDecimal(right))
}

export function mulMoney(left: DecimalLike, right: DecimalLike): Decimal {
  return toDecimal(left).times(toDecimal(right))
}

export function roundMoney(value: DecimalLike, decimals: number = 2): Decimal {
  return toDecimal(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP)
}

export function toMoneyNumber(value: DecimalLike, decimals: number = 2): number {
  return roundMoney(value, decimals).toNumber()
}

export function netPnl(pnl: DecimalLike, commission: DecimalLike = 0): Decimal {
  return subMoney(pnl, commission)
}
