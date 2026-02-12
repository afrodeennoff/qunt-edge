import { beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let prisma: PrismaClient | null = null
let pool: pg.Pool | null = null
let hasDatabase = false

declare global {
   
  var prisma: PrismaClient
   
  var pool: pg.Pool
}

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL

  if (!connectionString) {
    // Payment/integration tests are opt-in. Keep setup non-fatal when DB is absent.
    // This prevents global setup from failing suites that are intentionally skipped.
     
    console.warn('[tests/setup] DATABASE_URL not configured - DB-backed tests will be skipped/no-op')
    hasDatabase = false
    return
  }

  pool = new pg.Pool({
    connectionString,
    max: 1,
  })

  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
  hasDatabase = true

  globalThis.prisma = prisma
  globalThis.pool = pool
})

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (pool) {
    await pool.end()
  }
})

beforeEach(async () => {
  if (!hasDatabase || !prisma) return

  const tables = [
    'PaymentTransaction',
    'Invoice',
    'Refund',
    'SubscriptionEvent',
    'PaymentMethod',
    'Promotion',
    'UsageMetric',
    'Subscription',
  ]

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE public."${table}" CASCADE;`)
    } catch (error) {
      console.warn(`Could not truncate table ${table}:`, error)
    }
  }
})

export { prisma }
