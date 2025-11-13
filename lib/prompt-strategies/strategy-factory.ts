/**
 * Prompt Strategy Factory
 *
 * Factory Pattern을 사용한 프롬프트 전략 생성 및 관리
 *
 * 설계 원칙:
 * - Factory Pattern: 전략 인스턴스 생성 캡슐화
 * - Singleton Pattern: Factory 인스턴스 재사용
 * - Strategy Pattern: 모델별 전략 교체 가능
 * - Open-Closed Principle: 새로운 모델 추가 시 기존 코드 수정 불필요
 */

import type {
  AIModelId,
  IPromptStrategy,
  IPromptStrategyFactory,
  ModelRecommendationCriteria,
  ModelRecommendation,
  AIProvider,
} from "@/types/ai-models"
import { recommendModels, getActiveModels, getModelMetadata } from "@/lib/ai-model-registry"
import { ClaudeStrategy } from "./claude-strategy"
import { GPTStrategy } from "./gpt-strategy"
import { GeminiStrategy } from "./gemini-strategy"
import { DeepSeekStrategy } from "./deepseek-strategy"
import { GrokStrategy } from "./grok-strategy"

/**
 * Provider to Strategy Class Mapping
 *
 * Provider 기반으로 Strategy 클래스 결정
 * 새로운 provider 추가 시 여기만 수정하면 됨
 */
const PROVIDER_STRATEGY_MAP: Record<
  AIProvider,
  new (modelId: AIModelId) => IPromptStrategy
> = {
  anthropic: ClaudeStrategy,
  openai: GPTStrategy,
  google: GeminiStrategy,
  deepseek: DeepSeekStrategy,
  xai: GrokStrategy,
  custom: ClaudeStrategy, // fallback to Claude
}

/**
 * Prompt Strategy Factory
 *
 * 모델 ID를 받아 해당 모델에 최적화된 전략 인스턴스 생성
 */
export class PromptStrategyFactory implements IPromptStrategyFactory {
  private static instance: PromptStrategyFactory
  private strategyCache: Map<AIModelId, IPromptStrategy> = new Map()

  /**
   * Private constructor (Singleton)
   */
  private constructor() {}

  /**
   * Singleton 인스턴스 가져오기
   */
  static getInstance(): PromptStrategyFactory {
    if (!PromptStrategyFactory.instance) {
      PromptStrategyFactory.instance = new PromptStrategyFactory()
    }
    return PromptStrategyFactory.instance
  }

  /**
   * 전략 생성 (Factory Method)
   *
   * 모델 ID에 따라 적절한 전략 인스턴스 생성
   * Provider 기반 mapping을 사용하여 확장 가능
   * 캐싱을 통해 동일한 모델에 대해 재사용
   *
   * @param modelId - AI 모델 ID
   * @returns 프롬프트 전략 인스턴스
   * @throws Error if model is not supported or metadata not found
   */
  createStrategy(modelId: AIModelId): IPromptStrategy {
    // 캐시 확인
    if (this.strategyCache.has(modelId)) {
      return this.strategyCache.get(modelId)!
    }

    // 모델 메타데이터 가져오기
    const metadata = getModelMetadata(modelId)
    if (!metadata) {
      throw new Error(`Model metadata not found for: ${modelId}`)
    }

    // Provider 기반으로 Strategy 클래스 선택
    const StrategyClass = PROVIDER_STRATEGY_MAP[metadata.provider]
    if (!StrategyClass) {
      throw new Error(`No strategy found for provider: ${metadata.provider}`)
    }

    // 전략 인스턴스 생성
    const strategy = new StrategyClass(modelId)

    // 캐시에 저장
    this.strategyCache.set(modelId, strategy)

    return strategy
  }

  /**
   * 사용 가능한 모델 ID 목록
   *
   * @returns 활성화된 모델 ID 배열
   */
  getAvailableModels(): AIModelId[] {
    return getActiveModels().map((model) => model.id)
  }

  /**
   * 모델 추천
   *
   * 주어진 기준에 따라 최적의 모델 추천
   *
   * @param criteria - 추천 기준
   * @returns 추천 모델 목록 (점수 내림차순)
   */
  recommendModels(criteria: ModelRecommendationCriteria): ModelRecommendation[] {
    return recommendModels(criteria)
  }

  /**
   * 캐시 초기화
   *
   * 메모리 관리를 위해 필요 시 호출
   */
  clearCache(): void {
    this.strategyCache.clear()
  }

  /**
   * 캐시된 전략 수
   */
  getCacheSize(): number {
    return this.strategyCache.size
  }
}

/**
 * Factory 인스턴스 export (편의 함수)
 */
export const strategyFactory = PromptStrategyFactory.getInstance()

/**
 * 전략 생성 헬퍼 함수
 *
 * @example
 * const strategy = createPromptStrategy('claude-sonnet-4.5')
 * const result = strategy.generatePrompt(schema, 'react', 'tailwind')
 */
export function createPromptStrategy(modelId: AIModelId): IPromptStrategy {
  return strategyFactory.createStrategy(modelId)
}

/**
 * 모델 추천 헬퍼 함수
 *
 * @example
 * const recommendations = getModelRecommendations({
 *   schemaComplexity: 'complex',
 *   costSensitivity: 'high',
 *   qualityRequirement: 'production'
 * })
 * const bestModel = recommendations[0]
 */
export function getModelRecommendations(
  criteria: ModelRecommendationCriteria
): ModelRecommendation[] {
  return strategyFactory.recommendModels(criteria)
}

/**
 * 사용 가능한 모델 목록 헬퍼 함수
 */
export function getAvailableModelIds(): AIModelId[] {
  return strategyFactory.getAvailableModels()
}

/**
 * 모델 카테고리별 그룹화
 */
export function getModelsByCategory(): Record<string, AIModelId[]> {
  const models = getAvailableModelIds()

  return {
    anthropic: models.filter((id) => id.startsWith("claude-")),
    openai: models.filter((id) => id.startsWith("gpt-") || id.startsWith("o")),
    google: models.filter((id) => id.startsWith("gemini-")),
    deepseek: models.filter((id) => id.startsWith("deepseek-")),
    xai: models.filter((id) => id.startsWith("grok-")),
    custom: models.filter((id) => id === "custom"),
  }
}

/**
 * index.ts export용 (모든 전략 관련 export)
 */
export * from "./base-strategy"
export * from "./claude-strategy"
export * from "./gpt-strategy"
export * from "./gemini-strategy"
export * from "./deepseek-strategy"
