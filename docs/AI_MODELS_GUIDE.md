# AI Models Guide - Multi-Model Prompt Generation System

## 개요

Visual Layout Builder는 2025년 12월 기준 최신 AI 코딩 모델들을 지원하는 Multi-Model Prompt Generation System을 제공합니다. 각 AI 모델의 특성에 맞게 최적화된 프롬프트를 생성하여 최고 품질의 코드를 얻을 수 있습니다.

## 지원 모델 (35개)

### Anthropic Claude (5개)
- **Claude Opus 4.5** ⭐ 추천: SWE-bench 80.9%, 2025년 최강 코딩 모델
- **Claude Sonnet 4.5**: 프로덕션 코드, 고품질
- **Claude Sonnet 4**: 균형 잡힌 성능
- **Claude Opus 4**: 최고 품질, 복잡한 작업
- **Claude Haiku 3.5**: 빠르고 저렴

### OpenAI GPT (10개)
- **GPT-5.2** ⭐ 추천: SWE-bench 80%, AIME 2025 100%
- **GPT-5**: 강력한 추론과 코드 생성
- **GPT-5 mini**: 빠르고 저렴한 일반 코딩
- **GPT-4.1**: 창의적 솔루션, 복잡한 아키텍처
- **GPT-4 Turbo**: 빠른 응답
- **GPT-4**: 안정적 성능
- **o3**: ARC-AGI-2 52.9%, 깊은 추론
- **o1**: 추론 특화
- **o1-mini**: 빠른 추론
- **o3-mini**: 알고리즘 문제

### Google Gemini (5개)
- **Gemini 3 Pro** ⭐ 추천: LiveCodeBench Elo 2439, SWE-bench 76.2%
- **Gemini 3 Flash**: SWE-bench 78%, 빠르고 저렴
- **Gemini 2.5 Pro**: 프레임워크 특화, 최고 가성비
- **Gemini 2.0 Pro**: 대용량 컨텍스트 (2M 토큰)
- **Gemini 2.0 Flash**: 가장 빠르고 저렴

### DeepSeek (3개)
- **DeepSeek R1** ⭐ 추천: 최저 비용 (90% 저렴)
- **DeepSeek V3**: 균형 잡힌 성능
- **DeepSeek Coder V2**: 코딩 특화, 338개 언어 지원

### xAI Grok (4개)
- **Grok 4.1** ⭐ 추천: 코딩 벤치마크 9.8/10, 실시간 데이터
- **Grok 4**: 강력한 추론
- **Grok 3**: 추론 특화, 실시간 데이터
- **Grok 2**: 균형 잡힌 성능

### Meta Llama (3개) - 오픈소스
- **Llama 4 Maverick**: 오픈소스 중 최고 성능
- **Llama 4**: 로컬 실행 가능, 커스터마이징
- **Llama 4 Scout**: 경량 버전, 엣지 디바이스

### Alibaba Qwen (2개) - 오픈소스
- **Qwen 2.5 Coder 32B**: 대형 코딩 특화
- **Qwen 2.5 Coder**: 다국어 코드 지원

## 빠른 시작

### 1. 기본 사용법

```typescript
import { createPromptStrategy } from '@/lib/prompt-strategies'
import { sampleSchemas } from '@/lib/sample-data'

// 전략 생성
const strategy = createPromptStrategy('claude-opus-4.5')

// 프롬프트 생성
const result = strategy.generatePrompt(
  sampleSchemas.github,
  'react',
  'tailwind',
  {
    verbosity: 'detailed',    // 'minimal' | 'normal' | 'detailed'
    chainOfThought: true
  }
)

if (result.success) {
  console.log(result.prompt) // AI에 복붙할 프롬프트
  console.log(`예상 토큰: ${result.estimatedTokens}`)
}
```

### 2. 모델 자동 추천

