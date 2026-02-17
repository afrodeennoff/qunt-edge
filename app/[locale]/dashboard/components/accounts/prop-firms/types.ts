export interface AccountSize {
  name: string;
  balance: number;
  price: number;
  priceWithPromo: number;
  evaluation: boolean;
  minDays?: number | 'DIRECTLY FUNDED';
  target: number;
  dailyLoss?: number | null;
  drawdown: number;
  rulesDailyLoss?: 'Violation' | 'No' | 'Lock' | 'DIRECTLY FUNDED';
  trailing?: 'EOD' | 'Intraday' | 'Static' | 'DIRECTLY FUNDED';
  consistency?: number | 'DIRECTLY FUNDED';
  ratioTargetDailyLoss?: number | null;
  ratioTargetDrawdown: number;
  ratioDrawdownPrice: number;
  tradingNewsAllowed: boolean;
  activationFees: number;
  isRecursively: 'Unique' | 'Monthly' | 'No';
  payoutBonus: number;
  profitSharing: number;
  payoutPolicy: string;
  balanceRequired: number;
  minTradingDaysForPayout: number;
  minPayout: number;
  maxPayout: string;
  maxFundedAccounts: number;
  tradingNewsRules?: string;
  minPnlToCountAsDay?: number;
  maxContracts?: number;
}

export interface PropFirm {
  name: string;
  accountSizes: Record<string, AccountSize>;
}
