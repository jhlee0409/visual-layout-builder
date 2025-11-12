import type { LaydlerSchema } from "@/types/schema"
import { getTemplate } from "./prompt-templates"
import { safeValidateSchema, validateComponentReferences } from "./validation"

/**
 * Prompt Generation Result
 * PRD 5.2: JSON → Prompt Conversion
 */
export interface GenerationResult {
  success: boolean
  prompt?: string
  schema?: LaydlerSchema
  errors?: string[]
}

/**
 * Generate AI prompt from Laylder schema
 * PRD 5.2: Core conversion function
 *
 * @param schema - The Laylder schema to convert
 * @param framework - Target framework (e.g., "react")
 * @param cssSolution - Target CSS solution (e.g., "tailwind")
 * @returns Generation result with prompt and schema
 */
export function generatePrompt(
  schema: LaydlerSchema,
  framework: string,
  cssSolution: string
): GenerationResult {
  // Validate schema
  const zodResult = safeValidateSchema(schema)
  if (!zodResult.success) {
    const errorMessages = zodResult.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    )
    return {
      success: false,
      errors: ["Schema validation failed", ...errorMessages],
    }
  }

  // Validate component references
  const refErrors = validateComponentReferences(schema)
  if (refErrors.length > 0) {
    return {
      success: false,
      errors: ["Component reference validation failed", ...refErrors],
    }
  }

  // Get template
  const template = getTemplate(framework, cssSolution)
  if (!template) {
    return {
      success: false,
      errors: [
        `No template found for framework: ${framework}, CSS: ${cssSolution}`,
      ],
    }
  }

  // Generate prompt sections
  const sections: string[] = []

  // 1. System prompt
  sections.push(template.systemPrompt)
  sections.push("\n---\n")

  // 2. Components section
  sections.push(template.componentSection(schema.components))
  sections.push("---\n")

  // 3. Layouts section
  sections.push(template.layoutSection(schema.breakpoints, schema.layouts))
  sections.push("---\n")

  // 4. Instructions section
  sections.push(template.instructionsSection())
  sections.push("---\n")

  // 5. Schema JSON for reference
  sections.push("## Full Schema (JSON)\n\n")
  sections.push(
    "For reference, here is the complete schema in JSON format:\n\n"
  )
  sections.push("```json\n")
  sections.push(JSON.stringify(schema, null, 2))
  sections.push("\n```\n")

  const prompt = sections.join("\n")

  return {
    success: true,
    prompt,
    schema,
  }
}

/**
 * Generate compact summary of the schema
 * Used in UI to show what will be generated
 */
export function generateSchemaSummary(schema: LaydlerSchema): string {
  const componentCount = schema.components.length
  const breakpointCount = schema.breakpoints.length
  const componentNames = schema.components.map((c) => c.name).join(", ")
  const breakpointNames = schema.breakpoints.map((b) => b.name).join(", ")

  return (
    `Schema Summary:\n` +
    `- Components (${componentCount}): ${componentNames}\n` +
    `- Breakpoints (${breakpointCount}): ${breakpointNames}\n` +
    `- Framework: React\n` +
    `- CSS Solution: Tailwind CSS`
  )
}

/**
 * Estimate token count for the generated prompt
 * Rough estimate: 1 token ≈ 4 characters
 */
export function estimateTokenCount(prompt: string): number {
  return Math.ceil(prompt.length / 4)
}

/**
 * Get recommended AI model based on prompt complexity
 */
export function getRecommendedModel(tokenCount: number): string {
  if (tokenCount < 1000) return "Claude 3.5 Haiku (fast, cost-effective)"
  if (tokenCount < 4000) return "Claude 3.5 Sonnet (balanced)"
  return "Claude 3.5 Opus (complex layouts)"
}
