import { describe, it, expect } from 'vitest'
import { COMPONENT_LIBRARY, type ComponentTemplate, getComponentsByCategory, getTemplateById, createComponentFromTemplate } from './component-library'

describe('component-library', () => {
  describe('COMPONENT_LIBRARY', () => {
    it('should not be empty', () => {
      expect(COMPONENT_LIBRARY.length).toBeGreaterThan(0)
    })

    it('should have all required fields for each template', () => {
      COMPONENT_LIBRARY.forEach((template) => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.icon).toBeDefined()
        expect(template.template).toBeDefined()
      })
    })

    it('should have valid categories', () => {
      const validCategories = ['layout', 'navigation', 'content', 'form']

      COMPONENT_LIBRARY.forEach((template) => {
        expect(validCategories).toContain(template.category)
      })
    })

    it('should have unique IDs', () => {
      const ids = COMPONENT_LIBRARY.map((t) => t.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have templates with valid semantic tags', () => {
      const validTags = ['header', 'nav', 'main', 'aside', 'footer', 'section', 'article', 'div', 'form']

      COMPONENT_LIBRARY.forEach((template) => {
        expect(validTags).toContain(template.template.semanticTag)
      })
    })

    it('should have templates with positioning', () => {
      COMPONENT_LIBRARY.forEach((template) => {
        expect(template.template.positioning).toBeDefined()
        expect(template.template.positioning.type).toBeDefined()
      })
    })

    it('should have templates with layout', () => {
      COMPONENT_LIBRARY.forEach((template) => {
        expect(template.template.layout).toBeDefined()
        expect(template.template.layout.type).toBeDefined()
      })
    })

    it('should have PascalCase component names', () => {
      const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/

      COMPONENT_LIBRARY.forEach((template) => {
        expect(template.template.name).toMatch(pascalCaseRegex)
      })
    })

    it('should have at least one layout component', () => {
      const layoutComponents = COMPONENT_LIBRARY.filter((t) => t.category === 'layout')

      expect(layoutComponents.length).toBeGreaterThan(0)
    })

    it('should have at least one navigation component', () => {
      const navComponents = COMPONENT_LIBRARY.filter((t) => t.category === 'navigation')

      expect(navComponents.length).toBeGreaterThan(0)
    })

    it('should have at least one content component', () => {
      const contentComponents = COMPONENT_LIBRARY.filter((t) => t.category === 'content')

      expect(contentComponents.length).toBeGreaterThan(0)
    })

    it('should have header template with sticky positioning', () => {
      const headerTemplate = COMPONENT_LIBRARY.find((t) => t.id === 'header-sticky')

      expect(headerTemplate).toBeDefined()
      expect(headerTemplate?.template.semanticTag).toBe('header')
      expect(headerTemplate?.template.positioning.type).toBe('sticky')
    })

    it('should have main content template', () => {
      const mainTemplate = COMPONENT_LIBRARY.find((t) => t.id === 'main-content')

      expect(mainTemplate).toBeDefined()
      expect(mainTemplate?.template.semanticTag).toBe('main')
      expect(mainTemplate?.template.positioning.type).toBe('static')
    })

    it('should have footer template with static positioning', () => {
      const footerTemplate = COMPONENT_LIBRARY.find((t) => t.id === 'footer-standard')

      expect(footerTemplate).toBeDefined()
      expect(footerTemplate?.template.semanticTag).toBe('footer')
      expect(footerTemplate?.template.positioning.type).toBe('static')
    })
  })

  describe('getComponentsByCategory', () => {
    it('should filter by layout category', () => {
      const layoutComponents = getComponentsByCategory('layout')

      expect(layoutComponents.length).toBeGreaterThan(0)
      layoutComponents.forEach((comp) => {
        expect(comp.category).toBe('layout')
      })
    })

    it('should filter by navigation category', () => {
      const navComponents = getComponentsByCategory('navigation')

      expect(navComponents.length).toBeGreaterThan(0)
    })
  })

  describe('getTemplateById', () => {
    it('should find template by ID', () => {
      const template = getTemplateById('header-sticky')

      expect(template).toBeDefined()
      expect(template?.id).toBe('header-sticky')
    })

    it('should return undefined for non-existent ID', () => {
      const template = getTemplateById('non-existent')

      expect(template).toBeUndefined()
    })
  })

  describe('createComponentFromTemplate', () => {
    it('should create component with custom ID', () => {
      const template = getTemplateById('header-sticky')!

      const component = createComponentFromTemplate(template, 'custom-id')

      expect(component.id).toBe('custom-id')
      expect(component.name).toBe(template.template.name)
    })

    it('should generate ID if not provided', () => {
      const template = getTemplateById('header-sticky')!

      const component = createComponentFromTemplate(template)

      expect(component.id).toContain(template.id)
    })
  })
})
