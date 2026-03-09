import { generateTradeHash } from "./utils";
import type { ImportTradeDraft } from "./trade-types";
import { toImportTradeDraft } from "./trade-types";

/**
 * Creates an import trade payload with schema-like defaults applied.
 * Mirrors the @default() values from schema.prisma
 */
export function createTradeWithDefaults(input: Partial<ImportTradeDraft>): ImportTradeDraft {
  const normalized = toImportTradeDraft(input);
  return {
    ...normalized,
    id: normalized.id || generateTradeHash(normalized),
    accountNumber: normalized.accountNumber || "",
    instrument: normalized.instrument || "",
    side: normalized.side || "",
    quantity: normalized.quantity ?? 0,
    entryPrice: normalized.entryPrice ?? 0,
    closePrice: normalized.closePrice ?? 0,
    entryDate: normalized.entryDate || new Date().toISOString(),
    closeDate: normalized.closeDate || new Date().toISOString(),
    pnl: normalized.pnl ?? 0,
    commission: normalized.commission ?? 0,
    timeInPosition: normalized.timeInPosition ?? 0,
    entryId: normalized.entryId || null,
    closeId: normalized.closeId || null,
    comment: normalized.comment || "",
    imageBase64: normalized.imageBase64 || null,
    createdAt: normalized.createdAt || new Date(),
    userId: normalized.userId || "",
    tags: normalized.tags || [],
    videoUrl: normalized.videoUrl || null,
    imageBase64Second: normalized.imageBase64Second || null,
    groupId: normalized.groupId || null,
    images: normalized.images || [],
  };
}
