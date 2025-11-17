/**
 * Performance Regression Tests
 *
 * Ensures that core operations maintain acceptable performance characteristics
 * even with large schemas (target: < 100ms for 100 components)
 */

import { describe, it, expect } from 'vitest'
import { validateSchema } from '../schema-validation'
import { generatePrompt } from '../prompt-generator'
import { normalizeSchema } from '../schema-utils'
import { canvasToGridPositions, analyzeGridComplexity } from '../canvas-to-grid'
import { calculateLinkGroups, validateComponentLinks, type ComponentLink } from '../graph-utils'
import { createSchemaWithComponents } from './fixtures/test-schemas'
import type { LaydlerSchema, Component } from '@/types/schema'

/**
 * Measures execution time of a function in milliseconds
 */
function measureTime(fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}

/**
 * Runs a benchmark multiple times and returns statistics
 */
function benchmark(fn: () => void, runs: number = 5): { avg: number; min: number; max: number } {
  const times: number[] = []

  // Warmup run
  fn()

  // Actual measurements
  for (let i = 0; i < runs; i++) {
    times.push(measureTime(fn))
  }

  return {
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
  }
}

describe('Performance Regression Tests', () => {
  // ==========================================================================
  // Test 1: Schema Validation Performance
  // ==========================================================================
  describe('Schema Validation', () => {
    it('should validate 10 components in < 10ms', () => {
      const schema = createSchemaWithComponents(10)

      const time = measureTime(() => {
        validateSchema(schema)
      })

      expect(time).toBeLessThan(10)
    })

    it('should validate 50 components in < 30ms', () => {
      const schema = createSchemaWithComponents(50)

      const time = measureTime(() => {
        validateSchema(schema)
      })

      expect(time).toBeLessThan(30)
    })

    it('should validate 100 components in < 50ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        validateSchema(schema)
      }, 5)

      console.log(`  Validation (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(50)
    })
  })

  // ==========================================================================
  // Test 2: Prompt Generation Performance
  // ==========================================================================
  describe('Prompt Generation', () => {
    it('should generate prompt for 10 components in < 20ms', () => {
      const schema = createSchemaWithComponents(10)

      const time = measureTime(() => {
        generatePrompt(schema, 'react', 'tailwind')
      })

      expect(time).toBeLessThan(20)
    })

    it('should generate prompt for 50 components in < 50ms', () => {
      const schema = createSchemaWithComponents(50)

      const time = measureTime(() => {
        generatePrompt(schema, 'react', 'tailwind')
      })

      expect(time).toBeLessThan(50)
    })

    it('should generate prompt for 100 components in < 100ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        generatePrompt(schema, 'react', 'tailwind')
      }, 5)

      console.log(`  Prompt Generation (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(100)
    })
  })

  // ==========================================================================
  // Test 3: Schema Normalization Performance
  // ==========================================================================
  describe('Schema Normalization', () => {
    it('should normalize 10 components in < 5ms', () => {
      const schema = createSchemaWithComponents(10)

      const time = measureTime(() => {
        normalizeSchema(schema)
      })

      expect(time).toBeLessThan(5)
    })

    it('should normalize 50 components in < 20ms', () => {
      const schema = createSchemaWithComponents(50)

      const time = measureTime(() => {
        normalizeSchema(schema)
      })

      expect(time).toBeLessThan(20)
    })

    it('should normalize 100 components in < 40ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        normalizeSchema(schema)
      }, 5)

      console.log(`  Normalization (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(40)
    })
  })

  // ==========================================================================
  // Test 4: Canvas to Grid Conversion Performance
  // ==========================================================================
  describe('Canvas to Grid Conversion', () => {
    it('should convert 10 components canvas to grid in < 5ms', () => {
      const schema = createSchemaWithComponents(10)

      const time = measureTime(() => {
        canvasToGridPositions(schema.components, 'desktop', 12, 20)
      })

      expect(time).toBeLessThan(5)
    })

    it('should convert 50 components canvas to grid in < 15ms', () => {
      const schema = createSchemaWithComponents(50)

      const time = measureTime(() => {
        canvasToGridPositions(schema.components, 'desktop', 12, 20)
      })

      expect(time).toBeLessThan(15)
    })

    it('should convert 100 components canvas to grid in < 30ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        canvasToGridPositions(schema.components, 'desktop', 12, 20)
      }, 5)

      console.log(`  Canvas to Grid (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(30)
    })
  })

  // ==========================================================================
  // Test 5: Grid Complexity Analysis Performance
  // ==========================================================================
  describe('Grid Complexity Analysis', () => {
    it('should analyze 10 components grid complexity in < 5ms', () => {
      const schema = createSchemaWithComponents(10)

      const time = measureTime(() => {
        analyzeGridComplexity(schema.components, 'desktop')
      })

      expect(time).toBeLessThan(5)
    })

    it('should analyze 50 components grid complexity in < 15ms', () => {
      const schema = createSchemaWithComponents(50)

      const time = measureTime(() => {
        analyzeGridComplexity(schema.components, 'desktop')
      })

      expect(time).toBeLessThan(15)
    })

    it('should analyze 100 components grid complexity in < 30ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        analyzeGridComplexity(schema.components, 'desktop')
      }, 5)

      console.log(`  Grid Complexity (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(30)
    })
  })

  // ==========================================================================
  // Test 6: Component Linking Graph Algorithms Performance
  // ==========================================================================
  describe('Component Linking Graph Algorithms', () => {
    it('should calculate link groups for 10 components in < 5ms', () => {
      // Create a chain: c1→c2→c3→...→c10
      const links: ComponentLink[] = Array.from({ length: 9 }, (_, i) => ({
        source: `c${i + 1}`,
        target: `c${i + 2}`,
      }))

      const time = measureTime(() => {
        calculateLinkGroups(links)
      })

      // Increased threshold to 5ms to account for CI environment variability
      // Actual performance typically < 2ms, but CI can have timing fluctuations
      expect(time).toBeLessThan(5)
    })

    it('should calculate link groups for 50 components in < 10ms', () => {
      // Create 10 groups of 5 components each
      const links: ComponentLink[] = []
      for (let group = 0; group < 10; group++) {
        for (let i = 0; i < 4; i++) {
          const sourceIdx = group * 5 + i + 1
          const targetIdx = group * 5 + i + 2
          links.push({
            source: `c${sourceIdx}`,
            target: `c${targetIdx}`,
          })
        }
      }

      const time = measureTime(() => {
        calculateLinkGroups(links)
      })

      expect(time).toBeLessThan(10)
    })

    it('should calculate link groups for 100 components in < 20ms', () => {
      // Create 20 groups of 5 components each
      const links: ComponentLink[] = []
      for (let group = 0; group < 20; group++) {
        for (let i = 0; i < 4; i++) {
          const sourceIdx = group * 5 + i + 1
          const targetIdx = group * 5 + i + 2
          links.push({
            source: `c${sourceIdx}`,
            target: `c${targetIdx}`,
          })
        }
      }

      const stats = benchmark(() => {
        calculateLinkGroups(links)
      }, 5)

      console.log(`  Link Groups (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(20)
    })

    it('should validate component links for 100 components in < 10ms', () => {
      const componentIds = Array.from({ length: 100 }, (_, i) => `c${i + 1}`)
      // Create 20 groups of 5 components each
      const links: ComponentLink[] = []
      for (let group = 0; group < 20; group++) {
        for (let i = 0; i < 4; i++) {
          const sourceIdx = group * 5 + i + 1
          const targetIdx = group * 5 + i + 2
          links.push({
            source: `c${sourceIdx}`,
            target: `c${targetIdx}`,
          })
        }
      }

      const stats = benchmark(() => {
        validateComponentLinks(links, new Set(componentIds))
      }, 5)

      console.log(`  Link Validation (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(10)
    })
  })

  // ==========================================================================
  // Test 7: End-to-End Performance (Combined Operations)
  // ==========================================================================
  describe('End-to-End Performance', () => {
    it('should handle complete workflow for 100 components in < 150ms', () => {
      const schema = createSchemaWithComponents(100)

      const stats = benchmark(() => {
        // Complete workflow: normalize → validate → generate prompt
        const normalized = normalizeSchema(schema)
        const validation = validateSchema(normalized)
        if (validation.valid) {
          generatePrompt(normalized, 'react', 'tailwind')
        }
      }, 5)

      console.log(`  E2E Workflow (100 components): avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`)

      expect(stats.avg).toBeLessThan(150)
    })

    it('should handle increasing component counts efficiently', () => {
      // Test that we can handle significantly larger schemas without issues
      const sizes = [50, 100, 200]
      const times: Record<number, number> = {}

      sizes.forEach(size => {
        const schema = createSchemaWithComponents(size)
        const time = measureTime(() => {
          const normalized = normalizeSchema(schema)
          const validation = validateSchema(normalized)
          if (validation.valid) {
            generatePrompt(normalized, 'react', 'tailwind')
          }
        })
        times[size] = time
      })

      // All sizes should complete quickly (no exponential blowup)
      expect(times[50]).toBeLessThan(10)
      expect(times[100]).toBeLessThan(20)
      expect(times[200]).toBeLessThan(50)

      console.log(`  Scaling: 50→${times[50].toFixed(2)}ms, 100→${times[100].toFixed(2)}ms, 200→${times[200].toFixed(2)}ms`)
    })
  })
})
