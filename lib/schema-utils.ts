/**
 * Schema Utility Functions
 * Helper functions for working with Schema
 */

import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  LayoutConfig,
  CanvasLayout,
  ResponsiveCanvasLayout,
} from "@/types/schema"
import { sortComponentsByCanvasCoordinates } from "./canvas-sort-utils"

/**
 * Default Grid Configuration for common breakpoint types
 *
 * Supports dynamic breakpoint names - these are just defaults.
 * Any custom breakpoint name will fall back to 12x8 grid.
 */
export const DEFAULT_GRID_CONFIG: Record<string, { gridCols: number; gridRows: number }> = {
  mobile: { gridCols: 4, gridRows: 8 },
  tablet: { gridCols: 8, gridRows: 8 },
  desktop: { gridCols: 12, gridRows: 8 },
  custom: { gridCols: 6, gridRows: 8 },
}

/**
 * Grid size constraints
 */
export const GRID_CONSTRAINTS = {
  minCols: 2,
  minRows: 2,
  maxCols: 24,
  maxRows: 24,
} as const

/**
 * Create an empty Schema with all breakpoints
 */
export function createEmptySchema(): LaydlerSchema {
  return {
    schemaVersion: "2.0",
    components: [],
    breakpoints: [
      { name: "mobile", minWidth: 0, ...DEFAULT_GRID_CONFIG.mobile },
      { name: "tablet", minWidth: 768, ...DEFAULT_GRID_CONFIG.tablet },
      { name: "desktop", minWidth: 1024, ...DEFAULT_GRID_CONFIG.desktop },
    ],
    layouts: {
      mobile: {
        structure: "vertical",
        components: [],
      },
      tablet: {
        structure: "vertical",
        components: [],
      },
      desktop: {
        structure: "vertical",
        components: [],
      },
    },
  }
}

/**
 * Create Schema with a single breakpoint
 */
export function createSchemaWithBreakpoint(
  breakpointType: "mobile" | "tablet" | "desktop"
): LaydlerSchema {
  const minWidthMap = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  }

  const layouts: Record<string, LayoutConfig> = {
    [breakpointType]: {
      structure: "vertical",
      components: [],
    },
  }

  return {
    schemaVersion: "2.0",
    components: [],
    breakpoints: [
      {
        name: breakpointType,
        minWidth: minWidthMap[breakpointType],
        ...DEFAULT_GRID_CONFIG[breakpointType],
      },
    ],
    layouts,
  }
}

/**
 * Generate next component ID
 */
export function generateComponentId(existingComponents: Component[]): string {
  const maxId = existingComponents.reduce((max, component) => {
    const match = component.id.match(/^c(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 0)

  return `c${maxId + 1}`
}

/**
 * Safe deep clone helper (generic)
 *
 * Uses structuredClone() with fallback to JSON serialization
 */
function safeDeepClone<T>(data: T): T {
  try {
    return structuredClone(data)
  } catch (error) {
    // Fallback: JSON serialization (loses functions, Date becomes string, etc.)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('structuredClone failed, falling back to JSON serialization:', error)
    }
    return JSON.parse(JSON.stringify(data))
  }
}

/**
 * Deep clone Schema
 *
 * Uses structuredClone() for efficient deep cloning (available in Node 17+)
 * - More performant than JSON.parse(JSON.stringify())
 * - Preserves more types (Date, Map, Set, etc.)
 * - Handles circular references
 *
 * Falls back to JSON serialization if structuredClone fails
 * (e.g., for non-serializable data like functions, DOM nodes, symbols)
 */
export function cloneSchema(schema: LaydlerSchema): LaydlerSchema {
  return safeDeepClone(schema)
}

/**
 * Get default component data for a semantic tag
 */
export function getDefaultComponentData(
  semanticTag: Component["semanticTag"]
): Omit<Component, "id"> {
  const defaults: Record<Component["semanticTag"], Omit<Component, "id">> = {
    header: {
      name: "Header",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 },
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "1rem",
          centered: true,
        },
      },
      styling: {
        background: "white",
        border: "b",
        shadow: "sm",
      },
    },
    nav: {
      name: "Sidebar",
      semanticTag: "nav",
      positioning: {
        type: "sticky",
        position: { top: "4rem", zIndex: 40 },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        width: "16rem",
        background: "gray-50",
        border: "r",
      },
      responsive: {
        mobile: {
          hidden: true,
        },
        tablet: {
          hidden: true,
        },
        desktop: {
          hidden: false,
        },
      },
    },
    main: {
      name: "Main",
      semanticTag: "main",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      },
      styling: {
        className: "flex-1",
      },
    },
    aside: {
      name: "Aside",
      semanticTag: "aside",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        width: "16rem",
        background: "gray-50",
      },
    },
    footer: {
      name: "Footer",
      semanticTag: "footer",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "2rem",
          centered: true,
        },
      },
      styling: {
        background: "gray-100",
        border: "t",
      },
    },
    section: {
      name: "Section",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      },
    },
    article: {
      name: "Article",
      semanticTag: "article",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
    },
    div: {
      name: "Container",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
        },
      },
    },
    form: {
      name: "Form",
      semanticTag: "form",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "max-w-md p-6 bg-white rounded-lg shadow",
      },
    },
  }

  return defaults[semanticTag]
}

/**
 * Validate Schema
 * (Basic validation, full validation in schema-validation.ts)
 */
