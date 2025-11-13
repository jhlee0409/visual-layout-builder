/**
 * Gemini Prompt Strategy
 *
 * Gemini (Google) 모델에 최적화된 프롬프트 전략
 *
 * 특화 영역:
 * - 프레임워크 특화 (frameworkSpecialization: 10/10)
 * - Next.js, React 등 프레임워크 통합 (91% on Next.js)
 * - 대용량 컨텍스트 (2M tokens)
 * - 멀티모달 지원 (이미지, 다이어그램)
 * - 비용 효율 최고 (Claude 대비 1/20)
 * - WebDev Arena 1위
 *
 * Best Practices (2025):
 * - 프레임워크/라이브러리 명시적 지정
 * - 멀티모달 활용 (이미지, 다이어그램)
 * - 대용량 컨텍스트 활용 (전체 파일 세트)
 * - 최신 문법/패턴 요청 (2024-2025 기준)
 * - 구조화된 출력 (JSON, Markdown)
 */

import { BasePromptStrategy } from "./base-strategy"
import type { AIModelId, PromptGenerationOptions } from "@/types/ai-models"
import type { Component } from "@/types/schema"

/**
 * Gemini Prompt Strategy
 *
 * Gemini 2.0 Pro, 2.5 Pro, 2.0 Flash 등에 최적화
 */
export class GeminiStrategy extends BasePromptStrategy {
  constructor(modelId: AIModelId = "gemini-2.5-pro") {
    super(modelId)
  }

  /**
   * Gemini 최적화 시스템 프롬프트
   *
   * 특징:
   * - 프레임워크/라이브러리 명시적 지정
   * - 최신 패턴 강조 (2025 기준)
   * - 구조화된 출력 형식
   */
  generateSystemPrompt(framework: string, cssSolution: string): string {
    const currentYear = new Date().getFullYear()
    const frameworkVersion = this.getFrameworkVersion(framework)

    return `You are an expert web developer specializing in ${framework} ${frameworkVersion} and modern web development (${currentYear}).

**Objective:**
Build a production-ready, responsive layout component following the Laylder Schema specifications.

**Technology Stack:**
- **Framework:** ${framework} ${frameworkVersion}${framework === "react" ? " (with functional components, hooks, and latest patterns)" : ""}
- **Language:** TypeScript (strict mode)
- **Styling:** ${cssSolution === "tailwind" ? "Tailwind CSS 3.x" : cssSolution} (latest ${currentYear} patterns)
- **Build Tool:** Modern bundler (Vite/Next.js/etc.)
- **Best Practices:** ${currentYear} web development standards

**Schema Architecture:**
The Laylder Schema uses a Component Independence model:
- **Positioning**: Each component defines how it's positioned (fixed, sticky, static, absolute, relative)
- **Layout**: Each component defines its internal layout (flexbox, grid, container, none)
- **Styling**: Visual properties are component-specific
- **Responsive**: Mobile-first with breakpoint-specific overrides

**Implementation Principles:**
1. **Framework Best Practices**: Use latest ${framework} patterns and conventions (${currentYear})
2. **Component Independence**: Each component is self-contained and independently positioned
3. **Flexbox for Structure**: Use Flexbox for page layout, Grid for content areas
4. **Semantic HTML5**: Use appropriate semantic tags (header, nav, main, aside, footer, section, article)
5. **Mobile-First Responsive**: Base styles for mobile, \`md:\` for tablet, \`lg:\` for desktop
6. **Type Safety**: Strict TypeScript with proper type definitions
7. **Performance**: Optimize for fast rendering and minimal bundle size

**Key Strengths to Leverage:**
- Deep ${framework} integration and latest patterns
- Modern web API usage
- Efficient responsive design implementation
- Clean, maintainable code structure

Generate clean, modern, production-ready code following ${framework} and ${cssSolution} best practices.`
  }

  /**
   * Framework 버전 정보 (최신 기준)
   */
  private getFrameworkVersion(framework: string): string {
    const versions: Record<string, string> = {
      react: "19.x",
      nextjs: "15.x",
      vue: "3.x",
      angular: "18.x",
      svelte: "5.x",
    }
    return versions[framework.toLowerCase()] || "latest"
  }

