import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Handle ESM/CommonJS interop
  const sanitizer = (DOMPurify as any).default ?? DOMPurify;

  if (typeof sanitizer.sanitize !== 'function') {
      // Fallback or error reporting
      console.error('DOMPurify import failed or invalid:', sanitizer);
      throw new Error('DOMPurify.sanitize is not a function');
  }

  return sanitizer.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class'
    ],
  });
}