```typescript
import { getModelRecommendations } from '@/lib/prompt-strategies'

// 프로젝트 특성 기반 추천
const recommendations = getModelRecommendations({
  schemaComplexity: 'complex',        // simple | medium | complex
  responsiveComplexity: 'medium',     // simple | medium | complex
  needsFrameworkSpecialization: true, // 프레임워크 특화 필요 여부
  costSensitivity: 'medium',          // low | medium | high
  qualityRequirement: 'production',   // draft | production | enterprise
  speedPriority: 'medium'             // low | medium | high
})

// Top 3 추천 모델
recommendations.slice(0, 3).forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.modelId}`)
  console.log(`   점수: ${rec.score}`)
  console.log(`   비용: ${rec.estimatedCost}`)
  console.log(`   품질: ${rec.estimatedQuality}`)
  console.log(`   이유: ${rec.reason}`)
})
```

### 3. 모델별 옵션

```typescript
// Claude Opus 4.5: 최고 품질, Chain-of-Thought
const claudeResult = createPromptStrategy('claude-opus-4.5').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'detailed',       // 상세한 프롬프트
    chainOfThought: true,        // 단계별 추론 요청
    temperature: 0               // 사실 기반 작업
  }
)

// GPT-5.2: 최고 성능, 창의성
const gptResult = createPromptStrategy('gpt-5.2').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'normal',          // 표준 상세도
    includeExamples: true,        // 예시 코드 포함
    temperature: 0.7              // 창의적 작업
  }
)

// Gemini 3 Pro: 프레임워크 특화, 최신 패턴
const geminiResult = createPromptStrategy('gemini-3-pro').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'normal'           // 표준 상세도
  }
)

// DeepSeek: 비용 최적화
const deepseekResult = createPromptStrategy('deepseek-r1').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'minimal',         // 간결한 프롬프트 (~30% fewer tokens)
    costSensitive: true           // 비용 최적화 모드
  }
)

// Llama 4: 오픈소스, 로컬 실행
const llamaResult = createPromptStrategy('llama-4-maverick').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'normal'
  }
)
```

## 모델 선택 가이드

### 시나리오별 추천

#### 1. 프로덕션 코드 생성 (품질 최우선)
```
추천: Claude Opus 4.5
이유: SWE-bench 80.9%, 최고 품질, 안전한 코드
비용: Premium
예상 토큰: 2,500
```

#### 2. 빠른 프로토타입 (속도 + 비용)
```
추천: Gemini 3 Flash 또는 DeepSeek R1
이유: 빠른 응답, 최저 비용
비용: Very Low
예상 토큰: 300-500
```

#### 3. 프레임워크 특화 (Next.js, React)
```
추천: Gemini 3 Pro
이유: LiveCodeBench Elo 2439, 프레임워크 통합 최강
비용: Medium
예상 토큰: 2,300
```

#### 4. 창의적 솔루션 필요
```
추천: GPT-5.2
이유: AIME 2025 100%, 창의성 최고
비용: Premium
예상 토큰: 2,300
```

#### 5. 알고리즘 문제
```
추천: o3 또는 DeepSeek Coder V2
이유: ARC-AGI-2 52.9%, 깊은 추론
비용: High-Medium
예상 토큰: 1,300
```

#### 6. 오픈소스/로컬 실행 필요
```
추천: Llama 4 Maverick 또는 Qwen 2.5 Coder 32B
이유: 오픈소스, 커스터마이징 가능
비용: Very Low (자체 호스팅)
예상 토큰: 2,000
```

### 비용 vs 품질 비교

| Model | 비용 | 품질 | 속도 | 추천 용도 |
|-------|------|------|------|-----------|
| Claude Opus 4.5 | $$$$$ | ⭐⭐⭐⭐⭐ | 느림 | 엔터프라이즈 |
| GPT-5.2 | $$$$ | ⭐⭐⭐⭐⭐ | 중간 | 복잡한 추론 |
| Claude Sonnet 4.5 | $$$ | ⭐⭐⭐⭐⭐ | 중간 | 프로덕션 |
| Gemini 3 Pro | $$ | ⭐⭐⭐⭐ | 빠름 | 프레임워크 특화 |
| Grok 4.1 | $$$ | ⭐⭐⭐⭐ | 빠름 | 실시간 데이터 |
| DeepSeek R1 | $ | ⭐⭐⭐ | 빠름 | 비용 민감 |
| Gemini 3 Flash | $ | ⭐⭐⭐⭐ | 매우 빠름 | 빠른 프로토타입 |
| Llama 4 Maverick | Free* | ⭐⭐⭐⭐ | 중간 | 오픈소스 |

*자체 호스팅 시

### 2025년 12월 신규 모델 성능 비교

| Model | SWE-bench | 특화 영역 | Context |
|-------|-----------|-----------|---------|
| Claude Opus 4.5 | 80.9% | 프로덕션 코드 | 200K |
| GPT-5.2 | 80% | 수학적 추론 | 256K |
| Gemini 3 Pro | 76.2% | 프레임워크 | 2M |
| Gemini 3 Flash | 78% | 속도 | 1M |
| o3 | - | ARC-AGI-2 52.9% | 200K |
| Grok 4.1 | - | 실시간 9.8/10 | 256K |

## 고급 사용법

### 1. 카테고리별 모델 목록

```typescript
import { getModelsByCategory } from '@/lib/prompt-strategies'

