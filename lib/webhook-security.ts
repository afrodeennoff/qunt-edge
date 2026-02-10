/**
 * Webhook Service with Enterprise Security
 * Handles payment webhooks with idempotency and replay protection
 * 
 * Security Features:
 * - Signature verification
 * - Timestamp validation
 * - Idempotency (prevent duplicate processing)
 * - Replay attack prevention
 * - Rate limiting
 */

import { headers } from 'next/headers'
import { Redis } from '@upstash/redis'
import crypto from 'crypto'
import { checkRateLimit, RateLimitTier } from '@/lib/rate-limit'

// Initialize Redis for idempotency tracking
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null

/**
 * Webhook validation result
 */
interface WebhookValidation {
    valid: boolean
    error?: string
    webhookId?: string
    timestamp?: number
}

/**
 * Validate webhook signature and freshness
 * 
 * @param payload - Raw webhook payload
 * @param signature - Webhook signature from headers
 * @param timestamp - Webhook timestamp from headers
 * @param secret - Webhook secret key
 * @returns Validation result
 */
export async function validateWebhook(
    payload: string,
    signature: string,
    timestamp: string,
    secret: string
): Promise<WebhookValidation> {
    // 1. Verify timestamp is recent (prevent replay attacks)
    const timestampNum = parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 5 * 60 // 5 minutes

    if (isNaN(timestampNum)) {
        return { valid: false, error: 'Invalid timestamp format' }
    }

    if (Math.abs(now - timestampNum) > maxAge) {
        return {
            valid: false,
            error: `Webhook timestamp too old. Age: ${Math.abs(now - timestampNum)}s, Max: ${maxAge}s`
        }
    }

    // 2. Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex')

    const signatureValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )

    if (!signatureValid) {
        return { valid: false, error: 'Invalid webhook signature' }
    }

    // 3. Generate webhook ID for idempotency
    const webhookId = crypto
        .createHash('sha256')
        .update(`${timestamp}.${payload}`)
        .digest('hex')

    return {
        valid: true,
        webhookId,
        timestamp: timestampNum,
    }
}

/**
 * Check if webhook has already been processed (idempotency)
 * 
 * @param webhookId - Unique webhook identifier
 * @returns True if already processed
 */
export async function isWebhookProcessed(webhookId: string): Promise<boolean> {
    if (!redis) {
        console.warn('Redis not available, skipping idempotency check')
        return false
    }

    try {
        const exists = await redis.exists(`webhook:processed:${webhookId}`)
        return exists === 1
    } catch (error) {
        console.error('Failed to check webhook idempotency:', error)
        // Fail open to avoid blocking valid webhooks
        return false
    }
}

/**
 * Mark webhook as processed
 * 
 * @param webhookId - Unique webhook identifier
 * @param ttl - Time to live in seconds (default: 7 days)
 */
export async function markWebhookProcessed(
    webhookId: string,
    ttl: number = 7 * 24 * 60 * 60 // 7 days
): Promise<void> {
    if (!redis) {
        console.warn('Redis not available, skipping idempotency marking')
        return
    }

    try {
        await redis.setex(
            `webhook:processed:${webhookId}`,
            ttl,
            JSON.stringify({
                processedAt: new Date().toISOString(),
                webhookId,
            })
        )
    } catch (error) {
        console.error('Failed to mark webhook as processed:', error)
        // Don't throw - this is not critical
    }
}

/**
 * Process webhook with full security checks
 * 
 * @param request - Next.js request object
 * @param processor - Function to process the webhook payload
 * @returns Response
 * 
 * @example
 * export async function POST(request: Request) {
 *   return processWebhook(request, async (payload) => {
 *     // Your webhook processing logic
 *     await handlePayment(payload)
 *     return { success: true }
 *   })
 * }
 */
export async function processWebhook<T = any>(
    request: Request,
    processor: (payload: T) => Promise<any>,
    options: {
        secret: string
        rateLimitIdentifier?: string
    }
): Promise<Response> {
    try {
        // 1. Rate limiting
        const headersList = await headers()
        const identifier = options.rateLimitIdentifier ||
            headersList.get('x-forwarded-for') ||
            'webhook'

        const rateLimitResult = await checkRateLimit(identifier, RateLimitTier.WEBHOOK)
        if (!rateLimitResult.success) {
            return new Response(
                JSON.stringify({
                    error: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: rateLimitResult.retryAfter,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
                    },
                }
            )
        }

        // 2. Extract headers
        const signature = headersList.get('x-webhook-signature') ||
            headersList.get('webhook-signature') ||
            ''
        const timestamp = headersList.get('x-webhook-timestamp') ||
            headersList.get('webhook-timestamp') ||
            ''

        if (!signature || !timestamp) {
            return new Response(
                JSON.stringify({ error: 'Missing webhook headers' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // 3. Get payload
        const payload = await request.text()

        // 4. Validate signature and timestamp
        const validation = await validateWebhook(
            payload,
            signature,
            timestamp,
            options.secret
        )

        if (!validation.valid) {
            console.error('Webhook validation failed:', validation.error)
            return new Response(
                JSON.stringify({ error: validation.error }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // 5. Check idempotency
        const { webhookId } = validation
        if (webhookId && await isWebhookProcessed(webhookId)) {
            console.log('Webhook already processed:', webhookId)
            return new Response(
                JSON.stringify({
                    status: 'already_processed',
                    webhookId
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // 6. Parse and process webhook
        const parsedPayload = JSON.parse(payload) as T
        const result = await processor(parsedPayload)

        // 7. Mark as processed
        if (webhookId) {
            await markWebhookProcessed(webhookId)
        }

        // 8. Return success
        return new Response(
            JSON.stringify({
                status: 'success',
                result,
                webhookId
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Webhook processing error:', error)

        // Send to Sentry if available
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, {
                tags: { context: 'webhook_processing' }
            })
        }

        return new Response(
            JSON.stringify({
                error: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}

/**
 * Webhook retry handler with exponential backoff
 * For use when webhook processing fails and needs retry
 */
export class WebhookRetryHandler {
    private maxRetries: number
    private baseDelay: number

    constructor(maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries
        this.baseDelay = baseDelay
    }

    async executeWithRetry<T>(
        fn: () => Promise<T>,
        webhookId: string
    ): Promise<T> {
        let lastError: Error | null = null

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn()
            } catch (error) {
                lastError = error as Error

                if (attempt < this.maxRetries) {
                    const delay = this.baseDelay * Math.pow(2, attempt)
                    console.log(
                        `Webhook ${webhookId} attempt ${attempt + 1} failed, ` +
                        `retrying in ${delay}ms:`,
                        error
                    )
                    await this.sleep(delay)
                }
            }
        }

        throw new Error(
            `Webhook processing failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`
        )
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

/**
 * Helper to verify Whop webhook specifically
 */
export async function verifyWhopWebhook(request: Request): Promise<{
    valid: boolean
    payload?: any
    error?: string
}> {
    const secret = process.env.WHOP_SECRET_KEY
    if (!secret) {
        return { valid: false, error: 'WHOP_SECRET_KEY not configured' }
    }

    try {
        const validation = await processWebhook(
            request,
            async (payload) => payload,
            { secret }
        )

        if (!validation.ok) {
            const error = await validation.json()
            return { valid: false, error: error.error }
        }

        const result = await validation.json()
        return { valid: true, payload: result.result }
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
