import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const IGNORE_DIRS = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'out'])

const forbiddenFilePatterns = [
  /^patch_.*\.py$/,
  /^test_frontend\d*\.py$/,
  /^find_gradients\.py$/,
  /^fix_gradients\.py$/,
  /^remove_gradients\.js$/,
]

const findings = []

function scanDir(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue
      }
      scanDir(path.join(currentDir, entry.name))
      continue
    }

    for (const pattern of forbiddenFilePatterns) {
      if (pattern.test(entry.name)) {
        findings.push(path.relative(ROOT, path.join(currentDir, entry.name)))
        break
      }
    }
  }
}

scanDir(ROOT)

if (findings.length > 0) {
  console.error('[dead-code-check] Forbidden transient files found:')
  for (const file of findings.sort()) {
    console.error(` - ${file}`)
  }
  console.error('[dead-code-check] Remove these files before merging.')
  process.exit(1)
}

console.log('[dead-code-check] OK: no forbidden transient files found.')
