import { Widget, WidgetType, WidgetSize } from '@/app/[locale]/dashboard/types/dashboard'
import { WIDGET_REGISTRY } from '@/app/[locale]/dashboard/config/widget-registry'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  widgetId?: string
  severity: 'critical' | 'error'
}

export interface ValidationWarning {
  field: string
  message: string
  widgetId?: string
  severity: 'warning' | 'info'
}

class WidgetValidator {
  private readonly VALID_WIDGET_TYPES: WidgetType[] = [
    'equityChart',
    'pnlChart',
    'timeOfDayChart',
    'timeInPositionChart',
    'weekdayPnlChart',
    'pnlBySideChart',
    'pnlPerContractChart',
    'pnlPerContractDailyChart',
    'tickDistribution',
    'dailyTickTarget',
    'commissionsPnl',
    'calendarWidget',
    'averagePositionTime',
    'cumulativePnl',
    'longShortPerformance',
    'tradePerformance',
    'winningStreak',
    'profitFactor',
    'statisticsWidget',
    'tradeTableReview',
    'chatWidget',
    'tradeDistribution',
    'propFirm',
    'timeRangePerformance',
    'tagWidget',
    'riskRewardRatio',
    'mindsetWidget',
    'tradingScore',
    'expectancy',
    'riskMetrics'
  ]

  private readonly VALID_SIZES: WidgetSize[] = [
    'tiny',
    'small',
    'small-long',
    'medium',
    'large',
    'extra-large'
  ]

  validateWidget(widget: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!widget || typeof widget !== 'object') {
      errors.push({
        field: 'widget',
        message: 'Widget must be an object',
        severity: 'critical'
      })
      return { valid: false, errors, warnings }
    }

