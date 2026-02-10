/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 * Prevents runtime errors from missing configuration
 * 
 * Enterprise best practices:
 * - Fail fast on missing required vars
 * - Type-safe environment access
 * - Prevent client-side leaks
 * - Validate formats (URLs, keys, etc.)
 */

import { z } from 'zod'

/**
 * Environment variable schema with validation rules
 */
const envSchema = z.object({
  //=================================================================
  // DATABASE
  //=================================================================
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url().optional(),

  //=================================================================
  // SUPABASE
  //=================================================================
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  //=================================================================
  // AUTH
  //=================================================================
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  //=================================================================
  // OPENAI
  //=================================================================
  OPENAI_API_KEY: z
    .string()
    .regex(/^sk-/, 'OPENAI_API_KEY must start with sk-')
    .min(1)
    .optional(),

  //=================================================================
  // WHOP (PAYMENT)
  //=================================================================
  WHOP_API_KEY: z.string().min(1).optional(),
  WHOP_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_WHOP_APP_ID: z.string().optional(),

  //=================================================================
  // UPSTASH REDIS (RATE LIMITING)
  //=================================================================
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  //=================================================================
  // SENTRY (MONITORING)
  //=================================================================
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  //================================================================
  // APPLICATION
  //=================================================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('APP_URL must be a valid URL').optional(),

  //=================================================================
  // BROKER INTEGRATIONS
  //=================================================================
  TRADOVATE_CLIENT_ID: z.string().optional(),
  TRADOVATE_SECRET: z.string().optional(),

  TRADIER_API_KEY: z.string().optional(),

  RITHMIC_API_KEY: z.string().optional(),

  //=================================================================
  // FEATURE FLAGS
  //=================================================================
  FLAGS_SECRET: z.string().optional(),

  //=================================================================
  // VERCEL (AUTO-POPULATED)
  //=================================================================
  VERCEL: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
})

/**
 * Validated environment variables type
 */
export type ValidatedEnv = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables
 * Throws error if validation fails
 */
function parseEnv(): ValidatedEnv {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error('Invalid environment variables. Check the console for details.')
  }

  return parsed.data
}

/**
 * Type-safe environment variables
 * Validated once at startup
 */
export const env = parseEnv()

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}

/**
 * Get database URL for Prisma
 */
export function getDatabaseUrl(): string {
  return env.DATABASE_URL
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Check if OpenAI is configured
 */
export function hasOpenAI(): boolean {
  return !!env.OPENAI_API_KEY
}

/**
 * Check if Whop payment is configured
 */
export function hasWhopPayment(): boolean {
  return !!(env.WHOP_API_KEY && env.WHOP_SECRET_KEY)
}

/**
 * Check if rate limiting is configured
 */
export function hasRateLimiting(): boolean {
  return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * Check if Sentry monitoring is configured
 */
export function hasSentryMonitoring(): boolean {
  return !!env.NEXT_PUBLIC_SENTRY_DSN
}

/**
 * Get app URL (with fallback)
 */
export function getAppUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }

  if (isDevelopment()) {
    return 'http://localhost:3000'
  }

  throw new Error('APP_URL is not configured')
}

/**
 * Validate that no secrets are exposed to client
 * This should be called in the build process
 */
export function validateClientSideEnv() {
  const dangerousVars = [
    'DATABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'OPENAI_API_KEY',
    'WHOP_SECRET_KEY',
    'UPSTASH_REDIS_REST_TOKEN',
    'SENTRY_AUTH_TOKEN',
  ]

  const leaked = dangerousVars.filter(varName => {
    // Check if variable exists in client-side process.env
    // In Next.js, only NEXT_PUBLIC_* are exposed to client
    const value = process.env[varName]
    return value && typeof window !== 'undefined'
  })

  if (leaked.length > 0) {
    throw new Error(
      `SECURITY ERROR: Secrets leaked to client: ${leaked.join(', ')}. ` +
      `Only NEXT_PUBLIC_* variables should be accessible in the browser.`
    )
  }
}

/**
 * Log environment configuration (safe version without secrets)
 * Useful for debugging deployment issues
 */
export function logEnvironmentConfig() {
  if (!isDevelopment()) {
    return // Only log in development
  }

  console.log('🔧 Environment Configuration:')
  console.log(`  NODE_ENV: ${env.NODE_ENV}`)
  console.log(`  Database: ${env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`)
  console.log(`  Supabase: ${env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`)
  console.log(`  OpenAI: ${hasOpenAI() ? '✅ Enabled' : '⚠️  Disabled'}`)
  console.log(`  Whop Payment: ${hasWhopPayment() ? '✅ Enabled' : '⚠️  Disabled'}`)
  console.log(`  Rate Limiting: ${hasRateLimiting() ? '✅ Enabled' : '⚠️  Disabled'}`)
  console.log(`  Sentry: ${hasSentryMonitoring() ? '✅ Enabled' : '⚠️  Disabled'}`)
  console.log(`  App URL: ${getAppUrl()}`)
}

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags() {
  return {
    enableOpenAI: hasOpenAI(),
    enablePayments: hasWhopPayment(),
    enableRateLimiting: hasRateLimiting(),
    enableMonitoring: hasSentryMonitoring(),
    enableMockData: isDevelopment(),
  }
}

// Run validation on module load (fail fast)
if (typeof window === 'undefined') {
  // Server-side only
  logEnvironmentConfig()
} else {
  // Client-side: validate no leaks
  validateClientSideEnv()
}
