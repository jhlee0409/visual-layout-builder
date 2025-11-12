"use client"

import { useState, useRef, useEffect } from "react"
import { Group, Rect, Text, Circle } from "react-konva"
import type { Component } from "@/types/schema-v2"

const CELL_SIZE = 100
const HANDLE_SIZE = 12

interface ComponentNodeV2Props {
  component: Component
  /** Selection state */
  isSelected: boolean
  /** Click handler */
  onClick: () => void
  /** Delete handler */
  onDelete?: () => void
  /** Drag end handler - returns true if successful, false if blocked */
  onDragEnd?: (newX: number, newY: number) => boolean
  /** Resize end handler - returns true if successful, false if blocked */
  onResizeEnd?: (newWidth: number, newHeight: number) => boolean
  /** Grid bounds for validation */
  gridRows: number
  gridCols: number
}

/**
 * ComponentNodeV2 - Renders a single component on the Konva canvas (V2)
 *
 * Positioning based on canvasLayout (passed from parent):
 * - x = canvasLayout.x * CELL_SIZE
 * - y = canvasLayout.y * CELL_SIZE
 * - width = canvasLayout.width * CELL_SIZE
 * - height = canvasLayout.height * CELL_SIZE
 *
 * Note: Parent (KonvaCanvasV2) determines layout source:
 * - Prefers responsiveCanvasLayout[breakpoint]
 * - Falls back to canvasLayout for backwards compatibility
 */
