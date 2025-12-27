/**
 * Grok Prompt Strategy
 *
 * Grok (xAI) 모델에 최적화된 프롬프트 전략
 *
 * 지원 모델 (2025년 12월):
 * - Grok 2, Grok 3
 * - Grok 4, Grok 4.1 (2025 신규)
 *
 * 특화 영역:
 * - 추론 능력 (reasoning: 9-10/10)
 * - 실시간 데이터 접근
 * - 컨텍스트 이해
 * - 명확하고 직접적인 지시
 *
 * 2025년 12월 업데이트:
 * - Grok 4.1: 코딩 벤치마크 9.8/10, 강력한 추론
 * - Grok 4: 실시간 데이터와 추론 능력 향상
 *
 * Best Practices (2025):
 * - 명확한 목표 설정
 * - 단계별 추론 요청
 * - 실시간 정보 활용 가능
 * - 간결하고 직접적인 프롬프트
 */

import { BasePromptStrategy } from "./base-strategy"
import type { AIModelId, PromptGenerationOptions } from "@/types/ai-models"
import type { Component } from "@/types/schema"

/**
 * Grok Prompt Strategy
 *
 * Grok 2, Grok 3 등에 최적화
 */
export class GrokStrategy extends BasePromptStrategy {
  constructor(modelId: AIModelId = "grok-3") {
    super(modelId)
  }

  /**
   * Grok 최적화 시스템 프롬프트
   *
   * 특징:
   * - 명확하고 직접적인 목표
   * - 추론 기반 접근
   * - 실시간 정보 활용 가능
   */
  generateSystemPrompt(framework: string, cssSolution: string): string {
    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toISOString().split("T")[0]

    return `You are an expert ${framework} developer. Today is ${currentDate}.

**Objective:**
Build a responsive layout component from the Visual Layout Builder Schema specifications provided.

**Schema Overview:**
The Visual Layout Builder Schema follows a Component Independence architecture:
- Each component defines its own positioning (fixed, sticky, static, absolute, relative)
- Each component defines its internal layout (flexbox, grid, container, or none)
- Styling and responsive behavior are component-specific
- Mobile-first responsive design with breakpoint inheritance

**Technical Stack:**
- Framework: ${framework} (${currentYear} standards)
- Styling: ${cssSolution === "tailwind" ? "Tailwind CSS" : cssSolution}
- Language: TypeScript with strict types
- Approach: Component Independence principle

**Key Requirements:**
1. Use semantic HTML5 tags as specified
2. Implement positioning exactly as specified
3. Apply layout systems (flex/grid/container) correctly
4. Follow mobile-first responsive design
5. Write clean, production-ready TypeScript code

**Reasoning Approach:**
- Analyze the schema structure first
- Understand component relationships
- Plan the implementation strategy
- Execute with precision

Let's build a high-quality responsive layout.`
  }

  /**
   * Grok 최적화 컴포넌트 섹션
   *
   * 특징:
   * - 구조화된 정보 제공
   * - 명확한 우선순위
   * - 추론 유도 질문
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    const verbosity = options?.verbosity || "normal"

    let section = `## Component Specifications\n\n`
    section += `Implement ${components.length} components with the following specifications:\n\n`

    // 추론 유도 (Grok의 강점 활용)
    if (options?.chainOfThought) {
      section += `**Before implementing, consider:**\n`
      section += `- What is the hierarchy of these components?\n`
      section += `- How do they interact with each other?\n`
      section += `- What is the optimal implementation order?\n\n`
    }

    // 우선순위별 그룹화 (Grok는 구조화된 정보 선호)
    const priorityComponents = this.groupComponentsByPriority(components)

    for (const [priority, comps] of Object.entries(priorityComponents)) {
      if (comps.length === 0) continue

      section += `### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Components\n\n`

      comps.forEach((comp, index) => {
        section += this.formatComponent(comp, components.indexOf(comp), verbosity, options)
        section += `\n`
      })
    }

    return section
  }

  /**
   * 컴포넌트를 우선순위별로 그룹화
   * (positioning에 따라 우선순위 결정)
   */
  private groupComponentsByPriority(components: Component[]): Record<string, Component[]> {
    const priority = {
      high: [] as Component[],
      medium: [] as Component[],
      low: [] as Component[],
    }

    components.forEach((comp) => {
      if (comp.positioning.type === "fixed" || comp.positioning.type === "sticky") {
        priority.high.push(comp)
      } else if (comp.semanticTag === "main" || comp.semanticTag === "nav") {
        priority.medium.push(comp)
      } else {
        priority.low.push(comp)
      }
    })

    return priority
  }

