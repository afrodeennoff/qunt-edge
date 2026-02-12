import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/whop', () => ({
  whop: {
    webhooks: {
      unwrap: vi.fn(),
    },
  },
}))

vi.mock('@/server/webhook-service', () => ({
  webhookService: {
    processWebhook: vi.fn(),
  },
}))

import { whop } from '@/lib/whop'
import { webhookService } from '@/server/webhook-service'
import { POST } from '@/app/api/whop/webhook/route'

describe('whop webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid signatures', async () => {
    vi.mocked(whop.webhooks.unwrap).mockImplementation(() => {
      throw new Error('invalid signature')
    })

    const response = await POST(
      new Request('http://localhost/api/whop/webhook', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      }) as never
    )

    const payload = (await response.json()) as { code: string; requestId: string }
    expect(response.status).toBe(400)
    expect(payload.code).toBe('WEBHOOK_SIGNATURE_INVALID')
    expect(payload.requestId).toBeTruthy()
  })

  it('returns 200 when webhook is processed', async () => {
    vi.mocked(whop.webhooks.unwrap).mockReturnValue({
      id: 'evt_1',
      type: 'payment.succeeded',
      data: {},
    } as never)
    vi.mocked(webhookService.processWebhook).mockResolvedValue({
      success: true,
      eventType: 'payment.succeeded',
      processed: true,
    })

    const response = await POST(
      new Request('http://localhost/api/whop/webhook', {
        method: 'POST',
        body: '{}',
        headers: { 'content-type': 'application/json' },
      }) as never
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as { requestId: string }
    expect(payload.requestId).toBeTruthy()
  })
})
