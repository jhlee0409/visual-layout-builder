/**
 * Test: Verify component isolation between breakpoints
 *
 * This test checks if adding a component to one breakpoint
 * automatically adds it to other breakpoints (which should NOT happen).
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema } from '@/types/schema'
import { normalizeSchema } from '../schema-utils'

describe('Component Isolation Between Breakpoints', () => {
  it('should NOT automatically add components to other breakpoints via normalizeSchema', () => {
    // Initial schema: mobile has c1, desktop is empty
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1'] },
        desktop: { structure: 'vertical', components: [] }, // Intentionally empty
      },
    }

    // Normalize (this is what addComponentToLayout does)
    const normalized = normalizeSchema(schema)

    // CRITICAL: Desktop should remain empty (user explicitly made it empty)
    console.log('Mobile components:', normalized.layouts.mobile.components)
    console.log('Desktop components:', normalized.layouts.desktop.components)

    // ❌ BUG: If desktop has c1, normalizeSchema is auto-inheriting
    // ✅ EXPECTED: Desktop should be empty
    expect(normalized.layouts.desktop.components).toEqual([])
  })

  it('should demonstrate complete breakpoint independence', () => {
    // Simulate addComponentToLayout workflow

    // Step 1: Initial state - 3 breakpoints, all empty
    let schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: [] },
        tablet: { structure: 'vertical', components: [] },
        desktop: { structure: 'vertical', components: [] },
      },
    }

    console.log('\n=== Initial State ===')
    console.log('Mobile:', schema.layouts.mobile.components)
    console.log('Tablet:', schema.layouts.tablet.components)
    console.log('Desktop:', schema.layouts.desktop.components)

    // Step 2: User adds c1 to mobile ONLY
    schema = {
      ...schema,
      layouts: {
        ...schema.layouts,
        mobile: {
          ...schema.layouts.mobile,
          components: ['c1'],
        },
      },
    }

    console.log('\n=== After adding c1 to mobile ===')
    console.log('Mobile:', schema.layouts.mobile.components)
    console.log('Tablet:', schema.layouts.tablet.components)
    console.log('Desktop:', schema.layouts.desktop.components)

    // Step 3: Call normalizeSchema (like addComponentToLayout does)
    const normalized = normalizeSchema(schema)

    console.log('\n=== After normalizeSchema ===')
    console.log('Mobile:', normalized.layouts.mobile.components)
    console.log('Tablet:', normalized.layouts.tablet.components)
    console.log('Desktop:', normalized.layouts.desktop.components)

    // ❌ BUG DEMONSTRATION:
    // Expected: Only mobile has c1
    // Actual: ALL breakpoints have c1 (because empty layouts get overwritten)

    // Current behavior (BUG):
    // normalizeSchema treats empty array [] as "inherit from previous"
    // But it should treat [] as "intentionally empty"
  })
})
