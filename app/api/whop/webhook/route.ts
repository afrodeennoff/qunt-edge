import { NextRequest, NextResponse } from "next/server";
import { webhookService } from "@/server/webhook-service";
import { whop } from "@/lib/whop";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const requestBodyText = await req.text();
    const headers = Object.fromEntries(req.headers);

    let event;
    try {
        event = whop.webhooks.unwrap(requestBodyText, { headers });
    } catch (err: any) {
        logger.error('[Webhook] Signature verification failed', {
            error: err.message,
            stack: err.stack,
            headers: JSON.stringify(headers)
        });

        return NextResponse.json(
            { message: `Webhook Error: Signature verification failed. Check logs for details.` },
            { status: 400 }
        );
    }

    logger.info('[Webhook] Event received', { eventType: event.type, eventId: event.id });

    const result = await webhookService.processWebhook(event);

    if (result.success || result.alreadyProcessed) {
        return NextResponse.json({ message: "Received" }, { status: 200 });
    } else {
        return NextResponse.json(
            { message: result.error || "Processing failed" },
            { status: 500 }
        );
    }
}
