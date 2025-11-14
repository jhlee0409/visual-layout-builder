/**
 * Canvas Grid to CSS Grid Converter
 *
 * Canvas의 2D Grid 좌표를 CSS Grid positioning 정보로 변환
 *
 * Figma to Webflow 패턴 적용:
 * - Visual Layout (Canvas) → CSS Grid specification
 * - 2D 공간 정보 보존
 * - AI가 이해할 수 있는 명시적 Grid positioning
 */

import type { Component, CanvasLayout } from "@/types/schema"

/**
 * CSS Grid Position 정보
 */
export interface GridPosition {
  componentId: string
  componentName: string
  gridArea: string // "row-start / col-start / row-end / col-end"
  gridColumn: string // "col-start / col-end"
  gridRow: string // "row-start / row-end"
  canvasLayout: CanvasLayout
}

/**
 * Visual Layout 전체 정보
 */
export interface VisualLayout {
  gridCols: number
  gridRows: number
  positions: GridPosition[]
  templateAreas?: string // Optional: grid-template-areas (간단한 패턴만)
}

/**
 * Canvas Layout을 CSS Grid 정보로 변환
 *
 * @param components - Schema components
 * @param breakpoint - Target breakpoint (mobile, tablet, desktop)
 * @param gridCols - Canvas grid columns
 * @param gridRows - Canvas grid rows
 * @returns Visual layout with CSS Grid positions
 *
 * @example
 * const visualLayout = canvasToGridPositions(components, 'desktop', 12, 8)
 * // visualLayout.positions[0].gridArea = "1 / 1 / 2 / 13" (Header)
 * // visualLayout.positions[1].gridArea = "2 / 1 / 8 / 3" (Sidebar)
 */
export function canvasToGridPositions(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): VisualLayout {
  const positions: GridPosition[] = []

  components.forEach((comp) => {
    // Get canvas layout for this breakpoint
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout

    if (!layout) return

    // CSS Grid uses 1-based index (Canvas uses 0-based)
    const rowStart = layout.y + 1
    const rowEnd = layout.y + layout.height + 1
    const colStart = layout.x + 1
    const colEnd = layout.x + layout.width + 1

    positions.push({
      componentId: comp.id,
      componentName: comp.name,
      gridArea: `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`,
      gridColumn: `${colStart} / ${colEnd}`,
      gridRow: `${rowStart} / ${rowEnd}`,
      canvasLayout: layout,
    })
  })

  // Sort by visual position (y first, then x)
  positions.sort((a, b) => {
    if (a.canvasLayout.y !== b.canvasLayout.y) {
      return a.canvasLayout.y - b.canvasLayout.y
    }
    return a.canvasLayout.x - b.canvasLayout.x
  })

  return {
    gridCols,
    gridRows,
    positions,
    // Template areas는 복잡한 Grid에서는 사용하지 않음
    templateAreas: undefined,
  }
}

/**
 * CSS Grid 코드를 생성 (AI 프롬프트에 포함할 예시 코드)
 *
 * @param visualLayout - Visual layout info
 * @returns CSS code string
 *
 * @example
 * const css = generateGridCSS(visualLayout)
 * // Output:
 * // .layout-container {
 * //   display: grid;
 * //   grid-template-columns: repeat(12, 1fr);
 * //   ...
 * // }
 */
export function generateGridCSS(visualLayout: VisualLayout): string {
  let css = ""

  // Container styles
  css += `.layout-container {\n`
  css += `  display: grid;\n`
  css += `  grid-template-columns: repeat(${visualLayout.gridCols}, 1fr);\n`
  css += `  grid-template-rows: repeat(${visualLayout.gridRows}, auto);\n`
  css += `  gap: 1rem;\n`
  css += `}\n\n`

  // Component-specific positioning
  visualLayout.positions.forEach((pos) => {
    const className = pos.componentName.toLowerCase().replace(/\s+/g, "-")
    css += `.${className} {\n`
    css += `  grid-area: ${pos.gridArea};\n`
    css += `}\n`
  })

  return css
}

/**
 * Tailwind CSS Grid 클래스 생성 (최신 Tailwind v3.4 지원)
 *
 * @param visualLayout - Visual layout info
 * @returns Tailwind class recommendations
 *
 * @example
 * const tailwind = generateTailwindClasses(visualLayout)
 * // Output:
 * // {
 * //   container: "grid grid-cols-12 grid-rows-8 gap-4",
 * //   components: {
 * //     c1: "col-span-12 row-span-1",
 * //     c2: "col-start-1 col-end-3 row-start-2 row-end-8"
 * //   }
 * // }
 */
