/**
 * AI Model Strategies Test Script
 *
 * 각 AI 모델별 프롬프트 생성 전략을 테스트하는 검증 스크립트
 *
 * 실행 방법:
 * ```bash
 * npx tsx scripts/test-ai-model-strategies.ts
 * ```
 */

import {
  createPromptStrategy,
  getModelRecommendations,
  getAvailableModelIds,
  getModelsByCategory,
} from "../lib/prompt-strategies"
import type { AIModelId, PromptGenerationOptions } from "../types/ai-models"
import type { LaydlerSchema } from "../types/schema"
import { sampleSchemas } from "../lib/sample-data"

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title: string) {
  log(`\n${"=".repeat(80)}`, "bright")
  log(title, "bright")
  log("=".repeat(80), "bright")
}

function subsection(title: string) {
  log(`\n${"-".repeat(80)}`, "cyan")
  log(title, "cyan")
  log("-".repeat(80), "cyan")
}

/**
 * Test 1: Factory 기본 동작 테스트
 */
function testFactoryBasics() {
  section("Test 1: Factory 기본 동작 테스트")

  try {
    // 사용 가능한 모델 목록
    const availableModels = getAvailableModelIds()
    log(`✓ 사용 가능한 모델 개수: ${availableModels.length}`, "green")
    log(`  모델: ${availableModels.slice(0, 5).join(", ")} ...`, "blue")

    // 카테고리별 모델
    const modelsByCategory = getModelsByCategory()
    log(`\n✓ 카테고리별 모델:`, "green")
    for (const [category, models] of Object.entries(modelsByCategory)) {
      if (models.length > 0) {
        log(`  - ${category}: ${models.length}개`, "blue")
      }
    }

    // 전략 생성 테스트
    const testModels: AIModelId[] = [
      "claude-sonnet-4.5",
      "gpt-4.1",
      "gemini-2.5-pro",
      "deepseek-r1",
    ]

    log(`\n✓ 전략 생성 테스트:`, "green")
    for (const modelId of testModels) {
      const strategy = createPromptStrategy(modelId)
      log(`  - ${modelId}: ${strategy.metadata.name} (${strategy.metadata.provider})`, "blue")
    }

    log(`\n✅ Factory 기본 동작 테스트 통과`, "green")
    return true
  } catch (error) {
    log(`\n❌ Factory 기본 동작 테스트 실패: ${error}`, "red")
    return false
  }
}

/**
 * Test 2: 모델 추천 시스템 테스트
 */
function testModelRecommendation() {
  section("Test 2: 모델 추천 시스템 테스트")

  try {
    // 시나리오 1: 간단한 프로젝트, 비용 민감
    subsection("시나리오 1: 간단한 프로젝트, 비용 민감")
    const recommendations1 = getModelRecommendations({
      schemaComplexity: "simple",
      responsiveComplexity: "simple",
      needsFrameworkSpecialization: false,
      costSensitivity: "high",
      qualityRequirement: "draft",
      speedPriority: "high",
    })

    log(`추천 모델 (Top 3):`, "cyan")
    recommendations1.slice(0, 3).forEach((rec, index) => {
      log(
        `  ${index + 1}. ${rec.modelId} (점수: ${rec.score}, 비용: ${rec.estimatedCost}, 품질: ${rec.estimatedQuality})`,
        "blue"
      )
      log(`     이유: ${rec.reason}`, "blue")
    })

    // 시나리오 2: 복잡한 프로젝트, 프로덕션 품질
    subsection("시나리오 2: 복잡한 프로젝트, 프로덕션 품질")
    const recommendations2 = getModelRecommendations({
      schemaComplexity: "complex",
      responsiveComplexity: "complex",
      needsFrameworkSpecialization: true,
      costSensitivity: "low",
      qualityRequirement: "production",
      speedPriority: "medium",
    })

    log(`추천 모델 (Top 3):`, "cyan")
    recommendations2.slice(0, 3).forEach((rec, index) => {
      log(
        `  ${index + 1}. ${rec.modelId} (점수: ${rec.score}, 비용: ${rec.estimatedCost}, 품질: ${rec.estimatedQuality})`,
        "blue"
      )
      log(`     이유: ${rec.reason}`, "blue")
    })

    // 시나리오 3: 중간 복잡도, 균형 잡힌 요구사항
    subsection("시나리오 3: 중간 복잡도, 균형 잡힌 요구사항")
    const recommendations3 = getModelRecommendations({
      schemaComplexity: "medium",
      responsiveComplexity: "medium",
      needsFrameworkSpecialization: true,
      costSensitivity: "medium",
      qualityRequirement: "production",
      speedPriority: "medium",
    })

    log(`추천 모델 (Top 3):`, "cyan")
    recommendations3.slice(0, 3).forEach((rec, index) => {
      log(
        `  ${index + 1}. ${rec.modelId} (점수: ${rec.score}, 비용: ${rec.estimatedCost}, 품질: ${rec.estimatedQuality})`,
        "blue"
      )
      log(`     이유: ${rec.reason}`, "blue")
    })

    log(`\n✅ 모델 추천 시스템 테스트 통과`, "green")
    return true
  } catch (error) {
    log(`\n❌ 모델 추천 시스템 테스트 실패: ${error}`, "red")
    return false
  }
}

