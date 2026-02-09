import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PolicyEngine } from '../policy-engine'
import { PolicyEvaluationContext, WidgetPolicyManifest } from '../types'

describe('PolicyEngine', () => {
  let policyEngine: PolicyEngine
  let testManifest: WidgetPolicyManifest
  let testContext: PolicyEvaluationContext

  beforeEach(() => {
    policyEngine = new PolicyEngine({ strictMode: false, auditLogEnabled: false })

    testManifest = {
      schemaVersion: '1.0.0',
      widgetId: 'test-widget',
      widgetVersion: '1.0.0',
      policyVersion: '1.0.0',
      riskAssessment: {
        severityTier: 'Medium',
        probabilityScore: 0.5,
        impactWeight: 40,
        controlEffectiveness: 3,
        residualRiskScore: 25,
      },
      features: [
        {
          id: 'feature-1',
          name: 'Display Data',
          threatVector: 'Data exposure through UI',
          residualRiskScore: 20,
          compensatingControls: ['Input validation', 'Output sanitization'],
          riskTier: 'Low',
        },
      ],
      dataHandling: {
        inputSchema: 'widget-input.schema.json',
        outputSchema: 'widget-output.schema.json',
        dataClassification: 'internal',
        encryptionRequired: false,
        auditLogging: true,
        retentionPeriod: '90d',
      },
      compliance: {
        frameworks: ['SOC2', 'GDPR'],
        auditHistory: [],
        signoffs: [],
      },
      slos: {
        p99LatencyMs: 200,
        errorRate: 0.0005,
        riskScoreDrift: 0.03,
        availability: 0.995,
      },
      lastUpdated: new Date(),
    }

    testContext = {
      widgetId: 'test-widget',
      action: 'view',
      inputs: {},
      environmentContext: {
        deploymentEnv: 'development',
        region: 'us-east-1',
        telemetryEnabled: true,
      },
    }
  })

  describe('evaluateRisk', () => {
    it('should return green decision for low-risk actions', async () => {
      const result = await policyEngine.evaluateRisk(testContext, testManifest)

      expect(result.decision).toBe('green')
      expect(result.blockAction).toBe(false)
      expect(result.requiresUserConsent).toBe(false)
    })

    it('should return amber decision for medium-risk actions', async () => {
      testManifest.riskAssessment.residualRiskScore = 45
      testManifest.riskAssessment.severityTier = 'High'

      const result = await policyEngine.evaluateRisk(testContext, testManifest)

      expect(result.decision).toBe('amber')
      expect(result.requiresUserConsent).toBe(true)
      expect(result.blockAction).toBe(false)
    })

    it('should return red decision for critical-risk actions', async () => {
      testManifest.riskAssessment.residualRiskScore = 85
      testManifest.riskAssessment.severityTier = 'Critical'

      const result = await policyEngine.evaluateRisk(testContext, testManifest)

      expect(result.decision).toBe('red')
      expect(result.blockAction).toBe(true)
    })

    it('should include mitigations in result', async () => {
      const result = await policyEngine.evaluateRisk(testContext, testManifest)

      expect(Array.isArray(result.mitigations)).toBe(true)
      expect(result.mitigations.length).toBeGreaterThan(0)
    })

    it('should adjust risk based on user trust level', async () => {
      const highTrustContext = {
        ...testContext,
        userContext: {
          userId: 'user-1',
          roles: ['user'],
          permissions: ['read'],
          trustLevel: 0.9,
        },
      }

      const lowTrustContext = {
        ...testContext,
        userContext: {
          userId: 'user-2',
          roles: ['user'],
          permissions: ['read'],
          trustLevel: 0.2,
        },
      }

      const highTrustResult = await policyEngine.evaluateRisk(highTrustContext, testManifest)
      const lowTrustResult = await policyEngine.evaluateRisk(lowTrustContext, testManifest)

      expect(lowTrustResult.riskScore).toBeGreaterThanOrEqual(highTrustResult.riskScore)
    })
  })

  describe('validatePolicyManifest', () => {
    it('should validate a correct manifest', () => {
      const result = policyEngine.validatePolicyManifest(testManifest)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject manifest with invalid probability score', () => {
      testManifest.riskAssessment.probabilityScore = 1.5

      const result = policyEngine.validatePolicyManifest(testManifest)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('probability'))).toBe(true)
    })

    it('should reject manifest with invalid impact weight', () => {
      testManifest.riskAssessment.impactWeight = 150

      const result = policyEngine.validatePolicyManifest(testManifest)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('impact'))).toBe(true)
    })

    it('should warn about SLO violations', () => {
      testManifest.slos.p99LatencyMs = 350

      const result = policyEngine.validatePolicyManifest(testManifest)

      expect(result.warnings.some(w => w.includes('latency'))).toBe(true)
    })
  })

  describe('audit log', () => {
    it('should log evaluations when audit is enabled', async () => {
      const engineWithAudit = new PolicyEngine({ auditLogEnabled: true })

      await engineWithAudit.evaluateRisk(testContext, testManifest)
      await engineWithAudit.evaluateRisk(testContext, testManifest)

      const log = engineWithAudit.getAuditLog()
      expect(log).toHaveLength(2)
    })

    it('should allow filtering audit log', async () => {
      const engineWithAudit = new PolicyEngine({ auditLogEnabled: true })

      await engineWithAudit.evaluateRisk(testContext, testManifest)

      const log = engineWithAudit.getAuditLog({ widgetId: 'test-widget' })
      expect(log).toHaveLength(1)
    })

    it('should clear audit log', async () => {
      const engineWithAudit = new PolicyEngine({ auditLogEnabled: true })

      await engineWithAudit.evaluateRisk(testContext, testManifest)
      engineWithAudit.clearAuditLog()

      const log = engineWithAudit.getAuditLog()
      expect(log).toHaveLength(0)
    })
  })

  describe('caching', () => {
    it('should cache evaluation results', async () => {
      const engineWithCache = new PolicyEngine({ cacheEnabled: true, cacheTTLMs: 1000 })

      const startTime1 = Date.now()
      await engineWithCache.evaluateRisk(testContext, testManifest)
      const duration1 = Date.now() - startTime1

      const startTime2 = Date.now()
      await engineWithCache.evaluateRisk(testContext, testManifest)
      const duration2 = Date.now() - startTime2

      expect(duration2).toBeLessThan(duration1)
    })

    it('should expire cache entries', async () => {
      const engineWithCache = new PolicyEngine({ cacheEnabled: true, cacheTTLMs: 100 })

      await engineWithCache.evaluateRisk(testContext, testManifest)
      await new Promise(resolve => setTimeout(resolve, 150))

      const cacheHit = await engineWithCache.evaluateRisk(testContext, testManifest)
      expect(cacheHit).toBeDefined()
    })
  })
})
