"use client"

import { BreakpointSwitcherV2 } from "@/components/breakpoint-panel-v2"
import { LibraryPanelV2 } from "@/components/library-panel-v2"
import { LayersTreeV2 } from "@/components/layers-tree-v2"
import { KonvaCanvasV2 } from "@/components/canvas-v2"
import { PropertiesPanelV2 } from "@/components/properties-panel-v2"
import { ExportModalV2 } from "@/components/export-modal-v2"
import { ThemeSelectorV2 } from "@/components/theme-selector-v2"
import { Button } from "@/components/ui/button"
import { useLayoutStoreV2 } from "@/store/layout-store-v2"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

/**
 * Laylder - Visual Layout Builder
 *
 * Component Independence 아키텍처 + Resizable Panels
 * - Library Panel: 컴포넌트 템플릿 추가 (리사이징 가능)
 * - Layers Tree: 드래그로 순서 변경 (수직 분할)
 * - Canvas: 실시간 프리뷰
 * - Properties Panel: 속성 편집 (수직 분할)
 * - Breakpoint Switcher: 반응형 전환
 */
export default function Home() {
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
            <div>
              <h1 className="text-xl font-bold">Laylder</h1>
              <p className="text-xs text-muted-foreground">
                Visual Layout Builder - Component Independence
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

      {/* Main Resizable Panel Layout */}
      <PanelGroup
        direction="horizontal"
        autoSaveId="laylder-main-layout"
        className="flex-1"
      >
        {/* Left Panel: Library (Resizable) */}
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={35}
          className="border-r bg-gray-50"
        >
          <div className="h-full overflow-y-auto">
            <LibraryPanelV2 />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />

        {/* Center Panel: Canvas + Breakpoint Switcher */}
        <Panel minSize={30} className="bg-white">
          <div className="h-full flex flex-col">
            {/* Breakpoint Switcher */}
            <div className="flex-shrink-0 p-4 border-b">
              <BreakpointSwitcherV2 />
            </div>

            {/* Konva Canvas - 브레이크포인트별 동적 그리드 */}
            <div className="flex-1 overflow-hidden">
              <KonvaCanvasV2 />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />

        {/* Right Panel: Layers + Properties (Vertical Split) */}
        <Panel
          defaultSize={22}
          minSize={15}
          maxSize={40}
          className="border-l bg-white"
        >
          <PanelGroup direction="vertical">
            {/* Layers Tree */}
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-sm font-semibold">Layers</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <LayersTreeV2 />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-blue-500 transition-colors" />

            {/* Properties Panel */}
            <Panel minSize={20}>
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-sm font-semibold">Properties</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PropertiesPanelV2 />
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </main>
  )
}
