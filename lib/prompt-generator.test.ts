import { describe, it, expect, vi } from 'vitest'
import {
  generatePrompt,
  generateSchemaSummary,
  estimateTokenCount,
  getRecommendedModel,
} from './prompt-generator'
import { createEmptySchema } from './schema-utils'
import type { LaydlerSchema } from '@/types/schema'

describe('prompt-generator', () => {
  describe('generatePrompt', () => {
    it('should fail for invalid schema (no components)', () => {
      const schema = createEmptySchema()
      const result = generatePrompt(schema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })

    it('should generate prompt for valid schema', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
          layout: { type: 'container', container: { maxWidth: 'full', padding: '1rem', centered: true } },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.layouts.tablet!.components = ['c1']
      schema.layouts.desktop!.components = ['c1']

      const result = generatePrompt(schema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()
      expect(result.schema).toBeDefined()
    })

    it('should include all sections in generated prompt', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.layouts.tablet!.components = ['c1']
      schema.layouts.desktop!.components = ['c1']

      const result = generatePrompt(schema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.prompt).toContain('Components')
      expect(result.prompt).toContain('Layout')
      expect(result.prompt).toContain('Full Schema')
      expect(result.prompt).toContain('```json')
    })

    it('should normalize schema before validation', () => {
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
      // tablet and desktop are empty, should inherit from mobile

      const result = generatePrompt(schema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.schema?.layouts.tablet?.components).toEqual(['c1'])
      expect(result.schema?.layouts.desktop?.components).toEqual(['c1'])
    })

    it('should return warnings for non-critical issues', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' }, // Header should be sticky - warning
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']
      schema.layouts.tablet!.components = ['c1']
      schema.layouts.desktop!.components = ['c1']

      const result = generatePrompt(schema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBeGreaterThan(0)
    })

    it('should fail for unsupported framework', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.mobile!.components = ['c1']

      const result = generatePrompt(schema, 'unsupported-framework', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors![0]).toContain('No template found')
    })
  })

  describe('generateSchemaSummary', () => {
    it('should generate summary for empty schema', () => {
      const schema = createEmptySchema()

      const summary = generateSchemaSummary(schema)

      expect(summary).toContain('Components (0)')
      expect(summary).toContain('Breakpoints (3)')
      expect(summary).toContain('mobile, tablet, desktop')
      expect(summary).toContain('React')
      expect(summary).toContain('Tailwind')
    })

    it('should include component names in summary', () => {
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
          id: 'c2',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]

      const summary = generateSchemaSummary(schema)

      expect(summary).toContain('Components (2)')
      expect(summary).toContain('Header')
      expect(summary).toContain('Footer')
    })

    it('should include positioning types count', () => {
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
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
        {
          id: 'c3',
          name: 'Modal',
          semanticTag: 'div',
          positioning: { type: 'fixed' },
          layout: { type: 'none' },
        },
      ]

      const summary = generateSchemaSummary(schema)

      expect(summary).toContain('Positioning:')
      expect(summary).toContain('sticky(1)')
      expect(summary).toContain('static(1)')
      expect(summary).toContain('fixed(1)')
    })
  })

  describe('estimateTokenCount', () => {
    it('should estimate token count for short text', () => {
      const text = 'Hello World!'
      const tokenCount = estimateTokenCount(text)

      expect(tokenCount).toBeGreaterThan(0)
      expect(tokenCount).toBeLessThan(10)
    })

    it('should estimate approximately 1 token per 4 characters', () => {
      const text = 'A'.repeat(400) // 400 characters
      const tokenCount = estimateTokenCount(text)

      expect(tokenCount).toBe(100) // 400 / 4 = 100 tokens
    })

    it('should handle empty string', () => {
      const tokenCount = estimateTokenCount('')

      expect(tokenCount).toBe(0)
    })
  })

  describe('getRecommendedModel', () => {
    it('should recommend Haiku for small prompts', () => {
      const model = getRecommendedModel(500)

      expect(model).toContain('Haiku')
    })

    it('should recommend Sonnet for medium prompts', () => {
      const model = getRecommendedModel(1500)

      expect(model).toContain('Sonnet')
    })

    it('should recommend Opus for large prompts', () => {
      const model = getRecommendedModel(4000)

      expect(model).toContain('Opus')
    })

    it('should have correct thresholds', () => {
      expect(getRecommendedModel(799)).toContain('Haiku')
      expect(getRecommendedModel(800)).toContain('Sonnet')
      expect(getRecommendedModel(2999)).toContain('Sonnet')
      expect(getRecommendedModel(3000)).toContain('Opus')
    })
  })
})
