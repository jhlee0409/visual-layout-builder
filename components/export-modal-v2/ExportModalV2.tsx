"use client"

import { useState } from "react"
import { useLayoutStoreV2 } from "@/store/layout-store-v2"
import {
  generatePromptV2,
  generateSchemaSummaryV2,
  estimateTokenCountV2,
  getRecommendedModelV2,
} from "@/lib/prompt-generator-v2"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileCode, Sparkles, Check, Copy } from "lucide-react"
import { useToast } from "@/store/toast-store"

/**
 * Export Modal V2 - Schema V2 AI Prompt Generation UI
 *
 * V1 GenerationModal 방식 참조:
 * - 2-step workflow: Config → Result
 * - AI Prompt / JSON Schema 탭
 * - Copy to Clipboard 기능
 * - Token count & Model recommendation
 */
export function ExportModalV2() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"config" | "result">("config")
  const [framework, setFramework] = useState<"react">("react")
  const [cssSolution, setCssSolution] = useState<"tailwind">("tailwind")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [generatedJson, setGeneratedJson] = useState("")
  const [tokenCount, setTokenCount] = useState(0)
  const [recommendedModel, setRecommendedModel] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const schema = useLayoutStoreV2((state) => state.schema)
  const { error } = useToast()

  const handleGenerate = () => {
    // Generate AI prompt from Schema V2
    const result = generatePromptV2(schema, framework, cssSolution)

    if (!result.success) {
      error(result.errors?.join("\n") || "알 수 없는 오류가 발생했습니다.", "생성 실패")
      return
    }

    setGeneratedPrompt(result.prompt!)
    setGeneratedJson(JSON.stringify(schema, null, 2))

    // Calculate token count and recommend model
    const tokens = estimateTokenCountV2(result.prompt!)
    setTokenCount(tokens)
    setRecommendedModel(getRecommendedModelV2(tokens))

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
    setCopiedPrompt(false)
    setCopiedJson(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Prompt
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {step === "config" ? "Configure Generation" : "AI Prompt Generated"}
          </DialogTitle>
        </DialogHeader>

        {step === "config" ? (
          // Step 1: Configuration
          <div className="space-y-6 py-4 overflow-y-auto">
            {/* Schema Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <FileCode className="w-4 h-4" />
                <span className="font-semibold">Schema V2 ({schema.schemaVersion})</span>
              </div>
              <div className="text-sm text-blue-800">
                Components: <span className="font-semibold">{schema.components.length}</span>
              </div>
              <div className="text-sm text-blue-800">
                Breakpoints: <span className="font-semibold">{schema.breakpoints.length}</span>
              </div>
            </div>

            {/* Framework Selection */}
            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Select value={framework} onValueChange={(value) => setFramework(value as "react")}>
                <SelectTrigger id="framework">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CSS Solution Selection */}
            <div className="space-y-2">
              <Label htmlFor="css">CSS Solution</Label>
              <Select
                value={cssSolution}
                onValueChange={(value) => setCssSolution(value as "tailwind")}
              >
                <SelectTrigger id="css">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={schema.components.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="w-4 h-4" />
                Generate AI Prompt
              </Button>

              {schema.components.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Add components to your layout first
                </p>
              )}
            </div>
          </div>
        ) : (
          // Step 2: Result
          <div className="flex flex-col gap-4 py-4 flex-1 min-h-0">
            {/* Token Count & Model Recommendation */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {tokenCount.toLocaleString()} tokens
                  </Badge>
                  <span className="text-xs text-gray-500">estimated</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Recommended: <span className="text-blue-700">{recommendedModel}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Back
              </Button>
            </div>

            {/* Tabs: AI Prompt / JSON Schema */}
            <Tabs defaultValue="prompt" className="flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
                <TabsTrigger value="json">JSON Schema</TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="flex-1 flex flex-col gap-3 mt-4 min-h-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Copy this prompt and paste it into Claude or GPT
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="gap-2"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="flex-1 bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto font-mono">
                  {generatedPrompt}
                </pre>
              </TabsContent>

              <TabsContent value="json" className="flex-1 flex flex-col gap-3 mt-4 min-h-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Schema V2 in JSON format</p>
                  <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-2">
                    {copiedJson ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="flex-1 bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto font-mono">
                  {generatedJson}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
