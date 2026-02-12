import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '../sanitize'

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const input = '<p>Hello <script>alert(1)</script></p>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('<script>')
    expect(output).toContain('Hello')
  })

  it('should remove onclick handlers', () => {
    const input = '<button onclick="alert(1)">Click me</button>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('onclick')
    // button is not in allowed tags, so it might be stripped or just the tag name stripped
    // Our implementation only allows specific tags.
  })

  it('should preserve allowed tags and attributes', () => {
    const input = '<a href="https://example.com" class="link">Link</a>'
    const output = sanitizeHtml(input)
    expect(output).toContain('<a href="https://example.com" class="link">Link</a>')
  })

  it('should strip disallowed tags', () => {
    const input = '<script>alert("XSS")</script>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('<script>')
  })

  it('should strip disallowed attributes', () => {
    const input = '<img src="x" onerror="alert(1)" />'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('onerror')
    expect(output).toContain('src="x"')
  })

  it('should handle complex nested structures', () => {
    const input = '<div><p>Test <b>Bold</b></p></div>'
    const output = sanitizeHtml(input)
    expect(output).toBe('<div><p>Test <b>Bold</b></p></div>')
  })
})
