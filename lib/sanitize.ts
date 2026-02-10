/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and injection vulnerabilities
 * 
 * Enterprise-grade security practices:
 * - HTML sanitization with DOMPurify
 * - SQL injection prevention (handled by Prisma)
 * - File upload validation
 * - CSV escape sequences
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content from user input
 * Removes dangerous tags and attributes
 * 
 * @param dirty - Unsanitized HTML string
 * @param options - DOMPurify configuration
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * const userComment = "<script>alert('xss')</script><p>Safe content</p>"
 * const clean = sanitizeHtml(userComment)
 * // Returns: "<p>Safe content</p>"
 */
export function sanitizeHtml(
  dirty: string,
  options?: {
    allowedTags?: string[]
    allowedAttributes?: string[]
    stripIgnoreTag?: boolean
  }
): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  const config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: !options?.stripIgnoreTag,
    // Prevent DOM clobbering
    SANITIZE_DOM: true,
    // Remove any non-whitelisted tags
    FORCE_BODY: true,
  }

  // Additional security: ensure safe protocols in links
  DOMPurify.addHook('afterSanitizeAttributes' as any, (node: Element) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href')
      if (href && !href.match(/^(https?|mailto):/i)) {
        node.removeAttribute('href')
      }
      // Force external links to open in new tab with security
      if (href && href.match(/^https?:/i)) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    }
  })

  return DOMPurify.sanitize(dirty, config as any) as unknown as string
}

/**
 * Sanitize plain text input
 * Strips all HTML but preserves text content
 * 
 * @param input - User input that should be plain text
 * @returns Text with HTML stripped
 * 
 * @example
 * const input = "<b>Hello</b> World"
 * const clean = sanitizePlainText(input)
 * // Returns: "Hello World"
 */
export function sanitizePlainText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove all HTML tags
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }) as unknown as string
}

/**
 * Sanitize filename for safe storage
 * Prevents directory traversal and special characters
 * 
 * @param filename - Original filename
 * @returns Safe filename
 * 
 * @example
 * const malicious = "../../etc/passwd"
 * const safe = sanitizeFilename(malicious)
 * // Returns: "passwd"
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file'
  }

  return filename
    // Remove directory traversal attempts
    .replace(/\.\./g, '')
    .replace(/\//g, '')
    .replace(/\\/g, '')
    // Remove special characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Limit length
    .slice(0, 255)
    // Ensure not empty
    || 'unnamed_file'
}

/**
 * Validate and sanitize file upload
 * Checks file type, size, and content
 * 
 * @param file - File object from upload
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 * 
 * @example
 * const result = await validateFileUpload(file, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png']
 * })
 * if (!result.valid) {
 *   console.error(result.error)
 * }
 */
export async function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): Promise<{ valid: boolean; error?: string; sanitizedName?: string }> {
  const {
    maxSize = 10 * 1024 * 1024, // Default 10MB
    allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.csv', '.xls', '.xlsx'],
  } = options

  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Check file size
  if (file.size > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(2)
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` }
  }

  // Check file extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension ${extension} is not allowed` }
  }

  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name)

  // Additional check: verify file signature (magic numbers)
  // This prevents file extension spoofing
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer).slice(0, 4)

    // Check magic numbers for common file types
    const isValidSignature = checkFileSignature(bytes, file.type)
    if (!isValidSignature) {
      return { valid: false, error: 'File content does not match declared type' }
    }
  } catch (error) {
    return { valid: false, error: 'Failed to validate file content' }
  }

  return { valid: true, sanitizedName }
}

/**
 * Check file signature (magic numbers) to verify actual file type
 */
function checkFileSignature(bytes: Uint8Array, declaredType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'text/csv': [], // CSV has no signature, trust extension
    'application/vnd.ms-excel': [[0xD0, 0xCF, 0x11, 0xE0]], // OLE2
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4B, 0x03, 0x04]], // ZIP
  }

  const expectedSignatures = signatures[declaredType]
  if (!expectedSignatures || expectedSignatures.length === 0) {
    // No signature check for this type
    return true
  }

  return expectedSignatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte)
  )
}

/**
 * Escape CSV special characters to prevent formula injection
 * Prevents attacks via CSV formulas (=cmd|'/c calc'!A1)
 * 
 * @param value - CSV cell value
 * @returns Escaped value safe for CSV
 * 
 * @example
 * const dangerous = "=1+1"
 * const safe = escapeCsvValue(dangerous)
 * // Returns: "'=1+1"
 */
export function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)

  // Prepend single quote to prevent formula injection
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    return `'${str}`
  }

  // Escape double quotes
  if (str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  // Quote if contains comma, newline, or double quote
  if (str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`
  }

  return str
}

/**
 * Sanitize SQL-like input (additional layer beyond Prisma)
 * Note: Prisma already prevents SQL injection, this is defense in depth
 * 
 * @param input - User input that might contain SQL
 * @returns Sanitized input
 */
export function sanitizeSqlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove SQL comment markers
  return input
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Validate and sanitize URL
 * Ensures URL is safe and from allowed domains
 * 
 * @param url - URL to validate
 * @param allowedDomains - Optional whitelist of allowed domains
 * @returns Validated URL or null if invalid
 * 
 * @example
 * const url = sanitizeUrl("javascript:alert('xss')")
 * // Returns: null
 * 
 * const safeUrl = sanitizeUrl("https://example.com")
 * // Returns: "https://example.com"
 */
export function sanitizeUrl(
  url: string,
  allowedDomains?: string[]
): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const parsed = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    // Check domain whitelist if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const domain = parsed.hostname
      if (!allowedDomains.some(allowed => domain.endsWith(allowed))) {
        return null
      }
    }

    return parsed.toString()
  } catch {
    // Invalid URL
    return null
  }
}

/**
 * Sanitize object keys and values recursively
 * Useful for user-provided JSON data
 * 
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key (prevent prototype pollution)
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    const sanitizedKey = sanitizePlainText(key)

    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizePlainText(value)
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item =>
          typeof item === 'string' ? sanitizePlainText(item) : item
        )
      } else {
        sanitized[sanitizedKey] = sanitizeObject(value)
      }
    } else {
      sanitized[sanitizedKey] = value
    }
  }

  return sanitized as T
}
