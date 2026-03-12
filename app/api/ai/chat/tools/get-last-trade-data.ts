import { parsePositionTime } from "@/lib/utils";
import { getAiTrades } from "@/lib/ai/trade-access";
import { getUserId } from "@/server/auth";
import { tool } from "ai";
import { z } from 'zod/v3';



export const getLastTradesData = tool({
    description: `
        Get last trades from user on a given timeframe.
        This can be useful to understand which instrument he is currently trading or trading time,
        make sure to provide an accountNumber because trades are grouped by accountNumber
        `,
    inputSchema: z.object({
        number: z.number().describe('Number of trades to retrieve'),
        startDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z').optional(),
        endDate: z.string().describe('Date string in format 2025-01-14T14:33:01.000Z').optional(),
        accountNumber: z.string().describe('Account number, default to most traded account'),
    }),
    execute: async ({ number, startDate, endDate, accountNumber }) => {
        const safeNumber = Math.min(50, Math.max(1, Math.floor(number)));
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
        if (startDate) {
            trades = trades.filter(trade => new Date(trade.entryDate) >= (parsedStart as Date));
        }
        if (endDate) {
            trades = trades.filter(trade => new Date(trade.entryDate) <= (parsedEnd as Date));
        }
        trades = trades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        trades = trades.slice(0, safeNumber);
        const items = trades.map(trade => ({
            ...trade,
            timeInPosition: parsePositionTime(Number(trade.timeInPosition))
        }));
        return {
            items,
            truncated,
            dataQualityWarning,
        };
    }
})
