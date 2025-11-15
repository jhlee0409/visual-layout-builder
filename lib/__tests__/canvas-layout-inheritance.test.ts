/**
 * Test: Complete Breakpoint Independence (No Inheritance)
 *
 * Verifies that normalizeSchema() does NOT inherit anything across breakpoints.
 * - No layout inheritance
 * - No Canvas layout inheritance
 * - Each breakpoint is completely independent
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema } from '@/types/schema'
import { normalizeSchema } from '../schema-utils'

describe('Complete Breakpoint Independence', () => {
  it('should NOT inherit Canvas layout to other breakpoints', () => {
    // c1 has Canvas layout ONLY for mobile
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
            // desktop: NOT defined
          },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1'] },
        desktop: { structure: 'vertical', components: [] },
      },
    }

    const normalized = normalizeSchema(schema)
    const c1 = normalized.components.find(c => c.id === 'c1')!

    console.log('\n=== No Canvas Inheritance ===')
    console.log('mobile Canvas:', c1.responsiveCanvasLayout?.mobile)
    console.log('desktop Canvas:', c1.responsiveCanvasLayout?.desktop)

    // ✅ EXPECTED: mobile has Canvas layout
    expect(c1.responsiveCanvasLayout?.mobile).toEqual({ x: 0, y: 0, width: 4, height: 1 })

    // ✅ EXPECTED: desktop does NOT inherit (stays undefined)
    expect(c1.responsiveCanvasLayout?.desktop).toBeUndefined()

    // ✅ EXPECTED: layout.components also stays empty
    expect(normalized.layouts.desktop.components).toEqual([])
  })

  it('should NOT overwrite explicit Canvas layout', () => {
    // c1 has DIFFERENT Canvas layouts for mobile and desktop
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
            desktop: { x: 0, y: 0, width: 12, height: 1 }, // Explicit desktop layout
          },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1'] },
        desktop: { structure: 'vertical', components: [] },
      },
    }

    const normalized = normalizeSchema(schema)
    const c1 = normalized.components.find(c => c.id === 'c1')!

    // ✅ EXPECTED: Desktop Canvas layout is NOT overwritten (keeps explicit value)
    expect(c1.responsiveCanvasLayout?.desktop).toEqual({ x: 0, y: 0, width: 12, height: 1 })
    expect(c1.responsiveCanvasLayout?.desktop?.width).toBe(12) // Not 4 (from mobile)
  })

  it('should keep each breakpoint completely independent when adding new breakpoint', () => {
    // Simulate addBreakpoint workflow
    let schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
          },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 1, width: 4, height: 6 },
          },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1', 'c2'] },
      },
    }

    console.log('\n=== Before adding laptop breakpoint ===')
    console.log('Breakpoints:', schema.breakpoints.map(bp => bp.name))
    console.log('Mobile components:', schema.layouts.mobile.components)

    // Step 1: User adds new breakpoint "laptop"
    schema = {
      ...schema,
      breakpoints: [
        ...schema.breakpoints,
        { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
      ].sort((a, b) => a.minWidth - b.minWidth),
      layouts: {
        ...schema.layouts,
        laptop: { structure: 'vertical', components: [] }, // Empty layout
      },
    }

    // Step 2: Call normalizeSchema (like addBreakpoint does)
    const normalized = normalizeSchema(schema)

    console.log('\n=== After normalizeSchema ===')
    console.log('Breakpoints:', normalized.breakpoints.map(bp => bp.name))
    console.log('Mobile components:', normalized.layouts.mobile.components)
    console.log('Laptop components:', normalized.layouts.laptop.components)

    const c1 = normalized.components.find(c => c.id === 'c1')!
    const c2 = normalized.components.find(c => c.id === 'c2')!

    console.log('c1 mobile Canvas:', c1.responsiveCanvasLayout?.mobile)
    console.log('c1 laptop Canvas:', c1.responsiveCanvasLayout?.laptop)
    console.log('c2 mobile Canvas:', c2.responsiveCanvasLayout?.mobile)
    console.log('c2 laptop Canvas:', c2.responsiveCanvasLayout?.laptop)

    // ✅ EXPECTED: layout.components NOT inherited (laptop is still empty)
    expect(normalized.layouts.laptop.components).toEqual([])

    // ✅ EXPECTED: Canvas layouts also NOT inherited (laptop has no Canvas data)
    expect(c1.responsiveCanvasLayout?.laptop).toBeUndefined()
    expect(c2.responsiveCanvasLayout?.laptop).toBeUndefined()

    // ✅ EXPECTED: Mobile keeps its Canvas layouts
    expect(c1.responsiveCanvasLayout?.mobile).toEqual({ x: 0, y: 0, width: 4, height: 1 })
    expect(c2.responsiveCanvasLayout?.mobile).toEqual({ x: 0, y: 1, width: 4, height: 6 })
  })
})