  /**
   * Gemini 최적화 컴포넌트 섹션
   *
   * 특징:
   * - 프레임워크 특화 패턴 강조
   * - 구조화된 표 형식
   * - 명확한 카테고리 분류
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    let section = `## Component Specifications\n\n`
    section += `Implement ${components.length} components with the following specifications:\n\n`

    // 컴포넌트를 카테고리별로 그룹화 (Gemini는 구조화 선호)
    const componentsByTag = this.groupComponentsBySemanticTag(components)

    section += `**Component Overview:**\n\n`
    section += `| # | Component | Tag | Positioning | Layout | Responsive |\n`
    section += `|---|-----------|-----|-------------|--------|------------|\n`
    components.forEach((comp, index) => {
      const hasResponsive = comp.responsive ? "✓" : "✗"
      section += `| ${index + 1} | ${comp.name} | \`<${comp.semanticTag}>\` | ${comp.positioning.type} | ${comp.layout.type} | ${hasResponsive} |\n`
    })
    section += `\n`

    // 카테고리별 상세 스펙
    for (const [tag, comps] of Object.entries(componentsByTag)) {
      section += `### ${this.getSemanticTagDescription(tag)} Components\n\n`
      comps.forEach((comp, index) => {
        section += this.formatComponent(comp, components.indexOf(comp), "normal", options)
        section += `\n`
      })
    }

    return section
  }

  /**
   * 시맨틱 태그별 컴포넌트 그룹화
   */
  private groupComponentsBySemanticTag(
    components: Component[]
  ): Record<string, Component[]> {
    return components.reduce(
      (acc, comp) => {
        const tag = comp.semanticTag
        if (!acc[tag]) acc[tag] = []
        acc[tag].push(comp)
        return acc
      },
      {} as Record<string, Component[]>
    )
  }

  /**
   * 시맨틱 태그 설명
   */
  private getSemanticTagDescription(tag: string): string {
    const descriptions: Record<string, string> = {
      header: "Header (Top-level)",
      nav: "Navigation",
      main: "Main Content",
      aside: "Sidebar/Aside",
      footer: "Footer",
      section: "Section",
      article: "Article",
      div: "Generic Container",
      form: "Form",
    }
    return descriptions[tag] || tag.charAt(0).toUpperCase() + tag.slice(1)
  }

