/**
 * Smart Layout - Positioning-aware Canvas Layout Calculator
 *
 * 2025년 최신 웹 레이아웃 패턴 기반으로 컴포넌트를 스마트하게 배치
 *
 * 설계 원칙:
 * 1. Semantic Tag 기반 배치 (header → 최상단, footer → 최하단)
 * 2. Positioning Type 고려 (sticky/fixed → 화면 끝단)
 * 3. 실제 프로덕션 레이아웃 패턴 반영
 * 4. Collision 방지 및 빈 공간 최적화
 */

import type { Component, SemanticTag, CanvasLayout } from "@/types/schema"
import type { ComponentTemplate } from "@/lib/component-library"

/**
 * Smart Position 계산 결과
 */
export interface SmartPosition {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 컴포넌트의 semanticTag와 positioning을 기반으로 스마트 배치 계산
 *
 * @param template - 컴포넌트 템플릿
 * @param gridCols - 그리드 열 개수
 * @param gridRows - 그리드 행 개수
 * @param existingComponents - 현재 breakpoint의 기존 컴포넌트 목록
 * @param currentBreakpoint - 현재 breakpoint 이름
 * @returns 스마트 배치 위치 및 크기
 */
export function calculateSmartPosition(
  template: ComponentTemplate,
  gridCols: number,
  gridRows: number,
  existingComponents: Component[],
  currentBreakpoint: string
): SmartPosition {
  const { semanticTag, positioning } = template.template

  // 1. Header (sticky/fixed) → 최상단, 전체 너비
  if (semanticTag === "header") {
    return {
      x: 0,
      y: 0,
      width: gridCols,
      height: 1,
    }
  }

  // 2. Footer (static) → 최하단, 전체 너비
  if (semanticTag === "footer") {
    return {
      x: 0,
      y: Math.max(0, gridRows - 1),
      width: gridCols,
      height: 1,
    }
  }

  // 3. Nav → 최상단 (header와 유사)
  // Note: Semantic tag를 신뢰하고 positioning type은 체크하지 않음 (일관성)
  if (semanticTag === "nav") {
    // Header가 이미 있으면 그 아래, 없으면 최상단
    const hasHeader = existingComponents.some((c) => c.semanticTag === "header")

    return {
      x: 0,
      y: hasHeader ? 1 : 0,
      width: gridCols,
      height: 1,
    }
  }

  // 4. Sidebar (aside) → 좌측 또는 우측
  if (semanticTag === "aside") {
    // Header 존재 여부 확인
    const hasHeader = existingComponents.some((c) => c.semanticTag === "header")
    const hasNav = existingComponents.some((c) => c.semanticTag === "nav")
    const topOffset = hasHeader || hasNav ? 1 : 0

    // 좌측에 이미 sidebar가 있는지 확인
    const hasLeftSidebar = existingComponents.some((c) => {
      const layout = getComponentCanvasLayout(c, currentBreakpoint)
      return c.semanticTag === "aside" && layout && layout.x === 0
    })

    const sidebarWidth = Math.min(3, Math.floor(gridCols / 4)) // 전체 너비의 1/4, 최대 3칸

    if (!hasLeftSidebar) {
      // 좌측 배치
      return {
        x: 0,
        y: topOffset,
        width: sidebarWidth,
        height: Math.max(1, gridRows - topOffset - 1),
      }
    } else {
      // 우측 배치
      return {
        x: Math.max(0, gridCols - sidebarWidth),
        y: topOffset,
        width: sidebarWidth,
        height: Math.max(1, gridRows - topOffset - 1),
      }
    }
  }

  // 5. Main → 중앙 영역 (header, sidebar 고려)
  if (semanticTag === "main") {
    const hasHeader = existingComponents.some((c) => c.semanticTag === "header")
    const hasNav = existingComponents.some((c) => c.semanticTag === "nav")
    const topOffset = hasHeader || hasNav ? 1 : 0

    // 좌측 sidebar 확인
    const leftSidebar = existingComponents.find((c) => {
      const layout = getComponentCanvasLayout(c, currentBreakpoint)
      return c.semanticTag === "aside" && layout && layout.x === 0
    })

    // 우측 sidebar 확인
    const rightSidebar = existingComponents.find((c) => {
      const layout = getComponentCanvasLayout(c, currentBreakpoint)
      return c.semanticTag === "aside" && layout && layout.x > gridCols / 2
    })

    const leftSidebarLayout = leftSidebar ? getComponentCanvasLayout(leftSidebar, currentBreakpoint) : null
    const rightSidebarLayout = rightSidebar ? getComponentCanvasLayout(rightSidebar, currentBreakpoint) : null

    const startX = leftSidebarLayout ? leftSidebarLayout.x + leftSidebarLayout.width : 0
    const endX = rightSidebarLayout ? rightSidebarLayout.x : gridCols
    const width = Math.max(1, endX - startX)

    // Footer 확인
    const hasFooter = existingComponents.some((c) => c.semanticTag === "footer")
    const bottomOffset = hasFooter ? 1 : 0

    return {
      x: startX,
      y: topOffset,
      width,
      height: Math.max(1, gridRows - topOffset - bottomOffset),
    }
  }

  // 6. 기타 컴포넌트 (section, article, div, form) → 빈 공간 찾기
  return findEmptySlot(existingComponents, gridCols, gridRows, currentBreakpoint, 1, 1)
}

/**
 * 빈 공간을 찾아서 배치 위치 계산
 *
 * @param existingComponents - 기존 컴포넌트 목록
 * @param gridCols - 그리드 열 개수
 * @param gridRows - 그리드 행 개수
 * @param currentBreakpoint - 현재 breakpoint
 * @param width - 배치할 컴포넌트의 너비
 * @param height - 배치할 컴포넌트의 높이
 * @returns 빈 공간 위치
 *
 * Performance Note:
 * - Time Complexity: O(gridRows × gridCols × existingComponents.length)
 * - For default grid (12×20) with 20 components: ~4,800 iterations
 * - Acceptable for typical use (<50 components)
 * - For future optimization with 100+ components, consider spatial hashing or quad-tree
 */
export function findEmptySlot(
  existingComponents: Component[],
  gridCols: number,
  gridRows: number,
  currentBreakpoint: string,
  width: number = 1,
  height: number = 1
): SmartPosition {
  // 위에서 아래로, 왼쪽에서 오른쪽으로 스캔하여 빈 공간 찾기
  for (let y = 0; y <= gridRows - height; y++) {
    for (let x = 0; x <= gridCols - width; x++) {
      const hasCollision = existingComponents.some((c) => {
        const layout = getComponentCanvasLayout(c, currentBreakpoint)
        if (!layout) return false

        // Collision detection (STRICT)
        const otherRight = layout.x + layout.width
        const otherBottom = layout.y + layout.height
        const newRight = x + width
        const newBottom = y + height

        return !(
          x >= otherRight ||
          newRight <= layout.x ||
          y >= otherBottom ||
          newBottom <= layout.y
        )
      })

      if (!hasCollision) {
        return { x, y, width, height }
      }
    }
  }

  // 빈 공간이 없으면 마지막 컴포넌트 아래에 배치
  if (existingComponents.length > 0) {
    const componentsWithLayout = existingComponents
      .map((c) => {
        const layout = getComponentCanvasLayout(c, currentBreakpoint)
        return layout ? { component: c, layout } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    if (componentsWithLayout.length > 0) {
      // 가장 아래에 있는 컴포넌트 찾기
      const bottomMost = componentsWithLayout.reduce((max, current) => {
        const currentBottom = current.layout.y + current.layout.height
        const maxBottom = max.layout.y + max.layout.height
        return currentBottom > maxBottom ? current : max
      })

      // Ensure newY is within valid grid bounds (prevent negative values)
      const newY = Math.max(0, Math.min(bottomMost.layout.y + bottomMost.layout.height, gridRows - height))

      return {
        x: 0,
        y: newY,
        width,
        height,
      }
    }
  }

  // 컴포넌트가 없으면 (0, 0)에 배치
  return { x: 0, y: 0, width, height }
}

/**
 * 컴포넌트의 현재 breakpoint에 해당하는 Canvas Layout 가져오기
 *
 * @param component - 컴포넌트
 * @param breakpoint - breakpoint 이름
 * @returns Canvas Layout 또는 null
 */
function getComponentCanvasLayout(
  component: Component,
  breakpoint: string
): CanvasLayout | null {
  // Responsive layout 우선, 없으면 fallback
  const layout =
    component.responsiveCanvasLayout?.[breakpoint as keyof typeof component.responsiveCanvasLayout] ||
    component.canvasLayout

  return layout || null
}

/**
 * 컴포넌트 타입별 추천 크기 계산
 *
 * @param semanticTag - 시맨틱 태그
 * @param gridCols - 그리드 열 개수
 * @param gridRows - 그리드 행 개수
 * @returns 추천 width, height
 */
export function getRecommendedSize(
  semanticTag: SemanticTag,
  gridCols: number,
  gridRows: number
): { width: number; height: number } {
  switch (semanticTag) {
    case "header":
    case "footer":
    case "nav":
      return { width: gridCols, height: 1 }

    case "aside":
      return {
        width: Math.min(3, Math.floor(gridCols / 4)),
        height: Math.max(1, gridRows - 2),
      }

    case "main":
      return {
        width: Math.max(1, Math.floor(gridCols * 0.75)),
        height: Math.max(1, gridRows - 2),
      }

    case "section":
    case "article":
      return {
        width: Math.max(1, Math.floor(gridCols / 2)),
        height: Math.max(1, Math.floor(gridRows / 3)),
      }

    case "div":
    case "form":
    default:
      return { width: 1, height: 1 }
  }
}
