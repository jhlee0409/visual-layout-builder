/**
 * Grid Constraints Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  calculateMinimumGridSize,
  isGridResizeSafe,
  getAffectedComponentIds,
  suggestGridCompaction,
  isComponentOutOfBounds,
} from '../grid-constraints'
import type { Component } from '@/types/schema'

describe('Grid Constraints', () => {
  describe('calculateMinimumGridSize', () => {
    it('should return default minimum for empty canvas', () => {
      const result = calculateMinimumGridSize([], 'mobile')

      expect(result.minRows).toBe(2)
      expect(result.minCols).toBe(2)
    })

    it('should calculate minimum based on component positions', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      ]

      const result = calculateMinimumGridSize(components, 'mobile')

      // Header ends at y=1, Main ends at y=7
      expect(result.minRows).toBe(7) // y + height = 1 + 6
      expect(result.minCols).toBe(12) // x + width = 0 + 12
    })

    it('should handle components with different widths', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
        },
      ]

      const result = calculateMinimumGridSize(components, 'desktop')

      expect(result.minRows).toBe(8)
      expect(result.minCols).toBe(12) // 3 + 9
    })

    it('should use responsive canvas layout for current breakpoint', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 2 },
            tablet: { x: 0, y: 0, width: 8, height: 1 },
            desktop: { x: 0, y: 0, width: 12, height: 1 },
          },
        },
      ]

      const mobileResult = calculateMinimumGridSize(components, 'mobile')
      expect(mobileResult.minCols).toBe(4)
      expect(mobileResult.minRows).toBe(2)

      const desktopResult = calculateMinimumGridSize(components, 'desktop')
      expect(desktopResult.minCols).toBe(12)
      expect(desktopResult.minRows).toBe(1)
    })
  })

  describe('isGridResizeSafe', () => {
    it('should allow resize when no components would be cut off', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 10, height: 1 },
        },
      ]

      const result = isGridResizeSafe(10, 12, components, 'desktop')

      expect(result.safe).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject resize when components would be cut off vertically', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 9, width: 12, height: 1 },
        },
      ]

      const result = isGridResizeSafe(8, 12, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.reason).toBeDefined()
      expect(result.affectedComponents).toHaveLength(1)
      expect(result.affectedComponents?.[0].id).toBe('c1')
    })

    it('should reject resize when components would be cut off horizontally', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
        },
      ]

      const result = isGridResizeSafe(10, 10, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.reason).toBeDefined()
      expect(result.affectedComponents).toHaveLength(1)
    })

    it('should provide minimum required grid size when resize is unsafe', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
        },
      ]

      const result = isGridResizeSafe(5, 5, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.minimumRequired).toBeDefined()
      expect(result.minimumRequired?.rows).toBe(8)
      expect(result.minimumRequired?.cols).toBe(12)
    })

    it('should allow resize for empty canvas', () => {
      const result = isGridResizeSafe(4, 4, [], 'mobile')

      expect(result.safe).toBe(true)
    })

    it('should detect multiple affected components', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 4, width: 3, height: 4 }, // ends at row 8
        },
        {
          id: 'c2',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 9, width: 12, height: 1 }, // ends at row 10
        },
      ]

      const result = isGridResizeSafe(7, 12, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.affectedComponents).toHaveLength(2)
    })
  })

  describe('isGridResizeSafe - Column validation', () => {
    it('should detect column clipping when reducing width', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'WideComponent',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 10, height: 2 },
        },
      ]

      const result = isGridResizeSafe(12, 8, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.reason).toContain('Cannot reduce to 8 columns')
      expect(result.affectedComponents).toHaveLength(1)
      expect(result.affectedComponents?.[0].id).toBe('c1')
    })

    it('should allow column reduction when all components fit', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'SmallComponent',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 4, height: 2 },
        },
      ]

      const result = isGridResizeSafe(12, 6, components, 'desktop')

      expect(result.safe).toBe(true)
      expect(result.affectedComponents).toBeUndefined()
    })

    it('should detect multiple components affected by column reduction', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c2',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 10, width: 12, height: 1 },
        },
      ]

      const result = isGridResizeSafe(12, 10, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.affectedComponents).toHaveLength(2)
      expect(result.minimumRequired.cols).toBe(12)
    })
  })

  describe('getAffectedComponentIds', () => {
    it('should return empty array when resize is safe', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'SmallBox',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          canvasLayout: { x: 0, y: 0, width: 2, height: 2 },
        },
      ]

      const affected = getAffectedComponentIds(10, 10, components, 'desktop')

      expect(affected).toEqual([])
    })

    it('should return IDs of affected components when resize clips them', () => {
      const components: Component[] = [
        {
          id: 'header',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'sidebar',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 1, width: 3, height: 10 },
        },
        {
          id: 'main',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 3, y: 1, width: 9, height: 8 },
        },
      ]

      // Reducing rows to 8 will clip sidebar (ends at row 11)
      const affected = getAffectedComponentIds(8, 12, components, 'desktop')

      expect(affected).toContain('sidebar')
      expect(affected).not.toContain('header')
      expect(affected).toContain('main')
    })

    it('should handle multiple affected components in different directions', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'TopRight',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          canvasLayout: { x: 10, y: 0, width: 3, height: 2 },
        },
        {
          id: 'c2',
          name: 'BottomLeft',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          canvasLayout: { x: 0, y: 10, width: 5, height: 2 },
        },
      ]

      // Test row clipping: c2 extends beyond row 8 (y:10 + h:2 = 12)
      const rowAffected = getAffectedComponentIds(8, 15, components, 'desktop')
      expect(rowAffected).toContain('c2')
      expect(rowAffected).not.toContain('c1') // c1 is within 8 rows

      // Test col clipping: c1 extends beyond column 8 (x:10 + w:3 = 13)
      const colAffected = getAffectedComponentIds(15, 8, components, 'desktop')
      expect(colAffected).toContain('c1')
      expect(colAffected).not.toContain('c2') // c2 is within 8 columns
    })

    it('should work with responsive canvas layouts', () => {
      const component: Component = {
        id: 'responsive',
        name: 'ResponsiveBox',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 4 },
          tablet: { x: 0, y: 0, width: 8, height: 3 },
          desktop: { x: 0, y: 0, width: 12, height: 2 },
        },
      }

      // Mobile: width 4, reducing to 3 cols should clip
      const mobileAffected = getAffectedComponentIds(10, 3, [component], 'mobile')
      expect(mobileAffected).toContain('responsive')

      // Desktop: width 12, reducing to 10 cols should clip
      const desktopAffected = getAffectedComponentIds(10, 10, [component], 'desktop')
      expect(desktopAffected).toContain('responsive')
    })
  })

  describe('suggestGridCompaction', () => {
    it('should suggest no reduction for fully utilized grid', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'FullWidth',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 10 },
        },
      ]

      const suggestion = suggestGridCompaction(components, 10, 12, 'desktop')

      expect(suggestion.canReduceRows).toBe(0)
      expect(suggestion.canReduceCols).toBe(0)
    })

    it('should suggest reduction when grid has empty space', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'SmallBox',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          canvasLayout: { x: 0, y: 0, width: 4, height: 3 },
        },
      ]

      const suggestion = suggestGridCompaction(components, 20, 12, 'desktop')

      expect(suggestion.canReduceRows).toBe(17) // 20 - 3 = 17
      expect(suggestion.canReduceCols).toBe(8) // 12 - 4 = 8
    })

    it('should account for multiple components when suggesting compaction', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c2',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 1, width: 3, height: 5 },
        },
        {
          id: 'c3',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 3, y: 1, width: 9, height: 4 },
        },
      ]

      const suggestion = suggestGridCompaction(components, 20, 16, 'desktop')

      // Minimum needed: cols = 12 (3+9), rows = 6 (1+5)
      expect(suggestion.canReduceRows).toBe(14) // 20 - 6
      expect(suggestion.canReduceCols).toBe(4) // 16 - 12
    })

    it('should handle empty canvas', () => {
      const suggestion = suggestGridCompaction([], 20, 12, 'desktop')

      // Can reduce to minimum (2x2)
      expect(suggestion.canReduceRows).toBe(18) // 20 - 2
      expect(suggestion.canReduceCols).toBe(10) // 12 - 2
    })

    it('should never suggest negative reduction', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Huge',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 15, height: 15 },
        },
      ]

      // Current grid is 10x10, but component needs 15x15
      const suggestion = suggestGridCompaction(components, 10, 10, 'desktop')

      expect(suggestion.canReduceRows).toBe(0)
      expect(suggestion.canReduceCols).toBe(0)
    })
  })

  describe('isComponentOutOfBounds', () => {
    const gridRows = 8
    const gridCols = 12

    it('should return false for component within bounds', () => {
      const component: Component = {
        id: 'c1',
        name: 'InBounds',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 2, y: 2, width: 4, height: 3 },
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(false)
    })

    it('should detect component exceeding right boundary', () => {
      const component: Component = {
        id: 'c1',
        name: 'TooWide',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 10, y: 0, width: 5, height: 2 }, // x:10 + width:5 = 15 > 12
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(true)
    })

    it('should detect component exceeding bottom boundary', () => {
      const component: Component = {
        id: 'c1',
        name: 'TooTall',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 0, y: 6, width: 4, height: 5 }, // y:6 + height:5 = 11 > 8
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(true)
    })

    it('should detect negative position', () => {
      const component: Component = {
        id: 'c1',
        name: 'NegativePos',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: -1, y: 0, width: 4, height: 2 },
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(true)
    })

    it('should handle component at exact boundary', () => {
      const component: Component = {
        id: 'c1',
        name: 'ExactFit',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 8 }, // Exactly fills grid
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(false)
    })

    it('should return false for component without layout', () => {
      const component: Component = {
        id: 'c1',
        name: 'NoLayout',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'none' },
        // No canvasLayout
      }

      const outOfBounds = isComponentOutOfBounds(
        component,
        gridRows,
        gridCols,
        'desktop'
      )

      expect(outOfBounds).toBe(false)
    })

    it('should use responsive layout when available', () => {
      const component: Component = {
        id: 'c1',
        name: 'Responsive',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 6, height: 4 }, // Out of bounds for 4-col mobile
          desktop: { x: 0, y: 0, width: 12, height: 2 },
        },
      }

      // Mobile with 4 cols: width 6 > 4, out of bounds
      const mobileOutOfBounds = isComponentOutOfBounds(component, 8, 4, 'mobile')
      expect(mobileOutOfBounds).toBe(true)

      // Desktop with 12 cols: width 12 = 12, within bounds
      const desktopOutOfBounds = isComponentOutOfBounds(component, 8, 12, 'desktop')
      expect(desktopOutOfBounds).toBe(false)
    })
  })
})
