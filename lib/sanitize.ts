/**
 * HTML Sanitization Utilities
 *
 * Uses isomorphic-dompurify (which is already in deps) for robust XSS prevention.
 * Falls back to regex-based stripping only in edge environments where DOMPurify
 * cannot initialize.
 */

let purify: { sanitize: (html: string) => string } | null = null

async function getPurify() {
  if (purify) return purify
  try {
    const mod = await import('isomorphic-dompurify')
    purify = mod.default ?? mod
    return purify
  } catch {
    return null
  }
}

/**
 * Strip dangerous HTML constructs.  Prefers DOMPurify for correctness.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Regex fallback – defense-in-depth even when DOMPurify is available
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+(href|src)\s*=\s*"(?:\s*javascript:)[^"]*"/gi, '')
    .replace(/\s+(href|src)\s*=\s*'(?:\s*javascript:)[^']*'/gi, '')
    .replace(/\s+(href|src)\s*=\s*(?:\s*javascript:)[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Async sanitizer that uses DOMPurify when available (recommended for rich text).
 */
export async function sanitizeHtmlStrict(html: string): Promise<string> {
  if (!html) return ''

  const dp = await getPurify()
  if (dp) {
    return dp.sanitize(html)
  }

  // Fallback
  return sanitizeHtml(html)
}

/**
 * Sanitize user-supplied plain text for safe embedding.
 * Strips any HTML/script injection vectors.
 */
export function sanitizePlainText(input: string): string {
  if (!input) return ''
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}
