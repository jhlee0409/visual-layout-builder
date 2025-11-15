/**
 * Unit Tests: Complete Breakpoint Independence
 *
 * Verifies that normalizeSchema() enforces complete isolation between breakpoints:
 * - No layout inheritance
 * - No Canvas layout inheritance
 * - Supports any custom breakpoint names
 * - Each breakpoint is independently managed
 */

import { describe, it, expect } from 'vitest'
import { normalizeSchema } from '../schema-utils'
import type { LaydlerSchema } from '@/types/schema'

describe('Complete Breakpoint Independence', () => {
  describe('Custom breakpoint names', () => {
    it('should support capital letters in breakpoint names (e.g., Desktop)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'Mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'Desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          Mobile: { structure: 'vertical', components: ['c1'] },
          // Desktop layout missing - will be auto-created as empty
        },
      }

      const normalized = normalizeSchema(schema)

      // Desktop should be auto-created but EMPTY (no inheritance)
      expect(normalized.layouts.Desktop).toBeDefined()
      expect(normalized.layouts.Desktop.structure).toBe('vertical')
      expect(normalized.layouts.Desktop.components).toEqual([])  // Empty!
    })

    it('should support arbitrary custom breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'Phone', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'Tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'LaptopXL', minWidth: 1440, gridCols: 16, gridRows: 10 },
        ],
        layouts: {
          Phone: { structure: 'vertical', components: ['c1'] },
          // Tablet and LaptopXL missing - will be auto-created as empty
        },
      }

      const normalized = normalizeSchema(schema)

      // All missing layouts should be auto-created but EMPTY
      expect(normalized.layouts.Tablet).toBeDefined()
      expect(normalized.layouts.Tablet.components).toEqual([])  // Empty!
      expect(normalized.layouts.LaptopXL).toBeDefined()
      expect(normalized.layouts.LaptopXL.components).toEqual([])  // Empty!
    })

    it('should handle mixed case breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'smallScreen', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'MediumScreen', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'LARGE_SCREEN', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          smallScreen: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // All layouts exist
      expect(normalized.layouts.smallScreen).toBeDefined()
      expect(normalized.layouts.MediumScreen).toBeDefined()
      expect(normalized.layouts.LARGE_SCREEN).toBeDefined()

      // Only smallScreen has components
      expect(normalized.layouts.smallScreen.components).toEqual(['c1'])
      expect(normalized.layouts.MediumScreen.components).toEqual([])  // Empty!
      expect(normalized.layouts.LARGE_SCREEN.components).toEqual([])  // Empty!
    })
  })

  describe('No layout inheritance', () => {
    it('should NOT inherit layout when missing', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          // desktop missing
        },
      }

      const normalized = normalizeSchema(schema)

      // Desktop should be auto-created but EMPTY (no inheritance)
      expect(normalized.layouts.desktop).toBeDefined()
      expect(normalized.layouts.desktop.components).toEqual([])
    })
  })

  describe('No Canvas layout inheritance', () => {
    it('should NOT inherit Canvas Layout for custom breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            responsiveCanvasLayout: {
              laptop: { x: 0, y: 0, width: 10, height: 1 },
              // ultrawide missing
            },
          },
        ],
        breakpoints: [
          { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
          { name: 'ultrawide', minWidth: 2560, gridCols: 16, gridRows: 8 },
        ],
        layouts: {
          laptop: { structure: 'vertical', components: ['c1'] },
          ultrawide: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)
      const c1 = normalized.components.find(comp => comp.id === 'c1')!

      // laptop has Canvas layout
      expect(c1.responsiveCanvasLayout?.laptop).toEqual({ x: 0, y: 0, width: 10, height: 1 })

      // ultrawide does NOT inherit (stays undefined)
      expect(c1.responsiveCanvasLayout?.ultrawide).toBeUndefined()
    })
  })

  describe('Breakpoint sorting', () => {
    it('should sort breakpoints by minWidth without inheritance', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'laptop', minWidth: 1440, gridCols: 12, gridRows: 8 },
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          tablet: { structure: 'vertical', components: [] },
          laptop: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Breakpoints should be sorted by minWidth
      expect(normalized.breakpoints[0].name).toBe('mobile')
      expect(normalized.breakpoints[1].name).toBe('tablet')
      expect(normalized.breakpoints[2].name).toBe('laptop')

      // No inheritance occurred
      expect(normalized.layouts.mobile.components).toEqual(['c1'])
      expect(normalized.layouts.tablet.components).toEqual([])
      expect(normalized.layouts.laptop.components).toEqual([])
    })

    it('should handle non-standard minWidth values without inheritance', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'bp3', minWidth: 1920, gridCols: 16, gridRows: 8 },
          { name: 'bp1', minWidth: 320, gridCols: 4, gridRows: 8 },
          { name: 'bp2', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          bp1: { structure: 'vertical', components: [] },
          bp2: { structure: 'vertical', components: [] },
          bp3: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.breakpoints[0].name).toBe('bp1')  // 320
      expect(normalized.breakpoints[1].name).toBe('bp2')  // 1024
      expect(normalized.breakpoints[2].name).toBe('bp3')  // 1920
    })
  })

  describe('Edge case: Duplicate minWidth values', () => {
    it('should use deterministic sorting (alphabetical by name) when minWidth values are equal', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'zeta', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'alpha', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          zeta: { structure: 'vertical', components: [] },
          alpha: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Should sort alphabetically when minWidth is equal
      expect(normalized.breakpoints[0].name).toBe('alpha')
      expect(normalized.breakpoints[1].name).toBe('zeta')
    })

    it('should handle three breakpoints with same minWidth deterministically', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'charlie', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'bravo', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'alpha', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          charlie: { structure: 'vertical', components: [] },
          bravo: { structure: 'vertical', components: [] },
          alpha: { structure: 'vertical', components: [] },
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.breakpoints[0].name).toBe('alpha')
      expect(normalized.breakpoints[1].name).toBe('bravo')
      expect(normalized.breakpoints[2].name).toBe('charlie')
    })
  })
})
