/**
 * Prompt Generator V2
 *
 * Schema를 AI가 이해할 수 있는 프롬프트로 변환
 * V1 방식 참조: 코드 생성 없이 순수 스펙 설명만 제공
 */

import type { LaydlerSchema } from "@/types/schema"
import { getTemplate } from "./prompt-templates"
import { validateSchema } from "./schema-validation"
import { normalizeSchema } from "./schema-utils"

/**
 * Prompt Generation Result for Schema
 *
 * V1과 동일한 구조이지만 검증 결과 포함
 */
export interface GenerationResult {
  success: boolean
  prompt?: string
  schema?: LaydlerSchema
  errors?: string[]
  warnings?: string[]
}

/**
 * Generate AI prompt from Laylder Schema
 *
 * V1과 동일한 패턴: validation → template → sections → prompt
 * 특성: positioning, layout, styling, responsive 스펙 포함
 *
 * @param schema - Schema (Component Independence)
 * @param framework - Target framework (e.g., "react")
 * @param cssSolution - Target CSS solution (e.g., "tailwind")
 * @returns Generation result with prompt and schema
 *
 * @example
 * const result = generatePrompt(schemaV2, "react", "tailwind")
 * if (result.success) {
 *   // 사용자가 Claude/GPT에 복붙
 *   navigator.clipboard.writeText(result.prompt!)
 * }
 */
export function generatePrompt(
  schema: LaydlerSchema,
  framework: string,
  cssSolution: string
): GenerationResult {
  // 0. Normalize schema with breakpoint inheritance (Mobile → Tablet → Desktop)
  const normalizedSchema = normalizeSchema(schema)

  // 1. Validate schema using validation
  const validationResult = validateSchema(normalizedSchema)

  if (!validationResult.valid) {
    return {
      success: false,
      errors: validationResult.errors.map((e) => {
        const location = e.componentId
          ? `${e.componentId}${e.field ? `.${e.field}` : ""}`
          : e.field || "schema"
        return `${location}: ${e.message}`
      }),
    }
  }

  // 2. Get template for framework + CSS solution
  const template = getTemplate(framework, cssSolution)
  if (!template) {
    return {
      success: false,
      errors: [
        `No template found for framework: ${framework}, CSS: ${cssSolution}`,
      ],
    }
  }

  // 3. Generate prompt sections (V1과 동일한 패턴)
  const sections: string[] = []

  // System prompt - 아키텍처 설명
  sections.push(template.systemPrompt)
  sections.push("\n---\n")

  // Components section - positioning, layout, styling, responsive 포함
  sections.push(template.componentSection(normalizedSchema.components))
  sections.push("---\n")

  // Layouts section - structure 기반 + Canvas Grid 정보 (2025 개선)
  sections.push(template.layoutSection(normalizedSchema.components, normalizedSchema.breakpoints, normalizedSchema.layouts))
  sections.push("---\n")

  // Instructions section - 특화 구현 지침
  sections.push(template.instructionsSection())
  sections.push("---\n")

  // Schema JSON for reference
  sections.push("## Full Schema (JSON)\n\n")
  sections.push(
    "For reference, here is the complete Schema in JSON format:\n\n"
  )
  sections.push("```json\n")
  sections.push(JSON.stringify(normalizedSchema, null, 2))
  sections.push("\n```\n")

  const prompt = sections.join("\n")

  return {
    success: true,
    prompt,
    schema: normalizedSchema,
    warnings: validationResult.warnings.map((w) => {
      const location = w.componentId
        ? `${w.componentId}${w.field ? `.${w.field}` : ""}`
        : w.field || "schema"
      return `${location}: ${w.message}`
    }),
  }
}

/**
 * Generate compact summary of Schema
 *
 * V2는 컴포넌트별 positioning/layout 정보가 있으므로
 * 요약에 이를 포함
 */
export function generateSchemaSummary(schema: LaydlerSchema): string {
  const componentCount = schema.components.length
  const breakpointCount = schema.breakpoints.length
  const componentNames = schema.components.map((c) => c.name).join(", ")
  const breakpointNames = schema.breakpoints.map((b) => b.name).join(", ")

  // 컴포넌트별 positioning 타입 카운트
  const positioningTypes = schema.components.reduce(
    (acc, c) => {
      const type = c.positioning.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const positioningSummary = Object.entries(positioningTypes)
    .map(([type, count]) => `${type}(${count})`)
    .join(", ")

  return (
    `Schema Summary:\n` +
    `- Components (${componentCount}): ${componentNames}\n` +
    `- Positioning: ${positioningSummary}\n` +
    `- Breakpoints (${breakpointCount}): ${breakpointNames}\n` +
    `- Framework: React\n` +
    `- CSS Solution: Tailwind CSS`
  )
}

/**
 * Estimate token count for the generated prompt
 *
 * V2는 positioning/layout/styling/responsive 정보가 추가되어
 * V1보다 평균적으로 30-50% 더 긴 프롬프트 생성
 *
 * Rough estimate: 1 token ≈ 4 characters
 */
export function estimateTokenCount(prompt: string): number {
  return Math.ceil(prompt.length / 4)
}

/**
 * Get recommended AI model based on prompt complexity
 *
 * V2는 더 복잡한 컴포넌트 구조를 다루므로
 * 임계값을 약간 낮춤 (더 강력한 모델 권장)
 */
export function getRecommendedModel(tokenCount: number): string {
  if (tokenCount < 800) return "Claude 3.5 Haiku (fast, simple layouts)"
  if (tokenCount < 3000) return "Claude 3.5 Sonnet (recommended for V2)"
  return "Claude 3.5 Opus (complex responsive layouts)"
}
