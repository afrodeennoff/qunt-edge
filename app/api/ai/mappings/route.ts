import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { mappingSchema } from "./schema";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";

export const maxDuration = 30;

const MappingOnlySchema = mappingSchema.omit({ quality: true });
type MappingOnly = z.infer<typeof MappingOnlySchema>;

type MappingQuality = {
  score: number;
  warnings: string[];
  usedFallback: boolean;
};

const REQUIRED_FIELDS: Array<keyof MappingOnly> = [
  "instrument",
  "quantity",
  "entryPrice",
  "closePrice",
  "entryDate",
  "closeDate",
  "pnl",
];

const NUMERIC_FIELDS: Array<keyof MappingOnly> = [
  "quantity",
  "entryPrice",
  "closePrice",
  "pnl",
  "timeInPosition",
  "commission",
];

const DATE_FIELDS: Array<keyof MappingOnly> = ["entryDate", "closeDate"];

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseMappedSource(raw: string | null | undefined): { source: string; index?: number } | null {
  if (!raw) return null;
  const match = raw.match(/^(.+)_([0-9]+)$/);
  if (!match) return { source: raw };
  const source = match[1];
  const index = Number(match[2]);
  if (!Number.isFinite(index)) return { source: raw };
  return { source, index: index - 1 };
}

function resolveSourceValue(
  row: Record<string, string>,
  source: { source: string; index?: number } | null,
  headers: string[],
): string | null {
  if (!source) return null;
  if (typeof source.index === "number") {
    const headerAtIndex = headers[source.index];
    if (!headerAtIndex || headerAtIndex !== source.source) return null;
    return row[headerAtIndex] ?? null;
  }
  return row[source.source] ?? null;
}

