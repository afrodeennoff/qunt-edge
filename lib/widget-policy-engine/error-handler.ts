export enum WIDGET_ERROR_CODE {
  INPUT_VALIDATION = 'WIDGET_001',
  OUTPUT_VALIDATION = 'WIDGET_002',
  POLICY_VIOLATION = 'WIDGET_003',
  RISK_THRESHOLD_EXCEEDED = 'WIDGET_004',
  DATA_FETCH_FAILED = 'WIDGET_005',
  RENDER_ERROR = 'WIDGET_006',
  CONFIGURATION_ERROR = 'WIDGET_007',
  PERMISSION_DENIED = 'WIDGET_008',
  RATE_LIMIT_EXCEEDED = 'WIDGET_009',
  TIMEOUT = 'WIDGET_010',
  DATA_CORRUPTION = 'WIDGET_011',
  SCHEMA_MISMATCH = 'WIDGET_012',
  MISSING_DEPENDENCY = 'WIDGET_013',
  AUTHENTICATION_FAILED = 'WIDGET_014',
  AUTHORIZATION_FAILED = 'WIDGET_015',
  NETWORK_ERROR = 'WIDGET_016',
  SERVICE_UNAVAILABLE = 'WIDGET_017',
  INVALID_STATE = 'WIDGET_018',
  CONCURRENT_MODIFICATION = 'WIDGET_019',
  QUOTA_EXCEEDED = 'WIDGET_020',
}

export interface WidgetError {
  code: WIDGET_ERROR_CODE
  message: string
  riskLevel: RiskLevel
  remediationHint: string
  timestamp: Date
  widgetId?: string
  context?: Record<string, unknown>
  stack?: string
  correlationId?: string
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface ErrorLogEntry {
  error: WidgetError
  userId?: string
  sessionId?: string
  environment: string
  resolved: boolean
  resolvedAt?: Date
  resolutionNotes?: string
}

export class WidgetErrorHandler {
  private errorLog: ErrorLogEntry[] = []
  private errorCallbacks: Map<WIDGET_ERROR_CODE, ErrorCallback[]> = new Map()
  private telemetryEnabled: boolean

  constructor(telemetryEnabled: boolean = true) {
    this.telemetryEnabled = telemetryEnabled
  }

  handleError(error: WidgetError | Error | unknown, context?: ErrorContext): WidgetError {
    const widgetError = this.normalizeError(error, context)
    
    this.addToLog(widgetError, context)
    this.triggerCallbacks(widgetError)
    
    if (this.telemetryEnabled) {
      this.emitTelemetry(widgetError)
    }

    if (this.shouldAlert(widgetError)) {
      this.sendAlert(widgetError)
    }

    return widgetError
  }

  registerCallback(errorCode: WIDGET_ERROR_CODE, callback: ErrorCallback): void {
    const callbacks = this.errorCallbacks.get(errorCode) || []
    callbacks.push(callback)
    this.errorCallbacks.set(errorCode, callbacks)
  }

  getErrorLog(filters?: ErrorLogFilter): ErrorLogEntry[] {
    let log = [...this.errorLog]

    if (filters) {
      if (filters.code) {
        log = log.filter(entry => entry.error.code === filters.code)
      }
      if (filters.riskLevel) {
        log = log.filter(entry => entry.error.riskLevel === filters.riskLevel)
      }
      if (filters.startDate) {
        log = log.filter(entry => entry.error.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        log = log.filter(entry => entry.error.timestamp <= filters.endDate!)
      }
      if (filters.widgetId) {
        log = log.filter(entry => entry.error.widgetId === filters.widgetId)
      }
      if (filters.resolved !== undefined) {
        log = log.filter(entry => entry.resolved === filters.resolved)
      }
    }

    return log.sort((a, b) => b.error.timestamp.getTime() - a.error.timestamp.getTime())
  }

  getErrorStatistics(timeRange?: { start: Date; end: Date }): ErrorStatistics {
    let log = this.errorLog

    if (timeRange) {
      log = log.filter(entry => 
        entry.error.timestamp >= timeRange.start && 
        entry.error.timestamp <= timeRange.end
      )
    }

    const total = log.length
    const byCode = new Map<WIDGET_ERROR_CODE, number>()
    const byRiskLevel = new Map<RiskLevel, number>()
    const resolved = log.filter(e => e.resolved).length
    const critical = log.filter(e => e.error.riskLevel === 'critical').length

    log.forEach(entry => {
      byCode.set(
        entry.error.code,
        (byCode.get(entry.error.code) || 0) + 1
      )
      byRiskLevel.set(
        entry.error.riskLevel,
        (byRiskLevel.get(entry.error.riskLevel) || 0) + 1
      )
    })

    return {
      total,
      resolved,
      unresolved: total - resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      critical,
      byCode: Object.fromEntries(byCode),
      byRiskLevel: Object.fromEntries(byRiskLevel),
    }
  }

  private normalizeError(error: unknown, context?: ErrorContext): WidgetError {
    if (this.isWidgetError(error)) {
      return error
    }

    if (error instanceof Error) {
      return {
        code: this.inferErrorCode(error),
        message: error.message,
        riskLevel: this.inferRiskLevel(error),
        remediationHint: this.getRemediationHint(error),
        timestamp: new Date(),
        widgetId: context?.widgetId,
        context: context?.additionalContext,
        stack: error.stack,
        correlationId: this.generateCorrelationId(),
      }
    }

    return {
      code: WIDGET_ERROR_CODE.INVALID_STATE,
      message: String(error),
      riskLevel: 'medium',
      remediationHint: 'Check the widget state and try again',
      timestamp: new Date(),
      widgetId: context?.widgetId,
      correlationId: this.generateCorrelationId(),
    }
  }

  private isWidgetError(error: unknown): error is WidgetError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'riskLevel' in error
    )
  }

