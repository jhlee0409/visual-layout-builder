"use client"

import { useRef } from "react"
import { BreakpointSwitcher} from "@/components/breakpoint-panel"
import { LibraryPanel} from "@/components/library-panel"
import { LayersTree} from "@/components/layers-tree"
import { KonvaCanvas} from "@/components/canvas"
import { PropertiesPanel} from "@/components/properties-panel"
import { ExportModal} from "@/components/export-modal"
import { InitialBreakpointModal } from "@/components/initial-breakpoint-modal"
import { ComponentLinkingPanel } from "@/components/component-linking-panel/ComponentLinkingPanel"
import { Button } from "@/components/ui/button"
import { useLayoutStore } from "@/store/layout-store"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelGroupHandle,
} from "react-resizable-panels"
import { RotateCcw, Link } from "lucide-react"

/**
 * Laylder - Visual Layout Builder
 *
 * Component Independence 아키텍처 + Resizable Panels (Phase 2)
 * - Library Panel: 컴포넌트 템플릿 추가 (리사이징 가능, Collapsible)
 * - Layers Tree: 드래그로 순서 변경 (수직 분할)
 * - Canvas: 실시간 프리뷰
 * - Properties Panel: 속성 편집 (수직 분할)
 * - Breakpoint Switcher: 반응형 전환
 * - Reset Layout: 레이아웃 초기화 기능
 */
export default function Home() {
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)

  const breakpoints = useLayoutStore((state) => state.schema.breakpoints)
  const componentCount = useLayoutStore(
    (state) => state.schema.components.length
  )
  const initializeSchema = useLayoutStore((state) => state.initializeSchema)
  const resetSchema = useLayoutStore((state) => state.resetSchema)
  const showLinkingPanel = useLayoutStore((state) => state.showLinkingPanel)
  const openLinkingPanel = useLayoutStore((state) => state.openLinkingPanel)
  const closeLinkingPanel = useLayoutStore((state) => state.closeLinkingPanel)

  // 브레이크포인트가 없으면 모달 표시
  const showInitialModal = breakpoints.length === 0

  const handleBreakpointSelect = (breakpoint: "mobile" | "tablet" | "desktop") => {
    initializeSchema(breakpoint)
  }

  const resetLayout = () => {
    // 기본 레이아웃: Library 20%, Canvas 58%, Right 22%
    panelGroupRef.current?.setLayout([20, 58, 22])
  }

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
            <Button
              variant="outline"
              size="sm"
              onClick={openLinkingPanel}
              title="Link components across breakpoints"
            >
              <Link className="w-4 h-4 mr-1" />
              Link Components
            </Button>
            <Button variant="outline" size="sm" onClick={resetSchema}>
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
              title="레이아웃을 기본값으로 초기화"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset Layout
            </Button>
            <ExportModal />
          </div>
        </div>
      </header>

      {/* Main Resizable Panel Layout */}
      <PanelGroup
        direction="horizontal"
        autoSaveId="laylder-main-layout"
        className="flex-1"
        ref={panelGroupRef}
      >
        {/* Left Panel: Library (Resizable + Collapsible) */}
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={35}
          collapsible
          className="border-r bg-gray-50"
        >
          <div className="h-full overflow-y-auto">
            <LibraryPanel />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />

        {/* Center Panel: Canvas + Breakpoint Switcher */}
        <Panel minSize={30} className="bg-white">
          <div className="h-full flex flex-col">
            {/* Breakpoint Switcher */}
            <div className="flex-shrink-0 p-4 border-b">
              <BreakpointSwitcher />
            </div>

            {/* Konva Canvas - 브레이크포인트별 동적 그리드 */}
            <div className="flex-1 overflow-hidden">
              <KonvaCanvas />
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
                  <LayersTree />
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
                  <PropertiesPanel />
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Initial Breakpoint Selection Modal */}
      <InitialBreakpointModal
        open={showInitialModal}
        onSelect={handleBreakpointSelect}
      />

      {/* Component Linking Panel */}
      {showLinkingPanel && (
        <ComponentLinkingPanel onClose={closeLinkingPanel} />
      )}
    </main>
  )
}
