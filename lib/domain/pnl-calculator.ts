import Decimal from "decimal.js";

Decimal.set({ precision: 28 });

export interface PnLCalculationInput {
  entryPrice: number | string | Decimal;
  exitPrice: number | string | Decimal;
  quantity: number | string | Decimal;
  direction: "LONG" | "SHORT";
  fees?: number | string | Decimal;
  commissions?: number | string | Decimal;
}

export interface PnLCalculationResult {
  grossPnL: Decimal;
  netPnL: Decimal;
  totalFees: Decimal;
  pnlPerContract: Decimal;
  pnlPercentage: Decimal;
}

export function calculatePnL(input: PnLCalculationInput): PnLCalculationResult {
  const entryPrice = new Decimal(input.entryPrice);
  const exitPrice = new Decimal(input.exitPrice);
  const quantity = new Decimal(input.quantity);
  const fees = new Decimal(input.fees || 0);
  const commissions = new Decimal(input.commissions || 0);

  const totalFees = fees.plus(commissions);

  let grossPnL =
    input.direction === "LONG"
      ? exitPrice.minus(entryPrice).times(quantity)
      : entryPrice.minus(exitPrice).times(quantity);

  const netPnL = grossPnL.minus(totalFees);

  return {
    grossPnL,
    netPnL,
    totalFees,
    pnlPerContract: quantity.gt(0)
      ? netPnL.dividedBy(quantity)
      : new Decimal(0),
    pnlPercentage: entryPrice.times(quantity).gt(0)
      ? netPnL.dividedBy(entryPrice.times(quantity)).times(100)
      : new Decimal(0),
  };
}
