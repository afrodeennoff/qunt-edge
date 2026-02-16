import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const appDir = path.resolve(__dirname, '../app')
const outputFilePath = path.resolve(__dirname, '../public/routes.json')

// Directories to skip entirely
const SKIP_DIRS = new Set(['api', 'admin', 'components', 'utils', 'styles'])

function normalizeSegment(segment) {
  // Remove route group parentheses: (landing) -> empty string (skip in URL)
  if (segment.startsWith('(') && segment.endsWith(')')) {
    return '' // Route groups don't appear in URLs
  }
  return segment
}

function collectRoutes(dir, relativeParts = []) {
  const routes = []

  if (!fs.existsSync(dir)) return routes

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  // Skip unwanted directories
  const currentName = path.basename(dir)
  if (SKIP_DIRS.has(currentName)) return routes

  const hasPage = entries.some(e => e.isFile() && (e.name === 'page.tsx' || e.name === 'page.js' || e.name === 'page.jsx'))

  if (hasPage) {
    const normalized = relativeParts
      .map(normalizeSegment)
      .filter(Boolean) // Remove empty strings from route groups
    const routePath = '/' + normalized.join('/')
    routes.push(routePath === '/' ? '/' : routePath)
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      routes.push(
        ...collectRoutes(path.join(dir, entry.name), [...relativeParts, entry.name])
      )
    }
  }

  return routes
}

const allRoutes = collectRoutes(appDir)
const uniqueRoutes = Array.from(new Set(allRoutes)).sort()

fs.mkdirSync(path.dirname(outputFilePath), { recursive: true })
fs.writeFileSync(outputFilePath, JSON.stringify(uniqueRoutes, null, 2))

console.log(`Generated ${uniqueRoutes.length} routes`)
