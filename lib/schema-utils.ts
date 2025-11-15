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
 * **Dynamic Breakpoint Support**: This configuration supports unlimited custom breakpoint names.
 * Only predefined breakpoints (mobile, tablet, desktop, custom) have specific grid sizes.
 *
 * @example
 * ```typescript
 * // Predefined breakpoints (known grid sizes)
 * DEFAULT_GRID_CONFIG['mobile']    // { gridCols: 4, gridRows: 8 }
 * DEFAULT_GRID_CONFIG['tablet']    // { gridCols: 8, gridRows: 8 }
 * DEFAULT_GRID_CONFIG['desktop']   // { gridCols: 12, gridRows: 8 }
 * DEFAULT_GRID_CONFIG['custom']    // { gridCols: 6, gridRows: 8 }
 *
 * // Custom breakpoints (fallback to 12×8)
 * DEFAULT_GRID_CONFIG['laptop']    // undefined → fallback to 12×8
 * DEFAULT_GRID_CONFIG['ultrawide'] // undefined → fallback to 12×8
 * DEFAULT_GRID_CONFIG['4k']        // undefined → fallback to 12×8
 * ```
 *
 * **Usage Pattern**:
 * ```typescript
 * const gridCols = DEFAULT_GRID_CONFIG[breakpointName]?.gridCols ?? 12  // fallback
 * const gridRows = DEFAULT_GRID_CONFIG[breakpointName]?.gridRows ?? 8   // fallback
 * ```
 *
 * **Why Fallback?**
 * Custom breakpoints are user-defined and can have any name (laptop, ultrawide, my-bp, etc.).
 * The 12×8 fallback provides a sensible default for flexibility while maintaining consistency.
 *
 * @see {@link GRID_CONSTRAINTS} for min/max grid size limits
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

  // REMOVED: Layout inheritance (Section 1)
  // REMOVED: Canvas layout inheritance (Section 2)
  //
  // User requirement: Complete breakpoint independence
  // - DnD to Mobile → Component appears ONLY in Mobile breakpoint
  // - DnD to Tablet → Component appears ONLY in Tablet breakpoint
  // - No automatic inheritance of layouts or Canvas positions across breakpoints
  // - Each breakpoint is completely isolated

  // Sort breakpoints by minWidth for deterministic ordering
  const sortedBreakpoints = [...normalized.breakpoints].sort((a, b) => {
    // Primary sort: by minWidth
    if (a.minWidth !== b.minWidth) {
      return a.minWidth - b.minWidth
    }
    // Secondary sort: by name (alphabetically) for deterministic ordering
    return a.name.localeCompare(b.name)
  })

  // Apply sorted breakpoints
  normalized.breakpoints = sortedBreakpoints

  // Auto-create missing layouts for breakpoints (if needed)
  // IMPORTANT: Do NOT inherit or auto-sync
  // User adds components manually via DnD to each breakpoint independently

  for (const breakpoint of sortedBreakpoints) {
    const breakpointName = breakpoint.name

    // Only auto-create layout if it doesn't exist at all
    if (!normalized.layouts[breakpointName]) {
      normalized.layouts[breakpointName] = {
        structure: 'vertical',
        components: [],  // Always empty - user adds components manually
      } as LayoutConfig
    }
  }

  return normalized
}
