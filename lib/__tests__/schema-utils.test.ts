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
  getDefaultComponentData,
  cloneSchema,
  isValidSchema,
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

  describe('normalizeSchema - responsiveCanvasLayout handling', () => {
    it('should preserve explicit responsive layouts', () => {
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

    it('should auto-create missing layouts for breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
          // tablet layout missing
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.mobile).toBeDefined()
      expect(normalized.layouts.tablet).toBeDefined()
      expect(normalized.layouts.tablet.structure).toBe('vertical')
      expect(normalized.layouts.tablet.components).toEqual([])
    })

    it('should sort breakpoints by minWidth', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
          tablet: { structure: 'vertical', components: [] },
          desktop: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.breakpoints[0].name).toBe('mobile')
      expect(normalized.breakpoints[1].name).toBe('tablet')
      expect(normalized.breakpoints[2].name).toBe('desktop')
    })
  })

  describe('getDefaultComponentData', () => {
    it('should return default data for header', () => {
      const data = getDefaultComponentData('header')

      expect(data.name).toBe('Header')
      expect(data.semanticTag).toBe('header')
      expect(data.positioning.type).toBe('sticky')
      expect(data.positioning.position?.top).toBe(0)
      expect(data.layout.type).toBe('container')
    })

    it('should return default data for nav', () => {
      const data = getDefaultComponentData('nav')

      expect(data.name).toBe('Sidebar')
      expect(data.semanticTag).toBe('nav')
      expect(data.positioning.type).toBe('sticky')
      expect(data.layout.type).toBe('flex')
      expect(data.responsive?.mobile?.hidden).toBe(true)
      expect(data.responsive?.desktop?.hidden).toBe(false)
    })

    it('should return default data for main', () => {
      const data = getDefaultComponentData('main')

      expect(data.name).toBe('Main')
      expect(data.semanticTag).toBe('main')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('container')
      expect(data.styling?.className).toBe('flex-1')
    })

    it('should return default data for aside', () => {
      const data = getDefaultComponentData('aside')

      expect(data.name).toBe('Aside')
      expect(data.semanticTag).toBe('aside')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('flex')
    })

    it('should return default data for footer', () => {
      const data = getDefaultComponentData('footer')

      expect(data.name).toBe('Footer')
      expect(data.semanticTag).toBe('footer')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('container')
    })

    it('should return default data for section', () => {
      const data = getDefaultComponentData('section')

      expect(data.name).toBe('Section')
      expect(data.semanticTag).toBe('section')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('container')
    })

    it('should return default data for article', () => {
      const data = getDefaultComponentData('article')

      expect(data.name).toBe('Article')
      expect(data.semanticTag).toBe('article')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('flex')
    })

    it('should return default data for div', () => {
      const data = getDefaultComponentData('div')

      expect(data.name).toBe('Container')
      expect(data.semanticTag).toBe('div')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('flex')
    })

    it('should return default data for form', () => {
      const data = getDefaultComponentData('form')

      expect(data.name).toBe('Form')
      expect(data.semanticTag).toBe('form')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('flex')
      expect(data.styling?.className).toContain('shadow')
    })
  })

  describe('cloneSchema', () => {
    it('should create a deep clone of schema', () => {
      const original = createEmptySchema()
      original.components.push({
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      })

      const cloned = cloneSchema(original)

      // Should be deeply equal
      expect(cloned).toEqual(original)

      // Should be different objects
      expect(cloned).not.toBe(original)
      expect(cloned.components).not.toBe(original.components)
      expect(cloned.breakpoints).not.toBe(original.breakpoints)
      expect(cloned.layouts).not.toBe(original.layouts)

      // Modifying clone should not affect original
      cloned.components[0].name = 'Modified'
      expect(original.components[0].name).toBe('Header')
    })

    it('should clone nested objects deeply', () => {
      const original = createEmptySchema()
      original.components.push({
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
        layout: { type: 'flex', flex: { direction: 'row', gap: '1rem' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      })

      const cloned = cloneSchema(original)

      // Modify nested object
      if (cloned.components[0].positioning.position) {
        cloned.components[0].positioning.position.top = 100
      }

      // Original should remain unchanged
      expect(original.components[0].positioning.position?.top).toBe(0)
    })
  })

  describe('isValidSchema', () => {
    it('should return true for valid schema', () => {
      const valid = createEmptySchema()

      expect(isValidSchema(valid)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidSchema(null)).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isValidSchema('not an object')).toBe(false)
      expect(isValidSchema(123)).toBe(false)
      expect(isValidSchema(undefined)).toBe(false)
    })

    it('should return false for missing schemaVersion', () => {
      const invalid = {
        components: [],
        breakpoints: [],
        layouts: {},
      }

      expect(isValidSchema(invalid)).toBe(false)
    })

    it('should return false for wrong schemaVersion', () => {
      const invalid = {
        schemaVersion: '1.0',
        components: [],
        breakpoints: [],
        layouts: {},
      }

      expect(isValidSchema(invalid)).toBe(false)
    })

    it('should return false for missing components array', () => {
      const invalid = {
        schemaVersion: '2.0',
        breakpoints: [],
        layouts: {},
      }

      expect(isValidSchema(invalid)).toBe(false)
    })

    it('should return false for missing breakpoints array', () => {
      const invalid = {
        schemaVersion: '2.0',
        components: [],
        layouts: {},
      }

      expect(isValidSchema(invalid)).toBe(false)
    })

    it('should return false for missing layouts object', () => {
      const invalid = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [],
      }

      expect(isValidSchema(invalid)).toBe(false)
    })

    it('should return false for non-object layouts', () => {
      const invalid = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [],
        layouts: null,
      }

      expect(isValidSchema(invalid)).toBe(false)
    })
  })
})
