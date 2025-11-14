"use client"

import { useRef, useState, useEffect } from "react"
import { useLayoutStore } from "@/store/layout-store"
import { ComponentPreview } from "./ComponentPreview"
import { generateComponentClasses } from "@/lib/code-generator"

/**
 * Canvas - Schema Preview
 *
 * Grid-template-areas 제거, Component Independence 기반
 * 실제 positioning (fixed, sticky, static)을 preview로 표시
 */
export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5) // 50% zoom for preview

  const schema = useLayoutStore((state) => state.schema)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const selectedComponentId = useLayoutStore((state) => state.selectedComponentId)
  const setSelectedComponentId = useLayoutStore((state) => state.setSelectedComponentId)

  const currentLayout = schema.layouts[currentBreakpoint]

  // Get components in current layout
  const componentsInLayout = schema.components.filter((c) =>
    currentLayout.components.includes(c.id)
  )

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY * -0.001
      setScale((prev) => Math.max(0.1, Math.min(2, prev + delta)))
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50 rounded-lg border-2 border-gray-200 overflow-auto"
      onWheel={handleWheel}
    >
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 bg-white rounded-lg shadow-sm border p-2">
        <button
          onClick={() => setScale((prev) => Math.max(0.1, prev - 0.1))}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          −
        </button>
        <span className="px-3 py-1 text-sm font-medium">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
        >
          100%
        </button>
      </div>

      {/* Info banner */}
      <div className="absolute top-4 left-4 z-40 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
        <div className="font-semibold">Schema Preview</div>
        <div className="text-xs text-blue-600">
          {currentLayout.structure} layout • {componentsInLayout.length} components
        </div>
      </div>

      {/* Canvas container with scale */}
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
          minHeight: `${100 / scale}%`,
        }}
      >
        {/* Desktop preview viewport (1920x1080) */}
        <div
          className="relative mx-auto my-20"
          style={{
            width: 1920,
            minHeight: 1080,
            transform: 'scale(1)', // Create new containing block for fixed positioning
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-white shadow-2xl" />

          {/* Component previews */}
          {componentsInLayout.map((component) => (
            <ComponentPreview
              key={component.id}
              component={component}
              isSelected={selectedComponentId === component.id}
              onClick={() => setSelectedComponentId(component.id)}
            />
          ))}

          {/* Empty state */}
          {componentsInLayout.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-lg font-semibold mb-2">No components</div>
                <div className="text-sm">Add components to see the preview</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
