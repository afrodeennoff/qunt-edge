import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const targets = ['.next', 'tsconfig.tsbuildinfo']

await Promise.all(
  targets.map(async (target) => {
    try {
      await rm(join(rootDir, target), { recursive: true, force: true })
      console.log(`[clean-build] removed ${target}`)
    } catch (error) {
      console.warn(`[clean-build] failed to remove ${target}`, error)
    }
  })
)
