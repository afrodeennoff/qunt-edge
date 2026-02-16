import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate";
import { logger } from "@/lib/logger";

const webVitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  rating: z.string().optional(),
  delta: z.number().optional(),
  navigationType: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const metric = await parseJson(request, webVitalSchema);
    logger.info("[web-vitals] metric", metric);
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    return toValidationErrorResponse(error);
  }
}
