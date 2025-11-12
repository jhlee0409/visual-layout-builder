import { describe, it, expect } from 'vitest'
import { exportToFiles } from './file-exporter'
import { createEmptySchema } from './schema-utils'
import type { GenerationPackage } from '@/types/schema'

describe('file-exporter', () => {
  describe('exportToFiles', () => {
    it('should export components and layout files', () => {
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
      ]
      schema.layouts.mobile!.components = ['c1', 'c2']
      schema.layouts.tablet!.components = ['c1', 'c2']
      schema.layouts.desktop!.components = ['c1', 'c2']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test prompt',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)

      expect(files.length).toBeGreaterThan(0)
      expect(files.some((f) => f.path.includes('Header'))).toBe(true)
      expect(files.some((f) => f.path.includes('Main'))).toBe(true)
      expect(files.some((f) => f.path === 'app/page.tsx')).toBe(true)
      expect(files.some((f) => f.path === 'schema.json')).toBe(true)
    })

    it('should generate component files with correct paths', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'CustomComponent',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.components = ['c1']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const componentFile = files.find((f) => f.path === 'components/CustomComponent.tsx')

      expect(componentFile).toBeDefined()
      expect(componentFile!.content).toContain('export function CustomComponent')
    })

    it('should include schema.json file', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Test',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.components = ['c1']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const schemaFile = files.find((f) => f.path === 'schema.json')

      expect(schemaFile).toBeDefined()
      expect(() => JSON.parse(schemaFile!.content)).not.toThrow()
    })

    it('should generate layout file with imports', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'static' },
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
      schema.layouts.desktop!.components = ['c1', 'c2']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const layoutFile = files.find((f) => f.path === 'app/page.tsx')

      expect(layoutFile).toBeDefined()
      expect(layoutFile!.content).toContain('import { Header }')
      expect(layoutFile!.content).toContain('import { Footer }')
      expect(layoutFile!.content).toContain('export default function Page()')
    })

    it('should generate vertical layout structure', () => {
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
      schema.layouts.desktop!.structure = 'vertical'
      schema.layouts.desktop!.components = ['c1']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const layoutFile = files.find((f) => f.path === 'app/page.tsx')

      expect(layoutFile).toBeDefined()
      expect(layoutFile!.content).toContain('flex flex-col')
      expect(layoutFile!.content).toContain('<Header />')
    })

    it('should handle multiple components', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'ComponentA',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
        {
          id: 'c2',
          name: 'ComponentB',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
        {
          id: 'c3',
          name: 'ComponentC',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.components = ['c1', 'c2', 'c3']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)

      expect(files.filter((f) => f.path.startsWith('components/')).length).toBe(3)
    })

    it('should generate sidebar-main layout structure', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.structure = 'sidebar-main'
      schema.layouts.desktop!.components = ['c1', 'c2']
      schema.layouts.desktop!.roles = { sidebar: 'c1', main: 'c2' }

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const layoutFile = files.find((f) => f.path === 'app/page.tsx')

      expect(layoutFile).toBeDefined()
      expect(layoutFile!.content).toContain('<Sidebar />')
      expect(layoutFile!.content).toContain('<Main>')
      expect(layoutFile!.content).toContain('flex')
    })

    it('should generate horizontal layout structure', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Left',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
        {
          id: 'c2',
          name: 'Right',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.structure = 'horizontal'
      schema.layouts.desktop!.components = ['c1', 'c2']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const layoutFile = files.find((f) => f.path === 'app/page.tsx')

      expect(layoutFile).toBeDefined()
      expect(layoutFile!.content).toContain('className="flex"')
      expect(layoutFile!.content).toContain('<Left />')
      expect(layoutFile!.content).toContain('<Right />')
    })

    it('should generate custom layout structure', () => {
      const schema = createEmptySchema()
      schema.components = [
        {
          id: 'c1',
          name: 'Custom',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
        },
      ]
      schema.layouts.desktop!.structure = 'custom'
      schema.layouts.desktop!.components = ['c1']

      const pkg: GenerationPackage = {
        schema,
        prompt: 'test',
        options: {
          framework: 'react',
          cssSolution: 'tailwind',
        },
      }

      const files = exportToFiles(pkg)
      const layoutFile = files.find((f) => f.path === 'app/page.tsx')

      expect(layoutFile).toBeDefined()
      expect(layoutFile!.content).toContain('<Custom />')
    })
  })
})
