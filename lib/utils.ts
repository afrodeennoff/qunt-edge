import type { Trade } from "@/lib/data-types"
import Decimal from "decimal.js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { formatInTimeZone } from 'date-fns-tz'
import { StatisticsProps, Account } from "@/lib/data-types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePositionTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutesLeft = Math.floor((timeInSeconds - (hours * 3600)) / 60);
  const secondsLeft = Math.floor(timeInSeconds - (hours * 3600) - (minutesLeft * 60));

  if (isNaN(hours) || isNaN(minutesLeft) || isNaN(secondsLeft)) {
    return '0';
  }

  const formattedTime = [
    hours > 0 ? `${hours}h` : '',
    `${minutesLeft}m`,
    `${secondsLeft}s`
  ].filter(Boolean).join(' ');

  return formattedTime;
}

export function calculateStatistics(trades: Trade[], accounts: Account[] = []): StatisticsProps {
  if (!trades.length) {
    return {
      cumulativeFees: 0,
      cumulativePnl: 0,
      winningStreak: 0,
      winRate: 0,
      nbTrades: 0,
      nbBe: 0,
      nbWin: 0,
      nbLoss: 0,
      totalPositionTime: 0,
      averagePositionTime: '0s',
      profitFactor: 1,
      grossLosses: 0,
      grossWin: 0,
      totalPayouts: 0,
      nbPayouts: 0,
    }
  }

  let cumulativeFees = new Decimal(0);
  let cumulativePnl = new Decimal(0);
  let grossWin = new Decimal(0);
  let grossLosses = new Decimal(0);
  let totalPositionTime = new Decimal(0);
  let nbWin = 0;
  let nbLoss = 0;
  let nbBe = 0;
  let winningStreak = 0;
  let currentStreak = 0;

  trades.forEach((trade) => {
    const pnl = new Decimal(trade.pnl);
    const commission = new Decimal(trade.commission || 0);
    const timeInPos = new Decimal(trade.timeInPosition || 0);

    cumulativePnl = cumulativePnl.plus(pnl);
    cumulativeFees = cumulativeFees.plus(commission);
    totalPositionTime = totalPositionTime.plus(timeInPos);

    if (pnl.isZero()) {
      nbBe++;
      currentStreak = 0;
    } else if (pnl.isPositive()) {
      nbWin++;
      currentStreak++;
      winningStreak = Math.max(winningStreak, currentStreak);
      grossWin = grossWin.plus(pnl);
    } else {
      nbLoss++;
      currentStreak = 0;
      grossLosses = grossLosses.plus(pnl.abs());
    }
  });

  const totalTrades = nbWin + nbLoss;
  const winRate = totalTrades > 0 ? (nbWin / totalTrades) * 100 : 0;
  const profitFactor = grossLosses.isZero() ? (grossWin.isZero() ? 1 : 100) : grossWin.dividedBy(grossLosses).toNumber();

  const statistics: StatisticsProps = {
    cumulativeFees: cumulativeFees.toNumber(),
    cumulativePnl: cumulativePnl.toNumber(),
    winningStreak,
    winRate,
    nbTrades: trades.length,
    nbBe,
    nbWin,
    nbLoss,
    totalPositionTime: totalPositionTime.toNumber(),
    averagePositionTime: parsePositionTime(totalPositionTime.dividedBy(trades.length).toNumber()),
    profitFactor,
    grossLosses: grossLosses.toNumber(),
    grossWin: grossWin.toNumber(),
    totalPayouts: 0,
    nbPayouts: 0,
  };

  const tradeAccountNumbers = new Set(trades.map(trade => trade.accountNumber));
  let totalPayouts = new Decimal(0);
  let nbPayouts = 0;

  accounts.forEach(account => {
    if (tradeAccountNumbers.has(account.number)) {
      const payouts = account.payouts || [];
      payouts.forEach(payout => {
        const payoutDate = new Date(payout.date);
        if (!account.resetDate || payoutDate >= new Date(account.resetDate)) {
          totalPayouts = totalPayouts.plus(new Decimal(payout.amount));
          nbPayouts++;
        }
      });
    }
  });

  statistics.totalPayouts = totalPayouts.toNumber();
  statistics.nbPayouts = nbPayouts;

  return statistics;
}

