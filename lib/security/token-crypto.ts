import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const CIPHER_ALGORITHM = "aes-256-gcm"

export type EncryptedTokenEnvelope = {
  tokenCiphertext: string
  tokenIv: string
  tokenTag: string
  tokenKeyVersion: string
}

function getTokenKeyVersion(): string {
  return process.env.TOKEN_CRYPTO_KEY_VERSION || "v1"
}

function getTokenKeyMaterial(): Buffer {
  const raw = process.env.TOKEN_CRYPTO_KEY || ""
  if (!raw) {
    throw new Error("Missing TOKEN_CRYPTO_KEY")
  }
  const normalized = raw.trim()
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(normalized) && normalized.length >= 43
  const keyBuffer = looksBase64 ? Buffer.from(normalized, "base64") : Buffer.from(normalized, "utf8")

  if (keyBuffer.length === 32) return keyBuffer

  return createHash("sha256").update(keyBuffer).digest()
}

export function encryptToken(plaintextToken: string): EncryptedTokenEnvelope {
  if (!plaintextToken) {
    throw new Error("Token value is required for encryption")
  }

  const iv = randomBytes(12)
  const key = getTokenKeyMaterial()
  const cipher = createCipheriv(CIPHER_ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintextToken, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    tokenCiphertext: encrypted.toString("base64"),
    tokenIv: iv.toString("base64"),
    tokenTag: tag.toString("base64"),
    tokenKeyVersion: getTokenKeyVersion(),
  }
}

export function decryptToken(envelope: {
  tokenCiphertext: string | null
  tokenIv: string | null
  tokenTag: string | null
}): string | null {
  if (!envelope.tokenCiphertext || !envelope.tokenIv || !envelope.tokenTag) return null

  const key = getTokenKeyMaterial()
  const decipher = createDecipheriv(
    CIPHER_ALGORITHM,
    key,
    Buffer.from(envelope.tokenIv, "base64")
  )
  decipher.setAuthTag(Buffer.from(envelope.tokenTag, "base64"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(envelope.tokenCiphertext, "base64")),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}

