/**
 * Comprehensive Canvas Validation Test
 *
 * 모든 컴포넌트 조합을 고려한 종합 검증 테스트
 * - 모든 SemanticTag 조합 (9가지)
 * - 모든 Positioning 조합 (5가지)
 * - 모든 Layout type 조합 (4가지)
 * - 모든 Breakpoint 조합 (mobile, tablet, desktop)
 * - 복합 에러 시나리오
 */

import { describe, it, expect } from 'vitest'
import { validateSchema } from '../schema-validation'
import { generatePrompt } from '../prompt-generator'
import type { LaydlerSchema, Component } from '@/types/schema'

describe('Comprehensive Canvas Validation', () => {
  /**
   * 모든 SemanticTag 타입 조합 테스트
   */
  describe('All SemanticTag Types', () => {
    const semanticTags = [
      'header',
      'nav',
      'main',
      'aside',
      'footer',
      'section',
      'article',
      'div',
      'form',
    ] as const

    semanticTags.forEach((tag) => {
      it(`should validate ${tag} component with Canvas layout`, () => {
        const schema: LaydlerSchema = {
          schemaVersion: '2.0',
          components: [
            {
              id: 'c1',
              name: `Test${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
              semanticTag: tag,
              positioning: { type: 'static' },
              layout: { type: 'flex', flex: { direction: 'column' } },
              canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
            },
          ],
          breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
          layouts: {
            mobile: { structure: 'vertical', components: ['c1'] },
          },
        }

        const result = validateSchema(schema)
        expect(result.valid).toBe(true)
      })
    })

    it('should validate all semantic tags in single schema', () => {
      const components: Component[] = semanticTags.map((tag, index) => ({
        id: `c${index + 1}`,
        name: `Component${index + 1}`,
        semanticTag: tag,
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: index, width: 12, height: 1 },
      }))

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components,
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 10 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: components.map((c) => c.id),
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })
  })

  /**
   * 모든 Positioning 타입 조합 테스트
   */
  describe('All Positioning Types', () => {
    const positioningTypes = [
      { type: 'fixed', position: { top: 0, zIndex: 50 } },
      { type: 'sticky', position: { top: 0 } },
      { type: 'static' },
      { type: 'absolute', position: { top: 0, left: 0 } },
      { type: 'relative' },
    ] as const

    positioningTypes.forEach((positioning, index) => {
      it(`should validate ${positioning.type} positioning with Canvas layout`, () => {
        const schema: LaydlerSchema = {
          schemaVersion: '2.0',
          components: [
            {
              id: 'c1',
              name: 'TestComponent',
              semanticTag: 'div',
              positioning: positioning as any,
              layout: { type: 'flex', flex: { direction: 'column' } },
              canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
            },
          ],
          breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
          layouts: {
            mobile: { structure: 'vertical', components: ['c1'] },
          },
        }

        const result = validateSchema(schema)
        expect(result.valid).toBe(true)
      })
    })
  })

  /**
   * 모든 Layout 타입 조합 테스트
   */
  describe('All Layout Types', () => {
    const layoutTypes = [
      { type: 'flex', flex: { direction: 'column' } },
      { type: 'grid', grid: { cols: 2, rows: 2 } },
      { type: 'container', container: { maxWidth: 'xl', centered: true } },
      { type: 'none' },
    ] as const

    layoutTypes.forEach((layout) => {
      it(`should validate ${layout.type} layout with Canvas`, () => {
        const schema: LaydlerSchema = {
          schemaVersion: '2.0',
          components: [
            {
              id: 'c1',
              name: 'TestComponent',
              semanticTag: 'div',
              positioning: { type: 'static' },
              layout: layout as any,
              canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
            },
          ],
          breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
          layouts: {
            mobile: { structure: 'vertical', components: ['c1'] },
          },
        }

        const result = validateSchema(schema)
        expect(result.valid).toBe(true)
      })
    })
  })

  /**
   * 모든 Breakpoint 조합 테스트
   */
  describe('All Breakpoint Combinations', () => {
    it('should validate single breakpoint (mobile)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 4, height: 2 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should validate mobile + tablet breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
              tablet: { x: 0, y: 0, width: 8, height: 2 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          tablet: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should validate mobile + tablet + desktop breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
              tablet: { x: 0, y: 0, width: 8, height: 2 },
              desktop: { x: 0, y: 0, width: 12, height: 2 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          tablet: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })
  })

  /**
   * 복합 에러 시나리오 테스트
   */
  describe('Multiple Error Scenarios', () => {
    it('should detect all errors in complex schema', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          // Valid
          {
            id: 'c1',
            name: 'ValidHeader',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          // Negative x
          {
            id: 'c2',
            name: 'NegativeX',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: -1, y: 1, width: 6, height: 2 },
          },
          // Out of bounds width
          {
            id: 'c3',
            name: 'OutOfBounds',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 3, width: 8, height: 2 }, // 8+8=16 > 12
          },
          // Zero width
          {
            id: 'c4',
            name: 'ZeroWidth',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 5, width: 0, height: 2 },
          },
          // Fractional coordinates
          {
            id: 'c5',
            name: 'Fractional',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 2.5, y: 6, width: 4, height: 1 },
          },
          // Not in layout
          {
            id: 'c6',
            name: 'NotInLayout',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1', 'c2', 'c3', 'c4', 'c5'], // c6 not included
          },
        },
      }

      const result = validateSchema(schema)

      // Should have errors (negative coordinate)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      // Should have multiple warnings
      expect(result.warnings.length).toBeGreaterThan(3)

      // Check specific error codes
      expect(result.errors.some((e) => e.code === 'CANVAS_NEGATIVE_COORDINATE')).toBe(
        true
      )
      expect(
        result.warnings.some((w) => w.code === 'CANVAS_OUT_OF_BOUNDS')
      ).toBe(true)
      expect(result.warnings.some((w) => w.code === 'CANVAS_ZERO_SIZE')).toBe(
        true
      )
      expect(
        result.warnings.some((w) => w.code === 'CANVAS_FRACTIONAL_COORDINATE')
      ).toBe(true)
      expect(
        result.warnings.some((w) => w.code === 'CANVAS_COMPONENT_NOT_IN_LAYOUT')
      ).toBe(true)
    })

    it('should detect overlapping + order mismatch + complex grid', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'First',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 1, width: 6, height: 2 }, // y=1 (but in layout order, it's first after c2)
          },
          {
            id: 'c2',
            name: 'Second',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 4, y: 1, width: 6, height: 2 }, // y=1, overlaps with c1 (x: 4-9 vs 0-5 → overlap at 4-5)
          },
          {
            id: 'c3',
            name: 'Third',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 }, // y=0 (but in layout, it's last)
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1', 'c2', 'c3'], // DOM order, but Canvas order is c3, c1, c2
          },
        },
      }

      const result = validateSchema(schema)

      // Should detect overlapping components
      expect(
        result.warnings.some((w) => w.code === 'CANVAS_COMPONENTS_OVERLAP')
      ).toBe(true)

      // Should detect order mismatch (Canvas: c3, c1, c2 vs Layout: c1, c2, c3)
      expect(
        result.warnings.some((w) => w.code === 'CANVAS_LAYOUT_ORDER_MISMATCH')
      ).toBe(true)

      // Should detect complex grid (c1 and c2 in same row)
      expect(
        result.warnings.some((w) => w.code === 'COMPLEX_GRID_LAYOUT_DETECTED')
      ).toBe(true)
    })
  })

  /**
   * 반응형 복합 시나리오 테스트
   */
  describe('Responsive Complex Scenarios', () => {
    it('should validate different layouts per breakpoint', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 }, // Full width on mobile (4 cols)
              desktop: { x: 0, y: 0, width: 12, height: 1 }, // Full width on desktop (12 cols)
            },
          },
          {
            id: 'c2',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 1, width: 4, height: 6 }, // Full width on mobile (stacked)
              desktop: { x: 0, y: 1, width: 3, height: 6 }, // Left sidebar on desktop
            },
          },
          {
            id: 'c3',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container', container: { maxWidth: 'xl', centered: true } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 7, width: 4, height: 6 }, // Below sidebar on mobile
              desktop: { x: 3, y: 1, width: 9, height: 6 }, // Right of sidebar on desktop
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 14 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'c2', 'c3'] },
          desktop: {
            structure: 'sidebar-main',
            components: ['c1', 'c2', 'c3'],
            roles: { sidebar: 'c2', main: 'c3' },
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)

      // Mobile should have no complex grid (all stacked)
      // Desktop should have complex grid (c2 and c3 side-by-side)
      const complexGridWarnings = result.warnings.filter(
        (w) => w.code === 'COMPLEX_GRID_LAYOUT_DETECTED'
      )
      expect(complexGridWarnings.length).toBeGreaterThan(0)
      expect(complexGridWarnings.some((w) => w.message.includes('desktop'))).toBe(
        true
      )
    })

    it('should detect breakpoint-specific errors', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 }, // Valid (4 ≤ 4)
              tablet: { x: 0, y: 0, width: 10, height: 2 }, // Out of bounds (10 > 8)
              desktop: { x: -1, y: 0, width: 12, height: 2 }, // Negative x (error)
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          tablet: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)

      // Should have error for negative coordinate in desktop
      expect(result.valid).toBe(false)
      const negativeError = result.errors.find(
        (e) =>
          e.code === 'CANVAS_NEGATIVE_COORDINATE' &&
          e.message.includes('desktop')
      )
      expect(negativeError).toBeDefined()

      // Should have warning for out of bounds in tablet
      const outOfBoundsWarning = result.warnings.find(
        (w) =>
          w.code === 'CANVAS_OUT_OF_BOUNDS' && w.message.includes('tablet')
      )
      expect(outOfBoundsWarning).toBeDefined()
    })
  })

  /**
   * Prompt 생성 견고성 테스트 (모든 조합)
   */
  describe('Prompt Generation Robustness', () => {
    it('should generate prompt for all semantic tags', () => {
      const semanticTags = [
        'header',
        'nav',
        'main',
        'aside',
        'footer',
        'section',
        'article',
        'div',
        'form',
      ] as const

      const components: Component[] = semanticTags.map((tag, index) => ({
        id: `c${index + 1}`,
        name: `Component${index + 1}`,
        semanticTag: tag,
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: index, width: 12, height: 1 },
      }))

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components,
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 10 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: components.map((c) => c.id),
          },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      // Should include all component names
      semanticTags.forEach((tag, index) => {
        expect(result.prompt).toContain(`Component${index + 1}`)
      })
    })

    it('should generate prompt with all layout types', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'FlexComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
          },
          {
            id: 'c2',
            name: 'GridComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'grid', grid: { cols: 3, rows: 2 } },
            canvasLayout: { x: 0, y: 2, width: 12, height: 2 },
          },
          {
            id: 'c3',
            name: 'ContainerComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'container', container: { maxWidth: 'xl' } },
            canvasLayout: { x: 0, y: 4, width: 12, height: 2 },
          },
          {
            id: 'c4',
            name: 'NoneComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 6, width: 12, height: 2 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1', 'c2', 'c3', 'c4'],
          },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toContain('FlexComponent')
      expect(result.prompt).toContain('GridComponent')
      expect(result.prompt).toContain('ContainerComponent')
      expect(result.prompt).toContain('NoneComponent')
    })

    it('should generate prompt even with warnings (no errors)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Normal',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
          },
          {
            id: 'c2',
            name: 'OutOfBounds',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 2, width: 8, height: 2 }, // Out of bounds
          },
          {
            id: 'c3',
            name: 'ZeroWidth',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            canvasLayout: { x: 0, y: 4, width: 0, height: 2 }, // Zero width
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1', 'c2', 'c3'],
          },
        },
      }

      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true) // No errors, only warnings
      expect(validationResult.warnings.length).toBeGreaterThan(0)

      const promptResult = generatePrompt(schema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toBeDefined()
    })
  })

  /**
   * 엣지 케이스 조합 테스트
   */
  describe('Edge Case Combinations', () => {
    it('should handle empty components array', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'NO_COMPONENTS')).toBe(true)
    })

    it('should handle single component', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'OnlyComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should handle maximum components (100+)', () => {
      const components: Component[] = Array.from({ length: 100 }, (_, i) => ({
        id: `c${i + 1}`,
        name: `Component${i + 1}`,
        semanticTag: 'div' as const,
        positioning: { type: 'static' as const },
        layout: { type: 'flex' as const, flex: { direction: 'column' as const } },
        canvasLayout: { x: 0, y: i, width: 12, height: 1 },
      }))

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components,
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 100 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: components.map((c) => c.id),
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBe(0)
    })

    it('should handle extreme grid dimensions', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 24, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 24, gridRows: 100 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })
  })
})
