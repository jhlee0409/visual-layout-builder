/**
 * Canvas Integration Tests
 *
 * 통합 테스트: 캔버스에 컴포넌트를 배치하고 프롬프트가 의도한대로 생성되는지 검증
 *
 * 테스트 범위:
 * 1. 캔버스 배치 → 프롬프트 생성 → 레이아웃 생성 검증
 * 2. 브레이크포인트별 배치 + Component Linking → 프롬프트 검증
 * 3. 주요 컴포넌트 조합 테스트 (SemanticTag × Positioning × Layout)
 *
 * @see CLAUDE.md - Canvas → Code Generation Architecture (2025 Redesign)
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema, Component } from '@/types/schema'
import { generatePrompt } from '../prompt-generator'
import { validateSchema } from '../schema-validation'
import { describeVisualLayout } from '../visual-layout-descriptor'
import { canvasToGridPositions } from '../canvas-to-grid'

describe('Canvas Integration Tests', () => {
  // ==========================================================================
  // Test 1: 캔버스 배치 → 프롬프트 생성 → 레이아웃 생성
  // ==========================================================================
  describe('Canvas to Prompt to Layout Flow', () => {
    it('should generate accurate prompt from Canvas layout (GitHub-style)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'SiteHeader',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
            layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 }, // Full width header
          },
          {
            id: 'sidebar',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 1, width: 3, height: 7 }, // Left sidebar
          },
          {
            id: 'main',
            name: 'MainContent',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container', container: { maxWidth: 'xl', centered: true } },
            canvasLayout: { x: 3, y: 1, width: 9, height: 7 }, // Right content (side-by-side with sidebar)
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: {
            structure: 'sidebar-main',
            components: ['header', 'sidebar', 'main'],
            roles: { header: 'header', sidebar: 'sidebar', main: 'main' },
          },
        },
      }

      // 1. Schema validation 통과
      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true)

      // 2. Prompt 생성
      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // 3. Prompt가 Canvas Grid 정보를 포함하는지 확인
      expect(prompt).toContain('Visual Layout (Canvas Grid)')
      expect(prompt).toContain('12-column')
      expect(prompt).toContain('8-row')

      // 4. Row-by-row 설명 포함 확인
      expect(prompt).toContain('Row 0') // Header
      expect(prompt).toContain('Row 1') // Sidebar + Main

      // 5. Side-by-side 레이아웃 감지 확인
      expect(prompt).toContain('Spatial Relationships')
      expect(prompt).toContain('LEFT') // Sidebar is LEFT of Main

      // 6. CSS Grid positioning 코드 포함 확인
      expect(prompt).toContain('CSS Grid Positioning')
      expect(prompt).toContain('grid-area')

      // 7. Implementation hints 포함 확인
      expect(prompt).toContain('Implementation Strategy')
      expect(prompt).toContain('CSS Grid') // Should recommend CSS Grid for side-by-side
    })

    it('should generate simple flexbox prompt for vertical layouts', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
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
          {
            id: 'footer',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['header', 'main', 'footer'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // 수직 레이아웃에서는 Flexbox 사용 권장
      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('Visual Layout (Canvas Grid)')

      // Full width 컴포넌트들 감지
      expect(prompt).toContain('FULL WIDTH')
    })

    it('should handle complex grid layouts with multiple side-by-side components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'card1',
            name: 'Card1',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 4, height: 3 },
          },
          {
            id: 'card2',
            name: 'Card2',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 4, y: 0, width: 4, height: 3 },
          },
          {
            id: 'card3',
            name: 'Card3',
            semanticTag: 'article',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 8, y: 0, width: 4, height: 3 },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          desktop: { structure: 'horizontal', components: ['card1', 'card2', 'card3'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // 3개 side-by-side 컴포넌트 감지
      const validationResult = validateSchema(schema)
      const complexGridWarning = validationResult.warnings.find(
        (w) => w.code === 'COMPLEX_GRID_LAYOUT_DETECTED'
      )
      expect(complexGridWarning).toBeDefined()
      expect(complexGridWarning!.message).toContain('Row 0')
      expect(complexGridWarning!.message).toContain('Card1')
      expect(complexGridWarning!.message).toContain('Card2')
      expect(complexGridWarning!.message).toContain('Card3')
    })
  })

  // ==========================================================================
  // Test 2: 브레이크포인트별 배치 + Component Linking → 프롬프트
  // ==========================================================================
  describe('Breakpoint-specific Layouts with Component Linking', () => {
    it('should generate prompt with component links across breakpoints', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header-mobile',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 },
            },
          },
          {
            id: 'header-desktop',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 0, width: 12, height: 1 },
            },
          },
          {
            id: 'nav-mobile',
            name: 'Navigation',
            semanticTag: 'nav',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 1, width: 4, height: 2 },
            },
          },
          {
            id: 'nav-desktop',
            name: 'Navigation',
            semanticTag: 'nav',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'row', gap: '2rem' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 12, height: 1 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['header-mobile', 'nav-mobile'] },
          desktop: { structure: 'vertical', components: ['header-desktop', 'nav-desktop'] },
        },
      }

      // Component Links: 같은 UI 요소의 반응형 버전
      const componentLinks = [
        { source: 'header-mobile', target: 'header-desktop' },
        { source: 'nav-mobile', target: 'nav-desktop' },
      ]

      const result = generatePrompt(schema, 'react', 'tailwind', componentLinks)
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Component Links 섹션 포함 확인
      expect(prompt).toContain('Component Links (Cross-Breakpoint Relationships)')
      expect(prompt).toContain('Group 1')
      expect(prompt).toContain('Group 2')

      // Link 그룹에 컴포넌트 이름 포함 확인
      expect(prompt).toContain('Header')
      expect(prompt).toContain('Navigation')

      // 중요 안내 메시지 포함 확인 (강화된 CRITICAL RULE)
      expect(prompt).toContain('MUST be treated as the SAME component')
      expect(prompt).toContain('CRITICAL IMPLEMENTATION RULE')
    })

    it('should handle transitive component links (A → B → C)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'footer-mobile',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            responsiveCanvasLayout: { mobile: { x: 0, y: 7, width: 4, height: 1 } },
          },
          {
            id: 'footer-tablet',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            responsiveCanvasLayout: { tablet: { x: 0, y: 7, width: 8, height: 1 } },
          },
          {
            id: 'footer-desktop',
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            responsiveCanvasLayout: { desktop: { x: 0, y: 7, width: 12, height: 1 } },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['footer-mobile'] },
          tablet: { structure: 'vertical', components: ['footer-tablet'] },
          desktop: { structure: 'vertical', components: ['footer-desktop'] },
        },
      }

      // Transitive links: mobile → tablet → desktop
      const componentLinks = [
        { source: 'footer-mobile', target: 'footer-tablet' },
        { source: 'footer-tablet', target: 'footer-desktop' },
      ]

      const result = generatePrompt(schema, 'react', 'tailwind', componentLinks)
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // 하나의 그룹으로 묶여야 함 (DFS algorithm)
      expect(prompt).toContain('Component Links')
      expect(prompt).toContain('Group 1')

      // 3개 모두 같은 그룹에 포함되어야 함
      expect(prompt).toContain('footer-mobile')
      expect(prompt).toContain('footer-tablet')
      expect(prompt).toContain('footer-desktop')
    })

    it('should filter out invalid component links and warn user', () => {
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
        layouts: { mobile: { structure: 'vertical', components: ['header'] } },
      }

      // Invalid links: non-existent component IDs
      const componentLinks = [
        { source: 'header', target: 'non-existent-component' },
        { source: 'invalid-id', target: 'header' },
      ]

      const result = generatePrompt(schema, 'react', 'tailwind', componentLinks)

      // Should fail or warn
      if (result.success) {
        // If successful, should have warnings
        expect(result.warnings).toBeDefined()
        expect(result.warnings!.length).toBeGreaterThan(0)
      } else {
        // If failed, should have errors
        expect(result.errors).toBeDefined()
        expect(result.errors![0]).toContain('invalid')
      }
    })

    it('should handle breakpoint-specific canvas layouts with component links', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'sidebar-mobile',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 1, width: 4, height: 6 }, // Full width on mobile
            },
          },
          {
            id: 'sidebar-desktop',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              desktop: { x: 0, y: 1, width: 3, height: 7 }, // Left sidebar on desktop
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['sidebar-mobile'] },
          desktop: { structure: 'vertical', components: ['sidebar-desktop'] },
        },
      }

      const componentLinks = [{ source: 'sidebar-mobile', target: 'sidebar-desktop' }]

      const result = generatePrompt(schema, 'react', 'tailwind', componentLinks)
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!

      // Breakpoint별 Canvas layout 정보 포함 확인
      expect(prompt).toContain('mobile')
      expect(prompt).toContain('desktop')

      // Component Links 포함 확인
      expect(prompt).toContain('Component Links')
      expect(prompt).toContain('Sidebar')
    })
  })

  // ==========================================================================
  // Test 3: 주요 컴포넌트 조합 테스트 (SemanticTag × Positioning × Layout)
  // ==========================================================================
  describe('Component Combinations (SemanticTag × Positioning × Layout)', () => {
    /**
     * 대표적인 조합 테스트 (모든 조합은 180가지로 너무 많음)
     *
     * 주요 조합:
     * - Header × Sticky × Flex
     * - Nav × Fixed × Flex
     * - Main × Static × Container
     * - Aside × Sticky × Flex
     * - Footer × Static × Container
     * - Section × Static × Grid
     * - Article × Static × Flex
     * - Div × Static × Flex
     * - Form × Static × Flex
     */

    it('should handle Header × Sticky × Flex combination', () => {
      const component: Component = {
        id: 'header',
        name: 'StickyHeader',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
        layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['header'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // Validation should pass without warnings (recommended combination)
      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true)

      // Header with sticky positioning should have no HEADER_NOT_FIXED_OR_STICKY warnings
      const positioningWarnings = validationResult.warnings.filter(
        (w) => w.code === 'HEADER_NOT_FIXED_OR_STICKY'
      )
      expect(positioningWarnings).toHaveLength(0)
    })

    it('should handle Nav × Fixed × Flex combination', () => {
      const component: Component = {
        id: 'nav',
        name: 'FixedNavbar',
        semanticTag: 'nav',
        positioning: { type: 'fixed', position: { top: 0, left: 0, right: 0, zIndex: 50 } },
        layout: { type: 'flex', flex: { direction: 'row', gap: '2rem' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['nav'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('FixedNavbar')
      expect(prompt).toContain('fixed')
    })

    it('should handle Main × Static × Container combination', () => {
      const component: Component = {
        id: 'main',
        name: 'MainContent',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: { type: 'container', container: { maxWidth: '7xl', centered: true } },
        canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['main'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true)
    })

    it('should handle Aside × Sticky × Flex combination', () => {
      const component: Component = {
        id: 'sidebar',
        name: 'StickySidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: '4rem' } },
        layout: { type: 'flex', flex: { direction: 'column', gap: '1rem' } },
        canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['sidebar'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
    })

    it('should handle Footer × Static × Container combination', () => {
      const component: Component = {
        id: 'footer',
        name: 'SiteFooter',
        semanticTag: 'footer',
        positioning: { type: 'static' },
        layout: { type: 'container', container: { maxWidth: 'full', padding: '2rem' } },
        canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['footer'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      // Footer with static positioning is recommended
      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true)
    })

    it('should handle Section × Static × Grid combination', () => {
      const component: Component = {
        id: 'features',
        name: 'FeaturesSection',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: {
          type: 'grid',
          grid: { cols: 'repeat(3, 1fr)', gap: '2rem' },
        },
        canvasLayout: { x: 0, y: 2, width: 12, height: 4 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['features'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('grid')
    })

    it('should handle Article × Static × Flex combination', () => {
      const component: Component = {
        id: 'article',
        name: 'BlogPost',
        semanticTag: 'article',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column', gap: '1.5rem' } },
        canvasLayout: { x: 2, y: 2, width: 8, height: 4 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['article'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
    })

    it('should handle Div × Static × Flex combination', () => {
      const component: Component = {
        id: 'container',
        name: 'GenericContainer',
        semanticTag: 'div',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['container'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
    })

    it('should handle Form × Static × Flex combination', () => {
      const component: Component = {
        id: 'contact-form',
        name: 'ContactForm',
        semanticTag: 'form',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column', gap: '1.5rem' } },
        canvasLayout: { x: 2, y: 2, width: 8, height: 4 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['contact-form'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
    })

    it('should handle non-recommended combinations with warnings', () => {
      // Header with static positioning (not recommended)
      const component: Component = {
        id: 'header',
        name: 'StaticHeader',
        semanticTag: 'header',
        positioning: { type: 'static' }, // Not recommended for header
        layout: { type: 'flex' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['header'] } },
      }

      const validationResult = validateSchema(schema)
      expect(validationResult.valid).toBe(true)

      // Should have warning for header not using fixed/sticky
      const warnings = validationResult.warnings.filter(
        (w) => w.code === 'HEADER_NOT_FIXED_OR_STICKY'
      )
      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings[0].message).toContain('header')
      expect(warnings[0].message).toContain('fixed')
      expect(warnings[0].message).toContain('sticky')
    })

    it('should handle absolute positioning for overlays', () => {
      const component: Component = {
        id: 'modal',
        name: 'ModalOverlay',
        semanticTag: 'div',
        positioning: {
          type: 'absolute',
          position: { top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
        },
        layout: { type: 'flex', flex: { items: 'center', justify: 'center' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['modal'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)

      expect(result.prompt).toBeDefined()
      const prompt = result.prompt!
      expect(prompt).toContain('absolute')
      expect(prompt).toContain('zIndex')
    })

    it('should handle relative positioning for nested layouts', () => {
      const component: Component = {
        id: 'card',
        name: 'Card',
        semanticTag: 'div',
        positioning: { type: 'relative' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 4, height: 3 },
      }

      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [component],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['card'] } },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')
      expect(result.success).toBe(true)
    })
  })

  // ==========================================================================
  // Test 4: Canvas Grid Accuracy (Visual Layout Descriptor)
  // ==========================================================================
  describe('Canvas Grid Visual Layout Accuracy', () => {
    it('should accurately describe Canvas Grid positions in prompt', () => {
      const components: Component[] = [
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
      ]

      const description = describeVisualLayout(components, 'desktop', 12, 8)

      // Summary 확인
      expect(description.summary).toContain('12-column')
      expect(description.summary).toContain('8-row')
      expect(description.summary).toContain('3 components')

      // Row-by-row 설명 확인
      expect(description.rowByRow.length).toBeGreaterThan(0)
      expect(description.rowByRow.some((row) => row.includes('Header'))).toBe(true)
      expect(description.rowByRow.some((row) => row.includes('Sidebar'))).toBe(true)
      expect(description.rowByRow.some((row) => row.includes('Main'))).toBe(true)

      // Spatial relationships 확인
      expect(description.spatialRelationships.length).toBeGreaterThan(0)
      expect(
        description.spatialRelationships.some((rel) => rel.includes('LEFT'))
      ).toBe(true)

      // Implementation hints 확인
      expect(description.implementationHints.length).toBeGreaterThan(0)
      expect(
        description.implementationHints.some((hint) => hint.includes('CSS Grid'))
      ).toBe(true)

      // Visual layout (CSS Grid positions) 확인
      expect(description.visualLayout).toBeDefined()
      expect(description.visualLayout.gridCols).toBe(12)
      expect(description.visualLayout.gridRows).toBe(8)
      expect(description.visualLayout.positions.length).toBe(3)
    })

    it('should convert Canvas positions to CSS Grid areas accurately', () => {
      const components: Component[] = [
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
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', position: { top: '4rem' } },
          layout: { type: 'flex' },
          canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
        },
        {
          id: 'c3',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'container' },
          canvasLayout: { x: 3, y: 1, width: 9, height: 7 },
        },
      ]

      const visualLayout = canvasToGridPositions(components, 'desktop', 12, 8)

      expect(visualLayout.positions.length).toBe(3)
      expect(visualLayout.gridCols).toBe(12)
      expect(visualLayout.gridRows).toBe(8)

      // Header (0-based Canvas) → 1-based CSS Grid
      const header = visualLayout.positions.find((p) => p.componentId === 'c1')
      expect(header).toBeDefined()
      expect(header!.gridArea).toBe('1 / 1 / 2 / 13') // row 1 / col 1 / row 2 / col 13
      expect(header!.gridColumn).toBe('1 / 13')
      expect(header!.gridRow).toBe('1 / 2')

      // Sidebar
      const sidebar = visualLayout.positions.find((p) => p.componentId === 'c2')
      expect(sidebar).toBeDefined()
      expect(sidebar!.gridArea).toBe('2 / 1 / 9 / 4') // row 2 / col 1 / row 9 / col 4

      // Main
      const main = visualLayout.positions.find((p) => p.componentId === 'c3')
      expect(main).toBeDefined()
      expect(main!.gridArea).toBe('2 / 4 / 9 / 13') // row 2 / col 4 / row 9 / col 13
    })
  })
})
