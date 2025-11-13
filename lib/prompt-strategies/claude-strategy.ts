/**
 * Claude Prompt Strategy
 *
 * Claude (Anthropic) 모델에 최적화된 프롬프트 전략
 *
 * 특화 영역:
 * - 코드 품질 최우선 (codeQuality: 10/10)
 * - 단계별 추론 (<thinking> 태그)
 * - 구조화된 출력 (XML, JSON)
 * - 긴 컨텍스트 활용 (200K tokens)
 * - 명확한 역할 정의
 *
 * Best Practices (2025):
 * - 긴 컨텍스트 활용: 전체 프로젝트 구조 제공
 * - 단계별 추론 요청: <thinking> 태그 활용
 * - 명확한 역할 정의: "You are a senior software engineer..."
 * - 구조화된 출력 요청: XML, JSON 형식
 * - 예시 코드 제공: Few-shot learning
 */

import { BasePromptStrategy } from "./base-strategy"
import type { AIModelId, PromptGenerationOptions } from "@/types/ai-models"
import type { Component } from "@/types/schema"

/**
 * Claude Prompt Strategy
 *
 * Claude Sonnet 4, 4.5, Opus 4, Haiku 3.5 등에 최적화
 */
export class ClaudeStrategy extends BasePromptStrategy {
  constructor(modelId: AIModelId = "claude-sonnet-4.5") {
    super(modelId)
  }

  /**
   * Claude 최적화 시스템 프롬프트
   *
   * 특징:
   * - 명확한 역할 정의 ("You are a senior React developer")
   * - 단계별 추론 요청
   * - 상세한 아키텍처 설명
   * - 품질 기준 명시
   */
  generateSystemPrompt(framework: string, cssSolution: string): string {
    return `You are a senior ${framework === "react" ? "React" : framework} developer with expertise in modern web development, responsive design, and best practices.

**Your Task:**
Generate a production-quality, responsive layout component based on the provided Laylder Schema specifications.

**Schema Architecture (Component Independence):**

The Laylder Schema follows a **Component-First** approach where each component is independently defined with its own:
- **Positioning Strategy**: How the component is positioned (fixed, sticky, static, absolute, relative)
- **Layout System**: Internal layout structure (flexbox, CSS grid, container, or none)
- **Styling**: Visual properties (width, height, background, border, shadow, custom classes)
- **Responsive Behavior**: Breakpoint-specific overrides (mobile, tablet, desktop)

**Core Principles:**
1. **Component Independence**: Each component operates independently with its own positioning and layout
2. **Flexbox First**: Use Flexbox for page structure, CSS Grid only for card/content layouts
3. **Semantic HTML First**: Follow HTML5 semantic principles (header, nav, main, aside, footer, section, article)
4. **Mobile First**: Implement responsive design with mobile-first approach (base styles for mobile, then md: for tablet, lg: for desktop)
5. **Breakpoint Inheritance**: Mobile → Tablet → Desktop cascade (unspecified breakpoints inherit from previous breakpoint)

**Quality Standards:**
- Production-ready code quality
- Type-safe TypeScript implementation
- Accessible semantic HTML
- Clean, maintainable code structure
- Proper use of ${cssSolution === "tailwind" ? "Tailwind CSS" : cssSolution} utility classes
- Responsive design following mobile-first principles

**Approach:**
1. Read and understand the complete Schema specification
2. Plan the component structure and relationships
3. Implement each component following its specifications exactly
4. Apply responsive behavior for each breakpoint
5. Ensure accessibility and semantic HTML compliance

Let's build a high-quality, production-ready layout.`
  }

