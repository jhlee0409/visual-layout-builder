/**
 * Schema Utility Functions
 * Helper functions for working with Schema
 */

import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  LayoutConfig,
} from "@/types/schema"
import { sortComponentsByCanvasCoordinates } from "./canvas-sort-utils"

/**
 * Default Grid Configuration for each breakpoint type
 */
export const DEFAULT_GRID_CONFIG = {
  mobile: { gridCols: 4, gridRows: 8 },
  tablet: { gridCols: 8, gridRows: 8 },
  desktop: { gridCols: 12, gridRows: 8 },
  custom: { gridCols: 6, gridRows: 8 },
} as const

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
    layouts: {
      [breakpointType]: {
        structure: "vertical",
        components: [],
      },
    } as any, // Type assertion for dynamic key
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
 * Deep clone Schema
 */
export function cloneSchema(schema: LaydlerSchema): LaydlerSchema {
  return JSON.parse(JSON.stringify(schema))
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

  // 1. Layout Inheritance: Mobile → Tablet → Desktop
  // Tablet이 명시되지 않으면 Mobile 복사 (Mobile이 있는 경우에만)
  if ((!normalized.layouts.tablet ||
      normalized.layouts.tablet.components.length === 0) &&
      normalized.layouts.mobile) {
    normalized.layouts.tablet = JSON.parse(JSON.stringify(normalized.layouts.mobile))
  }

  // Desktop이 명시되지 않으면 Tablet 복사 (Tablet이 있는 경우에만)
  if ((!normalized.layouts.desktop ||
      normalized.layouts.desktop.components.length === 0) &&
      normalized.layouts.tablet) {
    normalized.layouts.desktop = JSON.parse(JSON.stringify(normalized.layouts.tablet))
  }

  // 2. Canvas Layout Inheritance per Component
  normalized.components = normalized.components.map(comp => {
    if (comp.responsiveCanvasLayout) {
      const rcl = { ...comp.responsiveCanvasLayout }

      // Mobile → Tablet
      if (!rcl.tablet && rcl.mobile) {
        rcl.tablet = { ...rcl.mobile }
      }

      // Tablet → Desktop (Tablet이 있으면 Tablet에서, 없으면 Mobile에서)
      if (!rcl.desktop) {
        if (rcl.tablet) {
          rcl.desktop = { ...rcl.tablet }
        } else if (rcl.mobile) {
          rcl.desktop = { ...rcl.mobile }
        }
      }

      return {
        ...comp,
        responsiveCanvasLayout: rcl,
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
      const hasCanvasData = normalized.components.some(
        comp => comp.responsiveCanvasLayout?.[breakpointName as keyof typeof comp.responsiveCanvasLayout]
      )

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

    const componentsWithCanvas = normalized.components
      .filter(comp => comp.responsiveCanvasLayout?.[breakpointName as keyof typeof comp.responsiveCanvasLayout])
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
