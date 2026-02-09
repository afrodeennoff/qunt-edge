'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getPolicyEngine } from '@/lib/widget-policy-engine/policy-engine'
import { PolicyEvaluationContext, RiskEvaluationResult, DecisionPath } from '@/lib/widget-policy-engine/types'
import { getWidgetErrorHandler, WIDGET_ERROR_CODE } from '@/lib/widget-policy-engine/error-handler'
import { cn } from '@/lib/utils'

export interface WithRiskEvaluationProps {
  widgetId: string
  action: string
  inputs?: Record<string, unknown>
  onConsent?: () => void
  onDeny?: () => void
  onError?: (error: Error) => void
  showBlockedUI?: boolean
  showConsentUI?: boolean
  fallback?: React.ReactNode
  children?: React.ReactNode
}

interface RiskEvaluationState {
  evaluation: RiskEvaluationResult | null
  evaluating: boolean
  error: Error | null
  userConsented: boolean
}

interface RiskBlockProps {
  result: RiskEvaluationResult
  onRetry?: () => void
}

interface RiskConsentProps {
  result: RiskEvaluationResult
  onConsent: () => void
  onDeny: () => void
}

function RiskBlock({ result, onRetry }: RiskBlockProps) {
  return (
    <div className="flex items-center justify-center p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-500 mb-2">Action Blocked</h3>
        <p className="text-sm text-muted-foreground mb-4">{result.justification}</p>
        
        {result.mitigations.length > 0 && (
          <div className="text-left mb-4">
            <p className="text-sm font-medium mb-2">Required Actions:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {result.mitigations.map((mitigation, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Risk Score: {result.riskScore.toFixed(1)}/100 | Level: {result.riskLevel.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

function RiskConsent({ result, onConsent, onDeny }: RiskConsentProps) {
  return (
    <div className="flex items-center justify-center p-6 bg-amber-500/10 border border-amber-500/50 rounded-lg">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 mb-4">
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-500 mb-2">Confirmation Required</h3>
        <p className="text-sm text-muted-foreground mb-4">{result.justification}</p>
        
        {result.mitigations.length > 0 && (
          <div className="text-left mb-4">
            <p className="text-sm font-medium mb-2">Conditions:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {result.mitigations.map((mitigation, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={onConsent}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Confirm & Proceed
          </button>
          <button
            onClick={onDeny}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          Risk Score: {result.riskScore.toFixed(1)}/100 | Level: {result.riskLevel.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

export function WithRiskEvaluation({
  widgetId,
  action,
  inputs = {},
  onConsent,
  onDeny,
  onError,
  showBlockedUI = true,
  showConsentUI = true,
  fallback,
  children,
}: WithRiskEvaluationProps) {
  const [state, setState] = useState<RiskEvaluationState>({
    evaluation: null,
    evaluating: true,
    error: null,
    userConsented: false,
  })

  const policyEngine = getPolicyEngine()
  const errorHandler = getWidgetErrorHandler()

  const evaluatePolicy = useCallback(async () => {
    setState(prev => ({ ...prev, evaluating: true, error: null }))

    try {
      const context: PolicyEvaluationContext = {
        widgetId,
        action,
        inputs,
        environmentContext: {
          deploymentEnv: process.env.NODE_ENV === 'production' ? 'production' : 
                          process.env.NODE_ENV === 'test' ? 'staging' : 'development',
          region: 'default',
          telemetryEnabled: true,
        },
      }

      const manifest = await loadWidgetManifest(widgetId)
      const result = await policyEngine.evaluateRisk(context, manifest)

      setState(prev => ({
        ...prev,
        evaluation: result,
        evaluating: false,
      }))
    } catch (error) {
      const widgetError = errorHandler.handleError(error, {
        widgetId,
        environment: process.env.NODE_ENV || 'unknown',
      })

      setState(prev => ({
        ...prev,
        evaluating: false,
        error: widgetError instanceof Error ? widgetError : new Error(String(widgetError)),
      }))

      onError?.(widgetError instanceof Error ? widgetError : new Error(String(widgetError)))
    }
  }, [widgetId, action, JSON.stringify(inputs), policyEngine, errorHandler, onError])

  useEffect(() => {
    evaluatePolicy()
  }, [evaluatePolicy])

  const handleConsent = useCallback(() => {
    setState(prev => ({ ...prev, userConsented: true }))
    onConsent?.()
  }, [onConsent])

  const handleDeny = useCallback(() => {
    setState(prev => ({ ...prev, userConsented: false }))
    onDeny?.()
  }, [onDeny])

  if (state.evaluating) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Evaluating policy...</span>
      </div>
    )
  }

  if (state.error) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center p-6 bg-destructive/10 border border-destructive/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-destructive">Policy evaluation failed</p>
          <button
            onClick={evaluatePolicy}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!state.evaluation) {
    return fallback ? <>{fallback}</> : null
  }

  if (state.evaluation.decision === 'red' && showBlockedUI) {
    return <RiskBlock result={state.evaluation} onRetry={evaluatePolicy} />
  }

  if (state.evaluation.decision === 'amber' && !state.userConsented && showConsentUI) {
    return <RiskConsent result={state.evaluation} onConsent={handleConsent} onDeny={handleDeny} />
  }

  return <>{children}</>
}

async function loadWidgetManifest(widgetId: string): Promise<any> {
  try {
    const response = await fetch(`/api/widgets/${widgetId}/manifest`)
    if (!response.ok) {
      throw new Error(`Failed to load manifest for widget: ${widgetId}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(`Could not load manifest for ${widgetId}, using defaults`)
    return {
      schemaVersion: '1.0.0',
      widgetId,
      widgetVersion: '1.0.0',
      policyVersion: '1.0.0',
      riskAssessment: {
        severityTier: 'Medium' as const,
        probabilityScore: 0.3,
        impactWeight: 30,
        controlEffectiveness: 3,
        residualRiskScore: 20,
      },
      features: [],
      dataHandling: {
        inputSchema: 'widget-input.schema.json',
        outputSchema: 'widget-output.schema.json',
        dataClassification: 'internal',
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
        p99LatencyMs: 300,
        errorRate: 0.001,
        riskScoreDrift: 0.05,
        availability: 0.99,
      },
      lastUpdated: new Date().toISOString(),
    }
  }
}

export function useRiskEvaluation(widgetId: string, action: string, inputs?: Record<string, unknown>) {
  const [result, setResult] = useState<RiskEvaluationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const evaluate = async () => {
      setLoading(true)
      setError(null)

      try {
        const policyEngine = getPolicyEngine()
        const context: PolicyEvaluationContext = {
          widgetId,
          action,
          inputs: inputs || {},
          environmentContext: {
            deploymentEnv: process.env.NODE_ENV === 'production' ? 'production' : 'development',
            region: 'default',
            telemetryEnabled: true,
          },
        }

        const manifest = await loadWidgetManifest(widgetId)
        const evaluationResult = await policyEngine.evaluateRisk(context, manifest)

        if (!cancelled) {
          setResult(evaluationResult)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    evaluate()

    return () => {
      cancelled = true
    }
  }, [widgetId, action, JSON.stringify(inputs || {})])

  return { result, loading, error }
}