  /**
   * Claude 최적화 컴포넌트 섹션
   *
   * 특징:
   * - 상세한 설명 (Claude는 긴 컨텍스트 처리 능력 탁월)
   * - 구조화된 형식
   * - 명확한 지침
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    const verbosity = options?.verbosity || "detailed" // Claude는 상세한 정보 선호

    let section = `## Component Specifications\n\n`
    section += `The layout consists of **${components.length} components**. Each component has specific positioning, layout, styling, and responsive requirements.\n\n`

    if (options?.chainOfThought) {
      section += `**Before implementing, consider:**\n`
      section += `- How components interact and relate to each other\n`
      section += `- The overall page flow and hierarchy\n`
      section += `- Responsive behavior transitions between breakpoints\n\n`
    }

    section += `---\n\n`

    components.forEach((comp, index) => {
      section += this.formatComponent(comp, index, verbosity, options)
      section += `---\n\n`
    })

    return section
  }

  /**
   * Claude 최적화 구현 지침
   *
   * 특징:
   * - 단계별 구현 가이드
   * - 품질 체크리스트
   * - 베스트 프랙티스 강조
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    let section = `## Implementation Instructions\n\n`

    if (options?.chainOfThought) {
      section += `**Step-by-Step Approach:**\n\n`
      section += `1. **Analyze the Schema**\n`
      section += `   - Review all component specifications\n`
      section += `   - Identify component relationships and hierarchy\n`
      section += `   - Plan the overall structure\n\n`
      section += `2. **Create Component Structure**\n`
      section += `   - Define TypeScript interfaces for props\n`
      section += `   - Create component files with proper naming\n`
      section += `   - Set up the component hierarchy\n\n`
      section += `3. **Implement Positioning & Layout**\n`
      section += `   - Apply positioning classes (fixed, sticky, static, etc.)\n`
      section += `   - Implement layout systems (flex, grid, container)\n`
      section += `   - Ensure proper nesting and structure\n\n`
      section += `4. **Apply Styling**\n`
      section += `   - Add visual styles (background, border, shadow)\n`
      section += `   - Implement width/height specifications\n`
      section += `   - Add custom className if specified\n\n`
      section += `5. **Implement Responsive Behavior**\n`
      section += `   - Start with mobile base styles\n`
      section += `   - Add tablet overrides (md: prefix)\n`
      section += `   - Add desktop overrides (lg: prefix)\n`
      section += `   - Test breakpoint transitions\n\n`
      section += `6. **Quality Assurance**\n`
      section += `   - Verify semantic HTML tags\n`
      section += `   - Check TypeScript type safety\n`
      section += `   - Ensure accessibility (ARIA labels, keyboard navigation)\n`
      section += `   - Validate responsive behavior\n\n`
    }

    section += `### Positioning Guidelines\n\n`
    section += `- **static**: Default flow (no position class needed)\n`
    section += `- **fixed**: Use Tailwind \`fixed\` with position values (e.g., \`fixed top-0 left-0 right-0 z-50\`)\n`
    section += `- **sticky**: Use Tailwind \`sticky\` with position values (e.g., \`sticky top-0 z-40\`)\n`
    section += `- **absolute**: Use Tailwind \`absolute\` with position values\n`
    section += `- **relative**: Use Tailwind \`relative\`\n\n`

    section += `### Layout Guidelines\n\n`
    section += `- **flex**: Use Tailwind flex utilities (\`flex\`, \`flex-col\`, \`justify-center\`, \`items-center\`, \`gap-4\`, etc.)\n`
    section += `- **grid**: Use Tailwind grid utilities (\`grid\`, \`grid-cols-3\`, \`gap-4\`, etc.)\n`
    section += `- **container**: Wrap content in a container div with max-width and centering\n`
    section += `- **none**: No specific layout - let content flow naturally\n\n`

    section += `### Responsive Design Guidelines\n\n`
    section += `- **Mobile First**: Base styles apply to mobile, use \`md:\` and \`lg:\` prefixes for larger breakpoints\n`
    section += `- **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)\n`
    section += `- **Override Strategy**: Use responsive prefixes to override inherited styles\n`
    section += `  - Example: \`hidden md:block\` = hidden on mobile, visible on tablet+\n`
    section += `  - Example: \`w-full md:w-1/2 lg:w-1/3\` = full width on mobile, half on tablet, third on desktop\n\n`

    section += `### Code Quality Checklist\n\n`
    section += `- [ ] All components use specified semantic tags\n`
    section += `- [ ] TypeScript types are properly defined\n`
    section += `- [ ] Positioning and layout follow specifications exactly\n`
    section += `- [ ] Responsive behavior is implemented for all breakpoints\n`
    section += `- [ ] Code is clean, readable, and well-commented\n`
    section += `- [ ] Accessibility is considered (ARIA labels, keyboard navigation)\n`
    section += `- [ ] Placeholder content is provided for demonstration\n\n`

    return section
  }

  /**
   * Claude 최적화 프롬프트 최적화
   *
   * 특징:
   * - XML 태그 활용 (Claude는 XML 구조 선호)
   * - 단계별 추론 요청 삽입
   * - 명확한 섹션 구분
   */
  optimizePrompt(prompt: string, options?: PromptGenerationOptions): string {
    let optimizedPrompt = prompt

    // Chain-of-Thought 추론 요청 (Claude에 효과적)
    if (options?.chainOfThought) {
      const thinkingPrompt =
        `\n\n**Before you begin implementation, please think through:**\n` +
        `<thinking>\n` +
        `- Analyze the schema structure and component relationships\n` +
        `- Plan the implementation approach step by step\n` +
        `- Consider potential challenges and how to address them\n` +
        `- Identify any ambiguities that need clarification\n` +
        `</thinking>\n\n`

      // System prompt 직후에 삽입
      optimizedPrompt = optimizedPrompt.replace(
        /---\n/,
        `${thinkingPrompt}---\n`
      )
    }

    // Temperature 힌트 추가 (사실 기반 작업은 낮은 temperature)
    if (options?.temperature === 0 || options?.temperature === undefined) {
      optimizedPrompt =
        `**Note:** This is a specification-based task. Follow the schema exactly without creative deviations.\n\n` +
        optimizedPrompt
    }

    return optimizedPrompt
  }
}

/**
 * Factory functions for Claude models
 */
export function createClaudeSonnet45Strategy(): ClaudeStrategy {
  return new ClaudeStrategy("claude-sonnet-4.5")
}

export function createClaudeSonnet4Strategy(): ClaudeStrategy {
  return new ClaudeStrategy("claude-sonnet-4")
}

export function createClaudeOpus4Strategy(): ClaudeStrategy {
  return new ClaudeStrategy("claude-opus-4")
}

export function createClaudeHaiku35Strategy(): ClaudeStrategy {
  return new ClaudeStrategy("claude-haiku-3.5")
}