/**
 * Test 3: 프롬프트 생성 테스트 (각 모델별)
 */
function testPromptGeneration() {
  section("Test 3: 프롬프트 생성 테스트")

  try {
    // Sample schema 로드
    const schema = sampleSchemas.github

    if (!schema) {
      throw new Error("Sample schema를 로드할 수 없습니다")
    }

    log(`샘플 Schema 로드 완료: ${schema.components.length}개 컴포넌트`, "cyan")

    // 테스트할 모델 및 옵션
    const testCases: Array<{
      modelId: AIModelId
      options: PromptGenerationOptions
      description: string
    }> = [
      {
        modelId: "claude-sonnet-4.5",
        options: {
          targetModel: "claude-sonnet-4.5",
          optimizationLevel: "quality",
          verbosity: "detailed",
          chainOfThought: true,
        },
        description: "Claude Sonnet 4.5 (Quality, CoT)",
      },
      {
        modelId: "gpt-4.1",
        options: {
          targetModel: "gpt-4.1",
          optimizationLevel: "balanced",
          verbosity: "normal",
          includeExamples: true,
        },
        description: "GPT-4.1 (Balanced, Examples)",
      },
      {
        modelId: "gemini-2.5-pro",
        options: {
          targetModel: "gemini-2.5-pro",
          optimizationLevel: "balanced",
          verbosity: "normal",
        },
        description: "Gemini 2.5 Pro (Framework-focused)",
      },
      {
        modelId: "deepseek-r1",
        options: {
          targetModel: "deepseek-r1",
          optimizationLevel: "quick",
          verbosity: "minimal",
          costSensitive: true,
        },
        description: "DeepSeek R1 (Cost-efficient)",
      },
    ]

    for (const testCase of testCases) {
      subsection(testCase.description)

      const strategy = createPromptStrategy(testCase.modelId)
      const result = strategy.generatePrompt(schema, "react", "tailwind", testCase.options)

      if (result.success && result.prompt) {
        log(`✓ 프롬프트 생성 성공`, "green")
        log(`  - 토큰 추정: ${result.estimatedTokens?.toLocaleString() || "N/A"}`, "blue")
        log(`  - 섹션 수: ${result.sections?.length || "N/A"}`, "blue")
        log(
          `  - 프롬프트 길이: ${result.prompt.length.toLocaleString()} characters`,
          "blue"
        )
        log(`  - 모델: ${result.modelId}`, "blue")

        if (result.warnings && result.warnings.length > 0) {
          log(`  ⚠ 경고 ${result.warnings.length}개:`, "yellow")
          result.warnings.slice(0, 3).forEach((warning) => {
            log(`    - ${warning}`, "yellow")
          })
        }

        // 프롬프트 샘플 출력 (첫 500자)
        log(`\n  프롬프트 샘플 (첫 500자):`, "magenta")
        log(`  "${result.prompt.substring(0, 500)}..."`, "blue")
      } else {
        log(`✗ 프롬프트 생성 실패`, "red")
        if (result.errors) {
          result.errors.forEach((error) => {
            log(`  - ${error}`, "red")
          })
        }
        return false
      }
    }

    log(`\n✅ 프롬프트 생성 테스트 통과`, "green")
    return true
  } catch (error) {
    log(`\n❌ 프롬프트 생성 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 4: 프롬프트 차이점 비교 (모델별)
 */
function testPromptDifferences() {
  section("Test 4: 프롬프트 차이점 비교 (모델별)")

  try {
    const schema = sampleSchemas.github

    if (!schema) {
      throw new Error("Sample schema를 로드할 수 없습니다")
    }

    const models: AIModelId[] = ["claude-sonnet-4.5", "gpt-4.1", "gemini-2.5-pro", "deepseek-r1"]

    log(`모델별 프롬프트 특성 비교:`, "cyan")
    log(`\n${"Model".padEnd(25)} | ${"Tokens".padEnd(10)} | ${"Length".padEnd(10)} | ${"Verbosity"}`)
    log("-".repeat(80))

    const results: Array<{
      modelId: AIModelId
      tokens: number
      length: number
      verbosity: string
    }> = []

    for (const modelId of models) {
      const strategy = createPromptStrategy(modelId)
      const result = strategy.generatePrompt(schema, "react", "tailwind", {
        targetModel: modelId,
        verbosity: "normal",
      })

      if (result.success && result.prompt) {
        const tokens = result.estimatedTokens || 0
        const length = result.prompt.length
        const verbosity =
          length < 3000 ? "Minimal" : length < 6000 ? "Normal" : "Detailed"

        results.push({ modelId, tokens, length, verbosity })

        log(
          `${modelId.padEnd(25)} | ${tokens.toLocaleString().padEnd(10)} | ${length.toLocaleString().padEnd(10)} | ${verbosity}`,
          "blue"
        )
      }
    }

    // 통계
    log(`\n통계:`, "cyan")
    const avgTokens = results.reduce((sum, r) => sum + r.tokens, 0) / results.length
    const avgLength = results.reduce((sum, r) => sum + r.length, 0) / results.length
    log(`  - 평균 토큰: ${Math.round(avgTokens).toLocaleString()}`, "blue")
    log(`  - 평균 길이: ${Math.round(avgLength).toLocaleString()} characters`, "blue")

    const shortest = results.reduce((min, r) => (r.length < min.length ? r : min))
    const longest = results.reduce((max, r) => (r.length > max.length ? r : max))
    log(`  - 가장 짧은 프롬프트: ${shortest.modelId} (${shortest.length.toLocaleString()})`, "blue")
    log(`  - 가장 긴 프롬프트: ${longest.modelId} (${longest.length.toLocaleString()})`, "blue")

    log(`\n✅ 프롬프트 차이점 비교 테스트 통과`, "green")
    return true
  } catch (error) {
    log(`\n❌ 프롬프트 차이점 비교 테스트 실패: ${error}`, "red")
    return false
  }
}

/**
 * Main test runner
 */
async function main() {
  log("\n", "reset")
  log("╔════════════════════════════════════════════════════════════════════════════╗", "bright")
  log("║         AI Model Strategies Test Suite                                    ║", "bright")
  log("╚════════════════════════════════════════════════════════════════════════════╝", "bright")

  const tests = [
    { name: "Factory 기본 동작", fn: testFactoryBasics },
    { name: "모델 추천 시스템", fn: testModelRecommendation },
    { name: "프롬프트 생성", fn: testPromptGeneration },
    { name: "프롬프트 차이점 비교", fn: testPromptDifferences },
  ]

  let passedTests = 0
  let failedTests = 0

  for (const test of tests) {
    const passed = test.fn()
    if (passed) {
      passedTests++
    } else {
      failedTests++
    }
  }

  // Summary
  section("Test Summary")
  log(`Total Tests: ${tests.length}`, "cyan")
  log(`Passed: ${passedTests}`, "green")
  log(`Failed: ${failedTests}`, failedTests > 0 ? "red" : "green")
  log(`Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`, "bright")

  if (failedTests === 0) {
    log(`\n🎉 모든 테스트 통과!`, "green")
    process.exit(0)
  } else {
    log(`\n❌ ${failedTests}개 테스트 실패`, "red")
    process.exit(1)
  }
}

// Run tests
main().catch((error) => {
  log(`\n❌ 테스트 실행 중 오류 발생: ${error}`, "red")
  console.error(error)
  process.exit(1)
})
