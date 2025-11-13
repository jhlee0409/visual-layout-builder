/**
 * DeepSeek Prompt Strategy
 *
 * DeepSeek 모델에 최적화된 프롬프트 전략
 *
 * 특화 영역:
 * - 비용 효율 최강 (cost: very-low, 90% 저렴)
 * - 알고리즘 강함 (algorithmSolving: 9/10, LeetCode Hard 87%)
 * - 다국어 코드 지원 (338개 언어)
 * - 간결한 프롬프트 선호
 * - 명확한 타입 시스템
 *
 * Best Practices (2025):
 * - 알고리즘 중심 작업에 활용
 * - 다국어 코드 생성 시 언어 명시
 * - 비용 최적화 (간결한 프롬프트)
 * - 명확한 타입 시스템 지정
 * - 구조화된 입력 (JSON, YAML)
 *
 * 제한사항:
 * - 프레임워크 특화 패턴 부족 (Next.js 62%)
 * - 최신 프레임워크 지식 제한적
 */

import { BasePromptStrategy } from "./base-strategy"
import type { AIModelId, PromptGenerationOptions } from "@/types/ai-models"
import type { Component } from "@/types/schema"

/**
 * DeepSeek Prompt Strategy
 *
 * DeepSeek R1, V3, Coder V2 등에 최적화
 */
export class DeepSeekStrategy extends BasePromptStrategy {
  constructor(modelId: AIModelId = "deepseek-r1") {
    super(modelId)
  }

  /**
   * DeepSeek 최적화 시스템 프롬프트
   *
   * 특징:
   * - 간결하고 명확한 지침
   * - 구조화된 정보
   * - 타입 시스템 강조
   */
  generateSystemPrompt(framework: string, cssSolution: string): string {
    return `You are a ${framework} developer. Create a responsive layout component from the Laylder Schema.

**Task:**
Implement a responsive layout with the specified components, following the schema exactly.

**Schema Structure:**
- **Components**: Each has positioning (fixed/sticky/static/absolute/relative), layout (flex/grid/container/none), and styling
- **Responsive**: Mobile-first with breakpoints (mobile → tablet → desktop)
- **Framework**: ${framework} with TypeScript
- **Styling**: ${cssSolution === "tailwind" ? "Tailwind CSS" : cssSolution}

**Requirements:**
1. Use semantic HTML5 tags as specified
2. Implement positioning and layout per component
3. Apply responsive behavior (mobile → md: → lg:)
4. Use TypeScript with strict types
5. Follow ${cssSolution === "tailwind" ? "Tailwind CSS" : cssSolution} conventions

**Output:**
Clean, type-safe code with specified components and layouts.`
  }

  /**
   * DeepSeek 최적화 컴포넌트 섹션
   *
   * 특징:
   * - 간결한 형식 (비용 절감)
   * - 핵심 정보만 포함
   * - 구조화된 데이터
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    // DeepSeek는 간결한 프롬프트 선호 (비용 최적화)
    const verbosity = options?.verbosity || "minimal"

    let section = `## Components (${components.length})\n\n`

    if (verbosity === "minimal") {
      // 초간결 형식 (비용 민감 시)
      section += `| # | Name | Tag | Positioning | Layout |\n`
      section += `|---|------|-----|-------------|--------|\n`
      components.forEach((comp, index) => {
        section += `| ${index + 1} | ${comp.name} | ${comp.semanticTag} | ${comp.positioning.type} | ${comp.layout.type} |\n`
      })
      section += `\n`
    } else {
      // 일반 형식
      components.forEach((comp, index) => {
        section += `### ${index + 1}. ${comp.name}\n`
        section += `- Tag: \`<${comp.semanticTag}>\`\n`
        section += `- Positioning: ${comp.positioning.type}\n`
        section += `- Layout: ${comp.layout.type}\n`

        // Positioning details
        if (comp.positioning.position) {
          const pos = comp.positioning.position
          if (pos.top !== undefined) section += `  - top: ${pos.top}\n`
          if (pos.right !== undefined) section += `  - right: ${pos.right}\n`
          if (pos.bottom !== undefined) section += `  - bottom: ${pos.bottom}\n`
          if (pos.left !== undefined) section += `  - left: ${pos.left}\n`
          if (pos.zIndex !== undefined) section += `  - z-index: ${pos.zIndex}\n`
        }

        // Layout config
        if (comp.layout.type === "flex" && comp.layout.flex) {
          const { direction, justify, items, gap } = comp.layout.flex
          if (direction) section += `  - direction: ${direction}\n`
          if (justify) section += `  - justify: ${justify}\n`
          if (items) section += `  - items: ${items}\n`
          if (gap) section += `  - gap: ${gap}\n`
        } else if (comp.layout.type === "grid" && comp.layout.grid) {
          const { cols, rows, gap } = comp.layout.grid
          if (cols) section += `  - cols: ${cols}\n`
          if (rows) section += `  - rows: ${rows}\n`
          if (gap) section += `  - gap: ${gap}\n`
        }

        // Responsive (간략하게)
        if (comp.responsive) {
          section += `- Responsive:\n`
          if (comp.responsive.mobile?.hidden) section += `  - mobile: hidden\n`
          if (comp.responsive.tablet?.hidden !== undefined)
            section += `  - tablet: ${comp.responsive.tablet.hidden ? "hidden" : "visible"}\n`
          if (comp.responsive.desktop?.hidden !== undefined)
            section += `  - desktop: ${comp.responsive.desktop.hidden ? "hidden" : "visible"}\n`
        }

        section += `\n`
      })
    }

    return section
  }

  /**
   * DeepSeek 최적화 레이아웃 섹션
   *
   * 특징:
   * - 간결한 형식
   * - 핵심 정보만
   */
  generateLayoutSection(
    breakpoints: any[],
    layouts: any,
    options?: PromptGenerationOptions
  ): string {
    const verbosity = options?.verbosity || "minimal"

    let section = `## Layouts\n\n`

    if (verbosity === "minimal") {
      breakpoints.forEach((bp, index) => {
        const layout = layouts[bp.name as "mobile" | "tablet" | "desktop"]
        if (!layout) return
        section += `${index + 1}. ${bp.name} (≥${bp.minWidth}px): ${layout.structure}, ${layout.components.length} components\n`
      })
    } else {
      breakpoints.forEach((bp, index) => {
        const layout = layouts[bp.name as "mobile" | "tablet" | "desktop"]
        if (!layout) return

        section += `### ${index + 1}. ${bp.name.charAt(0).toUpperCase() + bp.name.slice(1)} (≥${bp.minWidth}px)\n`
        section += `- Structure: ${layout.structure}\n`
        section += `- Components: ${layout.components.join(", ")}\n\n`
      })
    }

    return section
  }

