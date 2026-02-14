export interface PropfirmPayoutStats {
  propfirmName: string;
  pendingAmount: number;
  pendingCount: number;
  refusedAmount: number;
  refusedCount: number;
  paidAmount: number;
  paidCount: number;
}

export interface PropfirmAccountSizeDistribution {
  label: string;
  count: number;
  totalValue: number;
}

export interface PropfirmCatalogueStats {
  propfirmName: string;
  accountsCount: number;
  sizedAccountsCount: number;
  totalAccountValue: number;
  sizeBreakdown: string;
  sizeDistribution: PropfirmAccountSizeDistribution[];
  payouts: PropfirmPayoutStats;
}

export interface PropfirmCatalogueData {
  stats: PropfirmCatalogueStats[];
}
