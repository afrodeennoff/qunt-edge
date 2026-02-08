import { Trade as PrismaTrade } from "@/prisma/generated/prisma";

const INSTRUMENTS = ["ES", "NQ", "CL", "GC", "YM"] as const;
const SIDES = ["long", "short"] as const;
const ACCOUNT_NUMBERS = ["SIM-1001", "PA-2001"] as const;

function valueFromSeed(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const normalized = x - Math.floor(x);
  return min + normalized * (max - min);
}

export function generateMockTrades(userId: string, count = 60): PrismaTrade[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const daysAgo = Math.floor(valueFromSeed(seed, 0, 40));
    const hourOffset = Math.floor(valueFromSeed(seed + 100, 8, 20));
    const minuteOffset = Math.floor(valueFromSeed(seed + 200, 0, 59));
    const quantity = Math.max(1, Math.floor(valueFromSeed(seed + 300, 1, 5)));

    const entryDateObj = new Date(now - daysAgo * dayMs);
    entryDateObj.setHours(hourOffset, minuteOffset, 0, 0);

    const holdMinutes = Math.floor(valueFromSeed(seed + 400, 2, 120));
    const closeDateObj = new Date(entryDateObj.getTime() + holdMinutes * 60_000);

    const side = SIDES[Math.floor(valueFromSeed(seed + 500, 0, SIDES.length))] ?? "long";
    const instrument =
      INSTRUMENTS[Math.floor(valueFromSeed(seed + 600, 0, INSTRUMENTS.length))] ?? "ES";
    const accountNumber =
      ACCOUNT_NUMBERS[
        Math.floor(valueFromSeed(seed + 700, 0, ACCOUNT_NUMBERS.length))
      ] ?? "SIM-1001";

    const baseMove = valueFromSeed(seed + 800, -250, 450);
    const pnl = Math.round(baseMove * quantity * 100) / 100;
    const commission = Math.round(quantity * valueFromSeed(seed + 900, 1.2, 3.8) * 100) / 100;
    const entryPrice = Math.round(valueFromSeed(seed + 1000, 4000, 4200) * 100) / 100;
    const closePrice = Math.round((entryPrice + valueFromSeed(seed + 1100, -30, 30)) * 100) / 100;

    return {
      id: `mock-trade-${seed}`,
      accountNumber,
      userId,
      instrument,
      side,
      quantity,
      entryPrice,
      closePrice,
      pnl,
      commission,
      entryId: `E-${seed}`,
      closeId: `C-${seed}`,
      entryDate: entryDateObj.toISOString(),
      closeDate: closeDateObj.toISOString(),
      timeInPosition: holdMinutes * 60,
      comment: seed % 5 === 0 ? "Mock trade note for UI preview" : null,
      tags: seed % 4 === 0 ? ["A+", "breakout"] : [],
      groupId: "",
      imageBase64: null,
      imageBase64Second: null,
      images: [],
      videoUrl: null,
      createdAt: new Date(now - daysAgo * dayMs),
    };
  });
}
