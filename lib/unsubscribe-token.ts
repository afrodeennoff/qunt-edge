import crypto from "crypto"

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("Missing unsubscribe token secret")
  }
  return secret
}

function toBase64Url(input: Buffer | string): string {
  const value = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function fromBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  const withPadding = padded + "=".repeat((4 - (padded.length % 4 || 4)) % 4)
  return Buffer.from(withPadding, "base64")
}

export function createUnsubscribeToken(email: string): string {
  const secret = getSecret()
  const payload = {
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
  const encoded = toBase64Url(JSON.stringify(payload))
  const signature = toBase64Url(
    crypto.createHmac("sha256", secret).update(encoded).digest()
  )
  return `${encoded}.${signature}`
}

export function verifyUnsubscribeToken(token: string, email: string): boolean {
  try {
    const secret = getSecret()
    const [encoded, providedSignature] = token.split(".")
    if (!encoded || !providedSignature) return false

    const expectedSignature = toBase64Url(
      crypto.createHmac("sha256", secret).update(encoded).digest()
    )

    const providedBuffer = fromBase64Url(providedSignature)
    const expectedBuffer = fromBase64Url(expectedSignature)
    if (providedBuffer.length !== expectedBuffer.length) return false
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return false

    const payload = JSON.parse(fromBase64Url(encoded).toString("utf8")) as {
      email?: string
      exp?: number
    }

    if (!payload.email || !payload.exp) return false
    if (payload.exp < Math.floor(Date.now() / 1000)) return false

    return payload.email === email.toLowerCase()
  } catch {
    return false
  }
}
