export function sanitizeHtml(html: string): string {
  if (!html) return ''

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
