/**
 * Canvas Utils Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  getCanvasLayoutForBreakpoint,
  groupComponentsByRow,
  filterComponentsWithCanvasLayout,
  hasCanvasLayout,
  type RowGroup,
} from '../canvas-utils'
import type { Component } from '@/types/schema'

describe('Canvas Utils', () => {
  describe('getCanvasLayoutForBreakpoint', () => {
    it('should return responsiveCanvasLayout if available for breakpoint', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 2 },
          desktop: { x: 0, y: 0, width: 12, height: 1 },
        },
      }

      const layout = getCanvasLayoutForBreakpoint(component, 'mobile')

      expect(layout).toEqual({ x: 0, y: 0, width: 4, height: 2 })
    })

    it('should fallback to canvasLayout if responsiveCanvasLayout not available', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const layout = getCanvasLayoutForBreakpoint(component, 'desktop')

      expect(layout).toEqual({ x: 0, y: 0, width: 12, height: 1 })
    })

    it('should fallback to canvasLayout if breakpoint not in responsiveCanvasLayout', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 2 },
        },
      }

      const layout = getCanvasLayoutForBreakpoint(component, 'desktop')

      expect(layout).toEqual({ x: 0, y: 0, width: 12, height: 1 })
    })

    it('should return undefined if no canvas layout exists', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
      }

      const layout = getCanvasLayoutForBreakpoint(component, 'desktop')

      expect(layout).toBeUndefined()
    })
  })

  describe('groupComponentsByRow', () => {
    it('should group components by their starting row', () => {
      const components: Component[] = [
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
          name: 'Sidebar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', position: { top: '4rem' } },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
        },
        {
          id: 'c3',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'container', container: { maxWidth: '7xl' } },
          canvasLayout: { x: 3, y: 1, width: 9, height: 7 },
        },
      ]

      const groups = groupComponentsByRow(components, 'desktop')

      expect(groups).toHaveLength(2)

      // Row 0: Header only
      expect(groups[0].rowRange).toEqual([0])
      expect(groups[0].components).toHaveLength(1)
      expect(groups[0].components[0].id).toBe('c1')

      // Row 1-7: Sidebar and Main
      expect(groups[1].rowRange).toHaveLength(7)
      expect(groups[1].components).toHaveLength(2)
      expect(groups[1].components[0].id).toBe('c2') // Sorted by x position
      expect(groups[1].components[1].id).toBe('c3')
    })

    it('should sort components within the same row by x position', () => {
      const components: Component[] = [
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'container', container: { maxWidth: '7xl' } },
          canvasLayout: { x: 3, y: 0, width: 9, height: 1 },
        },
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 0, width: 3, height: 1 },
        },
      ]

      const groups = groupComponentsByRow(components, 'desktop')

      expect(groups).toHaveLength(1)
      expect(groups[0].components[0].id).toBe('c1') // x=0 comes first
      expect(groups[0].components[1].id).toBe('c2') // x=3 comes second
    })

    it('should handle components without canvas layout', () => {
      const components: Component[] = [
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
          name: 'NoLayout',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          // No canvasLayout
        },
      ]

      const groups = groupComponentsByRow(components, 'desktop')

      expect(groups).toHaveLength(1)
      expect(groups[0].components).toHaveLength(1)
      expect(groups[0].components[0].id).toBe('c1')
    })

    it('should return empty array for components without canvas layout', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'NoLayout',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
        },
      ]

      const groups = groupComponentsByRow(components, 'desktop')

      expect(groups).toHaveLength(0)
    })

    it('should handle responsive canvas layouts', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 2 },
            desktop: { x: 0, y: 0, width: 12, height: 1 },
          },
        },
      ]

      const mobileGroups = groupComponentsByRow(components, 'mobile')
      const desktopGroups = groupComponentsByRow(components, 'desktop')

      // Mobile: height=2, so rowRange should be [0, 1]
      expect(mobileGroups).toHaveLength(1)
      expect(mobileGroups[0].rowRange).toEqual([0, 1])

      // Desktop: height=1, so rowRange should be [0]
      expect(desktopGroups).toHaveLength(1)
      expect(desktopGroups[0].rowRange).toEqual([0])
    })
  })

  describe('filterComponentsWithCanvasLayout', () => {
    it('should filter components with canvas layout', () => {
      const components: Component[] = [
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
          name: 'NoLayout',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
        },
      ]

      const filtered = filterComponentsWithCanvasLayout(components, 'desktop')

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('c1')
    })

    it('should return empty array if no components have canvas layout', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'NoLayout',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
        },
      ]

      const filtered = filterComponentsWithCanvasLayout(components, 'desktop')

      expect(filtered).toHaveLength(0)
    })

    it('should handle responsive canvas layouts', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 2 },
          },
        },
        {
          id: 'c2',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'container', container: { maxWidth: 'full' } },
          canvasLayout: { x: 0, y: 8, width: 12, height: 1 },
        },
      ]

      const mobileFiltered = filterComponentsWithCanvasLayout(components, 'mobile')
      const desktopFiltered = filterComponentsWithCanvasLayout(components, 'desktop')

      // Mobile: c1 has responsive layout, c2 falls back to canvasLayout
      expect(mobileFiltered).toHaveLength(2)

      // Desktop: c1 has no desktop layout, c2 falls back to canvasLayout
      expect(desktopFiltered).toHaveLength(1)
      expect(desktopFiltered[0].id).toBe('c2')
    })
  })

  describe('hasCanvasLayout', () => {
    it('should return true if component has canvasLayout', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      expect(hasCanvasLayout(component)).toBe(true)
    })

    it('should return true if component has responsiveCanvasLayout', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 2 },
        },
      }

      expect(hasCanvasLayout(component)).toBe(true)
    })

    it('should return false if component has no canvas layout', () => {
      const component: Component = {
        id: 'c1',
        name: 'NoLayout',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
      }

      expect(hasCanvasLayout(component)).toBe(false)
    })

    it('should return false if responsiveCanvasLayout is empty', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        responsiveCanvasLayout: {},
      }

      expect(hasCanvasLayout(component)).toBe(false)
    })

    it('should return true for specific breakpoint if layout exists', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 2 },
        },
      }

      expect(hasCanvasLayout(component, 'mobile')).toBe(true)
      expect(hasCanvasLayout(component, 'desktop')).toBe(false)
    })

    it('should return true for breakpoint if canvasLayout exists as fallback', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      expect(hasCanvasLayout(component, 'desktop')).toBe(true)
    })

    it('should return false for specific breakpoint if no layout exists', () => {
      const component: Component = {
        id: 'c1',
        name: 'NoLayout',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
      }

      expect(hasCanvasLayout(component, 'desktop')).toBe(false)
    })
  })
})
