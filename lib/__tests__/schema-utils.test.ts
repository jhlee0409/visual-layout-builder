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
  })
})
