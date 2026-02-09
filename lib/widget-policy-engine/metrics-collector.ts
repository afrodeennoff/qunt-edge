export interface WidgetMetrics {
  widgetId: string
  widgetVersion: string
  riskTier: string
  deploymentEnv: string
  
  widgetLoadMs: number
  userInteractionCount: number
  riskDecisionCount: number
  riskScoreAvg: number
  errorRate: number
  dataLeakageIncidents: number
  
  timestamp: Date
}

export interface MetricsSnapshot {
  metrics: WidgetMetrics[]
  summary: MetricsSummary
  capturedAt: Date
}

export interface MetricsSummary {
  totalWidgets: number
  avgLoadTime: number
  totalInteractions: number
  totalRiskDecisions: number
  avgRiskScore: number
  totalErrors: number
  avgErrorRate: number
  criticalRiskCount: number
  highRiskCount: number
}

export class MetricsCollector {
  private metricsBuffer: Map<string, WidgetMetrics[]> = new Map()
  private metricsHistory: WidgetMetrics[] = []
  private maxBufferSize: number = 100
  private maxHistorySize: number = 10000
  private flushInterval: number = 60000
  private flushTimer?: NodeJS.Timeout

  constructor() {
    if (typeof window === 'undefined') {
      this.startFlushTimer()
    }
  }

  recordWidgetLoad(widgetId: string, widgetVersion: string, loadTimeMs: number, riskTier: string): void {
    this.recordMetric({
      widgetId,
      widgetVersion,
      riskTier,
      deploymentEnv: process.env.NODE_ENV || 'unknown',
      widgetLoadMs: loadTimeMs,
      userInteractionCount: 0,
      riskDecisionCount: 0,
      riskScoreAvg: 0,
      errorRate: 0,
      dataLeakageIncidents: 0,
      timestamp: new Date(),
    })
  }

  recordUserInteraction(widgetId: string, widgetVersion: string, riskTier: string): void {
    const latest = this.getLatestMetric(widgetId)
    
    if (latest) {
      latest.userInteractionCount++
      latest.timestamp = new Date()
    } else {
      this.recordMetric({
        widgetId,
        widgetVersion,
        riskTier,
        deploymentEnv: process.env.NODE_ENV || 'unknown',
        widgetLoadMs: 0,
        userInteractionCount: 1,
        riskDecisionCount: 0,
        riskScoreAvg: 0,
        errorRate: 0,
        dataLeakageIncidents: 0,
        timestamp: new Date(),
      })
    }
  }

  recordRiskDecision(widgetId: string, widgetVersion: string, riskTier: string, riskScore: number): void {
    const latest = this.getLatestMetric(widgetId)
    
    if (latest) {
      latest.riskDecisionCount++
      latest.riskScoreAvg = (latest.riskScoreAvg * (latest.riskDecisionCount - 1) + riskScore) / latest.riskDecisionCount
      latest.timestamp = new Date()
    } else {
      this.recordMetric({
        widgetId,
        widgetVersion,
        riskTier,
        deploymentEnv: process.env.NODE_ENV || 'unknown',
        widgetLoadMs: 0,
        userInteractionCount: 0,
        riskDecisionCount: 1,
        riskScoreAvg: riskScore,
        errorRate: 0,
        dataLeakageIncidents: 0,
        timestamp: new Date(),
      })
    }
  }

  recordError(widgetId: string, widgetVersion: string, riskTier: string): void {
    const latest = this.getLatestMetric(widgetId)
    
    if (latest) {
      latest.errorRate = latest.errorRate + 1
      latest.timestamp = new Date()
    } else {
      this.recordMetric({
        widgetId,
        widgetVersion,
        riskTier,
        deploymentEnv: process.env.NODE_ENV || 'unknown',
        widgetLoadMs: 0,
        userInteractionCount: 0,
        riskDecisionCount: 0,
        riskScoreAvg: 0,
        errorRate: 1,
        dataLeakageIncidents: 0,
        timestamp: new Date(),
      })
    }
  }

  recordDataLeakage(widgetId: string, widgetVersion: string, riskTier: string): void {
    const latest = this.getLatestMetric(widgetId)
    
    if (latest) {
      latest.dataLeakageIncidents++
      latest.timestamp = new Date()
    } else {
      this.recordMetric({
        widgetId,
        widgetVersion,
        riskTier,
        deploymentEnv: process.env.NODE_ENV || 'unknown',
        widgetLoadMs: 0,
        userInteractionCount: 0,
        riskDecisionCount: 0,
        riskScoreAvg: 0,
        errorRate: 0,
        dataLeakageIncidents: 1,
        timestamp: new Date(),
      })
    }
  }

  getMetrics(widgetId?: string): WidgetMetrics[] {
    if (widgetId) {
      return this.metricsHistory.filter(m => m.widgetId === widgetId)
    }
    return [...this.metricsHistory]
  }

  getSnapshot(): MetricsSnapshot {
    const metrics = this.getMetrics()
    const summary = this.calculateSummary(metrics)

    return {
      metrics,
      summary,
      capturedAt: new Date(),
    }
  }

