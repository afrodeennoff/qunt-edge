export type SeverityTier = 'Critical' | 'High' | 'Medium' | 'Low'

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export type DecisionPath = 'green' | 'amber' | 'red'

export interface RiskAssessment {
  severityTier: SeverityTier
  probabilityScore: number
  impactWeight: number
  controlEffectiveness: number
  residualRiskScore: number
}

export interface PolicyCompliance {
  policyVersion: string
  compliant: boolean
  lastAuditDate: Date
  nextAuditDate: Date
  driftPercentage: number
}

export interface RiskEvaluationResult {
  decision: DecisionPath
  justification: string
  mitigations: string[]
  riskLevel: RiskLevel
  riskScore: number
  policyCompliant: boolean
  requiresUserConsent: boolean
  blockAction: boolean
  timestamp: Date
}

export interface WidgetPolicyManifest {
  schemaVersion: string
  widgetId: string
  widgetVersion: string
  policyVersion: string
  riskAssessment: RiskAssessment
  features: WidgetFeature[]
  dataHandling: DataHandlingPolicy
  compliance: ComplianceInfo
  slos: SLOs
  lastUpdated: Date
}

export interface WidgetFeature {
  id: string
  name: string
  threatVector: string
  residualRiskScore: number
  compensatingControls: string[]
  riskTier: SeverityTier
}

export interface DataHandlingPolicy {
  inputSchema: string
  outputSchema: string
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  encryptionRequired: boolean
  auditLogging: boolean
  retentionPeriod: string
}

export interface ComplianceInfo {
  frameworks: string[]
  auditHistory: AuditRecord[]
  signoffs: SignoffRecord[]
}

export interface AuditRecord {
  date: Date
  auditor: string
  findings: string
  severity: SeverityTier
  status: 'open' | 'closed' | 'mitigated'
}

export interface SignoffRecord {
  role: string
  name: string
  date: Date
  approved: boolean
}

export interface SLOs {
  p99LatencyMs: number
  errorRate: number
  riskScoreDrift: number
  availability: number
}

export interface PolicyEvaluationContext {
  widgetId: string
  action: string
  inputs: Record<string, unknown>
  userContext?: UserContext
  environmentContext: EnvironmentContext
}

export interface UserContext {
  userId: string
  roles: string[]
  permissions: string[]
  trustLevel: number
}

export interface EnvironmentContext {
  deploymentEnv: 'development' | 'staging' | 'production'
  region: string
  telemetryEnabled: boolean
}