  /**
   * DeepSeek 최적화 구현 지침
   *
   * 특징:
   * - 간결한 지침
   * - 핵심 규칙만
   * - 예시 코드 (타입 시스템 강조)
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    const verbosity = options?.verbosity || "minimal"

    if (verbosity === "minimal") {
      return (
        `## Instructions\n\n` +
        `1. Use semantic tags as specified\n` +
        `2. Apply positioning (fixed/sticky/static/absolute/relative)\n` +
        `3. Implement layout (flex/grid/container)\n` +
        `4. Add responsive classes (md:, lg:)\n` +
        `5. Use TypeScript with strict types\n`
      )
    }

    return (
      `## Implementation Guide\n\n` +
      `### Positioning\n` +
      `- fixed: \`fixed top-0 left-0 right-0 z-50\`\n` +
      `- sticky: \`sticky top-0 z-40\`\n` +
      `- static: default flow\n` +
      `- absolute: \`absolute top-4 right-4\`\n` +
      `- relative: \`relative\`\n\n` +
      `### Layout\n` +
      `- flex: \`flex flex-col justify-center items-center gap-4\`\n` +
      `- grid: \`grid grid-cols-3 gap-4\`\n` +
      `- container: \`container mx-auto px-4\`\n\n` +
      `### Responsive\n` +
      `- Mobile: base styles\n` +
      `- Tablet: \`md:\` prefix (≥768px)\n` +
      `- Desktop: \`lg:\` prefix (≥1024px)\n\n` +
      `### TypeScript\n` +
      `\`\`\`tsx\n` +
      `interface Props {\n` +
      `  // Define props\n` +
      `}\n\n` +
      `export function Component({ }: Props) {\n` +
      `  return <div>...</div>\n` +
      `}\n` +
      `\`\`\`\n`
    )
  }

  /**
   * DeepSeek 최적화 프롬프트 최적화
   *
   * 특징:
   * - 토큰 절약 (비용 최적화)
   * - 중복 제거
   * - 간결한 표현
   */
  optimizePrompt(prompt: string, options?: PromptGenerationOptions): string {
    let optimizedPrompt = prompt

    // 비용 민감 모드: 불필요한 공백/줄바꿈 제거
    if (options?.costSensitive) {
      // 연속된 빈 줄 제거 (2개 이상 → 1개)
      optimizedPrompt = optimizedPrompt.replace(/\n{3,}/g, "\n\n")

      // 불필요한 장식 제거
      optimizedPrompt = optimizedPrompt.replace(/---+/g, "---")

      // 중복 헤더 간소화
      optimizedPrompt = optimizedPrompt.replace(/## Full Schema.*?```json/s, "## Schema\n```json")
    }

    // 타입 시스템 강조 (DeepSeek 강점 활용)
    if (!optimizedPrompt.includes("TypeScript strict mode")) {
      const typeHint = `\n**TypeScript:** Use strict mode with explicit types.\n`
      optimizedPrompt = optimizedPrompt.replace(/## Instructions/, typeHint + "## Instructions")
    }

    return optimizedPrompt
  }
}

/**
 * Factory functions for DeepSeek models
 */
export function createDeepSeekR1Strategy(): DeepSeekStrategy {
  return new DeepSeekStrategy("deepseek-r1")
}

export function createDeepSeekV3Strategy(): DeepSeekStrategy {
  return new DeepSeekStrategy("deepseek-v3")
}

export function createDeepSeekCoderV2Strategy(): DeepSeekStrategy {
  return new DeepSeekStrategy("deepseek-coder-v2")
}
