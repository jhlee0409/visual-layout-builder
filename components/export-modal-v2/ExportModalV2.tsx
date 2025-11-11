"use client"

import { useState } from "react"
import { useLayoutStoreV2 } from "@/store/layout-store-v2"
import { exportToZip, type ExportOptions } from "@/lib/file-exporter-v2"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileCode, Package, Loader2 } from "lucide-react"

/**
 * Export Modal V2 - Schema V2 Export UI
 *
 * file-exporter-v2.ts와 통합하여 ZIP 다운로드 제공
 */
export function ExportModalV2() {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    framework: "react",
    cssSolution: "tailwind",
    includeTypes: true,
    includeComments: true,
  })

  const schema = useLayoutStoreV2((state) => state.schema)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      await exportToZip(
        {
          schema,
          options,
        },
        `laylder-export-${Date.now()}.zip`
      )

      // Success - close modal after short delay
      setTimeout(() => {
        setOpen(false)
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Export Code
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Export Your Layout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Schema Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileCode className="w-4 h-4" />
              <span className="font-semibold">Schema V2 ({schema.schemaVersion})</span>
            </div>
            <div className="text-sm text-gray-600">
              Components: <span className="font-semibold">{schema.components.length}</span>
            </div>
            <div className="text-sm text-gray-600">
              Breakpoints: <span className="font-semibold">{schema.breakpoints.length}</span>
            </div>
          </div>

          {/* Framework Selection */}
          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select
              value={options.framework}
              onValueChange={(value) =>
                setOptions({ ...options, framework: value as "react" | "vue" | "svelte" })
              }
            >
              <SelectTrigger id="framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue (Coming Soon)</SelectItem>
                <SelectItem value="svelte">Svelte (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CSS Solution Selection */}
          <div className="space-y-2">
            <Label htmlFor="css">CSS Solution</Label>
            <Select
              value={options.cssSolution}
              onValueChange={(value) =>
                setOptions({ ...options, cssSolution: value as "tailwind" | "css-modules" | "styled-components" })
              }
            >
              <SelectTrigger id="css">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="css-modules">CSS Modules (Coming Soon)</SelectItem>
                <SelectItem value="styled-components">Styled Components (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label>Additional Options</Label>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="types"
                checked={options.includeTypes}
                onChange={(e) =>
                  setOptions({ ...options, includeTypes: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="types"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include TypeScript types
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="comments"
                checked={options.includeComments}
                onChange={(e) =>
                  setOptions({ ...options, includeComments: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="comments"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include code comments
              </label>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || schema.components.length === 0}
              className="w-full gap-2"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download ZIP
                </>
              )}
            </Button>

            {schema.components.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Add components to your layout first
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
