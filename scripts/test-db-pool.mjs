#!/usr/bin/env node

/**
 * Database Pool Load Test
 *
 * Tests Prisma connection pool under concurrent load to verify
 * pool sizing and connection handling behavior.
 *
 * Usage: node scripts/test-db-pool.mjs [concurrency]
 * Example: node scripts/test-db-pool.mjs 30
 */

import { PrismaClient } from '../prisma/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Load connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or POSTGRES_URL environment variable is required')
  process.exit(1)
}

// Create connection pool
const pool = new pg.Pool({
  connectionString,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

async function testPoolLoad(concurrency = 30) {
  console.log(`\n🔍 Testing DB pool with ${concurrency} concurrent queries...`)
  console.log(`⏱️  Started at: ${new Date().toISOString()}\n`)

  const startTime = Date.now()

  // Create concurrent queries
  const promises = Array.from({ length: concurrency }, async (_, i) => {
    const queryStart = Date.now()
    try {
      // Simple query to test connection
      await prisma.user.findFirst({
        select: { id: true },
      })

      const duration = Date.now() - queryStart
      const success = '✅'
      console.log(`${success} Query ${String(i + 1).padStart(2, '0')}: ${String(duration).padStart(4, ' ')}ms`)

      return { success: true, duration }
    } catch (error) {
      const duration = Date.now() - queryStart
      const failure = '❌'
      console.error(`${failure} Query ${String(i + 1).padStart(2, '0')}: ${String(duration).padStart(4, ' ')}ms - ${error.message}`)

      return { success: false, duration, error: error.message }
    }
  })

  const results = await Promise.all(promises)
  const totalDuration = Date.now() - startTime

  // Calculate statistics
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const successRate = ((successful.length / concurrency) * 100).toFixed(1)
  const avgDuration = (results.reduce((sum, r) => sum + r.duration, 0) / concurrency).toFixed(0)
  const maxDuration = Math.max(...results.map(r => r.duration))
  const minDuration = Math.min(...results.map(r => r.duration))

  // Print summary
  console.log('\n📊 Test Results:')
  console.log(`   Total queries:   ${concurrency}`)
  console.log(`   Successful:      ${successful.length} (${successRate}%)`)
  console.log(`   Failed:          ${failed.length}`)
  console.log(`   Avg duration:    ${avgDuration}ms`)
  console.log(`   Min duration:    ${minDuration}ms`)
  console.log(`   Max duration:    ${maxDuration}ms`)
  console.log(`   Total time:      ${totalDuration}ms`)
  console.log(`   Queries/sec:     ${(concurrency / (totalDuration / 1000)).toFixed(1)}`)

  // Print verdict
  console.log('\n✨ Verdict:')

  if (failed.length === 0 && Number.parseInt(avgDuration, 10) < 100) {
    console.log('   ✅ PASS: All queries succeeded with good performance')
  } else if (failed.length === 0) {
    console.log('   ⚠️  WARN: All queries succeeded but performance could be better')
  } else {
    console.log(`   ❌ FAIL: ${failed.length} queries failed`)
    console.log('\n🔍 Failure details:')
    failed.forEach((result, i) => {
      console.log(`   - Query ${i + 1}: ${result.error}`)
    })
  }

  console.log(`\n⏱️  Finished at: ${new Date().toISOString()}\n`)

  await prisma.$disconnect()

  return failed.length === 0 ? 0 : 1
}

// Get concurrency from CLI args or default to 30
const concurrency = Number.parseInt(process.argv[2] || '30', 10)

if (concurrency < 1 || concurrency > 100) {
  console.error('❌ Error: Concurrency must be between 1 and 100')
  process.exit(1)
}

// Run test
testPoolLoad(concurrency)
  .then((exitCode) => {
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
