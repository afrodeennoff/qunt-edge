import { z } from 'zod'

export const accountNumberSchema = z.string().min(1).max(255).regex(/^[a-zA-Z0-9-_]+$/)

export const tradeSchema = z.object({
  accountNumber: accountNumberSchema,
  instrument: z.string().min(1).max(100),
  entryDate: z.string().datetime(),
  closeDate: z.string().datetime(),
  entryPrice: z.number().finite(),
  closePrice: z.number().finite(),
  quantity: z.number().positive(),
  side: z.enum(['Long', 'Short', 'long', 'short', 'LONG', 'SHORT']),
  pnl: z.number().finite(),
  timeInPosition: z.number().int().nonnegative().optional(),
  commission: z.number().finite().optional(),
  tags: z.array(z.string()).optional(),
  comment: z.string().max(10000).optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  entryId: z.string().optional().nullable(),
  closeId: z.string().optional().nullable(),
})

export const propfirmSchema = z.object({
  name: z.string().min(1).max(255),
  accountId: accountNumberSchema.optional(),
  resetDate: z.string().datetime().optional(),
  group: z.string().max(100).optional(),
})

export const teamInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).default('member'),
  teamId: z.string().uuid(),
})

export const etpOrderSchema = z.object({
  OrderId: z.string(),
  AccountId: accountNumberSchema,
  OrderAction: z.enum(['BUY', 'SELL', 'Buy', 'Sell']),
  Quantity: z.number().finite(),
  AverageFilledPrice: z.number().finite(),
  IsOpeningOrder: z.boolean(),
  Time: z.string().datetime(),
  Instrument: z.object({
    Symbol: z.string(),
    Type: z.string(),
  }),
})

export const thorTradeSchema = z.object({
  account_id: accountNumberSchema,
  dates: z.array(z.object({
    date: z.string(),
    trades: z.array(z.object({
      symbol: z.string(),
      pnl: z.number().finite(),
      pnltick: z.number().finite(),
      entry_time: z.string(),
      exit_time: z.string(),
      entry_price: z.number().finite(),
      exit_price: z.number().finite(),
      quantity: z.number().finite(),
      side: z.enum(['Buy', 'Sell']),
    }))
  }))
})

export const webhookValidationSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
  created_at: z.string().datetime().optional(),
})

export const timeframeSchema = z.enum([
  'today',
  'yesterday',
  'currentWeek',
  'lastWeek',
  'currentMonth',
  'lastMonth',
  'currentQuarter',
  'lastQuarter',
  'currentYear',
  'lastYear',
  'allTime',
  'custom'
])

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export function validateTradeData(data: unknown) {
  return tradeSchema.safeParse(data)
}

export function validateAccountNumber(accountNumber: unknown) {
  return accountNumberSchema.safeParse(accountNumber)
}

export function validateWebhookEvent(data: unknown) {
  return webhookValidationSchema.safeParse(data)
}
