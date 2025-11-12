"use client"

import { useState } from "react"
import {
  useLayoutStoreV2,
  useCurrentBreakpointConfigV2,
} from "@/store/layout-store-v2"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_GRID_CONFIG } from "@/lib/schema-utils-v2"
import type { Breakpoint } from "@/types/schema-v2"
import { useToast } from "@/store/toast-store"
import { useConfirm } from "@/store/alert-dialog-store"

/**
 * BreakpointSwitcherV2 - Breakpoint 전환 UI (Schema V2)
 *
 * 모바일/태블릿/데스크톱 뷰를 쉽게 전환할 수 있는 Responsive Preview
 */
export function BreakpointSwitcherV2() {
  const [isAddingBreakpoint, setIsAddingBreakpoint] = useState(false)
  const [newBreakpointName, setNewBreakpointName] = useState("")
  const [newBreakpointMinWidth, setNewBreakpointMinWidth] = useState("")

  const breakpoints = useLayoutStoreV2((state) => state.schema.breakpoints)
  const currentBreakpoint = useLayoutStoreV2((state) => state.currentBreakpoint)
  const setCurrentBreakpoint = useLayoutStoreV2(
    (state) => state.setCurrentBreakpoint
  )
  const addBreakpoint = useLayoutStoreV2((state) => state.addBreakpoint)
  const deleteBreakpoint = useLayoutStoreV2((state) => state.deleteBreakpoint)
  const currentBreakpointConfig = useCurrentBreakpointConfigV2()

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
      warning("브레이크포인트 이름과 최소 너비를 입력하세요.")
      return
    }

    const minWidth = parseInt(newBreakpointMinWidth, 10)
    if (isNaN(minWidth) || minWidth < 0) {
      error("올바른 최소 너비를 입력하세요.")
      return
    }

    // 중복 이름 체크
    if (breakpoints.some(bp => bp.name === newBreakpointName)) {
      error("이미 존재하는 브레이크포인트 이름입니다.")
      return
    }

    const newBreakpoint: Breakpoint = {
      name: newBreakpointName,
      minWidth,
      gridCols: DEFAULT_GRID_CONFIG[newBreakpointName as keyof typeof DEFAULT_GRID_CONFIG]?.gridCols ?? 12,
      gridRows: DEFAULT_GRID_CONFIG[newBreakpointName as keyof typeof DEFAULT_GRID_CONFIG]?.gridRows ?? 8,
    }

    addBreakpoint(newBreakpoint)
    setNewBreakpointName("")
    setNewBreakpointMinWidth("")
    setIsAddingBreakpoint(false)
  }

  // 브레이크포인트 삭제
  const handleDeleteBreakpoint = async (name: string) => {
    if (breakpoints.length <= 1) {
      warning("최소 1개의 브레이크포인트가 필요합니다.")
      return
    }

    const confirmed = await confirm({
      title: "브레이크포인트 삭제",
      description: `"${name}" 브레이크포인트를 삭제하시겠습니까?`,
      confirmText: "삭제",
      cancelText: "취소",
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
                    title={`${breakpoint.name} 삭제`}
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
              title="브레이크포인트 추가"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          ) : (
            <div className="flex gap-2 items-center border rounded-md p-2 bg-white">
              <input
                type="text"
                placeholder="이름"
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
                placeholder="너비"
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
                확인
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
                취소
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
