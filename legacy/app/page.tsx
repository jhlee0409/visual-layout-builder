"use client"

import { KonvaCanvas } from "@/components/grid-canvas"
import { ComponentPanel } from "@/components/component-panel"
import { BreakpointSwitcher, BreakpointManager } from "@/components/breakpoint-panel"
import { GenerationModal } from "@/components/generation-modal"
import { Button } from "@/components/ui/button"
import { useLayoutStore } from "@/store/layout-store"

export default function Home() {
  const loadSampleSchema = useLayoutStore((state) => state.loadSampleSchema)
  const resetSchema = useLayoutStore((state) => state.resetSchema)
  const componentCount = useLayoutStore(
    (state) => state.schema.components.length
  )

  return (
    <main className="h-screen flex flex-col p-8">
      <div className="max-w-[1920px] mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Laylder MVP</h1>
            <p className="text-muted-foreground">
              Visual layout builder for AI-powered code generation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSchema}>
              Reset
            </Button>
            <Button onClick={loadSampleSchema}>Load Sample</Button>
            <GenerationModal />
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0 text-sm text-muted-foreground mb-6">
          Components: {componentCount}
        </div>

        {/* Main Layout: Grid Canvas (70%) + Side Panels (30%) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 min-h-0">
          {/* Left: Konva Canvas */}
          <div className="min-w-0 flex flex-col min-h-0">
            <BreakpointSwitcher />
            <div className="flex-1 min-h-0 mt-4">
              <KonvaCanvas />
            </div>
          </div>

          {/* Right: Component Panel + Breakpoint Manager */}
          <div className="min-w-0 space-y-6 overflow-y-auto">
            <ComponentPanel />
            <BreakpointManager />
          </div>
        </div>
      </div>
    </main>
  )
}
