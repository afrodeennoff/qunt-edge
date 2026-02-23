import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const isProduction = process.env.NODE_ENV === 'production'
const isNextBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const selectRuntimeConnectionString = (): string => {
  // Prefer provider-specific pooled URLs when available.
  return (
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  )
}

const normalizeSupabasePoolerMode = (connectionString: string): string => {
  if (!connectionString) return ''

  try {
    const url = new URL(connectionString)
    const isSupabasePooler = url.hostname.endsWith('.pooler.supabase.com')

    // Session mode (5432) can hit "max clients reached" in serverless bursts.
    // Transaction mode (6543) is safer for Prisma runtime queries.
    if (isSupabasePooler && url.port === '5432') {
      url.port = '6543'
      if (isProduction) {
        console.warn('[Prisma] Supabase Session mode URL detected. Switching runtime DB port 5432 -> 6543 (transaction pooler).')
      }
      return url.toString()
    }
  } catch {
    return connectionString
  }

  return connectionString
}

const forceIPv4ConnectionString = (connectionString: string): string => {
  if (!connectionString) return ''
  try {
    const url = new URL(connectionString)

    if (url.hostname.includes(':')) {
      return connectionString
    }

    const family = 4
    const separator = connectionString.includes('?') ? '&' : '?'
    return `${connectionString}${separator}family=${family}`
  } catch {
    return connectionString
  }
}

const parseBooleanEnv = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

const shouldEnableSsl = (connectionString: string): boolean => {
  const override = parseBooleanEnv(process.env.PGSSL_ENABLE)
  if (override !== undefined) return override
  if (!connectionString) return false

  try {
    const url = new URL(connectionString)
    const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
    if (sslMode === 'disable') return false
    if (sslMode) return true
  } catch {
    // Fall back to production default.
  }

  return isProduction
}

const shouldRejectUnauthorized = (connectionString: string): boolean => {
  const override = parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED)
  if (override !== undefined) return override

  if (connectionString) {
    try {
      const url = new URL(connectionString)
      const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
      const isSupabasePooler = url.hostname.endsWith('.pooler.supabase.com')

      // Align TLS verification behavior with libpq sslmode semantics.
      // - verify-full / verify-ca: verify certificate chain.
      // - require / prefer / allow: encrypt transport without strict verification.
      if (sslMode === 'verify-full' || sslMode === 'verify-ca') return true
      if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'allow') return false
      if (isSupabasePooler) return false
    } catch {
      // Fall through to production default.
    }
  }

  // Secure-by-default fallback in production. Opt out explicitly with PGSSL_REJECT_UNAUTHORIZED=false.
  return isProduction
}

// Runtime should prefer pooled DATABASE_URL (Supabase pooler).
// DIRECT_URL is intended for migrations/admin operations.
const connectionString = normalizeSupabasePoolerMode(selectRuntimeConnectionString())
const parsedPoolMax = Number.parseInt(process.env.PG_POOL_MAX ?? '', 10)
const poolMax = Number.isFinite(parsedPoolMax) && parsedPoolMax > 0 ? parsedPoolMax : isProduction ? (isNextBuildPhase ? 1 : 2) : 5
const parsedIdleTimeout = Number.parseInt(process.env.PG_POOL_IDLE_TIMEOUT_MS ?? '', 10)
const idleTimeoutMillis = Number.isFinite(parsedIdleTimeout) && parsedIdleTimeout > 0 ? parsedIdleTimeout : 10000
const parsedConnTimeout = Number.parseInt(process.env.PG_POOL_CONNECT_TIMEOUT_MS ?? '', 10)
const connectionTimeoutMillis = Number.isFinite(parsedConnTimeout) && parsedConnTimeout > 0 ? parsedConnTimeout : 15000

const poolConfig: pg.PoolConfig = {
  connectionString: forceIPv4ConnectionString(connectionString),
  max: poolMax,
  idleTimeoutMillis,
  connectionTimeoutMillis,
}

if (shouldEnableSsl(connectionString)) {
  const rejectUnauthorized = shouldRejectUnauthorized(connectionString)
  poolConfig.ssl = { rejectUnauthorized }
  const explicitInsecureTls = parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED) === false

  if (isProduction && !isNextBuildPhase && rejectUnauthorized === false && explicitInsecureTls) {
    console.warn(
      "[Prisma] SSL certificate verification is disabled (PGSSL_REJECT_UNAUTHORIZED=false). " +
      "Enable certificate verification in production unless your provider explicitly requires insecure TLS."
    )
  }
}

const pool = globalForPrisma.pool ?? new pg.Pool(poolConfig)

if (isProduction && !isNextBuildPhase) {
  console.info('[Prisma] Pool initialized', {
    host: (() => {
      try {
        return new URL(poolConfig.connectionString ?? '').host
      } catch {
        return 'unknown'
      }
    })(),
    max: poolConfig.max,
    idleTimeoutMillis: poolConfig.idleTimeoutMillis,
    connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
    ssl: Boolean(poolConfig.ssl),
    rejectUnauthorized:
      typeof poolConfig.ssl === 'object' ? poolConfig.ssl.rejectUnauthorized : undefined,
  })
}

pool.on('error', (err) => {
  console.error('[Prisma] Unexpected error on idle client', err)
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

globalForPrisma.prisma = prisma
globalForPrisma.pool = pool
