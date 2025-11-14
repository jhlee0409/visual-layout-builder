/**
 * Canvas Utilities
 *
 * Canvas Grid 관련 공통 유틸리티 함수
 * - Component grouping by row
 * - Canvas layout extraction
 * - Type-safe breakpoint access
 */

import type { Component } from "@/types/schema"

/**
 * Get Canvas layout for a component at a specific breakpoint
 *
 * @param component - Component to get layout from
 * @param breakpoint - Target breakpoint name
 * @returns Canvas layout or undefined if not found
 *
 * @example
 * const layout = getCanvasLayoutForBreakpoint(component, 'desktop')
 * if (layout) {
 *   console.log(layout.x, layout.y, layout.width, layout.height)
 * }
 */
export function getCanvasLayoutForBreakpoint(
  component: Component,
  breakpoint: string
): { x: number; y: number; width: number; height: number } | undefined {
  // Try responsiveCanvasLayout first
  if (component.responsiveCanvasLayout) {
    const responsiveLayout =
      component.responsiveCanvasLayout[breakpoint]
    if (responsiveLayout) {
      return responsiveLayout
    }
  }

  // Fall back to canvasLayout
  return component.canvasLayout
}

/**
 * Row group interface
 */
export interface RowGroup {
  rowRange: number[]
  components: Component[]
}

/**
 * Group components by their starting row position
 *
 * Components in the same row are grouped together and sorted by x position.
 * Consecutive rows spanned by components are merged into a rowRange.
 *
 * @param components - Components to group
 * @param breakpoint - Target breakpoint name
 * @returns Array of row groups
 *
 * @example
 * const groups = groupComponentsByRow(components, 'desktop')
 * // [
 * //   { rowRange: [0], components: [Header] },
 * //   { rowRange: [1,2,3], components: [Sidebar, Main] }
 * // ]
 */
export function groupComponentsByRow(
  components: Component[],
  breakpoint: string
): RowGroup[] {
  const rowMap = new Map<number, Component[]>()

  // Group components by their starting row
  components.forEach((comp) => {
    const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)
    if (!layout) return

    const startRow = layout.y
    if (!rowMap.has(startRow)) {
      rowMap.set(startRow, [])
    }
    rowMap.get(startRow)!.push(comp)
  })

  // Sort by row and create groups
  const groups: RowGroup[] = []
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b)

  sortedRows.forEach((row) => {
    const comps = rowMap.get(row)!.sort((a, b) => {
      const aLayout = getCanvasLayoutForBreakpoint(a, breakpoint)!
      const bLayout = getCanvasLayoutForBreakpoint(b, breakpoint)!
      return aLayout.x - bLayout.x
    })

    // Calculate row span range
    const maxHeight = Math.max(
      ...comps.map((c) => {
        const layout = getCanvasLayoutForBreakpoint(c, breakpoint)!
        return layout.height
      })
    )

    const rowRange = Array.from({ length: maxHeight }, (_, i) => row + i)

    groups.push({
      rowRange,
      components: comps,
    })
  })

  return groups
}

/**
 * Filter components that have Canvas layout for a specific breakpoint
 *
 * @param components - Components to filter
 * @param breakpoint - Target breakpoint name
 * @returns Components with Canvas layout
 *
 * @example
 * const validComponents = filterComponentsWithCanvasLayout(allComponents, 'desktop')
 */
export function filterComponentsWithCanvasLayout(
  components: Component[],
  breakpoint: string
): Component[] {
  return components.filter((comp) => {
    const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)
    return layout !== undefined
  })
}

/**
 * Check if component has Canvas layout for a specific breakpoint
 *
 * @param component - Component to check
 * @param breakpoint - Target breakpoint name (optional, checks any if not provided)
 * @returns True if component has Canvas layout
 *
 * @example
 * if (hasCanvasLayout(component, 'desktop')) {
 *   // Component has desktop Canvas layout
 * }
 *
 * if (hasCanvasLayout(component)) {
 *   // Component has Canvas layout for at least one breakpoint
 * }
 */
export function hasCanvasLayout(
  component: Component,
  breakpoint?: string
): boolean {
  if (breakpoint) {
    return getCanvasLayoutForBreakpoint(component, breakpoint) !== undefined
  }

  // Check if has any Canvas layout
  return (
    component.canvasLayout !== undefined ||
    (component.responsiveCanvasLayout !== undefined &&
      Object.keys(component.responsiveCanvasLayout).length > 0)
  )
}
