/**
 * Base Prompt Strategy (Abstract Class)
 *
 * 모든 AI 모델 전략의 기본 클래스
 * 공통 로직 제공, 모델별 최적화는 하위 클래스에서 구현
 *
 * 설계 원칙:
 * - Template Method Pattern: 공통 흐름 정의, 세부 구현은 하위 클래스
 * - DRY (Don't Repeat Yourself): 중복 코드 제거
 * - Single Responsibility: 프롬프트 생성에만 집중
 */

import type {
  AIModelId,
  AIModelMetadata,
  IPromptStrategy,
  PromptGenerationOptions,
  PromptStrategyResult,
  PromptSection,
} from "@/types/ai-models"
import type { LaydlerSchema, Component, Breakpoint } from "@/types/schema"
import { getModelMetadata } from "@/lib/ai-model-registry"
import { validateSchema } from "@/lib/schema-validation"
import { normalizeSchema } from "@/lib/schema-utils"
import { describeVisualLayout } from "@/lib/visual-layout-descriptor"
import { generateGridCSS, generateTailwindClasses } from "@/lib/canvas-to-grid"
import { calculateLinkGroups, validateComponentLinks, type ComponentLink } from "@/lib/graph-utils"

/**
 * Base Prompt Strategy
 *
 * Abstract class - 직접 인스턴스화 불가, 반드시 상속 필요
 */
export abstract class BasePromptStrategy implements IPromptStrategy {
  readonly modelId: AIModelId
  readonly metadata: AIModelMetadata

  constructor(modelId: AIModelId) {
    this.modelId = modelId
    const metadata = getModelMetadata(modelId)
    if (!metadata) {
      throw new Error(`Model metadata not found for: ${modelId}`)
    }
    this.metadata = metadata
  }

  /**
   * 시스템 프롬프트 생성 (추상 메서드)
   *
   * 각 모델별로 최적화된 시스템 프롬프트 구현 필요
   */
  abstract generateSystemPrompt(framework: string, cssSolution: string): string

  /**
   * 컴포넌트 섹션 생성 (기본 구현)
   *
   * 모델별 최적화 필요 시 override
   */
  generateComponentSection(
    components: Component[],
    options?: PromptGenerationOptions
  ): string {
    const verbosity = options?.verbosity || "normal"
    let section = `## Components\n\n`

    if (verbosity === "minimal") {
      section += `${components.length} components: ${components.map((c) => c.name).join(", ")}\n`
    } else {
      section += `You need to create ${components.length} components:\n\n`

      components.forEach((comp, index) => {
        section += this.formatComponent(comp, index, verbosity, options)
      })
    }

    return section
  }

