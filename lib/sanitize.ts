import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Configure DOMPurify to allow standard formatting tags and images
  // We match the previous implementation's intent but use DOMPurify's robust engine
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class'],
    // Ensure links open safely if they have target="_blank"
    ADD_ATTR: ['target'],
  });
}
