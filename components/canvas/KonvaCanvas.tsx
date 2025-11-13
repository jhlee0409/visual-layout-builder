"use client"

import { useRef, useState, useEffect } from "react"
import { Stage, Layer, Rect } from "react-konva"
import Konva from "konva"
import { useLayoutStore, useComponentsInCurrentLayout } from "@/store/layout-store"
import { ComponentNode } from "./ComponentNode"
import { createComponentFromTemplate } from "@/lib/component-library"
import { calculateSmartPosition } from "@/lib/smart-layout"
import type { Component } from "@/types/schema"
import type { ComponentTemplate } from "@/lib/component-library"

// Grid constants
const CELL_SIZE = 100
const GRID_COLOR = "rgba(128, 128, 128, 0.2)"

interface KonvaCanvasProps {
  width?: number
  height?: number
}

export function KonvaCanvas({
  width,
  height,
}: KonvaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  // Get store data
  const schema = useLayoutStore((state) => state.schema)
  const selectedComponentId = useLayoutStore((state) => state.selectedComponentId)
  const setSelectedComponentId = useLayoutStore((state) => state.setSelectedComponentId)
  const updateComponent = useLayoutStore((state) => state.updateComponent)
  const addComponent = useLayoutStore((state) => state.addComponent)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const addComponentToLayout = useLayoutStore((state) => state.addComponentToLayout)
  const deleteComponent = useLayoutStore((state) => state.deleteComponent)
  const addGridRow = useLayoutStore((state) => state.addGridRow)
  const addGridColumn = useLayoutStore((state) => state.addGridColumn)
  const removeGridRow = useLayoutStore((state) => state.removeGridRow)
  const removeGridColumn = useLayoutStore((state) => state.removeGridColumn)

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

  // Handle Space key for canvas panning and Delete key for component deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
      // Delete 또는 Backspace 키로 선택된 컴포넌트 삭제
      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponentId) {
        e.preventDefault()
        deleteComponent(selectedComponentId)
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
  }, [selectedComponentId, deleteComponent])

  // Use provided dimensions or container size
  const canvasWidth = width ?? containerSize.width
  const canvasHeight = height ?? containerSize.height

  // Get components in current layout (동기화: LayersTree와 동일한 selector 사용)
  const componentsInCurrentLayout = useComponentsInCurrentLayout()

  // Get current breakpoint's canvas layout for each component
  const componentsWithCanvas = componentsInCurrentLayout
    .map((c) => {
      // Use responsive layout (responsiveCanvasLayout) or fallback to canvasLayout
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
    const freshState = useLayoutStore.getState()
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
      // Fallback: update canvasLayout (backwards compatibility)
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
    const freshState = useLayoutStore.getState()
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
      // Fallback: update canvasLayout (backwards compatibility)
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

      // Get fresh components in current layout for smart positioning (동기화)
      const freshState = useLayoutStore.getState()
      const freshCurrentLayout = freshState.schema.layouts[currentBreakpoint as keyof typeof freshState.schema.layouts]
      const freshComponentIds = new Set(freshCurrentLayout.components)
      const freshComponentsInLayout = freshState.schema.components.filter((c) => freshComponentIds.has(c.id))

      // Calculate smart position based on semantic tag and positioning (2025 layout patterns)
      const smartPosition = calculateSmartPosition(
        template,
        gridCols,
        gridRows,
        freshComponentsInLayout,
        currentBreakpoint
      )

      const gridX = smartPosition.x
      const gridY = smartPosition.y
      const defaultWidth = smartPosition.width
      const defaultHeight = smartPosition.height

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

      // Add to store (addComponent already handles layout inheritance via normalizeSchema)
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
            <span className="text-sm font-medium">Konva Canvas</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">
              Pan & Zoom
            </span>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Grid:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => removeGridRow(currentBreakpoint)}
                  disabled={gridRows <= 2}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded transition-colors"
                  title="Remove Row"
                >
                  −
                </button>
                <span className="text-xs font-mono min-w-[2ch] text-center">{gridRows}</span>
                <button
                  onClick={() => addGridRow(currentBreakpoint)}
                  disabled={gridRows >= 24}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded transition-colors"
                  title="Add Row"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">×</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => removeGridColumn(currentBreakpoint)}
                  disabled={gridCols <= 2}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded transition-colors"
                  title="Remove Column"
                >
                  −
                </button>
                <span className="text-xs font-mono min-w-[2ch] text-center">{gridCols}</span>
                <button
                  onClick={() => addGridColumn(currentBreakpoint)}
                  disabled={gridCols >= 24}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded transition-colors"
                  title="Add Column"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <span>단축키</span>
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-96 p-5 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="text-base font-bold mb-4 text-gray-900">키보드 단축키</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">캔버스 이동</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono text-sm shadow-sm min-w-[80px] text-center">Space</kbd>
                    <span className="text-gray-500 text-sm">+ Drag</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">확대/축소</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono text-sm shadow-sm min-w-[80px] text-center">Ctrl</kbd>
                    <span className="text-gray-500 text-sm">+ Wheel</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">수평 이동</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono text-sm shadow-sm min-w-[80px] text-center">Shift</kbd>
                    <span className="text-gray-500 text-sm">+ Wheel</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0">컴포넌트 삭제</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono text-sm shadow-sm min-w-[80px] text-center">Delete</kbd>
                    <span className="text-gray-500 text-sm">또는</span>
                    <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono text-sm shadow-sm">⌫</kbd>
                  </div>
                </div>
              </div>
            </div>
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
            {/* Render non-selected components first */}
            {componentsWithCanvas
              .filter((c) => selectedComponentId !== c.id)
              .map((componentWithLayout) => {
                return (
                  <ComponentNode
                    key={componentWithLayout.id}
                    component={{
                      ...componentWithLayout,
                      canvasLayout: componentWithLayout.currentCanvasLayout,
                    }}
                    gridCols={gridCols}
                    gridRows={gridRows}
                    isSelected={false}
                    onClick={() => setSelectedComponentId(componentWithLayout.id)}
                    onDelete={() => deleteComponent(componentWithLayout.id)}
                    onDragEnd={(newX, newY) =>
                      handleComponentDragEnd(componentWithLayout.id, newX, newY)
                    }
                    onResizeEnd={(newWidth, newHeight) =>
                      handleComponentResize(componentWithLayout.id, newWidth, newHeight)
                    }
                  />
                )
              })}

            {/* Render selected component last (on top) */}
            {selectedComponentId &&
              componentsWithCanvas
                .filter((c) => selectedComponentId === c.id)
                .map((componentWithLayout) => {
                  return (
                    <ComponentNode
                      key={componentWithLayout.id}
                      component={{
                        ...componentWithLayout,
                        canvasLayout: componentWithLayout.currentCanvasLayout,
                      }}
                      gridCols={gridCols}
                      gridRows={gridRows}
                      isSelected={true}
                      onClick={() => setSelectedComponentId(componentWithLayout.id)}
                      onDelete={() => deleteComponent(componentWithLayout.id)}
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
