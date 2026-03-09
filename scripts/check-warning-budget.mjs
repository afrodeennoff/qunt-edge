import { execSync } from 'node:child_process'

const maxWarnings = Number.parseInt(process.env.LINT_WARNING_MAX || '1546', 10)

if (!Number.isFinite(maxWarnings) || maxWarnings < 0) {
  console.error(`[check:warning-budget] Invalid LINT_WARNING_MAX value: ${process.env.LINT_WARNING_MAX}`)
  process.exit(2)
}

let report
try {
  const raw = execSync('npx eslint . -f json', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 })
  report = JSON.parse(raw)
} catch (error) {
  const output = error && typeof error === 'object' && 'stdout' in error ? String(error.stdout || '[]') : '[]'
  try {
    report = JSON.parse(output)
  } catch {
    console.error('[check:warning-budget] Failed to parse eslint JSON output.')
    process.exit(2)
  }
}

const totals = report.reduce(
  (acc, file) => {
    acc.errors += Number(file.errorCount || 0)
    acc.warnings += Number(file.warningCount || 0)
    return acc
  },
  { errors: 0, warnings: 0 }
)

console.log(`[check:warning-budget] errors=${totals.errors} warnings=${totals.warnings} maxWarnings=${maxWarnings}`)

if (totals.errors > 0) {
  console.error('[check:warning-budget] Failing: eslint errors detected.')
  process.exit(1)
}

if (totals.warnings > maxWarnings) {
  console.error(`[check:warning-budget] Failing: warnings ${totals.warnings} exceed budget ${maxWarnings}.`)
  process.exit(1)
}

console.log('[check:warning-budget] Warning budget check passed.')
