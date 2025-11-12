import { describe, it, expect } from 'vitest'
import {
  validateSchema,
  formatValidationResult,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from './schema-validation'
import { createEmptySchema } from './schema-utils'
import type { LaydlerSchema, Component } from '@/types/schema'

describe('schema-validation', () => {
  describe('validateSchema', () => {
    it('should fail validation for empty schema (no components)', () => {
      const schema = createEmptySchema()
      const result = validateSchema(schema)

      // Empty schema has no components, which should fail
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'NO_COMPONENTS')).toBe(true)
    })

    it('should fail for invalid schema version', () => {
      const schema = { ...createEmptySchema(), schemaVersion: '1.0' as any }
      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_VERSION')).toBe(true)
    })

    it('should detect duplicate component IDs', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky' },
          layout: { type: 'none' },
        },
        {
          id: 'c1',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'DUPLICATE_COMPONENT_ID')).toBe(true)
    })

    it('should validate component names are PascalCase', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'invalidName', // Not PascalCase
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_COMPONENT_NAME')).toBe(true)
    })

    it('should pass for valid PascalCase names', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'MyComponent',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.errors.some((e) => e.code === 'INVALID_COMPONENT_NAME')).toBe(false)
    })

    it('should warn when header is not fixed or sticky', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' }, // Should be fixed or sticky
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'HEADER_NOT_FIXED_OR_STICKY')).toBe(true)
    })

    it('should warn when footer is not static', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'fixed' }, // Should be static
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'FOOTER_NOT_STATIC')).toBe(true)
    })

    it('should detect missing layouts for breakpoints', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      delete schema.layouts.desktop

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_LAYOUT')).toBe(true)
    })

    it('should detect invalid component references in layouts', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1', 'c2'] // c2 doesn't exist

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_COMPONENT_REFERENCE')).toBe(true)
    })

    it('should warn for flex layout without flex config', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Container',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'flex' }, // No flex config
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'FLEX_WITHOUT_CONFIG')).toBe(true)
    })

    it('should warn for grid layout without grid config', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Container',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'grid' }, // No grid config
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'GRID_WITHOUT_CONFIG')).toBe(true)
    })

    it('should validate breakpoints are not duplicate', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.breakpoints = [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'mobile', minWidth: 768, gridCols: 8, gridRows: 8 }, // Duplicate name
      ]

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'DUPLICATE_BREAKPOINT_NAME')).toBe(true)
    })

    it('should warn when breakpoints are not sorted by minWidth', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.breakpoints = [
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
      ]

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'BREAKPOINTS_NOT_SORTED')).toBe(true)
    })

    it('should detect negative minWidth values', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.breakpoints = [
        { name: 'mobile', minWidth: -100, gridCols: 4, gridRows: 8 },
      ]

      const result = validateSchema(schema)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.code === 'INVALID_MIN_WIDTH')).toBe(true)
    })

    it('should warn for unusual zIndex values', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: {
            type: 'fixed',
            position: { top: 0, zIndex: 99999 }, // Too high
          },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = validateSchema(schema)

      expect(result.warnings.some((w) => w.code === 'UNUSUAL_ZINDEX')).toBe(true)
    })

    it('should pass for valid schema with all components', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
          layout: { type: 'container', container: { maxWidth: 'full', padding: '1rem', centered: true } },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'container', container: { maxWidth: '7xl', padding: '2rem', centered: true } },
        },
      ]
      schema.layouts.mobile!.components = ['c1', 'c2']
      schema.layouts.tablet!.components = ['c1', 'c2']
      schema.layouts.desktop!.components = ['c1', 'c2']

      const result = validateSchema(schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
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

    it('should format validation with errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            code: 'INVALID_VERSION',
            message: 'Schema version must be "2.0"',
            field: 'schemaVersion',
          },
        ],
        warnings: [],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('❌ Schema validation failed')
      expect(formatted).toContain('INVALID_VERSION')
      expect(formatted).toContain('Schema version must be "2.0"')
    })

    it('should format validation with warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'HEADER_NOT_FIXED_OR_STICKY',
            message: 'Header should be fixed or sticky',
            componentId: 'c1',
          },
        ],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('⚠️')
      expect(formatted).toContain('HEADER_NOT_FIXED_OR_STICKY')
      expect(formatted).toContain('Component: c1')
    })

    it('should format validation with both errors and warnings', () => {
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
            code: 'BREAKPOINTS_NOT_SORTED',
            message: 'Breakpoints should be sorted',
            field: 'breakpoints',
          },
        ],
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain('❌ Schema validation failed')
      expect(formatted).toContain('🚨 Errors')
      expect(formatted).toContain('⚠️  Warnings')
      expect(formatted).toContain('NO_COMPONENTS')
      expect(formatted).toContain('BREAKPOINTS_NOT_SORTED')
    })
  })
})
