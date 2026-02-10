export interface TraderProfile {
  name: string
  subscribers: number
  tier: string
  style: string
  avatar: string
}

export interface TradeItem {
  id: string
  symbol: string
  date: string
  risk: string
  ratio: number
  pnlPct: number
  status: "OPEN" | "CLOSED"
}

export interface TraderStats {
  avgWin: number
  avgLoss: number
  avgReturn: number
  winRate: number
  totalTrades: number
  breakEvenRate: number
  sumGain: number
  serialTraderScore: number
}
