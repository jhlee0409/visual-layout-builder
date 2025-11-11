"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import GridLayout, { Layout } from "react-grid-layout"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Convert CSS Grid areas to react-grid-layout format
 * Helper function to convert existing data structure
 */
function areasToLayout(
  areas: string[][],
  components: Array<{ id: string; name: string }>
): Layout[] {
  const layout: Layout[] = []
  const processed = new Set<string>()

  areas.forEach((row, y) => {
    row.forEach((componentId, x) => {
      if (!componentId || processed.has(componentId)) return

      // Find bounds of this component
      let width = 1
      let height = 1

      // Find width
      for (let i = x + 1; i < row.length; i++) {
        if (row[i] === componentId) width++
        else break
      }

      // Find height
      for (let j = y + 1; j < areas.length; j++) {
        let allMatch = true
        for (let k = x; k < x + width; k++) {
          if (areas[j][k] !== componentId) {
            allMatch = false
            break
          }
        }
        if (allMatch) height++
        else break
      }

      layout.push({
        i: componentId,
        x,
        y,
        w: width,
        h: height,
        minW: 1,
        minH: 1,
      })

      processed.add(componentId)
    })
  })

  return layout
}

/**
 * Convert react-grid-layout format back to CSS Grid areas
 * For backward compatibility with existing store
 * Dynamically calculates required rows and cols from layout
 */
function layoutToAreas(layout: Layout[]): string[][] {
  if (layout.length === 0) {
    return [[""]]
  }

  // Calculate required dimensions from layout
  let maxCol = 0
  let maxRow = 0

  layout.forEach((item) => {
    const rightEdge = item.x + item.w
    const bottomEdge = item.y + item.h
    if (rightEdge > maxCol) maxCol = rightEdge
    if (bottomEdge > maxRow) maxRow = bottomEdge
  })

  // Ensure minimum grid size
  const cols = Math.max(maxCol, 12)
  const rows = Math.max(maxRow, 12)

  const areas: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "")
  )

  layout.forEach((item) => {
    const { i, x, y, w, h } = item
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (row < rows && col < cols) {
          areas[row][col] = i
        }
      }
    }
  })

  return areas
}

/**
 * GridCanvas - React Grid Layout based canvas
 * Supports drag, drop, and resize
 */
export function GridCanvas() {
  const components = useLayoutStore((state) => state.schema.components)
  const selectedComponentId = useLayoutStore(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const currentLayout = useLayoutStore(
    (state) => state.schema.layouts[state.currentBreakpoint]
  )
  const updateGridAreas = useLayoutStore((state) => state.updateGridAreas)

  const [layout, setLayout] = useState<Layout[]>([])
  const [cols, setCols] = useState(12)
  const [rows, setRows] = useState(12)
  const [isDragging, setIsDragging] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Convert areas to layout when current layout changes
  useEffect(() => {
    if (currentLayout) {
      const newLayout = areasToLayout(currentLayout.grid.areas, components)
      setLayout(newLayout)

      // Calculate cols from areas
      const maxCols = Math.max(
        ...currentLayout.grid.areas.map((row) => row.length),
        12
      )
      setCols(maxCols)
      setRows(currentLayout.grid.areas.length || 12)
    }
  }, [currentLayout, components, currentBreakpoint])

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout)

    // Convert back to areas format and update store
    // layoutToAreas now calculates dimensions dynamically
    const newAreas = layoutToAreas(newLayout)
    updateGridAreas(currentBreakpoint, newAreas)

    // Update cols and rows based on new layout
    if (newAreas.length > 0) {
      const newCols = Math.max(...newAreas.map((row) => row.length), 12)
      const newRows = Math.max(newAreas.length, 12)
      if (newCols !== cols) setCols(newCols)
      if (newRows !== rows) setRows(newRows)
    }
  }

  const getComponent = (id: string) => {
    return components.find((c) => c.id === id)
  }

  const handleDragStart = () => {
    setIsDragging(true)
    // Clear any pending timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
  }

  const handleDragStop = () => {
    // Keep isDragging true for a short time to prevent onClick from firing
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false)
    }, 100)
  }

  const handleClick = (itemId: string) => {
    // Only handle click if not dragging
    if (!isDragging) {
      setSelectedComponentId(
        selectedComponentId === itemId ? null : itemId
      )
    }
  }

  if (!currentLayout) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          No layout available for {currentBreakpoint}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Grid Canvas - {currentBreakpoint}
        </h3>
        <p className="text-sm text-muted-foreground">
          💡 Drag to move, resize handles to adjust size
        </p>
      </div>

      <div className="border-2 border-dashed border-muted rounded-lg p-4 min-h-[600px]">
        <div
          className="relative"
          style={{
            width: '1200px',
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${1200 / cols}px 50px`,
          }}
        >
          <GridLayout
            className="layout"
            layout={layout}
            cols={cols}
            rowHeight={50}
            width={1200}
            onLayoutChange={handleLayoutChange}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
            onResizeStart={handleDragStart}
            onResizeStop={handleDragStop}
            compactType={null}
            preventCollision={true}
            autoSize={true}
            maxRows={Infinity}
            isResizable={true}
            isDraggable={true}
          >
          {layout.map((item) => {
            const isSelected = selectedComponentId === item.i
            const component = getComponent(item.i)
            return (
              <div
                key={item.i}
                className={cn(
                  "cursor-move rounded-lg border-2 bg-background shadow-sm transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary"
                    : "border-border hover:border-accent-foreground"
                )}
                onClick={() => handleClick(item.i)}
              >
                <div className="h-full flex flex-col items-center justify-center p-4 pointer-events-none">
                  <Badge variant={isSelected ? "default" : "secondary"}>
                    {item.i}
                  </Badge>
                  <div className="text-sm font-medium text-center mt-2">
                    {component?.name || item.i}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    &lt;{component?.semanticTag || "div"}&gt;
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.w} × {item.h}
                  </div>
                </div>
              </div>
            )
          })}
        </GridLayout>
        </div>
      </div>
    </Card>
  )
}