export function isValidSchema(schema: unknown): schema is LaydlerSchema {
  if (typeof schema !== "object" || schema === null) return false

  const s = schema as Partial<LaydlerSchema>

  return (
    s.schemaVersion === "2.0" &&
    Array.isArray(s.components) &&
    Array.isArray(s.breakpoints) &&
    typeof s.layouts === "object" &&
    s.layouts !== null
  )
}

/**
 * Normalize Schema with Breakpoint Inheritance
 *
 * Mobile-first cascade: Mobile → Tablet → Desktop
 * - 명시되지 않은 breakpoint는 이전 breakpoint 설정 자동 상속
 * - 명시적 override 시 cascade 끊김
 * - ResponsiveCanvasLayout도 동일하게 상속 처리
 *
 * @param schema - Original Schema
 * @returns Normalized Schema with inherited values
 */
export function normalizeSchema(schema: LaydlerSchema): LaydlerSchema {
  const normalized = cloneSchema(schema)

  // 1. Layout Inheritance: Dynamic breakpoint cascade (Mobile → Tablet → Desktop, etc.)
  // Support any breakpoint names (not just hardcoded mobile/tablet/desktop)
  // FIX: Previously hardcoded .mobile, .tablet, .desktop failed for custom names like "Desktop" (capital D)
  // EDGE CASE FIX: Deterministic sorting when multiple breakpoints have same minWidth
  const sortedBreakpoints = [...normalized.breakpoints].sort((a, b) => {
    // Primary sort: by minWidth
    if (a.minWidth !== b.minWidth) {
      return a.minWidth - b.minWidth
    }
    // Secondary sort: by name (alphabetically) for deterministic ordering
    return a.name.localeCompare(b.name)
  })

  for (let i = 1; i < sortedBreakpoints.length; i++) {
    const currentBP = sortedBreakpoints[i].name
    const previousBP = sortedBreakpoints[i - 1].name

    // Only inherit if layout is completely missing (not just empty)
    // Edge case fix: Don't inherit if layout exists but is intentionally empty (components.length === 0)
    // - Missing layout (!normalized.layouts[currentBP]) → INHERIT from previous
    // - Empty layout (components.length === 0) → PRESERVE as intentionally empty
    if (!normalized.layouts[currentBP] && normalized.layouts[previousBP]) {
      normalized.layouts[currentBP] = safeDeepClone(normalized.layouts[previousBP])
    }
  }

  // 2. Canvas Layout Inheritance per Component
  // FIX: Support dynamic breakpoint names (not just mobile/tablet/desktop)
  normalized.components = normalized.components.map(comp => {
    if (comp.responsiveCanvasLayout) {
      // Type-safe dynamic key access using Record type
      const rcl: Record<string, CanvasLayout | undefined> = { ...comp.responsiveCanvasLayout }

      // Cascade from previous breakpoint to next (based on minWidth sorting)
      for (let i = 1; i < sortedBreakpoints.length; i++) {
        const currentBP = sortedBreakpoints[i].name
        const previousBP = sortedBreakpoints[i - 1].name

        // If current breakpoint has no Canvas layout, inherit from previous
        if (!rcl[currentBP]) {
          const previousLayout = rcl[previousBP]
          if (previousLayout) {
            rcl[currentBP] = { ...previousLayout }
          }
        }
      }

      return {
        ...comp,
        responsiveCanvasLayout: rcl as ResponsiveCanvasLayout,
      }
    }

    return comp
  })

  // 3. Sync layouts[breakpoint].components with Canvas layouts
  // Canvas layout이 있는 컴포넌트를 자동으로 layouts[breakpoint].components에 추가
  // 이렇게 하면 Desktop으로 시작 → Mobile 추가 → Mobile Canvas 배치 시
  // layouts.mobile.components가 자동으로 업데이트됨

  // FIX: Use dynamic breakpoint names from schema.breakpoints instead of hardcoded values
  // This supports custom breakpoint names beyond 'mobile', 'tablet', 'desktop'
  for (const breakpoint of normalized.breakpoints) {
    const breakpointName = breakpoint.name

    // Edge Case: Auto-create layout if it doesn't exist but components have Canvas data
    if (!normalized.layouts[breakpointName]) {
      // Type-safe dynamic key access using helper function
      const hasCanvasData = normalized.components.some(comp => {
        const rcl = comp.responsiveCanvasLayout as Record<string, CanvasLayout | undefined> | undefined
        return rcl?.[breakpointName] !== undefined
      })

      if (hasCanvasData) {
        // Auto-create missing layout
        normalized.layouts[breakpointName] = {
          structure: 'vertical',
          components: [],
        } as LayoutConfig
      } else {
        // Skip this breakpoint if no Canvas data and no layout
        continue
      }
    }

    // Type-safe filtering using Record type
    const componentsWithCanvas = normalized.components
      .filter(comp => {
        const rcl = comp.responsiveCanvasLayout as Record<string, CanvasLayout | undefined> | undefined
        return rcl?.[breakpointName] !== undefined
      })
      .map(comp => comp.id)

    // 기존 components와 Canvas components를 합침 (중복 제거)
    const existingComponents = normalized.layouts[breakpointName].components
    const allComponents = new Set([...existingComponents, ...componentsWithCanvas])

    // Performance: Use shared utility function with Map-based O(n log n) sorting
    // Previous implementation: O(n²) due to Array.find() in sort comparator
    const sortedComponents = sortComponentsByCanvasCoordinates(
      Array.from(allComponents),
      normalized.components,
      breakpointName
    )

    normalized.layouts[breakpointName].components = sortedComponents
  }

  return normalized
}
