/**
 * AI Model Registry
 *
 * 2025년 12월 기준 코딩 AI 모델 메타데이터 레지스트리
 *
 * 데이터 출처:
 * - SWE-bench Verified Leaderboard (2025-12)
 * - Aider Polyglot Coding Benchmark (2025-12)
 * - LiveCodeBench Elo Rankings (2025-12)
 * - ARC-AGI-2 Benchmark (2025-12)
 * - AIME 2025 Math Competition (2025-12)
 * - Render.com AI Coding Agents Benchmark (2025)
 * - Cursor vs Copilot Comparison (2025)
 *
 * 2025년 12월 업데이트:
 * - Claude Opus 4.5 추가 (80.9% SWE-bench, 89.4% Aider Polyglot)
 * - GPT-5.2, GPT-5 mini, o3 추가 (80% SWE-bench, 52.9% ARC-AGI-2)
 * - Gemini 3 Pro/Flash 추가 (2439 LiveCodeBench Elo, 76.2% SWE-bench)
 * - Grok 4.1 추가 (9.8/10 coding benchmark)
 * - Llama 4, Qwen 2.5 Coder 오픈소스 모델 추가
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

// ============================================================================
// 2025년 12월 신규 모델
// ============================================================================

/**
 * Claude Opus 4.5 (Anthropic)
 *
 * 2025년 최강 코딩 모델
 * SWE-bench 80.9%, Aider Polyglot 89.4%
 */
const claudeOpus45: AIModelMetadata = {
  id: "claude-opus-4.5",
  name: "Claude Opus 4.5",
  provider: "anthropic",
  description: "Anthropic의 최상위 모델. SWE-bench 80.9%, Aider Polyglot 89.4% - 2025년 최강 코딩 성능",
  bestFor: [
    "엔터프라이즈 프로덕션 코드 생성",
    "복잡한 리팩토링",
    "대규모 프로젝트 전체 이해",
    "장기 컨텍스트 유지 (200K 토큰)",
    "안전하고 안정적인 코드",
    "멀티모달 코드 분석",
  ],
  limitations: [
    "매우 높은 비용",
    "상대적으로 느린 응답 속도",
  ],
  capabilities: {
    codeQuality: 10,
    algorithmSolving: 10,
    frameworkSpecialization: 10,
    creativity: 9,
    reasoning: 10,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "premium",
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    description: "Premium tier - 최상위 모델, 최고 비용",
  },
  performance: {
    avgResponseTime: 4.0,
    speed: "slow",
    contextWindow: 200000,
    maxOutputTokens: 16384,
  },
  active: true,
  releaseDate: "2025-10",
}

/**
 * GPT-5.2 (OpenAI)
 *
 * 2025년 최신 GPT 모델
 * SWE-bench 80%, AIME 2025 100%, ARC-AGI-2 52.9%
 */
const gpt52: AIModelMetadata = {
  id: "gpt-5.2",
  name: "GPT-5.2",
  provider: "openai",
  description: "OpenAI의 최신 플래그십 모델. SWE-bench 80%, AIME 2025 100% 달성",
  bestFor: [
    "복잡한 수학적 추론 (AIME 100%)",
    "고급 알고리즘 구현",
    "멀티모달 코드 분석",
    "창의적 솔루션 설계",
    "ARC-AGI 스타일 문제 해결",
  ],
  limitations: [
    "매우 높은 비용",
    "응답 시간 다소 느림",
  ],
  capabilities: {
    codeQuality: 10,
    algorithmSolving: 10,
    frameworkSpecialization: 9,
    creativity: 10,
    reasoning: 10,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "premium",
    inputCostPer1M: 15.0,
    outputCostPer1M: 60.0,
    description: "Premium tier - 최상위 GPT 모델",
  },
  performance: {
    avgResponseTime: 3.5,
    speed: "medium",
    contextWindow: 256000,
    maxOutputTokens: 32768,
  },
  active: true,
  releaseDate: "2025-11",
}

