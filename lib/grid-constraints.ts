/**
 * Grid Constraints - 동적 그리드 크기 제약 검증
 *
 * 2025년 모던 레이아웃 빌더 패턴을 적용한 컴포넌트 기반 그리드 제약 시스템
 * - Figma Auto Layout
 * - Webflow Grid System
 * - Framer Canvas Constraints
 */

import type { Component, CanvasLayout } from "@/types/schema"

/**
 * 그리드 크기 조정 검증 결과
 */
export interface GridResizeValidation {
  safe: boolean
  reason?: string
  affectedComponents?: {
    id: string
    name: string
    currentPosition: { x: number; y: number; width: number; height: number }
  }[]
  minimumRequired?: {
    rows: number
    cols: number
  }
}

/**
 * 현재 breakpoint에서 배치된 컴포넌트 기반 최소 그리드 크기 계산
 *
 * @param components - 배치된 컴포넌트 목록
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns 최소 rows와 cols
 *
 * @example
 * const { minRows, minCols } = calculateMinimumGridSize(components, "mobile")
 * // Footer가 (0, 10)부터 (12, 11)까지 차지 → minRows = 11, minCols = 12
 */
export function calculateMinimumGridSize(
  components: Component[],
  currentBreakpoint: string
): { minRows: number; minCols: number } {
  // 빈 캔버스: 기본 최소값
  if (components.length === 0) {
    return { minRows: 2, minCols: 2 }
  }

  let maxRowUsed = 0
  let maxColUsed = 0

  components.forEach((component) => {
    // 현재 breakpoint의 캔버스 레이아웃 가져오기
    const layout =
      component.responsiveCanvasLayout?.[currentBreakpoint] || component.canvasLayout

    if (layout) {
      // 컴포넌트가 차지하는 마지막 행/열 계산
      const rowEnd = layout.y + layout.height
      const colEnd = layout.x + layout.width

      maxRowUsed = Math.max(maxRowUsed, rowEnd)
      maxColUsed = Math.max(maxColUsed, colEnd)
    }
  })

  return {
    minRows: maxRowUsed,
    minCols: maxColUsed,
  }
}

/**
 * 그리드 크기 조정이 안전한지 검증
 *
 * @param newGridRows - 새로운 row 개수
 * @param newGridCols - 새로운 column 개수
 * @param components - 배치된 컴포넌트 목록
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns 검증 결과 객체
 *
 * @example
 * const validation = isGridResizeSafe(10, 12, components, "mobile")
 * if (!validation.safe) {
 *   console.warn(validation.reason)
 *   console.log("Affected components:", validation.affectedComponents)
 * }
 */
export function isGridResizeSafe(
  newGridRows: number,
  newGridCols: number,
  components: Component[],
  currentBreakpoint: string
): GridResizeValidation {
  const { minRows, minCols } = calculateMinimumGridSize(
    components,
    currentBreakpoint
  )

  // Row 검증
  if (newGridRows < minRows) {
    const affected = components
      .map((c) => {
        const layout =
          c.responsiveCanvasLayout?.[currentBreakpoint] || c.canvasLayout

        if (layout && layout.y + layout.height > newGridRows) {
          return {
            id: c.id,
            name: c.name,
            currentPosition: {
              x: layout.x,
              y: layout.y,
              width: layout.width,
              height: layout.height,
            },
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return {
      safe: false,
      reason: `Cannot reduce to ${newGridRows} rows: ${affected.length} component(s) will be clipped. Minimum required: ${minRows} rows`,
      affectedComponents: affected,
      minimumRequired: { rows: minRows, cols: minCols },
    }
  }

  // Column 검증
  if (newGridCols < minCols) {
    const affected = components
      .map((c) => {
        const layout =
          c.responsiveCanvasLayout?.[currentBreakpoint] || c.canvasLayout

        if (layout && layout.x + layout.width > newGridCols) {
          return {
            id: c.id,
            name: c.name,
            currentPosition: {
              x: layout.x,
              y: layout.y,
              width: layout.width,
              height: layout.height,
            },
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return {
      safe: false,
      reason: `Cannot reduce to ${newGridCols} columns: ${affected.length} component(s) will be clipped. Minimum required: ${minCols} columns`,
      affectedComponents: affected,
      minimumRequired: { rows: minRows, cols: minCols },
    }
  }

  // 안전: 모든 컴포넌트가 새 그리드 내에 위치
  return {
    safe: true,
    minimumRequired: { rows: minRows, cols: minCols },
  }
}

/**
 * 영향받는 컴포넌트 목록만 반환 (간단한 헬퍼)
 *
 * @param newGridRows - 새로운 row 개수
 * @param newGridCols - 새로운 column 개수
 * @param components - 배치된 컴포넌트 목록
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns 영향받는 컴포넌트 ID 배열
 */
export function getAffectedComponentIds(
  newGridRows: number,
  newGridCols: number,
  components: Component[],
  currentBreakpoint: string
): string[] {
  const validation = isGridResizeSafe(
    newGridRows,
    newGridCols,
    components,
    currentBreakpoint
  )

  return validation.affectedComponents?.map((c) => c.id) || []
}

/**
 * 빈 공간 압축 제안 (Auto-Compact)
 *
 * 현재 그리드에서 실제로 사용되지 않는 빈 행/열을 계산하여
 * 얼마나 축소할 수 있는지 제안
 *
 * @param components - 배치된 컴포넌트 목록
 * @param currentGridRows - 현재 row 개수
 * @param currentGridCols - 현재 column 개수
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns 축소 가능한 행/열 개수
 *
 * @example
 * const suggestion = suggestGridCompaction(components, 20, 12, "mobile")
 * if (suggestion.canReduceRows > 0) {
 *   console.log(`You can trim ${suggestion.canReduceRows} empty rows`)
 * }
 */
export function suggestGridCompaction(
  components: Component[],
  currentGridRows: number,
  currentGridCols: number,
  currentBreakpoint: string
): { canReduceRows: number; canReduceCols: number } {
  const { minRows, minCols } = calculateMinimumGridSize(
    components,
    currentBreakpoint
  )

  return {
    canReduceRows: Math.max(0, currentGridRows - minRows),
    canReduceCols: Math.max(0, currentGridCols - minCols),
  }
}

/**
 * 컴포넌트가 그리드 경계를 벗어났는지 확인
 *
 * @param component - 검사할 컴포넌트
 * @param gridRows - 현재 그리드 row 개수
 * @param gridCols - 현재 그리드 column 개수
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns true if out of bounds
 */
export function isComponentOutOfBounds(
  component: Component,
  gridRows: number,
  gridCols: number,
  currentBreakpoint: string
): boolean {
  const layout =
    component.responsiveCanvasLayout?.[
      currentBreakpoint
    ] || component.canvasLayout

  if (!layout) return false

  return (
    layout.x < 0 ||
    layout.y < 0 ||
    layout.x + layout.width > gridCols ||
    layout.y + layout.height > gridRows
  )
}
