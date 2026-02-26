import { getAllTradesForAi } from "@/lib/ai/get-all-trades";
import { tool } from "ai";
import { z } from 'zod/v3';


export const getMostTradedInstruments = tool({
    description: 'Get the most traded instruments',
    inputSchema: z.object({}),
    execute: async () => {
        const tradesResult = await getAllTradesForAi();
    const allTrades = tradesResult.trades;
        const instruments = allTrades.map(trade => trade.instrument);
        const instrumentCount = instruments.reduce((acc, instrument) => {
            acc[instrument] = (acc[instrument] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const items = Object.entries(instrumentCount)
            .sort((a, b) => b[1] - a[1])
            .map(([instrument, count]) => ({ instrument, count }));
        return {
            items,
            truncated: tradesResult.truncated,
            dataQualityWarning: tradesResult.dataQualityWarning,
        };
    }
})
