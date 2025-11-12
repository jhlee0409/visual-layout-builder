"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GridToolbarProps {
  gridRows: number
  gridCols: number
}

/**
 * GridToolbar - Toolbar for grid controls and information
 * Shows current grid size and breakpoint
 */
export function GridToolbar({ gridRows, gridCols }: GridToolbarProps) {
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const currentLayout = useLayoutStore((state) => {
    const breakpoint = state.currentBreakpoint
    return state.schema.layouts[breakpoint]
  })

  const handleAddRow = () => {
    if (!currentLayout) return

    const { rows, columns, areas } = currentLayout.grid

    // Add new row with empty cells
    const newAreas = [
      ...areas,
      Array(areas[0]?.length || 1).fill(""),
    ]

    // Update rows definition (add 1fr)
    const rowsArray = rows.split(" ")
    const newRows = [...rowsArray, "1fr"].join(" ")

    useLayoutStore.getState().updateGridLayout(currentBreakpoint, {
      rows: newRows,
      columns,
      areas: newAreas,
    })
  }

  const handleAddColumn = () => {
    if (!currentLayout) return

    const { rows, columns, areas } = currentLayout.grid

    // Add empty cell to each row
    const newAreas = areas.map((row) => [...row, ""])

    // Update columns definition (add 1fr)
    const columnsArray = columns.split(" ")
    const newColumns = [...columnsArray, "1fr"].join(" ")

    useLayoutStore.getState().updateGridLayout(currentBreakpoint, {
      rows,
      columns: newColumns,
      areas: newAreas,
    })
  }

  const handleRemoveRow = () => {
    if (!currentLayout || gridRows <= 1) return

    const { rows, columns, areas } = currentLayout.grid

    // Remove last row
    const newAreas = areas.slice(0, -1)

    // Update rows definition
    const rowsArray = rows.split(" ")
    const newRows = rowsArray.slice(0, -1).join(" ")

    useLayoutStore.getState().updateGridLayout(currentBreakpoint, {
      rows: newRows,
      columns,
      areas: newAreas,
    })
  }

  const handleRemoveColumn = () => {
    if (!currentLayout || gridCols <= 1) return

    const { rows, columns, areas } = currentLayout.grid

    // Remove last column from each row
    const newAreas = areas.map((row) => row.slice(0, -1))

    // Update columns definition
    const columnsArray = columns.split(" ")
    const newColumns = columnsArray.slice(0, -1).join(" ")

    useLayoutStore.getState().updateGridLayout(currentBreakpoint, {
      rows,
      columns: newColumns,
      areas: newAreas,
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Breakpoint:</span>
            <Badge variant="outline">{currentBreakpoint}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Grid Size:</span>
            <Badge variant="secondary">
              {gridRows} × {gridCols}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
            >
              + Row
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveRow}
              disabled={gridRows <= 1}
            >
              - Row
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
            >
              + Column
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveColumn}
              disabled={gridCols <= 1}
            >
              - Column
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