  /**
   * 단일 컴포넌트 포맷팅 (공통 로직)
   *
   * 하위 클래스에서 override 가능
   */
  protected formatComponent(
    comp: Component,
    index: number,
    verbosity: "minimal" | "normal" | "detailed",
    options?: PromptGenerationOptions
  ): string {
    let text = `### ${index + 1}. ${comp.name} (${comp.id})\n`
    text += `- **Semantic Tag:** \`<${comp.semanticTag}>\`\n`
    text += `- **Component Name:** \`${comp.name}\`\n\n`

    // Positioning
    text += `**Positioning:**\n`
    text += `- Type: \`${comp.positioning.type}\`\n`
    if (comp.positioning.position) {
      const pos = comp.positioning.position
      const posValues: string[] = []
      if (pos.top !== undefined) posValues.push(`top: ${pos.top}`)
      if (pos.right !== undefined) posValues.push(`right: ${pos.right}`)
      if (pos.bottom !== undefined) posValues.push(`bottom: ${pos.bottom}`)
      if (pos.left !== undefined) posValues.push(`left: ${pos.left}`)
      if (pos.zIndex !== undefined) posValues.push(`zIndex: ${pos.zIndex}`)
      if (posValues.length > 0) {
        text += `- Position values: ${posValues.join(", ")}\n`
      }
    }
    text += "\n"

    // Layout
    text += `**Layout:**\n`
    text += `- Type: \`${comp.layout.type}\`\n`
    if (comp.layout.type === "flex" && comp.layout.flex) {
      const flex = comp.layout.flex
      if (flex.direction) text += `- Direction: \`${flex.direction}\`\n`
      if (flex.justify) text += `- Justify: \`${flex.justify}\`\n`
      if (flex.items) text += `- Items: \`${flex.items}\`\n`
      if (flex.wrap) text += `- Wrap: \`${flex.wrap}\`\n`
      if (flex.gap !== undefined) text += `- Gap: \`${flex.gap}\`\n`
    } else if (comp.layout.type === "grid" && comp.layout.grid) {
      const grid = comp.layout.grid
      if (grid.cols !== undefined) text += `- Columns: \`${grid.cols}\`\n`
      if (grid.rows !== undefined) text += `- Rows: \`${grid.rows}\`\n`
      if (grid.gap !== undefined) text += `- Gap: \`${grid.gap}\`\n`
      if (grid.autoFlow) text += `- Auto flow: \`${grid.autoFlow}\`\n`
    }
    text += "\n"

    // Styling (if present)
    if (comp.styling && verbosity !== "minimal") {
      text += `**Styling:**\n`
      if (comp.styling.width) text += `- Width: \`${comp.styling.width}\`\n`
      if (comp.styling.height) text += `- Height: \`${comp.styling.height}\`\n`
      if (comp.styling.background) text += `- Background: \`${comp.styling.background}\`\n`
      if (comp.styling.border) text += `- Border: \`${comp.styling.border}\`\n`
      if (comp.styling.shadow) text += `- Shadow: \`${comp.styling.shadow}\`\n`
      if (comp.styling.className) text += `- Custom classes: \`${comp.styling.className}\`\n`
      text += "\n"
    }

    // Responsive (if present and not minimal)
    if (comp.responsive && verbosity !== "minimal") {
      text += `**Responsive Behavior:**\n`
      if (comp.responsive.mobile) {
        const behaviors: string[] = []
        if (comp.responsive.mobile.hidden) behaviors.push("hidden")
        if (comp.responsive.mobile.width) behaviors.push(`width: ${comp.responsive.mobile.width}`)
        if (comp.responsive.mobile.order !== undefined)
          behaviors.push(`order: ${comp.responsive.mobile.order}`)
        if (behaviors.length > 0) text += `- Mobile: ${behaviors.join(", ")}\n`
      }
      if (comp.responsive.tablet) {
        const behaviors: string[] = []
        if (comp.responsive.tablet.hidden !== undefined)
          behaviors.push(comp.responsive.tablet.hidden ? "hidden" : "visible")
        if (comp.responsive.tablet.width) behaviors.push(`width: ${comp.responsive.tablet.width}`)
        if (comp.responsive.tablet.order !== undefined)
          behaviors.push(`order: ${comp.responsive.tablet.order}`)
        if (behaviors.length > 0) text += `- Tablet (md:): ${behaviors.join(", ")}\n`
      }
      if (comp.responsive.desktop) {
        const behaviors: string[] = []
        if (comp.responsive.desktop.hidden !== undefined)
          behaviors.push(comp.responsive.desktop.hidden ? "hidden" : "visible")
        if (comp.responsive.desktop.width) behaviors.push(`width: ${comp.responsive.desktop.width}`)
        if (comp.responsive.desktop.order !== undefined)
          behaviors.push(`order: ${comp.responsive.desktop.order}`)
        if (behaviors.length > 0) text += `- Desktop (lg:): ${behaviors.join(", ")}\n`
      }
      text += "\n"
    }

    return text
  }