const modelsByCategory = getModelsByCategory()

console.log('Anthropic:', modelsByCategory.anthropic)
// ['claude-opus-4.5', 'claude-sonnet-4.5', 'claude-sonnet-4', 'claude-opus-4', 'claude-haiku-3.5']

console.log('Google:', modelsByCategory.google)
// ['gemini-3-pro', 'gemini-3-flash', 'gemini-2.5-pro', 'gemini-2.0-pro', 'gemini-2.0-flash']

console.log('Meta:', modelsByCategory.meta)
// ['llama-4', 'llama-4-scout', 'llama-4-maverick']

console.log('Alibaba:', modelsByCategory.alibaba)
// ['qwen-2.5-coder', 'qwen-2.5-coder-32b']
```

### 2. 모델 메타데이터 조회

```typescript
import { getModelMetadata } from '@/lib/ai-model-registry'

const metadata = getModelMetadata('claude-opus-4.5')

console.log('Name:', metadata.name)
console.log('Provider:', metadata.provider)
console.log('Best for:', metadata.bestFor)
console.log('Capabilities:', metadata.capabilities)
console.log('Cost:', metadata.cost)
console.log('Performance:', metadata.performance)
```

### 3. 복잡도 자동 계산

```typescript
import { calculateSchemaComplexity, calculateResponsiveComplexity } from '@/lib/ai-model-registry'

const schemaComplexity = calculateSchemaComplexity(schema.components.length)
// 'simple' (≤3), 'medium' (4-8), 'complex' (9+)

const responsiveComplexity = calculateResponsiveComplexity(
  schema.breakpoints.length,
  schema.components.filter(c => c.responsive).length
)
// 'simple', 'medium', 'complex'
```

### 4. Factory 캐싱 관리

```typescript
import { strategyFactory } from '@/lib/prompt-strategies'

// 캐시 크기 확인
console.log('Cache size:', strategyFactory.getCacheSize())

