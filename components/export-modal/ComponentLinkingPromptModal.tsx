"use client"

import { useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Link, Sparkles, ArrowRight } from "lucide-react"

export interface ComponentLinkingPromptModalProps {
  open: boolean
  breakpointCount: number
  onLinkComponents: () => void
  onSkip: () => void
}

/**
 * Component Linking Prompt Modal
 *
 * Generate Prompt 실행 전에 Component Linking을 유도하는 모달
 * - 반응형 디자인의 일관성을 위해 링킹 추천
 * - 사용자에게 명확한 선택지 제공 (Link Now / Skip)
 */
export function ComponentLinkingPromptModal({
  open,
  breakpointCount,
  onLinkComponents,
  onSkip,
}: ComponentLinkingPromptModalProps) {
  const linkButtonRef = useRef<HTMLButtonElement>(null)

  const handleOpenChange = (isOpen: boolean) => {
    // Dialog closed by ESC/outside click → treat as Skip
    if (!isOpen) {
      onSkip()
    }
  }

  // Focus management: Focus primary action button when modal opens
  useEffect(() => {
    if (open) {
      // Delay focus to ensure DOM is ready
      const timer = setTimeout(() => {
        linkButtonRef.current?.focus()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4">
                <Link className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Link Components for Better AI Results
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            You have <span className="font-semibold text-blue-600">{breakpointCount} breakpoints</span> but no component links defined yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-sm text-gray-900">AI generates more consistent code</div>
                <div className="text-xs text-gray-600 mt-1">
                  Linked components tell the AI which elements are the same across breakpoints
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-medium text-sm text-gray-900">Maintains responsive design integrity</div>
                <div className="text-xs text-gray-600 mt-1">
                  Ensures headers, navbars, and other shared components remain consistent
                </div>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">💡 Example:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Link <span className="font-mono bg-white px-1.5 py-0.5 rounded">Header (mobile)</span> → <span className="font-mono bg-white px-1.5 py-0.5 rounded">Header (desktop)</span></div>
              <div className="ml-4 text-gray-500">→ AI knows they&apos;re the same component, just responsive</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              ref={linkButtonRef}
              onClick={onLinkComponents}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Link className="w-4 h-4" aria-hidden="true" />
              Link Components Now
            </Button>
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Skip for Now
            </Button>
          </div>

          {/* Note */}
          <div className="text-center text-xs text-gray-500 pt-2">
            You can also link components later from the header menu
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