  /**
   * 레이아웃 섹션 생성 (기본 구현)
   *
   * 🆕 2025 Canvas→Code Architecture:
   * - Visual Layout (Canvas Grid) 정보 포함
   * - CSS Grid Positioning 명시
   * - Spatial Relationships 설명
   * - Implementation Strategy 제공
   *
   * 모델별 최적화 필요 시 override
   */
  generateLayoutSection(
    components: Component[],
    breakpoints: Breakpoint[],
    layouts: LaydlerSchema["layouts"],
    options?: PromptGenerationOptions
  ): string {
    const verbosity = options?.verbosity || "normal"
    let section = `## Responsive Page Structure\n\n`

    if (verbosity === "minimal") {
      section += `${breakpoints.length} breakpoints defined\n`
    } else {
      section += `Implement the following page structures for each breakpoint:\n\n`

      breakpoints.forEach((breakpoint, index) => {
        const layoutKey = breakpoint.name as "mobile" | "tablet" | "desktop"
        const layout = layouts[layoutKey]
        if (!layout) return

        section += `### ${index + 1}. ${breakpoint.name.charAt(0).toUpperCase() + breakpoint.name.slice(1)} (≥${breakpoint.minWidth}px)\n\n`

        // 🆕 VISUAL LAYOUT DESCRIPTION (Canvas Grid 정보)
        try {
          const layoutDesc = describeVisualLayout(
            components,
            layoutKey,
            breakpoint.gridCols,
            breakpoint.gridRows
          )

          section += `**Visual Layout (Canvas Grid):**\n\n`
          section += `${layoutDesc.summary}\n\n`

          // Row-by-row description
          layoutDesc.rowByRow.forEach((row) => {
            section += `- ${row}\n`
          })
          section += "\n"

          // Spatial relationships
          if (layoutDesc.spatialRelationships.length > 0) {
            section += `**Spatial Relationships:**\n\n`
            layoutDesc.spatialRelationships.forEach((rel) => {
              section += `- ${rel}\n`
            })
            section += "\n"
          }

          // 🆕 CSS GRID POSITIONING (2025 pattern)
          const gridCSS = generateGridCSS(layoutDesc.visualLayout)
          const tailwindClasses = generateTailwindClasses(layoutDesc.visualLayout)

          section += `**CSS Grid Positioning:**\n\n`
          section += `For precise 2D positioning, use CSS Grid:\n\n`
          section += `\`\`\`css\n`
          section += gridCSS
          section += `\`\`\`\n\n`

          section += `Or with Tailwind CSS:\n\n`
          section += `Container: \`${tailwindClasses.container}\`\n\n`
          section += `Components:\n`
          Object.entries(tailwindClasses.components).forEach(([id, classes]) => {
            const comp = components.find((c) => c.id === id)
            section += `- **${comp?.name} (${id})**: \`${classes}\`\n`
          })
          section += "\n"

          // 🆕 IMPLEMENTATION STRATEGY (강화)
          section += `**Implementation Strategy:**\n\n`
          layoutDesc.implementationHints.forEach((hint) => {
            section += `- ${hint}\n`
          })
          section += "\n"
        } catch (error) {
          // Fallback: Canvas 좌표 정보가 없는 경우 (backward compatibility)
          console.warn(`Visual layout description failed for ${layoutKey}:`, error)
        }

        // Structure type (기존)
        section += `**Page Flow:** \`${layout.structure}\` (vertical scrolling with horizontal content areas)\n\n`

        // ⚠️ CRITICAL: Visual Layout 우선순위 명시
        section += `**🚨 IMPORTANT - Layout Priority:**\n\n`
        section += `1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide\n`
        section += `2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)\n`
        section += `3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally\n`
        section += `4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid\n\n`

        // Component order (DOM 순서) - 경고 강화
        section += `**DOM Order (Reference Only - DO NOT use for visual positioning):**\n\n`
        section += `For screen readers and SEO crawlers, the HTML source order is:\n\n`
        layout.components.forEach((componentId: string, idx: number) => {
          const comp = components.find((c) => c.id === componentId)
          const canvasLayout = comp?.responsiveCanvasLayout?.[layoutKey] || comp?.canvasLayout
          section += `${idx + 1}. ${componentId}`
          if (canvasLayout) {
            section += ` (Canvas row ${canvasLayout.y})`
          }
          section += `\n`
        })
        section += "\n"
        section += `**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!\n\n`

        // Roles (if structure is sidebar-main)
        if (layout.roles && Object.keys(layout.roles).length > 0) {
          section += `**Layout Roles:**\n`
          if (layout.roles.header) section += `- **Header:** ${layout.roles.header}\n`
          if (layout.roles.sidebar) section += `- **Sidebar:** ${layout.roles.sidebar}\n`
          if (layout.roles.main) section += `- **Main:** ${layout.roles.main}\n`
          if (layout.roles.footer) section += `- **Footer:** ${layout.roles.footer}\n`
          section += "\n"
        }
      })
    }

    return section
  }

