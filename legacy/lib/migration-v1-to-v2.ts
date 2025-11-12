/**
 * Schema V1 → V2 Migration
 *
 * V1 (grid-template-areas) → V2 (Component Independence)
 */

import type { LaydlerSchema } from "@/types/schema"
import type {
  LaydlerSchemaV2,
  Component as ComponentV2,
  ComponentPositioning,
  ComponentLayout,
  LayoutConfig,
} from "@/types/schema-v2"

/**
 * V1 Schema를 V2로 마이그레이션
 *
 * 완전한 자동 변환은 불가능하므로 최선의 추론(heuristics) 사용
 *
 * @example
 * const v2Schema = migrateV1ToV2(v1Schema)
 */
export function migrateV1ToV2(v1Schema: LaydlerSchema): LaydlerSchemaV2 {
  // 1. Breakpoints (V1의 gridCols/gridRows 유지)
  const breakpoints = v1Schema.breakpoints.map((bp) => ({
    name: bp.name,
    minWidth: bp.minWidth,
    gridCols: bp.gridCols,
    gridRows: bp.gridRows,
  }))

  // 2. Components (add V2 properties with defaults)
  const componentsV2: ComponentV2[] = v1Schema.components.map((comp) =>
    migrateComponent(comp, v1Schema)
  )

  // 3. Layouts (convert grid-template-areas to structure)
  const layouts: LaydlerSchemaV2["layouts"] = {
    mobile: { structure: "vertical", components: [] },
    tablet: { structure: "vertical", components: [] },
    desktop: { structure: "vertical", components: [] },
  }

  for (const breakpoint in v1Schema.layouts) {
    const v1Layout = v1Schema.layouts[breakpoint]
    layouts[breakpoint as keyof typeof layouts] = migrateLayout(v1Layout, v1Schema, breakpoint)
  }

  return {
    schemaVersion: "2.0",
    components: componentsV2,
    breakpoints,
    layouts,
  }
}

/**
 * Component V1 → V2 마이그레이션
 */
function migrateComponent(
  v1Comp: LaydlerSchema["components"][0],
  v1Schema: LaydlerSchema
): ComponentV2 {
  const { id, name, semanticTag, props } = v1Comp

  // Infer positioning from semantic tag and grid placement
  const positioning = inferPositioning(semanticTag, id, v1Schema)

  // Infer layout from semantic tag
  const layout = inferLayout(semanticTag)

  // Infer styling from semantic tag
  const styling = inferStyling(semanticTag)

  // Infer responsive behavior from layouts
  const responsive = inferResponsive(id, v1Schema)

  return {
    id,
    name,
    semanticTag,
    positioning,
    layout,
    styling,
    responsive,
    props,
  }
}

/**
 * Positioning 추론
 */
function inferPositioning(
  semanticTag: ComponentV2["semanticTag"],
  componentId: string,
  v1Schema: LaydlerSchema
): ComponentPositioning {
  // Semantic tag 기반 추론
  switch (semanticTag) {
    case "header":
      // Check if component is at the top of all layouts
      const isAlwaysTop = Object.values(v1Schema.layouts).every((layout) => {
        const firstRow = layout.grid.areas[0]
        return firstRow && firstRow.some((cell) => cell === componentId)
      })

      return {
        type: isAlwaysTop ? "sticky" : "static",
        position: isAlwaysTop ? { top: 0, zIndex: 50 } : undefined,
      }

    case "nav":
      return {
        type: "sticky",
        position: { top: "4rem", zIndex: 40 },
      }

    case "footer":
      return {
        type: "static",
      }

    default:
      return {
        type: "static",
      }
  }
}

/**
 * Layout 추론
 */
function inferLayout(semanticTag: ComponentV2["semanticTag"]): ComponentLayout {
  switch (semanticTag) {
    case "header":
    case "footer":
      return {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "1rem",
          centered: true,
        },
      }

    case "main":
      return {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      }

    case "nav":
    case "aside":
      return {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      }

    default:
      return {
        type: "flex",
        flex: {
          direction: "column",
        },
      }
  }
}

/**
 * Styling 추론
 */
function inferStyling(semanticTag: ComponentV2["semanticTag"]) {
  switch (semanticTag) {
    case "header":
      return {
        background: "white",
        border: "b",
        shadow: "sm",
      }

    case "footer":
      return {
        background: "gray-100",
        border: "t",
      }

    case "nav":
    case "aside":
      return {
        width: "16rem",
        background: "gray-50",
        border: "r",
      }

    case "main":
      return {
        className: "flex-1",
      }

    default:
      return undefined
  }
}

