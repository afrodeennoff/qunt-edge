import { Trade } from "@/prisma/generated/prisma";

export interface CalendarEntry {
  pnl: number;
  tradeNumber: number;
  longNumber: number;
  shortNumber: number;
  trades: Trade[];
}

export interface CalendarData {
  [date: string]: CalendarEntry;
}
