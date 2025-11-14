/**
 * Edge Cases Test: Canvas Grid Positioning
 *
 * Tests various edge cases to ensure robustness:
 * - Overlapping components
 * - Out of bounds components
 * - Zero-sized components
 * - Negative coordinates
 * - Fractional coordinates
 * - Component in Canvas but not in layout
 */

import { describe, it, expect } from 'vitest'
import { validateSchema } from '../schema-validation'
import { generatePrompt } from '../prompt-generator'
import type { LaydlerSchema } from '@/types/schema'

describe('Canvas Edge Cases', () => {
  describe('Overlapping Components', () => {
    it('should detect overlapping components in same row', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'LeftBox',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 6, height: 2 }, // cols 0-5
          },
          {
            id: 'c2',
            name: 'RightBox',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 4, y: 0, width: 6, height: 2 }, // cols 4-9 (OVERLAP at 4-5!)
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'horizontal', components: ['c1', 'c2'] },
        },
      }

      const result = validateSchema(schema)

      // Should warn about overlapping components
      const overlapWarning = result.warnings.find((w) =>
        w.message.toLowerCase().includes('overlap')
      )
      expect(overlapWarning).toBeDefined()
    })

    it('should not warn for adjacent (non-overlapping) components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'LeftBox',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 6, height: 2 }, // cols 0-5
          },
          {
            id: 'c2',
            name: 'RightBox',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 6, y: 0, width: 6, height: 2 }, // cols 6-11 (NO overlap)
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'horizontal', components: ['c1', 'c2'] },
        },
      }

      const result = validateSchema(schema)

      // Should NOT warn about overlap
      const overlapWarning = result.warnings.find((w) =>
        w.code === 'CANVAS_COMPONENTS_OVERLAP'
      )
      expect(overlapWarning).toBeUndefined()
    })
  })

  describe('Out of Bounds Components', () => {
    it('should warn when component exceeds grid width', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'WideComponent',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 0, width: 8, height: 2 }, // 8 + 8 = 16 > 12!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      // Should warn about out of bounds
      const outOfBoundsWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_OUT_OF_BOUNDS'
      )
      expect(outOfBoundsWarning).toBeDefined()
      expect(outOfBoundsWarning!.message).toContain('exceeds grid')
    })

    it('should warn when component exceeds grid height', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'TallComponent',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 5, width: 12, height: 5 }, // 5 + 5 = 10 > 8!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const outOfBoundsWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_OUT_OF_BOUNDS'
      )
      expect(outOfBoundsWarning).toBeDefined()
    })
  })

  describe('Zero-Sized Components', () => {
    it('should warn about zero-width components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'InvisibleComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 0, width: 0, height: 2 }, // width = 0!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const zeroSizeWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_ZERO_SIZE'
      )
      expect(zeroSizeWarning).toBeDefined()
      expect(zeroSizeWarning!.message).toContain('zero width or height')
    })

    it('should warn about zero-height components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'FlatComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 0 }, // height = 0!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const zeroSizeWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_ZERO_SIZE'
      )
      expect(zeroSizeWarning).toBeDefined()
    })
  })

  describe('Negative Coordinates', () => {
    it('should error on negative x coordinate', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'NegativeX',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: -2, y: 0, width: 6, height: 2 }, // x = -2!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const negativeCoordError = result.errors.find(
        (e) => e.code === 'CANVAS_NEGATIVE_COORDINATE'
      )
      expect(negativeCoordError).toBeDefined()
      expect(result.valid).toBe(false)
    })

    it('should error on negative y coordinate', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'NegativeY',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: -1, width: 6, height: 2 }, // y = -1!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const negativeCoordError = result.errors.find(
        (e) => e.code === 'CANVAS_NEGATIVE_COORDINATE'
      )
      expect(negativeCoordError).toBeDefined()
      expect(result.valid).toBe(false)
    })
  })

  describe('Component Not In Layout', () => {
    it('should warn when component has Canvas layout but not in layout.components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'InLayout',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
          },
          {
            id: 'c2',
            name: 'NotInLayout',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 2, width: 12, height: 2 }, // Has Canvas but NOT in layout!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] }, // Only c1
        },
      }

      const result = validateSchema(schema)

      const notInLayoutWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_COMPONENT_NOT_IN_LAYOUT'
      )
      expect(notInLayoutWarning).toBeDefined()
      expect(notInLayoutWarning!.message).toContain('c2')
    })
  })

  describe('Fractional Coordinates', () => {
    it('should warn about fractional coordinates', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'FractionalComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 2.5, y: 3.7, width: 4, height: 2 }, // Fractional x, y!
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      const fractionalWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_FRACTIONAL_COORDINATE'
      )
      expect(fractionalWarning).toBeDefined()
      expect(fractionalWarning!.message).toContain('fractional')
    })
  })

  describe('Prompt Generation Robustness', () => {
    it('should generate prompt even with warnings', () => {
      // Schema with out-of-bounds component
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'OversizedComponent',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 0, width: 8, height: 2 }, // Out of bounds
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      // Validation should warn
      const validationResult = validateSchema(schema)
      expect(validationResult.warnings.length).toBeGreaterThan(0)

      // But prompt generation should still succeed
      const promptResult = generatePrompt(schema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toBeDefined()
    })

    it('should handle schema with multiple edge cases gracefully', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Normal',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'c2',
            name: 'Oversized',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 1, width: 15, height: 10 }, // Out of bounds
          },
          {
            id: 'c3',
            name: 'TinyBox',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 5, width: 0, height: 2 }, // Zero width
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'c2', 'c3'] },
        },
      }

      const validationResult = validateSchema(schema)
      // Should have multiple warnings
      expect(validationResult.warnings.length).toBeGreaterThan(1)

      // Prompt should still generate with warnings in context
      const promptResult = generatePrompt(schema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
    })
  })

  describe('Responsive Canvas Layout Edge Cases', () => {
    it('should validate each breakpoint independently', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'ResponsiveBox',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 }, // Valid
              desktop: { x: 10, y: 0, width: 6, height: 2 }, // Out of bounds (10+6=16 > 12)
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      // Should warn about desktop breakpoint out of bounds
      const outOfBoundsWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_OUT_OF_BOUNDS' && w.message.includes('desktop')
      )
      expect(outOfBoundsWarning).toBeDefined()
    })
  })
})
