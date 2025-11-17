"use client"

import { useState, useMemo } from "react"
import { useLayoutStore } from "@/store/layout-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileCode, Sparkles, Check, Copy, Zap, DollarSign, Award } from "lucide-react"
import { useToast } from "@/store/toast-store"
import { ComponentLinkingPromptModal } from "./ComponentLinkingPromptModal"

// New AI Model System
import type { AIModelId, OptimizationLevel } from "@/types/ai-models"
import { createPromptStrategy } from "@/lib/prompt-strategies/strategy-factory"
import {
  getActiveModels,
  getModelMetadata,
  recommendModels,
  calculateSchemaComplexity,
  calculateResponsiveComplexity,
} from "@/lib/ai-model-registry"

/**
 * Export Modal - Multi-Model AI Prompt Generation UI
 *
 * Features:
 * - 19개 AI 모델 지원 (Claude, GPT, Gemini, DeepSeek, Grok)
 * - 모델별 최적화된 프롬프트 생성 (Strategy Pattern)
 * - 스마트 모델 추천 시스템
 * - 모델별 옵션 설정 (Optimization Level, Verbosity)
 */
export function ExportModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"config" | "result">("config")
  const [showLinkingPromptModal, setShowLinkingPromptModal] = useState(false)

  // Basic Config
  const [framework, setFramework] = useState<"react">("react")
  const [cssSolution, setCssSolution] = useState<"tailwind">("tailwind")

  // AI Model Config (NEW)
  const [selectedModelId, setSelectedModelId] = useState<AIModelId>("claude-sonnet-4.5")
  const [optimizationLevel, setOptimizationLevel] = useState<OptimizationLevel>("balanced")
  const [verbosity, setVerbosity] = useState<"minimal" | "normal" | "detailed">("normal")

  // Results
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [generatedJson, setGeneratedJson] = useState("")
  const [tokenCount, setTokenCount] = useState(0)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const schema = useLayoutStore((state) => state.schema)
  const componentLinks = useLayoutStore((state) => state.componentLinks)
  const openLinkingPanel = useLayoutStore((state) => state.openLinkingPanel)
  const { error: showError } = useToast()

  // Get available models and recommendations (memoized for performance)
  const availableModels = useMemo(() => getActiveModels(), [])

  const { schemaComplexity, responsiveComponentCount, responsiveComplexity } = useMemo(() => {
    const complexity = calculateSchemaComplexity(schema.components.length)
    const respComponentCount = schema.components.filter((c) => c.responsive).length
    const respComplexity = calculateResponsiveComplexity(schema.breakpoints.length, respComponentCount)

    return {
      schemaComplexity: complexity,
      responsiveComponentCount: respComponentCount,
      responsiveComplexity: respComplexity,
    }
  }, [schema.components, schema.breakpoints.length])

  const recommendations = useMemo(
    () =>
      recommendModels({
        schemaComplexity,
        responsiveComplexity,
        needsFrameworkSpecialization: framework === "react", // React 프레임워크 특화 필요
        costSensitivity: "medium",
        qualityRequirement: "production", // 기본값: 프로덕션 품질
        speedPriority: "medium", // 기본값: 중간 속도
      }),
    [schemaComplexity, responsiveComplexity, framework]
  )

  // Group models by provider (memoized)
  const modelsByProvider = useMemo(
    () =>
      availableModels.reduce(
        (acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = []
          }
          acc[model.provider].push(model)
          return acc
        },
        {} as Record<string, typeof availableModels>
      ),
    [availableModels]
  )

  const handleGenerate = () => {
    // Check if linking is needed but not done
    const hasMultipleBreakpoints = schema.breakpoints.length >= 2
    const hasNoLinks = componentLinks.length === 0

    // Show linking prompt modal if:
    // 1. Multiple breakpoints exist (responsive design)
    // 2. No component links defined yet
    // 3. Modal not already shown (!showLinkingPromptModal prevents re-triggering)
    if (hasMultipleBreakpoints && hasNoLinks && !showLinkingPromptModal) {
      setShowLinkingPromptModal(true)
      return
    }

    generatePrompt()
  }

  const generatePrompt = () => {
    try {
      // Create strategy for selected model
      const strategy = createPromptStrategy(selectedModelId)

      // Generate prompt with model-specific optimization
      const result = strategy.generatePrompt(schema, framework, cssSolution, {
        targetModel: selectedModelId,
        optimizationLevel,
        verbosity,
        componentLinks, // Pass component links to prompt generation
      })

      if (!result.success) {
        showError(result.errors?.join("\n") || "Unknown error occurred", "Generation Failed")
        return
      }

      setGeneratedPrompt(result.prompt!)
      setGeneratedJson(JSON.stringify(schema, null, 2))
      setTokenCount(result.estimatedTokens || 0)

      // Move to result step
      setStep("result")
      setShowLinkingPromptModal(false) // Reset modal
    } catch (err) {
      showError(String(err), "Generation Failed")
    }
  }

  const handleLinkComponents = () => {
    // Close ExportModal
    setOpen(false)
    setShowLinkingPromptModal(false)
    // Open Component Linking Panel
    openLinkingPanel()
  }

  const handleSkipLinking = () => {
    setShowLinkingPromptModal(false)
    generatePrompt()
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

  // Get selected model metadata
  const selectedModel = availableModels.find((m) => m.id === selectedModelId)

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
            {step === "config" ? "Configure AI Prompt Generation" : "AI Prompt Generated"}
          </DialogTitle>
        </DialogHeader>

        {step === "config" ? (
          // Step 1: Configuration
          <div className="space-y-6 py-4 overflow-y-auto">
            {/* Schema Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <FileCode className="w-4 h-4" />
                <span className="font-semibold">Schema ({schema.schemaVersion})</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  Components: <span className="font-semibold">{schema.components.length}</span>
                </div>
                <div>
                  Breakpoints: <span className="font-semibold">{schema.breakpoints.length}</span>
                </div>
                <div>
                  Complexity: <span className="font-semibold capitalize">{schemaComplexity}</span>
                </div>
              </div>
              {componentLinks.length > 0 && (
                <div className="text-sm text-blue-800 pt-2 border-t border-blue-200">
                  Component Links: <span className="font-semibold">{componentLinks.length}</span>
                </div>
              )}
            </div>

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">
                    Recommended Models for Your Schema
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {recommendations.slice(0, 3).map((rec) => {
                    const modelMetadata = getModelMetadata(rec.modelId)
                    return (
                      <button
                        key={rec.modelId}
                        onClick={() => setSelectedModelId(rec.modelId)}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          selectedModelId === rec.modelId
                            ? "border-purple-500 bg-white shadow-sm"
                            : "border-purple-200 hover:border-purple-300 bg-white/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{modelMetadata?.name || rec.modelId}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              Score: {rec.score}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{rec.reason}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AI Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={selectedModelId} onValueChange={(value) => setSelectedModelId(value as AIModelId)}>
                <SelectTrigger id="ai-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelsByProvider).map(([provider, models]) => (
                    <div key={provider}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                        {provider}
                      </div>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{model.name}</span>
                            {model.cost.level === "very-low" && (
                              <Badge variant="outline" className="text-xs">
                                Low Cost
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{selectedModel.description}</span>
                </div>
              )}
            </div>

            {/* Optimization Level */}
            <div className="space-y-2">
              <Label htmlFor="optimization">Optimization Level</Label>
              <Select
                value={optimizationLevel}
                onValueChange={(value) => setOptimizationLevel(value as typeof optimizationLevel)}
              >
                <SelectTrigger id="optimization">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Quality - Best output, detailed instructions</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="balanced">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Balanced - Good quality with efficiency</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="quick">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Quick - Faster, more concise prompts</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verbosity */}
            <div className="space-y-2">
              <Label htmlFor="verbosity">Verbosity Level</Label>
              <Select value={verbosity} onValueChange={(value) => setVerbosity(value as typeof verbosity)}>
                <SelectTrigger id="verbosity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal - Concise, essential info only</SelectItem>
                  <SelectItem value="normal">Normal - Standard detail level</SelectItem>
                  <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={cssSolution} onValueChange={(value) => setCssSolution(value as "tailwind")}>
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
                Generate AI Prompt with {selectedModel?.name || "Selected Model"}
              </Button>

              {schema.components.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">Add components to your layout first</p>
              )}
            </div>
          </div>
        ) : (
          // Step 2: Result
          <div className="flex flex-col gap-4 py-4 flex-1 min-h-0">
            {/* Token Count & Model Info */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {tokenCount.toLocaleString()} tokens
                  </Badge>
                  <span className="text-xs text-gray-500">estimated</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Model: <span className="text-blue-700">{selectedModel?.name || selectedModelId}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {optimizationLevel} optimization, {verbosity} verbosity
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
                  <p className="text-sm text-gray-600">Copy this prompt and paste it into {selectedModel?.name}</p>
                  <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="gap-2">
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
                  <p className="text-sm text-gray-600">Schema in JSON format</p>
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

      {/* Component Linking Prompt Modal */}
      <ComponentLinkingPromptModal
        open={showLinkingPromptModal}
        breakpointCount={schema.breakpoints.length}
        onLinkComponents={handleLinkComponents}
        onSkip={handleSkipLinking}
      />
    </Dialog>
  )
}
