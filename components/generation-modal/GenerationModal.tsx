"use client"

import { useState } from "react"
import { useLayoutStore } from "@/store/layout-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Code, Sparkles, Copy, Check, AlertCircle } from "lucide-react"
import {
  generatePrompt,
  estimateTokenCount,
  getRecommendedModel,
} from "@/lib/prompt-generator"

/**
 * GenerationModal - Modal for configuring code generation options
 * PRD 3.4 + 5.3: Generation Options Modal + Output UI
 *
 * MVP Constraints (PRD 6.1):
 * - Only React framework supported
 * - Only Tailwind CSS solution supported
 * - Prompt generation implemented in Phase 4
 */
export function GenerationModal() {
  const schema = useLayoutStore((state) => state.schema)
  const [open, setOpen] = useState(false)
  const [framework, setFramework] = useState<string>("react")
  const [cssSolution, setCssSolution] = useState<string>("tailwind")

  // Generation state
  const [step, setStep] = useState<"config" | "result">("config")
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")
  const [generatedJson, setGeneratedJson] = useState<string>("")
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [recommendedModel, setRecommendedModel] = useState<string>("")
  const [errors, setErrors] = useState<string[]>([])

  // Copy state
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const handleGenerate = () => {
    setErrors([])

    // Generate prompt
    const result = generatePrompt(schema, framework, cssSolution)

    if (!result.success) {
      setErrors(result.errors || ["Unknown error occurred"])
      return
    }

    // Set generated content
    setGeneratedPrompt(result.prompt!)
    setGeneratedJson(JSON.stringify(result.schema, null, 2))

    // Calculate token count and recommended model
    const tokens = estimateTokenCount(result.prompt!)
    setTokenCount(tokens)
    setRecommendedModel(getRecommendedModel(tokens))

    // Move to result step
    setStep("result")
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(generatedJson)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleBack = () => {
    setStep("config")
    setErrors([])
  }

  const handleClose = () => {
    setOpen(false)
    // Reset after animation
    setTimeout(() => {
      setStep("config")
      setGeneratedPrompt("")
      setGeneratedJson("")
      setErrors([])
    }, 300)
  }

  const componentCount = schema.components.length
  const breakpointCount = schema.breakpoints.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Code
        </Button>
      </DialogTrigger>

      <DialogContent className={step === "result" ? "sm:max-w-[900px]" : "sm:max-w-[500px]"}>
        {step === "config" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generate Code Options
              </DialogTitle>
              <DialogDescription>
                Configure your code generation preferences. The AI prompt will be
                generated based on your layout schema.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Error Display */}
              {errors.length > 0 && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Generation failed
                      </p>
                      <ul className="text-sm text-destructive/90 list-disc list-inside">
                        {errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Schema Summary */}
              <div className="rounded-lg border bg-accent/50 p-4">
                <h4 className="text-sm font-medium mb-3">Current Schema</h4>
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{componentCount}</Badge>
                    <span className="text-muted-foreground">Components</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{breakpointCount}</Badge>
                    <span className="text-muted-foreground">Breakpoints</span>
                  </div>
                </div>
              </div>

              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    {/* Phase 2: Add Vue, Svelte, etc. */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  MVP supports React only. More frameworks coming in Phase 2.
                </p>
              </div>

              {/* CSS Solution Selection */}
              <div className="space-y-2">
                <Label htmlFor="css">CSS Solution</Label>
                <Select value={cssSolution} onValueChange={setCssSolution}>
                  <SelectTrigger id="css">
                    <SelectValue placeholder="Select CSS solution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                    {/* Phase 2: Add CSS Modules, Styled Components, etc. */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  MVP supports Tailwind CSS only. More solutions coming in Phase 2.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={componentCount === 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
            </DialogFooter>

            {componentCount === 0 && (
              <p className="text-sm text-muted-foreground text-center -mt-2">
                Add at least one component to generate code
              </p>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generated AI Prompt
              </DialogTitle>
              <DialogDescription>
                Copy and paste this prompt into Claude.ai to generate your React components.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-muted-foreground">Tokens:</span>{" "}
                    <Badge variant="outline">{tokenCount}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>{" "}
                    <Badge variant="outline">{recommendedModel}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{componentCount} Components</Badge>
                  <Badge variant="secondary">{breakpointCount} Breakpoints</Badge>
                </div>
              </div>

              {/* Tabs for Prompt and JSON */}
              <Tabs defaultValue="prompt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
                  <TabsTrigger value="json">JSON Schema</TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Prompt (Ready for Claude.ai)</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPrompt}
                      className="gap-2"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={generatedPrompt}
                    readOnly
                    className="font-mono text-xs h-[400px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt contains all your components, layouts, and implementation
                    instructions.
                  </p>
                </TabsContent>

                <TabsContent value="json" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>JSON Schema (Reference)</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyJson}
                      className="gap-2"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={generatedJson}
                    readOnly
                    className="font-mono text-xs h-[400px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    The complete JSON schema is included in the prompt above.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
