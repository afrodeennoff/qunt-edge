import {
  PolicyEvaluationContext,
  RiskEvaluationResult,
  DecisionPath,
  RiskLevel,
  SeverityTier,
  WidgetPolicyManifest,
  RiskAssessment,
} from './types'
import { RiskScoreCalculator } from './risk-calculator'
import { DecisionEngine } from './decision-engine'
import { MitigationProvider } from './mitigation-provider'

export interface PolicyEngineConfig {
  strictMode: boolean
  enableTelemetry: boolean
  cacheEnabled: boolean
  cacheTTLMs: number
  auditLogEnabled: boolean
}

export class PolicyEngine {
  private riskCalculator: RiskScoreCalculator
  private decisionEngine: DecisionEngine
  private mitigationProvider: MitigationProvider
  private config: PolicyEngineConfig
  private policyCache: Map<string, { result: RiskEvaluationResult; expiry: number }>
  private auditLog: AuditLogEntry[]

  constructor(config: Partial<PolicyEngineConfig> = {}) {
    this.config = {
      strictMode: false,
      enableTelemetry: true,
      cacheEnabled: true,
      cacheTTLMs: 300000,
      auditLogEnabled: true,
      ...config,
    }
    this.riskCalculator = new RiskScoreCalculator()
    this.decisionEngine = new DecisionEngine(this.config)
    this.mitigationProvider = new MitigationProvider()
    this.policyCache = new Map()
    this.auditLog = []
  }

  async evaluateRisk(
    context: PolicyEvaluationContext,
    manifest: WidgetPolicyManifest
  ): Promise<RiskEvaluationResult> {
    const cacheKey = this.generateCacheKey(context)
    
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    const startTime = Date.now()

    try {
      const riskAssessment = this.riskCalculator.calculateRisk(context, manifest)
      const decisionPath = this.decisionEngine.determinePath(riskAssessment, context)
      const mitigations = this.mitigationProvider.getMitigations(
        riskAssessment.severityTier,
        context.action
      )
      const riskLevel = this.mapSeverityToRiskLevel(riskAssessment.severityTier)

      const result: RiskEvaluationResult = {
        decision: decisionPath.path,
        justification: decisionPath.justification,
        mitigations,
        riskLevel,
        riskScore: riskAssessment.residualRiskScore,
        policyCompliant: this.isPolicyCompliant(manifest, riskAssessment),
        requiresUserConsent: decisionPath.path === 'amber',
        blockAction: decisionPath.path === 'red',
        timestamp: new Date(),
      }

      if (this.config.cacheEnabled) {
        this.setToCache(cacheKey, result)
      }

      if (this.config.auditLogEnabled) {
        this.addToAuditLog({
          context,
          result,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        })
      }

      if (this.config.enableTelemetry) {
        this.emitTelemetry(context, result)
      }

      return result
    } catch (error) {
      if (this.config.strictMode) {
        return {
          decision: 'red',
          justification: `Policy evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          mitigations: ['Block action due to policy engine failure'],
          riskLevel: 'critical',
          riskScore: 100,
          policyCompliant: false,
          requiresUserConsent: false,
          blockAction: true,
          timestamp: new Date(),
        }
      }
      throw error
    }
  }

  validatePolicyManifest(manifest: WidgetPolicyManifest): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!manifest.schemaVersion) {
      errors.push('Missing schema version')
    }

    if (!manifest.widgetId) {
      errors.push('Missing widget ID')
    }

    if (!manifest.policyVersion) {
      errors.push('Missing policy version')
    }

    if (!manifest.riskAssessment) {
      errors.push('Missing risk assessment')
    } else {
      if (manifest.riskAssessment.probabilityScore < 0 || manifest.riskAssessment.probabilityScore > 1) {
        errors.push('Probability score must be between 0 and 1')
      }

      if (manifest.riskAssessment.impactWeight < 0 || manifest.riskAssessment.impactWeight > 100) {
        errors.push('Impact weight must be between 0 and 100')
      }

      if (manifest.riskAssessment.controlEffectiveness < 0 || manifest.riskAssessment.controlEffectiveness > 5) {
        errors.push('Control effectiveness must be between 0 and 5')
      }
    }

    if (!manifest.slos) {
      warnings.push('Missing SLO definitions')
    } else {
      if (manifest.slos.p99LatencyMs > 300) {
        warnings.push('P99 latency exceeds 300ms threshold')
      }

      if (manifest.slos.errorRate > 0.001) {
        warnings.push('Error rate exceeds 0.1% threshold')
      }

      if (manifest.slos.riskScoreDrift > 0.05) {
        errors.push('Risk score drift exceeds 5% threshold')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  getAuditLog(filters?: AuditLogFilter): AuditLogEntry[] {
    let log = [...this.auditLog]

    if (filters) {
      if (filters.widgetId) {
        log = log.filter(entry => entry.context.widgetId === filters.widgetId)
      }

      if (filters.startDate) {
        log = log.filter(entry => entry.timestamp >= filters.startDate!)
      }

      if (filters.endDate) {
        log = log.filter(entry => entry.timestamp <= filters.endDate!)
      }

      if (filters.decision) {
        log = log.filter(entry => entry.result.decision === filters.decision)
      }
    }

    return log.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  clearAuditLog(): void {
    this.auditLog = []
  }

  clearCache(): void {
    this.policyCache.clear()
  }

  private generateCacheKey(context: PolicyEvaluationContext): string {
    return `${context.widgetId}:${context.action}:${JSON.stringify(context.inputs)}`
  }

  private getFromCache(key: string): RiskEvaluationResult | null {
    const cached = this.policyCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.policyCache.delete(key)
      return null
    }

    return cached.result
  }

  private setToCache(key: string, result: RiskEvaluationResult): void {
    this.policyCache.set(key, {
      result,
      expiry: Date.now() + this.config.cacheTTLMs,
    })
  }

  private isPolicyCompliant(
    manifest: WidgetPolicyManifest,
    assessment: RiskAssessment
  ): boolean {
    const validation = this.validatePolicyManifest(manifest)
    if (!validation.valid) return false

    if (manifest.slos && assessment.residualRiskScore > 50) {
      return false
    }

    return true
  }

  private mapSeverityToRiskLevel(severity: SeverityTier): RiskLevel {
    const mapping: Record<SeverityTier, RiskLevel> = {
      Critical: 'critical',
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    }
    return mapping[severity]
  }

  private addToAuditLog(entry: AuditLogEntry): void {
    this.auditLog.push(entry)
    
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000)
    }
  }

  private emitTelemetry(context: PolicyEvaluationContext, result: RiskEvaluationResult): void {
    if (typeof window === 'undefined') return

    const event = {
      type: 'policy_evaluation',
      widgetId: context.widgetId,
      action: context.action,
      decision: result.decision,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      duration: result.timestamp,
      environment: context.environmentContext.deploymentEnv,
    }

    if (this.config.enableTelemetry) {
      console.debug('[PolicyEngine] Telemetry:', event)
    }
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface AuditLogEntry {
  context: PolicyEvaluationContext
  result: RiskEvaluationResult
  duration: number
  timestamp: Date
}

export interface AuditLogFilter {
  widgetId?: string
  startDate?: Date
  endDate?: Date
  decision?: DecisionPath
}

const singletonInstance = new PolicyEngine()

export function getPolicyEngine(): PolicyEngine {
  return singletonInstance
}
