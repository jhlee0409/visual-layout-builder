"use client"

import { useLayoutStore, useCurrentBreakpointConfig } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BreakpointSwitcher - Switch between different viewport breakpoints
 * Allows users to view and edit different responsive layouts
 */
export function BreakpointSwitcher() {
  const breakpoints = useLayoutStore((state) => state.schema.breakpoints)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const setCurrentBreakpoint = useLayoutStore(
    (state) => state.setCurrentBreakpoint
  )
  const currentBreakpointConfig = useCurrentBreakpointConfig()

  // Map breakpoint names to icons
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("mobile") || lowerName.includes("phone")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (lowerName.includes("tablet") || lowerName.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Responsive View:</span>
          {currentBreakpointConfig && (
            <Badge variant="outline" className="font-mono">
              ≥ {currentBreakpointConfig.minWidth}px
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {breakpoints.map((breakpoint) => {
            const isActive = currentBreakpoint === breakpoint.name

            return (
              <Button
                key={breakpoint.name}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentBreakpoint(breakpoint.name)}
                className={cn(
                  "gap-2",
                  !isActive && "text-muted-foreground"
                )}
              >
                {getIcon(breakpoint.name)}
                <span className="capitalize">{breakpoint.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