  checkSLOs(): SLOCheckResult {
    const snapshot = this.getSnapshot()
    const violations: SLOViolation[] = []

    if (snapshot.summary.avgLoadTime > 300) {
      violations.push({
        slo: 'p99_latency_ms',
        threshold: 300,
        actual: snapshot.summary.avgLoadTime,
        severity: 'high',
      })
    }

    if (snapshot.summary.avgErrorRate > 0.001) {
      violations.push({
        slo: 'error_rate',
        threshold: 0.001,
        actual: snapshot.summary.avgErrorRate,
        severity: 'critical',
      })
    }

    return {
      compliant: violations.length === 0,
      violations,
      checkedAt: new Date(),
    }
  }

  exportPrometheusMetrics(): string {
    const snapshot = this.getSnapshot()
    const lines: string[] = []

    lines.push('# HELP widget_load_ms Widget load time in milliseconds')
    lines.push('# TYPE widget_load_ms gauge')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_load_ms{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.widgetLoadMs}`)
    }

    lines.push('# HELP widget_user_interactions_total Total user interactions')
    lines.push('# TYPE widget_user_interactions_total counter')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_user_interactions_total{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.userInteractionCount}`)
    }

    lines.push('# HELP widget_risk_decision_count_total Total risk evaluations')
    lines.push('# TYPE widget_risk_decision_count_total counter')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_risk_decision_count_total{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.riskDecisionCount}`)
    }

    lines.push('# HELP widget_risk_score_avg Average risk score')
    lines.push('# TYPE widget_risk_score_avg gauge')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_risk_score_avg{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.riskScoreAvg.toFixed(2)}`)
    }

    lines.push('# HELP widget_error_rate Error rate per widget')
    lines.push('# TYPE widget_error_rate gauge')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_error_rate{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.errorRate}`)
    }

    lines.push('# HELP widget_data_leakage_incidents_total Total data leakage incidents')
    lines.push('# TYPE widget_data_leakage_incidents_total counter')
    for (const metric of snapshot.metrics) {
      lines.push(`widget_data_leakage_incidents_total{widget_id="${metric.widgetId}",version="${metric.widgetVersion}",risk_tier="${metric.riskTier}",env="${metric.deploymentEnv}"} ${metric.dataLeakageIncidents}`)
    }

    return lines.join('\n')
  }

  clearHistory(): void {
    this.metricsHistory = []
    this.metricsBuffer.clear()
  }

  private recordMetric(metric: WidgetMetrics): void {
    const buffer = this.metricsBuffer.get(metric.widgetId) || []
    buffer.push(metric)
    this.metricsBuffer.set(metric.widgetId, buffer)

    if (buffer.length >= this.maxBufferSize) {
      this.flushBuffer(metric.widgetId)
    }
  }

  private getLatestMetric(widgetId: string): WidgetMetrics | null {
    const buffer = this.metricsBuffer.get(widgetId)
    if (buffer && buffer.length > 0) {
      return buffer[buffer.length - 1]
    }
    const history = this.metricsHistory.filter(m => m.widgetId === widgetId)
    return history.length > 0 ? history[history.length - 1] : null
  }

  private flushBuffer(widgetId: string): void {
    const buffer = this.metricsBuffer.get(widgetId)
    if (buffer) {
      this.metricsHistory.push(...buffer)
      this.metricsBuffer.set(widgetId, [])

      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory = this.metricsHistory.slice(-Math.floor(this.maxHistorySize / 2))
      }
    }
  }

  private flushAllBuffers(): void {
    for (const widgetId of this.metricsBuffer.keys()) {
      this.flushBuffer(widgetId)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushAllBuffers()
    }, this.flushInterval)
  }

  private calculateSummary(metrics: WidgetMetrics[]): MetricsSummary {
    if (metrics.length === 0) {
      return {
        totalWidgets: 0,
        avgLoadTime: 0,
        totalInteractions: 0,
        totalRiskDecisions: 0,
        avgRiskScore: 0,
        totalErrors: 0,
        avgErrorRate: 0,
        criticalRiskCount: 0,
        highRiskCount: 0,
      }
    }

    const totalLoadTime = metrics.reduce((sum, m) => sum + m.widgetLoadMs, 0)
    const totalInteractions = metrics.reduce((sum, m) => sum + m.userInteractionCount, 0)
    const totalRiskDecisions = metrics.reduce((sum, m) => sum + m.riskDecisionCount, 0)
    const totalRiskScore = metrics.reduce((sum, m) => sum + (m.riskScoreAvg * m.riskDecisionCount), 0)
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorRate, 0)
    const criticalCount = metrics.filter(m => m.riskTier === 'Critical').length
    const highCount = metrics.filter(m => m.riskTier === 'High').length

    return {
      totalWidgets: metrics.length,
      avgLoadTime: totalLoadTime / metrics.length,
      totalInteractions,
      totalRiskDecisions,
      avgRiskScore: totalRiskDecisions > 0 ? totalRiskScore / totalRiskDecisions : 0,
      totalErrors,
      avgErrorRate: totalErrors / metrics.length,
      criticalRiskCount: criticalCount,
      highRiskCount: highCount,
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flushAllBuffers()
  }
}

export interface SLOCheckResult {
  compliant: boolean
  violations: SLOViolation[]
  checkedAt: Date
}

export interface SLOViolation {
  slo: string
  threshold: number
  actual: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const singletonInstance = new MetricsCollector()

export function getMetricsCollector(): MetricsCollector {
  return singletonInstance
}
