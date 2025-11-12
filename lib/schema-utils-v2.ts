/**
 * Schema V2 Utility Functions
 * Helper functions for working with Schema V2
 */

import type {
  LaydlerSchemaV2,
  Component,
  Breakpoint,
} from "@/types/schema-v2"

/**
 * Create an empty Schema V2
 */
export function createEmptySchemaV2(): LaydlerSchemaV2 {
  return {
    schemaVersion: "2.0",
    components: [],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
      { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
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
 * Deep clone Schema V2
 */
export function cloneSchemaV2(schema: LaydlerSchemaV2): LaydlerSchemaV2 {
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
 * Validate Schema V2
 * (Basic validation, full validation in schema-validation-v2.ts)
 */
export function isValidSchemaV2(schema: unknown): schema is LaydlerSchemaV2 {
  if (typeof schema !== "object" || schema === null) return false

  const s = schema as Partial<LaydlerSchemaV2>

  return (
    s.schemaVersion === "2.0" &&
    Array.isArray(s.components) &&
    Array.isArray(s.breakpoints) &&
    typeof s.layouts === "object" &&
    s.layouts !== null
  )
}

/**
 * Normalize Schema V2 with Breakpoint Inheritance
 *
 * Mobile-first cascade: Mobile → Tablet → Desktop
 * - 명시되지 않은 breakpoint는 이전 breakpoint 설정 자동 상속
 * - 명시적 override 시 cascade 끊김
 * - ResponsiveCanvasLayout도 동일하게 상속 처리
 *
 * @param schema - Original Schema V2
 * @returns Normalized Schema V2 with inherited values
 */
export function normalizeSchemaV2(schema: LaydlerSchemaV2): LaydlerSchemaV2 {
  const normalized = cloneSchemaV2(schema)

  // 1. Layout Inheritance: Mobile → Tablet → Desktop
  // Tablet이 명시되지 않으면 Mobile 복사
  if (!normalized.layouts.tablet ||
      normalized.layouts.tablet.components.length === 0) {
    normalized.layouts.tablet = {
      ...cloneSchemaV2(normalized.layouts.mobile),
    }
  }

  // Desktop이 명시되지 않으면 Tablet 복사
  if (!normalized.layouts.desktop ||
      normalized.layouts.desktop.components.length === 0) {
    normalized.layouts.desktop = {
      ...cloneSchemaV2(normalized.layouts.tablet),
    }
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

  return normalized
}
