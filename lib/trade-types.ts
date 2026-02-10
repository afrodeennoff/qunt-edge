import type { Trade } from "@/prisma/generated/prisma"

export interface ImportTradeDraft {
  id?: string
  userId?: string
  accountNumber?: string
  instrument?: string
  side?: string | null
  quantity?: number
  entryPrice?: number
  closePrice?: number | null
  pnl?: number
  commission?: number | null
  entryDate?: string
  closeDate?: string | null
  timeInPosition?: number | null
  entryId?: string | null
  closeId?: string | null
  comment?: string | null
  imageBase64?: string | null
  imageBase64Second?: string | null
  images?: string[]
  createdAt?: Date
  tags?: string[]
  videoUrl?: string | null
  groupId?: string | null
}

type DecimalLike =
  | number
  | string
  | null
  | undefined
  | {
    toNumber?: () => number
    toString?: () => string
  }

export function decimalToNumber<T extends number | null | undefined>(
  value: DecimalLike,
  fallback: T = 0 as T
): T extends number ? number : number | T {
  if (value === null || value === undefined) return fallback as any
  if (typeof value === "number") return (Number.isFinite(value) ? value : fallback) as any
  if (typeof value === "string") {
    const parsed = Number(value)
    return (Number.isFinite(parsed) ? parsed : fallback) as any
  }
  if (typeof value === "object" && typeof value.toNumber === "function") {
    const parsed = value.toNumber()
    return (Number.isFinite(parsed) ? parsed : fallback) as any
  }
  if (typeof value === "object" && typeof value.toString === "function") {
    const parsed = Number(value.toString())
    return (Number.isFinite(parsed) ? parsed : fallback) as any
  }
  return fallback as any
}

export function toUtcDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toUtcIsoString(
  value: string | Date | null | undefined,
  fallback?: string
): string | undefined {
  const date = toUtcDate(value)
  if (!date) return fallback
  return date.toISOString()
}

export function toImportTradeDraft(
  trade: Partial<Trade> | ImportTradeDraft
): ImportTradeDraft {
  return {
    id: trade.id,
    userId: trade.userId || undefined,
    accountNumber: trade.accountNumber || undefined,
    instrument: trade.instrument || undefined,
    side: trade.side ?? undefined,
    quantity: decimalToNumber((trade as Partial<Trade>).quantity ?? trade.quantity),
    entryPrice: decimalToNumber((trade as Partial<Trade>).entryPrice ?? trade.entryPrice),
    closePrice: decimalToNumber((trade as Partial<Trade>).closePrice ?? trade.closePrice),
    pnl: decimalToNumber((trade as Partial<Trade>).pnl ?? trade.pnl),
    commission: decimalToNumber((trade as Partial<Trade>).commission ?? trade.commission),
    entryDate: toUtcIsoString((trade as Partial<Trade>).entryDate ?? trade.entryDate, new Date().toISOString()),
    closeDate: toUtcIsoString((trade as Partial<Trade>).closeDate ?? trade.closeDate) ?? null,
    timeInPosition: decimalToNumber((trade as Partial<Trade>).timeInPosition ?? trade.timeInPosition),
    entryId: trade.entryId ?? null,
    closeId: trade.closeId ?? null,
    comment: trade.comment ?? null,
    imageBase64: trade.imageBase64 ?? null,
    imageBase64Second: trade.imageBase64Second ?? null,
    images: Array.isArray(trade.images) ? trade.images : [],
    createdAt: trade.createdAt instanceof Date ? trade.createdAt : undefined,
    tags: Array.isArray(trade.tags) ? trade.tags : [],
    videoUrl: trade.videoUrl ?? null,
    groupId: trade.groupId ?? null,
  }
}
