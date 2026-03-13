import { streamObject } from "ai";
import { NextRequest } from "next/server";
import { tradeSchema } from "./schema";
import { z } from 'zod/v3';
import { apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, logAiRequest } from "@/lib/ai/telemetry";
import { guardAiRequest } from "@/lib/ai/route-guard";

export const maxDuration = 30;
const MAX_FORMAT_BODY_BYTES = 512 * 1024;
const formatTradesRateLimit = rateLimit({ limit: 20, window: 60_000, identifier: "ai-format-trades" });

const requestSchema = z.object({
  headers: z.array(z.string()).max(100, "Too many headers to process"),
  rows: z.array(z.array(z.string())).max(100, "Too many rows to process")
});

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("mappings");
  const startedAt = Date.now();

  const guard = await guardAiRequest(req, 'format-trades', formatTradesRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const lengthHeader = req.headers.get("content-length");
    const contentLength = lengthHeader ? Number(lengthHeader) : 0;
    if (Number.isFinite(contentLength) && contentLength > MAX_FORMAT_BODY_BYTES) {
      return apiError(
        "PAYLOAD_TOO_LARGE",
        `Request body exceeds ${Math.round(MAX_FORMAT_BODY_BYTES / 1024)}KB.`,
        413,
      );
    }

    const body = await req.json();
    const { headers, rows } = requestSchema.parse(body);

    const result = streamObject({
      model: getAiLanguageModel("mappings"),
      schema: tradeSchema,
      output: 'array',
      system:`
      You are a trading expert.
      You are given a list of trade data and you need to format it according to the schema.
      Rules for formatting:
      Do not make up any information. Use ONLY the data provided in the input.
      
      1. Instrument names - Apply these transformations:
        - CFD Instruments (crypto, forex, commodities): KEEP FULL NAMES
          * BTCUSD → BTCUSD (NOT BTC)
          * XAUUSD → XAUUSD (NOT XAU)
          * EURNZD → EURNZD (NOT EUR)
          * GBPNZD → GBPNZD (NOT GBP)
          * XAGUSD → XAGUSD (NOT XAG)
          * XPTUSD → XPTUSD (NOT XPT)
          * XPDUSD → XPDUSD (NOT XPD)
          * ADAUSD → ADAUSD (NOT ADA)
          * SOLUSD → SOLUSD (NOT SOL)
        - Futures with .cash suffix: REMOVE .cash suffix
          * US100.cash → US100
          * AUS200.cash → AUS200
          * GER40.cash → GER40
          * FRA40.cash → FRA40
          * JP225.cash → JP225
          * USOIL.cash → USOIL
        - Futures contracts with month/year codes: TRIM to base symbol
          * ESZ5 → ES
          * NQZ5 → NQ
          * CLZ5 → CL
          * GCZ5 → GC
        - Continuous contracts with .c suffix: REMOVE .c suffix
          * SOYBEAN.c → SOYBEAN
          * SUGAR.c → SUGAR
          * COFFEE.c → COFFEE
          * COTTON.c → COTTON
        - Stocks and other instruments: KEEP AS-IS
          * T → T
          * AAPL → AAPL
      
      2. Convert all numeric values to numbers (remove currency symbols, commas)
      
      3. Convert dates to ISO strings
      
      4. If accountNumber is provided, use it as the accountNumber
      
      5. Determine trade side based on:
         - If side is provided: use it directly (normalize 'buy'/'long'/'b' to 'long', 'sell'/'short'/'s' to 'short')
         - If not provided: determine from entry/close dates and prices when available
      
      6. Convert time in position to seconds
      
      7. PnL (Profit/Loss) mapping - CRITICAL:
         - Use the "Profit" column for PnL values, NOT "Pips"
         - PnL should be the actual monetary profit/loss amount
         - Pips are price movement units, not monetary values
         - If "Profit" column exists, use that value directly
         - Do NOT calculate or estimate PnL - use only the provided data
      
      8. Handle missing values appropriately:
        - If a required field is missing from the data, omit it rather than making up values
        - Only populate fields that have actual data in the input
      
      9. Required fields (only if data is available):
        - entryPrice (string)
        - closePrice (string)
        - commission (number) can be 0 if not available
        - quantity (number)
        - pnl (number) - use "Profit" column, not "Pips"
        - side (string)
        - entryDate (ISO string)
        - closeDate (ISO string)
        - instrument (string)
        - accountNumber (string)
      `,
      prompt:  `
      Format the following ${rows.length} trades data.
      Headers: ${headers.join(", ")}
      Rows:
      ${rows.map((row: string[]) => row.join(", ")).join("\n")}
    `,
      temperature: policy.temperature,
    });

    void logAiRequest({
      route: "/api/ai/format-trades",
      feature: "mappings",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: true,
      finishReason: "stream_started",
      sampleRate: policy.logSampleRate,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return apiError("BAD_REQUEST", "Malformed JSON request body", 400);
    }

    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid request format", 400, {
        issues: error.errors,
      });
    }

    const err = error as { statusCode?: number; type?: string; code?: unknown };

    void logAiRequest({
      route: "/api/ai/format-trades",
      feature: "mappings",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: err.code != null ? String(err.code) : null,
      sampleRate: 1,
    });

    if (err?.statusCode === 429 || err?.type === "rate_limit_exceeded") {
      return apiError("RATE_LIMITED", "AI service is temporarily busy. Please try again.", 429);
    }

    if (typeof err?.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
      return apiError("SERVICE_UNAVAILABLE", "AI service is temporarily unavailable.", 503);
    }

    return apiError("INTERNAL_ERROR", "Failed to format trades", 500);
  }
}
