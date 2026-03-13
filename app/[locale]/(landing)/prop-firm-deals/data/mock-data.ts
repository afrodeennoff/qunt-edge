import type { DealItem, FaqItem, FirmItem } from './types'

export const firms: FirmItem[] = [
  { id: 'apex', name: 'Apex Trader Funding', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', challengeFee: 167, profitSplit: '90/10', payoutFrequency: 'Bi-weekly', maxAllocation: '$300K', rating: 4.5 },
  { id: 'tpt', name: 'Take Profit Trader', marketType: 'Futures', platform: 'Rithmic', payoutModel: 'Weekly', drawdownType: 'Static', challengeFee: 149, profitSplit: '80/20', payoutFrequency: 'Weekly', maxAllocation: '$250K', rating: 4.4 },
  { id: 'lucid', name: 'Lucid Trading', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Monthly', drawdownType: 'End-of-day', challengeFee: 189, profitSplit: '85/15', payoutFrequency: 'Monthly', maxAllocation: '$400K', rating: 4.3 },
  { id: 'mff', name: 'My Funded Futures', marketType: 'Futures', platform: 'Rithmic', payoutModel: 'On-demand', drawdownType: 'Trailing', challengeFee: 179, profitSplit: '90/10', payoutFrequency: 'On-demand', maxAllocation: '$600K', rating: 4.2 },
  { id: 'tradeify', name: 'Tradeify', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Weekly', drawdownType: 'Static', challengeFee: 159, profitSplit: '85/15', payoutFrequency: 'Weekly', maxAllocation: '$500K', rating: 4.1 },
  { id: 'alpha', name: 'Alpha Futures', marketType: 'Futures', platform: 'DXtrade', payoutModel: 'Bi-weekly', drawdownType: 'Static', challengeFee: 169, profitSplit: '80/20', payoutFrequency: 'Bi-weekly', maxAllocation: '$350K', rating: 4.0 },
  { id: 'fundednext', name: 'FundedNext', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Weekly', drawdownType: 'Static', challengeFee: 99, profitSplit: '90/10', payoutFrequency: 'Weekly', maxAllocation: '$200K', rating: 4.2 },
  { id: 'ftmo', name: 'FTMO', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Monthly', drawdownType: 'Static', challengeFee: 155, profitSplit: '90/10', payoutFrequency: 'Monthly', maxAllocation: '$400K', rating: 4.8 },
  { id: 'the5ers', name: 'The5ers', marketType: 'Forex', platform: 'cTrader', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', challengeFee: 95, profitSplit: '80/20', payoutFrequency: 'Bi-weekly', maxAllocation: '$500K', rating: 4.3 },
  { id: 'fundedpro', name: 'Funded Pro', marketType: 'Crypto', platform: 'DXtrade', payoutModel: 'On-demand', drawdownType: 'Trailing', challengeFee: 120, profitSplit: '85/15', payoutFrequency: 'On-demand', maxAllocation: '$250K', rating: 3.9 },
]

export const deals: DealItem[] = [
  { id: 'd1', firmId: 'apex', firmName: 'Apex Trader Funding', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', discountPercent: 50, couponCode: 'APEX50', challengeFee: 167, expiryDate: '2026-03-31', verified: true, claimUrl: 'https://example.com/apex' },
  { id: 'd2', firmId: 'tpt', firmName: 'Take Profit Trader', marketType: 'Futures', platform: 'Rithmic', payoutModel: 'Weekly', drawdownType: 'Static', discountPercent: 40, couponCode: 'TPT40', challengeFee: 149, expiryDate: '2026-03-26', verified: true, claimUrl: 'https://example.com/tpt' },
  { id: 'd3', firmId: 'lucid', firmName: 'Lucid Trading', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Monthly', drawdownType: 'End-of-day', discountPercent: 35, couponCode: 'LUCID35', challengeFee: 189, expiryDate: '2026-04-04', verified: true, claimUrl: 'https://example.com/lucid' },
  { id: 'd4', firmId: 'mff', firmName: 'My Funded Futures', marketType: 'Futures', platform: 'Rithmic', payoutModel: 'On-demand', drawdownType: 'Trailing', discountPercent: 25, couponCode: 'MFF25', challengeFee: 179, expiryDate: '2026-03-22', verified: true, claimUrl: 'https://example.com/mff' },
  { id: 'd5', firmId: 'tradeify', firmName: 'Tradeify', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Weekly', drawdownType: 'Static', discountPercent: 20, couponCode: 'TRADE20', challengeFee: 159, expiryDate: '2026-03-28', verified: true, claimUrl: 'https://example.com/tradeify' },
  { id: 'd6', firmId: 'alpha', firmName: 'Alpha Futures', marketType: 'Futures', platform: 'DXtrade', payoutModel: 'Bi-weekly', drawdownType: 'Static', discountPercent: 18, couponCode: 'ALPHA18', challengeFee: 169, expiryDate: '2026-03-25', verified: true, claimUrl: 'https://example.com/alpha' },
  { id: 'd7', firmId: 'fundednext', firmName: 'FundedNext', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Weekly', drawdownType: 'Static', discountPercent: 30, couponCode: 'FN30', challengeFee: 99, expiryDate: '2026-04-10', verified: true, claimUrl: 'https://example.com/fundednext' },
  { id: 'd8', firmId: 'ftmo', firmName: 'FTMO', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Monthly', drawdownType: 'Static', discountPercent: 12, couponCode: 'FTMO12', challengeFee: 155, expiryDate: '2026-03-24', verified: true, claimUrl: 'https://example.com/ftmo' },
  { id: 'd9', firmId: 'the5ers', firmName: 'The5ers', marketType: 'Forex', platform: 'cTrader', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', discountPercent: 22, couponCode: 'FIVE22', challengeFee: 95, expiryDate: '2026-03-30', verified: true, claimUrl: 'https://example.com/the5ers' },
  { id: 'd10', firmId: 'fundedpro', firmName: 'Funded Pro', marketType: 'Crypto', platform: 'DXtrade', payoutModel: 'On-demand', drawdownType: 'Trailing', discountPercent: 15, couponCode: 'PRO15', challengeFee: 120, expiryDate: '2026-03-29', verified: true, claimUrl: 'https://example.com/fundedpro' },
  { id: 'd11', firmId: 'apex', firmName: 'Apex Trader Funding', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', discountPercent: 45, couponCode: 'APEX45', challengeFee: 167, expiryDate: '2026-04-15', verified: true, claimUrl: 'https://example.com/apex-2' },
  { id: 'd12', firmId: 'mff', firmName: 'My Funded Futures', marketType: 'Futures', platform: 'Rithmic', payoutModel: 'On-demand', drawdownType: 'Trailing', discountPercent: 28, couponCode: 'MFF28', challengeFee: 179, expiryDate: '2026-04-02', verified: true, claimUrl: 'https://example.com/mff-2' },
  { id: 'd13', firmId: 'ftmo', firmName: 'FTMO', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Monthly', drawdownType: 'Static', discountPercent: 10, couponCode: 'FTMO10', challengeFee: 155, expiryDate: '2026-04-01', verified: true, claimUrl: 'https://example.com/ftmo-2' },
  { id: 'd14', firmId: 'tradeify', firmName: 'Tradeify', marketType: 'Futures', platform: 'Tradovate', payoutModel: 'Weekly', drawdownType: 'Static', discountPercent: 17, couponCode: 'TR17', challengeFee: 159, expiryDate: '2026-04-06', verified: true, claimUrl: 'https://example.com/tradeify-2' },
  { id: 'd15', firmId: 'fundednext', firmName: 'FundedNext', marketType: 'Forex', platform: 'MetaTrader 5', payoutModel: 'Weekly', drawdownType: 'Static', discountPercent: 26, couponCode: 'NEXT26', challengeFee: 99, expiryDate: '2026-04-08', verified: true, claimUrl: 'https://example.com/fundednext-2' },
]

export const faqItems: FaqItem[] = [
  { question: 'How are deals verified?', answer: 'Each deal is manually checked against public checkout pages and then stamped with a verification timestamp in our editorial queue.' },
  { question: 'How often is this page updated?', answer: 'The deal board is reviewed daily and refreshed faster if firms publish urgent promo changes.' },
  { question: 'Can I filter for futures only?', answer: 'Yes. Use the Market Type filter and select Futures to narrow all cards and comparison rows.' },
  { question: 'What does drawdown type mean?', answer: 'Drawdown type explains how loss limits are measured. Trailing, static, and end-of-day each impact strategy differently.' },
  { question: 'Do you include expired offers?', answer: 'Expired deals are automatically excluded from the featured board to keep the page actionable.' },
  { question: 'Can I trust the ratings?', answer: 'Ratings are modeled for demo content in this mock setup. Replace with your production scoring logic when API data is connected.' },
  { question: 'Is this financial advice?', answer: 'No. The page is an informational comparison and discount directory. Final decisions remain your responsibility.' },
  { question: 'Why do some links use affiliate tracking?', answer: 'Some external claim links may include referral parameters. This helps fund maintenance while keeping tools free.' },
  { question: 'How do I compare payout models?', answer: 'Sort the table by payout frequency and profit split, then filter by drawdown type to match your risk profile.' },
  { question: 'Can I plug in live API data later?', answer: 'Yes. The page uses typed mock structures designed to be swapped with API fetchers without UI rewrites.' },
]
