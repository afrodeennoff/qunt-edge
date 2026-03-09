import { RiskAssessment, PolicyEvaluationContext, DecisionPath } from './types'
import { PolicyEngineConfig } from './policy-engine'

export interface DecisionResult {
  path: DecisionPath
  justification: string
  conditions: string[]
}

export class DecisionEngine {
  constructor(private config: PolicyEngineConfig) {}

  determinePath(
    riskAssessment: RiskAssessment,
    context: PolicyEvaluationContext
  ): DecisionResult {
    const riskScore = riskAssessment.residualRiskScore
    const severity = riskAssessment.severityTier

    if (this.shouldBlock(riskAssessment, context)) {
      return {
        path: 'red',
        justification: this.buildBlockJustification(riskAssessment, context),
        conditions: this.getBlockConditions(riskAssessment),
      }
    }

    if (this.shouldRequireConsent(riskAssessment, context)) {
      return {
        path: 'amber',
        justification: this.buildConsentJustification(riskAssessment, context),
        conditions: this.getConsentConditions(riskAssessment),
      }
    }

    return {
      path: 'green',
      justification: this.buildAllowJustification(riskAssessment, context),
      conditions: this.getAllowConditions(riskAssessment),
    }
  }

  private shouldBlock(risk: RiskAssessment, context: PolicyEvaluationContext): boolean {
    if (risk.severityTier === 'Critical') return true
    if (risk.residualRiskScore >= 80) return true
    if (risk.controlEffectiveness < 2 && risk.residualRiskScore >= 50) return true

    if (this.config.strictMode && risk.residualRiskScore >= 60) {
      return true
    }

    if (context.environmentContext.deploymentEnv === 'production' && risk.residualRiskScore >= 70) {
      return true
    }

    return false
  }

  private shouldRequireConsent(risk: RiskAssessment, context: PolicyEvaluationContext): boolean {
    if (risk.severityTier === 'High') return true
    if (risk.residualRiskScore >= 40 && risk.residualRiskScore < 80) return true

    if (context.environmentContext.deploymentEnv === 'production' && risk.residualRiskScore >= 30) {
      return true
    }

    const highRiskActions = ['delete', 'export', 'transfer', 'modify']
    if (highRiskActions.some(action => context.action.toLowerCase().includes(action))) {
      if (risk.residualRiskScore >= 25) return true
    }

    return false
  }

  private buildBlockJustification(risk: RiskAssessment, context: PolicyEvaluationContext): string {
    const reasons: string[] = []

    if (risk.severityTier === 'Critical') {
      reasons.push(`Critical severity tier detected`)
    }

    if (risk.residualRiskScore >= 80) {
      reasons.push(`Residual risk score (${risk.residualRiskScore.toFixed(1)}) exceeds critical threshold`)
    }

    if (risk.controlEffectiveness < 2) {
      reasons.push(`Control effectiveness rating (${risk.controlEffectiveness}/5) below minimum threshold`)
    }

    if (risk.probabilityScore > 0.7) {
      reasons.push(`High probability of occurrence (${(risk.probabilityScore * 100).toFixed(0)}%)`)
    }

    if (risk.impactWeight > 70) {
      reasons.push(`High potential impact (${risk.impactWeight}/100)`)
    }

    return `Action blocked: ${reasons.join('; ')}. Immediate mitigation required.`
  }

  private buildConsentJustification(risk: RiskAssessment, context: PolicyEvaluationContext): string {
    const reasons: string[] = []

    if (risk.severityTier === 'High') {
      reasons.push(`High severity tier`)
    }

    if (risk.residualRiskScore >= 40) {
      reasons.push(`Risk score (${risk.residualRiskScore.toFixed(1)}) requires explicit approval`)
    }

    const actionType = context.action.toLowerCase()
    if (['delete', 'export', 'transfer'].some(risk => actionType.includes(risk))) {
      reasons.push(`${context.action} action requires user confirmation`)
    }

    return `User consent required: ${reasons.join('; ')}. Explicit authorization needed.`
  }

  private buildAllowJustification(risk: RiskAssessment, context: PolicyEvaluationContext): string {
    const factors: string[] = []

    if (risk.residualRiskScore < 25) {
      factors.push(`Residual risk score (${risk.residualRiskScore.toFixed(1)}) within acceptable range`)
    }

    if (risk.controlEffectiveness >= 4) {
      factors.push(`Strong controls in place (${risk.controlEffectiveness}/5)`)
    }

    if (risk.probabilityScore < 0.3) {
      factors.push(`Low probability of occurrence (${(risk.probabilityScore * 100).toFixed(0)}%)`)
    }

    if (risk.impactWeight < 30) {
      factors.push(`Low potential impact (${risk.impactWeight}/100)`)
    }

    return `Action permitted: ${factors.join('; ')}. All controls effective.`
  }

  private getBlockConditions(risk: RiskAssessment): string[] {
    const conditions: string[] = []

    if (risk.controlEffectiveness < 2) {
      conditions.push('Implement additional controls')
      conditions.push('Increase control effectiveness to at least 2/5')
    }

    if (risk.probabilityScore > 0.5) {
      conditions.push('Reduce probability of occurrence')
    }

    if (risk.impactWeight > 50) {
      conditions.push('Implement impact reduction strategies')
    }

    conditions.push('Complete formal risk assessment')
    conditions.push('Obtain security team approval')
    conditions.push('Document compensating controls')

    return conditions
  }

  private getConsentConditions(risk: RiskAssessment): string[] {
    const conditions: string[] = []

    conditions.push('User must explicitly authorize the action')
    conditions.push('Action will be logged for audit purposes')
    conditions.push('Consider implementing additional controls')

    if (risk.probabilityScore > 0.4) {
      conditions.push('Monitor for adverse events')
    }

    return conditions
  }

  private getAllowConditions(risk: RiskAssessment): string[] {
    const conditions: string[] = []

    conditions.push('Continue monitoring for risk changes')
    conditions.push('Maintain current control effectiveness')

    if (risk.residualRiskScore > 15) {
      conditions.push('Schedule periodic review')
    }

    return conditions
  }
}
