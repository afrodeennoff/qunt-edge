import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import manifestSchema from '../../schemas/widget-policy-manifest.schema.json'
import inputSchema from '../../schemas/widget-input.schema.json'
import outputSchema from '../../schemas/widget-output.schema.json'
import { WidgetPolicyManifest } from './types'

export class SchemaValidator {
  private ajv: Ajv
  private manifestValidator: ValidateFunction
  private inputValidator: ValidateFunction
  private outputValidator: ValidateFunction

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    })
    addFormats(this.ajv)

    this.manifestValidator = this.ajv.compile(manifestSchema)
    this.inputValidator = this.ajv.compile(inputSchema)
    this.outputValidator = this.ajv.compile(outputSchema)
  }

  validateManifest(manifest: unknown): SchemaValidationResult {
    const valid = this.manifestValidator(manifest)

    if (!valid && this.manifestValidator.errors) {
      const errors = this.manifestValidator.errors.map(error => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown error',
        keyword: error.keyword,
        params: error.params,
      }))

      return {
        valid: false,
        errors,
        warnings: this.generateManifestWarnings(manifest as WidgetPolicyManifest),
      }
    }

    return {
      valid: true,
      errors: [],
      warnings: this.generateManifestWarnings(manifest as WidgetPolicyManifest),
    }
  }

  validateWidgetInput(input: unknown): SchemaValidationResult {
    const valid = this.inputValidator(input)

    if (!valid && this.inputValidator.errors) {
      const errors = this.inputValidator.errors.map(error => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown error',
        keyword: error.keyword,
        params: error.params,
      }))

      return {
        valid: false,
        errors,
        warnings: [],
      }
    }

    return { valid: true, errors: [], warnings: [] }
  }

  validateWidgetOutput(output: unknown): SchemaValidationResult {
    const valid = this.outputValidator(output)

    if (!valid && this.outputValidator.errors) {
      const errors = this.outputValidator.errors.map(error => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown error',
        keyword: error.keyword,
        params: error.params,
      }))

      return {
        valid: false,
        errors,
        warnings: [],
      }
    }

    return { valid: true, errors: [], warnings: [] }
  }

  validateBatch(items: Array<{ type: 'manifest' | 'input' | 'output'; data: unknown }>): BatchValidationResult {
    const results: Map<string, SchemaValidationResult> = new Map()
    let overallValid = true

    items.forEach((item, index) => {
      const key = `${item.type}-${index}`
      let result: SchemaValidationResult

      switch (item.type) {
        case 'manifest':
          result = this.validateManifest(item.data)
          break
        case 'input':
          result = this.validateWidgetInput(item.data)
          break
        case 'output':
          result = this.validateWidgetOutput(item.data)
          break
        default:
          result = {
            valid: false,
            errors: [{ path: 'root', message: `Unknown type: ${item.type}`, keyword: 'type', params: {} }],
            warnings: [],
          }
      }

      results.set(key, result)
      if (!result.valid) overallValid = false
    })

    return {
      overallValid,
      results: Object.fromEntries(results),
      errorCount: Array.from(results.values()).filter(r => !r.valid).length,
    }
  }

  private generateManifestWarnings(manifest: WidgetPolicyManifest): string[] {
    const warnings: string[] = []

    if (!manifest) return warnings

    if (manifest.riskAssessment) {
      if (manifest.riskAssessment.residualRiskScore > 50) {
        warnings.push('High residual risk score detected - consider additional controls')
      }

      if (manifest.riskAssessment.controlEffectiveness < 3) {
        warnings.push('Control effectiveness rating is below recommended minimum (3/5)')
      }
    }

    if (manifest.slos) {
      if (manifest.slos.p99LatencyMs > 250) {
        warnings.push('P99 latency approaching maximum threshold (300ms)')
      }

      if (manifest.slos.errorRate > 0.0005) {
        warnings.push('Error rate approaching maximum threshold (0.1%)')
      }
    }

    if (manifest.features && manifest.features.length > 20) {
      warnings.push('Large number of features may impact maintainability')
    }

    const daysSinceUpdate = (Date.now() - new Date(manifest.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate > 90) {
      warnings.push('Policy manifest has not been updated in over 90 days')
    }

    return warnings
  }

  getSchemaDefinition(schemaType: 'manifest' | 'input' | 'output'): unknown {
    switch (schemaType) {
      case 'manifest':
        return manifestSchema
      case 'input':
        return inputSchema
      case 'output':
        return outputSchema
    }
  }

  addCustomSchema(keyword: string, schema: any | any[]): void {
    this.ajv.addSchema(schema, keyword)
  }
}

export interface SchemaValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
}

export interface ValidationError {
  path: string
  message: string
  keyword: string
  params: any
}

export interface BatchValidationResult {
  overallValid: boolean
  results: Record<string, SchemaValidationResult>
  errorCount: number
}

const singletonInstance = new SchemaValidator()

export function getSchemaValidator(): SchemaValidator {
  return singletonInstance
}
