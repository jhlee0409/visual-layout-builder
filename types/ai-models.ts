/**
 * AI Models Type System
 *
 * 2025년 12월 기준 코딩 AI 모델 메타데이터 및 전략 타입
 *
 * 설계 원칙:
 * - Model Independence: 각 모델이 독립적으로 정의됨
 * - Strategy Pattern: 모델별 프롬프트 전략 분리
 * - Extensibility: 새로운 모델 추가 용이
 * - Type Safety: 강력한 타입 안전성
 *
 * 2025년 12월 업데이트:
 * - GPT-5.2, GPT-5 mini 추가
 * - o3 추론 모델 추가
 * - Gemini 3 Pro/Flash 추가
 * - Grok 4.1 추가
 * - Qwen 2.5 Coder, Llama 4 오픈소스 모델 추가
 */

/**
 * AI 모델 프로바이더
 */
export type AIProvider = "anthropic" | "openai" | "google" | "deepseek" | "xai" | "meta" | "alibaba" | "custom"

/**
 * AI 모델 ID (고유 식별자)
 */
export type AIModelId =
  // Anthropic Claude (2025)
  | "claude-sonnet-4"
  | "claude-sonnet-4.5"
  | "claude-opus-4"
  | "claude-opus-4.5"
  | "claude-haiku-3.5"
  // OpenAI GPT (2025)
  | "gpt-4"
  | "gpt-4-turbo"
  | "gpt-4.1"
  | "gpt-5"
  | "gpt-5.2"
  | "gpt-5-mini"
  | "o1"
  | "o1-mini"
  | "o3"
  | "o3-mini"
  // Google Gemini (2025)
  | "gemini-2.0-pro"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-3-pro"
  | "gemini-3-flash"
  // DeepSeek
  | "deepseek-r1"
  | "deepseek-v3"
  | "deepseek-coder-v2"
  // xAI Grok (2025)
  | "grok-3"
  | "grok-2"
  | "grok-4"
  | "grok-4.1"
  // Meta Llama (Open Source)
  | "llama-4"
  | "llama-4-scout"
  | "llama-4-maverick"
  // Alibaba Qwen (Open Source)
  | "qwen-2.5-coder"
  | "qwen-2.5-coder-32b"
  // Generic/Custom
  | "custom"

/**
 * AI 모델 능력 (Capabilities)
 *
 * 각 모델이 특화된 영역
 */
export interface AIModelCapabilities {
  /** 코드 품질 점수 (1-10) */
  codeQuality: number
  /** 알고리즘 문제 해결 능력 (1-10) */
  algorithmSolving: number
  /** 프레임워크 특화 (Next.js, React 등) (1-10) */
  frameworkSpecialization: number
  /** 창의적 솔루션 (1-10) */
  creativity: number
  /** 추론 능력 (1-10) */
  reasoning: number
  /** 멀티모달 지원 (이미지, 다이어그램) */
  multimodal: boolean
  /** 대용량 컨텍스트 처리 */
  largeContext: boolean
  /** 실시간 데이터 접근 */
  realtimeData: boolean
}

/**
 * 비용 정보
 */
export interface CostInfo {
  /** 비용 레벨 */
  level: "very-low" | "low" | "medium" | "high" | "premium"
  /** 입력 토큰당 비용 (USD per 1M tokens) */
  inputCostPer1M?: number
  /** 출력 토큰당 비용 (USD per 1M tokens) */
  outputCostPer1M?: number
  /** 상대적 비용 설명 */
  description: string
}

/**
 * 성능 특성
 */
export interface PerformanceInfo {
  /** 평균 응답 시간 (초) */
  avgResponseTime?: number
  /** 속도 레벨 */
  speed: "very-fast" | "fast" | "medium" | "slow"
  /** 컨텍스트 윈도우 (토큰) */
  contextWindow: number
  /** 최대 출력 토큰 */
  maxOutputTokens?: number
}

/**
 * AI 모델 메타데이터
 *
 * 각 모델의 특성, 능력, 비용, 성능 정보
 */
export interface AIModelMetadata {
  /** 모델 ID */
  id: AIModelId
  /** 모델 이름 (표시용) */
  name: string
  /** 프로바이더 */
  provider: AIProvider
  /** 모델 설명 */
  description: string
  /** 주요 강점 (Best for) */
  bestFor: string[]
  /** 제한사항 */
  limitations: string[]
  /** 능력 */
  capabilities: AIModelCapabilities
  /** 비용 정보 */
  cost: CostInfo
  /** 성능 정보 */
  performance: PerformanceInfo
  /** 활성 상태 (사용 가능 여부) */
  active: boolean
  /** 릴리스 날짜 */
  releaseDate?: string
}

/**
 * 프롬프트 생성 옵션
 */
export interface PromptGenerationOptions {
  /** 타겟 AI 모델 */
  targetModel: AIModelId
  /** Temperature 설정 (0-1) */
  temperature?: number
  /** 프롬프트 상세 수준 (minimal: ~30% fewer tokens, normal: balanced, detailed: ~40% more tokens) */
  verbosity?: "minimal" | "normal" | "detailed"
  /** 예시 코드 포함 여부 */
  includeExamples?: boolean
  /** 단계별 추론 요청 (CoT) */
  chainOfThought?: boolean
  /** 컴포넌트 링크 (cross-breakpoint relationships) */
  componentLinks?: Array<{ source: string; target: string }>
  /** 비용 민감도 */
  costSensitive?: boolean
  /** 커스텀 시스템 프롬프트 */
  customSystemPrompt?: string
}

