/**
 * Prompt Strategies Module
 *
 * AI 모델별 프롬프트 생성 전략 모음
 *
 * 사용 예시:
 *
 * @example
 * import { createPromptStrategy, getModelRecommendations } from '@/lib/prompt-strategies'
 *
 * // 1. 직접 전략 생성
 * const strategy = createPromptStrategy('claude-sonnet-4.5')
 * const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
 *   optimizationLevel: 'quality',
 *   chainOfThought: true,
 *   verbosity: 'detailed'
 * })
 *
 * // 2. 모델 추천 받기
 * const recommendations = getModelRecommendations({
 *   schemaComplexity: 'complex',
 *   responsiveComplexity: 'medium',
 *   needsFrameworkSpecialization: true,
 *   costSensitivity: 'medium',
 *   qualityRequirement: 'production',
 *   speedPriority: 'medium'
 * })
 * const bestModel = recommendations[0]
 * const bestStrategy = createPromptStrategy(bestModel.modelId)
 */

// Base Strategy
export { BasePromptStrategy } from "./base-strategy"

// Model-Specific Strategies
export { ClaudeStrategy, createClaudeSonnet45Strategy, createClaudeSonnet4Strategy, createClaudeOpus4Strategy, createClaudeHaiku35Strategy } from "./claude-strategy"

export { GPTStrategy, createGPT41Strategy, createGPT4TurboStrategy, createGPT4Strategy } from "./gpt-strategy"

export { GeminiStrategy, createGemini25ProStrategy, createGemini20ProStrategy, createGemini20FlashStrategy } from "./gemini-strategy"

export { DeepSeekStrategy, createDeepSeekR1Strategy, createDeepSeekV3Strategy, createDeepSeekCoderV2Strategy } from "./deepseek-strategy"

export { GrokStrategy, createGrok3Strategy, createGrok2Strategy } from "./grok-strategy"

// Factory
export {
  PromptStrategyFactory,
  strategyFactory,
  createPromptStrategy,
  getModelRecommendations,
  getAvailableModelIds,
  getModelsByCategory,
} from "./strategy-factory"

// Re-export types for convenience
export type {
  IPromptStrategy,
  IPromptStrategyFactory,
  PromptGenerationOptions,
  PromptStrategyResult,
  PromptSection,
  ModelRecommendationCriteria,
  ModelRecommendation,
  AIModelId,
} from "@/types/ai-models"