export function generateTailwindClasses(visualLayout: VisualLayout): {
  container: string
  components: Record<string, string>
} {
  const container = `grid grid-cols-${visualLayout.gridCols} grid-rows-${visualLayout.gridRows} gap-4`

  const components: Record<string, string> = {}

  visualLayout.positions.forEach((pos) => {
    const layout = pos.canvasLayout

    // Tailwind grid positioning classes
    const classes: string[] = []

    // Column positioning
    if (layout.width === visualLayout.gridCols) {
      // Full width
      classes.push(`col-span-full`)
    } else if (layout.x === 0) {
      // Starts at 0
      classes.push(`col-span-${layout.width}`)
    } else {
      // Custom start/end
      classes.push(`col-start-${layout.x + 1}`)
      classes.push(`col-end-${layout.x + layout.width + 1}`)
    }

    // Row positioning
    if (layout.height === visualLayout.gridRows) {
      // Full height
      classes.push(`row-span-full`)
    } else if (layout.y === 0) {
      // Starts at 0
      classes.push(`row-span-${layout.height}`)
    } else {
      // Custom start/end
      classes.push(`row-start-${layout.y + 1}`)
      classes.push(`row-end-${layout.y + layout.height + 1}`)
    }

    components[pos.componentId] = classes.join(" ")
  })

  return {
    container,
    components,
  }
}

/**
 * Grid 배치 복잡도 분석
 *
 * @param components - Components with canvas layout
 * @param breakpoint - Target breakpoint
 * @returns Complexity metrics
 *
 * @example
 * const complexity = analyzeGridComplexity(components, 'desktop')
 * if (complexity.hasSideBySide) {
 *   console.log('Complex 2D grid detected - use CSS Grid')
 * }
 */
export function analyzeGridComplexity(
  components: Component[],
  breakpoint: string
): {
  totalComponents: number
  maxComponentsPerRow: number
  hasSideBySide: boolean
  hasOverlap: boolean
  recommendedImplementation: "flexbox" | "grid"
} {
  const componentsWithLayout = components.filter(
    (c) =>
      c.responsiveCanvasLayout?.[breakpoint as keyof typeof c.responsiveCanvasLayout] ||
      c.canvasLayout
  )

  if (componentsWithLayout.length === 0) {
    return {
      totalComponents: 0,
      maxComponentsPerRow: 0,
      hasSideBySide: false,
      hasOverlap: false,
      recommendedImplementation: "flexbox",
    }
  }

  // Group by row
  const rowMap = new Map<number, Component[]>()
  componentsWithLayout.forEach((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint as keyof typeof comp.responsiveCanvasLayout] ||
      comp.canvasLayout!

    for (let y = layout.y; y < layout.y + layout.height; y++) {
      if (!rowMap.has(y)) {
        rowMap.set(y, [])
      }
      rowMap.get(y)!.push(comp)
    }
  })

  // Max components per row
  const maxComponentsPerRow = Math.max(...Array.from(rowMap.values()).map((r) => r.length))

  // Side-by-side detection (2+ components in same row)
  const hasSideBySide = maxComponentsPerRow > 1

  // Overlap detection (simplified - checks if any row has overlapping x ranges)
  let hasOverlap = false
  rowMap.forEach((comps) => {
    if (comps.length < 2) return

    for (let i = 0; i < comps.length; i++) {
      for (let j = i + 1; j < comps.length; j++) {
        const comp1ResponsiveLayout = comps[i].responsiveCanvasLayout
        const comp2ResponsiveLayout = comps[j].responsiveCanvasLayout
        const layout1 =
          (comp1ResponsiveLayout?.[breakpoint as keyof typeof comp1ResponsiveLayout]) ||
          comps[i].canvasLayout!
        const layout2 =
          (comp2ResponsiveLayout?.[breakpoint as keyof typeof comp2ResponsiveLayout]) ||
          comps[j].canvasLayout!

        const overlap = !(
          layout1.x + layout1.width <= layout2.x ||
          layout2.x + layout2.width <= layout1.x
        )

        if (overlap) {
          hasOverlap = true
          return
        }
      }
    }
  })

  // Recommendation
  const recommendedImplementation = hasSideBySide || hasOverlap ? "grid" : "flexbox"

  return {
    totalComponents: componentsWithLayout.length,
    maxComponentsPerRow,
    hasSideBySide,
    hasOverlap,
    recommendedImplementation,
  }
}
