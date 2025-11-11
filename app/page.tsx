"use client"

import { GridCanvas } from "@/components/grid-canvas"
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
      <div className="max-w-7xl mx-auto space-y-8">
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
            <Button onClick={loadSampleSchema}>
              Load Sample
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-sm text-muted-foreground">
          Components: {componentCount}
        </div>

        {/* Grid Canvas */}
        <GridCanvas />
      </div>
    </main>
  )
}
