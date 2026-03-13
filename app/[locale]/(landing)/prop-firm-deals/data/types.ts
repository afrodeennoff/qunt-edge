export type MarketType = 'Futures' | 'Forex' | 'Crypto'
export type TradingPlatform = 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
export type PayoutModel = 'Bi-weekly' | 'Weekly' | 'On-demand' | 'Monthly'
export type DrawdownType = 'Trailing' | 'Static' | 'End-of-day'

export interface DealItem {
  id: string
  firmId: string
  firmName: string
  logoUrl?: string
  marketType: MarketType
  platform: TradingPlatform
  payoutModel: PayoutModel
  drawdownType: DrawdownType
  discountPercent: number
  couponCode: string
  challengeFee: number
  expiryDate: string
  verified: boolean
  claimUrl: string
}

export interface FirmItem {
  id: string
  name: string
  logoUrl?: string
  marketType: MarketType
  platform: TradingPlatform
  payoutModel: PayoutModel
  drawdownType: DrawdownType
  challengeFee: number
  profitSplit: string
  payoutFrequency: string
  maxAllocation: string
  rating: number
}

export interface FaqItem {
  question: string
  answer: string
}