  /**
   * Gemini 최적화 구현 지침
   *
   * 특징:
   * - 프레임워크 특화 패턴 제공
   * - 최신 베스트 프랙티스 강조
   * - 성능 최적화 팁
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    let section = `## Implementation Guidelines\n\n`

    section += `### Modern React/Next.js Patterns (2025)\n\n`
    section += `**Component Structure:**\n`
    section += `\`\`\`tsx\n`
    section += `// Modern React 19 functional component with TypeScript\n`
    section += `import { type FC } from 'react'\n\n`
    section += `interface ComponentProps {\n`
    section += `  // Props definition\n`
    section += `}\n\n`
    section += `export const Component: FC<ComponentProps> = ({ }) => {\n`
    section += `  return (\n`
    section += `    <element className="...">\n`
    section += `      {/* Content */}\n`
    section += `    </element>\n`
    section += `  )\n`
    section += `}\n`
    section += `\`\`\`\n\n`

    section += `### Positioning & Layout (Tailwind CSS 3.x)\n\n`
    section += `**Positioning Classes:**\n`
    section += `- **fixed**: \`fixed top-0 inset-x-0 z-50\` (viewport-fixed, often for headers)\n`
    section += `- **sticky**: \`sticky top-0 z-40\` (scrolls then sticks, for navigation)\n`
    section += `- **static**: Default flow (no classes needed)\n`
    section += `- **absolute**: \`absolute top-4 right-4\` (positioned relative to parent)\n`
    section += `- **relative**: \`relative\` (positioning context)\n\n`

    section += `**Flexbox Layout:**\n`
    section += `\`\`\`tsx\n`
    section += `<div className="flex flex-col md:flex-row justify-between items-center gap-4">\n`
    section += `  {/* Flexbox children */}\n`
    section += `</div>\n`
    section += `\`\`\`\n\n`

    section += `**Grid Layout:**\n`
    section += `\`\`\`tsx\n`
    section += `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n`
    section += `  {/* Grid items */}\n`
    section += `</div>\n`
    section += `\`\`\`\n\n`

    section += `### Responsive Design (Mobile-First)\n\n`
    section += `**Breakpoint Strategy:**\n`
    section += `- **Mobile** (default): Base styles, no prefix\n`
    section += `- **Tablet** (≥768px): \`md:\` prefix\n`
    section += `- **Desktop** (≥1024px): \`lg:\` prefix\n\n`

    section += `**Common Responsive Patterns:**\n`
    section += `\`\`\`tsx\n`
    section += `// Hide on mobile, show on tablet+\n`
    section += `<div className="hidden md:block">...</div>\n\n`
    section += `// Full width on mobile, half on tablet, third on desktop\n`
    section += `<div className="w-full md:w-1/2 lg:w-1/3">...</div>\n\n`
    section += `// Stack on mobile, row on tablet+\n`
    section += `<div className="flex flex-col md:flex-row">...</div>\n`
    section += `\`\`\`\n\n`

    section += `### Performance Best Practices\n\n`
    section += `- Use semantic HTML5 tags for better SEO and accessibility\n`
    section += `- Minimize DOM nesting (keep component tree shallow)\n`
    section += `- Use Tailwind's \`@apply\` sparingly (prefer utility classes)\n`
    section += `- Leverage React 19's automatic batching\n`
    section += `- Add \`key\` props for list items\n`
    section += `- Use TypeScript strict mode for type safety\n\n`

    section += `### Framework-Specific Tips\n\n`
    section += `**React 19:**\n`
    section += `- Use \`use client\` directive for client components (Next.js App Router)\n`
    section += `- Leverage automatic batching for state updates\n`
    section += `- Use \`forwardRef\` for ref forwarding when needed\n\n`

    section += `**Next.js 15:**\n`
    section += `- Use App Router structure (\`app/\` directory)\n`
    section += `- Server Components by default, opt into client components\n`
    section += `- Use \`next/image\` for optimized images\n`
    section += `- Implement \`metadata\` for SEO\n\n`

    return section
  }

  /**
   * Gemini 최적화 프롬프트 최적화
   *
   * 특징:
   * - 프레임워크 버전 강조
   * - 최신 패턴 요청
   * - 구조화된 출력 힌트
   */
  optimizePrompt(prompt: string, options?: PromptGenerationOptions): string {
    let optimizedPrompt = prompt

    // 최신 패턴 강조 (Gemini는 최신 정보에 강함)
    const modernPatternPrompt =
      `\n\n**Use Latest ${new Date().getFullYear()} Patterns:**\n` +
      `- Latest framework syntax and conventions\n` +
      `- Modern CSS features (container queries, cascade layers, etc.)\n` +
      `- Current accessibility standards (WCAG 2.2)\n` +
      `- Performance best practices (Core Web Vitals)\n\n`

    // System prompt 직후에 삽입
    optimizedPrompt = optimizedPrompt.replace(/---\n/, `${modernPatternPrompt}---\n`)

    // 구조화된 출력 힌트
    if (options?.verbosity === "detailed") {
      optimizedPrompt +=
        `\n\n**Output Structure:**\n` +
        `Please provide the code in a well-organized structure with:\n` +
        `1. Type definitions\n` +
        `2. Component implementations\n` +
        `3. Export statements\n` +
        `4. Brief usage examples\n`
    }

    return optimizedPrompt
  }
}

/**
 * Factory functions for Gemini models
 */
export function createGemini25ProStrategy(): GeminiStrategy {
  return new GeminiStrategy("gemini-2.5-pro")
}

export function createGemini20ProStrategy(): GeminiStrategy {
  return new GeminiStrategy("gemini-2.0-pro")
}

export function createGemini20FlashStrategy(): GeminiStrategy {
  return new GeminiStrategy("gemini-2.0-flash")
}