/**
 * 프롬프트 섹션 타입
 */
export interface PromptSection {
  /** 섹션 제목 */
  title: string
  /** 섹션 내용 */
  content: string
  /** 우선순위 (높을수록 중요) */
  priority: number
  /** 필수 여부 */
  required: boolean
}

/**
 * 프롬프트 전략 결과
 */
export interface PromptStrategyResult {
  /** 성공 여부 */
  success: boolean
  /** 최종 프롬프트 */
  prompt?: string
  /** 프롬프트 섹션들 (디버깅용) */
  sections?: PromptSection[]
  /** 예상 토큰 수 */
  estimatedTokens?: number
  /** 사용된 모델 ID */
  modelId: AIModelId
  /** 최적화 설정 */
  optimizationUsed?: PromptGenerationOptions
  /** 에러 메시지 */
  errors?: string[]
  /** 경고 메시지 */
  warnings?: string[]
}

/**
 * 모델 추천 기준
 */
export interface ModelRecommendationCriteria {
  /** Schema 복잡도 (컴포넌트 수) */
  schemaComplexity: "simple" | "medium" | "complex"
  /** 반응형 복잡도 (브레이크포인트, 반응형 설정) */
  responsiveComplexity: "simple" | "medium" | "complex"
  /** 프레임워크 특화 필요 여부 */
  needsFrameworkSpecialization: boolean
  /** 비용 민감도 */
  costSensitivity: "low" | "medium" | "high"
  /** 품질 요구사항 */
  qualityRequirement: "draft" | "production" | "enterprise"
  /** 속도 우선순위 */
  speedPriority: "low" | "medium" | "high"
}

/**
 * 모델 추천 결과
 */
export interface ModelRecommendation {
  /** 추천 모델 ID */
  modelId: AIModelId
  /** 추천 점수 (0-100) */
  score: number
  /** 추천 이유 */
  reason: string
  /** 예상 비용 (상대적) */
  estimatedCost: "very-low" | "low" | "medium" | "high" | "premium"
  /** 예상 품질 (상대적) */
  estimatedQuality: "good" | "excellent" | "exceptional"
}

/**
 * 프롬프트 전략 인터페이스 (Strategy Pattern)
 *
 * 각 AI 모델에 최적화된 프롬프트 생성 전략
 */
export interface IPromptStrategy {
  /** 모델 ID */
  readonly modelId: AIModelId

  /** 모델 메타데이터 */
  readonly metadata: AIModelMetadata

  /**
   * 시스템 프롬프트 생성
   * @param framework - 타겟 프레임워크
   * @param cssSolution - CSS 솔루션
   * @returns 시스템 프롬프트
   */
  generateSystemPrompt(framework: string, cssSolution: string): string

  /**
   * 컴포넌트 섹션 생성
   * @param components - 컴포넌트 배열
   * @param options - 생성 옵션
   * @returns 컴포넌트 섹션
   */
  generateComponentSection(components: unknown[], options?: PromptGenerationOptions): string

  /**
   * 레이아웃 섹션 생성
   * @param components - 컴포넌트 배열 (Canvas Grid 정보 포함)
   * @param breakpoints - 브레이크포인트 배열
   * @param layouts - 레이아웃 설정
   * @param options - 생성 옵션
   * @returns 레이아웃 섹션
   */
  generateLayoutSection(
    components: unknown[],
    breakpoints: unknown[],
    layouts: unknown,
    options?: PromptGenerationOptions
  ): string

  /**
   * 구현 지침 섹션 생성
   * @param options - 생성 옵션
   * @returns 구현 지침 섹션
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string

  /**
   * 최종 프롬프트 생성 (전체 조합)
   * @param schema - Visual Layout Builder Schema
   * @param framework - 타겟 프레임워크
   * @param cssSolution - CSS 솔루션
   * @param options - 생성 옵션
   * @returns 프롬프트 전략 결과
   */
  generatePrompt(
    schema: unknown,
    framework: string,
    cssSolution: string,
    options?: PromptGenerationOptions
  ): PromptStrategyResult
}

/**
 * 프롬프트 전략 팩토리 인터페이스 (Factory Pattern)
 */
export interface IPromptStrategyFactory {
  /**
   * 모델 ID로 전략 생성
   * @param modelId - AI 모델 ID
   * @returns 프롬프트 전략 인스턴스
   */
  createStrategy(modelId: AIModelId): IPromptStrategy

  /**
   * 사용 가능한 모델 ID 목록
   * @returns 모델 ID 배열
   */
  getAvailableModels(): AIModelId[]

  /**
   * 모델 추천
   * @param criteria - 추천 기준
   * @returns 추천 모델 목록 (점수 내림차순)
   */
  recommendModels(criteria: ModelRecommendationCriteria): ModelRecommendation[]
}
