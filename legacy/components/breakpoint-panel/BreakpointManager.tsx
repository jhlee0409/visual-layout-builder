"use client"

import { useState } from "react"
import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BreakpointManager - Manage breakpoints (add, edit, delete)
 */
export function BreakpointManager() {
  const breakpoints = useLayoutStore((state) => state.schema.breakpoints)
  const addBreakpoint = useLayoutStore((state) => state.addBreakpoint)
  const updateBreakpoint = useLayoutStore((state) => state.updateBreakpoint)
  const deleteBreakpoint = useLayoutStore((state) => state.deleteBreakpoint)

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newMinWidth, setNewMinWidth] = useState("")
  const [newGridCols, setNewGridCols] = useState("12")
  const [newGridRows, setNewGridRows] = useState("20")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editMinWidth, setEditMinWidth] = useState("")
  const [editGridCols, setEditGridCols] = useState("")
  const [editGridRows, setEditGridRows] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    setError(null)

    // Validate name
    if (!newName.trim()) {
      setError("Breakpoint name is required")
      return
    }

    // Check for duplicate name
    if (breakpoints.some((bp) => bp.name === newName.trim())) {
      setError("Breakpoint name already exists")
      return
    }

    // Validate minWidth
    const minWidth = parseInt(newMinWidth, 10)
    if (isNaN(minWidth) || minWidth < 0) {
      setError("Min width must be a positive number")
      return
    }

    // Validate gridCols
    const gridCols = parseInt(newGridCols, 10)
    if (isNaN(gridCols) || gridCols < 1) {
      setError("Grid columns must be at least 1")
      return
    }

    // Validate gridRows
    const gridRows = parseInt(newGridRows, 10)
    if (isNaN(gridRows) || gridRows < 1) {
      setError("Grid rows must be at least 1")
      return
    }

    addBreakpoint({
      name: newName.trim(),
      minWidth,
      gridCols,
      gridRows,
    })

    // Reset form
    setIsAdding(false)
    setNewName("")
    setNewMinWidth("")
    setNewGridCols("12")
    setNewGridRows("20")
  }

  const handleStartEdit = (name: string, minWidth: number, gridCols: number, gridRows: number) => {
    setEditingId(name)
    setEditName(name)
    setEditMinWidth(minWidth.toString())
    setEditGridCols(gridCols.toString())
    setEditGridRows(gridRows.toString())
    setError(null)
  }

  const handleSaveEdit = (oldName: string) => {
    setError(null)

    // Validate name
    if (!editName.trim()) {
      setError("Breakpoint name is required")
      return
    }

    // Check for duplicate name (if name changed)
    if (
      editName.trim() !== oldName &&
      breakpoints.some((bp) => bp.name === editName.trim())
    ) {
      setError("Breakpoint name already exists")
      return
    }

    // Validate minWidth
    const minWidth = parseInt(editMinWidth, 10)
    if (isNaN(minWidth) || minWidth < 0) {
      setError("Min width must be a positive number")
      return
    }

    // Validate gridCols
    const gridCols = parseInt(editGridCols, 10)
    if (isNaN(gridCols) || gridCols < 1) {
      setError("Grid columns must be at least 1")
      return
    }

    // Validate gridRows
    const gridRows = parseInt(editGridRows, 10)
    if (isNaN(gridRows) || gridRows < 1) {
      setError("Grid rows must be at least 1")
      return
    }

    updateBreakpoint(oldName, {
      name: editName.trim(),
      minWidth,
      gridCols,
      gridRows,
    })

    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setError(null)
  }

  const handleDelete = (name: string) => {
    if (breakpoints.length <= 1) {
      alert("Cannot delete the last breakpoint. At least one breakpoint is required.")
      return
    }

    if (
      confirm(
        `Are you sure you want to delete breakpoint "${name}"? This will remove its layout.`
      )
    ) {
      deleteBreakpoint(name)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Breakpoints</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add New Breakpoint Form */}
        {isAdding && (
          <div className="p-3 border rounded-lg space-y-3 bg-accent/50">
            <div className="space-y-2">
              <Label htmlFor="newName">Name</Label>
              <Input
                id="newName"
                placeholder="e.g., wide"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newMinWidth">Min Width (px)</Label>
              <Input
                id="newMinWidth"
                type="number"
                placeholder="e.g., 1440"
                value={newMinWidth}
                onChange={(e) => setNewMinWidth(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="newGridCols">Grid Columns</Label>
                <Input
                  id="newGridCols"
                  type="number"
                  placeholder="e.g., 12"
                  value={newGridCols}
                  onChange={(e) => setNewGridCols(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newGridRows">Grid Rows</Label>
                <Input
                  id="newGridRows"
                  type="number"
                  placeholder="e.g., 20"
                  value={newGridRows}
                  onChange={(e) => setNewGridRows(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                Add Breakpoint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false)
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Breakpoint List */}
        {breakpoints.map((breakpoint) => {
          const isEditing = editingId === breakpoint.name

          if (isEditing) {
            return (
              <div
                key={breakpoint.name}
                className="p-3 border rounded-lg space-y-3 bg-accent/50"
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Width (px)</Label>
                  <Input
                    type="number"
                    value={editMinWidth}
                    onChange={(e) => setEditMinWidth(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Grid Columns</Label>
                    <Input
                      type="number"
                      value={editGridCols}
                      onChange={(e) => setEditGridCols(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grid Rows</Label>
                    <Input
                      type="number"
                      value={editGridRows}
                      onChange={(e) => setEditGridRows(e.target.value)}
                    />
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSaveEdit(breakpoint.name)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={breakpoint.name}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {breakpoint.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">
                    ≥ {breakpoint.minWidth}px
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Grid: {breakpoint.gridCols} × {breakpoint.gridRows}
                </span>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    handleStartEdit(breakpoint.name, breakpoint.minWidth, breakpoint.gridCols, breakpoint.gridRows)
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(breakpoint.name)}
                  disabled={breakpoints.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