/**
 * GPT-5 (OpenAI)
 *
 * GPT-5 시리즈 기본 모델
 */
const gpt5: AIModelMetadata = {
  id: "gpt-5",
  name: "GPT-5",
  provider: "openai",
  description: "OpenAI GPT-5 시리즈 기본 모델. 강력한 추론과 코드 생성 능력",
  bestFor: [
    "프로덕션 코드 생성",
    "복잡한 아키텍처 설계",
    "알고리즘 최적화",
    "창의적 문제 해결",
  ],
  limitations: [
    "높은 비용",
    "GPT-5.2 대비 약간 낮은 성능",
  ],
  capabilities: {
    codeQuality: 9,
    algorithmSolving: 9,
    frameworkSpecialization: 8,
    creativity: 9,
    reasoning: 9,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "high",
    inputCostPer1M: 10.0,
    outputCostPer1M: 40.0,
    description: "High tier - GPT-5 시리즈 기본",
  },
  performance: {
    avgResponseTime: 3.0,
    speed: "medium",
    contextWindow: 128000,
    maxOutputTokens: 16384,
  },
  active: true,
  releaseDate: "2025-09",
}

/**
 * GPT-5 mini (OpenAI)
 *
 * GPT-5 경량 버전, 빠르고 저렴
 */
