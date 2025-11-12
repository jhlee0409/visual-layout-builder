/**
 * Prompt Generator V2
 *
 * Schema V2를 AI가 이해할 수 있는 프롬프트로 변환
 * V1 방식 참조: 코드 생성 없이 순수 스펙 설명만 제공
 */

import type { LaydlerSchemaV2 } from "@/types/schema-v2"
import { getTemplateV2 } from "./prompt-templates-v2"
import { validateSchemaV2 } from "./schema-validation-v2"
import { normalizeSchemaV2 } from "./schema-utils-v2"

/**
 * Prompt Generation Result for Schema V2
 *
 * V1과 동일한 구조이지만 V2 검증 결과 포함
 */
export interface GenerationResultV2 {
  success: boolean
  prompt?: string
  schema?: LaydlerSchemaV2
  errors?: string[]
  warnings?: string[]
}

/**
 * Generate AI prompt from Laylder Schema V2
 *
 * V1과 동일한 패턴: validation → template → sections → prompt
 * V2 특성: positioning, layout, styling, responsive 스펙 포함
 *
 * @param schema - Schema V2 (Component Independence)
 * @param framework - Target framework (e.g., "react")
 * @param cssSolution - Target CSS solution (e.g., "tailwind")
 * @returns Generation result with prompt and schema
 *
 * @example
 * const result = generatePromptV2(schemaV2, "react", "tailwind")
 * if (result.success) {
 *   // 사용자가 Claude/GPT에 복붙
 *   navigator.clipboard.writeText(result.prompt!)
 * }
 */
export function generatePromptV2(
  schema: LaydlerSchemaV2,
  framework: string,
  cssSolution: string
): GenerationResultV2 {
  // 0. Normalize schema with breakpoint inheritance (Mobile → Tablet → Desktop)
  const normalizedSchema = normalizeSchemaV2(schema)

  // 1. Validate schema using V2 validation
  const validationResult = validateSchemaV2(normalizedSchema)

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
  const template = getTemplateV2(framework, cssSolution)
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

  // System prompt - V2 아키텍처 설명
  sections.push(template.systemPrompt)
  sections.push("\n---\n")

  // Components section - positioning, layout, styling, responsive 포함
  sections.push(template.componentSection(normalizedSchema.components))
  sections.push("---\n")

  // Layouts section - structure 기반 (vertical/horizontal/sidebar-main)
  sections.push(template.layoutSection(normalizedSchema.breakpoints, normalizedSchema.layouts))
  sections.push("---\n")

  // Instructions section - V2 특화 구현 지침
  sections.push(template.instructionsSection())
  sections.push("---\n")

  // Schema JSON for reference
  sections.push("## Full Schema V2 (JSON)\n\n")
  sections.push(
    "For reference, here is the complete Schema V2 in JSON format:\n\n"
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
 * Generate compact summary of Schema V2
 *
 * V2는 컴포넌트별 positioning/layout 정보가 있으므로
 * 요약에 이를 포함
 */
export function generateSchemaSummaryV2(schema: LaydlerSchemaV2): string {
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
    `Schema V2 Summary:\n` +
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
export function estimateTokenCountV2(prompt: string): number {
  return Math.ceil(prompt.length / 4)
}

/**
 * Get recommended AI model based on prompt complexity
 *
 * V2는 더 복잡한 컴포넌트 구조를 다루므로
 * 임계값을 약간 낮춤 (더 강력한 모델 권장)
 */
export function getRecommendedModelV2(tokenCount: number): string {
  if (tokenCount < 800) return "Claude 3.5 Haiku (fast, simple layouts)"
  if (tokenCount < 3000) return "Claude 3.5 Sonnet (recommended for V2)"
  return "Claude 3.5 Opus (complex responsive layouts)"
}
