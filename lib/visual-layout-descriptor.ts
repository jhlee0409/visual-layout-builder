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
import {
  groupComponentsByRow,
  getCanvasLayoutForBreakpoint,
  filterComponentsWithCanvasLayout,
} from "./canvas-utils"

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
  // Filter out components without Canvas layout for this breakpoint
  const componentsWithLayout = filterComponentsWithCanvasLayout(components, breakpoint)

  const visualLayout = canvasToGridPositions(componentsWithLayout, breakpoint, gridCols, gridRows)
  const complexity = analyzeGridComplexity(componentsWithLayout, breakpoint)

  // 1. Summary
  const summary = `This breakpoint uses a **${gridCols}-column × ${gridRows}-row grid system** with ${complexity.totalComponents} components.`

  // 2. Row-by-row description
  const rowByRow = generateRowByRowDescription(componentsWithLayout, breakpoint, gridCols)

  // 3. Spatial relationships
  const spatialRelationships = detectSpatialRelationships(componentsWithLayout, breakpoint, gridCols, gridRows)

  // 4. Implementation hints
  const implementationHints = generateImplementationHints(
    componentsWithLayout,
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
      const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)!

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
    const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)
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
    const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)
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
    const layout = getCanvasLayoutForBreakpoint(comp, breakpoint)
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

  // 🎯 0. UNIVERSAL RULE: Auto Rows Strategy (최우선 - "Magic Prompt" solution)
  hints.push(
    `🎯 **UNIVERSAL RULE - Auto Rows**: Use Tailwind arbitrary values \`grid-rows-[repeat(${gridRows},auto)]\` on the grid container. This allows rows to auto-size based on content, solving height sync issues universally for ALL layout combinations (vertical, side-by-side, mixed). Do NOT use fixed row heights (\`grid-rows-${gridRows}\`).`
  )

  // 🚨 1. CRITICAL: Side-by-side warning (if applicable)
  if (complexity.hasSideBySide) {
    hints.push(
      `🚨 **CRITICAL**: This layout has components positioned **side-by-side** in the same row. You MUST use CSS Grid (not flexbox column) to achieve horizontal positioning. DO NOT stack these components vertically!`
    )
  }

  // 3. Layout strategy
  if (complexity.recommendedImplementation === "grid") {
    hints.push(
      `**Use CSS Grid** for the main layout container due to complex 2D positioning. Create a grid container with \`display: grid; grid-template-columns: repeat(${gridCols}, 1fr);\``
    )
  } else {
    hints.push(
      `While this layout could use Flexbox, CSS Grid is **strongly recommended** for precise positioning and future flexibility`
    )
  }

  // 4. Grid positioning
  hints.push(
    `Each component MUST use \`grid-area\` (or \`grid-column\`/\`grid-row\`) to specify its exact position based on Canvas Grid coordinates`
  )

  // 5. Sidebar handling
  const sidebar = detectSidebar(components, breakpoint, gridCols, gridRows)
  if (sidebar) {
    hints.push(
      `**${sidebar.name}** should be implemented as a sticky sidebar (use \`position: sticky\` with appropriate \`top\` value) positioned on the left side`
    )
  }

  // 6. Side-by-side implementation details + h-full strategy
  if (complexity.hasSideBySide) {
    hints.push(
      `For side-by-side components: Use grid-column spans to place components horizontally. Example: Component A uses \`grid-column: 1 / 4\`, Component B uses \`grid-column: 4 / 9\`, both with the same \`grid-row\` value`
    )
    hints.push(
      `🎯 **CRITICAL - Equal Heights**: Components positioned side-by-side MUST use \`h-full\` (or \`height: 100%\`) to fill their grid cell vertically. This ensures equal heights when components share the same row range. Add \`h-full\` to the component wrapper div.`
    )
  }

  // 7. Component reusability (NEW)
  hints.push(
    `♻️ **Reusability**: Consider extracting repeated grid positioning patterns into reusable \`GridCell\` components. For complex layouts, use composition patterns (compound components like \`PageLayout.Header\`, \`PageLayout.Sidebar\`).`
  )

  // 8. Component independence reminder
  hints.push(
    `Each component still uses its own \`positioning\` strategy (sticky/fixed/static) and internal \`layout\` (flex/grid/container)`
  )

  // 9. Responsive considerations
  hints.push(
    `This grid layout applies to the **${breakpoint}** breakpoint - other breakpoints may have different arrangements`
  )

  return hints
}
