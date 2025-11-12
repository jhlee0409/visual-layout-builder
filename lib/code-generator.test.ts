import { describe, it, expect } from 'vitest'
import {
  generatePositioningClasses,
  generateLayoutClasses,
  generateStylingClasses,
  generateResponsiveClasses,
  generateComponentClasses,
  generateComponentCode,
} from './code-generator'
import type {
  ComponentPositioning,
  ComponentLayout,
  ComponentStyling,
  ResponsiveBehavior,
  Component,
} from '@/types/schema'

describe('code-generator', () => {
  describe('generatePositioningClasses', () => {
    it('should generate static positioning (no classes)', () => {
      const positioning: ComponentPositioning = { type: 'static' }
      const classes = generatePositioningClasses(positioning)

      expect(classes).toBe('')
    })

    it('should generate fixed positioning', () => {
      const positioning: ComponentPositioning = {
        type: 'fixed',
        position: { top: 0, left: 0, right: 0, zIndex: 50 },
      }
      const classes = generatePositioningClasses(positioning)

      expect(classes).toContain('fixed')
      expect(classes).toContain('top-0')
      expect(classes).toContain('left-0')
      expect(classes).toContain('right-0')
      expect(classes).toContain('z-50')
    })

    it('should generate sticky positioning', () => {
      const positioning: ComponentPositioning = {
        type: 'sticky',
        position: { top: 0 },
      }
      const classes = generatePositioningClasses(positioning)

      expect(classes).toContain('sticky')
      expect(classes).toContain('top-0')
    })

    it('should handle rem values', () => {
      const positioning: ComponentPositioning = {
        type: 'fixed',
        position: { top: '4rem', zIndex: 40 },
      }
      const classes = generatePositioningClasses(positioning)

      expect(classes).toContain('top-16') // 4rem = 16 in Tailwind
    })

    it('should handle absolute positioning', () => {
      const positioning: ComponentPositioning = {
        type: 'absolute',
        position: { bottom: 0, right: 0 },
      }
      const classes = generatePositioningClasses(positioning)

      expect(classes).toContain('absolute')
      expect(classes).toContain('bottom-0')
      expect(classes).toContain('right-0')
    })
  })

  describe('generateLayoutClasses', () => {
    it('should generate flex layout', () => {
      const layout: ComponentLayout = {
        type: 'flex',
        flex: {
          direction: 'column',
          gap: '1rem',
        },
      }
      const classes = generateLayoutClasses(layout)

      expect(classes).toContain('flex')
      expect(classes).toContain('flex-col')
      expect(classes).toContain('gap-4') // 1rem = 4
    })

    it('should generate flex with all properties', () => {
      const layout: ComponentLayout = {
        type: 'flex',
        flex: {
          direction: 'row',
          justify: 'center',
          items: 'center',
          wrap: 'wrap',
          gap: '0.5rem',
        },
      }
      const classes = generateLayoutClasses(layout)

      expect(classes).toContain('flex')
      expect(classes).toContain('flex-row')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('items-center')
      expect(classes).toContain('flex-wrap')
      expect(classes).toContain('gap-2') // 0.5rem = 2
    })

    it('should generate grid layout', () => {
      const layout: ComponentLayout = {
        type: 'grid',
        grid: {
          cols: 3,
          rows: 2,
          gap: '1rem',
        },
      }
      const classes = generateLayoutClasses(layout)

      expect(classes).toContain('grid')
      expect(classes).toContain('grid-cols-3')
      expect(classes).toContain('grid-rows-2')
      expect(classes).toContain('gap-4')
    })

    it('should handle container layout (no classes)', () => {
      const layout: ComponentLayout = {
        type: 'container',
        container: {
          maxWidth: '7xl',
          padding: '2rem',
          centered: true,
        },
      }
      const classes = generateLayoutClasses(layout)

      expect(classes).toBe('')
    })

    it('should handle none layout', () => {
      const layout: ComponentLayout = { type: 'none' }
      const classes = generateLayoutClasses(layout)

      expect(classes).toBe('')
    })
  })

  describe('generateStylingClasses', () => {
    it('should handle undefined styling', () => {
      const classes = generateStylingClasses(undefined)

      expect(classes).toBe('')
    })

    it('should generate width and height', () => {
      const styling: ComponentStyling = {
        width: '16rem',
        height: '4rem',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('w-64') // 16rem = 64
      expect(classes).toContain('h-16') // 4rem = 16
    })

    it('should handle special width values', () => {
      const styling: ComponentStyling = {
        width: 'full',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('w-full')
    })

    it('should generate background', () => {
      const styling: ComponentStyling = {
        background: 'white',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('bg-white')
    })

    it('should generate border', () => {
      const styling: ComponentStyling = {
        border: 'b',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('border-b')
    })

    it('should generate shadow', () => {
      const styling: ComponentStyling = {
        shadow: 'sm',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('shadow-sm')
    })

    it('should include custom className', () => {
      const styling: ComponentStyling = {
        className: 'flex-1 min-h-screen',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('flex-1')
      expect(classes).toContain('min-h-screen')
    })

    it('should combine all styling properties', () => {
      const styling: ComponentStyling = {
        width: 'full',
        background: 'gray-100',
        border: 't',
        shadow: 'md',
        className: 'mt-4',
      }
      const classes = generateStylingClasses(styling)

      expect(classes).toContain('w-full')
      expect(classes).toContain('bg-gray-100')
      expect(classes).toContain('border-t')
      expect(classes).toContain('shadow-md')
      expect(classes).toContain('mt-4')
    })
  })

  describe('generateResponsiveClasses', () => {
    it('should handle undefined responsive', () => {
      const classes = generateResponsiveClasses(undefined)

      expect(classes).toBe('')
    })

    it('should hide on mobile, show on desktop', () => {
      const responsive: ResponsiveBehavior = {
        mobile: { hidden: true },
        desktop: { hidden: false },
      }
      const classes = generateResponsiveClasses(responsive)

      expect(classes).toContain('hidden')
      expect(classes).toContain('lg:block')
    })

    it('should handle tablet responsive width', () => {
      const responsive: ResponsiveBehavior = {
        tablet: { width: '20rem' },
      }
      const classes = generateResponsiveClasses(responsive)

      expect(classes).toContain('md:w-80') // 20rem = 80
    })

    it('should handle responsive order', () => {
      const responsive: ResponsiveBehavior = {
        mobile: { order: 1 },
        desktop: { order: 3 },
      }
      const classes = generateResponsiveClasses(responsive)

      expect(classes).toContain('lg:order-3')
    })
  })

  describe('generateComponentClasses', () => {
    it('should combine all class types', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: {
          type: 'sticky',
          position: { top: 0, zIndex: 50 },
        },
        layout: {
          type: 'flex',
          flex: { direction: 'row', justify: 'between' },
        },
        styling: {
          background: 'white',
          border: 'b',
        },
        responsive: {
          mobile: { hidden: false },
        },
      }

      const classes = generateComponentClasses(component)

      expect(classes).toContain('sticky')
      expect(classes).toContain('top-0')
      expect(classes).toContain('z-50')
      expect(classes).toContain('flex')
      expect(classes).toContain('flex-row')
      expect(classes).toContain('justify-between')
      expect(classes).toContain('bg-white')
      expect(classes).toContain('border-b')
    })

    it('should handle minimal component', () => {
      const component: Component = {
        id: 'c1',
        name: 'Simple',
        semanticTag: 'div',
        positioning: { type: 'static' },
        layout: { type: 'none' },
      }

      const classes = generateComponentClasses(component)

      expect(classes.trim()).toBe('')
    })
  })

  describe('generateComponentCode', () => {
    it('should generate React component code', () => {
      const component: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'none' },
      }

      const code = generateComponentCode(component, 'react', 'tailwind')

      expect(code).toContain('export function Header')
      expect(code).toContain('children?: React.ReactNode')
      expect(code).toContain('<header')
      expect(code).toContain('</header>')
      expect(code).toContain('sticky top-0')
    })

    it('should generate component with container wrapper', () => {
      const component: Component = {
        id: 'c1',
        name: 'Main',
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
      }

      const code = generateComponentCode(component, 'react', 'tailwind')

      expect(code).toContain('<main')
      expect(code).toContain('<div className="container')
      expect(code).toContain('max-w-7xl')
      expect(code).toContain('mx-auto')
      expect(code).toContain('px-8') // 2rem = 8
    })

    it('should include default children from props', () => {
      const component: Component = {
        id: 'c1',
        name: 'Hero',
        semanticTag: 'section',
        positioning: { type: 'static' },
        layout: { type: 'none' },
        props: {
          children: 'Welcome to our site',
        },
      }

      const code = generateComponentCode(component, 'react', 'tailwind')

      expect(code).toContain('Welcome to our site')
    })

    it('should throw error for unsupported framework', () => {
      const component: Component = {
        id: 'c1',
        name: 'Test',
        semanticTag: 'div',
        positioning: { type: 'static' },
        layout: { type: 'none' },
      }

      expect(() => {
        generateComponentCode(component, 'vue' as any, 'tailwind')
      }).toThrow('Currently only React + Tailwind is supported')
    })
  })
})
