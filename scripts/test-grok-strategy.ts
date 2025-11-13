/**
 * Grok Strategy Quick Test
 *
 * Grok 전략이 올바르게 작동하는지 빠른 검증
 */

import { createPromptStrategy } from "../lib/prompt-strategies"
import { sampleSchemas } from "../lib/sample-data"

console.log("🧪 Testing Grok Strategy...\n")

try {
  // Grok 3 Strategy 테스트
  const grok3Strategy = createPromptStrategy("grok-3")
  console.log(`✓ Grok 3 Strategy 생성 성공`)
  console.log(`  - Model: ${grok3Strategy.metadata.name}`)
  console.log(`  - Provider: ${grok3Strategy.metadata.provider}`)

  // 프롬프트 생성 테스트
  const result = grok3Strategy.generatePrompt(sampleSchemas.github, "react", "tailwind", {
    targetModel: "grok-3",
    verbosity: "normal",
    chainOfThought: true,
  })

  if (result.success && result.prompt) {
    console.log(`✓ 프롬프트 생성 성공`)
    console.log(`  - 토큰 추정: ${result.estimatedTokens?.toLocaleString()}`)
    console.log(`  - 길이: ${result.prompt.length.toLocaleString()} characters`)
    console.log(`  - 섹션 수: ${result.sections?.length}`)

    // 프롬프트 특성 검증
    const hasReasoningPrompt = result.prompt.includes("Reasoning")
    const hasCurrentDate = result.prompt.includes("2025")
    const hasPriorityComponents = result.prompt.includes("Priority Components")

    console.log(`\n✓ Grok 특화 기능 검증:`)
    console.log(`  - 추론 기반 접근: ${hasReasoningPrompt ? "✓" : "✗"}`)
    console.log(`  - 실시간 컨텍스트 (날짜): ${hasCurrentDate ? "✓" : "✗"}`)
    console.log(`  - 우선순위 그룹화: ${hasPriorityComponents ? "✓" : "✗"}`)

    if (hasReasoningPrompt && hasCurrentDate && hasPriorityComponents) {
      console.log(`\n✅ Grok Strategy 테스트 통과!`)
      process.exit(0)
    } else {
      console.log(`\n❌ Grok 특화 기능이 누락되었습니다`)
      process.exit(1)
    }
  } else {
    console.log(`❌ 프롬프트 생성 실패`)
    if (result.errors) {
      result.errors.forEach((error) => console.log(`  - ${error}`))
    }
    process.exit(1)
  }
} catch (error) {
  console.log(`❌ 오류 발생: ${error}`)
  process.exit(1)
}
