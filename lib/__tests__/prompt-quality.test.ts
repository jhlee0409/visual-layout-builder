/**
 * Prompt Quality Tests
 *
 * 생성된 AI 프롬프트의 품질과 정확성을 검증
 *
 * 테스트 범위:
 * 1. 프롬프트 구조 검증 - 모든 필수 섹션 포함
 * 2. 프롬프트 내용 정확성 - Canvas Grid 정보의 정확성
 * 3. 프롬프트 일관성 - 같은 Schema에 대해 일관된 결과
 * 4. 프롬프트 완성도 - AI가 코드를 생성하기 충분한 정보
 * 5. 엣지 케이스 처리 - 복잡한 시나리오에서도 명확한 프롬프트
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema } from '@/types/schema'
import { generatePrompt } from '../prompt-generator'

describe('Prompt Quality Tests', () => {
  // ==========================================================================
  // Test 1: 프롬프트 구조 검증 (필수 섹션)
  // ==========================================================================
  describe('Prompt Structure Validation', () => {
    const sampleSchema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'header',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
          layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'main',
          name: 'MainContent',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'container', container: { maxWidth: '7xl', centered: true } },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
        {
          id: 'footer',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['header', 'main', 'footer'] },
        desktop: { structure: 'vertical', components: ['header', 'main', 'footer'] },
      },
    }

    it('should include all essential sections', () => {
      const result = generatePrompt(sampleSchema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // 필수 섹션 확인
      const essentialSections = [
        'Components', // Component specifications
        'Responsive Page Structure', // Layout specs
        'Implementation Instructions', // Guidelines
        'Full Schema (JSON)', // Reference
      ]

      essentialSections.forEach((section) => {
        expect(prompt).toContain(section)
      })
    })

    it('should have proper section ordering', () => {
      const result = generatePrompt(sampleSchema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // 섹션 순서 확인 (index로 검증)
      const componentsIndex = prompt.indexOf('Components')
      const layoutIndex = prompt.indexOf('Responsive Page Structure')
      const instructionsIndex = prompt.indexOf('Implementation Instructions')
      const schemaIndex = prompt.indexOf('Full Schema (JSON)')

      expect(componentsIndex).toBeGreaterThan(-1)
      expect(layoutIndex).toBeGreaterThan(componentsIndex)
      expect(instructionsIndex).toBeGreaterThan(layoutIndex)
      expect(schemaIndex).toBeGreaterThan(instructionsIndex)
    })

    it('should include Visual Layout section for complex grids', () => {
      const complexSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'sidebar',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
          },
          {
            id: 'main',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 3, y: 1, width: 9, height: 7 },
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'sidebar-main', components: ['header', 'sidebar', 'main'] },
        },
      }

      const result = generatePrompt(complexSchema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Visual Layout 섹션 확인
      expect(prompt).toContain('Visual Layout (Canvas Grid)')
    })

    it('should include section separators', () => {
      const result = generatePrompt(sampleSchema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // 섹션 구분자 (---)가 최소 3개 이상 있어야 함
      const separatorCount = (prompt.match(/---/g) || []).length
      expect(separatorCount).toBeGreaterThanOrEqual(3)
    })
  })

  // ==========================================================================
  // Test 2: 프롬프트 내용 정확성 (Canvas Grid)
  // ==========================================================================
  describe('Prompt Content Accuracy', () => {
    it('should accurately describe component positions in Canvas Grid', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 }, // Full width, row 0
          },
          {
            id: 'c2',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 1, width: 3, height: 7 }, // Left side, rows 1-7
          },
          {
            id: 'c3',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 3, y: 1, width: 9, height: 7 }, // Right side, rows 1-7
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'sidebar-main', components: ['c1', 'c2', 'c3'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Canvas Grid 정보 정확성 확인
      expect(prompt).toContain('12-column')
      expect(prompt).toContain('8-row')

      // Row descriptions
      expect(prompt).toContain('Row 0') // Header
      expect(prompt).toContain('Row 1') // Sidebar + Main

      // Component names in descriptions
      expect(prompt).toContain('Header')
      expect(prompt).toContain('Sidebar')
      expect(prompt).toContain('Main')

      // Full width detection
      expect(prompt).toContain('full width')
    })

    it('should accurately describe spatial relationships', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'sidebar',
            name: 'LeftSidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 3, height: 8 }, // LEFT
          },
          {
            id: 'main',
            name: 'MainContent',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 3, y: 0, width: 9, height: 8 }, // RIGHT of sidebar
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'sidebar-main', components: ['sidebar', 'main'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Spatial relationships 확인
      expect(prompt).toContain('Spatial Relationships')
      expect(prompt).toContain('LEFT') // LeftSidebar is LEFT of MainContent
    })

    it('should include accurate CSS Grid positioning code', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // CSS Grid positioning 코드 확인
      expect(prompt).toContain('CSS Grid Positioning')
      expect(prompt).toContain('grid-area')

      // Header는 Canvas (0, 0, 12, 1) → CSS Grid "1 / 1 / 2 / 13"
      expect(prompt).toContain('1 / 1 / 2 / 13')
    })

    it('should describe component positioning types accurately', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'fixed-header',
            name: 'FixedHeader',
            semanticTag: 'header',
            positioning: { type: 'fixed', position: { top: 0, left: 0, right: 0, zIndex: 50 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'sticky-sidebar',
            name: 'StickySidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
          },
          {
            id: 'static-main',
            name: 'StaticMain',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 3, y: 1, width: 9, height: 7 },
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'custom', components: ['fixed-header', 'sticky-sidebar', 'static-main'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Positioning types 확인
      expect(prompt).toContain('fixed')
      expect(prompt).toContain('sticky')
      expect(prompt).toContain('static')

      // zIndex 정보 확인
      expect(prompt).toContain('zIndex')
      expect(prompt).toContain('50')
    })

    it('should describe layout types accurately', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'flex-nav',
            name: 'FlexNavigation',
            semanticTag: 'nav',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row', justify: 'between', gap: '2rem' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'grid-gallery',
            name: 'GridGallery',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'grid', grid: { cols: 'repeat(3, 1fr)', gap: '1.5rem' } },
            canvasLayout: { x: 0, y: 1, width: 12, height: 5 },
          },
          {
            id: 'container-main',
            name: 'ContainerMain',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container', container: { maxWidth: '7xl', centered: true, padding: '2rem' } },
            canvasLayout: { x: 0, y: 6, width: 12, height: 2 },
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'vertical', components: ['flex-nav', 'grid-gallery', 'container-main'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Layout types 확인
      expect(prompt).toContain('flex')
      expect(prompt).toContain('grid')
      expect(prompt).toContain('container')

      // Layout details 확인
      expect(prompt).toContain('direction')
      expect(prompt).toContain('justify')
      expect(prompt).toContain('cols')
      expect(prompt).toContain('maxWidth')
      expect(prompt).toContain('centered')
    })
  })

  // ==========================================================================
  // Test 3: 프롬프트 일관성
  // ==========================================================================
  describe('Prompt Consistency', () => {
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'header',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
      ],
      breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
      layouts: {
        mobile: { structure: 'vertical', components: ['header'] },
      },
    }

    it('should generate identical prompts for the same schema', () => {
      const result1 = generatePrompt(schema, 'react', 'tailwind')
      const result2 = generatePrompt(schema, 'react', 'tailwind')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.prompt).toBe(result2.prompt)
    })

    it('should generate consistent component order in prompts', () => {
      const multiComponentSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
          },
          {
            id: 'c3',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'c2', 'c3'] },
        },
      }

      const result = generatePrompt(multiComponentSchema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Component 순서 확인 (Header → Main → Footer 순서로 나타나야 함)
      const headerIndex = prompt.indexOf('Header')
      const mainIndex = prompt.indexOf('Main')
      const footerIndex = prompt.indexOf('Footer')

      expect(headerIndex).toBeGreaterThan(-1)
      expect(mainIndex).toBeGreaterThan(headerIndex)
      expect(footerIndex).toBeGreaterThan(mainIndex)
    })
  })

  // ==========================================================================
  // Test 4: 프롬프트 완성도 (AI가 코드를 생성하기 충분한 정보)
  // ==========================================================================
  describe('Prompt Completeness', () => {
    it('should include all component properties', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'comprehensive',
            name: 'ComprehensiveComponent',
            semanticTag: 'section',
            positioning: { type: 'sticky', position: { top: '4rem', zIndex: 40 } },
            layout: {
              type: 'flex',
              flex: {
                direction: 'column',
                justify: 'center',
                items: 'center',
                gap: '2rem',
                wrap: 'wrap',
              },
            },
            styling: {
              width: '100%',
              height: 'auto',
              background: 'slate-100',
              border: 'b',
              shadow: 'lg',
              className: 'custom-class',
            },
            canvasLayout: { x: 0, y: 0, width: 12, height: 4 },
          },
        ],
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: 'vertical', components: ['comprehensive'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Positioning 정보 포함 확인
      expect(prompt).toContain('sticky')
      expect(prompt).toContain('4rem')
      expect(prompt).toContain('zIndex')

      // Layout 정보 포함 확인
      expect(prompt).toContain('flex')
      expect(prompt).toContain('column')
      expect(prompt).toContain('center')
      expect(prompt).toContain('gap')

      // Styling 정보 포함 확인
      expect(prompt).toContain('background')
      expect(prompt).toContain('slate-100')
      expect(prompt).toContain('shadow')
    })

    it('should include breakpoint information', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'responsive',
            name: 'ResponsiveComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            styling: { className: 'responsive-component' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 4 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['responsive'] },
          tablet: { structure: 'vertical', components: ['responsive'] },
          desktop: { structure: 'vertical', components: ['responsive'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Breakpoint 이름 포함 확인
      expect(prompt).toContain('mobile')
      expect(prompt).toContain('tablet')
      expect(prompt).toContain('desktop')
    })

    it('should include implementation instructions', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Implementation instructions 확인
      expect(prompt).toContain('Implementation Instructions')

      // 주요 지침 포함 확인
      const expectedInstructions = [
        'React', // Framework
        'Tailwind', // CSS solution
        'component', // Component-based architecture
      ]

      expectedInstructions.forEach((instruction) => {
        expect(prompt.toLowerCase()).toContain(instruction.toLowerCase())
      })
    })

    it('should include full schema JSON reference', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Full Schema JSON 포함 확인
      expect(prompt).toContain('Full Schema (JSON)')
      expect(prompt).toContain('"schemaVersion": "2.0"')
      expect(prompt).toContain('"id": "header"')
      expect(prompt).toContain('"semanticTag": "header"')
    })
  })

  // ==========================================================================
  // Test 5: 엣지 케이스 처리
  // ==========================================================================
  describe('Edge Cases in Prompts', () => {
    it('should handle single component schema', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'only-one',
            name: 'OnlyComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['only-one'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('OnlyComponent')
    })

    it('should handle schema with no Canvas layout (graceful degradation)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'no-canvas',
            name: 'NoCanvasComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            // No canvasLayout
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['no-canvas'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // Should still generate prompt (without Canvas Grid section)
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('NoCanvasComponent')
    })

    it('should handle very complex layouts with many components', () => {
      const components = Array.from({ length: 20 }, (_, i) => ({
        id: `c${i + 1}`,
        name: `Component${i + 1}`,
        semanticTag: 'div' as const,
        positioning: { type: 'static' as const },
        layout: { type: 'flex' as const },
        canvasLayout: {
          x: (i % 4) * 3,
          y: Math.floor(i / 4) * 2,
          width: 3,
          height: 2,
        },
      }))

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components,
        breakpoints: [{ name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 20 }],
        layouts: {
          desktop: {
            structure: 'custom',
            components: components.map((c) => c.id),
          },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // All 20 components should be mentioned
      components.forEach((comp) => {
        expect(prompt).toContain(comp.name)
      })
    })

    it('should handle multiple breakpoints with different layouts', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 },
              tablet: { x: 0, y: 0, width: 8, height: 1 },
              desktop: { x: 0, y: 0, width: 12, height: 1 },
            },
          },
          {
            id: 'sidebar',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              // Mobile: hidden (no layout)
              tablet: { x: 0, y: 1, width: 2, height: 7 },
              desktop: { x: 0, y: 1, width: 3, height: 7 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
          tablet: { structure: 'sidebar-main', components: ['header', 'sidebar'] },
          desktop: { structure: 'sidebar-main', components: ['header', 'sidebar'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // All breakpoints mentioned
      expect(prompt).toContain('mobile')
      expect(prompt).toContain('tablet')
      expect(prompt).toContain('desktop')

      // Responsive behavior described
      expect(prompt).toContain('responsiveCanvasLayout')
    })
  })

  // ==========================================================================
  // Test 6: 프롬프트 길이 및 토큰 추정
  // ==========================================================================
  describe('Prompt Length and Token Estimation', () => {
    it('should generate prompts within reasonable length', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'main',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['header', 'main'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Reasonable prompt length (not too short, not too long)
      expect(prompt.length).toBeGreaterThan(500) // At least 500 characters
      expect(prompt.length).toBeLessThan(50000) // Less than 50k characters
    })

    it('should have accurate token estimates', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Token estimate: ~1 token per 4 characters (rough estimate)
      const estimatedTokens = Math.ceil(prompt.length / 4)

      // For a simple schema, should be < 6500 tokens (updated for Reusability Patterns)
      // Increased from 4500 to account for:
      // - Component-Specific Styling Standards (2025 Wireframe Philosophy) section (~130 lines)
      //   - Header, Nav (horizontal/sidebar), Main, Aside, Footer, Section, Article, Div/Form examples
      //   - Each with complete TypeScript code examples
      // - Critical Styling Rules (7 detailed rules) (~20 lines)
      // - Updated Layout-Only Code Generation section (~10 lines)
      // - Enhanced Code Quality Checklist with Styling & Borders section (~10 lines)
      // - Component Reusability Patterns section (~100 lines)
      //   - Level 1: GridCell wrapper with full TypeScript example
      //   - Level 2: GridLayout container with full TypeScript example
      //   - Level 3: Compound Components pattern with full TypeScript example
      //   - Reusability Best Practices (5 principles)
      // Total increase: ~270 lines (~1080 characters) = ~270 tokens more
      // Current actual: ~5944 tokens for simple schema
      expect(estimatedTokens).toBeLessThan(6500)
    })

    it('should scale linearly with number of components', () => {
      const createSchema = (numComponents: number): LaydlerSchema => ({
        schemaVersion: '2.0',
        components: Array.from({ length: numComponents }, (_, i) => ({
          id: `c${i + 1}`,
          name: `Component${i + 1}`,
          semanticTag: 'div' as const,
          positioning: { type: 'static' as const },
          layout: { type: 'flex' as const },
          canvasLayout: { x: 0, y: i, width: 12, height: 1 },
        })),
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 20 }],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: Array.from({ length: numComponents }, (_, i) => `c${i + 1}`),
          },
        },
      })

      const schema1 = createSchema(1)
      const schema5 = createSchema(5)
      const schema10 = createSchema(10)

      const result1 = generatePrompt(schema1, 'react', 'tailwind')
      const result5 = generatePrompt(schema5, 'react', 'tailwind')
      const result10 = generatePrompt(schema10, 'react', 'tailwind')

      const length1 = result1.prompt!.length
      const length5 = result5.prompt!.length
      const length10 = result10.prompt!.length

      // Length should increase with more components
      expect(length5).toBeGreaterThan(length1)
      expect(length10).toBeGreaterThan(length5)

      // Should scale roughly linearly (within 3x factor)
      const ratio5to1 = length5 / length1
      const ratio10to5 = length10 / length5
      expect(ratio5to1).toBeLessThan(10) // Not exponential growth
      expect(ratio10to5).toBeLessThan(5)
    })
  })
})
