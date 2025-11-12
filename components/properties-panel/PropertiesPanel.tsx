"use client"

import { useLayoutStore, useSelectedComponent } from "@/store/layout-store"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { ComponentPositioning, ComponentLayout, ComponentStyling } from "@/types/schema"

/**
 * Properties Panel - Schema 컴포넌트 속성 편집
 *
 * Positioning, Layout, Styling, Responsive 편집 UI
 */
export function PropertiesPanel() {
  const selectedComponent = useSelectedComponent()
  const updateComponentPositioning = useLayoutStore((state) => state.updateComponentPositioning)
  const updateComponentLayout = useLayoutStore((state) => state.updateComponentLayout)
  const updateComponentStyling = useLayoutStore((state) => state.updateComponentStyling)

  if (!selectedComponent) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">
          <div className="text-lg font-semibold mb-2">No component selected</div>
          <div className="text-sm">Select a component to edit its properties</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Component Info */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{selectedComponent.name}</h3>
          <Badge variant="outline">{selectedComponent.id}</Badge>
        </div>
        <div className="text-sm text-gray-600">
          &lt;{selectedComponent.semanticTag}&gt;
        </div>
      </div>

      {/* Positioning */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Positioning</Label>

        <div className="space-y-2">
          <Label className="text-sm">Type</Label>
          <Select
            value={selectedComponent.positioning.type}
            onValueChange={(value: ComponentPositioning["type"]) => {
              updateComponentPositioning(selectedComponent.id, {
                ...selectedComponent.positioning,
                type: value,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="sticky">Sticky</SelectItem>
              <SelectItem value="absolute">Absolute</SelectItem>
              <SelectItem value="relative">Relative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedComponent.positioning.type !== "static" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm">Top</Label>
              <Input
                type="text"
                placeholder="0, 4rem, etc"
                value={selectedComponent.positioning.position?.top ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  updateComponentPositioning(selectedComponent.id, {
                    ...selectedComponent.positioning,
                    position: {
                      ...selectedComponent.positioning.position,
                      top: value === "" ? undefined : (isNaN(Number(value)) ? value : Number(value)),
                    },
                  })
                }}
              />
            </div>
            <div>
              <Label className="text-sm">Z-Index</Label>
              <Input
                type="number"
                placeholder="50"
                value={selectedComponent.positioning.position?.zIndex ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  updateComponentPositioning(selectedComponent.id, {
                    ...selectedComponent.positioning,
                    position: {
                      ...selectedComponent.positioning.position,
                      zIndex: value === "" ? undefined : Number(value),
                    },
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Layout</Label>

        <div className="space-y-2">
          <Label className="text-sm">Type</Label>
          <Select
            value={selectedComponent.layout.type}
            onValueChange={(value: ComponentLayout["type"]) => {
              let newLayout: ComponentLayout

              switch (value) {
                case "flex":
                  newLayout = { type: "flex", flex: { direction: "column" } }
                  break
                case "grid":
                  newLayout = { type: "grid", grid: { cols: 3 } }
                  break
                case "container":
                  newLayout = { type: "container", container: { maxWidth: "7xl", centered: true } }
                  break
                default:
                  newLayout = { type: "none" }
              }

              updateComponentLayout(selectedComponent.id, newLayout)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flex options */}
        {selectedComponent.layout.type === "flex" && selectedComponent.layout.flex && (
          <div className="space-y-2">
            <Label className="text-sm">Direction</Label>
            <Select
              value={selectedComponent.layout.flex.direction}
              onValueChange={(value) => {
                updateComponentLayout(selectedComponent.id, {
                  type: "flex",
                  flex: {
                    ...selectedComponent.layout.flex,
                    direction: value as "row" | "column",
                  },
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row">Row</SelectItem>
                <SelectItem value="column">Column</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Container options */}
        {selectedComponent.layout.type === "container" && selectedComponent.layout.container && (
          <div className="space-y-2">
            <Label className="text-sm">Max Width</Label>
            <Select
              value={selectedComponent.layout.container.maxWidth}
              onValueChange={(value) => {
                updateComponentLayout(selectedComponent.id, {
                  type: "container",
                  container: {
                    ...selectedComponent.layout.container,
                    maxWidth: value as any,
                  },
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="7xl">7XL</SelectItem>
                <SelectItem value="6xl">6XL</SelectItem>
                <SelectItem value="5xl">5XL</SelectItem>
                <SelectItem value="4xl">4XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Styling */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Styling</Label>

        <div className="space-y-2">
          <Label className="text-sm">Background</Label>
          <Input
            type="text"
            placeholder="white, gray-100, etc"
            value={selectedComponent.styling?.background ?? ""}
            onChange={(e) => {
              updateComponentStyling(selectedComponent.id, {
                ...selectedComponent.styling,
                background: e.target.value || undefined,
              })
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Border</Label>
          <Select
            value={selectedComponent.styling?.border ?? "none"}
            onValueChange={(value) => {
              updateComponentStyling(selectedComponent.id, {
                ...selectedComponent.styling,
                border: value === "none" ? undefined : (value as any),
              })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="b">Bottom</SelectItem>
              <SelectItem value="t">Top</SelectItem>
              <SelectItem value="r">Right</SelectItem>
              <SelectItem value="l">Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
