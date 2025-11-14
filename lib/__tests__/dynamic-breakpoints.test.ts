/**
 * Dynamic Breakpoints Test
 *
 * Tests that the system supports unlimited custom breakpoint names
 * beyond the default mobile/tablet/desktop.
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema, Component, Breakpoint } from '@/types/schema'
import { generatePrompt } from '../prompt-generator'
import { validateSchema } from '../schema-validation'
import { DEFAULT_GRID_CONFIG } from '../schema-utils'

describe('Dynamic Breakpoints Support', () => {
  describe('Custom Breakpoint Names', () => {
    it('should support laptop breakpoint', () => {
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
              laptop: { x: 0, y: 0, width: 10, height: 1 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          laptop: { structure: 'vertical', components: ['c1'] },
        },
      }

      const validation = validateSchema(schema)
      expect(validation.valid).toBe(true)

      const promptResult = generatePrompt(schema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toContain('laptop')
      expect(promptResult.prompt).toContain('Laptop')
    })

    it('should support ultrawide and 4k breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 4 },
              tablet: { x: 0, y: 0, width: 8, height: 6 },
              desktop: { x: 0, y: 0, width: 12, height: 8 },
              ultrawide: { x: 0, y: 0, width: 16, height: 8 },
              '4k': { x: 0, y: 0, width: 20, height: 10 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'ultrawide', minWidth: 2560, gridCols: 16, gridRows: 8 },
          { name: '4k', minWidth: 3840, gridCols: 20, gridRows: 10 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          tablet: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: ['c1'] },
          ultrawide: { structure: 'vertical', components: ['c1'] },
          '4k': { structure: 'vertical', components: ['c1'] },
        },
      }

      const validation = validateSchema(schema)
      expect(validation.valid).toBe(true)

      const promptResult = generatePrompt(schema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toContain('ultrawide')
      expect(promptResult.prompt).toContain('4k')
      expect(promptResult.prompt).toContain('Ultrawide')
    })

    it('should support arbitrary custom breakpoint names', () => {
      const customBreakpoints = [
        'smartphone',
        'phablet',
        'netbook',
        'widescreen',
        'custom-1200',
        'my-breakpoint',
      ]

      customBreakpoints.forEach((breakpointName) => {
        const schema: LaydlerSchema = {
          schemaVersion: '2.0',
          components: [
            {
              id: 'c1',
              name: 'Test',
              semanticTag: 'div',
              positioning: { type: 'static' },
              layout: { type: 'flex' },
              responsiveCanvasLayout: {
                [breakpointName]: { x: 0, y: 0, width: 12, height: 1 },
              },
            },
          ],
          breakpoints: [{ name: breakpointName, minWidth: 0, gridCols: 12, gridRows: 8 }],
          layouts: {
            [breakpointName]: { structure: 'vertical', components: ['c1'] },
          },
        }

        const validation = validateSchema(schema)
        expect(validation.valid).toBe(true)
        expect(validation.errors).toHaveLength(0)
      })
    })
  })

  describe('DEFAULT_GRID_CONFIG Fallback', () => {
    it('should use default grid config for known breakpoints', () => {
      expect(DEFAULT_GRID_CONFIG['mobile']).toEqual({ gridCols: 4, gridRows: 8 })
      expect(DEFAULT_GRID_CONFIG['tablet']).toEqual({ gridCols: 8, gridRows: 8 })
      expect(DEFAULT_GRID_CONFIG['desktop']).toEqual({ gridCols: 12, gridRows: 8 })
    })

    it('should return undefined for unknown breakpoints (fallback to 12x8)', () => {
      expect(DEFAULT_GRID_CONFIG['laptop']).toBeUndefined()
      expect(DEFAULT_GRID_CONFIG['ultrawide']).toBeUndefined()
      expect(DEFAULT_GRID_CONFIG['custom-name']).toBeUndefined()
    })
  })

  describe('ResponsiveBehavior with Custom Breakpoints', () => {
    it('should support responsive behavior for custom breakpoints', () => {
      const component: Component = {
        id: 'c1',
        name: 'Sidebar',
        semanticTag: 'aside',
        positioning: { type: 'static' },
        layout: { type: 'flex' },
        responsive: {
          mobile: { hidden: true },
          laptop: { hidden: false, width: '300px' },
          ultrawide: { width: '400px', order: 1 },
        },
      }

      expect(component.responsive?.mobile).toBeDefined()
      expect(component.responsive?.laptop).toBeDefined()
      expect(component.responsive?.ultrawide).toBeDefined()
      expect(component.responsive?.mobile?.hidden).toBe(true)
      expect(component.responsive?.laptop?.width).toBe('300px')
      expect(component.responsive?.ultrawide?.order).toBe(1)
    })
  })

  describe('Component Links with Custom Breakpoints', () => {
    it('should link components across custom breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header-mobile',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 },
            },
          },
          {
            id: 'header-laptop',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              laptop: { x: 0, y: 0, width: 10, height: 1 },
            },
          },
          {
            id: 'header-4k',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              '4k': { x: 0, y: 0, width: 20, height: 1 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
          { name: '4k', minWidth: 3840, gridCols: 20, gridRows: 10 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['header-mobile'] },
          laptop: { structure: 'vertical', components: ['header-laptop'] },
          '4k': { structure: 'vertical', components: ['header-4k'] },
        },
      }

      const componentLinks = [
        { source: 'header-mobile', target: 'header-laptop' },
        { source: 'header-laptop', target: 'header-4k' },
      ]

      const promptResult = generatePrompt(schema, 'react', 'tailwind', componentLinks)
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toContain('Component Links')
      expect(promptResult.prompt).toContain('header-mobile')
      expect(promptResult.prompt).toContain('header-laptop')
      expect(promptResult.prompt).toContain('header-4k')
    })
  })

  describe('Edge Cases', () => {
    it('should handle breakpoint names with special characters', () => {
      const specialNames = ['custom-768', 'breakpoint_1024', 'bp-2560']

      specialNames.forEach((name) => {
        const schema: LaydlerSchema = {
          schemaVersion: '2.0',
          components: [
            {
              id: 'c1',
              name: 'Test',
              semanticTag: 'div',
              positioning: { type: 'static' },
              layout: { type: 'flex' },
              responsiveCanvasLayout: {
                [name]: { x: 0, y: 0, width: 12, height: 1 },
              },
            },
          ],
          breakpoints: [{ name, minWidth: 0, gridCols: 12, gridRows: 8 }],
          layouts: {
            [name]: { structure: 'vertical', components: ['c1'] },
          },
        }

        const validation = validateSchema(schema)
        if (!validation.valid) {
          console.error(`Validation errors for ${name}:`, validation.errors)
        }
        expect(validation.valid).toBe(true)
      })
    })

    it('should handle 10+ breakpoints without hardcoding issues', () => {
      const breakpoints: Breakpoint[] = []
      const layouts: LaydlerSchema['layouts'] = {}

      for (let i = 0; i < 15; i++) {
        const name = `bp${i}`
        breakpoints.push({
          name,
          minWidth: i * 200,
          gridCols: 12,
          gridRows: 8,
        })
        layouts[name] = { structure: 'vertical', components: ['c1'] }
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Test',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints,
        layouts,
      }

      const validation = validateSchema(schema)
      if (!validation.valid) {
        console.error('Validation errors for 10+ breakpoints:', validation.errors)
      }
      expect(validation.valid).toBe(true)
      expect(schema.breakpoints).toHaveLength(15)
    })
  })
})
