import {
    Trade as PrismaTrade,
    Group as PrismaGroup,
    Account as PrismaAccount,
    Payout as PrismaPayout,
    Prisma,
} from "@/prisma/generated/prisma";
import Decimal from "decimal.js";

export type StatisticsProps = {
    cumulativeFees: number;
    cumulativePnl: number;
    winningStreak: number;
    winRate: number;
    nbTrades: number;
    nbBe: number;
    nbWin: number;
    nbLoss: number;
    totalPositionTime: number;
    averagePositionTime: string;
    profitFactor: number;
    grossLosses: number;
    grossWin: number;
    totalPayouts: number;
    nbPayouts: number;
};

export type CalendarData = {
    [date: string]: {
        pnl: number;
        tradeNumber: number;
        longNumber: number;
        shortNumber: number;
        trades: Trade[];
    };
};

export interface DateRange {
    from?: Date;
    to?: Date;
}

export interface TickRange {
    min: number | undefined;
    max: number | undefined;
}

export interface PnlRange {
    min: number | undefined;
    max: number | undefined;
}

export interface TimeRange {
    range: string | null;
}

export interface TickFilter {
    value: string | null;
}

export interface WeekdayFilter {
    days: number[];
}

export interface HourFilter {
    hour: number | null;
}

export interface TagFilter {
    tags: string[];
}

export interface Group extends Omit<PrismaGroup, "accounts"> {
    accounts: Account[];
}

export type AccountDecimalFields =
    | "startingBalance"
    | "balanceRequired"
    | "drawdownThreshold"
    | "dailyLoss"
    | "profitTarget"
    | "buffer"
    | "trailingStopProfit"
    | "minPayout"
    | "profitSharing"
    | "payoutBonus"
    | "consistencyPercentage"
    | "minPnlToCountAsDay"
    | "activationFees"
    | "price"
    | "priceWithPromo"
    | "promoPercentage";

export type AccountPayout = Omit<PrismaPayout, "amount"> & {
    amount: number;
};

export type AccountBase = Omit<PrismaAccount, AccountDecimalFields | "group" | "payouts" | "trades" | "dailyMetrics"> & {
    startingBalance: number;
    balanceRequired: number | null;
    drawdownThreshold: number;
    dailyLoss: number;
    profitTarget: number;
    buffer: number;
    trailingStopProfit: number | null;
    minPayout: number | null;
    profitSharing: number | null;
    payoutBonus: number | null;
    consistencyPercentage: number | null;
    minPnlToCountAsDay: number | null;
    activationFees: number | null;
    price: number | null;
    priceWithPromo: number | null;
    promoPercentage: number | null;
};

export interface Account extends AccountBase {
    payouts?: AccountPayout[];
    balanceToDate?: number;
    group?: PrismaGroup | null;
    aboveBuffer?: number;
    trades?: Trade[];

    metrics?: {
        currentBalance: number;
        remainingToTarget: number;
        progress: number;
        isConfigured: boolean;
        drawdownProgress: number;
        remainingLoss: number;
        highestBalance: number;
        drawdownLevel: number;
        totalProfit: number;
        maxAllowedDailyProfit: number | null;
        highestProfitDay: number;
        isConsistent: boolean;
        hasProfitableData: boolean;
        dailyPnL: { [key: string]: number };
        totalProfitableDays: number;
        totalTradingDays: number;
        validTradingDays: number;
    };

    dailyMetrics?: Array<{
        date: Date;
        pnl: number;
        totalBalance: number;
        percentageOfTarget: number;
        isConsistent: boolean;
        payout?: {
            id: string;
            amount: number;
            date: Date;
            status: string;
        };
    }>;
}

export type TradeDecimalFields =
    | "entryPrice"
    | "closePrice"
    | "pnl"
    | "commission"
    | "quantity"
    | "timeInPosition";

export type TradeBase = Omit<PrismaTrade, TradeDecimalFields | "trades"> & {
    entryPrice: number;
    closePrice: number | null;
    pnl: number;
    commission: number | null;
    quantity: number;
    timeInPosition: number | null;
};

export interface Trade extends TradeBase {
    trades?: Trade[];
}

export type SerializedTrade = Omit<PrismaTrade, TradeDecimalFields | "entryDate" | "closeDate"> & {
    entryPrice: string;
    closePrice: string | null;
    pnl: string;
    commission: string | null;
    quantity: string;
    timeInPosition: string | null;
    entryDate: string;
    closeDate: string | null;
};

export type TradeInput = (
    Omit<PrismaTrade, TradeDecimalFields | "trades" | "entryDate" | "closeDate"> & {
        entryPrice?: number | Decimal | Prisma.Decimal | string;
        closePrice?: number | Decimal | Prisma.Decimal | string | null;
        pnl?: number | Decimal | Prisma.Decimal | string;
        commission?: number | Decimal | Prisma.Decimal | string | null;
        quantity?: number | Decimal | Prisma.Decimal | string;
        timeInPosition?: number | Decimal | Prisma.Decimal | string | null;
        entryDate: Date | string;
        closeDate?: Date | string | null;
        trades?: TradeInput[];
        tags?: string[];
    }
)

