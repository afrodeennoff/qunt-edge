'use server'

import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { headers } from 'next/headers'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

interface SecurityConfig {
  encryptionKey: string
  webhookSecret: string
  maxRetries: number
  rateLimitWindow: number
  rateLimitMaxRequests: number
}

class SecurityManager {
  private static instance: SecurityManager
  private config: SecurityConfig
  private rateLimitMap: Map<string, { count: number; resetTime: number }>

  private constructor() {
    this.config = {
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      webhookSecret: process.env.WHOP_WEBHOOK_SECRET || '',
      maxRetries: 3,
      rateLimitWindow: 60000,
      rateLimitMaxRequests: 100,
    }
    this.rateLimitMap = new Map()

    if (!this.config.encryptionKey) {
      logger.warn('[SecurityManager] Encryption key not configured')
    }
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  encrypt(text: string): string {
    try {
      if (!this.config.encryptionKey) {
        throw new Error('Encryption key not configured')
      }

      const iv = crypto.randomBytes(IV_LENGTH)
      const salt = crypto.randomBytes(SALT_LENGTH)
      const key = crypto.pbkdf2Sync(
        this.config.encryptionKey,
        salt,
        100000,
        KEY_LENGTH,
        'sha512'
      )

      const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
      const tag = cipher.getAuthTag()

      const buffer = Buffer.concat([salt, iv, tag, encrypted])
      return buffer.toString('base64')
    } catch (error) {
      logger.error('[SecurityManager] Encryption failed', { error })
      throw new Error('Encryption failed')
    }
  }

  decrypt(encryptedText: string): string {
    try {
      if (!this.config.encryptionKey) {
        throw new Error('Encryption key not configured')
      }

      const buffer = Buffer.from(encryptedText, 'base64')

      const salt = buffer.subarray(0, SALT_LENGTH)
      const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION)
      const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION)
      const encrypted = buffer.subarray(ENCRYPTED_POSITION)

      const key = crypto.pbkdf2Sync(
        this.config.encryptionKey,
        salt,
        100000,
        KEY_LENGTH,
        'sha512'
      )

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(tag)

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ])

      return decrypted.toString('utf8')
    } catch (error) {
      logger.error('[SecurityManager] Decryption failed', { error })
      throw new Error('Decryption failed')
    }
  }

  hashPII(data: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(data + this.config.encryptionKey)
    return hash.digest('hex')
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validateAmount(amount: number): boolean {
    return (
      typeof amount === 'number' &&
      amount > 0 &&
      amount <= 1000000 &&
      Number.isFinite(amount)
    )
  }

  detectSuspiciousActivity(data: {
    userId: string
    email: string
    ipAddress?: string
    userAgent?: string
    actionType: string
  }): { suspicious: boolean; reasons: string[]; score: number } {
    const reasons: string[] = []
    let score = 0

    if (!data.email || !this.validateEmail(data.email)) {
      reasons.push('Invalid email format')
      score += 50
    }

    const recentAttempts = this.rateLimitMap.get(data.userId)
    if (recentAttempts && recentAttempts.count > 10) {
      reasons.push('High frequency of requests')
      score += 30
    }

    if (data.userAgent?.includes('bot') || data.userAgent?.includes('crawler')) {
      reasons.push('Suspicious user agent')
      score += 20
    }

    return {
      suspicious: score >= 50,
      reasons,
      score,
    }
  }

  async checkRateLimit(identifier: string): Promise<{
    allowed: boolean
    remainingRequests: number
    resetTime: number
  }> {
    const now = Date.now()
    const record = this.rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
      const newRecord = {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      }
      this.rateLimitMap.set(identifier, newRecord)

      return {
        allowed: true,
        remainingRequests: this.config.rateLimitMaxRequests - 1,
        resetTime: newRecord.resetTime,
      }
    }

    if (record.count >= this.config.rateLimitMaxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: record.resetTime,
      }
    }

    record.count++
    this.rateLimitMap.set(identifier, record)

    return {
      allowed: true,
      remainingRequests: this.config.rateLimitMaxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      const now = Math.floor(Date.now() / 1000)
      const requestTimestamp = parseInt(timestamp, 10)

      if (Math.abs(now - requestTimestamp) > 300) {
        logger.warn('[SecurityManager] Webhook timestamp too old', {
          timestamp,
          now,
        })
        return false
      }

      const hmac = crypto.createHmac('sha256', this.config.webhookSecret)
      hmac.update(`${timestamp}.${payload}`)
      const expectedSignature = hmac.digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      logger.error('[SecurityManager] Webhook signature verification failed', {
        error,
      })
      return false
    }
  }

  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 13) {
      return '****'
    }
    return `${cardNumber.slice(0, 4)}${'*'.repeat(cardNumber.length - 8)}${cardNumber.slice(-4)}`
  }

  maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (username.length <= 2) {
      return `${username[0]}*@${domain}`
    }
    return `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`
  }

  redactSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const redacted: any = Array.isArray(data) ? [] : {}

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()

      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('apikey')
      ) {
        redacted[key] = '[REDACTED]'
      } else if (lowerKey.includes('card') || lowerKey.includes('credit')) {
        redacted[key] = this.maskCardNumber(String(value))
      } else if (lowerKey.includes('email')) {
        redacted[key] = this.maskEmail(String(value))
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value)
      } else {
        redacted[key] = value
      }
    }

    return redacted
  }

  async getClientInfo(): Promise<{
    ipAddress: string
    userAgent: string
    referer?: string
  }> {
    try {
      const headersList = await headers()
      const forwarded = headersList.get('x-forwarded-for')
      const realIp = headersList.get('x-real-ip')
      const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'

      return {
        ipAddress,
        userAgent: headersList.get('user-agent') || 'unknown',
        referer: headersList.get('referer') || undefined,
      }
    } catch (error) {
      logger.error('[SecurityManager] Failed to get client info', { error })
      return {
        ipAddress: 'unknown',
        userAgent: 'unknown',
      }
    }
  }

  validatePCICompliance(data: {
    hasCardData: boolean
    storesCardData: boolean
    usesTokenization: boolean
  }): { compliant: boolean; violations: string[] } {
    const violations: string[] = []

    if (data.hasCardData && !data.usesTokenization) {
      violations.push('Card data must be tokenized')
    }

    if (data.storesCardData) {
      violations.push('Card data must not be stored locally')
    }

    if (!this.config.encryptionKey) {
      violations.push('Encryption key not configured')
    }

    return {
      compliant: violations.length === 0,
      violations,
    }
  }

  logSecurityEvent(event: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: Record<string, any>
  }): void {
    const redactedDetails = this.redactSensitiveData(event.details)

    if (event.severity === 'critical' || event.severity === 'high') {
      logger.error('[SecurityEvent]', {
        type: event.type,
        severity: event.severity,
        ...redactedDetails,
      })
    } else {
      logger.warn('[SecurityEvent]', {
        type: event.type,
        severity: event.severity,
        ...redactedDetails,
      })
    }
  }

  async validateSubscriptionAccess(
    userId: string,
    feature: string
  ): Promise<{
    allowed: boolean
    reason?: string
  }> {
    const { getSubscriptionDetails } = await import('./subscription')
    const subscription = await getSubscriptionDetails()

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No subscription found',
      }
    }

    if (!subscription.isActive) {
      return {
        allowed: false,
        reason: 'Subscription not active',
      }
    }

    if (subscription.plan === 'FREE' && this.isPremiumFeature(feature)) {
      return {
        allowed: false,
        reason: 'Feature requires premium subscription',
      }
    }

    return { allowed: true }
  }

  private isPremiumFeature(feature: string): boolean {
    const premiumFeatures = [
      'advanced_analytics',
      'api_access',
      'team_collaboration',
      'priority_support',
      'custom_integrations',
    ]
    return premiumFeatures.includes(feature)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key)
      }
    }
  }
}

export const securityManager = SecurityManager.getInstance()

setInterval(() => {
  securityManager.cleanup()
}, 300000)

export function withSecurityChecks<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: {
    requireAuth?: boolean
    checkSubscription?: boolean
    feature?: string
    rateLimit?: boolean
  }
): T {
  return (async (...args: any[]) => {
    const clientInfo = await securityManager.getClientInfo()

    if (options?.rateLimit) {
      const rateLimitResult = await securityManager.checkRateLimit(
        clientInfo.ipAddress
      )
      if (!rateLimitResult.allowed) {
        throw new Error('Rate limit exceeded')
      }
    }

    if (options?.checkSubscription && options?.feature) {
      const supabase = await import('./auth').then((m) => m.createClient())
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const accessCheck = await securityManager.validateSubscriptionAccess(
          user.id,
          options.feature
        )
        if (!accessCheck.allowed) {
          throw new Error(accessCheck.reason || 'Access denied')
        }
      }
    }

    return handler(...args)
  }) as T
}
