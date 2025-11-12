"use client"

import { useState } from "react"
import { Smartphone, Tablet, Monitor } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InitialBreakpointModalProps {
  open: boolean
  onSelect: (breakpoint: "mobile" | "tablet" | "desktop") => void
}

/**
 * InitialBreakpointModal - 초기 브레이크포인트 선택 모달
 *
 * 사용자가 프로젝트를 시작할 때 하나의 브레이크포인트를 선택하도록 함
 */
export function InitialBreakpointModal({ open, onSelect }: InitialBreakpointModalProps) {
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<"mobile" | "tablet" | "desktop" | null>(null)

  const breakpoints = [
    {
      type: "mobile" as const,
      name: "Mobile",
      description: "모바일 기기용 (4 columns)",
      icon: Smartphone,
      gridInfo: "4×8 그리드",
    },
    {
      type: "tablet" as const,
      name: "Tablet",
      description: "태블릿 기기용 (8 columns)",
      icon: Tablet,
      gridInfo: "8×8 그리드",
    },
    {
      type: "desktop" as const,
      name: "Desktop",
      description: "데스크톱 기기용 (12 columns)",
      icon: Monitor,
      gridInfo: "12×8 그리드",
    },
  ]

  const handleConfirm = () => {
    if (selectedBreakpoint) {
      onSelect(selectedBreakpoint)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>프로젝트 시작하기</DialogTitle>
          <DialogDescription>
            먼저 작업할 화면 크기를 선택하세요. 나중에 추가 브레이크포인트를 자유롭게 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {breakpoints.map((bp) => {
            const Icon = bp.icon
            const isSelected = selectedBreakpoint === bp.type

            return (
              <button
                key={bp.type}
                onClick={() => setSelectedBreakpoint(bp.type)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left hover:border-blue-300 hover:bg-blue-50",
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg",
                    isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{bp.name}</h3>
                    <span className="text-xs font-mono text-gray-500">
                      {bp.gridInfo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{bp.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={handleConfirm}
            disabled={!selectedBreakpoint}
            className="min-w-[100px]"
          >
            시작하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