/**
 * Responsive behavior 추론
 */
function inferResponsive(
  componentId: string,
  v1Schema: LaydlerSchema
): ComponentV2["responsive"] {
  const visibility: Record<string, boolean> = {}

  // Check if component is present in each breakpoint's areas
  for (const breakpoint in v1Schema.layouts) {
    const layout = v1Schema.layouts[breakpoint]
    const isPresent = layout.grid.areas.some((row) =>
      row.some((cell) => cell === componentId)
    )

    visibility[breakpoint] = isPresent
  }

  // If component is hidden on mobile but visible on desktop, infer responsive
  if (!visibility.mobile && visibility.desktop) {
    return {
      mobile: {
        hidden: true,
      },
      tablet: {
        hidden: !visibility.tablet,
      },
      desktop: {
        hidden: false,
      },
    }
  }

  // If all breakpoints have the same visibility, no responsive needed
  const allSame = Object.values(visibility).every((v) => v === visibility.mobile)
  if (allSame) {
    return undefined
  }

  // Otherwise, generate responsive config
  return {
    mobile: {
      hidden: !visibility.mobile,
    },
    tablet: {
      hidden: !visibility.tablet,
    },
    desktop: {
      hidden: !visibility.desktop,
    },
  }
}

/**
 * Layout V1 → V2 마이그레이션
 */
function migrateLayout(
  v1Layout: LaydlerSchema["layouts"][string],
  v1Schema: LaydlerSchema,
  breakpoint: string
): LayoutConfig {
  const areas = v1Layout.grid.areas
  const componentsInLayout = extractComponentsFromAreas(areas)

  // Infer structure from areas
  const structure = inferStructure(areas, componentsInLayout, v1Schema)

  // Extract roles if sidebar-main structure
  const roles = structure === "sidebar-main"
    ? inferRoles(componentsInLayout, v1Schema)
    : undefined

  return {
    structure,
    components: componentsInLayout,
    roles,
  }
}

/**
 * Extract components from grid areas
 */
function extractComponentsFromAreas(areas: string[][]): string[] {
  const componentIds = new Set<string>()

  areas.forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell !== "") {
        componentIds.add(cell)
      }
    })
  })

  return Array.from(componentIds)
}

/**
 * Infer structure type from areas
 */
function inferStructure(
  areas: string[][],
  componentsInLayout: string[],
  v1Schema: LaydlerSchema
): LayoutConfig["structure"] {
  // Check if there's a header at the top
  const firstRow = areas[0]
  const hasHeader = firstRow && firstRow.every((cell) => cell === firstRow[0])

  // Check if there's a sidebar pattern
  const hasSidebar = areas.some((row) => {
    const firstCell = row[0]
    return firstCell && firstCell !== row[row.length - 1]
  })

  if (hasHeader && hasSidebar) {
    return "sidebar-main"
  }

  if (hasSidebar) {
    return "horizontal"
  }

  return "vertical"
}

/**
 * Infer roles (header, sidebar, main) from components
 */
function inferRoles(
  componentsInLayout: string[],
  v1Schema: LaydlerSchema
): LayoutConfig["roles"] {
  const roles: LayoutConfig["roles"] = {}

  componentsInLayout.forEach((id) => {
    const component = v1Schema.components.find((c) => c.id === id)
    if (!component) return

    switch (component.semanticTag) {
      case "header":
        roles.header = id
        break
      case "nav":
      case "aside":
        roles.sidebar = id
        break
      case "main":
        roles.main = id
        break
    }
  })

  return Object.keys(roles).length > 0 ? roles : undefined
}

/**
 * Validate migrated schema
 */
export function validateMigration(v2Schema: LaydlerSchemaV2): {
  valid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check for components without positioning
  v2Schema.components.forEach((comp) => {
    if (!comp.positioning) {
      warnings.push(`Component ${comp.name} has no positioning`)
    }
    if (!comp.layout) {
      warnings.push(`Component ${comp.name} has no layout`)
    }
  })

  // Check for layouts without components
  for (const breakpoint in v2Schema.layouts) {
    const layout = v2Schema.layouts[breakpoint as keyof typeof v2Schema.layouts]
    if (layout.components.length === 0) {
      warnings.push(`Layout ${breakpoint} has no components`)
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  }
}
