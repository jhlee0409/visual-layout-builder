"use client"

import { useRef, useState, useEffect } from "react"
import { Stage, Layer, Rect } from "react-konva"
import Konva from "konva"
import { useLayoutStoreV2, useComponentsInCurrentLayoutV2 } from "@/store/layout-store-v2"
import { ComponentNodeV2 } from "./ComponentNodeV2"
import { createComponentFromTemplate } from "@/lib/component-library-v2"
import type { Component } from "@/types/schema-v2"
import type { ComponentTemplate } from "@/lib/component-library-v2"

// Grid constants
const CELL_SIZE = 100
const GRID_COLOR = "rgba(128, 128, 128, 0.2)"

interface KonvaCanvasV2Props {
  width?: number
  height?: number
}

export function KonvaCanvasV2({
  width,
  height,
}: KonvaCanvasV2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // Get store data
  const schema = useLayoutStoreV2((state) => state.schema)
  const selectedComponentId = useLayoutStoreV2((state) => state.selectedComponentId)
  const setSelectedComponentId = useLayoutStoreV2((state) => state.setSelectedComponentId)
  const updateComponent = useLayoutStoreV2((state) => state.updateComponent)
  const addComponent = useLayoutStoreV2((state) => state.addComponent)
  const currentBreakpoint = useLayoutStoreV2((state) => state.currentBreakpoint)
  const addComponentToLayout = useLayoutStoreV2((state) => state.addComponentToLayout)

  // Get current breakpoint's grid size
  const currentBreakpointConfig = schema.breakpoints.find((bp) => bp.name === currentBreakpoint)
  const gridCols = currentBreakpointConfig?.gridCols ?? 12
  const gridRows = currentBreakpointConfig?.gridRows ?? 20

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setContainerSize({ width: clientWidth, height: clientHeight })
      }
    }

    // Initial size
    updateSize()

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Handle Space key for canvas panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsSpacePressed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Use provided dimensions or container size
  const canvasWidth = width ?? containerSize.width
  const canvasHeight = height ?? containerSize.height

  // Get components in current layout (동기화: LayersTree와 동일한 selector 사용)
  const componentsInCurrentLayout = useComponentsInCurrentLayoutV2()

  // Get current breakpoint's canvas layout for each component
  const componentsWithCanvas = componentsInCurrentLayout
    .map((c) => {
      // Try responsive layout first, fallback to legacy canvasLayout
      const layout =
        c.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof c.responsiveCanvasLayout] ||
        c.canvasLayout

      if (!layout) return null

      return {
        ...c,
        currentCanvasLayout: layout,
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  // Handle component drag end - update canvasLayout
  const handleComponentDragEnd = (
    componentId: string,
    newX: number,
    newY: number
  ): boolean => {
    // Get fresh state
    const freshState = useLayoutStoreV2.getState()
    const component = freshState.schema.components.find((c) => c.id === componentId)
    if (!component) return false

    // Get current layout
    const currentLayout =
      component.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof component.responsiveCanvasLayout] ||
      component.canvasLayout

    if (!currentLayout) return false

    const { width: w, height: h } = currentLayout

    // Validate bounds
    if (
      newX < 0 ||
      newY < 0 ||
      newX + w > gridCols ||
      newY + h > gridRows
    ) {
      console.warn("❌ Component position out of bounds, reverting")
      return false
    }

    // Get fresh components in current layout (동기화: currentLayout.components 기준)
    const freshCurrentLayout = freshState.schema.layouts[currentBreakpoint as keyof typeof freshState.schema.layouts]
    const freshComponentIds = new Set(freshCurrentLayout.components)
    const freshComponentsInLayout = freshState.schema.components.filter((c) => freshComponentIds.has(c.id))

    const freshComponentsWithCanvas = freshComponentsInLayout
      .map((c) => {
        const layout =
          c.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof c.responsiveCanvasLayout] ||
          c.canvasLayout
        if (!layout) return null
        return { ...c, currentCanvasLayout: layout }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)

    // Check for collision with other components (STRICT)
    const hasCollision = freshComponentsWithCanvas.some((other) => {
      if (other.id === componentId) return false

      const otherLayout = other.currentCanvasLayout
      const otherRight = otherLayout.x + otherLayout.width
      const otherBottom = otherLayout.y + otherLayout.height
      const newRight = newX + w
      const newBottom = newY + h

      // STRICT: Even touching is considered collision
      return !(
        newX >= otherRight ||
        newRight <= otherLayout.x ||
        newY >= otherBottom ||
        newBottom <= otherLayout.y
      )
    })

    if (hasCollision) {
      console.warn("❌ Collision detected - position blocked")
      return false
    }

    // Update component with responsive layout support
    const updatedComponent = { ...component }

    if (component.responsiveCanvasLayout) {
      // Update responsive layout for current breakpoint
      updatedComponent.responsiveCanvasLayout = {
        ...component.responsiveCanvasLayout,
        [currentBreakpoint]: {
          ...currentLayout,
          x: newX,
          y: newY,
        },
      }
    } else {
      // Fallback: update legacy canvasLayout
      updatedComponent.canvasLayout = {
        ...currentLayout,
        x: newX,
        y: newY,
      }
    }

    updateComponent(componentId, updatedComponent)
    return true
  }

  // Handle component resize - update canvasLayout
  const handleComponentResize = (
    componentId: string,
    newWidth: number,
    newHeight: number
  ): boolean => {
    // Get fresh state
    const freshState = useLayoutStoreV2.getState()
    const component = freshState.schema.components.find((c) => c.id === componentId)
    if (!component) return false

    // Get current layout
    const currentLayout =
      component.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof component.responsiveCanvasLayout] ||
      component.canvasLayout

    if (!currentLayout) return false

    const { x, y } = currentLayout

    // Validate bounds
    if (
      x < 0 ||
      y < 0 ||
      x + newWidth > gridCols ||
      y + newHeight > gridRows
    ) {
      console.warn("❌ Component size out of bounds, reverting")
      return false
    }

    // Get fresh components in current layout (동기화: currentLayout.components 기준)
    const freshCurrentLayout = freshState.schema.layouts[currentBreakpoint as keyof typeof freshState.schema.layouts]
    const freshComponentIds = new Set(freshCurrentLayout.components)
    const freshComponentsInLayout = freshState.schema.components.filter((c) => freshComponentIds.has(c.id))

    const freshComponentsWithCanvas = freshComponentsInLayout
      .map((c) => {
        const layout =
          c.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof c.responsiveCanvasLayout] ||
          c.canvasLayout
        if (!layout) return null
        return { ...c, currentCanvasLayout: layout }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)

    // Check for collision with other components (STRICT)
    const hasCollision = freshComponentsWithCanvas.some((other) => {
      if (other.id === componentId) return false

      const otherLayout = other.currentCanvasLayout
      const otherRight = otherLayout.x + otherLayout.width
      const otherBottom = otherLayout.y + otherLayout.height
      const newRight = x + newWidth
      const newBottom = y + newHeight

      // STRICT: Even touching is considered collision
      return !(
        x >= otherRight ||
        newRight <= otherLayout.x ||
        y >= otherBottom ||
        newBottom <= otherLayout.y
      )
    })

    if (hasCollision) {
      console.warn("❌ Collision detected during resize - size blocked")
      return false
    }

    // Update component with responsive layout support
    const updatedComponent = { ...component }

    if (component.responsiveCanvasLayout) {
      // Update responsive layout for current breakpoint
      updatedComponent.responsiveCanvasLayout = {
        ...component.responsiveCanvasLayout,
        [currentBreakpoint]: {
          ...currentLayout,
          width: newWidth,
          height: newHeight,
        },
      }
    } else {
      // Fallback: update legacy canvasLayout
      updatedComponent.canvasLayout = {
        ...currentLayout,
        width: newWidth,
        height: newHeight,
      }
    }

    updateComponent(componentId, updatedComponent)
    return true
  }

  // Handle drop from Library to Canvas
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    try {
      // Parse template from drag data
      const templateData = e.dataTransfer.getData("application/json")
      if (!templateData) return

      const template: ComponentTemplate = JSON.parse(templateData)

      // Get drop position relative to container
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const stage = stageRef.current
      if (!stage) return

      // Calculate position considering stage scale and position
      const pointerX = e.clientX - containerRect.left
      const pointerY = e.clientY - containerRect.top

      // Convert to grid coordinates (accounting for stage transform)
      // Formula: (screenPos / scale - stagePan) / cellSize
      let gridX = Math.floor((pointerX / stageScale - stagePosition.x) / CELL_SIZE)
      let gridY = Math.floor((pointerY / stageScale - stagePosition.y) / CELL_SIZE)

      // Default component size
      const defaultWidth = 4
      const defaultHeight = 3

      // Adjust position to ensure component fits within grid bounds
      gridX = Math.max(0, Math.min(gridX, gridCols - defaultWidth))
      gridY = Math.max(0, Math.min(gridY, gridRows - defaultHeight))

      // Get fresh components in current layout for collision check (동기화)
      const freshState = useLayoutStoreV2.getState()
      const freshCurrentLayout = freshState.schema.layouts[currentBreakpoint as keyof typeof freshState.schema.layouts]
      const freshComponentIds = new Set(freshCurrentLayout.components)
      const freshComponentsInLayout = freshState.schema.components.filter((c) => freshComponentIds.has(c.id))

      const freshComponentsWithCanvas = freshComponentsInLayout
        .map((c) => {
          const layout =
            c.responsiveCanvasLayout?.[currentBreakpoint as keyof typeof c.responsiveCanvasLayout] ||
            c.canvasLayout
          if (!layout) return null
          return { ...c, currentCanvasLayout: layout }
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)

      // Check for collision at drop position
      const hasCollision = freshComponentsWithCanvas.some((other) => {
        const otherLayout = other.currentCanvasLayout
        const otherRight = otherLayout.x + otherLayout.width
        const otherBottom = otherLayout.y + otherLayout.height
        const newRight = gridX + defaultWidth
        const newBottom = gridY + defaultHeight

        return !(
          gridX >= otherRight ||
          newRight <= otherLayout.x ||
          gridY >= otherBottom ||
          newBottom <= otherLayout.y
        )
      })

      if (hasCollision) {
        console.warn("❌ Cannot drop here - position occupied")
        return
      }

      // Create component from template
      const newComponent = createComponentFromTemplate(template)

      // Set responsiveCanvasLayout for current breakpoint
      newComponent.responsiveCanvasLayout = {
        [currentBreakpoint]: {
          x: gridX,
          y: gridY,
          width: defaultWidth,
          height: defaultHeight,
        },
      }

      // Add to store (addComponent already handles layout inheritance via normalizeSchemaV2)
      addComponent(newComponent)

      // Select the newly added component
      setSelectedComponentId(newComponent.id)
    } catch (error) {
      console.error("Failed to drop component:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
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
    <div ref={containerRef} className="h-full flex flex-col overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Konva Canvas V2</span>
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
            💡 Space+Drag: 캔버스 이동 • Ctrl+Wheel: 확대/축소 • Shift+Wheel: 수평 이동
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="flex-1 overflow-hidden bg-slate-50 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Stage
          ref={stageRef}
          width={canvasWidth}
          height={canvasHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          onWheel={handleWheel}
          draggable={isSpacePressed}
          onDragEnd={(e) => {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y(),
            })
          }}
        >
          {/* Grid Layer */}
          <Layer>
            {/* Main grid cells */}
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
            {componentsWithCanvas.map((componentWithLayout) => {
              return (
                <ComponentNodeV2
                  key={componentWithLayout.id}
                  component={{
                    ...componentWithLayout,
                    canvasLayout: componentWithLayout.currentCanvasLayout,
                  }}
                  gridCols={gridCols}
                  gridRows={gridRows}
                  isSelected={selectedComponentId === componentWithLayout.id}
                  onClick={() => setSelectedComponentId(componentWithLayout.id)}
                  onDragEnd={(newX, newY) =>
                    handleComponentDragEnd(componentWithLayout.id, newX, newY)
                  }
                  onResizeEnd={(newWidth, newHeight) =>
                    handleComponentResize(componentWithLayout.id, newWidth, newHeight)
                  }
                />
              )
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
