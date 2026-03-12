#!/usr/bin/env node

/**
 * Performance Optimization Rollout Script
 *
 * This script automates the rollout of performance optimizations to Vercel.
 * It updates the NEXT_PUBLIC_PERF_ROLLOUT_PCT environment variable.
 *
 * Usage:
 *   node scripts/perf-rollout.mjs <percentage>
 *
 * Examples:
 *   node scripts/perf-rollout.mjs 10    # Roll out to 10% of users
 *   node scripts/perf-rollout.mjs 50    # Roll out to 50% of users
 *   node scripts/perf-rollout.mjs 100   # Full rollout
 *
 * Safety recommendations:
 * - Start with 10% and monitor for 1 hour
 * - Increase to 25% if metrics look good
 * - Increase to 50% after another hour
 * - Proceed to 100% only after confirmed stability
 */

import { execSync } from 'child_process'

function main() {
  const args = process.argv.slice(2)
  const PERCENTAGE = args[0] || '10'

  // Validate input
  const pct = Number(PERCENTAGE)
  if (isNaN(pct) || pct < 0 || pct > 100) {
    console.error('❌ Error: Percentage must be a number between 0 and 100')
    console.error('Usage: node scripts/perf-rollout.mjs <percentage>')
    console.error('Example: node scripts/perf-rollout.mjs 10')
    process.exit(1)
  }

  console.log(`\n🚀 Performance Optimization Rollout`)
  console.log(`📊 Target: ${pct}% of users`)
  console.log(`⏰ Started: ${new Date().toISOString()}\n`)

  // Safety warnings for high rollouts
  if (pct >= 50) {
    console.log('⚠️  WARNING: Rolling out to 50% or more of users')
    console.log('   Ensure you have monitored metrics at lower percentages first!\n')
  }

  if (pct === 100) {
    console.log('⚠️  WARNING: Full rollout (100%)')
    console.log('   This will affect ALL users. Ensure emergency rollback is ready!\n')
  }

  try {
    // Update Vercel environment variable
    console.log('🔧 Updating Vercel environment variable...')

    const command = `vercel env add NEXT_PUBLIC_PERF_ROLLOUT_PCT ${pct}`

    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
      }
    })

    console.log('\n✅ Rollout complete!')
    console.log(`\n📈 Next steps:`)
    console.log(`   1. Monitor metrics for ${pct < 100 ? '1 hour' : '2 hours'}`)
    console.log(`   2. Check error rates, page load times, and user feedback`)
    console.log(`   3. If metrics look good, increase rollout gradually`)
    console.log(`   4. If issues arise, use emergency rollback:`)
    console.log(`      vercel env add NEXT_PUBLIC_EMERGENCY_ROLLBACK true`)

    if (pct < 100) {
      console.log(`\n💡 To increase rollout:`)
      console.log(`   node scripts/perf-rollout.mjs ${Math.min(pct + 25, 100)}`)
    }

  } catch (error) {
    console.error('\n❌ Rollout failed!')
    console.error('   Make sure you have Vercel CLI installed and authenticated:')
    console.error('   npm i -g vercel')
    console.error('   vercel login')
    process.exit(1)
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main }
