"use client"

import { useRef, useState } from "react"
import { Stage, Layer, Rect, Text } from "react-konva"
import Konva from "konva"

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
            {/* Temporary: Draw simple grid background */}
            {Array.from({ length: 20 }).map((_, row) =>
              Array.from({ length: 20 }).map((_, col) => (
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
            {/* Temporary: Test component */}
            <Rect
              x={100}
              y={100}
              width={200}
              height={100}
              fill="white"
              stroke="#3b82f6"
              strokeWidth={2}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.1}
              shadowOffsetX={0}
              shadowOffsetY={2}
            />
            <Text
              x={100}
              y={100}
              width={200}
              height={100}
              text="Test Component"
              fontSize={14}
              fontFamily="Inter, sans-serif"
              fill="#64748b"
              align="center"
              verticalAlign="middle"
            />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