export function ComponentNodeV2({
  component,
  isSelected,
  onClick,
  onDelete,
  onDragEnd,
  onResizeEnd,
  gridRows,
  gridCols,
}: ComponentNodeV2Props) {
  const { x: gridX = 0, y: gridY = 0, width: gridWidth = 1, height: gridHeight = 1 } = component.canvasLayout || {}

  const x = gridX * CELL_SIZE
  const y = gridY * CELL_SIZE
  const baseWidth = gridWidth * CELL_SIZE
  const baseHeight = gridHeight * CELL_SIZE

  const [isResizing, setIsResizing] = useState(false)
  const [resizeSize, setResizeSize] = useState({ width: baseWidth, height: baseHeight })
  const [resizePosition, setResizePosition] = useState({ x, y })

  // Store original values when resize starts
  const originalValuesRef = useRef({ x, y, width: baseWidth, height: baseHeight })

  // Always use latest size (resizeSize is updated during resize, baseWidth/baseHeight for non-resize)
  const width = isResizing ? resizeSize.width : baseWidth
  const height = isResizing ? resizeSize.height : baseHeight
  const groupX = isResizing ? resizePosition.x : x
  const groupY = isResizing ? resizePosition.y : y

  // Ref to track latest width/height/position for use in closures
  const widthRef = useRef(width)
  const heightRef = useRef(height)
  const positionRef = useRef({ x: groupX, y: groupY })

  useEffect(() => {
    widthRef.current = width
    heightRef.current = height
    positionRef.current = { x: groupX, y: groupY }
  }, [width, height, groupX, groupY])

  // Early return if no canvasLayout
  if (!component.canvasLayout) {
    return null
  }

  // Visual styling based on selection state
  const fillColor = isSelected ? "#eff6ff" : "#ffffff"
  const strokeColor = isSelected ? "#3b82f6" : "#cbd5e1"
  const strokeWidth = isSelected ? 3 : 2
  const shadowOpacity = isSelected ? 0.2 : 0.1

  // Snap to grid helper
  const snapToGrid = (value: number) => {
    return Math.round(value / CELL_SIZE) * CELL_SIZE
  }

  // Handle drag start - prevent event propagation to Stage
  const handleDragStart = (e: any) => {
    // Stop event from bubbling to Stage
    e.cancelBubble = true
  }

  // Calculate current grid span from resizing state
  const currentGridWidth = isResizing
    ? Math.round(resizeSize.width / CELL_SIZE)
    : gridWidth
  const currentGridHeight = isResizing
    ? Math.round(resizeSize.height / CELL_SIZE)
    : gridHeight

  // Handle drag move - constrain to grid bounds
  const handleDragMove = (e: any) => {
    e.cancelBubble = true

    const node = e.target
    const maxX = (gridCols - currentGridWidth) * CELL_SIZE
    const maxY = (gridRows - currentGridHeight) * CELL_SIZE

    // Clamp position
    const clampedX = Math.max(0, Math.min(node.x(), maxX))
    const clampedY = Math.max(0, Math.min(node.y(), maxY))

    node.x(clampedX)
    node.y(clampedY)
  }

  // Handle drag end - snap to grid and update position
  const handleDragEnd = (e: any) => {
    // Stop event from bubbling to Stage
    e.cancelBubble = true

    const node = e.target
    const newX = snapToGrid(node.x())
    const newY = snapToGrid(node.y())

    // Calculate new grid position
    const newGridX = Math.round(newX / CELL_SIZE)
    const newGridY = Math.round(newY / CELL_SIZE)

    // Notify parent component and check if move is allowed
    let moveAllowed = true
    if (onDragEnd) {
      moveAllowed = onDragEnd(newGridX, newGridY)
    }

    if (moveAllowed) {
      // Update visual position to snapped position
      node.x(newX)
      node.y(newY)
    } else {
      // Revert to original position
      node.x(x)
      node.y(y)
    }
  }

  // Handle resize - called during drag of resize handle (right, bottom, bottom-right)
  const handleResize = (newWidth: number, newHeight: number) => {
    // Calculate max allowed size based on grid bounds
    const maxWidth = (gridCols - gridX) * CELL_SIZE
    const maxHeight = (gridRows - gridY) * CELL_SIZE

    // Clamp to grid bounds and snap to grid
    const clampedWidth = Math.min(newWidth, maxWidth)
    const clampedHeight = Math.min(newHeight, maxHeight)

    const snappedWidth = Math.max(CELL_SIZE, snapToGrid(clampedWidth))
    const snappedHeight = Math.max(CELL_SIZE, snapToGrid(clampedHeight))

    // Update resize state with latest values
    setResizeSize({ width: snappedWidth, height: snappedHeight })

    // Update refs immediately for use in closures
    widthRef.current = snappedWidth
    heightRef.current = snappedHeight

    // Return the snapped values for immediate use
    return { width: snappedWidth, height: snappedHeight }
  }

  // Handle resize end
  const handleResizeEnd = () => {
    // Calculate new grid position and span from LATEST resize states
    const newGridX = Math.round(resizePosition.x / CELL_SIZE)
    const newGridY = Math.round(resizePosition.y / CELL_SIZE)
    const newGridWidth = Math.max(1, Math.round(resizeSize.width / CELL_SIZE))
    const newGridHeight = Math.max(1, Math.round(resizeSize.height / CELL_SIZE))

    // Check if position or size changed
    const positionChanged = newGridX !== gridX || newGridY !== gridY
    const sizeChanged = newGridWidth !== gridWidth || newGridHeight !== gridHeight

    let resizeAllowed = true

    // If position changed, need to check drag callback
    if (positionChanged && onDragEnd) {
      resizeAllowed = onDragEnd(newGridX, newGridY)
    }

    // If size changed, check resize callback
    if (resizeAllowed && sizeChanged && onResizeEnd) {
      resizeAllowed = onResizeEnd(newGridWidth, newGridHeight)
    }

    // Reset resize state (always reset to clear resizing mode)
    setIsResizing(false)

    if (resizeAllowed) {
      // Keep the new size and position
      setResizeSize({ width: baseWidth, height: baseHeight })
      setResizePosition({ x, y })
    } else {
      // Revert to original size and position
      setResizeSize({ width: baseWidth, height: baseHeight })
      setResizePosition({ x, y })
    }
  }

  return (
    <Group
      x={groupX}
      y={groupY}
      draggable
      onClick={onClick}
      onTap={onClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Component background */}
      <Rect
        width={width}
        height={height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={6}
        shadowOpacity={shadowOpacity}
        shadowOffsetX={0}
        shadowOffsetY={2}
      />

      {/* Component name */}
      <Text
        x={12}
        y={12}
        width={width - 24}
        text={component.name}
        fontSize={16}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="#0f172a"
        ellipsis={true}
        wrap="none"
      />

      {/* Semantic tag */}
      <Text
        x={12}
        y={36}
        width={width - 24}
        text={`<${component.semanticTag}>`}
        fontSize={12}
        fontFamily="'Fira Code', monospace"
        fill="#64748b"
        ellipsis={true}
        wrap="none"
      />

      {/* Component ID (bottom right) */}
      <Text
        x={width - 60}
        y={height - 28}
        width={48}
        text={component.id}
        fontSize={10}
        fontFamily="'Fira Code', monospace"
        fill="#94a3b8"
        align="right"
      />

      {/* Canvas position indicator (top right) */}
      <Text
        x={width - 80}
        y={12}
        width={68}
        text={`[${gridX},${gridY}]`}
        fontSize={10}
        fontFamily="'Fira Code', monospace"
        fill="#94a3b8"
        align="right"
      />

      {/* Delete Button - only show when selected */}
      {isSelected && onDelete && (
        <Group
          x={width - 16}
          y={-16}
          onClick={(e) => {
            e.cancelBubble = true
            onDelete()
          }}
          onTap={(e) => {
            e.cancelBubble = true
            onDelete()
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor = "pointer"
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor = "default"
          }}
        >
          {/* Delete button background */}
          <Circle
            radius={14}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={2}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.3}
            shadowOffsetX={0}
            shadowOffsetY={2}
          />
          {/* X icon */}
          <Text
            x={-7}
            y={-8}
            text="×"
            fontSize={20}
            fontFamily="Arial"
            fontStyle="bold"
            fill="#ffffff"
          />
        </Group>
      )}

      {/* Resize Handles - only show when selected */}
      {isSelected && (
        <>
          {/* Right handle */}
          <Circle
            x={width}
            y={height / 2}
            radius={HANDLE_SIZE / 2}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "ew-resize"
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "default"
            }}
            onDragStart={(e) => {
              e.cancelBubble = true
              // Store original values when resize starts
              originalValuesRef.current = { x, y, width: baseWidth, height: baseHeight }
              setResizeSize({ width: baseWidth, height: baseHeight })
              setResizePosition({ x, y })
              setIsResizing(true)
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              const node = e.target
              const newWidth = node.x()
              const currentHeight = heightRef.current
              const snappedSize = handleResize(newWidth, currentHeight)
              node.x(snappedSize.width)
              node.y(snappedSize.height / 2)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              handleResizeEnd()
            }}
          />

          {/* Bottom handle */}
          <Circle
            x={width / 2}
            y={height}
            radius={HANDLE_SIZE / 2}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "ns-resize"
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "default"
            }}
            onDragStart={(e) => {
              e.cancelBubble = true
              // Store original values when resize starts
              originalValuesRef.current = { x, y, width: baseWidth, height: baseHeight }
              setResizeSize({ width: baseWidth, height: baseHeight })
              setResizePosition({ x, y })
              setIsResizing(true)
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              const node = e.target
              const newHeight = node.y()
              const currentWidth = widthRef.current
              const snappedSize = handleResize(currentWidth, newHeight)
              node.x(snappedSize.width / 2)
              node.y(snappedSize.height)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              handleResizeEnd()
            }}
          />

          {/* Bottom-right corner handle */}
          <Circle
            x={width}
            y={height}
            radius={HANDLE_SIZE / 2}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "nwse-resize"
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = "default"
            }}
            onDragStart={(e) => {
              e.cancelBubble = true
              // Store original values when resize starts
              originalValuesRef.current = { x, y, width: baseWidth, height: baseHeight }
              setResizeSize({ width: baseWidth, height: baseHeight })
              setResizePosition({ x, y })
              setIsResizing(true)
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              const node = e.target
              const newWidth = node.x()
              const newHeight = node.y()
              const snappedSize = handleResize(newWidth, newHeight)
              node.x(snappedSize.width)
              node.y(snappedSize.height)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              handleResizeEnd()
            }}
          />
        </>
      )}
    </Group>
  )
}
