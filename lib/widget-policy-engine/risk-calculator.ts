import { PolicyEvaluationContext, WidgetPolicyManifest, RiskAssessment, SeverityTier } from './types'

export class RiskScoreCalculator {
  calculateRisk(
    context: PolicyEvaluationContext,
    manifest: WidgetPolicyManifest
  ): RiskAssessment {
    const baseAssessment = manifest.riskAssessment
    const contextualAdjustment = this.calculateContextualAdjustment(context, manifest)
    const featureRisk = this.aggregateFeatureRisks(manifest.features)

    const adjustedProbability = Math.min(
      1,
      Math.max(0, baseAssessment.probabilityScore + contextualAdjustment.probabilityAdjustment)
    )

    const adjustedImpact = Math.min(
      100,
      Math.max(0, baseAssessment.impactWeight + contextualAdjustment.impactAdjustment)
    )

    const residualRisk = this.calculateResidualRisk({
      probabilityScore: adjustedProbability,
      impactWeight: adjustedImpact,
      controlEffectiveness: baseAssessment.controlEffectiveness,
    })

    const severityTier = this.determineSeverityTier(residualRisk)

    return {
      severityTier,
      probabilityScore: adjustedProbability,
      impactWeight: adjustedImpact,
      controlEffectiveness: baseAssessment.controlEffectiveness,
      residualRiskScore: residualRisk,
    }
  }

  private calculateContextualAdjustment(
    context: PolicyEvaluationContext,
    manifest: WidgetPolicyManifest
  ): { probabilityAdjustment: number; impactAdjustment: number } {
    let probabilityAdjustment = 0
    let impactAdjustment = 0

    if (context.environmentContext.deploymentEnv === 'production') {
      probabilityAdjustment += 0.1
      impactAdjustment += 10
    } else if (context.environmentContext.deploymentEnv === 'development') {
      probabilityAdjustment -= 0.2
      impactAdjustment -= 20
    }

    if (context.userContext) {
      const trustLevel = context.userContext.trustLevel
      if (trustLevel < 0.3) {
        probabilityAdjustment += 0.15
        impactAdjustment += 15
      } else if (trustLevel > 0.8) {
        probabilityAdjustment -= 0.1
        impactAdjustment -= 10
      }

      const hasAdminRole = context.userContext.roles.includes('admin')
      if (!hasAdminRole) {
        probabilityAdjustment += 0.05
      }
    }

    const actionRisk = this.getActionRiskModifier(context.action)
    probabilityAdjustment += actionRisk

    return { probabilityAdjustment, impactAdjustment }
  }

  private getActionRiskModifier(action: string): number {
    const highRiskActions = ['delete', 'update', 'export', 'transfer', 'modify']
    const mediumRiskActions = ['create', 'import', 'share']
    const lowRiskActions = ['view', 'read', 'list', 'get']

    const actionLower = action.toLowerCase()

    if (highRiskActions.some(risk => actionLower.includes(risk))) {
      return 0.2
    }

    if (mediumRiskActions.some(risk => actionLower.includes(risk))) {
      return 0.1
    }

    if (lowRiskActions.some(risk => actionLower.includes(risk))) {
      return -0.05
    }

    return 0
  }

  private aggregateFeatureRisks(features: WidgetPolicyManifest['features']): number {
    if (!features || features.length === 0) return 0

    const totalRisk = features.reduce((sum, feature) => {
      const tierMultiplier: Record<SeverityTier, number> = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      }
      return sum + (feature.residualRiskScore * tierMultiplier[feature.riskTier])
    }, 0)

    return totalRisk / features.length
  }

  private calculateResidualRisk(assessment: {
    probabilityScore: number
    impactWeight: number
    controlEffectiveness: number
  }): number {
    const controlFactor = assessment.controlEffectiveness / 5
    const rawRisk = assessment.probabilityScore * assessment.impactWeight
    const mitigatedRisk = rawRisk * (1 - (controlFactor * 0.7))

    return Math.min(100, Math.max(0, mitigatedRisk))
  }

  private determineSeverityTier(riskScore: number): SeverityTier {
    if (riskScore >= 75) return 'Critical'
    if (riskScore >= 50) return 'High'
    if (riskScore >= 25) return 'Medium'
    return 'Low'
  }

  runMonteCarloSimulation(
    context: PolicyEvaluationContext,
    manifest: WidgetPolicyManifest,
    iterations: number = 10000
  ): { meanRisk: number; percentile95: number; percentile99: number; distribution: number[] } {
    const risks: number[] = []

    for (let i = 0; i < iterations; i++) {
      const simulatedContext = this.simulateContextVariation(context)
      const risk = this.calculateRisk(simulatedContext, manifest)
      risks.push(risk.residualRiskScore)
    }

    risks.sort((a, b) => a - b)

    const meanRisk = risks.reduce((sum, r) => sum + r, 0) / iterations
    const percentile95 = risks[Math.floor(iterations * 0.95)]
    const percentile99 = risks[Math.floor(iterations * 0.99)]

    return {
      meanRisk,
      percentile95,
      percentile99,
      distribution: risks,
    }
  }

  private simulateContextVariation(context: PolicyEvaluationContext): PolicyEvaluationContext {
    const variationFactor = 0.1

    return {
      ...context,
      userContext: context.userContext ? {
        ...context.userContext,
        trustLevel: Math.max(0, Math.min(1, 
          context.userContext.trustLevel + (Math.random() - 0.5) * variationFactor
        )),
      } : undefined,
    }
  }
}
