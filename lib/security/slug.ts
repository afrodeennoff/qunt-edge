import crypto from 'node:crypto'

const URL_SAFE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function createSecureSlug(length = 12): string {
  const size = Math.max(6, length)
  const bytes = crypto.randomBytes(size)
  let slug = ''

  for (let i = 0; i < size; i += 1) {
    const index = bytes[i] % URL_SAFE_CHARS.length
    slug += URL_SAFE_CHARS[index]
  }

  return slug
}
