/**
 * GPT Prompt Strategy
 *
 * GPT (OpenAI) 모델에 최적화된 프롬프트 전략
 *
 * 특화 영역:
 * - 창의적 솔루션 (creativity: 10/10)
 * - 복잡한 아키텍처 설계
 * - Few-shot learning (2-3개 예시)
 * - Chain-of-Thought prompting
 * - 높은 temperature for creative tasks
 *
 * Best Practices (2025):
 * - 창의적 작업에 높은 temperature (0.7-0.9)
 * - Few-shot learning: 2-3개 예시 제공
 * - Chain-of-Thought: 단계별 추론 요청
 * - Hallucination 방지: 검증 요청, 구체적 지침
 * - JSON mode: 구조화된 출력 요청
 */

import { BasePromptStrategy } from "./base-strategy"
import type { AIModelId, PromptGenerationOptions } from "@/types/ai-models"
import type { Component } from "@/types/schema"

/**
 * GPT Prompt Strategy
 *
 * GPT-4, GPT-4.1, GPT-4 Turbo 등에 최적화
 */
export class GPTStrategy extends BasePromptStrategy {
  constructor(modelId: AIModelId = "gpt-4.1") {
    super(modelId)
  }

  /**
   * GPT 최적화 시스템 프롬프트
   *
   * 특징:
   * - 창의적 접근 허용
   * - 명확한 출력 형식 지정
   * - Hallucination 방지 지침
   */
  generateSystemPrompt(framework: string, cssSolution: string): string {
    return `You are an expert ${framework === "react" ? "React" : framework} developer specializing in modern web development and responsive design.

**Task:**
Create a responsive, production-ready layout component based on the Laylder Schema specifications provided below.

**Schema Architecture:**
The Laylder Schema uses a **Component Independence** approach:
- Each component has its own positioning strategy (fixed, sticky, static, absolute, relative)
- Each component defines its layout system (flexbox, grid, container, or none)
- Styling and responsive behavior are component-specific
- Mobile-first responsive design with breakpoint inheritance (Mobile → Tablet → Desktop)

**Key Principles:**
1. **Component Independence**: Each component is self-contained with its own positioning, layout, and styling
2. **Flexbox for Structure**: Use Flexbox for overall page layout, Grid for content areas (cards, galleries)
3. **Semantic HTML**: Use appropriate HTML5 semantic tags (header, nav, main, aside, footer, section, article)
4. **Mobile First**: Base styles for mobile, then tablet (md:) and desktop (lg:) overrides
5. **Type Safety**: Use TypeScript with proper type definitions

**Technology Stack:**
- ${framework === "react" ? "React" : framework} with functional components and hooks
- TypeScript for type safety
- ${cssSolution === "tailwind" ? "Tailwind CSS" : cssSolution} for styling
- Mobile-first responsive design

**Output Format:**
Provide clean, well-structured code with:
- Proper TypeScript types
- Semantic HTML tags as specified
- Tailwind CSS utility classes for styling
- Responsive behavior using Tailwind breakpoints (md:, lg:)
- Comments explaining complex logic

**Important:**
- Follow the schema specifications EXACTLY
- Do not add features not specified in the schema
- Use only the semantic tags specified for each component
- Implement positioning and layout as specified
- Test your code mentally before outputting

Let's create a high-quality, production-ready component.`
  }

