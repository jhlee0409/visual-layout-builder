"use client"

import { useState } from "react"
import { BreakpointSwitcherV2 } from "@/components/breakpoint-panel-v2"
import { LibraryPanelV2 } from "@/components/library-panel-v2"
import { LayersTreeV2 } from "@/components/layers-tree-v2"
import { KonvaCanvasV2 } from "@/components/canvas-v2"
import { PropertiesPanelV2 } from "@/components/properties-panel-v2"
import { ExportModalV2 } from "@/components/export-modal-v2"
import { ThemeSelectorV2 } from "@/components/theme-selector-v2"
import { Button } from "@/components/ui/button"
import { useLayoutStoreV2 } from "@/store/layout-store-v2"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/**
 * Laylder V2 - Schema V2 기반 MVP
 *
 * Component Independence 아키텍처
 * - Library Panel: 컴포넌트 템플릿 추가
 * - Layers Tree: 드래그로 순서 변경
 * - Canvas: 실시간 프리뷰
 * - Properties Panel: 속성 편집
 * - Breakpoint Switcher: 반응형 전환
 */
export default function V2Page() {
  const [activeTab, setActiveTab] = useState<"layers" | "properties">("layers")

  const componentCount = useLayoutStoreV2(
    (state) => state.schema.components.length
  )
  const resetSchema = useLayoutStoreV2((state) => state.resetSchema)
  const loadSampleSchema = useLayoutStoreV2((state) => state.loadSampleSchema)

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                V1
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Laylder V2</h1>
              <p className="text-xs text-muted-foreground">
                Schema V2 - Component Independence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {componentCount} components
            </span>
            <ThemeSelectorV2 />
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleSchema("github")}
            >
              Load Sample
            </Button>
            <Button variant="outline" size="sm" onClick={resetSchema}>
              Reset
            </Button>
            <ExportModalV2 />
          </div>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel: Library */}
        <aside className="w-[280px] border-r bg-gray-50 overflow-y-auto flex-shrink-0">
          <LibraryPanelV2 />
        </aside>

        {/* Center Panel: Canvas + Breakpoint Switcher */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Breakpoint Switcher */}
          <div className="flex-shrink-0 p-4 border-b">
            <BreakpointSwitcherV2 />
          </div>

          {/* Konva Canvas - 브레이크포인트별 동적 그리드 */}
          <div className="flex-1 overflow-hidden">
            <KonvaCanvasV2 />
          </div>
        </div>

        {/* Right Panel: Layers + Properties (Tabs) */}
        <aside className="w-[320px] border-l bg-white flex flex-col overflow-hidden flex-shrink-0">
          {/* Tabs */}
          <div className="flex-shrink-0 border-b">
            <div className="flex">
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "layers"
                    ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("layers")}
              >
                Layers
              </button>
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "properties"
                    ? "border-b-2 border-blue-500 bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("properties")}
              >
                Properties
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {activeTab === "layers" ? <LayersTreeV2 /> : <PropertiesPanelV2 />}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
