/**
 * Canvas Coordinate Sorting Utilities
 *
 * 공통 정렬 로직을 추출하여 코드 중복 제거 및 성능 최적화
 * - schema-utils.ts와 prompt-templates.ts에서 사용
 * - Map 기반으로 O(n²) → O(n log n) 성능 개선
 *
 * Issue: PR #10 코멘트 - Code duplication and performance concerns
 */

import type { Component } from "@/types/schema"

/**
 * Sort component IDs by Canvas coordinates (top-to-bottom, left-to-right)
 *
 * @param componentIds - Array of component IDs to sort
 * @param components - Full component array (for looking up Canvas layouts)
 * @param breakpoint - Target breakpoint name
 * @returns Sorted component IDs array
 *
 * @performance
 * - O(n) for Map creation
 * - O(n log n) for sorting (vs. O(n²) with Array.find)
 * - Total: O(n log n)
 *
 * @example
 * const sorted = sortComponentsByCanvasCoordinates(
 *   ['c3', 'c1', 'c2'],
 *   schema.components,
 *   'desktop'
 * )
 * // Returns: ['c1', 'c2', 'c3'] (assuming c1 is top, c2 middle, c3 bottom)
 */
export function sortComponentsByCanvasCoordinates(
  componentIds: string[],
  components: Component[],
  breakpoint: string
): string[] {
  // Performance: Create Map for O(1) lookups instead of O(n) find()
  const componentMap = new Map(components.map((c) => [c.id, c]))

  return [...componentIds].sort((a, b) => {
    const compA = componentMap.get(a)
    const compB = componentMap.get(b)

    if (!compA || !compB) return 0

    const layoutA =
      compA.responsiveCanvasLayout?.[
        breakpoint as keyof typeof compA.responsiveCanvasLayout
      ] || compA.canvasLayout
    const layoutB =
      compB.responsiveCanvasLayout?.[
        breakpoint as keyof typeof compB.responsiveCanvasLayout
      ] || compB.canvasLayout

    // If both have Canvas layout, sort by Y (top to bottom) then X (left to right)
    if (layoutA && layoutB) {
      if (layoutA.y !== layoutB.y) {
        return layoutA.y - layoutB.y // Top to bottom
      }
      return layoutA.x - layoutB.x // Left to right
    }

    // If only one has Canvas layout, prioritize it
    if (layoutA) return -1
    if (layoutB) return 1

    // Neither has Canvas layout, keep original order
    return 0
  })
}

/**
 * Get Canvas layout for a component at specific breakpoint
 *
 * Helper function to safely extract Canvas layout
 * Checks responsiveCanvasLayout first, then falls back to canvasLayout
 *
 * @param component - Component to get layout from
 * @param breakpoint - Target breakpoint name
 * @returns Canvas layout or undefined
 */
export function getComponentCanvasLayout(
  component: Component,
  breakpoint: string
) {
  return (
    component.responsiveCanvasLayout?.[
      breakpoint as keyof typeof component.responsiveCanvasLayout
    ] || component.canvasLayout
  )
}
