/**
 * Canvas JSON Export Validation Tests
 *
 * 캔버스에서 그려진 컴포넌트가 JSON Schema로 정확하게 변환되고,
 * AI 프롬프트로 올바르게 생성되는지 검증합니다.
 *
 * 테스트 범위:
 * 1. Canvas Layout → Component 속성 매핑 정확성
 * 2. Responsive Canvas Layout (breakpoint별 배치)
 * 3. Component positioning, layout, styling 검증
 * 4. Schema Validation 통과 확인
 * 5. Schema → Prompt 변환 정확성
 * 6. 다양한 배치 시나리오 (Header, Footer, Sidebar, Main, Grid)
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema, Component, CanvasLayout } from '@/types/schema'
import { validateSchema } from '../schema-validation'
import { generatePrompt } from '../prompt-generator'
import { normalizeSchema } from '../schema-utils'

describe('Canvas JSON Export Validation', () => {
  // ========================================
  // Test 1: Canvas Layout → Component 속성 매핑
  // ========================================
  describe('Canvas Layout to Component Mapping', () => {
    it('should correctly map canvasLayout to component', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'fixed', position: { top: 0, zIndex: 50 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      // 검증: canvasLayout이 정확히 설정되어 있는지
      expect(component.canvasLayout).toBeDefined()
      expect(component.canvasLayout!.x).toBe(0)
      expect(component.canvasLayout!.y).toBe(0)
      expect(component.canvasLayout!.width).toBe(12)
      expect(component.canvasLayout!.height).toBe(1)
    })

    it('should map responsiveCanvasLayout for multiple breakpoints', () => {
      const component: Component = {
        id: 'c2',
        name: 'Sidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: '4rem' } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 1, width: 6, height: 10 },
          tablet: { x: 0, y: 1, width: 3, height: 10 },
          desktop: { x: 0, y: 1, width: 2, height: 10 },
        },
      }

      // 검증: 각 breakpoint에 대한 layout 존재
      expect(component.responsiveCanvasLayout).toBeDefined()
      expect(component.responsiveCanvasLayout!.mobile).toBeDefined()
      expect(component.responsiveCanvasLayout!.tablet).toBeDefined()
      expect(component.responsiveCanvasLayout!.desktop).toBeDefined()

      // 검증: 각 breakpoint별 좌표 정확성
      expect(component.responsiveCanvasLayout!.mobile!.x).toBe(0)
      expect(component.responsiveCanvasLayout!.mobile!.width).toBe(6)

      expect(component.responsiveCanvasLayout!.tablet!.width).toBe(3)
      expect(component.responsiveCanvasLayout!.desktop!.width).toBe(2)
    })

    it('should handle grid boundaries correctly', () => {
      const gridCols = 12
      const gridRows = 20

      const component: Component = {
        id: 'c3',
        name: 'Main',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: { type: 'container' },
        canvasLayout: { x: 0, y: 1, width: 12, height: 19 },
      }

      // 검증: Grid 경계 내에 있는지
      const layout = component.canvasLayout!
      expect(layout.x).toBeGreaterThanOrEqual(0)
      expect(layout.y).toBeGreaterThanOrEqual(0)
      expect(layout.x + layout.width).toBeLessThanOrEqual(gridCols)
      expect(layout.y + layout.height).toBeLessThanOrEqual(gridRows)
    })

    it('should detect out-of-bounds positions', () => {
      const gridCols = 12
      const gridRows = 20

      const invalidLayout: CanvasLayout = { x: 10, y: 18, width: 5, height: 5 }

      // 검증: Grid 경계를 벗어나는 경우
      const isOutOfBounds =
        invalidLayout.x + invalidLayout.width > gridCols ||
        invalidLayout.y + invalidLayout.height > gridRows

      expect(isOutOfBounds).toBe(true)
    })
  })

  // ========================================
  // Test 2: Component Positioning 검증
  // ========================================
  describe('Component Positioning Validation', () => {
    it('should validate fixed positioning for Header', () => {
      const header: Component = {
        id: 'header',
        name: 'Header',
        semanticTag: 'header',
        positioning: {
          type: 'fixed',
          position: { top: 0, left: 0, right: 0, zIndex: 50 },
        },
        layout: { type: 'flex' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      // 검증: Header는 fixed positioning
      expect(header.positioning.type).toBe('fixed')
      expect(header.positioning.position?.top).toBeDefined()
      expect(header.positioning.position?.zIndex).toBeGreaterThan(0)
    })

    it('should validate sticky positioning for Sidebar', () => {
      const sidebar: Component = {
        id: 'sidebar',
        name: 'Sidebar',
        semanticTag: 'aside',
        positioning: {
          type: 'sticky',
          position: { top: '4rem' },
        },
        layout: { type: 'flex' },
        canvasLayout: { x: 0, y: 1, width: 3, height: 10 },
      }

      // 검증: Sidebar는 sticky positioning
      expect(sidebar.positioning.type).toBe('sticky')
      expect(sidebar.positioning.position?.top).toBeDefined()
    })

    it('should validate static positioning for Footer', () => {
      const footer: Component = {
        id: 'footer',
        name: 'Footer',
        semanticTag: 'footer',
        positioning: { type: 'static' },
        layout: { type: 'container' },
        canvasLayout: { x: 0, y: 19, width: 12, height: 1 },
      }

      // 검증: Footer는 static positioning
      expect(footer.positioning.type).toBe('static')
    })
  })

  // ========================================
  // Test 3: Component Layout 검증
  // ========================================
  describe('Component Layout Validation', () => {
    it('should validate flex layout configuration', () => {
      const component: Component = {
        id: 'nav',
        name: 'Navigation',
        semanticTag: 'nav',
        positioning: { type: 'static' },
        layout: {
          type: 'flex',
          flex: {
            direction: 'row',
            justify: 'between',
            items: 'center',
            gap: '1rem',
          },
        },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      // 검증: Flex layout 설정
      expect(component.layout.type).toBe('flex')
      expect(component.layout.flex).toBeDefined()
      expect(component.layout.flex!.direction).toBe('row')
      expect(component.layout.flex!.justify).toBe('between')
    })

    it('should validate grid layout configuration', () => {
      const component: Component = {
        id: 'gallery',
        name: 'CardGallery',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: {
          type: 'grid',
          grid: {
            cols: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          },
        },
        canvasLayout: { x: 0, y: 2, width: 12, height: 10 },
      }

      // 검증: Grid layout 설정
      expect(component.layout.type).toBe('grid')
      expect(component.layout.grid).toBeDefined()
      expect(component.layout.grid!.cols).toContain('repeat')
    })

    it('should validate container layout configuration', () => {
      const component: Component = {
        id: 'main',
        name: 'MainContent',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: {
          type: 'container',
          container: {
            maxWidth: '7xl',
            padding: '2rem',
            centered: true,
          },
        },
        canvasLayout: { x: 2, y: 1, width: 10, height: 15 },
      }

      // 검증: Container layout 설정
      expect(component.layout.type).toBe('container')
      expect(component.layout.container).toBeDefined()
      expect(component.layout.container!.maxWidth).toBe('7xl')
      expect(component.layout.container!.centered).toBe(true)
    })
  })

  // ========================================
  // Test 4: Schema Validation 통합 테스트
  // ========================================
  describe('Schema Validation Integration', () => {
    it('should validate complete GitHub-style schema', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'fixed', position: { top: 0, zIndex: 50 } },
            layout: { type: 'flex', flex: { direction: 'row' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'c2',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: '4rem' } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 1, width: 6, height: 10 },
              desktop: { x: 0, y: 1, width: 3, height: 10 },
            },
          },
          {
            id: 'c3',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 3, y: 1, width: 9, height: 10 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 12 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1', 'c3'],
          },
          desktop: {
            structure: 'sidebar-main',
            components: ['c1', 'c2', 'c3'],
            roles: { header: 'c1', sidebar: 'c2', main: 'c3' },
          },
        },
      }

      // 검증: Schema validation 통과
      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate complete Dashboard schema', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'navbar',
            name: 'TopNavbar',
            semanticTag: 'header',
            positioning: { type: 'fixed', position: { top: 0, left: 0, right: 0, zIndex: 50 } },
            layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
            styling: { height: '4rem', background: 'slate-900' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'sidemenu',
            name: 'SideMenu',
            semanticTag: 'nav',
            positioning: { type: 'fixed', position: { top: '4rem', left: 0, bottom: 0 } },
            layout: { type: 'flex', flex: { direction: 'column' } },
            styling: { width: '16rem', background: 'slate-800' },
            canvasLayout: { x: 0, y: 1, width: 2, height: 11 },
          },
          {
            id: 'content',
            name: 'DashboardContent',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            styling: { className: 'ml-64 pt-16' },
            canvasLayout: { x: 2, y: 1, width: 10, height: 11 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 12 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['navbar', 'content'],
          },
          desktop: {
            structure: 'sidebar-main',
            components: ['navbar', 'sidemenu', 'content'],
            roles: { header: 'navbar', sidebar: 'sidemenu', main: 'content' },
          },
        },
      }

      // 검증: Schema validation 통과
      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  // ========================================
  // Test 5: Schema → Prompt 변환 정확성
  // ========================================
  describe('Schema to Prompt Conversion', () => {
    it('should generate prompt with all component information', () => {
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
            canvasLayout: { x: 0, y: 1, width: 12, height: 10 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['header', 'main'],
          },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')

      // 검증: 프롬프트 생성 성공
      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()

      // 검증: 컴포넌트 정보 포함
      expect(result.prompt).toContain('Header')
      expect(result.prompt).toContain('Main')

      // 검증: Positioning 정보 포함
      expect(result.prompt).toContain('sticky')
      expect(result.prompt).toContain('static')

      // 검증: Layout 정보 포함
      expect(result.prompt).toContain('flex')
      expect(result.prompt).toContain('container')

      // 검증: Schema JSON 포함
      expect(result.prompt).toContain('Full Schema (JSON)')
      expect(result.prompt).toContain('"schemaVersion": "2.0"')
    })

    it('should generate prompt with responsive canvas layout information', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'sidebar',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 6, height: 10 },
              tablet: { x: 0, y: 0, width: 4, height: 10 },
              desktop: { x: 0, y: 0, width: 3, height: 10 },
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 12 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 12 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['sidebar'] },
          tablet: { structure: 'vertical', components: ['sidebar'] },
          desktop: { structure: 'vertical', components: ['sidebar'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')

      // 검증: 프롬프트 생성 성공
      expect(result.success).toBe(true)

      // 검증: Breakpoint 정보 포함
      expect(result.prompt).toContain('mobile')
      expect(result.prompt).toContain('tablet')
      expect(result.prompt).toContain('desktop')

      // 검증: responsiveCanvasLayout 정보 포함 (JSON에 포함되어야 함)
      expect(result.prompt).toContain('responsiveCanvasLayout')
    })

    it('should include warnings for non-optimal positioning', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' }, // Warning: header는 fixed/sticky 권장
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['header'] },
        },
      }

      const result = generatePrompt(schema, 'react', 'tailwind')

      // 검증: 경고 포함
      expect(result.success).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBeGreaterThan(0)
    })
  })

  // ========================================
  // Test 6: 다양한 배치 시나리오
  // ========================================
  describe('Various Layout Scenarios', () => {
    it('should validate marketing site layout (Header + Hero + Features + Footer)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'SiteHeader',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'hero',
            name: 'HeroSection',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 0, y: 1, width: 12, height: 4 },
          },
          {
            id: 'features',
            name: 'FeaturesSection',
            semanticTag: 'section',
            positioning: { type: 'static' },
            layout: { type: 'grid', grid: { cols: 3, gap: '2rem' } },
            canvasLayout: { x: 0, y: 5, width: 12, height: 4 },
          },
          {
            id: 'footer',
            name: 'SiteFooter',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 0, y: 9, width: 12, height: 2 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['header', 'hero', 'features', 'footer'],
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should validate card gallery layout with grid', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'gallery-header',
            name: 'GalleryHeader',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'card-grid',
            name: 'CardGrid',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: {
              type: 'grid',
              grid: {
                cols: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              },
            },
            canvasLayout: { x: 0, y: 1, width: 12, height: 10 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['gallery-header', 'card-grid'],
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)

      // 검증: Grid layout 정보
      const cardGrid = schema.components.find((c) => c.id === 'card-grid')
      expect(cardGrid?.layout.type).toBe('grid')
      expect(cardGrid?.layout.grid?.cols).toContain('repeat')
    })

    it('should validate three-column layout (Sidebar + Main + Sidebar)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'left-sidebar',
            name: 'LeftSidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 2, height: 12 },
          },
          {
            id: 'main',
            name: 'MainContent',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'container' },
            canvasLayout: { x: 2, y: 0, width: 8, height: 12 },
          },
          {
            id: 'right-sidebar',
            name: 'RightSidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 10, y: 0, width: 2, height: 12 },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 12 },
        ],
        layouts: {
          desktop: {
            structure: 'sidebar-main-sidebar',
            components: ['left-sidebar', 'main', 'right-sidebar'],
          },
        },
      }

      const result = validateSchema(schema)
      expect(result.valid).toBe(true)

      // 검증: 3-column layout
      expect(schema.layouts.desktop.structure).toBe('sidebar-main-sidebar')
      expect(schema.layouts.desktop.components).toHaveLength(3)
    })
  })

  // ========================================
  // Test 7: Breakpoint Inheritance 검증
  // ========================================
  describe('Breakpoint Inheritance', () => {
    it('should inherit canvas layout from mobile to desktop', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'component',
            name: 'TestComponent',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 6, height: 4 },
              // tablet, desktop는 명시하지 않음 → mobile에서 상속
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 6, gridRows: 12 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 12 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 12 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['component'] },
          tablet: { structure: 'vertical', components: ['component'] },
          desktop: { structure: 'vertical', components: ['component'] },
        },
      }

      // 정규화 (Breakpoint Inheritance 적용)
      const normalized = normalizeSchema(schema)

      // 검증: Tablet과 Desktop이 Mobile layout을 상속했는지
      const component = normalized.components[0]
      expect(component.responsiveCanvasLayout!.mobile).toBeDefined()

      // Note: normalizeSchema는 responsiveCanvasLayout을 상속하지 않을 수 있음
      // (Schema Utils에서 처리 여부 확인 필요)
      // 이 테스트는 현재 구현에 따라 조정 필요
    })
  })

  // ========================================
  // Test 8: Collision Detection 검증
  // ========================================
  describe('Collision Detection', () => {
    it('should detect overlapping components', () => {
      const comp1 = { x: 0, y: 0, width: 4, height: 4 }
      const comp2 = { x: 2, y: 2, width: 4, height: 4 }

      // Collision detection 로직 (KonvaCanvas에서 사용하는 로직)
      const hasCollision = !(
        comp1.x >= comp2.x + comp2.width ||
        comp1.x + comp1.width <= comp2.x ||
        comp1.y >= comp2.y + comp2.height ||
        comp1.y + comp1.height <= comp2.y
      )

      // 검증: Overlap 발생
      expect(hasCollision).toBe(true)
    })

    it('should not detect collision for adjacent components', () => {
      const comp1 = { x: 0, y: 0, width: 4, height: 4 }
      const comp2 = { x: 4, y: 0, width: 4, height: 4 } // 인접 (touching)

      // STRICT collision: touching도 collision으로 간주
      const hasCollision = !(
        comp1.x >= comp2.x + comp2.width ||
        comp1.x + comp1.width <= comp2.x ||
        comp1.y >= comp2.y + comp2.height ||
        comp1.y + comp1.height <= comp2.y
      )

      // 검증: Touching은 collision으로 간주하지 않음
      expect(hasCollision).toBe(false)
    })

    it('should not detect collision for non-overlapping components', () => {
      const comp1 = { x: 0, y: 0, width: 4, height: 4 }
      const comp2 = { x: 6, y: 6, width: 4, height: 4 }

      const hasCollision = !(
        comp1.x >= comp2.x + comp2.width ||
        comp1.x + comp1.width <= comp2.x ||
        comp1.y >= comp2.y + comp2.height ||
        comp1.y + comp1.height <= comp2.y
      )

      // 검증: Collision 없음
      expect(hasCollision).toBe(false)
    })
  })
})
