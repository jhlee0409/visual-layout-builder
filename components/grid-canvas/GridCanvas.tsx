"use client"

import { useLayoutStore, useCurrentLayout } from "@/store/layout-store"
import { Card } from "@/components/ui/card"
import { GridCell } from "./GridCell"
import { GridToolbar } from "./GridToolbar"

/**
 * GridCanvas - Main canvas component for visual layout design
 * Renders the current breakpoint's grid layout with draggable cells
 */
export function GridCanvas() {
  const currentLayout = useCurrentLayout()
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const components = useLayoutStore((state) => state.schema.components)

  if (!currentLayout) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No layout found for breakpoint: {currentBreakpoint}</p>
      </Card>
    )
  }

  const { grid } = currentLayout
  const { rows, columns, areas } = grid

  // Calculate grid dimensions
  const gridRows = areas.length
  const gridCols = areas[0]?.length || 0

  // Generate unique key for each cell position
  const getCellKey = (rowIndex: number, colIndex: number) =>
    `${rowIndex}-${colIndex}`

  // Find component name by ID
  const getComponentName = (componentId: string) => {
    if (!componentId) return null
    const component = components.find((c) => c.id === componentId)
    return component?.name || componentId
  }

  // Determine if cell is part of a merged area (not top-left)
  const isMergedCell = (rowIndex: number, colIndex: number) => {
    const currentId = areas[rowIndex][colIndex]
    if (!currentId) return false

    // Check if this is the first occurrence of this ID
    for (let r = 0; r < areas.length; r++) {
      for (let c = 0; c < areas[r].length; c++) {
        if (areas[r][c] === currentId) {
          // If we found an earlier occurrence, this is a merged cell
          if (r < rowIndex || (r === rowIndex && c < colIndex)) {
            return true
          }
          // This is the first occurrence
          return false
        }
      }
    }
    return false
  }

  // Calculate grid-area for merged cells
  const getGridArea = (rowIndex: number, colIndex: number) => {
    const currentId = areas[rowIndex][colIndex]
    if (!currentId) return undefined

    let minRow = rowIndex
    let maxRow = rowIndex
    let minCol = colIndex
    let maxCol = colIndex

    // Find all cells with the same ID
    for (let r = 0; r < areas.length; r++) {
      for (let c = 0; c < areas[r].length; c++) {
        if (areas[r][c] === currentId) {
          minRow = Math.min(minRow, r)
          maxRow = Math.max(maxRow, r)
          minCol = Math.min(minCol, c)
          maxCol = Math.max(maxCol, c)
        }
      }
    }

    // CSS grid-area uses 1-based indexing
    return `${minRow + 1} / ${minCol + 1} / ${maxRow + 2} / ${maxCol + 2}`
  }

  return (
    <div className="space-y-4">
      <GridToolbar gridRows={gridRows} gridCols={gridCols} />

      <Card className="p-6">
        <div
          className="grid gap-2 w-full h-[600px] border-2 border-dashed border-muted rounded-lg p-4"
          style={{
            gridTemplateRows: rows,
            gridTemplateColumns: columns,
          }}
        >
          {areas.map((row, rowIndex) =>
            row.map((componentId, colIndex) => {
              // Skip merged cells (not top-left)
              if (isMergedCell(rowIndex, colIndex)) {
                return null
              }

              const cellKey = getCellKey(rowIndex, colIndex)
              const componentName = getComponentName(componentId)
              const gridArea = getGridArea(rowIndex, colIndex)

              return (
                <GridCell
                  key={cellKey}
                  componentId={componentId}
                  componentName={componentName}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  gridArea={gridArea}
                />
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
