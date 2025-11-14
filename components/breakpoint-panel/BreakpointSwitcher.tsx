"use client"

import { useState } from "react"
import {
  useLayoutStore,
  useCurrentBreakpointConfig,
} from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_GRID_CONFIG } from "@/lib/schema-utils"
import type { Breakpoint } from "@/types/schema"
import { useToast } from "@/store/toast-store"
import { useConfirm } from "@/store/alert-dialog-store"

/**
 * BreakpointSwitcher - Breakpoint 전환 UI (Schema)
 *
 * 모바일/태블릿/데스크톱 뷰를 쉽게 전환할 수 있는 Responsive Preview
 */
export function BreakpointSwitcher() {
  const [isAddingBreakpoint, setIsAddingBreakpoint] = useState(false)
  const [newBreakpointName, setNewBreakpointName] = useState("")
  const [newBreakpointMinWidth, setNewBreakpointMinWidth] = useState("")

  const breakpoints = useLayoutStore((state) => state.schema.breakpoints)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const setCurrentBreakpoint = useLayoutStore(
    (state) => state.setCurrentBreakpoint
  )
  const addBreakpoint = useLayoutStore((state) => state.addBreakpoint)
  const deleteBreakpoint = useLayoutStore((state) => state.deleteBreakpoint)
  const currentBreakpointConfig = useCurrentBreakpointConfig()

  const { warning, error } = useToast()
  const confirm = useConfirm()

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

  // 브레이크포인트 추가
  const handleAddBreakpoint = () => {
    if (!newBreakpointName.trim() || !newBreakpointMinWidth) {
      warning("Please enter breakpoint name and minimum width")
      return
    }

    const minWidth = parseInt(newBreakpointMinWidth, 10)
    if (isNaN(minWidth) || minWidth < 0) {
      error("Please enter a valid minimum width")
      return
    }

    // 중복 이름 체크
    if (breakpoints.some(bp => bp.name === newBreakpointName)) {
      error("Breakpoint name already exists")
      return
    }

    const newBreakpoint: Breakpoint = {
      name: newBreakpointName,
      minWidth,
      gridCols: DEFAULT_GRID_CONFIG[newBreakpointName]?.gridCols ?? 12,
      gridRows: DEFAULT_GRID_CONFIG[newBreakpointName]?.gridRows ?? 8,
    }

    addBreakpoint(newBreakpoint)
    setNewBreakpointName("")
    setNewBreakpointMinWidth("")
    setIsAddingBreakpoint(false)
  }

  // 브레이크포인트 삭제
  const handleDeleteBreakpoint = async (name: string) => {
    if (breakpoints.length <= 1) {
      warning("At least one breakpoint is required")
      return
    }

    const confirmed = await confirm({
      title: "Delete Breakpoint",
      description: `Are you sure you want to delete breakpoint "${name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    })

    if (confirmed) {
      deleteBreakpoint(name)
    }
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
        <div className="flex gap-2 items-center">
          {breakpoints.map((breakpoint) => {
            const isActive = currentBreakpoint === breakpoint.name

            return (
              <div key={breakpoint.name} className="relative group">
                <Button
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

                {/* 삭제 버튼 (hover 시 표시, 1개만 남았을 때는 숨김) */}
                {breakpoints.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteBreakpoint(breakpoint.name)
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    title={`Delete ${breakpoint.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}

          {/* 브레이크포인트 추가 버튼 */}
          {!isAddingBreakpoint ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingBreakpoint(true)}
              className="gap-1"
              title="Add breakpoint"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          ) : (
            <div className="flex gap-2 items-center border rounded-md p-2 bg-white">
              <input
                type="text"
                placeholder="Name"
                value={newBreakpointName}
                onChange={(e) => setNewBreakpointName(e.target.value)}
                className="w-20 px-2 py-1 text-sm border rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddBreakpoint()
                  if (e.key === "Escape") setIsAddingBreakpoint(false)
                }}
                autoFocus
              />
              <input
                type="number"
                placeholder="Width"
                value={newBreakpointMinWidth}
                onChange={(e) => setNewBreakpointMinWidth(e.target.value)}
                className="w-16 px-2 py-1 text-sm border rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddBreakpoint()
                  if (e.key === "Escape") setIsAddingBreakpoint(false)
                }}
              />
              <Button
                size="sm"
                onClick={handleAddBreakpoint}
                className="h-7"
              >
                OK
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingBreakpoint(false)
                  setNewBreakpointName("")
                  setNewBreakpointMinWidth("")
                }}
                className="h-7"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