export function formatCalendarData(trades: Trade[], accounts: Account[] = []) {
  return trades.reduce((acc: any, trade: Trade) => {
    let date = '';
    try {
      const rawDate = trade.entryDate;
      if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
        date = formatInTimeZone(rawDate, 'UTC', 'yyyy-MM-dd');
      } else if (typeof rawDate === 'string') {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          date = formatInTimeZone(parsedDate, 'UTC', 'yyyy-MM-dd');
        } else {
          return acc;
        }
      } else {
        return acc;
      }
    } catch (e) {
      return acc;
    }

    if (!acc[date]) {
      acc[date] = { pnl: new Decimal(0), tradeNumber: 0, longNumber: 0, shortNumber: 0, trades: [] }
    }
    acc[date].tradeNumber++
    const netPnl = new Decimal(trade.pnl).minus(new Decimal(trade.commission || 0));
    acc[date].pnl = acc[date].pnl.plus(netPnl);

    const entryTime = new Date(trade.entryDate).getTime();
    const closeTime = trade.closeDate ? new Date(trade.closeDate).getTime() : 0;
    const isLong = trade.side
      ? (trade.side.toLowerCase() === 'long' || trade.side.toLowerCase() === 'buy' || trade.side.toLowerCase() === 'b')
      : (entryTime < closeTime)

    acc[date].longNumber += isLong ? 1 : 0
    acc[date].shortNumber += isLong ? 0 : 1
    acc[date].trades.push(trade)
    return acc
  }, {})
}

export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key] as string] = result[currentValue[key] as string] || []).push(
      currentValue
    );
    return result;
  }, {} as { [key: string]: T[] });
}

export function calculateTradingDays(trades: Trade[], minPnlToCountAsDay?: number | string | Decimal | null): {
  totalTradingDays: number;
  validTradingDays: number;
  dailyPnL: { [date: string]: Decimal };
} {
  if (!trades.length) {
    return {
      totalTradingDays: 0,
      validTradingDays: 0,
      dailyPnL: {}
    };
  }

  const dailyPnL: { [date: string]: Decimal } = {};

  trades.forEach(trade => {
    const tradeDate = trade.entryDate;
    const dateKey = tradeDate.toISOString().split('T')[0];

    if (!dailyPnL[dateKey]) {
      dailyPnL[dateKey] = new Decimal(0);
    }

    const netPnl = new Decimal(trade.pnl).minus(new Decimal(trade.commission || 0));
    dailyPnL[dateKey] = dailyPnL[dateKey].plus(netPnl);
  });

  const totalTradingDays = Object.keys(dailyPnL).length;
  let validTradingDays = totalTradingDays;

  if (minPnlToCountAsDay !== null && minPnlToCountAsDay !== undefined) {
    const threshold = new Decimal(minPnlToCountAsDay);
    if (threshold.gt(0)) {
      validTradingDays = Object.values(dailyPnL).filter(dpnl => dpnl.gte(threshold)).length;
    }
  }

  return {
    totalTradingDays,
    validTradingDays,
    dailyPnL
  };
}

export function generateTradeHash(trade: {
  quantity?: unknown
  entryDate?: unknown
  closeDate?: unknown
  timeInPosition?: unknown
  accountNumber?: unknown
  instrument?: unknown
  userId?: unknown
  entryId?: unknown
  closeId?: unknown
}): string {
  // Handle undefined values by converting them to empty strings or default values
  const hashString = `${trade.userId || ''}-${trade.accountNumber || ''}-${trade.instrument || ''}-${trade.entryDate || ''}-${trade.closeDate || ''}-${trade.quantity || 0}-${trade.entryId || ''}-${trade.closeId || ''}-${trade.timeInPosition || 0}`
  return hashString
}

export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}
