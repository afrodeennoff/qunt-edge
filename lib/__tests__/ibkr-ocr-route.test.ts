import { describe, expect, it } from 'vitest'

import { vi } from 'vitest'

vi.mock('@/lib/supabase/route-client', () => ({
  createRouteClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: 'test-user', email: 'user@example.com' } },
        error: null,
      }),
    },
  }),
}))

vi.mock('pdf2json', () => ({
  default: class PDFParserMock {
    on() {}
    parseBuffer() {}
  },
}))

import { POST } from '@/app/api/imports/ibkr/ocr/route'

describe('ibkr ocr route', () => {
  it('returns 400 when no file is provided', async () => {
    const response = await POST(
      new Request('http://localhost/api/imports/ibkr/ocr', {
        method: 'POST',
        body: JSON.stringify({ attachments: [] }),
        headers: { 'content-type': 'application/json' },
      })
    )

    const payload = (await response.json()) as { code: string }
    expect(response.status).toBe(400)
    expect(payload.code).toBe('IMPORT_FILE_MISSING')
  })

  it('returns 400 when non-pdf file is provided', async () => {
    const response = await POST(
      new Request('http://localhost/api/imports/ibkr/ocr', {
        method: 'POST',
        body: JSON.stringify({
          attachments: [{ type: 'text/plain', content: 'abc' }],
        }),
        headers: { 'content-type': 'application/json' },
      })
    )

    const payload = (await response.json()) as { code: string }
    expect(response.status).toBe(400)
    expect(payload.code).toBe('IMPORT_FILE_TYPE_INVALID')
  })

  it('returns 400 for empty pdf payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/imports/ibkr/ocr', {
        method: 'POST',
        body: JSON.stringify({
          attachments: [{ type: 'application/pdf', content: '' }],
        }),
        headers: { 'content-type': 'application/json' },
      })
    )

    const payload = (await response.json()) as { code: string }
    expect(response.status).toBe(400)
    expect(payload.code).toBe('IMPORT_FILE_EMPTY')
  })
})
