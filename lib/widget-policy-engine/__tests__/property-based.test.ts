import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { PolicyEngine } from '../policy-engine'
import { RiskScoreCalculator } from '../risk-calculator'
import { SeverityTier } from '../types'

describe('Property-Based Tests', () => {
  describe('Risk Score Calculations', () => {
    it('should always produce risk scores between 0 and 100', () => {
      const calculator = new RiskScoreCalculator()
      const engine = new PolicyEngine()

      fc.assert(
        fc.asyncProperty(
          fc.record({
            probabilityScore: fc.float({ min: 0, max: 1 }),
            impactWeight: fc.integer({ min: 0, max: 100 }),
            controlEffectiveness: fc.integer({ min: 0, max: 5 }),
          }),
          fc.record({
            widgetId: fc.string(),
            action: fc.string(),
            inputs: fc.constant({}),
            environmentContext: fc.record({
              deploymentEnv: fc.constantFrom<'development' | 'staging' | 'production'>('development', 'staging', 'production'),
              region: fc.string(),
              telemetryEnabled: fc.boolean(),
            }),
          }),
          async (assessment, context) => {
            const manifest = {
              schemaVersion: '1.0.0',
              widgetId: context.widgetId,
              widgetVersion: '1.0.0',
              policyVersion: '1.0.0',
              riskAssessment: {
                severityTier: 'Medium' as SeverityTier,
                ...assessment,
                residualRiskScore: 0,
              },
              features: [],
              dataHandling: {
                inputSchema: 'widget-input.schema.json',
                outputSchema: 'widget-output.schema.json',
                dataClassification: 'internal' as const,
                encryptionRequired: false,
                auditLogging: true,
                retentionPeriod: '90d',
              },
              compliance: {
                frameworks: [],
                auditHistory: [],
                signoffs: [],
              },
              slos: {
                p99LatencyMs: 200,
                errorRate: 0.001,
                riskScoreDrift: 0.05,
                availability: 0.99,
              },
              lastUpdated: new Date(),
            }

            const result = await engine.evaluateRisk(context, manifest)
            return result.riskScore >= 0 && result.riskScore <= 100
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should produce monotonic risk scores with respect to probability', () => {
      const calculator = new RiskScoreCalculator()
      const engine = new PolicyEngine()

      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }).chain(impact =>
            fc.integer({ min: 0, max: 5 }).map(control => ({ impact, control }))
          ),
          fc.float({ min: 0.3, max: 0.7 }),
          fc.float({ min: 0.01, max: 0.2 }),
          async ({ impact, control }, prob1, prob2) => {
            if (prob1 === prob2) return true

            const [lowProb, highProb] = prob1 < prob2 ? [prob1, prob2] : [prob2, prob1]

            const manifest1 = {
              schemaVersion: '1.0.0',
              widgetId: 'test-widget',
              widgetVersion: '1.0.0',
              policyVersion: '1.0.0',
              riskAssessment: {
                severityTier: 'Medium' as SeverityTier,
                probabilityScore: lowProb,
                impactWeight: impact,
                controlEffectiveness: control,
                residualRiskScore: 0,
              },
              features: [],
              dataHandling: {
                inputSchema: 'widget-input.schema.json',
                outputSchema: 'widget-output.schema.json',
                dataClassification: 'internal' as const,
                encryptionRequired: false,
                auditLogging: true,
                retentionPeriod: '90d',
              },
              compliance: {
                frameworks: [],
                auditHistory: [],
                signoffs: [],
              },
              slos: {
                p99LatencyMs: 200,
                errorRate: 0.001,
                riskScoreDrift: 0.05,
                availability: 0.99,
              },
              lastUpdated: new Date(),
            }

            const manifest2 = { ...manifest1, riskAssessment: { ...manifest1.riskAssessment, probabilityScore: highProb } }

            const context = {
              widgetId: 'test-widget',
              action: 'test',
              inputs: {},
              environmentContext: {
                deploymentEnv: 'development' as const,
                region: 'us-east-1',
                telemetryEnabled: true,
              },
            }

            const result1 = await engine.evaluateRisk(context, manifest1)
            const result2 = await engine.evaluateRisk(context, manifest2)

            return result2.riskScore >= result1.riskScore
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Decision Consistency', () => {
    it('should consistently map risk scores to decisions', () => {
      const engine = new PolicyEngine()

      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          async (riskScore) => {
            const manifest = {
              schemaVersion: '1.0.0',
              widgetId: 'test-widget',
              widgetVersion: '1.0.0',
              policyVersion: '1.0.0',
              riskAssessment: {
                severityTier: 'Medium' as SeverityTier,
                probabilityScore: 0.5,
                impactWeight: 50,
                controlEffectiveness: 3,
                residualRiskScore: riskScore,
              },
              features: [],
              dataHandling: {
                inputSchema: 'widget-input.schema.json',
                outputSchema: 'widget-output.schema.json',
                dataClassification: 'internal' as const,
                encryptionRequired: false,
                auditLogging: true,
                retentionPeriod: '90d',
              },
              compliance: {
                frameworks: [],
                auditHistory: [],
                signoffs: [],
              },
              slos: {
                p99LatencyMs: 200,
                errorRate: 0.001,
                riskScoreDrift: 0.05,
                availability: 0.99,
              },
              lastUpdated: new Date(),
            }

            const context = {
              widgetId: 'test-widget',
              action: 'test',
              inputs: {},
              environmentContext: {
                deploymentEnv: 'development' as const,
                region: 'us-east-1',
                telemetryEnabled: true,
              },
            }

            const result = await engine.evaluateRisk(context, manifest)

            if (riskScore >= 80) {
              return result.decision === 'red'
            } else if (riskScore >= 40) {
              return result.decision === 'amber' || result.decision === 'red'
            } else {
              return result.decision === 'green' || result.decision === 'amber'
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Manifest Validation', () => {
    it('should reject manifests with invalid SLOs', () => {
      const engine = new PolicyEngine()

      fc.assert(
        fc.property(
          fc.integer({ min: 301, max: 1000 }),
          fc.float({ min: 0.0011, max: 0.1 }),
          fc.float({ min: 0.051, max: 1 }),
          (latency, errorRate, drift) => {
            const manifest = {
              schemaVersion: '1.0.0',
              widgetId: 'test-widget',
              widgetVersion: '1.0.0',
              policyVersion: '1.0.0',
              riskAssessment: {
                severityTier: 'Medium' as SeverityTier,
                probabilityScore: 0.5,
                impactWeight: 50,
                controlEffectiveness: 3,
                residualRiskScore: 30,
              },
              features: [],
              dataHandling: {
                inputSchema: 'widget-input.schema.json',
                outputSchema: 'widget-output.schema.json',
                dataClassification: 'internal' as const,
                encryptionRequired: false,
                auditLogging: true,
                retentionPeriod: '90d',
              },
              compliance: {
                frameworks: [],
                auditHistory: [],
                signoffs: [],
              },
              slos: {
                p99LatencyMs: latency,
                errorRate,
                riskScoreDrift: drift,
                availability: 0.99,
              },
              lastUpdated: new Date(),
            }

            const result = engine.validatePolicyManifest(manifest)
            return !result.valid || result.warnings.length > 0
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Mitigation Strategies', () => {
    it('should always provide at least one mitigation for non-green decisions', () => {
      const engine = new PolicyEngine()

      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 40, max: 100 }),
          async (riskScore) => {
            const manifest = {
              schemaVersion: '1.0.0',
              widgetId: 'test-widget',
              widgetVersion: '1.0.0',
              policyVersion: '1.0.0',
              riskAssessment: {
                severityTier: 'High' as SeverityTier,
                probabilityScore: 0.5,
                impactWeight: 50,
                controlEffectiveness: 3,
                residualRiskScore: riskScore,
              },
              features: [],
              dataHandling: {
                inputSchema: 'widget-input.schema.json',
                outputSchema: 'widget-output.schema.json',
                dataClassification: 'internal' as const,
                encryptionRequired: false,
                auditLogging: true,
                retentionPeriod: '90d',
              },
              compliance: {
                frameworks: [],
                auditHistory: [],
                signoffs: [],
              },
              slos: {
                p99LatencyMs: 200,
                errorRate: 0.001,
                riskScoreDrift: 0.05,
                availability: 0.99,
              },
              lastUpdated: new Date(),
            }

            const context = {
              widgetId: 'test-widget',
              action: 'delete',
              inputs: {},
              environmentContext: {
                deploymentEnv: 'production' as const,
                region: 'us-east-1',
                telemetryEnabled: true,
              },
            }

            const result = await engine.evaluateRisk(context, manifest)

            if (result.decision !== 'green') {
              return result.mitigations.length > 0
            }
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
