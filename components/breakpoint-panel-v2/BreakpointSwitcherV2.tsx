"use client"

import {
  useLayoutStoreV2,
  useCurrentBreakpointConfigV2,
} from "@/store/layout-store-v2"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BreakpointSwitcherV2 - Breakpoint 전환 UI (Schema V2)
 *
 * 모바일/태블릿/데스크톱 뷰를 쉽게 전환할 수 있는 Responsive Preview
 */
export function BreakpointSwitcherV2() {
  const breakpoints = useLayoutStoreV2((state) => state.schema.breakpoints)
  const currentBreakpoint = useLayoutStoreV2((state) => state.currentBreakpoint)
  const setCurrentBreakpoint = useLayoutStoreV2(
    (state) => state.setCurrentBreakpoint
  )
  const currentBreakpointConfig = useCurrentBreakpointConfigV2()

  // Breakpoint 이름에 따라 아이콘 매핑
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
        {/* Current Breakpoint Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Responsive View:</span>
          {currentBreakpointConfig && (
            <Badge variant="outline" className="font-mono">
              ≥ {currentBreakpointConfig.minWidth}px
            </Badge>
          )}
        </div>

        {/* Breakpoint Buttons */}
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
                  "gap-2 transition-all",
                  !isActive && "text-muted-foreground hover:text-foreground"
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
