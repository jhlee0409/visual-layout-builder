/**
 * End-to-End Test: Canvas → Schema → Prompt → Code Generation
 *
 * Validates the complete pipeline from Canvas Grid positioning to AI-ready prompts
 * Verifies that 2025 architecture improvements are working correctly
 */

import { describe, it, expect } from 'vitest'
import { generatePrompt } from '../prompt-generator'
import { validateSchema } from '../schema-validation'
import type { LaydlerSchema } from '@/types/schema'

describe('Canvas to Prompt E2E', () => {
  /**
   * Test Scenario: GitHub-style layout with sidebar
   * - c1 Header: Row 0, Full width
   * - c2 Sidebar: Row 1-7, Cols 0-2 (LEFT side)
   * - c3 Main: Row 1-7, Cols 3-11 (RIGHT side, next to sidebar)
   */
  const githubStyleSchema: LaydlerSchema = {
    schemaVersion: '2.0',
    components: [
      {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
        layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      },
      {
        id: 'c2',
        name: 'Sidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: '4rem' } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 1, width: 3, height: 7 }, // LEFT side
      },
      {
        id: 'c3',
        name: 'MainContent',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: { type: 'container', container: { maxWidth: 'xl', centered: true } },
        canvasLayout: { x: 3, y: 1, width: 9, height: 7 }, // RIGHT side, next to c2
      },
    ],
    breakpoints: [
      { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: {
        structure: 'vertical',
        components: ['c1', 'c2', 'c3'],
      },
      desktop: {
        structure: 'sidebar-main',
        components: ['c1', 'c2', 'c3'],
        roles: { sidebar: 'c2', main: 'c3' },
      },
    },
  }

  describe('Canvas Grid Validation', () => {
    it('should detect Canvas-Layout order mismatch', () => {
      // Schema where Canvas Grid order differs from layout.components order
      const mismatchSchema: LaydlerSchema = {
        ...githubStyleSchema,
        components: [
          { ...githubStyleSchema.components[0], canvasLayout: { x: 0, y: 0, width: 12, height: 1 } }, // c1: y=0
          { ...githubStyleSchema.components[1], canvasLayout: { x: 0, y: 2, width: 3, height: 6 } }, // c2: y=2
          { ...githubStyleSchema.components[2], canvasLayout: { x: 3, y: 1, width: 9, height: 7 } }, // c3: y=1 (BEFORE c2!)
        ],
        layouts: {
          ...githubStyleSchema.layouts,
          desktop: {
            structure: 'sidebar-main',
            components: ['c1', 'c2', 'c3'], // Order: c1, c2, c3
            // But Canvas Grid order is: c1 (y=0), c3 (y=1), c2 (y=2)
          },
        },
      }

      const result = validateSchema(mismatchSchema)

      // Should have warnings about Canvas-Layout mismatch
      expect(result.warnings.length).toBeGreaterThan(0)
      const mismatchWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_LAYOUT_ORDER_MISMATCH'
      )
      expect(mismatchWarning).toBeDefined()
      expect(mismatchWarning!.message).toContain('Visual layout (Canvas Grid) differs from DOM order')
      expect(mismatchWarning!.message).toContain('c2')
      expect(mismatchWarning!.message).toContain('c3')
    })

    it('should detect complex Grid patterns (side-by-side components)', () => {
      const result = validateSchema(githubStyleSchema)

      // Should detect that c2 and c3 are side-by-side in desktop layout
      const complexGridWarning = result.warnings.find(
        (w) => w.code === 'COMPLEX_GRID_LAYOUT_DETECTED'
      )
      expect(complexGridWarning).toBeDefined()
      expect(complexGridWarning!.message).toContain('side-by-side')
      expect(complexGridWarning!.message).toContain('Row 1')
      expect(complexGridWarning!.message).toContain('Sidebar')
      expect(complexGridWarning!.message).toContain('MainContent')
    })

    it('should pass validation for simple vertical layouts', () => {
      const simpleSchema: LaydlerSchema = {
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
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
          },
          {
            id: 'c3',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'c2', 'c3'] },
        },
      }

      const result = validateSchema(simpleSchema)

      // Should have no Canvas-Layout mismatch warnings
      const mismatchWarning = result.warnings.find(
        (w) => w.code === 'CANVAS_LAYOUT_ORDER_MISMATCH'
      )
      expect(mismatchWarning).toBeUndefined()
    })
  })

  describe('Prompt Generation with Visual Layout', () => {
    it('should include Visual Layout Description in prompt', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      // Must include Visual Layout section
      expect(result.prompt).toContain('Visual Layout (Canvas Grid)')
      expect(result.prompt).toContain('12-column')
      expect(result.prompt).toContain('8-row')
    })

    it('should include row-by-row description', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should describe each row
      expect(prompt).toContain('Row 0')
      expect(prompt).toContain('Row 1')
      expect(prompt).toContain('Header')
      expect(prompt).toContain('Sidebar')
      expect(prompt).toContain('MainContent')
    })

    it('should include CSS Grid positioning code', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should include CSS Grid code
      expect(prompt).toContain('CSS Grid Positioning')
      expect(prompt).toContain('grid-area')
      expect(prompt).toContain('grid-template-columns')
    })

    it('should include Tailwind Grid classes', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should include Tailwind classes
      expect(prompt).toContain('grid')
      expect(prompt).toContain('grid-cols-')
    })

    it('should include spatial relationships', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should describe spatial relationships
      expect(prompt).toContain('Spatial Relationships')
      expect(prompt).toContain('LEFT')
      expect(prompt).toContain('SIDEBAR')
      expect(prompt).toContain('FULL WIDTH')
    })

    it('should include implementation hints', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should provide implementation guidance
      expect(prompt).toContain('Implementation Strategy')
      expect(prompt).toContain('CSS Grid')
      expect(prompt).toContain('grid-area')
    })

    it('should distinguish Visual Layout from DOM order', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Should explain the difference between visual and DOM order
      expect(prompt).toContain('Component Order (DOM)')
      expect(prompt).toContain('Visual positioning')
      expect(prompt).toContain('may differ from DOM order')
    })
  })

  describe('Complete Pipeline Validation', () => {
    it('should handle complete Canvas → Prompt workflow', () => {
      // 1. Validate Schema
      const validationResult = validateSchema(githubStyleSchema)
      expect(validationResult.valid).toBe(true)

      // 2. Generate Prompt
      const promptResult = generatePrompt(githubStyleSchema, 'react', 'tailwind')
      expect(promptResult.success).toBe(true)
      expect(promptResult.prompt).toBeDefined()

      // 3. Verify prompt includes all essential sections
      const prompt = promptResult.prompt!
      expect(prompt).toContain('Components') // Component specs
      expect(prompt).toContain('Responsive Page Structure') // Layout specs
      expect(prompt).toContain('Implementation Instructions') // Guidelines
      expect(prompt).toContain('Full Schema (JSON)') // Reference
    })

    it('should provide accurate token estimates', () => {
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      // Prompt should be substantial (includes Visual Layout Description)
      const promptLength = result.prompt!.length
      expect(promptLength).toBeGreaterThan(2000) // At least 2000 characters

      // Token estimate should be reasonable (1 token ≈ 4 characters)
      const estimatedTokens = Math.ceil(promptLength / 4)
      expect(estimatedTokens).toBeGreaterThan(500)
    })

    it('should handle missing Canvas Layout gracefully', () => {
      // Partial Canvas Layout: c1 has it, c2 and c3 don't
      const schemaWithPartialCanvas: LaydlerSchema = {
        ...githubStyleSchema,
        components: [
          githubStyleSchema.components[0], // c1: HAS canvasLayout
          { ...githubStyleSchema.components[1], canvasLayout: undefined }, // c2: NO canvasLayout
          { ...githubStyleSchema.components[2], canvasLayout: undefined }, // c3: NO canvasLayout
        ],
      }

      const result = validateSchema(schemaWithPartialCanvas)

      // Should warn about SOME components missing Canvas Layout
      const missingCanvasWarning = result.warnings.find(
        (w) => w.code === 'MISSING_CANVAS_LAYOUT'
      )
      expect(missingCanvasWarning).toBeDefined()
      expect(missingCanvasWarning!.message).toContain('missing Canvas layout information')
    })

    it('should generate prompts that prevent c6-c7 ordering bug', () => {
      // This is the original bug scenario that triggered the redesign
      const result = generatePrompt(githubStyleSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      const prompt = result.prompt!

      // Prompt MUST include Canvas Grid information to prevent AI misunderstanding
      expect(prompt).toContain('Visual Layout (Canvas Grid)')
      expect(prompt).toContain('CSS Grid Positioning')
      expect(prompt).toContain('Spatial Relationships')

      // AI should understand side-by-side layouts
      expect(prompt).toContain('side-by-side') // or similar spatial description
    })
  })

  describe('Edge Cases', () => {
    it('should handle full-width components correctly', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'FullWidthBanner',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 3 }, // Full width
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // Should detect full-width component
      expect(result.prompt).toContain('FULL WIDTH')
    })

    it('should handle multiple side-by-side components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Card1',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 4, height: 2 },
          },
          {
            id: 'c2',
            name: 'Card2',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 4, y: 0, width: 4, height: 2 },
          },
          {
            id: 'c3',
            name: 'Card3',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 0, width: 4, height: 2 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'horizontal', components: ['c1', 'c2', 'c3'] },
        },
      }

      const result = validateSchema(schema)

      // Should detect complex grid with 3 components in same row
      const complexGridWarning = result.warnings.find(
        (w) => w.code === 'COMPLEX_GRID_LAYOUT_DETECTED'
      )
      expect(complexGridWarning).toBeDefined()
      expect(complexGridWarning!.message).toContain('Row 0')
      expect(complexGridWarning!.message).toContain('Card1')
      expect(complexGridWarning!.message).toContain('Card2')
      expect(complexGridWarning!.message).toContain('Card3')
    })
  })
})