  /**
   * 구현 지침 섹션 생성 (기본 구현)
   *
   * 모델별 최적화 필요 시 override
   */
  generateInstructionsSection(options?: PromptGenerationOptions): string {
    const verbosity = options?.verbosity || "normal"

    if (verbosity === "minimal") {
      return `## Instructions\n\nImplement components with specified positioning, layout, and styling. Use mobile-first responsive design.\n`
    }

    return (
      `## Implementation Instructions\n\n` +
      `1. **Main Layout Component:**\n` +
      `   - Create a main container component\n` +
      `   - Implement responsive structure changes using Tailwind breakpoints\n\n` +
      `2. **Component Implementation:**\n` +
      `   - Use specified semantic tags\n` +
      `   - Apply positioning classes\n` +
      `   - Implement layout (flex/grid/container)\n` +
      `   - Add styling classes\n` +
      `   - Implement responsive behavior\n\n` +
      `3. **Code Quality:**\n` +
      `   - Use TypeScript with proper types\n` +
      `   - Follow React best practices\n` +
      `   - Use semantic HTML5 tags\n` +
      `   - Keep code clean and maintainable\n`
    )
  }

  /**
   * Component Links 섹션 생성 (공통 로직)
   *
   * Cross-breakpoint relationships를 설명
   * Validates links and uses shared DFS algorithm from graph-utils
   */
  generateComponentLinksSection(
    components: Component[],
    componentLinks: ComponentLink[],
    options?: PromptGenerationOptions
  ): string {
    // Validate component links
    const validComponentIds = new Set(components.map((c) => c.id))
    const linkValidation = validateComponentLinks(componentLinks, validComponentIds)

    if (!linkValidation.valid) {
      console.warn("Component link validation errors:", linkValidation.errors)
      // Filter out invalid links
      componentLinks = componentLinks.filter((link) => {
        return validComponentIds.has(link.source) && validComponentIds.has(link.target)
      })
    }

    let section = `## Component Links (Cross-Breakpoint Relationships)\n\n`
    section += `The following components are linked and should be treated as the same component across different breakpoints:\n\n`

    // Calculate groups using shared DFS algorithm
    const groups = calculateLinkGroups(componentLinks)

    groups.forEach((group, index) => {
      const componentNames = group
        .map((id) => {
          const comp = components.find((c) => c.id === id)
          return comp ? `${comp.name} (${id})` : id
        })
        .join(", ")
      section += `**Group ${index + 1}:** ${componentNames}\n`
    })

    section += `\n**Important:** Components in the same group represent the same UI element across different breakpoints. Generate consistent code for them with appropriate responsive behavior.\n\n`

    return section
  }

