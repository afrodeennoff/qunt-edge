import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const isProduction = process.env.NODE_ENV === 'production'

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
  } catch (error) {
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
  } catch (error) {
    return connectionString
  }
}

// Runtime should prefer pooled DATABASE_URL (Supabase pooler).
// DIRECT_URL is intended for migrations/admin operations.
const connectionString = normalizeSupabasePoolerMode(selectRuntimeConnectionString())
const parsedPoolMax = Number.parseInt(process.env.PG_POOL_MAX ?? '', 10)
const poolMax = Number.isFinite(parsedPoolMax) && parsedPoolMax > 0 ? parsedPoolMax : isProduction ? 2 : 5
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

const pool = globalForPrisma.pool ?? new pg.Pool(poolConfig)

if (isProduction) {
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
