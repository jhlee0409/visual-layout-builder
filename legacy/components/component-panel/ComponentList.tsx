"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * ComponentItem - Individual component item
 */
function ComponentItem({
  component,
  isSelected,
  isVisible,
  currentBreakpoint,
  onSelect,
  onDelete,
}: {
  component: { id: string; name: string; semanticTag: string }
  isSelected: boolean
  isVisible: boolean
  currentBreakpoint: string
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-accent"
      )}
      onClick={onSelect}
    >
      {/* Component Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={isSelected ? "default" : "secondary"}>
            {component.id}
          </Badge>
          <span className="font-medium text-sm truncate">
            {component.name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            &lt;{component.semanticTag}&gt;
          </span>
          {isVisible ? (
            <Badge variant="outline" className="text-xs">
              Visible in {currentBreakpoint}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs opacity-50">
              Hidden in {currentBreakpoint}
            </Badge>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

/**
 * ComponentList - List of all components with select/delete actions
 */
export function ComponentList() {
  const components = useLayoutStore((state) => state.schema.components)
  const selectedComponentId = useLayoutStore(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )
  const deleteComponent = useLayoutStore((state) => state.deleteComponent)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const currentLayout = useLayoutStore(
    (state) => state.schema.layouts[state.currentBreakpoint]
  )

  // Check if component is visible in current breakpoint
  const isComponentVisible = (componentId: string) => {
    if (!currentLayout) return false
    const { areas } = currentLayout.grid
    return areas.some((row) => row.includes(componentId))
  }

  const handleSelect = (componentId: string) => {
    setSelectedComponentId(
      selectedComponentId === componentId ? null : componentId
    )
  }

  const handleDelete = (componentId: string, componentName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${componentName}"? This will remove it from all layouts.`
      )
    ) {
      deleteComponent(componentId)
    }
  }

  if (components.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Components</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No components yet. Add one above to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Components ({components.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            💡 Click component to edit, or drag/resize in grid
          </p>
          {components.map((component) => {
            const isSelected = selectedComponentId === component.id
            const isVisible = isComponentVisible(component.id)

            return (
              <ComponentItem
                key={component.id}
                component={component}
                isSelected={isSelected}
                isVisible={isVisible}
                currentBreakpoint={currentBreakpoint}
                onSelect={() => handleSelect(component.id)}
                onDelete={() => handleDelete(component.id, component.name)}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
