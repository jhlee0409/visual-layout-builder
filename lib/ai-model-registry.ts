/**
 * AI Model Registry
 *
 * 2025년 11월 기준 코딩 AI 모델 메타데이터 레지스트리
 *
 * 데이터 출처:
 * - Render.com AI Coding Agents Benchmark (2025)
 * - Cursor vs Copilot Comparison (2025)
 * - Gemini 2.0 Pro Coding Comparison (2025)
 * - AI Models Comparison 2025 (Claude, GPT, Gemini, DeepSeek, Grok)
 * - Prompt Engineering Best Practices (2025)
 */

import type {
  AIModelId,
  AIModelMetadata,
  ModelRecommendationCriteria,
  ModelRecommendation,
} from "@/types/ai-models"

/**
 * Claude Sonnet 4.5 (Anthropic)
 *
 * 최고 수준의 코드 품질, 전문적 코딩에 최적화
 * Agentic 동작, 긴 대화 유지 능력 탁월
 */
const claudeSonnet45: AIModelMetadata = {
  id: "claude-sonnet-4.5",
  name: "Claude Sonnet 4.5",
  provider: "anthropic",
  description: "Anthropic의 최신 Sonnet 모델. 코드 품질과 전문적 코딩에 최적화",
  bestFor: [
    "프로덕션 코드 생성",
    "복잡한 리팩토링",
    "전체 프로젝트 이해",
    "장기 컨텍스트 유지",
    "안전하고 안정적인 코드",
  ],
  limitations: [
    "높은 비용 (Gemini 2.5 대비 20배)",
    "상대적으로 느린 응답 속도",
  ],
  capabilities: {
    codeQuality: 10,
    algorithmSolving: 8,
    frameworkSpecialization: 9,
    creativity: 8,
    reasoning: 9,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "premium",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    description: "Premium tier - 최고 품질, 높은 비용",
  },
  performance: {
    avgResponseTime: 3.5,
    speed: "medium",
    contextWindow: 200000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-09",
}

/**
 * GPT-4.1 (OpenAI)
 *
 * 창의적이고 복잡한 코딩 작업에 강점
 * 확장된 토큰, 개선된 코드 생성
 */
const gpt41: AIModelMetadata = {
  id: "gpt-4.1",
  name: "GPT-4.1",
  provider: "openai",
  description: "OpenAI의 최신 GPT-4 시리즈. 창의적이고 복잡한 코딩 작업에 강점",
  bestFor: [
    "창의적 솔루션",
    "복잡한 아키텍처 설계",
    "새로운 패턴 제안",
    "프로토타입 빠른 생성",
  ],
  limitations: [
    "Hallucination 이슈",
    "실제 코드 편집 불안정",
    "높은 비용 ($10/run)",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 7,
    frameworkSpecialization: 7,
    creativity: 10,
    reasoning: 8,
    multimodal: true,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "premium",
    inputCostPer1M: 10.0,
    outputCostPer1M: 30.0,
    description: "Premium tier - 창의성 우선, 높은 비용",
  },
  performance: {
    avgResponseTime: 4.0,
    speed: "slow",
    contextWindow: 16000,
    maxOutputTokens: 4096,
  },
  active: true,
  releaseDate: "2025-06",
}

/**
 * o3-mini (OpenAI)
 *
 * 추론 특화 모델, 알고리즘 문제에 강함
 * 빠른 응답, 하지만 엔터프라이즈 코드베이스에서 불안정
 */
const o3Mini: AIModelMetadata = {
  id: "o3-mini",
  name: "o3-mini",
  provider: "openai",
  description: "OpenAI의 추론 특화 모델. 알고리즘 문제에 강하지만 프로덕션 코드에는 부적합",
  bestFor: [
    "알고리즘 문제 (LeetCode Hard 87%)",
    "추론 작업",
    "빠른 응답 필요 시",
  ],
  limitations: [
    "엔터프라이즈 코드베이스에서 40% 실패율",
    "프로덕션 코드 생성 부적합",
    "프레임워크 특화 부족",
  ],
  capabilities: {
    codeQuality: 5,
    algorithmSolving: 9,
    frameworkSpecialization: 4,
    creativity: 6,
    reasoning: 10,
    multimodal: false,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "medium",
    inputCostPer1M: 1.1,
    outputCostPer1M: 4.4,
    description: "Medium tier - 추론 특화, 적정 비용",
  },
  performance: {
    avgResponseTime: 1.2,
    speed: "very-fast",
    contextWindow: 128000,
    maxOutputTokens: 65536,
  },
  active: true,
  releaseDate: "2025-01",
}

/**
 * Gemini 2.5 Pro (Google)
 *
 * 프레임워크 통합 최강, 대용량 컨텍스트 (2M 토큰)
 * 비용 효율 최고 (Claude 대비 1/20 비용)
 */
const gemini25Pro: AIModelMetadata = {
  id: "gemini-2.5-pro",
  name: "Gemini 2.5 Pro",
  provider: "google",
  description: "Google의 최신 Gemini Pro. 프레임워크 통합과 대용량 컨텍스트에 최적화",
  bestFor: [
    "프레임워크 특화 (Next.js 91%)",
    "백엔드 리팩토링",
    "대용량 코드베이스 처리 (2M 토큰)",
    "비용 효율 최고",
    "WebDev Arena 1위",
  ],
  limitations: [
    "순수 알고리즘 문제 약함 (LeetCode Hard 62%)",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 6,
    frameworkSpecialization: 10,
    creativity: 7,
    reasoning: 7,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "low",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    description: "Low tier - 최고 가성비, Claude 대비 1/20 비용",
  },
  performance: {
    avgResponseTime: 2.5,
    speed: "fast",
    contextWindow: 2000000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-10",
}

/**
 * DeepSeek R1 (DeepSeek)
 *
 * 비용 효율 최강 (90% 저렴), 338개 언어 지원
 * 알고리즘 강함, 프레임워크 특화는 약함
 */
const deepseekR1: AIModelMetadata = {
  id: "deepseek-r1",
  name: "DeepSeek R1",
  provider: "deepseek",
  description: "DeepSeek의 최신 모델. 비용 효율 최강, 다국어 코드 지원",
  bestFor: [
    "비용 민감한 프로젝트 (90% 저렴)",
    "다국어 코드 (338개 언어)",
    "알고리즘 문제 (LeetCode Hard 87%)",
    "대량 코드 생성",
  ],
  limitations: [
    "프레임워크 특화 패턴 부족 (Next.js 62%)",
    "최신 프레임워크 지식 부족",
  ],
  capabilities: {
    codeQuality: 7,
    algorithmSolving: 9,
    frameworkSpecialization: 6,
    creativity: 6,
    reasoning: 8,
    multimodal: false,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "very-low",
    inputCostPer1M: 0.014,
    outputCostPer1M: 0.28,
    description: "Very Low tier - 최저 비용, 90% 저렴",
  },
  performance: {
    avgResponseTime: 2.0,
    speed: "fast",
    contextWindow: 128000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-01",
}

/**
 * Grok 3 (xAI)
 *
 * 추론 특화, 실시간 데이터 접근
 * 코딩 특화 성능 데이터 부족
 */
const grok3: AIModelMetadata = {
  id: "grok-3",
  name: "Grok 3",
  provider: "xai",
  description: "xAI의 Grok 3. 추론과 실시간 데이터 접근에 강점",
  bestFor: [
    "추론 작업",
    "실시간 데이터 기반 코딩",
    "최신 정보 필요 시",
  ],
  limitations: [
    "코딩 특화 성능 데이터 부족",
    "프레임워크 특화 미검증",
  ],
  capabilities: {
    codeQuality: 7,
    algorithmSolving: 8,
    frameworkSpecialization: 6,
    creativity: 7,
    reasoning: 9,
    multimodal: true,
    largeContext: false,
    realtimeData: true,
  },
  cost: {
    level: "medium",
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    description: "Medium tier - 추론 특화, 적정 비용",
  },
  performance: {
    avgResponseTime: 3.0,
    speed: "medium",
    contextWindow: 128000,
    maxOutputTokens: 4096,
  },
  active: true,
  releaseDate: "2025-08",
}

/**
 * AI 모델 레지스트리
 *
 * 모든 AI 모델의 메타데이터 중앙 관리
 */
export const AI_MODEL_REGISTRY: Record<AIModelId, AIModelMetadata> = {
  // Anthropic Claude
  "claude-sonnet-4.5": claudeSonnet45,
  "claude-sonnet-4": { ...claudeSonnet45, id: "claude-sonnet-4", name: "Claude Sonnet 4" },
  "claude-opus-4": {
    ...claudeSonnet45,
    id: "claude-opus-4",
    name: "Claude Opus 4",
    description: "Claude 최상위 모델. 가장 복잡한 작업에 최적화",
    cost: { ...claudeSonnet45.cost, level: "premium", description: "Highest tier" },
  },
  "claude-haiku-3.5": {
    ...claudeSonnet45,
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    description: "Claude 경량 모델. 빠르고 간단한 작업에 최적화",
    capabilities: { ...claudeSonnet45.capabilities, codeQuality: 7, reasoning: 7 },
    cost: { level: "low", description: "Fast and affordable" },
    performance: { ...claudeSonnet45.performance, avgResponseTime: 1.5, speed: "very-fast" },
  },

  // OpenAI GPT
  "gpt-4.1": gpt41,
  "gpt-4-turbo": { ...gpt41, id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  "gpt-4": { ...gpt41, id: "gpt-4", name: "GPT-4" },
  "o1": { ...o3Mini, id: "o1", name: "o1" },
  "o1-mini": { ...o3Mini, id: "o1-mini", name: "o1-mini" },
  "o3-mini": o3Mini,

  // Google Gemini
  "gemini-2.5-pro": gemini25Pro,
  "gemini-2.0-pro": { ...gemini25Pro, id: "gemini-2.0-pro", name: "Gemini 2.0 Pro" },
  "gemini-2.0-flash": {
    ...gemini25Pro,
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Gemini 경량 모델. 빠르고 비용 효율적",
    cost: { level: "very-low", description: "Fastest and cheapest" },
    performance: { ...gemini25Pro.performance, avgResponseTime: 1.0, speed: "very-fast" },
  },

  // DeepSeek
  "deepseek-r1": deepseekR1,
  "deepseek-v3": { ...deepseekR1, id: "deepseek-v3", name: "DeepSeek V3" },
  "deepseek-coder-v2": {
    ...deepseekR1,
    id: "deepseek-coder-v2",
    name: "DeepSeek Coder V2",
    description: "DeepSeek 코딩 특화 모델. 338개 언어 지원",
    capabilities: { ...deepseekR1.capabilities, codeQuality: 8, algorithmSolving: 10 },
  },

  // xAI Grok
  "grok-3": grok3,
  "grok-2": { ...grok3, id: "grok-2", name: "Grok 2" },

  // Custom
  "custom": {
    id: "custom",
    name: "Custom Model",
    provider: "custom",
    description: "사용자 정의 모델",
    bestFor: ["사용자 정의 요구사항"],
    limitations: ["설정 필요"],
    capabilities: {
      codeQuality: 5,
      algorithmSolving: 5,
      frameworkSpecialization: 5,
      creativity: 5,
      reasoning: 5,
      multimodal: false,
      largeContext: false,
      realtimeData: false,
    },
    cost: { level: "medium", description: "Depends on provider" },
    performance: { speed: "medium", contextWindow: 100000 },
    active: true,
  },
}

/**
 * 모델 ID로 메타데이터 가져오기
 */
export function getModelMetadata(modelId: AIModelId): AIModelMetadata | null {
  return AI_MODEL_REGISTRY[modelId] || null
}

/**
 * 활성화된 모델 목록 가져오기
 */
export function getActiveModels(): AIModelMetadata[] {
  return Object.values(AI_MODEL_REGISTRY).filter((model) => model.active)
}

/**
 * 프로바이더별 모델 목록 가져오기
 */
export function getModelsByProvider(provider: string): AIModelMetadata[] {
  return Object.values(AI_MODEL_REGISTRY).filter(
    (model) => model.provider === provider && model.active
  )
}

/**
 * 모델 추천 알고리즘
 *
 * 주어진 기준에 따라 최적의 AI 모델 추천
 */
export function recommendModels(
  criteria: ModelRecommendationCriteria
): ModelRecommendation[] {
  const activeModels = getActiveModels()
  const recommendations: ModelRecommendation[] = []

  for (const model of activeModels) {
    let score = 0
    const reasons: string[] = []

    // 1. Schema 복잡도 기반 점수
    if (criteria.schemaComplexity === "simple") {
      // 간단한 schema → 빠르고 저렴한 모델
      if (model.performance.speed === "very-fast") score += 20
      if (model.cost.level === "very-low" || model.cost.level === "low") score += 15
      reasons.push("간단한 구조에 적합한 빠른 모델")
    } else if (criteria.schemaComplexity === "medium") {
      // 중간 복잡도 → 균형 잡힌 모델
      if (model.capabilities.codeQuality >= 7) score += 15
      if (model.cost.level === "medium" || model.cost.level === "low") score += 10
      reasons.push("중간 복잡도에 적합한 균형 잡힌 모델")
    } else {
      // 복잡한 schema → 고품질 모델
      if (model.capabilities.codeQuality >= 9) score += 25
      if (model.capabilities.largeContext) score += 15
      reasons.push("복잡한 구조에 적합한 고품질 모델")
    }

    // 2. 반응형 복잡도 기반 점수
    if (criteria.responsiveComplexity === "complex") {
      if (model.capabilities.codeQuality >= 8) score += 15
      reasons.push("복잡한 반응형에 강함")
    }

    // 3. 프레임워크 특화 필요
    if (criteria.needsFrameworkSpecialization) {
      if (model.capabilities.frameworkSpecialization >= 9) score += 20
      reasons.push("프레임워크 특화 능력 탁월")
    }

    // 4. 비용 민감도
    if (criteria.costSensitivity === "high") {
      if (model.cost.level === "very-low") score += 30
      else if (model.cost.level === "low") score += 20
      else if (model.cost.level === "medium") score += 10
      else score -= 10
      reasons.push("비용 효율적")
    } else if (criteria.costSensitivity === "low") {
      // 비용 신경 안 쓰면 품질 우선
      if (model.capabilities.codeQuality >= 9) score += 20
    }

    // 5. 품질 요구사항
    if (criteria.qualityRequirement === "enterprise") {
      if (model.capabilities.codeQuality >= 9) score += 25
      reasons.push("엔터프라이즈급 품질")
    } else if (criteria.qualityRequirement === "production") {
      if (model.capabilities.codeQuality >= 8) score += 15
      reasons.push("프로덕션 품질")
    } else {
      // draft는 빠르고 저렴한 게 좋음
      if (model.performance.speed === "very-fast" || model.performance.speed === "fast") {
        score += 15
      }
      reasons.push("빠른 프로토타입")
    }

    // 6. 속도 우선순위
    if (criteria.speedPriority === "high") {
      if (model.performance.speed === "very-fast") score += 20
      else if (model.performance.speed === "fast") score += 10
      reasons.push("빠른 응답 속도")
    }

    // 추천 객체 생성
    recommendations.push({
      modelId: model.id,
      score,
      reason: reasons.join(", "),
      estimatedCost: model.cost.level,
      estimatedQuality:
        model.capabilities.codeQuality >= 9
          ? "exceptional"
          : model.capabilities.codeQuality >= 8
            ? "excellent"
            : "good",
    })
  }

  // 점수 내림차순 정렬
  return recommendations.sort((a, b) => b.score - a.score)
}

/**
 * Schema 복잡도 계산
 */
export function calculateSchemaComplexity(componentCount: number): "simple" | "medium" | "complex" {
  if (componentCount <= 3) return "simple"
  if (componentCount <= 8) return "medium"
  return "complex"
}

/**
 * 반응형 복잡도 계산
 */
export function calculateResponsiveComplexity(
  breakpointCount: number,
  responsiveComponentCount: number
): "simple" | "medium" | "complex" {
  if (breakpointCount <= 1) return "simple"
  if (breakpointCount === 2 && responsiveComponentCount <= 3) return "medium"
  if (breakpointCount >= 3 || responsiveComponentCount >= 5) return "complex"
  return "medium"
}