const gpt5Mini: AIModelMetadata = {
  id: "gpt-5-mini",
  name: "GPT-5 mini",
  provider: "openai",
  description: "GPT-5 경량 모델. 빠르고 비용 효율적, 일반 코딩 작업에 적합",
  bestFor: [
    "빠른 프로토타입 생성",
    "일반 코딩 작업",
    "코드 리뷰 및 분석",
    "비용 효율적 대량 처리",
  ],
  limitations: [
    "복잡한 아키텍처에 부적합",
    "GPT-5 대비 낮은 추론 능력",
  ],
  capabilities: {
    codeQuality: 7,
    algorithmSolving: 7,
    frameworkSpecialization: 7,
    creativity: 7,
    reasoning: 7,
    multimodal: true,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "low",
    inputCostPer1M: 0.5,
    outputCostPer1M: 2.0,
    description: "Low tier - 빠르고 저렴",
  },
  performance: {
    avgResponseTime: 1.0,
    speed: "very-fast",
    contextWindow: 64000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-10",
}

/**
 * o3 (OpenAI)
 *
 * 최신 추론 특화 모델
 * ARC-AGI-2에서 뛰어난 성능
 */
const o3: AIModelMetadata = {
  id: "o3",
  name: "o3",
  provider: "openai",
  description: "OpenAI의 최신 추론 모델. ARC-AGI-2 52.9% 달성, 복잡한 논리 문제에 강점",
  bestFor: [
    "복잡한 알고리즘 설계",
    "수학적 증명 및 추론",
    "논리적 문제 해결",
    "단계별 추론 필요 작업",
    "ARC-AGI 스타일 퍼즐",
  ],
  limitations: [
    "일반 코딩 작업에 과도한 추론",
    "느린 응답 (깊은 추론)",
    "높은 비용",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 10,
    frameworkSpecialization: 6,
    creativity: 8,
    reasoning: 10,
    multimodal: false,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "high",
    inputCostPer1M: 10.0,
    outputCostPer1M: 40.0,
    description: "High tier - 깊은 추론 특화",
  },
  performance: {
    avgResponseTime: 8.0,
    speed: "slow",
    contextWindow: 200000,
    maxOutputTokens: 100000,
  },
  active: true,
  releaseDate: "2025-12",
}

/**
 * Gemini 3 Pro (Google)
 *
 * 2025년 Google 최신 플래그십
 * LiveCodeBench Elo 2439, SWE-bench 76.2%
 */
const gemini3Pro: AIModelMetadata = {
  id: "gemini-3-pro",
  name: "Gemini 3 Pro",
  provider: "google",
  description: "Google의 최신 플래그십. LiveCodeBench Elo 2439, SWE-bench 76.2% - 프레임워크 통합 최강",
  bestFor: [
    "프레임워크 특화 코드 생성 (Next.js, React)",
    "대용량 코드베이스 처리 (2M 토큰)",
    "백엔드/프론트엔드 통합 프로젝트",
    "비용 효율적 프로덕션 코드",
    "WebDev Arena 상위권",
  ],
  limitations: [
    "순수 알고리즘 문제 약간 약함",
    "Claude 대비 추론 능력",
  ],
  capabilities: {
    codeQuality: 9,
    algorithmSolving: 8,
    frameworkSpecialization: 10,
    creativity: 8,
    reasoning: 8,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "medium",
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    description: "Medium tier - 최고 가성비 플래그십",
  },
  performance: {
    avgResponseTime: 2.5,
    speed: "fast",
    contextWindow: 2000000,
    maxOutputTokens: 16384,
  },
  active: true,
  releaseDate: "2025-12",
}

/**
 * Gemini 3 Flash (Google)
 *
 * Gemini 3 경량 버전
 * SWE-bench 78%, 빠른 응답
 */
const gemini3Flash: AIModelMetadata = {
  id: "gemini-3-flash",
  name: "Gemini 3 Flash",
  provider: "google",
  description: "Gemini 3 경량 모델. SWE-bench 78%, 빠르고 저렴하면서도 강력한 성능",
  bestFor: [
    "빠른 코드 생성",
    "실시간 코드 완성",
    "대량 코드 처리",
    "비용 민감 프로젝트",
    "프레임워크 특화 코딩",
  ],
  limitations: [
    "복잡한 아키텍처 설계 한계",
    "깊은 추론 작업 부적합",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 7,
    frameworkSpecialization: 9,
    creativity: 7,
    reasoning: 7,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "very-low",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.3,
    description: "Very Low tier - 최저 비용 플래그십급",
  },
  performance: {
    avgResponseTime: 0.8,
    speed: "very-fast",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-12",
}

/**
 * Grok 4.1 (xAI)
 *
 * xAI 최신 플래그십
 * 코딩 벤치마크 9.8/10
 */
const grok41: AIModelMetadata = {
  id: "grok-4.1",
  name: "Grok 4.1",
  provider: "xai",
  description: "xAI의 최신 플래그십. 코딩 벤치마크 9.8/10, 실시간 데이터와 강력한 추론",
  bestFor: [
    "실시간 정보 기반 코딩",
    "최신 API/라이브러리 통합",
    "복잡한 추론 작업",
    "창의적 솔루션",
  ],
  limitations: [
    "프레임워크 특화 데이터 부족",
    "제한된 접근성",
  ],
  capabilities: {
    codeQuality: 9,
    algorithmSolving: 9,
    frameworkSpecialization: 7,
    creativity: 9,
    reasoning: 10,
    multimodal: true,
    largeContext: true,
    realtimeData: true,
  },
  cost: {
    level: "high",
    inputCostPer1M: 5.0,
    outputCostPer1M: 15.0,
    description: "High tier - 실시간 데이터 접근 포함",
  },
  performance: {
    avgResponseTime: 2.5,
    speed: "fast",
    contextWindow: 256000,
    maxOutputTokens: 16384,
  },
  active: true,
  releaseDate: "2025-11",
}

/**
 * Grok 4 (xAI)
 *
 * Grok 4 시리즈 기본 모델
 */
const grok4: AIModelMetadata = {
  id: "grok-4",
  name: "Grok 4",
  provider: "xai",
  description: "xAI Grok 4 시리즈. 강력한 추론과 실시간 데이터 접근",
  bestFor: [
    "실시간 데이터 기반 코딩",
    "추론 작업",
    "최신 정보 필요 시",
  ],
  limitations: [
    "Grok 4.1 대비 낮은 성능",
    "프레임워크 특화 부족",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 8,
    frameworkSpecialization: 7,
    creativity: 8,
    reasoning: 9,
    multimodal: true,
    largeContext: true,
    realtimeData: true,
  },
  cost: {
    level: "medium",
    inputCostPer1M: 3.0,
    outputCostPer1M: 12.0,
    description: "Medium tier - 실시간 데이터 접근",
  },
  performance: {
    avgResponseTime: 3.0,
    speed: "medium",
    contextWindow: 128000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-09",
}

/**
 * Llama 4 (Meta)
 *
 * Meta의 최신 오픈소스 모델
 */
const llama4: AIModelMetadata = {
  id: "llama-4",
  name: "Llama 4",
  provider: "meta",
  description: "Meta의 최신 오픈소스 모델. 로컬 실행 가능, 커스터마이징 지원",
  bestFor: [
    "오픈소스 요구사항",
    "로컬/온프레미스 실행",
    "모델 커스터마이징",
    "비용 최적화 (자체 호스팅)",
  ],
  limitations: [
    "Claude/GPT 대비 성능 격차",
    "자체 인프라 필요",
    "프롬프트 엔지니어링 필요",
  ],
  capabilities: {
    codeQuality: 7,
    algorithmSolving: 7,
    frameworkSpecialization: 6,
    creativity: 7,
    reasoning: 7,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "very-low",
    description: "Very Low tier - 자체 호스팅 시 무료",
  },
  performance: {
    avgResponseTime: 2.0,
    speed: "fast",
    contextWindow: 128000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-04",
}

/**
 * Llama 4 Scout (Meta)
 *
 * Llama 4 경량 버전
 */
const llama4Scout: AIModelMetadata = {
  id: "llama-4-scout",
  name: "Llama 4 Scout",
  provider: "meta",
  description: "Llama 4 경량 버전. 빠른 추론, 엣지 디바이스 호환",
  bestFor: [
    "빠른 코드 완성",
    "엣지 디바이스 배포",
    "저사양 환경",
  ],
  limitations: [
    "복잡한 작업 한계",
    "제한된 컨텍스트",
  ],
  capabilities: {
    codeQuality: 6,
    algorithmSolving: 6,
    frameworkSpecialization: 5,
    creativity: 6,
    reasoning: 6,
    multimodal: false,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "very-low",
    description: "Very Low tier - 경량 오픈소스",
  },
  performance: {
    avgResponseTime: 0.5,
    speed: "very-fast",
    contextWindow: 32000,
    maxOutputTokens: 4096,
  },
  active: true,
  releaseDate: "2025-04",
}

/**
 * Llama 4 Maverick (Meta)
 *
 * Llama 4 고성능 버전
 */
const llama4Maverick: AIModelMetadata = {
  id: "llama-4-maverick",
  name: "Llama 4 Maverick",
  provider: "meta",
  description: "Llama 4 고성능 버전. 오픈소스 중 최고 성능",
  bestFor: [
    "고성능 오픈소스 필요 시",
    "복잡한 코드 생성",
    "커스터마이징 가능한 고성능 모델",
  ],
  limitations: [
    "높은 컴퓨팅 요구사항",
    "상용 모델 대비 성능",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 8,
    frameworkSpecialization: 7,
    creativity: 8,
    reasoning: 8,
    multimodal: true,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "low",
    description: "Low tier - 고성능 오픈소스",
  },
  performance: {
    avgResponseTime: 3.0,
    speed: "medium",
    contextWindow: 256000,
    maxOutputTokens: 16384,
  },
  active: true,
  releaseDate: "2025-04",
}

/**
 * Qwen 2.5 Coder (Alibaba)
 *
 * 코딩 특화 오픈소스 모델
 */
const qwen25Coder: AIModelMetadata = {
  id: "qwen-2.5-coder",
  name: "Qwen 2.5 Coder",
  provider: "alibaba",
  description: "Alibaba의 코딩 특화 모델. 다국어 코드 지원, 비용 효율적",
  bestFor: [
    "다국어 코드 생성",
    "코드 완성 및 수정",
    "비용 효율적 코딩 작업",
    "오픈소스 요구사항",
  ],
  limitations: [
    "영어 문서화 제한",
    "서양 프레임워크 특화 약함",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 8,
    frameworkSpecialization: 7,
    creativity: 7,
    reasoning: 7,
    multimodal: false,
    largeContext: false,
    realtimeData: false,
  },
  cost: {
    level: "very-low",
    description: "Very Low tier - 코딩 특화 오픈소스",
  },
  performance: {
    avgResponseTime: 1.5,
    speed: "fast",
    contextWindow: 64000,
    maxOutputTokens: 8192,
  },
  active: true,
  releaseDate: "2025-08",
}

/**
 * Qwen 2.5 Coder 32B (Alibaba)
 *
 * 대형 코딩 특화 모델
 */
const qwen25Coder32B: AIModelMetadata = {
  id: "qwen-2.5-coder-32b",
  name: "Qwen 2.5 Coder 32B",
  provider: "alibaba",
  description: "Qwen 2.5 Coder 대형 버전. 더 복잡한 코딩 작업 지원",
  bestFor: [
    "복잡한 코드 생성",
    "대규모 리팩토링",
    "다국어 코드 지원",
    "오픈소스 고성능",
  ],
  limitations: [
    "높은 컴퓨팅 요구사항",
    "서양 프레임워크 특화 약함",
  ],
  capabilities: {
    codeQuality: 8,
    algorithmSolving: 8,
    frameworkSpecialization: 7,
    creativity: 7,
    reasoning: 8,
    multimodal: false,
    largeContext: true,
    realtimeData: false,
  },
  cost: {
    level: "low",
    description: "Low tier - 대형 코딩 특화 모델",
  },
  performance: {
    avgResponseTime: 2.5,
    speed: "fast",
    contextWindow: 128000,
    maxOutputTokens: 16384,
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
  "claude-opus-4.5": claudeOpus45,
  "claude-haiku-3.5": {
    ...claudeSonnet45,
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    description: "Claude 경량 모델. 빠르고 간단한 작업에 최적화",
    capabilities: { ...claudeSonnet45.capabilities, codeQuality: 7, reasoning: 7 },
    cost: { level: "low", description: "Fast and affordable" },
    performance: { ...claudeSonnet45.performance, avgResponseTime: 1.5, speed: "very-fast" },
  },

  // OpenAI GPT (2025 신규 모델 포함)
  "gpt-4.1": gpt41,
  "gpt-4-turbo": { ...gpt41, id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  "gpt-4": { ...gpt41, id: "gpt-4", name: "GPT-4" },
  "gpt-5": gpt5,
  "gpt-5.2": gpt52,
  "gpt-5-mini": gpt5Mini,
  "o1": { ...o3Mini, id: "o1", name: "o1" },
  "o1-mini": { ...o3Mini, id: "o1-mini", name: "o1-mini" },
  "o3": o3,
  "o3-mini": o3Mini,

  // Google Gemini (2025 신규 모델 포함)
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
  "gemini-3-pro": gemini3Pro,
  "gemini-3-flash": gemini3Flash,

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

  // xAI Grok (2025 신규 모델 포함)
  "grok-3": grok3,
  "grok-2": { ...grok3, id: "grok-2", name: "Grok 2" },
  "grok-4": grok4,
  "grok-4.1": grok41,

  // Meta Llama (2025 신규 오픈소스 모델)
  "llama-4": llama4,
  "llama-4-scout": llama4Scout,
  "llama-4-maverick": llama4Maverick,

  // Alibaba Qwen (2025 신규 오픈소스 모델)
  "qwen-2.5-coder": qwen25Coder,
  "qwen-2.5-coder-32b": qwen25Coder32B,

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