  /**
   * Grok 최적화 구현 지침
   *
   * 특징:
   * - 명확한 단계별 지침
   * - 추론 기반 접근
   * - 실용적인 예시
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    let section = `## Implementation Guide\n\n`

    // 추론 기반 접근 (Grok의 강점)
    if (options?.chainOfThought !== false) {
      section += `**Reasoning-Based Approach:**\n\n`
      section += `1. **Analyze:** Review all component specifications and identify patterns\n`
      section += `2. **Plan:** Determine optimal implementation order (structural components first)\n`
      section += `3. **Implement:** Build components following the specifications exactly\n`
      section += `4. **Verify:** Check that all requirements are met\n\n`
    }

    section += `### Positioning Strategy\n\n`
    section += `**Fixed/Sticky Components (High Priority):**\n`
    section += `- Implement these first as they affect layout flow\n`
    section += `- Fixed: \`fixed top-0 left-0 right-0 z-50\` (viewport-locked)\n`
    section += `- Sticky: \`sticky top-0 z-40\` (scroll-based)\n\n`

    section += `**Static/Relative Components (Medium Priority):**\n`
    section += `- Implement after structural elements\n`
    section += `- Static: default flow (no position class)\n`
    section += `- Relative: \`relative\` (positioning context)\n\n`

    section += `### Layout Implementation\n\n`
    section += `**Flexbox (Primary):**\n`
    section += `- Use for page structure and 1D layouts\n`
    section += `- Example: \`flex flex-col justify-center items-center gap-4\`\n\n`

    section += `**Grid (Secondary):**\n`
    section += `- Use for card layouts and 2D structures\n`
    section += `- Example: \`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\`\n\n`

    section += `### Responsive Design\n\n`
    section += `**Mobile-First Principle:**\n`
    section += `- Base styles apply to mobile\n`
    section += `- Use \`md:\` prefix for tablet (≥768px)\n`
    section += `- Use \`lg:\` prefix for desktop (≥1024px)\n\n`

    section += `**Common Patterns:**\n`
    section += `- Hide/Show: \`hidden md:block\` or \`block md:hidden\`\n`
    section += `- Width: \`w-full md:w-1/2 lg:w-1/3\`\n`
    section += `- Direction: \`flex-col md:flex-row\`\n\n`

    section += `### Quality Checklist\n\n`
    section += `Before finalizing, verify:\n`
    section += `- ✓ All semantic tags match specifications\n`
    section += `- ✓ Positioning types are correctly implemented\n`
    section += `- ✓ Layout systems follow specifications\n`
    section += `- ✓ Responsive behavior works across breakpoints\n`
    section += `- ✓ TypeScript types are properly defined\n`
    section += `- ✓ Code is clean and production-ready\n\n`

    return section
  }

  /**
   * Grok 최적화 프롬프트 최적화
   *
   * 특징:
   * - 명확한 구조
   * - 추론 강화
   * - 실시간 컨텍스트 활용
   */
  optimizePrompt(prompt: string, options?: PromptGenerationOptions): string {
    let optimizedPrompt = prompt

    // 추론 강화 (Grok의 강점 활용)
    if (options?.chainOfThought) {
      const reasoningPrompt =
        `\n\n**Reasoning Instructions:**\n` +
        `Before writing code, briefly reason through:\n` +
        `1. What is the overall structure? (hierarchy, relationships)\n` +
        `2. What is the best implementation order? (dependencies)\n` +
        `3. What potential challenges exist? (edge cases, complexity)\n` +
        `4. How can we ensure quality? (verification points)\n\n`

      optimizedPrompt = optimizedPrompt.replace(/## Component/, reasoningPrompt + "## Component")
    }

    // 현재 날짜 컨텍스트 강조 (Grok의 실시간 데이터 활용)
    const currentYear = new Date().getFullYear()
    if (!optimizedPrompt.includes(String(currentYear))) {
      optimizedPrompt =
        `**Context:** Use ${currentYear} web development best practices and latest framework patterns.\n\n` +
        optimizedPrompt
    }

    return optimizedPrompt
  }
}

/**
 * Factory functions for Grok models
 */
export function createGrok3Strategy(): GrokStrategy {
  return new GrokStrategy("grok-3")
}

export function createGrok2Strategy(): GrokStrategy {
  return new GrokStrategy("grok-2")
}

// 2025년 12월 신규 모델
export function createGrok4Strategy(): GrokStrategy {
  return new GrokStrategy("grok-4")
}

export function createGrok41Strategy(): GrokStrategy {
  return new GrokStrategy("grok-4.1")
}
