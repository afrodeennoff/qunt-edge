import Decimal from 'decimal.js'

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

export type DecimalLike = Decimal.Value | null | undefined

export function toDecimal(value: DecimalLike): Decimal {
  if (value === null || value === undefined) return new Decimal(0)
  return new Decimal(value)
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

export function divMoney(left: DecimalLike, right: DecimalLike): Decimal {
    const divisor = toDecimal(right)
    if (divisor.isZero()) return new Decimal(0)
    return toDecimal(left).dividedBy(divisor)
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

export function calcWinRate(wins: number, total: number): Decimal {
    if (total === 0) return new Decimal(0)
    return new Decimal(wins).dividedBy(total).times(100)
}

export function calcProfitFactor(grossWin: DecimalLike, grossLoss: DecimalLike): Decimal {
    const loss = toDecimal(grossLoss).abs()
    if (loss.isZero()) return new Decimal(0) // Or Infinity? 0 is safer for UI
    return toDecimal(grossWin).dividedBy(loss)
}
