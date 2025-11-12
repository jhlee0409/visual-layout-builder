"use client"

import { useState, useEffect } from "react"
import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SemanticTag } from "@/types/schema"
import { X } from "lucide-react"

const SEMANTIC_TAGS: SemanticTag[] = [
  "header",
  "nav",
  "main",
  "aside",
  "footer",
  "section",
  "article",
  "div",
]

/**
 * ComponentForm - Form for adding or editing components
 */
export function ComponentForm() {
  const [name, setName] = useState("")
  const [semanticTag, setSemanticTag] = useState<SemanticTag>("div")
  const [propsJson, setPropsJson] = useState('{"children": ""}')
  const [error, setError] = useState<string | null>(null)

  const addComponent = useLayoutStore((state) => state.addComponent)
  const updateComponent = useLayoutStore((state) => state.updateComponent)
  const selectedComponentId = useLayoutStore((state) => state.selectedComponentId)
  const setSelectedComponentId = useLayoutStore((state) => state.setSelectedComponentId)
  const components = useLayoutStore((state) => state.schema.components)

  // Find editing component
  const editingComponent = selectedComponentId
    ? components.find((c) => c.id === selectedComponentId)
    : null

  // Populate form when editing component changes
  useEffect(() => {
    if (editingComponent) {
      setName(editingComponent.name)
      setSemanticTag(editingComponent.semanticTag)
      setPropsJson(JSON.stringify(editingComponent.props, null, 2))
    } else {
      // Reset form when not editing
      setName("")
      setSemanticTag("div")
      setPropsJson('{"children": ""}')
    }
    setError(null)
  }, [editingComponent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate component name (PascalCase)
    const nameRegex = /^[A-Z][a-zA-Z0-9]*$/
    if (!nameRegex.test(name)) {
      setError("Component name must be PascalCase (e.g., MyComponent)")
      return
    }

    // Validate and parse props JSON
    let props: Record<string, unknown> = {}
    if (propsJson.trim()) {
      try {
        props = JSON.parse(propsJson)
        if (typeof props !== "object" || Array.isArray(props)) {
          setError("Props must be a valid JSON object")
          return
        }
      } catch (err) {
        setError("Invalid JSON in props")
        return
      }
    }

    if (editingComponent) {
      // Update existing component
      updateComponent(editingComponent.id, {
        name,
        semanticTag,
        props,
      })
      // Deselect component after update
      setSelectedComponentId(null)
    } else {
      // Add new component
      addComponent({
        name,
        semanticTag,
        props,
      })
      // Form is auto-reset by useEffect when selectedComponentId becomes null
    }
  }

  const handleCancel = () => {
    setSelectedComponentId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {editingComponent ? "Edit Component" : "Add Component"}
          </CardTitle>
          {editingComponent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingComponent && (
            <div className="text-sm text-muted-foreground bg-primary/5 p-2 rounded">
              Editing: <span className="font-mono font-semibold">{editingComponent.id}</span>
            </div>
          )}

          {/* Component Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Component Name *</Label>
            <Input
              id="name"
              placeholder="MyComponent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
            />
            <p className="text-xs text-muted-foreground">
              Must be PascalCase (e.g., GlobalHeader)
            </p>
          </div>

          {/* Semantic Tag */}
          <div className="space-y-2">
            <Label htmlFor="semanticTag">Semantic Tag *</Label>
            <Select
              value={semanticTag}
              onValueChange={(value) => setSemanticTag(value as SemanticTag)}
            >
              <SelectTrigger id="semanticTag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMANTIC_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    &lt;{tag}&gt;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Props */}
          <div className="space-y-2">
            <Label htmlFor="props">Default Props (JSON)</Label>
            <Textarea
              id="props"
              placeholder='{"children": "Default text"}'
              value={propsJson}
              onChange={(e) => setPropsJson(e.target.value)}
              autoComplete="off"
              className="font-mono text-xs"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON object for component props
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-2">
            {editingComponent && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" className={editingComponent ? "flex-1" : "w-full"}>
              {editingComponent ? "Update Component" : "Add Component"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
