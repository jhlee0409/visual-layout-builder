/**
 * Schema Validation Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateSchema,
  formatValidationResult,
  type ValidationResult,
} from '../schema-validation'
import type { LaydlerSchema, Component } from '@/types/schema'

describe('Schema Validation', () => {
  describe('validateSchema', () => {
    it('should validate a valid schema without errors', () => {
      const validSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: {
              type: 'sticky',
              position: { top: 0 },
            },
            layout: {
              type: 'flex',
              flex: {
                direction: 'row',
                justify: 'between',
                items: 'center',
              },
            },
            canvasLayout: {
              x: 0,
              y: 0,
              width: 12,
              height: 1,
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
          tablet: {
            structure: 'vertical',
            components: ['c1'],
          },
          desktop: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(validSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid schema version', () => {
      const invalidSchema: LaydlerSchema = {
        schemaVersion: '1.0' as any,
        components: [],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: [],
          },
        },
      }

      const result = validateSchema(invalidSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_VERSION',
          field: 'schemaVersion',
        })
      )
    })

    it('should reject schema with no components', () => {
      const emptySchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: [],
          },
        },
      }

      const result = validateSchema(emptySchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'NO_COMPONENTS',
          field: 'components',
        })
      )
    })

    it('should detect duplicate component IDs', () => {
      const schemaWithDuplicates: LaydlerSchema = {
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
          {
            id: 'c1', // Duplicate
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(schemaWithDuplicates)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'DUPLICATE_COMPONENT_ID',
        })
      )
    })

    it('should validate component name is PascalCase', () => {
      const invalidNameSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'myHeader', // Invalid: should be PascalCase
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
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(invalidNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_COMPONENT_NAME',
          componentId: 'c1',
        })
      )
    })

    it('should detect missing layout for breakpoint', () => {
      const missingLayoutSchema: LaydlerSchema = {
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
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
          // Missing desktop layout
        },
      }

      const result = validateSchema(missingLayoutSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_LAYOUT',
          field: 'layouts.desktop',
        })
      )
    })
  })

  describe('Layout structure validation', () => {
    it('should warn when horizontal structure does not use row direction', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'horizontal',
            components: ['c1'],
            containerLayout: {
              type: 'flex',
              flex: { direction: 'column' }, // Should be 'row' for horizontal
            },
          },
        },
      }

      const result = validateSchema(schema)

      expect(result.valid).toBe(true) // Valid but with warnings
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'HORIZONTAL_STRUCTURE_NOT_ROW',
        })
      )
    })

    it('should warn when sidebar-main structure lacks roles', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 64 } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'sidebar-main',
            components: ['c1', 'c2'],
            // Missing roles
          },
        },
      }

      const result = validateSchema(schema)

      expect(result.valid).toBe(true) // Valid but with warnings
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'SIDEBAR_MAIN_WITHOUT_ROLES',
        })
      )
    })

    it('should pass when sidebar-main structure has proper roles', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 64 } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'sidebar-main',
            components: ['c1', 'c2'],
            roles: {
              sidebar: 'c1',
              main: 'c2',
            },
          },
        },
      }

      const result = validateSchema(schema)

      expect(result.valid).toBe(true)
      // Should not have SIDEBAR_MAIN_WITHOUT_ROLES warning
      expect(
        result.warnings.find((w) => w.code === 'SIDEBAR_MAIN_WITHOUT_ROLES')
      ).toBeUndefined()
    })
  })

  describe('Breakpoint validation', () => {
    it('should reject schema with more than 10 breakpoints', () => {
      const tooManyBreakpointsSchema: LaydlerSchema = {
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
          { name: 'bp1', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'bp2', minWidth: 320, gridCols: 4, gridRows: 8 },
          { name: 'bp3', minWidth: 480, gridCols: 6, gridRows: 8 },
          { name: 'bp4', minWidth: 640, gridCols: 8, gridRows: 8 },
          { name: 'bp5', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'bp6', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'bp7', minWidth: 1280, gridCols: 12, gridRows: 8 },
          { name: 'bp8', minWidth: 1440, gridCols: 12, gridRows: 8 },
          { name: 'bp9', minWidth: 1920, gridCols: 16, gridRows: 8 },
          { name: 'bp10', minWidth: 2560, gridCols: 16, gridRows: 8 },
          { name: 'bp11', minWidth: 3840, gridCols: 20, gridRows: 8 }, // 11th breakpoint
        ],
        layouts: {
          bp1: { structure: 'vertical', components: ['c1'] },
          bp2: { structure: 'vertical', components: ['c1'] },
          bp3: { structure: 'vertical', components: ['c1'] },
          bp4: { structure: 'vertical', components: ['c1'] },
          bp5: { structure: 'vertical', components: ['c1'] },
          bp6: { structure: 'vertical', components: ['c1'] },
          bp7: { structure: 'vertical', components: ['c1'] },
          bp8: { structure: 'vertical', components: ['c1'] },
          bp9: { structure: 'vertical', components: ['c1'] },
          bp10: { structure: 'vertical', components: ['c1'] },
          bp11: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(tooManyBreakpointsSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'TOO_MANY_BREAKPOINTS',
          field: 'breakpoints',
        })
      )
    })

    it('should reject breakpoint names with invalid characters', () => {
      const invalidNameSchema: LaydlerSchema = {
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
          { name: 'mobile@tablet', minWidth: 0, gridCols: 4, gridRows: 8 }, // Invalid: @
        ],
        layouts: {
          'mobile@tablet': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(invalidNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_BREAKPOINT_NAME',
        })
      )
    })

    it('should reject breakpoint names with spaces', () => {
      const invalidNameSchema: LaydlerSchema = {
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
          { name: 'mobile tablet', minWidth: 0, gridCols: 4, gridRows: 8 }, // Invalid: space
        ],
        layouts: {
          'mobile tablet': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(invalidNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_BREAKPOINT_NAME',
        })
      )
    })

    it('should accept breakpoint names starting with number', () => {
      const validNameSchema: LaydlerSchema = {
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
          { name: '4k', minWidth: 0, gridCols: 4, gridRows: 8 }, // Valid: numbers allowed
        ],
        layouts: {
          '4k': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(validNameSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject reserved breakpoint names', () => {
      const layouts: Record<string, any> = {
        constructor: { structure: 'vertical', components: ['c1'] },
      }
      const reservedNameSchema: LaydlerSchema = {
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
          { name: 'constructor', minWidth: 0, gridCols: 4, gridRows: 8 }, // Reserved
        ],
        layouts,
      }

      const result = validateSchema(reservedNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'RESERVED_BREAKPOINT_NAME',
        })
      )
    })

    it('should reject __proto__ as breakpoint name', () => {
      const layouts: Record<string, any> = {
        __proto__: { structure: 'vertical', components: ['c1'] },
      }
      const protoNameSchema: LaydlerSchema = {
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
          { name: '__proto__', minWidth: 0, gridCols: 4, gridRows: 8 }, // Reserved (prototype pollution)
        ],
        layouts,
      }

      const result = validateSchema(protoNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'RESERVED_BREAKPOINT_NAME',
        })
      )
    })

    it('should accept valid breakpoint names with hyphens and underscores', () => {
      const validNameSchema: LaydlerSchema = {
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
          { name: 'mobile-sm', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet_md', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop-2xl', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          'mobile-sm': { structure: 'vertical', components: ['c1'] },
          'tablet_md': { structure: 'vertical', components: ['c1'] },
          'desktop-2xl': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(validNameSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept exactly 10 breakpoints', () => {
      const tenBreakpointsSchema: LaydlerSchema = {
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
          { name: 'bp1', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'bp2', minWidth: 320, gridCols: 4, gridRows: 8 },
          { name: 'bp3', minWidth: 480, gridCols: 6, gridRows: 8 },
          { name: 'bp4', minWidth: 640, gridCols: 8, gridRows: 8 },
          { name: 'bp5', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'bp6', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'bp7', minWidth: 1280, gridCols: 12, gridRows: 8 },
          { name: 'bp8', minWidth: 1440, gridCols: 12, gridRows: 8 },
          { name: 'bp9', minWidth: 1920, gridCols: 16, gridRows: 8 },
          { name: 'bp10', minWidth: 2560, gridCols: 16, gridRows: 8 }, // Exactly 10
        ],
        layouts: {
          bp1: { structure: 'vertical', components: ['c1'] },
          bp2: { structure: 'vertical', components: ['c1'] },
          bp3: { structure: 'vertical', components: ['c1'] },
          bp4: { structure: 'vertical', components: ['c1'] },
          bp5: { structure: 'vertical', components: ['c1'] },
          bp6: { structure: 'vertical', components: ['c1'] },
          bp7: { structure: 'vertical', components: ['c1'] },
          bp8: { structure: 'vertical', components: ['c1'] },
          bp9: { structure: 'vertical', components: ['c1'] },
          bp10: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(tenBreakpointsSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty breakpoint name', () => {
      const emptyNameSchema: LaydlerSchema = {
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
          { name: '', minWidth: 0, gridCols: 4, gridRows: 8 }, // Empty name
        ],
        layouts: {
          '': { structure: 'vertical', components: ['c1'] },
        } as any,
      }

      const result = validateSchema(emptyNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'EMPTY_BREAKPOINT_NAME',
        })
      )
    })

    it('should reject breakpoint name with only whitespace', () => {
      const whitespaceNameSchema: LaydlerSchema = {
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
          { name: '   ', minWidth: 0, gridCols: 4, gridRows: 8 }, // Whitespace only
        ],
        layouts: {
          '   ': { structure: 'vertical', components: ['c1'] },
        } as any,
      }

      const result = validateSchema(whitespaceNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'EMPTY_BREAKPOINT_NAME',
        })
      )
    })

    it('should reject very long breakpoint names (>100 chars)', () => {
      const longName = 'a'.repeat(101) // 101 characters
      const longNameSchema: LaydlerSchema = {
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
          { name: longName, minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          [longName]: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(longNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'BREAKPOINT_NAME_TOO_LONG',
        })
      )
    })

    it('should accept 100-character breakpoint name (exactly at limit)', () => {
      const exactLimitName = 'a'.repeat(100) // Exactly 100 characters
      const limitNameSchema: LaydlerSchema = {
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
          { name: exactLimitName, minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          [exactLimitName]: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(limitNameSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject unicode breakpoint names', () => {
      const unicodeNameSchema: LaydlerSchema = {
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
          { name: '모바일', minWidth: 0, gridCols: 4, gridRows: 8 }, // Korean characters
        ],
        layouts: {
          '모바일': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(unicodeNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_BREAKPOINT_NAME',
        })
      )
    })

    it('should reject emoji in breakpoint names', () => {
      const emojiNameSchema: LaydlerSchema = {
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
          { name: 'mobile📱', minWidth: 0, gridCols: 4, gridRows: 8 }, // Emoji
        ],
        layouts: {
          'mobile📱': { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = validateSchema(emojiNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_BREAKPOINT_NAME',
        })
      )
    })
  })

  describe('formatValidationResult', () => {
    it('should format successful validation', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('✅ Schema validation passed!')
    })

    it('should format validation errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'INVALID_VERSION',
            message: 'Schema version must be "2.0"',
            field: 'schemaVersion',
          },
          {
            code: 'INVALID_COMPONENT_NAME',
            message: 'Component name must be PascalCase',
            componentId: 'c1',
            field: 'name',
          },
        ],
        warnings: [],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('❌ Schema validation failed')
      expect(formatted).toContain('🚨 Errors:')
      expect(formatted).toContain('[INVALID_VERSION]')
      expect(formatted).toContain('[INVALID_COMPONENT_NAME]')
      expect(formatted).toContain('Component: c1')
      expect(formatted).toContain('Field: schemaVersion')
    })

    it('should format validation warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'STICKY_WITHOUT_POSITION',
            message: 'Sticky positioning should define position values',
            componentId: 'c1',
            field: 'positioning',
          },
        ],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('✅ Schema validation passed!')
      expect(formatted).toContain('⚠️  Warnings:')
      expect(formatted).toContain('[STICKY_WITHOUT_POSITION]')
      expect(formatted).toContain('Component: c1')
    })

    it('should format both errors and warnings', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'NO_COMPONENTS',
            message: 'Schema must have at least one component',
            field: 'components',
          },
        ],
        warnings: [
          {
            code: 'STICKY_WITHOUT_POSITION',
            message: 'Sticky positioning should define position values',
            componentId: 'c2',
          },
        ],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('❌ Schema validation failed')
      expect(formatted).toContain('🚨 Errors:')
      expect(formatted).toContain('⚠️  Warnings:')
      expect(formatted).toContain('[NO_COMPONENTS]')
      expect(formatted).toContain('[STICKY_WITHOUT_POSITION]')
    })
  })
})
