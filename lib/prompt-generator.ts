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
import { calculateLinkGroups, validateComponentLinks } from "./graph-utils"

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
 * @param componentLinks - Optional component links for cross-breakpoint relationships
 * @returns Generation result with prompt and schema
 *
 * @example
 * const result = generatePrompt(schemaV2, "react", "tailwind", componentLinks)
 * if (result.success) {
 *   // 사용자가 Claude/GPT에 복붙
 *   navigator.clipboard.writeText(result.prompt!)
 * }
 */
export function generatePrompt(
  schema: LaydlerSchema,
  framework: string,
  cssSolution: string,
  componentLinks?: Array<{ source: string; target: string }>
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

  // Component Links section - cross-breakpoint relationships (2025 개선)
  const linkWarnings: string[] = []
  if (componentLinks && componentLinks.length > 0) {
    // Validate component links before including in prompt
    const validComponentIds = new Set(normalizedSchema.components.map((c) => c.id))
    const linkValidation = validateComponentLinks(componentLinks, validComponentIds)

    if (!linkValidation.valid) {
      // Surface validation errors to user via warnings
      linkWarnings.push(...linkValidation.errors.map(err => `Component Link: ${err}`))

      // Only log in development environment (not production)
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Component link validation errors:", linkValidation.errors)
      }

      // Filter out invalid links
      const validLinks = componentLinks.filter((link) => {
        return validComponentIds.has(link.source) && validComponentIds.has(link.target)
      })
      if (validLinks.length === 0) {
        // All links are invalid - return error with warnings
        return {
          success: false,
          errors: ["All component links are invalid"],
          warnings: linkWarnings,
        }
      }
      // Use only valid links and warn user
      linkWarnings.push(`${componentLinks.length - validLinks.length} invalid link(s) filtered out`)
      componentLinks = validLinks
    }

    sections.push("## Component Links (Cross-Breakpoint Relationships)\n\n")
    sections.push(
      "The following components are **linked** and represent the **SAME UI element** across different breakpoints.\n\n" +
      "🚨 **CRITICAL:** Components in the same group MUST be treated as the SAME component across breakpoints.\n\n"
    )

    // Calculate groups using DFS algorithm
    const groups = calculateLinkGroups(componentLinks)
    groups.forEach((group, index) => {
      const componentNames = group
        .map((id) => {
          const comp = normalizedSchema.components.find((c) => c.id === id)
          return comp ? `${comp.name} (${id})` : id
        })
        .join(", ")
      sections.push(`**Group ${index + 1}:** ${componentNames}\n`)
    })
    sections.push(
      "\n🚨 **CRITICAL IMPLEMENTATION RULE - Component Links:**\n\n" +
      "Components in the same link group MUST be rendered as a **SINGLE React component** with responsive styling.\n" +
      "DO NOT create separate React components for each component ID in a group.\n\n" +
      "**Implementation Strategy:**\n" +
      "- Each link group = 1 React component definition\n" +
      `- Total unique components: ${groups.length} (NOT ${normalizedSchema.components.length})\n` +
      "- Use Tailwind responsive classes for breakpoint-specific styling\n" +
      "- Apply grid positioning for each breakpoint using responsive grid utilities\n\n" +
      "**Example (CORRECT - 2025 Pattern):**\n" +
      "```tsx\n" +
      "// Group 1: Header (c1 @ mobile), Header (c2 @ desktop) → SINGLE component\n" +
      "interface HeaderProps {}\n\n" +
      "function Header({}: HeaderProps) {\n" +
      "  return (\n" +
      "    <header className=\"\n" +
      "      sticky top-0 z-50 bg-white border-b shadow-sm\n" +
      "      col-span-full row-span-1\n" +
      "    \">\n" +
      "      Header (c1/c2)\n" +
      "    </header>\n" +
      "  )\n" +
      "}\n" +
      "```\n\n" +
      "**Example (WRONG - DO NOT DO THIS):**\n" +
      "```tsx\n" +
      "// ❌ WRONG: Separate components for same UI element\n" +
      "const HeaderMobile: React.FC = () => <header>...</header>  // c1 ❌\n" +
      "const HeaderDesktop: React.FC = () => <header>...</header> // c2 ❌\n\n" +
      "// ❌ WRONG: Using deprecated React.FC\n" +
      "const Header: React.FC<Props> = ({ children }) => { ... }\n" +
      "```\n\n" +
      "**Breakpoint-Specific Components (No Links):**\n\n" +
      "If a component exists ONLY in certain breakpoints (e.g., Sidebar only on desktop), use conditional rendering:\n\n" +
      "```tsx\n" +
      "// Component appears only on desktop (≥1024px)\n" +
      "function Sidebar({}: SidebarProps) {\n" +
      "  return (\n" +
      "    <aside className=\"hidden lg:flex flex-col gap-4 ...\">\n" +
      "      Sidebar (c4)\n" +
      "    </aside>\n" +
      "  )\n" +
      "}\n" +
      "```\n\n"
    )
    sections.push("---\n")
  }

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
    warnings: [
      ...validationResult.warnings.map((w) => {
        const location = w.componentId
          ? `${w.componentId}${w.field ? `.${w.field}` : ""}`
          : w.field || "schema"
        return `${location}: ${w.message}`
      }),
      ...linkWarnings, // Include component link validation warnings
    ],
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