  /**
   * GPT 최적화 컴포넌트 섹션
   *
   * 특징:
   * - Few-shot learning: 예시 제공
   * - 구조화된 정보
   * - 명확한 예시
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    const includeExamples = options?.includeExamples !== false // GPT는 예시 선호

    let section = `## Component Specifications\n\n`
    section += `You need to implement ${components.length} components. Each component has specific requirements:\n\n`

    // Few-shot learning: 첫 번째 컴포넌트에 대한 예시 (GPT에 효과적)
    if (includeExamples && components.length > 0) {
      const firstComp = components[0]
      section += `**Example Implementation Pattern:**\n\n`
      section += `For a component like "${firstComp.name}" with semantic tag <${firstComp.semanticTag}> and ${firstComp.positioning.type} positioning:\n\n`
      section += `\`\`\`tsx\n`
      section += `// ${firstComp.name}.tsx\n`
      section += `interface ${firstComp.name}Props {\n`
      section += `  // Add props as needed\n`
      section += `}\n\n`
      section += `export function ${firstComp.name}({ }: ${firstComp.name}Props) {\n`
      section += `  return (\n`
      section += `    <${firstComp.semanticTag} className="${this.getExampleClasses(firstComp)}">\n`
      section += `      {/* Content here */}\n`
      section += `    </${firstComp.semanticTag}>\n`
      section += `  )\n`
      section += `}\n`
      section += `\`\`\`\n\n`
      section += `Follow this pattern for all components.\n\n`
      section += `---\n\n`
    }

    // 컴포넌트 상세 스펙
    components.forEach((comp, index) => {
      section += this.formatComponent(comp, index, "normal", options)
    })

    return section
  }

  /**
   * 예시 Tailwind 클래스 생성 (Few-shot learning용)
   */
  private getExampleClasses(comp: Component): string {
    const classes: string[] = []

    // Positioning
    if (comp.positioning.type === "fixed") {
      classes.push("fixed", "top-0", "left-0", "right-0", "z-50")
    } else if (comp.positioning.type === "sticky") {
      classes.push("sticky", "top-0", "z-40")
    }

    // Layout
    if (comp.layout.type === "flex") {
      classes.push("flex")
      if (comp.layout.flex?.direction === "column") classes.push("flex-col")
      if (comp.layout.flex?.justify) classes.push(`justify-${comp.layout.flex.justify}`)
      if (comp.layout.flex?.items) classes.push(`items-${comp.layout.flex.items}`)
    } else if (comp.layout.type === "grid") {
      classes.push("grid")
      if (comp.layout.grid?.cols) classes.push(`grid-cols-${comp.layout.grid.cols}`)
    }

    // Styling
    if (comp.styling?.width) classes.push(`w-${comp.styling.width}`)
    if (comp.styling?.height) classes.push(`h-${comp.styling.height}`)
    if (comp.styling?.background) classes.push(comp.styling.background)
    if (comp.styling?.className) classes.push(comp.styling.className)

    return classes.join(" ")
  }

  /**
   * GPT 최적화 구현 지침
   *
   * 특징:
   * - Chain-of-Thought 접근
   * - 단계별 검증
   * - Hallucination 방지 지침
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    let section = `## Implementation Guide\n\n`

    // Chain-of-Thought (GPT에 효과적)
    if (options?.chainOfThought !== false) {
      section += `**Think Step-by-Step:**\n\n`
      section += `1. Read and understand all component specifications\n`
      section += `2. Plan the component hierarchy and relationships\n`
      section += `3. Implement each component with its positioning, layout, and styling\n`
      section += `4. Add responsive behavior for mobile, tablet, and desktop\n`
      section += `5. Verify all specifications are met before finalizing\n\n`
    }

    section += `### Positioning Implementation\n\n`
    section += `| Type | Tailwind Classes | Example |\n`
    section += `|------|------------------|----------|\n`
    section += `| static | (none) | Default flow |\n`
    section += `| fixed | \`fixed top-0 left-0 right-0 z-50\` | Fixed header |\n`
    section += `| sticky | \`sticky top-0 z-40\` | Sticky nav |\n`
    section += `| absolute | \`absolute top-4 right-4\` | Floating button |\n`
    section += `| relative | \`relative\` | Positioned container |\n\n`

    section += `### Layout Implementation\n\n`
    section += `**Flexbox:**\n`
    section += `- Direction: \`flex-row\`, \`flex-col\`, \`flex-row-reverse\`, \`flex-col-reverse\`\n`
    section += `- Justify: \`justify-start\`, \`justify-center\`, \`justify-between\`, \`justify-around\`, \`justify-evenly\`\n`
    section += `- Align: \`items-start\`, \`items-center\`, \`items-end\`, \`items-stretch\`\n`
    section += `- Gap: \`gap-2\`, \`gap-4\`, \`gap-8\` (or specific values)\n\n`

    section += `**Grid:**\n`
    section += `- Columns: \`grid-cols-1\`, \`grid-cols-2\`, \`grid-cols-3\`, etc.\n`
    section += `- Rows: \`grid-rows-1\`, \`grid-rows-2\`, etc.\n`
    section += `- Gap: \`gap-4\`, \`gap-6\`, etc.\n\n`

    section += `### Responsive Design\n\n`
    section += `**Breakpoints:**\n`
    section += `- Mobile (base): No prefix\n`
    section += `- Tablet: \`md:\` prefix (≥768px)\n`
    section += `- Desktop: \`lg:\` prefix (≥1024px)\n\n`

    section += `**Examples:**\n`
    section += `- \`hidden md:block\` → Hidden on mobile, visible on tablet+\n`
    section += `- \`w-full md:w-1/2 lg:w-1/3\` → Full width on mobile, half on tablet, third on desktop\n`
    section += `- \`flex-col md:flex-row\` → Column on mobile, row on tablet+\n\n`

    // Hallucination 방지
    section += `**Verification Checklist:**\n`
    section += `Before finalizing your code, verify:\n`
    section += `- ✓ All components use the exact semantic tags specified\n`
    section += `- ✓ Positioning types match the specifications\n`
    section += `- ✓ Layout configurations are implemented correctly\n`
    section += `- ✓ Responsive behavior follows the specifications\n`
    section += `- ✓ No extra features or components are added\n`
    section += `- ✓ TypeScript types are properly defined\n`
    section += `- ✓ Code compiles without errors\n\n`

    return section
  }

  /**
   * GPT 최적화 프롬프트 최적화
   *
   * 특징:
   * - Hallucination 방지 지침 추가
   * - JSON mode 힌트 (구조화된 출력)
   * - 검증 요청 강조
   */
  optimizePrompt(prompt: string, options?: PromptGenerationOptions): string {
    let optimizedPrompt = prompt

    // Hallucination 방지 (GPT 약점 보완)
    const antiHallucinationPrompt =
      `\n\n**IMPORTANT - Anti-Hallucination Guidelines:**\n` +
      `- Follow the schema specifications EXACTLY\n` +
      `- Do NOT add features, components, or behaviors not specified in the schema\n` +
      `- Do NOT assume or infer requirements beyond what is explicitly stated\n` +
      `- If something is unclear, implement the most straightforward interpretation\n` +
      `- Verify each component against its specification before finalizing\n\n`

    // Instructions 섹션 직전에 삽입
    optimizedPrompt = optimizedPrompt.replace(
      /## Implementation Guide/,
      antiHallucinationPrompt + "## Implementation Guide"
    )

    // Temperature 힌트
    if (options?.temperature && options.temperature > 0.5) {
      // 창의적 작업이지만 스펙은 지켜야 함
      optimizedPrompt =
        `**Note:** While you can be creative in implementation details, strictly follow the schema specifications.\n\n` +
        optimizedPrompt
    }

    return optimizedPrompt
  }
}

/**
 * Factory functions for GPT models
 */
export function createGPT41Strategy(): GPTStrategy {
  return new GPTStrategy("gpt-4.1")
}

export function createGPT4TurboStrategy(): GPTStrategy {
  return new GPTStrategy("gpt-4-turbo")
}

export function createGPT4Strategy(): GPTStrategy {
  return new GPTStrategy("gpt-4")
}