function parseNumberSafe(value: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,$\s]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateSafe(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateMapping(
  mapping: MappingOnly,
  headers: string[],
  firstRows: Array<Record<string, string>>,
): MappingQuality {
  const warnings: string[] = [];
  let score = 100;

  const usedSources = new Map<string, Array<keyof MappingOnly>>();

  for (const [field, mappedHeader] of Object.entries(mapping) as Array<[keyof MappingOnly, string | null]>) {
    if (!mappedHeader) continue;
    const source = parseMappedSource(mappedHeader);
    if (!source) continue;

    const key = typeof source.index === "number" ? `${source.source}_${source.index}` : source.source;
    const current = usedSources.get(key) ?? [];
    current.push(field);
    usedSources.set(key, current);

    if (source.index !== undefined) {
      const expectedHeader = headers[source.index];
      if (expectedHeader !== source.source) {
        warnings.push(`Field ${field} points to invalid positional header ${mappedHeader}.`);
        score -= 10;
      }
    } else if (!headers.includes(source.source)) {
      warnings.push(`Field ${field} mapped to unknown header ${source.source}.`);
      score -= 8;
    }
  }

  for (const [source, fields] of usedSources.entries()) {
    if (fields.length > 1) {
      warnings.push(`Header ${source} was mapped to multiple fields: ${fields.join(", ")}.`);
      score -= 6;
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!mapping[field]) {
      warnings.push(`Missing required mapping for ${field}.`);
      score -= 8;
    }
  }

  const sampleRows = firstRows.slice(0, 5);

  for (const field of NUMERIC_FIELDS) {
    const mapped = mapping[field];
    if (!mapped) continue;
    const source = parseMappedSource(mapped);
    const validCount = sampleRows.filter((row) => parseNumberSafe(resolveSourceValue(row, source, headers)) !== null).length;
    if (sampleRows.length > 0 && validCount === 0) {
      warnings.push(`Field ${field} appears non-numeric in sampled rows.`);
      score -= 6;
    }
  }

  for (const field of DATE_FIELDS) {
    const mapped = mapping[field];
    if (!mapped) continue;
    const source = parseMappedSource(mapped);
    const validCount = sampleRows.filter((row) => parseDateSafe(resolveSourceValue(row, source, headers)) !== null).length;
    if (sampleRows.length > 0 && validCount === 0) {
      warnings.push(`Field ${field} appears non-date in sampled rows.`);
      score -= 6;
    }
  }

  const entryField = mapping.entryDate ? parseMappedSource(mapping.entryDate) : null;
  const closeField = mapping.closeDate ? parseMappedSource(mapping.closeDate) : null;
  if (entryField && closeField) {
    let orderingViolations = 0;
    for (const row of sampleRows) {
      const entryDate = parseDateSafe(resolveSourceValue(row, entryField, headers));
      const closeDate = parseDateSafe(resolveSourceValue(row, closeField, headers));
      if (entryDate && closeDate && closeDate < entryDate) {
        orderingViolations += 1;
      }
    }
    if (orderingViolations > 0) {
      warnings.push("Detected closeDate earlier than entryDate in sample rows.");
      score -= 6;
    }
  }

  return {
    score: Math.max(0, score),
    warnings,
    usedFallback: false,
  };
}

const fallbackAliases: Record<keyof MappingOnly, string[]> = {
  accountNumber: ["account", "accountnumber", "accountid"],
  instrument: ["symbol", "ticker", "instrument", "market"],
  entryId: ["entryid", "buyid", "openid"],
  closeId: ["closeid", "sellid", "exitid"],
  quantity: ["qty", "quantity", "size", "volume"],
  entryPrice: ["entryprice", "openprice", "buyprice"],
  closePrice: ["closeprice", "exitprice", "sellprice"],
  entryDate: ["entrydate", "opendate", "buydate", "entrytime"],
  closeDate: ["closedate", "exitdate", "selldate", "exittime"],
  pnl: ["pnl", "profit", "netpnl", "grosspnl"],
  timeInPosition: ["timeinposition", "duration", "holdtime"],
  side: ["side", "direction", "position"],
  commission: ["commission", "fee", "fees"],
};

function buildDeterministicFallback(headers: string[]): MappingOnly {
  const mapped = {} as MappingOnly;
  const normalized = headers.map((header) => ({
    header,
    normalized: normalizeHeader(header),
  }));

  const usedHeaders = new Set<string>();

  (Object.keys(fallbackAliases) as Array<keyof MappingOnly>).forEach((field) => {
    const aliases = fallbackAliases[field];
    const match = normalized.find((item) => {
      if (usedHeaders.has(item.header)) return false;
      return aliases.some((alias) => item.normalized.includes(alias));
    });

    mapped[field] = match ? match.header : null;
    if (match) usedHeaders.add(match.header);
  });

  return mapped;
}

function buildPrompt(fieldColumns: string[], firstRows: Array<Record<string, string>>, extraRules?: string): string {
  return (
    `You are a trading data expert. Analyze CSV columns and map them to database fields. ` +
    `Use BOTH column names and actual sample values.\n\n` +
    `Database fields:\n` +
    `- accountNumber\n- instrument\n- entryId\n- closeId\n- quantity\n- entryPrice\n- closePrice\n- entryDate\n- closeDate\n- pnl\n- timeInPosition\n- side\n- commission\n\n` +
    `Rules:\n` +
    `- If duplicate column names exist, include positional suffix: ColumnName_1, ColumnName_2\n` +
    `- Preserve exact header text in outputs\n` +
    `- Use null when uncertain\n` +
    `- Prefer date -> price -> date -> price context for entry/close fields\n` +
    `${extraRules ? `- ${extraRules}\n` : ""}\n` +
    `Column order:\n` +
    fieldColumns.map((col, index) => `${index + 1}. ${col}`).join("\n") +
    "\n\n" +
    `Sample rows:\n` +
    firstRows
      .map(
        (row, index) =>
          `Row ${index + 1}: ${Object.entries(row)
            .map(([col, val]) => `${col}: "${val}"`)
            .join(", ")}`,
      )
      .join("\n")
  );
}

async function requestMapping(prompt: string, temperature: number): Promise<{ object: MappingOnly; usage: any }> {
  const result = await generateObject({
    model: getAiLanguageModel("mappings"),
    schema: MappingOnlySchema,
    temperature,
    prompt,
  });

  return {
    object: result.object,
    usage: result.usage,
  };
}

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("mappings");
  const startedAt = Date.now();

  try {
    const body = await req.json();
    const { fieldColumns, firstRows } = typeof body === "string" ? JSON.parse(body) : body;

    if (!Array.isArray(fieldColumns) || !Array.isArray(firstRows)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const firstPrompt = buildPrompt(fieldColumns, firstRows);
    const firstPass = await requestMapping(firstPrompt, policy.temperature);
    let mapping = firstPass.object;

    let quality = validateMapping(mapping, fieldColumns, firstRows);
    let usage = firstPass.usage;

    if (quality.score < 75 || quality.warnings.length > 0) {
      const repairPrompt = buildPrompt(
        fieldColumns,
        firstRows,
        `Repair these issues from your previous mapping attempt: ${quality.warnings.join(" | ")}`,
      );

      const repaired = await requestMapping(repairPrompt, policy.temperature);
      mapping = repaired.object;
      quality = validateMapping(mapping, fieldColumns, firstRows);
      usage = repaired.usage ?? usage;
    }

    if (quality.score < 65) {
      mapping = buildDeterministicFallback(fieldColumns);
      quality = {
        ...validateMapping(mapping, fieldColumns, firstRows),
        usedFallback: true,
        warnings: [
          ...quality.warnings,
          "AI mapping confidence was low. Deterministic fallback mapping was applied.",
        ],
      };
    }

    const responsePayload = {
      ...mapping,
      quality,
    };

    void logAiRequest({
      route: "/api/ai/mappings",
      feature: "mappings",
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(usage),
      latencyMs: Date.now() - startedAt,
      toolCallsCount: 0,
      success: true,
      finishReason: "completed",
      sampleRate: policy.logSampleRate,
    });

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mappings route:", error);

    void logAiRequest({
      route: "/api/ai/mappings",
      feature: "mappings",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: (error as any)?.code ?? null,
      sampleRate: 1,
    });

    return new Response(JSON.stringify({ error: "Failed to generate mappings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
