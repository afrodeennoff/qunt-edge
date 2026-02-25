import DOMPurify from 'dompurify'

/**
 * HTML Sanitization Utilities
 * 
 * Uses dompurify for robust XSS prevention across both 
 * Server and Client environments.
 */

/**
 * Sanitize HTML strings for safe rendering.
 * Prefers DOMPurify for correctness, with localized defense-in-depth.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  if (typeof window === 'undefined') {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
  })
}

/**
 * Async sanitizer – kept for backward compatibility, now just calls sync version.
 */
export async function sanitizeHtmlStrict(html: string): Promise<string> {
  return sanitizeHtml(html)
}

/**
 * Sanitize user-supplied plain text for safe embedding.
 * Strips any HTML/script injection vectors.
 */
export function sanitizePlainText(input: string): string {
  if (!input) return ''

  if (typeof window === 'undefined') {
    return input.replace(/<[^>]*>?/gm, '').trim();
  }

  // For plain text, we want to strip ALL tags
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim()
}
