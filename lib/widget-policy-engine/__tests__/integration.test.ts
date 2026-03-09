import { describe, it, expect, beforeEach } from 'vitest'
import { PolicyEngine } from '../policy-engine'
import { getSchemaValidator } from '../manifest-validator'
import { getWidgetErrorHandler } from '../error-handler'
import { getMetricsCollector } from '../metrics-collector'

describe('Widget Policy Integration Tests', () => {
  describe('End-to-End Widget Flow', () => {
    it('should process a complete widget lifecycle', async () => {
      const policyEngine = new PolicyEngine()
      const schemaValidator = getSchemaValidator()
      const errorHandler = getWidgetErrorHandler()
      const metrics = getMetricsCollector()

      const manifest = {
        schemaVersion: '1.0.0',
        widgetId: 'integration-test-widget',
        widgetVersion: '1.0.0',
        policyVersion: '1.0.0',
        riskAssessment: {
          severityTier: 'Medium' as const,
          probabilityScore: 0.4,
          impactWeight: 35,
          controlEffectiveness: 4,
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
          p99LatencyMs: 200,
          errorRate: 0.001,
          riskScoreDrift: 0.05,
          availability: 0.99,
        },
        lastUpdated: new Date(),
      }

      const manifestValidation = policyEngine.validatePolicyManifest(manifest)
      expect(manifestValidation.valid).toBe(true)

      const context = {
        widgetId: 'integration-test-widget',
        action: 'view',
        inputs: {},
        environmentContext: {
          deploymentEnv: 'development' as const,
          region: 'us-east-1',
          telemetryEnabled: true,
        },
      }

      const riskResult = await policyEngine.evaluateRisk(context, manifest)
      expect(riskResult.decision).toBe('green')

      metrics.recordWidgetLoad('integration-test-widget', '1.0.0', 150, 'Medium')
      metrics.recordRiskDecision('integration-test-widget', '1.0.0', 'Medium', riskResult.riskScore)

      const snapshot = metrics.getSnapshot()
      expect(snapshot.summary.totalWidgets).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle and log errors consistently', () => {
      const errorHandler = getWidgetErrorHandler()
      const metrics = getMetricsCollector()

      const error = errorHandler.handleError(
        new Error('Test error'),
        {
          widgetId: 'test-widget',
          environment: 'test',
        }
      )

      expect(error.code).toBeDefined()
      expect(error.riskLevel).toBeDefined()
      expect(error.remediationHint).toBeDefined()

      metrics.recordError('test-widget', '1.0.0', 'Medium')

      const errorStats = errorHandler.getErrorStatistics()
      expect(errorStats.total).toBeGreaterThan(0)
    })
  })

  describe('Schema Validation Integration', () => {
    it('should validate widget input/output against schemas', () => {
      const validator = getSchemaValidator()

      const input = {
        widgetId: 'test-widget',
        widgetType: 'riskMetrics',
        size: 'medium',
        data: {
          trades: [],
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }

      const inputResult = validator.validateWidgetInput(input)
      expect(inputResult.valid).toBe(true)

      const output = {
        widgetId: 'test-widget',
        widgetType: 'riskMetrics',
        status: 'success',
        data: {
          renderData: {},
          metrics: {
            value: 100,
            label: 'Test',
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 50,
        },
      }

      const outputResult = validator.validateWidgetOutput(output)
      expect(outputResult.valid).toBe(true)
    })
  })

  describe('High-Risk Action Blocking', () => {
    it('should block critical risk actions', async () => {
      const policyEngine = new PolicyEngine({ strictMode: true })

      const criticalManifest = {
        schemaVersion: '1.0.0',
        widgetId: 'critical-widget',
        widgetVersion: '1.0.0',
        policyVersion: '1.0.0',
        riskAssessment: {
          severityTier: 'Critical' as const,
          probabilityScore: 0.9,
          impactWeight: 90,
          controlEffectiveness: 1,
          residualRiskScore: 85,
        },
        features: [],
        dataHandling: {
          inputSchema: 'widget-input.schema.json',
          outputSchema: 'widget-output.schema.json',
          dataClassification: 'restricted' as const,
          encryptionRequired: true,
          auditLogging: true,
          retentionPeriod: '365d',
        },
        compliance: {
          frameworks: [],
          auditHistory: [],
          signoffs: [],
        },
        slos: {
          p99LatencyMs: 300,
          errorRate: 0.001,
          riskScoreDrift: 0.05,
          availability: 0.99,
        },
        lastUpdated: new Date(),
      }

      const context = {
        widgetId: 'critical-widget',
        action: 'delete_all_data',
        inputs: {},
        environmentContext: {
          deploymentEnv: 'production' as const,
          region: 'us-east-1',
          telemetryEnabled: true,
        },
      }

      const result = await policyEngine.evaluateRisk(context, criticalManifest)
      expect(result.decision).toBe('red')
      expect(result.blockAction).toBe(true)
      expect(result.mitigations.length).toBeGreaterThan(0)
    })
  })

  describe('User Consent Flow', () => {
    it('should require consent for high-risk actions', async () => {
      const policyEngine = new PolicyEngine()

      const highRiskManifest = {
        schemaVersion: '1.0.0',
        widgetId: 'high-risk-widget',
        widgetVersion: '1.0.0',
        policyVersion: '1.0.0',
        riskAssessment: {
          severityTier: 'High' as const,
          probabilityScore: 0.6,
          impactWeight: 55,
          controlEffectiveness: 3,
          residualRiskScore: 50,
        },
        features: [],
        dataHandling: {
          inputSchema: 'widget-input.schema.json',
          outputSchema: 'widget-output.schema.json',
          dataClassification: 'confidential' as const,
          encryptionRequired: true,
          auditLogging: true,
          retentionPeriod: '180d',
        },
        compliance: {
          frameworks: [],
          auditHistory: [],
          signoffs: [],
        },
        slos: {
          p99LatencyMs: 250,
          errorRate: 0.001,
          riskScoreDrift: 0.05,
          availability: 0.99,
        },
        lastUpdated: new Date(),
      }

      const context = {
        widgetId: 'high-risk-widget',
        action: 'export_sensitive_data',
        inputs: {},
        environmentContext: {
          deploymentEnv: 'production' as const,
          region: 'us-east-1',
          telemetryEnabled: true,
        },
      }

      const result = await policyEngine.evaluateRisk(context, highRiskManifest)
      expect(result.decision).toBe('amber')
      expect(result.requiresUserConsent).toBe(true)
    })
  })

  describe('Metrics and Monitoring', () => {
    it('should track metrics across operations', () => {
      const metrics = getMetricsCollector()

      metrics.recordWidgetLoad('metrics-test-widget', '1.0.0', 200, 'High')
      metrics.recordUserInteraction('metrics-test-widget', '1.0.0', 'High')
      metrics.recordUserInteraction('metrics-test-widget', '1.0.0', 'High')
      metrics.recordRiskDecision('metrics-test-widget', '1.0.0', 'High', 55)

      const widgetMetrics = metrics.getMetrics('metrics-test-widget')
      expect(widgetMetrics.length).toBeGreaterThan(0)

      const prometheusMetrics = metrics.exportPrometheusMetrics()
      expect(prometheusMetrics).toContain('widget_load_ms')
      expect(prometheusMetrics).toContain('widget_user_interactions_total')
    })

    it('should check SLO compliance', () => {
      const metrics = getMetricsCollector()

      metrics.recordWidgetLoad('slo-test-widget', '1.0.0', 400, 'Critical')

      const sloCheck = metrics.checkSLOs()
      expect(sloCheck.compliant).toBe(false)
      expect(sloCheck.violations.length).toBeGreaterThan(0)
    })
  })
})
