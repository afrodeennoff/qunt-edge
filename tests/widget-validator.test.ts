import { describe, it, expect, vi } from 'vitest'
import { widgetValidator } from '@/lib/widget-validator'

// Mock the widget registry
vi.mock('@/app/[locale]/dashboard/config/widget-registry', () => ({
  WIDGET_REGISTRY: {
    equityChart: {
      allowedSizes: ['small', 'medium', 'large']
    },
    pnlChart: {
      allowedSizes: ['medium']
    }
  }
}))

describe('WidgetValidator', () => {
  describe('validateWidget', () => {
    it('should fail if widget is not an object', () => {
      const result = widgetValidator.validateWidget(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('widget')

      const result2 = widgetValidator.validateWidget('string')
      expect(result2.valid).toBe(false)
      expect(result2.errors).toHaveLength(1)
    })

    it('should fail if required fields are missing', () => {
      const widget = { i: '1' }
      const result = widgetValidator.validateWidget(widget)
      expect(result.valid).toBe(false)
      // Missing: type, x, y, w, h
      const missingFields = result.errors.filter(e => e.message.includes('Missing required field'))
      expect(missingFields.length).toBe(5)
    })

    it('should validate field types', () => {
      const widget = {
        i: 123, // Should be string, but this causes Critical error so valid=false
        type: 'equityChart',
        x: '0', // Should be number, causes Error so valid=true (if i was string)
        y: '0', // Should be number
        w: '6', // Should be number
        h: '4', // Should be number
        size: 'medium'
      }
      const result = widgetValidator.validateWidget(widget)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'i' && e.message.includes('must be a string'))).toBe(true)
      expect(result.errors.some(e => e.field === 'x' && e.message.includes('must be a number'))).toBe(true)
    })

    it('should validate widget type', () => {
      const validWidget = {
        i: '1',
        type: 'equityChart',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        size: 'medium'
      }
      const result = widgetValidator.validateWidget(validWidget)
      expect(result.valid).toBe(true)

      const invalidTypeWidget = { ...validWidget, type: 'invalidType' }
      const resultInvalid = widgetValidator.validateWidget(invalidTypeWidget)
      expect(resultInvalid.valid).toBe(false)
      expect(resultInvalid.errors.some(e => e.field === 'type' && e.message.includes('Invalid widget type'))).toBe(true)
    })

    it('should warn if widget type is valid but not in registry', () => {
        // 'timeOfDayChart' is in VALID_WIDGET_TYPES but not in our mock registry
        const widget = {
          i: '1',
          type: 'timeOfDayChart',
          x: 0,
          y: 0,
          w: 6,
          h: 4,
          size: 'medium'
        }
        const result = widgetValidator.validateWidget(widget)
        // It is valid (no critical errors), but has warnings
        expect(result.valid).toBe(true)
        expect(result.warnings.some(w => w.field === 'type' && w.message.includes('not registered'))).toBe(true)
    })

    it('should validate widget size', () => {
      const widget = {
        i: '1',
        type: 'equityChart',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        size: 'invalidSize'
      }
      const result = widgetValidator.validateWidget(widget)
      // Invalid size is an 'error' severity, which currently does not make valid=false
      expect(result.valid).toBe(true)
      expect(result.errors.some(e => e.field === 'size' && e.message.includes('Invalid widget size'))).toBe(true)
    })

    it('should validate allowed sizes for specific widget type', () => {
      // pnlChart only allows 'medium' in our mock
      const widget = {
        i: '1',
        type: 'pnlChart',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        size: 'large' // Valid size generally, but not for pnlChart
      }
      const result = widgetValidator.validateWidget(widget)
      // Allowed size check is 'error' severity
      expect(result.valid).toBe(true)
      expect(result.errors.some(e => e.field === 'size' && e.message.includes('not allowed for widget type'))).toBe(true)
    })

    it('should validate grid position ranges', () => {
      const widget = {
        i: '1',
        type: 'equityChart',
        x: -1, // Invalid
        y: -1, // Invalid
        w: 13, // Invalid
        h: 4,
        size: 'medium'
      }

      const result = widgetValidator.validateWidget(widget)
      // Grid position errors are 'error' severity
      expect(result.valid).toBe(true)
      expect(result.errors.some(e => e.field === 'x')).toBe(true)
      expect(result.errors.some(e => e.field === 'y')).toBe(true)
      expect(result.errors.some(e => e.field === 'w')).toBe(true)
    })

    it('should check grid boundaries', () => {
      const widget = {
        i: '1',
        type: 'equityChart',
        x: 10,
        y: 0,
        w: 4, // 10 + 4 = 14 > 12
        h: 4,
        size: 'medium'
      }
      const result = widgetValidator.validateWidget(widget)
      // Grid boundary error is 'error' severity
      expect(result.valid).toBe(true)
      expect(result.errors.some(e => e.field === 'x,w')).toBe(true)
    })

    it('should validate widget configuration', () => {
        const widget = {
            i: '1',
            type: 'equityChart',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            size: 'medium',
            static: 'notBoolean',
            minW: 0,
            maxW: 13
        }
        const result = widgetValidator.validateWidget(widget)
        // Config errors are 'error' severity
        expect(result.valid).toBe(true)
        expect(result.errors.some(e => e.field === 'static')).toBe(true)
        expect(result.errors.some(e => e.field === 'minW')).toBe(true)
        expect(result.errors.some(e => e.field === 'maxW')).toBe(true)
    })
  })

  describe('validateLayout', () => {
      it('should validate a valid layout', () => {
          const widgets = [
              { i: '1', type: 'equityChart', x: 0, y: 0, w: 6, h: 4, size: 'medium' },
              { i: '2', type: 'pnlChart', x: 6, y: 0, w: 6, h: 4, size: 'medium' }
          ]
          const result = widgetValidator.validateLayout(widgets as any)
          expect(result.valid).toBe(true)
          expect(result.errors).toHaveLength(0)
      })

      it('should fail if layout is not an array', () => {
          const result = widgetValidator.validateLayout({} as any)
          expect(result.valid).toBe(false)
      })

      it('should fail with duplicate widget IDs', () => {
        const widgets = [
            { i: '1', type: 'equityChart', x: 0, y: 0, w: 6, h: 4, size: 'medium' },
            { i: '1', type: 'equityChart', x: 6, y: 0, w: 6, h: 4, size: 'medium' }
        ]
        const result = widgetValidator.validateLayout(widgets as any)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.field === 'i' && e.message.includes('Duplicate widget ID'))).toBe(true)
      })
  })

  describe('sanitizeWidget', () => {
      it('should return null for invalid widget', () => {
          const result = widgetValidator.sanitizeWidget({})
          expect(result).toBeNull()
      })

      it('should sanitize valid widget values with recoverable errors', () => {
          const widget = {
            i: '123', // Must be string to pass critical validation
            type: 'equityChart',
            x: '0', // wrong type (string instead of number) -> error severity -> valid=true -> sanitized
            y: 1.5, // should be floor
            w: 6,
            h: 4,
            size: 'medium',
            static: 1 // should be boolean
          }
          const result = widgetValidator.sanitizeWidget(widget)
          expect(result).not.toBeNull()
          expect(result?.i).toBe('123')
          expect(result?.x).toBe(0) // Converted to number
          expect(result?.y).toBe(1) // Floored
          expect(result?.static).toBe(true) // Converted to boolean
      })
  })

  describe('sanitizeLayout', () => {
      it('should filter out invalid widgets', () => {
          const widgets = [
            { i: '1', type: 'equityChart', x: 0, y: 0, w: 6, h: 4, size: 'medium' },
            { i: '2', type: 'invalid', x: 0, y: 0, w: 6, h: 4, size: 'medium' } // Invalid type -> critical error
          ]
          const result = widgetValidator.sanitizeLayout(widgets)
          expect(result).toHaveLength(1)
          expect(result[0].i).toBe('1')
      })
  })
})
