#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REQUIRED_MANIFEST_FIELDS = [
  'schemaVersion',
  'widgetId',
  'widgetVersion',
  'policyVersion',
  'riskAssessment',
  'features',
  'dataHandling',
  'compliance',
  'slos',
  'lastUpdated'
]

function checkManifests() {
  const errors = []
  const warnings = []
  const widgetsDir = path.join(process.cwd(), 'app/[locale]/dashboard/components/widgets')
  
  if (!fs.existsSync(widgetsDir)) {
    errors.push(`Widgets directory not found: ${widgetsDir}`)
    return { errors, warnings }
  }

  const widgetFiles = fs.readdirSync(widgetsDir)
    .filter((file) => file.endsWith('-widget.tsx') || file.endsWith('-widget.ts'))

  console.log(`Checking ${widgetFiles.length} widget files...`)

  for (const file of widgetFiles) {
    const widgetName = file.replace(/\-widget\.(tsx|ts)$/, '')
    const manifestPath = path.join(process.cwd(), 'widgets', widgetName, 'manifest.json')
    
    if (!fs.existsSync(manifestPath)) {
      warnings.push(`Missing manifest for widget: ${widgetName}`)
      continue
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      
      for (const field of REQUIRED_MANIFEST_FIELDS) {
        if (!(field in manifest)) {
          errors.push(`Missing required field "${field}" in ${widgetName} manifest`)
        }
      }

      if (manifest.riskAssessment) {
        if (manifest.riskAssessment.probabilityScore < 0 || manifest.riskAssessment.probabilityScore > 1) {
          errors.push(`Invalid probabilityScore in ${widgetName} manifest`)
        }
        if (manifest.riskAssessment.impactWeight < 0 || manifest.riskAssessment.impactWeight > 100) {
          errors.push(`Invalid impactWeight in ${widgetName} manifest`)
        }
        if (manifest.riskAssessment.controlEffectiveness < 0 || manifest.riskAssessment.controlEffectiveness > 5) {
          errors.push(`Invalid controlEffectiveness in ${widgetName} manifest`)
        }
      }

      if (manifest.slos) {
        if (manifest.slos.p99LatencyMs > 300) {
          warnings.push(`P99 latency exceeds threshold in ${widgetName}`)
        }
        if (manifest.slos.errorRate > 0.001) {
          warnings.push(`Error rate exceeds threshold in ${widgetName}`)
        }
      }

      const lastUpdated = new Date(manifest.lastUpdated)
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate > 90) {
        warnings.push(`Manifest for ${widgetName} has not been updated in ${Math.floor(daysSinceUpdate)} days`)
      }

      console.log(`✓ ${widgetName} manifest valid`)
    } catch (error) {
      errors.push(`Failed to parse manifest for ${widgetName}: ${error.message}`)
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Errors found:')
    errors.forEach(error => console.error(`  - ${error}`))
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (errors.length > 0) {
    process.exit(1)
  }

  console.log('\n✅ All manifest checks passed')
  return { errors, warnings }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  checkManifests()
}

export { checkManifests }
