import { NextRequest, NextResponse } from "next/server";
import { webhookService } from "@/server/webhook-service";
import { whop } from "@/lib/whop";
import { logger } from "@/lib/logger";
import type { ErrorResponse } from "@/server/authz";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID();
    const requestBodyText = await req.text();
    const headers = Object.fromEntries(req.headers);

    let event;
    try {
        event = whop.webhooks.unwrap(requestBodyText, { headers });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown signature verification error";
        logger.error('[Webhook] Signature verification failed', {
            requestId,
            error: message,
            stack: err instanceof Error ? err.stack : undefined,
        });

        const response: ErrorResponse = {
            error: "Webhook signature verification failed",
            code: "WEBHOOK_SIGNATURE_INVALID",
            requestId,
        };
        return NextResponse.json(response, { status: 400 });
    }

    logger.info('[Webhook] Event received', { requestId, eventType: event.type, eventId: event.id });

    const result = await webhookService.processWebhook(event);

    if (result.success || result.alreadyProcessed) {
        return NextResponse.json({ message: "Received", requestId }, { status: 200 });
    } else {
        logger.error('[Webhook] Processing failed', {
            requestId,
            eventType: result.eventType,
            error: result.error,
        });
        const response: ErrorResponse = {
            error: result.error || "Processing failed",
            code: "WEBHOOK_PROCESSING_FAILED",
            requestId,
        };
        return NextResponse.json(response, { status: 500 });
    }
}