  /**
   * 최종 프롬프트 생성 (Template Method Pattern)
   *
   * 공통 흐름 정의, 세부 구현은 하위 메서드에서
   */
  generatePrompt(
    schema: LaydlerSchema,
    framework: string,
    cssSolution: string,
    options?: PromptGenerationOptions
  ): PromptStrategyResult {
    try {
      // 1. Normalize schema
      const normalizedSchema = normalizeSchema(schema)

      // 2. Validate schema
      const validationResult = validateSchema(normalizedSchema)
      if (!validationResult.valid) {
        return {
          success: false,
          modelId: this.modelId,
          errors: validationResult.errors.map((e) => {
            const location = e.componentId
              ? `${e.componentId}${e.field ? `.${e.field}` : ""}`
              : e.field || "schema"
            return `${location}: ${e.message}`
          }),
        }
      }

      // 3. Generate sections
      const sections: PromptSection[] = []

      // System prompt
      sections.push({
        title: "System Prompt",
        content: this.generateSystemPrompt(framework, cssSolution),
        priority: 100,
        required: true,
      })

      // Components section
      sections.push({
        title: "Components",
        content: this.generateComponentSection(normalizedSchema.components, options),
        priority: 90,
        required: true,
      })

      // Layout section
      sections.push({
        title: "Layouts",
        content: this.generateLayoutSection(
          normalizedSchema.components,
          normalizedSchema.breakpoints,
          normalizedSchema.layouts,
          options
        ),
        priority: 80,
        required: true,
      })

      // Component Links section (if provided)
      if (options?.componentLinks && options.componentLinks.length > 0) {
        sections.push({
          title: "Component Links",
          content: this.generateComponentLinksSection(
            normalizedSchema.components,
            options.componentLinks,
            options
          ),
          priority: 75,
          required: false,
        })
      }

      // Instructions section
      sections.push({
        title: "Instructions",
        content: this.generateInstructionsSection(options),
        priority: 70,
        required: true,
      })

      // Schema JSON (optional)
      if (options?.verbosity !== "minimal") {
        sections.push({
          title: "Full Schema",
          content:
            `## Full Schema (JSON)\n\n` +
            `For reference, here is the complete Schema:\n\n` +
            `\`\`\`json\n${JSON.stringify(normalizedSchema, null, 2)}\n\`\`\`\n`,
          priority: 50,
          required: false,
        })
      }

      // 4. Combine sections
      const prompt = sections
        .sort((a, b) => b.priority - a.priority)
        .map((s) => s.content)
        .join("\n---\n\n")

      // 5. Optimize prompt (if implemented)
      const finalPrompt = this.optimizePrompt
        ? this.optimizePrompt(prompt, options)
        : prompt

      // 6. Estimate tokens (improved accuracy)
      const estimatedTokens = this.estimateTokens(finalPrompt)

      return {
        success: true,
        prompt: finalPrompt,
        sections,
        estimatedTokens,
        modelId: this.modelId,
        optimizationUsed: options,
        warnings: validationResult.warnings.map((w) => {
          const location = w.componentId
            ? `${w.componentId}${w.field ? `.${w.field}` : ""}`
            : w.field || "schema"
          return `${location}: ${w.message}`
        }),
      }
    } catch (error) {
      return {
        success: false,
        modelId: this.modelId,
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
      }
    }
  }

  /**
   * 프롬프트 최적화 (선택적)
   *
   * 하위 클래스에서 구현 가능
   */
  optimizePrompt?(prompt: string, options?: PromptGenerationOptions): string

  /**
   * 토큰 수 추정 (개선된 정확도)
   *
   * 영어/코드와 한글/CJK를 구분하여 더 정확한 추정
   *
   * Rules:
   * - 영어/숫자/기호: 1 token ≈ 4 characters
   * - 한글/CJK: 1 token ≈ 2 characters (multibyte)
   * - 공백/줄바꿈: 별도 처리
   * - 코드 블록: 더 정확한 카운팅
   *
   * @param text - 프롬프트 텍스트
   * @returns 예상 토큰 수
   */
  protected estimateTokens(text: string): number {
    // 1. 코드 블록 추출 및 별도 처리
    const codeBlocks: string[] = []
    let textWithoutCode = text.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match)
      return "" // 임시 제거
    })

    // 2. 한글/CJK 문자 카운트 (multibyte characters)
    const cjkRegex = /[\u3131-\uD79D\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g
    const cjkMatches = textWithoutCode.match(cjkRegex) || []
    const cjkCount = cjkMatches.length

    // CJK 제거한 나머지 텍스트
    const textWithoutCJK = textWithoutCode.replace(cjkRegex, "")

    // 3. 영어/숫자/기호 카운트
    const latinCount = textWithoutCJK.length

    // 4. 코드 블록 토큰 추정 (코드는 더 압축적)
    let codeTokens = 0
    codeBlocks.forEach((block) => {
      // 코드는 1 token ≈ 3.5 characters (더 압축적)
      codeTokens += Math.ceil(block.length / 3.5)
    })

    // 5. 최종 토큰 계산
    const latinTokens = Math.ceil(latinCount / 4) // 영어: 1 token ≈ 4 chars
    const cjkTokens = Math.ceil(cjkCount / 2) // 한글/CJK: 1 token ≈ 2 chars

    return latinTokens + cjkTokens + codeTokens
  }
}