  private inferErrorCode(error: Error): WIDGET_ERROR_CODE {
    const message = error.message.toLowerCase()

    if (message.includes('validation') || message.includes('invalid input')) {
      return WIDGET_ERROR_CODE.INPUT_VALIDATION
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return WIDGET_ERROR_CODE.PERMISSION_DENIED
    }
    if (message.includes('network') || message.includes('fetch')) {
      return WIDGET_ERROR_CODE.NETWORK_ERROR
    }
    if (message.includes('timeout')) {
      return WIDGET_ERROR_CODE.TIMEOUT
    }
    if (message.includes('rate limit')) {
      return WIDGET_ERROR_CODE.RATE_LIMIT_EXCEEDED
    }
    if (message.includes('quota')) {
      return WIDGET_ERROR_CODE.QUOTA_EXCEEDED
    }

    return WIDGET_ERROR_CODE.INVALID_STATE
  }

  private inferRiskLevel(error: Error): RiskLevel {
    const message = error.message.toLowerCase()

    if (
      message.includes('critical') ||
      message.includes('security') ||
      message.includes('breach')
    ) {
      return 'critical'
    }
    if (
      message.includes('data loss') ||
      message.includes('corruption') ||
      message.includes('authentication failed')
    ) {
      return 'high'
    }
    if (
      message.includes('validation') ||
      message.includes('timeout') ||
      message.includes('network')
    ) {
      return 'medium'
    }

    return 'low'
  }

  private getRemediationHint(error: Error): string {
    const message = error.message.toLowerCase()

    if (message.includes('validation')) {
      return 'Please check your input data and ensure it matches the required format'
    }
    if (message.includes('permission')) {
      return 'Contact your administrator to request the necessary permissions'
    }
    if (message.includes('network')) {
      return 'Check your network connection and try again'
    }
    if (message.includes('timeout')) {
      return 'The operation took too long. Please try again with a smaller data set'
    }

    return 'If the problem persists, please contact support with the error details'
  }

  private addToLog(error: WidgetError, context?: ErrorContext): void {
    const entry: ErrorLogEntry = {
      error,
      userId: context?.userId,
      sessionId: context?.sessionId,
      environment: context?.environment || 'unknown',
      resolved: false,
    }

    this.errorLog.push(entry)

    if (this.errorLog.length > 10000) {
      this.errorLog = this.errorLog.slice(-5000)
    }
  }

  private triggerCallbacks(error: WidgetError): void {
    const callbacks = this.errorCallbacks.get(error.code) || []
    callbacks.forEach(callback => {
      try {
        callback(error)
      } catch (err) {
        console.error('[WidgetErrorHandler] Callback error:', err)
      }
    })
  }

  private emitTelemetry(error: WidgetError): void {
    if (typeof window !== 'undefined') {
      const event = {
        type: 'widget_error',
        code: error.code,
        message: error.message,
        riskLevel: error.riskLevel,
        widgetId: error.widgetId,
        correlationId: error.correlationId,
      }
      console.debug('[WidgetErrorHandler] Telemetry:', event)
    }
  }

  private shouldAlert(error: WidgetError): boolean {
    return error.riskLevel === 'critical' || error.riskLevel === 'high'
  }

  private sendAlert(error: WidgetError): void {
    console.error('[WidgetErrorHandler] ALERT:', {
      code: error.code,
      message: error.message,
      riskLevel: error.riskLevel,
      widgetId: error.widgetId,
      correlationId: error.correlationId,
    })
  }

  private generateCorrelationId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export interface ErrorContext {
  widgetId?: string
  userId?: string
  sessionId?: string
  environment?: string
  additionalContext?: Record<string, unknown>
}

export interface ErrorLogFilter {
  code?: WIDGET_ERROR_CODE
  riskLevel?: RiskLevel
  startDate?: Date
  endDate?: Date
  widgetId?: string
  resolved?: boolean
}

export interface ErrorStatistics {
  total: number
  resolved: number
  unresolved: number
  resolutionRate: number
  critical: number
  byCode: Record<string, number>
  byRiskLevel: Record<string, number>
}

export type ErrorCallback = (error: WidgetError) => void

const singletonInstance = new WidgetErrorHandler()

export function getWidgetErrorHandler(): WidgetErrorHandler {
  return singletonInstance
}
