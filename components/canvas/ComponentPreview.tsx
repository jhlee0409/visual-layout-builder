"use client"

import React from "react"
import { generateComponentClasses } from "@/lib/code-generator"
import type { Component } from "@/types/schema"

interface ComponentPreviewProps {
  component: Component
  isSelected: boolean
  onClick: () => void
}

/**
 * ComponentPreview - Component의 실제 positioning/layout preview
 *
 * Tailwind classes를 직접 적용하여 실제 모습을 미리보기
 */
export function ComponentPreview({
  component,
  isSelected,
  onClick,
}: ComponentPreviewProps) {
  const Tag = component.semanticTag as React.ElementType

  // Generate Tailwind classes
  const classes = generateComponentClasses(component)

  // Add selection and interaction classes
  const interactionClasses = [
    classes,
    "cursor-pointer transition-all",
    isSelected
      ? "ring-4 ring-blue-500 ring-opacity-50"
      : "hover:ring-2 hover:ring-blue-300 hover:ring-opacity-30",
  ].join(" ")

  // Component content for preview
  const content = (
    <>
      {/* Component label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
        <div className="font-semibold">{component.name}</div>
        <div className="opacity-70">
          &lt;{component.semanticTag}&gt;
        </div>
      </div>

      {/* Component content placeholder */}
      <div className="p-8 text-gray-400 text-sm">
        {component.props?.children as string || `[${component.name} Content]`}
      </div>
    </>
  )

  // If container layout, wrap with container div
  if (component.layout.type === "container" && component.layout.container) {
    const { maxWidth, padding, centered } = component.layout.container
    const containerClasses = [
      "container",
      maxWidth && maxWidth !== "full" ? `max-w-${maxWidth}` : "",
      centered !== false ? "mx-auto" : "",
      padding ? `px-${padding}` : "",
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <Tag className={interactionClasses} onClick={onClick}>
        <div className={containerClasses}>{content}</div>
      </Tag>
    )
  }

  return (
    <Tag className={interactionClasses} onClick={onClick}>
      {content}
    </Tag>
  )
}
