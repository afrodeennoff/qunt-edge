import crypto from 'crypto'
import { prisma } from './prisma'

const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

export async function generateSecureToken(userId: string, tokenType: 'etp' | 'thor') {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)
  
  const field = tokenType === 'etp' ? 'etpTokenHash' : 'thorTokenHash'
  const legacyField = tokenType === 'etp' ? 'etpToken' : 'thorToken'
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      [field]: tokenHash,
      [legacyField]: null,
      [`${tokenType}TokenExpiresAt`]: expiresAt
    }
  })
  
  return token
}

export async function verifySecureToken(token: string, tokenType: 'etp' | 'thor') {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const field = tokenType === 'etp' ? 'etpTokenHash' : 'thorTokenHash'
  const expiresField = `${tokenType}TokenExpiresAt`
  
  const user = await prisma.user.findFirst({
    where: {
      [field]: tokenHash,
      [expiresField]: {
        gte: new Date()
      }
    }
  })
  
  return user
}

export async function revokeSecureToken(userId: string, tokenType: 'etp' | 'thor') {
  const field = tokenType === 'etp' ? 'etpTokenHash' : 'thorTokenHash'
  const legacyField = tokenType === 'etp' ? 'etpToken' : 'thorToken'
  const expiresField = `${tokenType}TokenExpiresAt`
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      [field]: null,
      [legacyField]: null,
      [expiresField]: null
    }
  })
}
