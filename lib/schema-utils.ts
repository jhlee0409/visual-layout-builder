/**
 * Schema utility functions
 * Helper functions for working with Laylder schemas
 */

import type { LaydlerSchema, Component, Breakpoint } from "@/types/schema"

/**
 * Generate next component ID
 * @param components - Existing components array
 * @returns Next available component ID (e.g., "c5" if c1-c4 exist)
 */
export function generateComponentId(components: Component[]): string {
  if (components.length === 0) return "c1"

  const ids = components.map((c) => {
    const match = c.id.match(/^c(\d+)$/)
    return match ? parseInt(match[1], 10) : 0
  })

  const maxId = Math.max(...ids)
  return `c${maxId + 1}`
}

/**
 * Create empty grid layout
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Empty grid layout with default values
 */
export function createEmptyGrid(rows: number = 3, cols: number = 1) {
  return {
    rows: Array(rows).fill("1fr").join(" "),
    columns: Array(cols).fill("1fr").join(" "),
    areas: Array(rows)
      .fill(null)
      .map(() => Array(cols).fill("")),
  }
}

/**
 * Create default breakpoints
 * @returns Standard mobile/tablet/desktop breakpoints with grid sizes
 */
export function createDefaultBreakpoints(): Breakpoint[] {
  return [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ]
}

/**
 * Create empty Laylder schema
 * @returns Minimal valid schema with no components
 */
export function createEmptySchema(): LaydlerSchema {
  const breakpoints = createDefaultBreakpoints()

  return {
    schemaVersion: "1.1",
    components: [],
    breakpoints,
    layouts: {
      mobile: { grid: createEmptyGrid(1, 1) },
      tablet: { grid: createEmptyGrid(1, 1) },
      desktop: { grid: createEmptyGrid(1, 1) },
    },
  }
}

/**
 * Get all component IDs used in a layout
 * @param schema - Laylder schema
 * @param breakpointName - Breakpoint to check
 * @returns Set of component IDs used in the layout
 */
export function getUsedComponentIds(
  schema: LaydlerSchema,
  breakpointName: string
): Set<string> {
  const layout = schema.layouts[breakpointName]
  if (!layout) return new Set()

  const usedIds = new Set<string>()
  layout.grid.areas.forEach((row) => {
    row.forEach((id) => {
      if (id) usedIds.add(id)
    })
  })

  return usedIds
}

/**
 * Check if a component is visible at a breakpoint
 * @param schema - Laylder schema
 * @param componentId - Component ID to check
 * @param breakpointName - Breakpoint name
 * @returns true if component is used in the layout
 */
export function isComponentVisible(
  schema: LaydlerSchema,
  componentId: string,
  breakpointName: string
): boolean {
  const usedIds = getUsedComponentIds(schema, breakpointName)
  return usedIds.has(componentId)
}

/**
 * Get component visibility across all breakpoints
 * @param schema - Laylder schema
 * @param componentId - Component ID to check
 * @returns Object mapping breakpoint names to visibility
 */
export function getComponentVisibility(
  schema: LaydlerSchema,
  componentId: string
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {}

  for (const breakpointName of Object.keys(schema.layouts)) {
    visibility[breakpointName] = isComponentVisible(
      schema,
      componentId,
      breakpointName
    )
  }

  return visibility
}

/**
 * Export schema as JSON string
 * @param schema - Laylder schema
 * @param pretty - Whether to format with indentation
 * @returns JSON string
 */
export function exportSchemaAsJSON(
  schema: LaydlerSchema,
  pretty: boolean = true
): string {
  return JSON.stringify(schema, null, pretty ? 2 : 0)
}

/**
 * Parse JSON string to schema
 * @param json - JSON string
 * @returns Parsed schema (unvalidated)
 */
export function parseSchemaFromJSON(json: string): LaydlerSchema {
  return JSON.parse(json) as LaydlerSchema
}

/**
 * Clone schema (deep copy)
 * @param schema - Schema to clone
 * @returns Deep copy of schema
 */
export function cloneSchema(schema: LaydlerSchema): LaydlerSchema {
  return JSON.parse(JSON.stringify(schema))
}

/**
 * Get grid dimensions
 * @param areas - Grid areas array
 * @returns Object with rows and columns count
 */
export function getGridDimensions(areas: string[][]) {
  return {
    rows: areas.length,
    cols: areas.length > 0 ? areas[0].length : 0,
  }
}

/**
 * Validate grid areas structure
 * Ensures all rows have the same number of columns
 * @param areas - Grid areas to validate
 * @returns true if valid, false otherwise
 */
export function isValidGridStructure(areas: string[][]): boolean {
  if (areas.length === 0) return false

  const firstRowLength = areas[0].length
  return areas.every((row) => row.length === firstRowLength)
}