// 캐시 초기화 (메모리 관리)
strategyFactory.clearCache()
```

## 최적화 팁

### 1. 비용 최적화

```typescript
// DeepSeek 사용 + 간결한 프롬프트
const result = createPromptStrategy('deepseek-r1').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'minimal',         // ~30% fewer tokens
    costSensitive: true
  }
)
// 예상 비용: Claude 대비 90% 절감
```

### 2. 품질 최적화

```typescript
// Claude Opus 4.5 사용 + 상세 지침 + CoT
const result = createPromptStrategy('claude-opus-4.5').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'detailed',        // ~40% more tokens, clearer instructions
    chainOfThought: true,
    temperature: 0
  }
)
// 최고 품질 프로덕션 코드
```

### 3. 속도 최적화

```typescript
// Gemini 3 Flash 사용 + 간결한 프롬프트
const result = createPromptStrategy('gemini-3-flash').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'minimal'          // ~30% fewer tokens, faster processing
  }
)
// 가장 빠른 응답 (< 1초)
```

### 4. 오픈소스 활용

```typescript
// Llama 4 또는 Qwen 사용 - 자체 호스팅 시 무료
const result = createPromptStrategy('llama-4-maverick').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'normal'
  }
)
// 비용: $0 (자체 인프라 비용만)
```

## Best Practices

### 1. 프로젝트 초기 단계
- **추천 모델**: Gemini 3 Flash, DeepSeek R1
- **이유**: 빠른 프로토타입, 비용 절감
- **설정**: `verbosity: 'minimal'`, `costSensitive: true`

### 2. 프로덕션 개발 단계
- **추천 모델**: Claude Opus 4.5, Gemini 3 Pro
- **이유**: 고품질 코드, 프레임워크 특화
- **설정**: `verbosity: 'detailed'` (상세한 지침으로 품질 향상)

### 3. 복잡한 아키텍처 설계
- **추천 모델**: GPT-5.2, Claude Opus 4.5
- **이유**: 창의적 솔루션, 복잡한 패턴
- **설정**: `temperature: 0.7-0.9`, `chainOfThought: true`

### 4. 프레임워크 특화 작업
- **추천 모델**: Gemini 3 Pro
- **이유**: LiveCodeBench Elo 2439, 최신 패턴
- **설정**: `verbosity: 'normal'`

### 5. 오픈소스 요구사항
- **추천 모델**: Llama 4 Maverick, Qwen 2.5 Coder 32B
- **이유**: 로컬 실행, 커스터마이징 가능
- **설정**: `verbosity: 'normal'`

## 문제 해결

### Q: 프롬프트가 너무 긴 경우
```typescript
// verbosity를 'minimal'로 변경
const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
  verbosity: 'minimal'
})
```

### Q: 비용이 너무 높은 경우
```typescript
// DeepSeek 사용 + costSensitive 모드
const result = createPromptStrategy('deepseek-r1').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    costSensitive: true,
    verbosity: 'minimal'
  }
)
```

### Q: 코드 품질이 낮은 경우
```typescript
// Claude Opus 4.5 사용 + 상세 프롬프트
const result = createPromptStrategy('claude-opus-4.5').generatePrompt(
  schema,
  'react',
  'tailwind',
  {
    verbosity: 'detailed',        // 상세한 지침 제공
    chainOfThought: true
  }
)
```

### Q: 어떤 모델을 선택해야 할지 모르는 경우
```typescript
// 자동 추천 시스템 사용
const recommendations = getModelRecommendations({
  schemaComplexity: 'medium',
  responsiveComplexity: 'medium',
  needsFrameworkSpecialization: true,
  costSensitivity: 'medium',
  qualityRequirement: 'production',
  speedPriority: 'medium'
})

const bestModel = recommendations[0]
const strategy = createPromptStrategy(bestModel.modelId)
```

## 테스트

검증 스크립트 실행:

```bash
npx tsx scripts/test-ai-model-strategies.ts
```

**예상 결과:**
- ✅ Factory 기본 동작 테스트
- ✅ 모델 추천 시스템 테스트
- ✅ 프롬프트 생성 테스트
- ✅ 프롬프트 차이점 비교 테스트

Success Rate: 100% 🎉

## 참고 자료

### 데이터 출처
- SWE-bench Verified Leaderboard (2025-12)
- Aider Polyglot Coding Benchmark (2025-12)
- LiveCodeBench Elo Rankings (2025-12)
- ARC-AGI-2 Benchmark (2025-12)
- AIME 2025 Math Competition (2025-12)
- Render.com AI Coding Agents Benchmark (2025)

### 관련 파일
- `types/ai-models.ts`: 타입 정의
- `lib/ai-model-registry.ts`: 모델 메타데이터
- `lib/prompt-strategies/`: 전략 구현
- `scripts/test-ai-model-strategies.ts`: 테스트 스크립트

## 라이센스

MIT License

## 기여

새로운 AI 모델 추가 방법:

1. `types/ai-models.ts`에 모델 ID 추가
2. `lib/ai-model-registry.ts`에 메타데이터 추가
3. `lib/prompt-strategies/`에 새로운 전략 클래스 생성 (또는 기존 전략 사용)
4. `lib/prompt-strategies/strategy-factory.ts`에 provider 매핑
5. 테스트 작성 및 검증

---

**Last Updated:** 2025-12-27
**Version:** 2.0.0
**Status:** Production Ready ✅
