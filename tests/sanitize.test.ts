
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('sanitizeHtml', () => {
  beforeEach(() => {
    vi.resetModules()
    // Simulate SSR by ensuring window is undefined
    // @ts-ignore
    if (typeof window !== 'undefined') {
        // @ts-ignore
        delete global.window
    }
    // Also delete DOMPurify from global if it leaked
    // @ts-ignore
    delete global.DOMPurify
  })

  it('should remove script tags', async () => {
    const { sanitizeHtml } = await import('@/lib/sanitize')
    const input = '<script>alert(1)</script>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('<script>')
    expect(output).not.toContain('alert(1)')
  })

  it('should remove onclick attributes', async () => {
    const { sanitizeHtml } = await import('@/lib/sanitize')
    const input = '<button onclick="alert(1)">Click me</button>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('onclick')
  })

  it('should allow safe tags', async () => {
    const { sanitizeHtml } = await import('@/lib/sanitize')
    const input = '<p>This is <strong>safe</strong></p>'
    const output = sanitizeHtml(input)
    expect(output).toContain('<p>')
    expect(output).toContain('<strong>')
    expect(output).toContain('safe')
  })
})
