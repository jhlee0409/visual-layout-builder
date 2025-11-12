"use client"

import { useState, useCallback } from "react"
import { Group, Rect, Text, Circle } from "react-konva"
import type { Component } from "@/types/schema"

const CELL_SIZE = 100
const HANDLE_SIZE = 12

interface ComponentNodeProps {
  component: Component
  /** Grid cell position (0-based) */
  gridRow: number
  gridCol: number
  /** Grid cell span */
  rowSpan: number
  colSpan: number
  /** Selection state */
  isSelected: boolean
  /** Click handler */
  onClick: () => void
  /** Drag end handler - returns new grid position */
  onDragEnd?: (newGridRow: number, newGridCol: number) => void
  /** Resize end handler - returns new span */
  onResizeEnd?: (newRowSpan: number, newColSpan: number) => void
  /** Grid bounds for validation */
  gridRows: number
  gridCols: number
  /** Stage reference for coordinate transformation */
  stageRef?: React.RefObject<any>
}

/**
 * ComponentNode - Renders a single component on the Konva canvas
 *
 * Converts grid cell coordinates to Konva pixel coordinates:
 * - x = gridCol * CELL_SIZE
 * - y = gridRow * CELL_SIZE
 * - width = colSpan * CELL_SIZE
 * - height = rowSpan * CELL_SIZE
 */
export function ComponentNode({
  component,
  gridRow,
  gridCol,
  rowSpan,
  colSpan,
  isSelected,
  onClick,
  onDragEnd,
  onResizeEnd,
  gridRows,
  gridCols,
}: ComponentNodeProps) {
  const x = gridCol * CELL_SIZE
  const y = gridRow * CELL_SIZE
  const baseWidth = colSpan * CELL_SIZE
  const baseHeight = rowSpan * CELL_SIZE

  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartSize, setResizeStartSize] = useState({ width: baseWidth, height: baseHeight })

  // Use resizing size if actively resizing, otherwise use base size
  const width = isResizing ? resizeStartSize.width : baseWidth
  const height = isResizing ? resizeStartSize.height : baseHeight

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

  // Calculate current span from resizing state
  const currentColSpan = isResizing
    ? Math.round(resizeStartSize.width / CELL_SIZE)
    : colSpan
  const currentRowSpan = isResizing
    ? Math.round(resizeStartSize.height / CELL_SIZE)
    : rowSpan

  // Handle drag move - constrain to grid bounds
  const handleDragMove = (e: any) => {
    e.cancelBubble = true

    const node = e.target
    const maxX = (gridCols - currentColSpan) * CELL_SIZE
    const maxY = (gridRows - currentRowSpan) * CELL_SIZE

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

    // Update visual position immediately
    node.x(newX)
    node.y(newY)

    // Calculate new grid position
    const newGridCol = Math.round(newX / CELL_SIZE)
    const newGridRow = Math.round(newY / CELL_SIZE)

    // Notify parent component
    if (onDragEnd) {
      onDragEnd(newGridRow, newGridCol)
    }
  }

  // Handle resize - called during drag of resize handle
  const handleResize = (newWidth: number, newHeight: number) => {
    // Calculate max allowed size based on grid bounds
    const maxWidth = (gridCols - gridCol) * CELL_SIZE
    const maxHeight = (gridRows - gridRow) * CELL_SIZE

    // Clamp to grid bounds and snap to grid
    const clampedWidth = Math.min(newWidth, maxWidth)
    const clampedHeight = Math.min(newHeight, maxHeight)

    const snappedWidth = Math.max(CELL_SIZE, snapToGrid(clampedWidth))
    const snappedHeight = Math.max(CELL_SIZE, snapToGrid(clampedHeight))

    setResizeStartSize({ width: snappedWidth, height: snappedHeight })

    // Return the snapped values for immediate use
    return { width: snappedWidth, height: snappedHeight }
  }

  // Handle resize end
  const handleResizeEnd = () => {
    // Calculate new span
    const newColSpan = Math.max(1, Math.round(resizeStartSize.width / CELL_SIZE))
    const newRowSpan = Math.max(1, Math.round(resizeStartSize.height / CELL_SIZE))

    // Notify parent if size changed
    if (onResizeEnd && (newColSpan !== colSpan || newRowSpan !== rowSpan)) {
      onResizeEnd(newRowSpan, newColSpan)
    }

    // Reset resize state
    setIsResizing(false)
    setResizeStartSize({ width: baseWidth, height: baseHeight })
  }

  return (
    <Group
      x={x}
      y={y}
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
            onDragStart={(e) => {
              e.cancelBubble = true
              setIsResizing(true)
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              const node = e.target
              const newWidth = node.x()
              const snappedSize = handleResize(newWidth, height)
              node.x(snappedSize.width)
              node.y(height / 2)
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
            onDragStart={(e) => {
              e.cancelBubble = true
              setIsResizing(true)
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              const node = e.target
              const newHeight = node.y()
              const snappedSize = handleResize(width, newHeight)
              node.x(width / 2)
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
            onDragStart={(e) => {
              e.cancelBubble = true
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
