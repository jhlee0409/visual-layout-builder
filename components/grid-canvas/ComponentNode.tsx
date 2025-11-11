"use client"

import { Group, Rect, Text } from "react-konva"
import type { Component } from "@/types/schema"

const CELL_SIZE = 100

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
}: ComponentNodeProps) {
  const x = gridCol * CELL_SIZE
  const y = gridRow * CELL_SIZE
  const width = colSpan * CELL_SIZE
  const height = rowSpan * CELL_SIZE

  // Visual styling based on selection state
  const fillColor = isSelected ? "#eff6ff" : "#ffffff"
  const strokeColor = isSelected ? "#3b82f6" : "#cbd5e1"
  const strokeWidth = isSelected ? 3 : 2
  const shadowOpacity = isSelected ? 0.2 : 0.1

  return (
    <Group
      x={x}
      y={y}
      onClick={onClick}
      onTap={onClick}
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
    </Group>
  )
}