    this.validateRequiredFields(widget, errors, warnings)
    this.validateWidgetType(widget, errors, warnings)
    this.validateWidgetSize(widget, errors, warnings)
    this.validateGridPosition(widget, errors, warnings)
    this.validateWidgetConfiguration(widget, errors, warnings)

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings
    }
  }

  private validateRequiredFields(
    widget: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const requiredFields = ['i', 'type', 'x', 'y', 'w', 'h']
    
    requiredFields.forEach(field => {
      if (!(field in widget)) {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
          widgetId: widget.i,
          severity: 'critical'
        })
      }
    })

    if (widget.i && typeof widget.i !== 'string') {
      errors.push({
        field: 'i',
        message: 'Widget ID must be a string',
        widgetId: widget.i,
        severity: 'critical'
      })
    }

    if (typeof widget.x !== 'number') {
      errors.push({
        field: 'x',
        message: 'X position must be a number',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (typeof widget.y !== 'number') {
      errors.push({
        field: 'y',
        message: 'Y position must be a number',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (typeof widget.w !== 'number') {
      errors.push({
        field: 'w',
        message: 'Width must be a number',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (typeof widget.h !== 'number') {
      errors.push({
        field: 'h',
        message: 'Height must be a number',
        widgetId: widget.i,
        severity: 'error'
      })
    }
  }

  private validateWidgetType(
    widget: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!widget.type) return

    if (!this.VALID_WIDGET_TYPES.includes(widget.type)) {
      errors.push({
        field: 'type',
        message: `Invalid widget type: ${widget.type}. Valid types: ${this.VALID_WIDGET_TYPES.join(', ')}`,
        widgetId: widget.i,
        severity: 'critical'
      })
    }

    if (!WIDGET_REGISTRY[widget.type as WidgetType]) {
      warnings.push({
        field: 'type',
        message: `Widget type "${widget.type}" is not registered in WIDGET_REGISTRY`,
        widgetId: widget.i,
        severity: 'warning'
      })
    }
  }

  private validateWidgetSize(
    widget: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!widget.size) {
      warnings.push({
        field: 'size',
        message: 'Widget size is not specified, will use default',
        widgetId: widget.i,
        severity: 'info'
      })
      return
    }

    if (!this.VALID_SIZES.includes(widget.size)) {
      errors.push({
        field: 'size',
        message: `Invalid widget size: ${widget.size}. Valid sizes: ${this.VALID_SIZES.join(', ')}`,
        widgetId: widget.i,
        severity: 'error'
      })
    }

    const config = WIDGET_REGISTRY[widget.type as WidgetType]
    if (config && config.allowedSizes && !config.allowedSizes.includes(widget.size)) {
      errors.push({
        field: 'size',
        message: `Size "${widget.size}" is not allowed for widget type "${widget.type}". Allowed: ${config.allowedSizes.join(', ')}`,
        widgetId: widget.i,
        severity: 'error'
      })
    }
  }

  private validateGridPosition(
    widget: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (widget.x < 0 || widget.x > 11) {
      errors.push({
        field: 'x',
        message: `X position ${widget.x} is out of valid range (0-11)`,
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.y < 0) {
      errors.push({
        field: 'y',
        message: `Y position ${widget.y} cannot be negative`,
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.w < 1 || widget.w > 12) {
      errors.push({
        field: 'w',
        message: `Width ${widget.w} is out of valid range (1-12)`,
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.h < 1 || widget.h > 12) {
      warnings.push({
        field: 'h',
        message: `Height ${widget.h} may be too large (recommended: 1-8)`,
        widgetId: widget.i,
        severity: 'warning'
      })
    }

    if (widget.x + widget.w > 12) {
      errors.push({
        field: 'x,w',
        message: `Widget extends beyond grid boundary (x=${widget.x}, w=${widget.w})`,
        widgetId: widget.i,
        severity: 'error'
      })
    }
  }

  private validateWidgetConfiguration(
    widget: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (widget.static !== undefined && typeof widget.static !== 'boolean') {
      errors.push({
        field: 'static',
        message: 'Static flag must be a boolean',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.minW !== undefined && (typeof widget.minW !== 'number' || widget.minW < 1)) {
      errors.push({
        field: 'minW',
        message: 'Minimum width must be a number >= 1',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.maxW !== undefined && (typeof widget.maxW !== 'number' || widget.maxW > 12)) {
      errors.push({
        field: 'maxW',
        message: 'Maximum width must be a number <= 12',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.minH !== undefined && (typeof widget.minH !== 'number' || widget.minH < 1)) {
      errors.push({
        field: 'minH',
        message: 'Minimum height must be a number >= 1',
        widgetId: widget.i,
        severity: 'error'
      })
    }

    if (widget.maxH !== undefined && (typeof widget.maxH !== 'number' || widget.maxH > 12)) {
      errors.push({
        field: 'maxH',
        message: 'Maximum height must be a number <= 12',
        widgetId: widget.i,
        severity: 'error'
      })
    }
  }

  validateLayout(widgets: Widget[]): ValidationResult {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    if (!Array.isArray(widgets)) {
      return {
        valid: false,
        errors: [{
          field: 'layout',
          message: 'Layout must be an array',
          severity: 'critical'
        }],
        warnings: []
      }
    }

    const widgetIds = new Set<string>()

    widgets.forEach((widget, index) => {
      const result = this.validateWidget(widget)
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)

      if (widget.i) {
        if (widgetIds.has(widget.i)) {
          allErrors.push({
            field: 'i',
            message: `Duplicate widget ID: ${widget.i}`,
            widgetId: widget.i,
            severity: 'critical'
          })
        }
        widgetIds.add(widget.i)
      }
    })

    if (allErrors.length === 0 && allWarnings.length === 0) {
      allWarnings.push({
        field: 'layout',
        message: `Layout validated successfully with ${widgets.length} widget(s)`,
        severity: 'info'
      })
    }

    return {
      valid: allErrors.filter(e => e.severity === 'critical').length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  sanitizeWidget(widget: any): Widget | null {
    const validation = this.validateWidget(widget)
    
    if (!validation.valid) {
      console.error('[WidgetValidator] Widget validation failed:', validation.errors)
      return null
    }

    return {
      i: String(widget.i),
      type: widget.type || 'chart',
      size: widget.size || 'medium',
      x: Math.max(0, Math.min(11, Math.floor(Number(widget.x) || 0))),
      y: Math.max(0, Math.floor(Number(widget.y) || 0)),
      w: Math.max(1, Math.min(12, Math.floor(Number(widget.w) || 6))),
      h: Math.max(1, Math.min(12, Math.floor(Number(widget.h) || 4))),
      static: Boolean(widget.static),
      minW: widget.minW !== undefined ? Math.floor(Number(widget.minW)) : undefined,
      maxW: widget.maxW !== undefined ? Math.floor(Number(widget.maxW)) : undefined,
      minH: widget.minH !== undefined ? Math.floor(Number(widget.minH)) : undefined,
      maxH: widget.maxH !== undefined ? Math.floor(Number(widget.maxH)) : undefined
    }
  }

  sanitizeLayout(widgets: any[]): Widget[] {
    if (!Array.isArray(widgets)) return []

    return widgets
      .map(widget => this.sanitizeWidget(widget))
      .filter((widget): widget is Widget => widget !== null)
  }
}

export const widgetValidator = new WidgetValidator()
