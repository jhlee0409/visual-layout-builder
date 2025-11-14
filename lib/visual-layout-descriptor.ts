/**
 * Visual Layout Descriptor
 *
 * Canvas 배치를 자연어로 설명하여 AI가 이해할 수 있는 형태로 변환
 *
 * Prompt Engineering 2025 패턴 적용:
 * - Structured Specification (Context → Task → Details)
 * - Spatial Relationships 명시
 * - Implementation Hints 제공
 */

import type { Component } from "@/types/schema"
import { canvasToGridPositions, analyzeGridComplexity, type VisualLayout } from "./canvas-to-grid"

/**
 * Layout Description (AI 프롬프트용)
 */
export interface LayoutDescription {
  summary: string // 전체 요약
  rowByRow: string[] // Row별 상세 설명
  spatialRelationships: string[] // 공간적 관계
  implementationHints: string[] // 구현 힌트
  visualLayout: VisualLayout // CSS Grid 정보
}

/**
 * Canvas Grid 배치를 prose로 설명
 *
 * AI가 2D 레이아웃을 정확히 이해할 수 있도록 다각도로 설명
 *
 * @param components - Schema components
 * @param breakpoint - Target breakpoint
 * @param gridCols - Canvas grid columns
 * @param gridRows - Canvas grid rows
 * @returns Comprehensive layout description
 *
 * @example
 * const desc = describeVisualLayout(components, 'desktop', 12, 8)
 * // desc.summary = "Desktop layout uses a 12-column × 8-row grid system."
 * // desc.rowByRow = ["Row 0: Header (c1, cols 0-11)", ...]
 * // desc.spatialRelationships = ["Section is LEFT of ImageBanner", ...]
 */
export function describeVisualLayout(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): LayoutDescription {
  const visualLayout = canvasToGridPositions(components, breakpoint, gridCols, gridRows)
  const complexity = analyzeGridComplexity(components, breakpoint)

  // 1. Summary
  const summary = `This breakpoint uses a **${gridCols}-column × ${gridRows}-row grid system** with ${complexity.totalComponents} components.`

  // 2. Row-by-row description
  const rowByRow = generateRowByRowDescription(components, breakpoint, gridCols)

  // 3. Spatial relationships
  const spatialRelationships = detectSpatialRelationships(components, breakpoint, gridCols, gridRows)

  // 4. Implementation hints
  const implementationHints = generateImplementationHints(
    components,
    breakpoint,
    gridCols,
    gridRows,
    complexity
  )

  return {
    summary,
    rowByRow,
    spatialRelationships,
    implementationHints,
    visualLayout,
  }
}

/**
 * Row별 상세 설명 생성
 *
 * @example
 * ["Row 0: Header (c1, cols 0-11, full width)",
 *  "Row 1-6: Section (c7, cols 0-1), ImageBanner (c4, cols 2-11)"]
 */
function generateRowByRowDescription(
  components: Component[],
  breakpoint: string,
  gridCols: number
): string[] {
  const rows: string[] = []
  const componentsGrouped = groupComponentsByRow(components, breakpoint)

  componentsGrouped.forEach((group) => {
    const { rowRange, components: comps } = group

    const componentDescs = comps.map((comp) => {
      const layout =
        comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
        comp.canvasLayout!

      const colRange =
        layout.width === gridCols
          ? "full width"
          : `cols ${layout.x}-${layout.x + layout.width - 1}`

      return `${comp.name} (${comp.id}, ${colRange})`
    })

    const rowDesc =
      rowRange.length === 1
        ? `Row ${rowRange[0]}`
        : `Row ${rowRange[0]}-${rowRange[rowRange.length - 1]}`

    rows.push(`${rowDesc}: ${componentDescs.join(", ")}`)
  })

  return rows
}

/**
 * Row별로 컴포넌트 그룹화 (연속된 row는 합침)
 */
interface RowGroup {
  rowRange: number[]
  components: Component[]
}

