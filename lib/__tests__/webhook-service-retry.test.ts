import { describe, expect, it, vi } from 'vitest'
import { WebhookService } from '@/server/webhook-service'

describe('webhook service retry behavior', () => {
  it('retries retryable events and succeeds', async () => {
    const service = new WebhookService()
    const serviceInternal = service as unknown as {
      handleEventByType: (event: { type: string }, prisma: unknown) => Promise<{
        success: boolean
        eventType: string
        processed: boolean
        error?: string
      }>
      processEventWithRetry: (event: { type: string }, prisma: unknown) => Promise<{
        success: boolean
        eventType: string
        processed: boolean
        error?: string
      }>
      sleep: (ms: number) => Promise<void>
    }

    vi.spyOn(serviceInternal, 'sleep').mockResolvedValue(undefined)
    vi.spyOn(serviceInternal, 'handleEventByType')
      .mockResolvedValueOnce({
        success: false,
        eventType: 'payment.succeeded',
        processed: false,
        error: 'temporary network timeout',
      })
      .mockResolvedValueOnce({
        success: true,
        eventType: 'payment.succeeded',
        processed: true,
      })

    const result = await serviceInternal.processEventWithRetry(
      { id: 'evt-1', type: 'payment.succeeded', data: {} } as never,
      {}
    )

    expect(result.success).toBe(true)
    expect(serviceInternal.handleEventByType).toHaveBeenCalledTimes(2)
  })
})
