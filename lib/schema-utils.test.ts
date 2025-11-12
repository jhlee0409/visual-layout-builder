import { describe, it, expect } from 'vitest'
import {
  createEmptySchema,
  createSchemaWithBreakpoint,
  generateComponentId,
  cloneSchema,
  getDefaultComponentData,
  isValidSchema,
  normalizeSchema,
  DEFAULT_GRID_CONFIG,
  GRID_CONSTRAINTS,
} from './schema-utils'
import type { LaydlerSchema, Component } from '@/types/schema'

describe('schema-utils', () => {
  describe('DEFAULT_GRID_CONFIG', () => {
    it('should have correct grid configuration for each breakpoint type', () => {
      expect(DEFAULT_GRID_CONFIG.mobile).toEqual({ gridCols: 4, gridRows: 8 })
      expect(DEFAULT_GRID_CONFIG.tablet).toEqual({ gridCols: 8, gridRows: 8 })
      expect(DEFAULT_GRID_CONFIG.desktop).toEqual({ gridCols: 12, gridRows: 8 })
      expect(DEFAULT_GRID_CONFIG.custom).toEqual({ gridCols: 6, gridRows: 8 })
    })
  })

  describe('GRID_CONSTRAINTS', () => {
    it('should have correct constraints', () => {
      expect(GRID_CONSTRAINTS.minCols).toBe(2)
      expect(GRID_CONSTRAINTS.minRows).toBe(2)
      expect(GRID_CONSTRAINTS.maxCols).toBe(24)
      expect(GRID_CONSTRAINTS.maxRows).toBe(24)
    })
  })

  describe('createEmptySchema', () => {
    it('should create a valid empty schema', () => {
      const schema = createEmptySchema()

      expect(schema.schemaVersion).toBe('2.0')
      expect(schema.components).toEqual([])
      expect(schema.breakpoints).toHaveLength(3)
    })

    it('should include all three default breakpoints', () => {
      const schema = createEmptySchema()

      const breakpointNames = schema.breakpoints.map((bp) => bp.name)
      expect(breakpointNames).toEqual(['mobile', 'tablet', 'desktop'])
    })

    it('should have layouts for all breakpoints', () => {
      const schema = createEmptySchema()

      expect(schema.layouts.mobile).toBeDefined()
      expect(schema.layouts.tablet).toBeDefined()
      expect(schema.layouts.desktop).toBeDefined()
    })

    it('should have vertical structure for all layouts', () => {
      const schema = createEmptySchema()

      expect(schema.layouts.mobile?.structure).toBe('vertical')
      expect(schema.layouts.tablet?.structure).toBe('vertical')
      expect(schema.layouts.desktop?.structure).toBe('vertical')
    })

    it('should have correct grid configuration for each breakpoint', () => {
      const schema = createEmptySchema()

      const mobile = schema.breakpoints.find((bp) => bp.name === 'mobile')
      const tablet = schema.breakpoints.find((bp) => bp.name === 'tablet')
      const desktop = schema.breakpoints.find((bp) => bp.name === 'desktop')

      expect(mobile).toMatchObject({ gridCols: 4, gridRows: 8, minWidth: 0 })
      expect(tablet).toMatchObject({ gridCols: 8, gridRows: 8, minWidth: 768 })
      expect(desktop).toMatchObject({ gridCols: 12, gridRows: 8, minWidth: 1024 })
    })
  })

  describe('createSchemaWithBreakpoint', () => {
    it('should create schema with mobile breakpoint', () => {
      const schema = createSchemaWithBreakpoint('mobile')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('mobile')
      expect(schema.breakpoints[0].minWidth).toBe(0)
      expect(schema.layouts.mobile).toBeDefined()
    })

    it('should create schema with tablet breakpoint', () => {
      const schema = createSchemaWithBreakpoint('tablet')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('tablet')
      expect(schema.breakpoints[0].minWidth).toBe(768)
      expect(schema.layouts.tablet).toBeDefined()
    })

    it('should create schema with desktop breakpoint', () => {
      const schema = createSchemaWithBreakpoint('desktop')

      expect(schema.breakpoints).toHaveLength(1)
      expect(schema.breakpoints[0].name).toBe('desktop')
      expect(schema.breakpoints[0].minWidth).toBe(1024)
      expect(schema.layouts.desktop).toBeDefined()
    })

    it('should have correct grid configuration', () => {
      const mobileSchema = createSchemaWithBreakpoint('mobile')
      expect(mobileSchema.breakpoints[0]).toMatchObject({
        gridCols: 4,
        gridRows: 8,
      })

      const tabletSchema = createSchemaWithBreakpoint('tablet')
      expect(tabletSchema.breakpoints[0]).toMatchObject({
        gridCols: 8,
        gridRows: 8,
      })

      const desktopSchema = createSchemaWithBreakpoint('desktop')
      expect(desktopSchema.breakpoints[0]).toMatchObject({
        gridCols: 12,
        gridRows: 8,
      })
    })
  })

  describe('generateComponentId', () => {
    it('should generate c1 for empty components array', () => {
      const id = generateComponentId([])
      expect(id).toBe('c1')
    })

    it('should generate next ID based on existing components', () => {
      const components: Component[] = [
        { id: 'c1', name: 'Header', semanticTag: 'header', positioning: { type: 'static' }, layout: { type: 'none' } },
        { id: 'c2', name: 'Main', semanticTag: 'main', positioning: { type: 'static' }, layout: { type: 'none' } },
      ]

      const id = generateComponentId(components)
      expect(id).toBe('c3')
    })

    it('should handle non-sequential IDs', () => {
      const components: Component[] = [
        { id: 'c1', name: 'Header', semanticTag: 'header', positioning: { type: 'static' }, layout: { type: 'none' } },
        { id: 'c5', name: 'Main', semanticTag: 'main', positioning: { type: 'static' }, layout: { type: 'none' } },
        { id: 'c3', name: 'Footer', semanticTag: 'footer', positioning: { type: 'static' }, layout: { type: 'none' } },
      ]

      const id = generateComponentId(components)
      expect(id).toBe('c6')
    })

    it('should handle custom ID formats gracefully', () => {
      const components: Component[] = [
        { id: 'custom-1', name: 'Header', semanticTag: 'header', positioning: { type: 'static' }, layout: { type: 'none' } },
        { id: 'c2', name: 'Main', semanticTag: 'main', positioning: { type: 'static' }, layout: { type: 'none' } },
      ]

      const id = generateComponentId(components)
      expect(id).toBe('c3')
    })
  })

  describe('cloneSchema', () => {
    it('should create a deep copy of schema', () => {
      const original = createEmptySchema()
      const cloned = cloneSchema(original)

      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
    })

    it('should not affect original when modifying clone', () => {
      const original = createEmptySchema()
      const cloned = cloneSchema(original)

      cloned.components.push({
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'static' },
        layout: { type: 'none' },
      })

      expect(original.components).toHaveLength(0)
      expect(cloned.components).toHaveLength(1)
    })

    it('should deep clone nested objects', () => {
      const original = createEmptySchema()
      const cloned = cloneSchema(original)

      cloned.breakpoints[0].gridCols = 99

      expect(original.breakpoints[0].gridCols).toBe(4)
      expect(cloned.breakpoints[0].gridCols).toBe(99)
    })
  })

  describe('getDefaultComponentData', () => {
    it('should return header defaults', () => {
      const data = getDefaultComponentData('header')

      expect(data.name).toBe('Header')
      expect(data.semanticTag).toBe('header')
      expect(data.positioning.type).toBe('sticky')
      expect(data.layout.type).toBe('container')
    })

    it('should return nav (sidebar) defaults', () => {
      const data = getDefaultComponentData('nav')

      expect(data.name).toBe('Sidebar')
      expect(data.semanticTag).toBe('nav')
      expect(data.positioning.type).toBe('sticky')
      expect(data.layout.type).toBe('flex')
      expect(data.responsive).toBeDefined()
    })

    it('should return main defaults', () => {
      const data = getDefaultComponentData('main')

      expect(data.name).toBe('Main')
      expect(data.semanticTag).toBe('main')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('container')
    })

    it('should return footer defaults', () => {
      const data = getDefaultComponentData('footer')

      expect(data.name).toBe('Footer')
      expect(data.semanticTag).toBe('footer')
      expect(data.positioning.type).toBe('static')
      expect(data.layout.type).toBe('container')
    })

    it('should return form defaults', () => {
      const data = getDefaultComponentData('form')

      expect(data.name).toBe('Form')
      expect(data.semanticTag).toBe('form')
      expect(data.layout.type).toBe('flex')
    })

    it('should have all semantic tags covered', () => {
      const semanticTags = ['header', 'nav', 'main', 'aside', 'footer', 'section', 'article', 'div', 'form'] as const

      semanticTags.forEach((tag) => {
        const data = getDefaultComponentData(tag)
        expect(data).toBeDefined()
        expect(data.semanticTag).toBe(tag)
      })
    })
  })

  describe('isValidSchema', () => {
    it('should return true for valid schema', () => {
      const schema = createEmptySchema()
      expect(isValidSchema(schema)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidSchema(null)).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isValidSchema('not an object')).toBe(false)
      expect(isValidSchema(123)).toBe(false)
      expect(isValidSchema(undefined)).toBe(false)
    })

    it('should return false for wrong schema version', () => {
      const schema = { ...createEmptySchema(), schemaVersion: '1.0' }
      expect(isValidSchema(schema)).toBe(false)
    })

    it('should return false when components is not array', () => {
      const schema = { ...createEmptySchema(), components: 'not an array' }
      expect(isValidSchema(schema as any)).toBe(false)
    })

    it('should return false when breakpoints is not array', () => {
      const schema = { ...createEmptySchema(), breakpoints: 'not an array' }
      expect(isValidSchema(schema as any)).toBe(false)
    })

    it('should return false when layouts is missing', () => {
      const schema = { ...createEmptySchema(), layouts: null }
      expect(isValidSchema(schema as any)).toBe(false)
    })
  })

  describe('normalizeSchema', () => {
    it('should not modify schema that already has all layouts defined', () => {
      const original = createEmptySchema()
      const normalized = normalizeSchema(original)

      expect(normalized.layouts.mobile).toBeDefined()
      expect(normalized.layouts.tablet).toBeDefined()
      expect(normalized.layouts.desktop).toBeDefined()
    })

    it('should inherit tablet layout from mobile when tablet is empty', () => {
      const schema = createEmptySchema()
      schema.layouts.mobile!.components = ['c1', 'c2']
      schema.layouts.tablet!.components = []

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.tablet?.components).toEqual(['c1', 'c2'])
    })

    it('should inherit desktop layout from tablet when desktop is empty', () => {
      const schema = createEmptySchema()
      schema.layouts.tablet!.components = ['c1', 'c3']
      schema.layouts.desktop!.components = []

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.desktop?.components).toEqual(['c1', 'c3'])
    })

    it('should cascade mobile -> tablet -> desktop', () => {
      const schema = createEmptySchema()
      schema.layouts.mobile!.components = ['c1', 'c2']
      schema.layouts.tablet!.components = []
      schema.layouts.desktop!.components = []

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.mobile?.components).toEqual(['c1', 'c2'])
      expect(normalized.layouts.tablet?.components).toEqual(['c1', 'c2'])
      expect(normalized.layouts.desktop?.components).toEqual(['c1', 'c2'])
    })

    it('should not override explicitly set layouts', () => {
      const schema = createEmptySchema()
      schema.layouts.mobile!.components = ['c1']
      schema.layouts.tablet!.components = ['c2']
      schema.layouts.desktop!.components = ['c3']

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.mobile?.components).toEqual(['c1'])
      expect(normalized.layouts.tablet?.components).toEqual(['c2'])
      expect(normalized.layouts.desktop?.components).toEqual(['c3'])
    })

    it('should inherit responsiveCanvasLayout for components', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
          },
        },
      ]

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      expect(component.responsiveCanvasLayout?.mobile).toEqual({ x: 0, y: 0, width: 4, height: 1 })
      expect(component.responsiveCanvasLayout?.tablet).toEqual({ x: 0, y: 0, width: 4, height: 1 })
      expect(component.responsiveCanvasLayout?.desktop).toEqual({ x: 0, y: 0, width: 4, height: 1 })
    })

    it('should not override explicit responsiveCanvasLayout values', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
            tablet: { x: 0, y: 0, width: 8, height: 1 },
            desktop: { x: 0, y: 0, width: 12, height: 1 },
          },
        },
      ]

      const normalized = normalizeSchema(schema)
      const component = normalized.components[0]

      expect(component.responsiveCanvasLayout?.mobile?.width).toBe(4)
      expect(component.responsiveCanvasLayout?.tablet?.width).toBe(8)
      expect(component.responsiveCanvasLayout?.desktop?.width).toBe(12)
    })

    it('should not mutate original schema', () => {
      const original = createEmptySchema()
      original.layouts.mobile!.components = ['c1']
      original.layouts.tablet!.components = []

      const originalTabletComponents = [...(original.layouts.tablet?.components || [])]

      normalizeSchema(original)

      expect(original.layouts.tablet?.components).toEqual(originalTabletComponents)
    })
  })
})