function groupComponentsByRow(components: Component[], breakpoint: string): RowGroup[] {
  const rowMap = new Map<number, Component[]>()

  // 각 컴포넌트의 시작 row에 추가
  components.forEach((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout
    if (!layout) return

    const startRow = layout.y
    if (!rowMap.has(startRow)) {
      rowMap.set(startRow, [])
    }
    rowMap.get(startRow)!.push(comp)
  })

  // Row 순서대로 정렬하고 그룹화
  const groups: RowGroup[] = []
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b)

  sortedRows.forEach((row) => {
    const comps = rowMap.get(row)!.sort((a, b) => {
      const aX =
        (a.responsiveCanvasLayout?.[breakpoint as keyof typeof a.responsiveCanvasLayout] ||
          a.canvasLayout)!.x
      const bX =
        (b.responsiveCanvasLayout?.[breakpoint as keyof typeof b.responsiveCanvasLayout] ||
          b.canvasLayout)!.x
      return aX - bX
    })

    // 연속된 row span 계산
    const maxHeight = Math.max(
      ...comps.map((c) => {
        const layout =
          c.responsiveCanvasLayout?.[breakpoint as keyof typeof c.responsiveCanvasLayout] ||
          c.canvasLayout!
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
 * 공간적 관계 감지
 *
 * @example
 * ["Section (c7) is positioned to the LEFT of ImageBanner (c4)",
 *  "Section (c7) acts as a SIDEBAR (narrow column spanning multiple rows)"]
 */
function detectSpatialRelationships(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): string[] {
  const relationships: string[] = []

  // 1. Side-by-side 감지
  const sideBySidePairs = detectSideBySide(components, breakpoint)
  sideBySidePairs.forEach(([left, right]) => {
    relationships.push(
      `**${left.name} (${left.id})** is positioned to the **LEFT** of **${right.name} (${right.id})**`
    )
  })

  // 2. Sidebar 패턴 감지
  const sidebar = detectSidebar(components, breakpoint, gridCols, gridRows)
  if (sidebar) {
    relationships.push(
      `**${sidebar.name} (${sidebar.id})** acts as a **SIDEBAR** (narrow column spanning multiple rows on the left)`
    )
  }

  // 3. Full-width 컴포넌트 감지
  const fullWidthComponents = components.filter((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout
    return layout && layout.width === gridCols
  })

  fullWidthComponents.forEach((comp) => {
    const layoutType =
      comp.semanticTag === "header"
        ? "header bar"
        : comp.semanticTag === "footer"
          ? "footer bar"
          : "full-width section"

    relationships.push(
      `**${comp.name} (${comp.id})** spans **FULL WIDTH** as a ${layoutType}`
    )
  })

  // 4. 같은 row에 배치된 컴포넌트 (side-by-side가 아닌 경우, 즉 같은 높이에서 시작)
  const sameRowComponents = detectSameRowStart(components, breakpoint)
  sameRowComponents.forEach((group) => {
    if (group.length >= 2) {
      const names = group.map((c) => `${c.name} (${c.id})`).join(", ")
      relationships.push(`**${names}** are positioned **SIDE-BY-SIDE** in the same row`)
    }
  })

  return relationships
}

/**
 * Side-by-side 컴포넌트 쌍 감지 (좌우 배치)
 */
function detectSideBySide(
  components: Component[],
  breakpoint: string
): [Component, Component][] {
  const pairs: [Component, Component][] = []
  const grouped = groupComponentsByRow(components, breakpoint)

  grouped.forEach((group) => {
    const comps = group.components
    for (let i = 0; i < comps.length - 1; i++) {
      pairs.push([comps[i], comps[i + 1]])
    }
  })

  return pairs
}

/**
 * Sidebar 패턴 감지
 */
function detectSidebar(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): Component | null {
  // 좌측 끝 (x=0)에 배치되고, 좁은 너비 (≤25%), 긴 높이 (≥50%)
  const sidebar = components.find((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout
    if (!layout) return false

    return (
      layout.x === 0 &&
      layout.width <= gridCols / 4 &&
      layout.height >= gridRows / 2
    )
  })

  return sidebar || null
}

/**
 * 같은 row에서 시작하는 컴포넌트 그룹
 */
function detectSameRowStart(
  components: Component[],
  breakpoint: string
): Component[][] {
  const rowStartMap = new Map<number, Component[]>()

  components.forEach((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout
    if (!layout) return

    const y = layout.y
    if (!rowStartMap.has(y)) {
      rowStartMap.set(y, [])
    }
    rowStartMap.get(y)!.push(comp)
  })

  return Array.from(rowStartMap.values()).filter((group) => group.length >= 2)
}

/**
 * 구현 힌트 생성
 */
function generateImplementationHints(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number,
  complexity: ReturnType<typeof analyzeGridComplexity>
): string[] {
  const hints: string[] = []

  // 1. Layout strategy
  if (complexity.recommendedImplementation === "grid") {
    hints.push(
      `**Use CSS Grid** for the main layout container (not simple flexbox) due to complex 2D positioning`
    )
    hints.push(
      `Set up a \`display: grid\` container with \`grid-template-columns: repeat(${gridCols}, 1fr)\``
    )
  } else {
    hints.push(
      `Simple vertical layout can use Flexbox (\`flex flex-col\`), but CSS Grid is recommended for precise positioning`
    )
  }

  // 2. Grid positioning
  hints.push(
    `Each component should use \`grid-area\` or \`grid-column\`/\`grid-row\` to specify its exact position`
  )

  // 3. Sidebar handling
  const sidebar = detectSidebar(components, breakpoint, gridCols, gridRows)
  if (sidebar) {
    hints.push(
      `**${sidebar.name}** should be implemented as a sticky or fixed sidebar on the left`
    )
  }

  // 4. Side-by-side handling
  if (complexity.hasSideBySide) {
    hints.push(
      `Components in the **same row** should be placed **side-by-side** using grid columns, NOT stacked vertically`
    )
  }

  // 5. Component independence reminder
  hints.push(
    `Each component still uses its own \`positioning\` strategy (sticky/fixed/static) and internal \`layout\` (flex/grid/container)`
  )

  // 6. Responsive considerations
  hints.push(
    `This grid layout applies to the **${breakpoint}** breakpoint - other breakpoints may have different arrangements`
  )

  return hints
}