export type AccountInput = (
    Omit<PrismaAccount, AccountDecimalFields | "group" | "payouts" | "trades" | "dailyMetrics" | "createdAt" | "updatedAt" | "resetDate"> & {
        startingBalance?: number | Decimal | Prisma.Decimal | string;
        balanceRequired?: number | Decimal | Prisma.Decimal | string | null;
        drawdownThreshold?: number | Decimal | Prisma.Decimal | string;
        dailyLoss?: number | Decimal | Prisma.Decimal | string;
        profitTarget?: number | Decimal | Prisma.Decimal | string;
        buffer?: number | Decimal | Prisma.Decimal | string;
        trailingStopProfit?: number | Decimal | Prisma.Decimal | string | null;
        minPayout?: number | Decimal | Prisma.Decimal | string | null;
        profitSharing?: number | Decimal | Prisma.Decimal | string | null;
        payoutBonus?: number | Decimal | Prisma.Decimal | string | null;
        consistencyPercentage?: number | Decimal | Prisma.Decimal | string | null;
        minPnlToCountAsDay?: number | Decimal | Prisma.Decimal | string | null;
        activationFees?: number | Decimal | Prisma.Decimal | string | null;
        price?: number | Decimal | Prisma.Decimal | string | null;
        priceWithPromo?: number | Decimal | Prisma.Decimal | string | null;
        promoPercentage?: number | Decimal | Prisma.Decimal | string | null;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        resetDate?: Date | string | null;
        payouts?: (PrismaPayout | AccountPayout)[]
        dailyMetrics?: Account["dailyMetrics"]
        metrics?: Account["metrics"]
        balanceToDate?: number
        aboveBuffer?: number
        trades?: TradeInput[]
        group?: PrismaGroup | null
    }
)

export type GroupInput = (Omit<PrismaGroup, "accounts"> & {
    accounts: AccountInput[]
})

import { decimalToNumber } from "./trade-types";

export function normalizeTradeForClient(trade: TradeInput | SerializedTrade): Trade {
    const raw = trade as any;
    return {
        ...raw,
        entryPrice: decimalToNumber(raw.entryPrice),
        closePrice: decimalToNumber(raw.closePrice, null),
        pnl: decimalToNumber(raw.pnl),
        commission: decimalToNumber(raw.commission, null),
        quantity: decimalToNumber(raw.quantity),
        timeInPosition: decimalToNumber(raw.timeInPosition, null),
        entryDate: raw.entryDate instanceof Date ? raw.entryDate : new Date(raw.entryDate),
        closeDate: raw.closeDate ? (raw.closeDate instanceof Date ? raw.closeDate : new Date(raw.closeDate)) : null,
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        trades: Array.isArray(raw.trades) ? raw.trades.map(normalizeTradeForClient) : [],
    } as Trade;
}

export function normalizeTradesForClient(trades: (TradeInput | SerializedTrade)[]): Trade[] {
    return trades.map(normalizeTradeForClient);
}

export function normalizePayoutForClient(
    payout: PrismaPayout | AccountPayout
): AccountPayout {
    return {
        ...payout,
        amount: decimalToNumber(payout.amount),
    }
}

export function normalizeAccountForClient(account: AccountInput): Account {
    const raw = account as AccountInput
    const normalized = {
        ...raw,
        startingBalance: decimalToNumber(raw.startingBalance),
        balanceRequired:
            raw.balanceRequired === null || raw.balanceRequired === undefined
                ? null
                : decimalToNumber(raw.balanceRequired),
        drawdownThreshold: decimalToNumber(raw.drawdownThreshold),
        dailyLoss: decimalToNumber(raw.dailyLoss),
        profitTarget: decimalToNumber(raw.profitTarget),
        buffer: decimalToNumber(raw.buffer),
        trailingStopProfit:
            raw.trailingStopProfit === null || raw.trailingStopProfit === undefined
                ? null
                : decimalToNumber(raw.trailingStopProfit),
        minPayout:
            raw.minPayout === null || raw.minPayout === undefined
                ? null
                : decimalToNumber(raw.minPayout),
        profitSharing:
            raw.profitSharing === null || raw.profitSharing === undefined
                ? null
                : decimalToNumber(raw.profitSharing),
        payoutBonus:
            raw.payoutBonus === null || raw.payoutBonus === undefined
                ? null
                : decimalToNumber(raw.payoutBonus),
        consistencyPercentage:
            raw.consistencyPercentage === null || raw.consistencyPercentage === undefined
                ? null
                : decimalToNumber(raw.consistencyPercentage),
        minPnlToCountAsDay:
            raw.minPnlToCountAsDay === null || raw.minPnlToCountAsDay === undefined
                ? null
                : decimalToNumber(raw.minPnlToCountAsDay),
        activationFees:
            raw.activationFees === null || raw.activationFees === undefined
                ? null
                : decimalToNumber(raw.activationFees),
        price:
            raw.price === null || raw.price === undefined
                ? null
                : decimalToNumber(raw.price),
        priceWithPromo:
            raw.priceWithPromo === null || raw.priceWithPromo === undefined
                ? null
                : decimalToNumber(raw.priceWithPromo),
        promoPercentage:
            raw.promoPercentage === null || raw.promoPercentage === undefined
                ? null
                : decimalToNumber(raw.promoPercentage),
        resetDate: raw.resetDate ? new Date(raw.resetDate as string | Date) : null,
        createdAt: new Date(raw.createdAt as string | Date),
        updatedAt: new Date(raw.updatedAt as string | Date),
        payouts: Array.isArray(raw.payouts) ? raw.payouts.map(normalizePayoutForClient) : [],
        trades: Array.isArray(raw.trades) ? raw.trades.map(normalizeTradeForClient) : [],
    } as Account
    return normalized
}

export function normalizeAccountsForClient(accounts: AccountInput[]): Account[] {
    return accounts.map(normalizeAccountForClient);
}

export function normalizeGroupsForClient(groups: GroupInput[]): Group[] {
    return groups.map((group) => ({
        ...group,
        accounts: normalizeAccountsForClient(group.accounts),
    })) as Group[];
}
