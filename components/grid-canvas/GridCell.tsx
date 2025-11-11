"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GridCellProps {
  componentId: string
  componentName: string | null
  rowIndex: number
  colIndex: number
  gridArea?: string
}

/**
 * GridCell - Individual cell in the grid canvas
 * Shows component ID/name or empty state
 */
export function GridCell({
  componentId,
  componentName,
  rowIndex,
  colIndex,
  gridArea,
}: GridCellProps) {
  const selectedComponentId = useLayoutStore(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )

  const isSelected = selectedComponentId === componentId
  const isEmpty = !componentId

  const handleClick = () => {
    if (componentId) {
      setSelectedComponentId(isSelected ? null : componentId)
    }
  }

  return (
    <div
      className={cn(
        "relative border-2 rounded-md transition-all cursor-pointer flex items-center justify-center p-4",
        isEmpty
          ? "border-dashed border-muted bg-muted/20 hover:bg-muted/40"
          : "border-solid border-border bg-background hover:bg-accent hover:border-accent-foreground",
        isSelected && "border-primary bg-primary/10 ring-2 ring-primary",
        gridArea && "col-span-full row-span-full"
      )}
      style={gridArea ? { gridArea } : undefined}
      onClick={handleClick}
    >
      {isEmpty ? (
        <div className="text-xs text-muted-foreground">
          [{rowIndex},{colIndex}]
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Badge variant={isSelected ? "default" : "secondary"}>
            {componentId}
          </Badge>
          {componentName && (
            <div className="text-sm font-medium text-center">
              {componentName}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
