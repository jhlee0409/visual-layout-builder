/**
 * Schema Utils Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  createEmptySchema,
  createSchemaWithBreakpoint,
  generateComponentId,
  DEFAULT_GRID_CONFIG,
  GRID_CONSTRAINTS,
  normalizeSchema,
} from '../schema-utils'
import type { Component, LaydlerSchema } from '@/types/schema'

describe('Schema Utils', () => {
  describe('createEmptySchema', () => {
    it('should create an empty schema with default breakpoints', () => {
      const schema = createEmptySchema()

      expect(schema.schemaVersion).toBe('2.0')
      expect(schema.components).toHaveLength(0)
      expect(schema.breakpoints).toHaveLength(3)

      // Check default breakpoints
      const mobileBreakpoint = schema.breakpoints.find(bp => bp.name === 'mobile')
      const tabletBreakpoint = schema.breakpoints.find(bp => bp.name === 'tablet')
      const desktopBreakpoint = schema.breakpoints.find(bp => bp.name === 'desktop')

      expect(mobileBreakpoint).toBeDefined()
      expect(mobileBreakpoint?.minWidth).toBe(0)
      expect(mobileBreakpoint?.gridCols).toBe(DEFAULT_GRID_CONFIG.mobile.gridCols)
      expect(mobileBreakpoint?.gridRows).toBe(DEFAULT_GRID_CONFIG.mobile.gridRows)

      expect(tabletBreakpoint).toBeDefined()
      expect(tabletBreakpoint?.minWidth).toBe(768)

      expect(desktopBreakpoint).toBeDefined()
      expect(desktopBreakpoint?.minWidth).toBe(1024)
    })

    it('should create layouts for all breakpoints', () => {
      const schema = createEmptySchema()

      expect(schema.layouts.mobile).toBeDefined()
      expect(schema.layouts.tablet).toBeDefined()
      expect(schema.layouts.desktop).toBeDefined()

      expect(schema.layouts.mobile.structure).toBe('vertical')
      expect(schema.layouts.mobile.components).toHaveLength(0)
    })
  })

  describe('createSchemaWithBreakpoint', () => {
    it('should create schema with single mobile breakpoint', () => {
      const schema = createSchemaWithBreakpoint('mobile')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('mobile')
      expect(schema.breakpoints[0].minWidth).toBe(0)
      expect(schema.breakpoints[0].gridCols).toBe(4)
    })

    it('should create schema with single tablet breakpoint', () => {
      const schema = createSchemaWithBreakpoint('tablet')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('tablet')
      expect(schema.breakpoints[0].minWidth).toBe(768)
      expect(schema.breakpoints[0].gridCols).toBe(8)
    })

    it('should create schema with single desktop breakpoint', () => {
      const schema = createSchemaWithBreakpoint('desktop')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('desktop')
      expect(schema.breakpoints[0].minWidth).toBe(1024)
      expect(schema.breakpoints[0].gridCols).toBe(12)
    })

    it('should create layout for the specified breakpoint only', () => {
      const schema = createSchemaWithBreakpoint('mobile')

      expect(schema.layouts.mobile).toBeDefined()
      expect(schema.layouts.tablet).toBeUndefined()
      expect(schema.layouts.desktop).toBeUndefined()
    })
  })

  describe('generateComponentId', () => {
    it('should generate "c1" for empty components array', () => {
      const id = generateComponentId([])
      expect(id).toBe('c1')
    })

    it('should generate next sequential ID', () => {
      const existingComponents: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      ]

      const id = generateComponentId(existingComponents)
      expect(id).toBe('c3')
    })

    it('should handle non-sequential component IDs', () => {
      const existingComponents: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c5',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      ]

      const id = generateComponentId(existingComponents)
      expect(id).toBe('c6') // Next after highest number (c5)
    })

    it('should handle custom component IDs mixed with numeric IDs', () => {
      const existingComponents: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'custom-header',
          name: 'CustomHeader',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c3',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      ]

      const id = generateComponentId(existingComponents)
      expect(id).toBe('c4') // Next after c3 (custom-header ignored)
    })
  })

  describe('DEFAULT_GRID_CONFIG', () => {
    it('should have correct mobile grid config', () => {
      expect(DEFAULT_GRID_CONFIG.mobile.gridCols).toBe(4)
      expect(DEFAULT_GRID_CONFIG.mobile.gridRows).toBe(8)
    })

    it('should have correct tablet grid config', () => {
      expect(DEFAULT_GRID_CONFIG.tablet.gridCols).toBe(8)
      expect(DEFAULT_GRID_CONFIG.tablet.gridRows).toBe(8)
    })

    it('should have correct desktop grid config', () => {
      expect(DEFAULT_GRID_CONFIG.desktop.gridCols).toBe(12)
      expect(DEFAULT_GRID_CONFIG.desktop.gridRows).toBe(8)
    })
  })

  describe('GRID_CONSTRAINTS', () => {
    it('should have correct constraint values', () => {
      expect(GRID_CONSTRAINTS.minCols).toBe(2)
      expect(GRID_CONSTRAINTS.minRows).toBe(2)
      expect(GRID_CONSTRAINTS.maxCols).toBe(24)
      expect(GRID_CONSTRAINTS.maxRows).toBe(24)
    })

    it('should have min values less than max values', () => {
      expect(GRID_CONSTRAINTS.minCols).toBeLessThan(GRID_CONSTRAINTS.maxCols)
      expect(GRID_CONSTRAINTS.minRows).toBeLessThan(GRID_CONSTRAINTS.maxRows)
    })
  })

  describe('normalizeSchema - responsiveCanvasLayout inheritance', () => {
    it('should inherit mobile layout to tablet when tablet is missing', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
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

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      expect(component.responsiveCanvasLayout?.tablet).toEqual({
        x: 0,
        y: 0,
        width: 4,
        height: 2,
      })
    })

    it('should inherit tablet layout to desktop when desktop is missing', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
              tablet: { x: 0, y: 0, width: 8, height: 1 },
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

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      expect(component.responsiveCanvasLayout?.desktop).toEqual({
        x: 0,
        y: 0,
        width: 8,
        height: 1,
      })
    })

    it('should inherit mobile to desktop when tablet is missing', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
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

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      // Desktop should inherit from mobile (since tablet is missing)
      expect(component.responsiveCanvasLayout?.desktop).toEqual({
        x: 0,
        y: 0,
        width: 4,
        height: 2,
      })
    })

    it('should not override existing responsive layouts', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 2 },
              tablet: { x: 0, y: 0, width: 8, height: 1 },
              desktop: { x: 0, y: 0, width: 12, height: 1 },
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

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      // All layouts should remain as original
      expect(component.responsiveCanvasLayout?.mobile).toEqual({
        x: 0,
        y: 0,
        width: 4,
        height: 2,
      })
      expect(component.responsiveCanvasLayout?.tablet).toEqual({
        x: 0,
        y: 0,
        width: 8,
        height: 1,
      })
      expect(component.responsiveCanvasLayout?.desktop).toEqual({
        x: 0,
        y: 0,
        width: 12,
        height: 1,
      })
    })

    it('should handle components without responsiveCanvasLayout', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      // Should not add responsiveCanvasLayout if it doesn't exist
      expect(component.responsiveCanvasLayout).toBeUndefined()
    })
  })

  describe('normalizeSchema - layouts.components synchronization', () => {
    it('should sync layouts.mobile.components with components that have mobile Canvas layout', () => {
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
              mobile: { x: 0, y: 0, width: 4, height: 1 },
            },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 1, width: 4, height: 6 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: [] }, // Empty initially
        },
      }

      const normalized = normalizeSchema(schema)

      // layouts.mobile.components should now include c1 and c2
      expect(normalized.layouts.mobile.components).toContain('c1')
      expect(normalized.layouts.mobile.components).toContain('c2')
      expect(normalized.layouts.mobile.components).toHaveLength(2)
    })

    it('should handle Desktop-first workflow: Desktop → add Mobile → place components on Mobile Canvas', () => {
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
              desktop: { x: 0, y: 0, width: 12, height: 1 },
              mobile: { x: 0, y: 0, width: 4, height: 2 }, // Placed on mobile Canvas
            },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 12, height: 6 },
              mobile: { x: 0, y: 2, width: 4, height: 5 }, // Placed on mobile Canvas
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: [] }, // Empty (not manually added)
          desktop: { structure: 'vertical', components: ['c1', 'c2'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // layouts.mobile.components should be auto-synced
      expect(normalized.layouts.mobile.components).toContain('c1')
      expect(normalized.layouts.mobile.components).toContain('c2')
      expect(normalized.layouts.mobile.components).toHaveLength(2)

      // layouts.desktop.components should remain unchanged
      expect(normalized.layouts.desktop.components).toContain('c1')
      expect(normalized.layouts.desktop.components).toContain('c2')
      expect(normalized.layouts.desktop.components).toHaveLength(2)
    })

    it('should preserve existing components in layouts and merge with Canvas components', () => {
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
              mobile: { x: 0, y: 0, width: 4, height: 1 },
            },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            // No Canvas layout - manually added to layout.components only
          },
          {
            id: 'c3',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'row' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 7, width: 4, height: 1 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c2'] }, // Only c2
        },
      }

      const normalized = normalizeSchema(schema)

      // Should include c2 (existing) + c1, c3 (from Canvas)
      expect(normalized.layouts.mobile.components).toContain('c1')
      expect(normalized.layouts.mobile.components).toContain('c2')
      expect(normalized.layouts.mobile.components).toContain('c3')
      expect(normalized.layouts.mobile.components).toHaveLength(3)
    })

    it('should not duplicate components already in layouts.components', () => {
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
              mobile: { x: 0, y: 0, width: 4, height: 1 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] }, // Already exists
        },
      }

      const normalized = normalizeSchema(schema)

      // Should not duplicate c1
      expect(normalized.layouts.mobile.components).toEqual(['c1'])
      expect(normalized.layouts.mobile.components).toHaveLength(1)
    })

    it('should handle multiple breakpoints independently', () => {
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
              mobile: { x: 0, y: 0, width: 4, height: 1 },
              desktop: { x: 0, y: 0, width: 12, height: 1 },
            },
          },
          {
            id: 'c2',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 3, height: 6 }, // Only on desktop
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
          desktop: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Mobile should only have c1 (c2 has no mobile Canvas layout)
      expect(normalized.layouts.mobile.components).toEqual(['c1'])

      // Desktop should have both c1 and c2
      expect(normalized.layouts.desktop.components).toContain('c1')
      expect(normalized.layouts.desktop.components).toContain('c2')
      expect(normalized.layouts.desktop.components).toHaveLength(2)
    })
  })

  describe('normalizeSchema - Canvas coordinate based sorting', () => {
    it('should sort components by Canvas Y coordinate (top to bottom)', () => {
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
              desktop: { x: 0, y: 0, width: 12, height: 1 }, // Row 0 (top)
            },
          },
          {
            id: 'c3',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'row' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 7, width: 12, height: 1 }, // Row 7 (bottom)
            },
          },
          {
            id: 'c4',
            name: 'Section',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 6, height: 6 }, // Row 1 (middle-left)
            },
          },
          {
            id: 'c5',
            name: 'Section2',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 6, y: 1, width: 6, height: 6 }, // Row 1 (middle-right)
            },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: { structure: 'vertical', components: ['c1', 'c3', 'c4', 'c5'] }, // Wrong order
        },
      }

      const normalized = normalizeSchema(schema)

      // Should be sorted: c1 (row 0) → c4, c5 (row 1, left to right) → c3 (row 7)
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c4', 'c5', 'c3'])
    })

    it('should sort components by X coordinate when Y is the same (left to right)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c2',
            name: 'Middle',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 4, y: 1, width: 4, height: 1 }, // Row 1, col 4
            },
          },
          {
            id: 'c1',
            name: 'Left',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 4, height: 1 }, // Row 1, col 0
            },
          },
          {
            id: 'c3',
            name: 'Right',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 8, y: 1, width: 4, height: 1 }, // Row 1, col 8
            },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: { structure: 'horizontal', components: ['c2', 'c1', 'c3'] }, // Wrong order
        },
      }

      const normalized = normalizeSchema(schema)

      // Should be sorted: c1 (x=0) → c2 (x=4) → c3 (x=8)
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c2', 'c3'])
    })

    it('should handle complex layout with multiple rows (real-world scenario)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'container' },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 0, width: 12, height: 1 }, // Row 0
            },
          },
          {
            id: 'c2',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 3, height: 6 }, // Row 1-6, left
            },
          },
          {
            id: 'c3',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            responsiveCanvasLayout: {
              desktop: { x: 3, y: 1, width: 9, height: 6 }, // Row 1-6, right
            },
          },
          {
            id: 'c4',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 7, width: 12, height: 1 }, // Row 7
            },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: { structure: 'sidebar-main', components: ['c4', 'c1', 'c3', 'c2'] }, // Completely wrong order
        },
      }

      const normalized = normalizeSchema(schema)

      // Should be sorted: c1 (row 0) → c2 (row 1, x=0) → c3 (row 1, x=3) → c4 (row 7)
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c2', 'c3', 'c4'])
    })

    it('should preserve order for components without Canvas layout', () => {
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
              desktop: { x: 0, y: 0, width: 12, height: 1 },
            },
          },
          {
            id: 'c2',
            name: 'NoCanvas1',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            // No Canvas layout
          },
          {
            id: 'c3',
            name: 'NoCanvas2',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            // No Canvas layout
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: { structure: 'vertical', components: ['c2', 'c3'] }, // Only c2, c3 initially
        },
      }

      const normalized = normalizeSchema(schema)

      // c1 should come first (has Canvas), then c2, c3 in original order
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c2', 'c3'])
    })
  })
})
