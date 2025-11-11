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
    <main className="min-h-screen p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
        <div className="text-sm text-muted-foreground">
          Components: {componentCount}
        </div>

        {/* Main Layout: Grid Canvas (70%) + Side Panels (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Konva Canvas */}
          <div className="min-w-0 space-y-4">
            <BreakpointSwitcher />
            <KonvaCanvas width={1200} height={800} />
          </div>

          {/* Right: Component Panel + Breakpoint Manager */}
          <div className="min-w-0 space-y-6">
            <ComponentPanel />
            <BreakpointManager />
          </div>
        </div>
      </div>
    </main>
  )
}
