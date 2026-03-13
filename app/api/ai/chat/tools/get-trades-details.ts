import { getAiTrades } from "@/lib/ai/trade-access";
import { getUserId } from "@/server/auth";
import { tool } from "ai";
import { z } from 'zod/v3';


export const getTradesDetails = tool({
    description: 'Only use this tool if the user asks for trade details. Get trade details for a maximum of 10 trades with specific filters',
    inputSchema: z.object({
        instrument: z.string().describe('Instrument').optional(),
        startDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z').optional(),
        endDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z').optional(),
        accountNumber: z.string().describe('Account number').optional(),
        side: z.string().describe('Side').optional(),
    }),
    execute: async ({ instrument, startDate, endDate, accountNumber, side }: { instrument?: string, startDate?: string, endDate?: string, accountNumber?: string, side?: string }) => {
        const parsedStart = startDate ? new Date(startDate) : null;
        const parsedEnd = endDate ? new Date(endDate) : null;
        if (parsedStart && Number.isNaN(parsedStart.getTime())) {
            throw new Error("Invalid startDate format");
        }
        if (parsedEnd && Number.isNaN(parsedEnd.getTime())) {
            throw new Error("Invalid endDate format");
        }
        const userId = await getUserId();
        const { trades: allTrades, truncated, dataQualityWarning } = await getAiTrades({ userId, profile: 'detail' });
        let trades = allTrades || [];
        if (accountNumber) {
            trades = trades.filter(trade => trade.accountNumber === accountNumber);
        }
        if (instrument) {
            trades = trades.filter(trade => trade.instrument === instrument);
        }
        if (startDate) {
            trades = trades.filter(trade => new Date(trade.entryDate) >= (parsedStart as Date));
        }
        if (endDate) {
            trades = trades.filter(trade => new Date(trade.entryDate) <= (parsedEnd as Date));
        }
        if (side) {
            trades = trades.filter(trade => trade.side === side);
        }
        const items = trades.slice(0, 10).map(trade => ({
            accountNumber: trade.accountNumber,
            instrument: trade.instrument,
            entryDate: trade.entryDate,
            closeDate: trade.closeDate,
            pnl: trade.pnl,
            commission: trade.commission,
            side: trade.side,
            quantity: trade.quantity,
            entryPrice: trade.entryPrice,
            closePrice: trade.closePrice,
        }));
        return {
            items,
            truncated,
            dataQualityWarning,
        };
    }
})
