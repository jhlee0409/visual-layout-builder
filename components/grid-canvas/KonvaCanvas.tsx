"use client"

import { useRef, useState } from "react"
import { Stage, Layer, Rect } from "react-konva"
import Konva from "konva"
import { useLayoutStore } from "@/store/layout-store"
import { ComponentNode } from "./ComponentNode"
import type { Component } from "@/types/schema"

// Grid constants
const CELL_SIZE = 100
const GRID_COLOR = "rgba(128, 128, 128, 0.2)"

interface KonvaCanvasProps {
  width?: number
  height?: number
}

export function KonvaCanvas({ width = 1200, height = 800 }: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // Get current breakpoint grid size
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const breakpoints = useLayoutStore((state) => state.schema.breakpoints)
  const schema = useLayoutStore((state) => state.schema)
  const selectedComponentId = useLayoutStore((state) => state.selectedComponentId)
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )
  const updateGridAreas = useLayoutStore((state) => state.updateGridAreas)

  const bp = breakpoints.find((b) => b.name === currentBreakpoint)
  const gridCols = bp?.gridCols ?? 12
  const gridRows = bp?.gridRows ?? 20

  // Get current layout's areas
  const currentLayout = schema.layouts[currentBreakpoint]
  const areas = currentLayout?.grid.areas ?? []

  // Calculate component positions and spans from areas
  interface ComponentPosition {
    component: Component
    gridRow: number
    gridCol: number
    rowSpan: number
    colSpan: number
  }

  const componentPositions: ComponentPosition[] = []
  const processed = new Set<string>() // Track processed cells as "row,col"

  areas.forEach((row, rowIndex) => {
    row.forEach((cellId, colIndex) => {
      const cellKey = `${rowIndex},${colIndex}`

      // Skip empty cells or already processed cells
      if (!cellId || processed.has(cellKey)) return

      // Find the component
      const component = schema.components.find((c) => c.id === cellId)
      if (!component) return

      // Calculate span by finding all adjacent cells with same ID
      let rowSpan = 1
      let colSpan = 1

      // Calculate colSpan (horizontal expansion)
      while (
        colIndex + colSpan < row.length &&
        row[colIndex + colSpan] === cellId
      ) {
        colSpan++
      }

      // Calculate rowSpan (vertical expansion)
      while (
        rowIndex + rowSpan < areas.length &&
        areas[rowIndex + rowSpan][colIndex] === cellId &&
        // Ensure all cells in the row have same ID (rectangular check)
        areas[rowIndex + rowSpan]
          .slice(colIndex, colIndex + colSpan)
          .every((id) => id === cellId)
      ) {
        rowSpan++
      }

      // Mark all cells in this component as processed
      for (let r = rowIndex; r < rowIndex + rowSpan; r++) {
        for (let c = colIndex; c < colIndex + colSpan; c++) {
          processed.add(`${r},${c}`)
        }
      }

      // Add component position
      componentPositions.push({
        component,
        gridRow: rowIndex,
        gridCol: colIndex,
        rowSpan,
        colSpan,
      })
    })
  })

  // Handle component drag end - update areas in store
  const handleComponentDragEnd = (
    componentId: string,
    oldRow: number,
    oldCol: number,
    rowSpan: number,
    colSpan: number,
    newRow: number,
    newCol: number
  ) => {
    // Create a copy of current areas and ensure it's gridRows × gridCols size
    const newAreas: string[][] = []
    for (let r = 0; r < gridRows; r++) {
      const row: string[] = []
      for (let c = 0; c < gridCols; c++) {
        row.push(areas[r]?.[c] ?? "")
      }
      newAreas.push(row)
    }

    // Validate new position is within bounds
    if (
      newRow < 0 ||
      newCol < 0 ||
      newRow + rowSpan > gridRows ||
      newCol + colSpan > gridCols
    ) {
      console.warn("Component position out of bounds, reverting")
      return
    }

    // Check for collision with other components
    let hasCollision = false
    for (let r = newRow; r < newRow + rowSpan; r++) {
      for (let c = newCol; c < newCol + colSpan; c++) {
        const cellId = newAreas[r]?.[c]
        if (cellId && cellId !== componentId) {
          hasCollision = true
          break
        }
      }
      if (hasCollision) break
    }

    if (hasCollision) {
      console.warn("Component collision detected, reverting")
      return
    }

    // Clear old position
    for (let r = oldRow; r < oldRow + rowSpan; r++) {
      for (let c = oldCol; c < oldCol + colSpan; c++) {
        if (newAreas[r]?.[c] === componentId) {
          newAreas[r][c] = ""
        }
      }
    }

    // Set new position
    for (let r = newRow; r < newRow + rowSpan; r++) {
      for (let c = newCol; c < newCol + colSpan; c++) {
        newAreas[r][c] = componentId
      }
    }

    // Update store
    updateGridAreas(currentBreakpoint, newAreas)
  }

  // Handle wheel for Pan & Zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Zoom with Ctrl/Cmd + Wheel
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.05
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

      // Clamp scale between 0.1 and 3
      const clampedScale = Math.max(0.1, Math.min(3, newScale))

      // Zoom to pointer position
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }

      setStageScale(clampedScale)
      setStagePosition(newPos)
    }
    // Pan with Shift + Wheel (horizontal) or normal Wheel (vertical)
    else {
      const dx = e.evt.shiftKey ? e.evt.deltaY : 0
      const dy = e.evt.shiftKey ? 0 : e.evt.deltaY

      setStagePosition({
        x: stagePosition.x - dx,
        y: stagePosition.y - dy,
      })
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Konva Canvas</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">
              무한 캔버스 • Pan & Zoom
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs font-mono text-muted-foreground">
              Grid: {gridCols} × {gridRows}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            💡 Ctrl+Wheel: 확대/축소 • Shift+Wheel: 수평 이동 • Wheel: 수직 이동
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={handleWheel}
          draggable
          onDragEnd={(e) => {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y(),
            })
          }}
        >
          {/* Grid Layer */}
          <Layer>
            {/* Breakpoint-specific grid background */}
            {Array.from({ length: gridRows }).map((_, row) =>
              Array.from({ length: gridCols }).map((_, col) => (
                <Rect
                  key={`grid-${row}-${col}`}
                  x={col * CELL_SIZE}
                  y={row * CELL_SIZE}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  stroke={GRID_COLOR}
                  strokeWidth={1}
                />
              ))
            )}
          </Layer>

          {/* Component Layer */}
          <Layer>
            {componentPositions.map((pos) => (
              <ComponentNode
                key={pos.component.id}
                component={pos.component}
                gridRow={pos.gridRow}
                gridCol={pos.gridCol}
                rowSpan={pos.rowSpan}
                colSpan={pos.colSpan}
                isSelected={selectedComponentId === pos.component.id}
                onClick={() => setSelectedComponentId(pos.component.id)}
                onDragEnd={(newRow, newCol) =>
                  handleComponentDragEnd(
                    pos.component.id,
                    pos.gridRow,
                    pos.gridCol,
                    pos.rowSpan,
                    pos.colSpan,
                    newRow,
                    newCol
                  )
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
