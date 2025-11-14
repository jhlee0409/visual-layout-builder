import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  ComponentPositioning,
  ComponentLayout,
  ComponentStyling,
  ResponsiveBehavior,
} from "@/types/schema"
import { describeVisualLayout } from "./visual-layout-descriptor"
import { generateGridCSS, generateTailwindClasses } from "./canvas-to-grid"
import { sortComponentsByCanvasCoordinates, getComponentCanvasLayout } from "./canvas-sort-utils"

/**
 * Prompt Template Types for Schema
 *
 * V1과 동일한 구조지만 스키마 특성 반영:
 * - Component Independence (positioning, layout, styling, responsive)
 * - Structure-based layouts (vertical/horizontal/sidebar-main)
 * - No direct code generation - 순수 스펙 설명만
 */

export interface PromptTemplate {
  framework: string
  cssSolution: string
  systemPrompt: string
  componentSection: (components: Component[]) => string
  layoutSection: (
    components: Component[],
    breakpoints: Breakpoint[],
    layouts: LaydlerSchema["layouts"]
  ) => string
  instructionsSection: () => string
}

/**
 * React + Tailwind CSS Template for Schema
 *
 * Component Independence 아키텍처 기반
 */
export const reactTailwindTemplate: PromptTemplate = {
  framework: "react",
  cssSolution: "tailwind",

  systemPrompt: `You are an expert React developer. Generate a responsive layout component based on the following Schema specifications.

**Schema Architecture:**
- **Component Independence**: Each component has its own positioning, layout, styling, and responsive behavior
- **Flexbox First**: Use Flexbox for page structure, CSS Grid only for card/content layouts
- **Semantic HTML**: Follow HTML5 semantic principles
- **Mobile First**: Implement responsive design with mobile-first approach
- **Breakpoint Inheritance**: Mobile → Tablet → Desktop cascade (명시되지 않은 breakpoint는 이전 breakpoint 설정 자동 상속)

**Requirements:**
- Use React functional components with TypeScript
- Use Tailwind CSS utility classes for all styling
- Each component must implement its specified positioning, layout, and styling
- Follow the exact specifications provided for each component
- Apply mobile-first responsive design: base styles for mobile, then md: for tablet, lg: for desktop`,

  componentSection: (components: Component[]) => {
    let section = `## Components\n\n`
    section += `You need to create ${components.length} components with the following specifications:\n\n`

    components.forEach((comp, index) => {
      section += `### ${index + 1}. ${comp.name} (${comp.id})\n`
      section += `- **Semantic Tag:** \`<${comp.semanticTag}>\`\n`
      section += `- **Component Name:** \`${comp.name}\`\n\n`

      // Positioning
      section += formatPositioning(comp.positioning)

      // Layout
      section += formatLayout(comp.layout)

      // Styling
      if (comp.styling) {
        section += formatStyling(comp.styling)
      }

      // Responsive
      if (comp.responsive) {
        section += formatResponsive(comp.responsive)
      }

      // Props
      if (comp.props && Object.keys(comp.props).length > 0) {
        section += `**Default Props:**\n`
        section += "```json\n"
        section += JSON.stringify(comp.props, null, 2)
        section += "\n```\n"
      } else {
        section += `**Props:** None (placeholder component)\n`
      }

      section += `\n`
    })

    return section
  },

  layoutSection: (components: Component[], breakpoints: Breakpoint[], layouts: LaydlerSchema["layouts"]) => {
    let section = `## Responsive Page Structure\n\n`
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
          const comp = components.find(c => c.id === id)
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
      section += `**Layout Structure:** \`${layout.structure}\`\n\n`

      // Component order (DOM 순서) - Canvas 좌표 기준으로 정렬
      section += `**Component Order (DOM):**\n\n`
      section += `For accessibility and SEO, the DOM order should follow visual layout (top to bottom, left to right):\n\n`

      // Performance: Use shared utility function with Map-based O(n log n) sorting
      // Previous implementation: O(n²) due to Array.find() in sort comparator
      const sortedComponents = sortComponentsByCanvasCoordinates(
        layout.components,
        components,
        layoutKey
      )

      sortedComponents.forEach((componentId: string, idx: number) => {
        const comp = components.find(c => c.id === componentId)
        if (!comp) return

        const canvasLayout = getComponentCanvasLayout(comp, layoutKey)
        section += `${idx + 1}. ${componentId}`
        if (canvasLayout) {
          section += ` (Canvas row ${canvasLayout.y})`
        }
        section += `\n`
      })
      section += "\n"
      section += `**⚠️ IMPORTANT - Layout Priority:**\n\n`
      section += `1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide\n`
      section += `2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)\n`
      section += `3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally\n`
      section += `4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid\n\n`
      section += `**Note:** Visual positioning (above) may differ from DOM order.\n\n`

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

    return section
  },

  instructionsSection: () => {
    return `## Implementation Instructions\n\n` +
      `1. **Main Layout Component:**\n` +
      `   - Create a main container component (e.g., \`ResponsiveLayout\` or \`RootLayout\`)\n` +
      `   - Implement responsive structure changes using Tailwind breakpoints\n` +
      `   - Follow the structure specifications for each breakpoint (vertical/horizontal/sidebar-main)\n\n` +
      `2. **Component Implementation:**\n` +
      `   - Each component MUST use its specified semantic tag\n` +
      `   - Apply positioning classes according to component specifications\n` +
      `   - Implement layout (flex/grid/container) as specified\n` +
      `   - Add styling classes as specified\n` +
      `   - Implement responsive behavior for each breakpoint\n\n` +
      `3. **Positioning Guidelines:**\n` +
      `   - \`static\`: Default flow (no position class needed)\n` +
      `   - \`fixed\`: Use Tailwind \`fixed\` with specified position values (e.g., \`fixed top-0 left-0 right-0 z-50\`)\n` +
      `   - \`sticky\`: Use Tailwind \`sticky\` with specified position values\n` +
      `   - \`absolute\`: Use Tailwind \`absolute\` with specified position values\n` +
      `   - \`relative\`: Use Tailwind \`relative\`\n\n` +
      `4. **Layout Guidelines:**\n` +
      `   - \`flex\`: Use Tailwind flex utilities (\`flex\`, \`flex-col\`, \`justify-center\`, etc.)\n` +
      `   - \`grid\`: Use Tailwind grid utilities (\`grid\`, \`grid-cols-3\`, \`gap-4\`, etc.)\n` +
      `   - \`container\`: Wrap content in a container div with max-width and centering\n` +
      `   - \`none\`: No specific layout - let content flow naturally\n\n` +
      `5. **Responsive Behavior:**\n` +
      `   - **Mobile First Approach**: Base styles apply to mobile, use md: and lg: prefixes for larger breakpoints\n` +
      `   - **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)\n` +
      `   - **Override Strategy**: Use responsive prefixes to override inherited styles (e.g., \`hidden md:block\` = hidden on mobile, visible on tablet+)\n` +
      `   - Use Tailwind responsive prefixes (\`md:\`, \`lg:\`) for tablet and desktop\n` +
      `   - Handle visibility changes (hidden/block) as specified\n` +
      `   - Apply responsive width/order changes as specified\n\n` +
      `6. **Code Quality:**\n` +
      `   - Use TypeScript with proper type definitions\n` +
      `   - Follow React best practices (functional components, hooks)\n` +
      `   - Use semantic HTML5 tags as specified\n` +
      `   - Add placeholder content for demonstration\n` +
      `   - Keep component code clean and maintainable\n`
  },
}

/**
 * Helper function to format positioning specification
 */
function formatPositioning(positioning: ComponentPositioning): string {
  let text = `**Positioning:**\n`
  text += `- Type: \`${positioning.type}\`\n`

  if (positioning.position) {
    const { top, right, bottom, left, zIndex } = positioning.position
    const posValues: string[] = []

    if (top !== undefined) posValues.push(`top: ${top}`)
    if (right !== undefined) posValues.push(`right: ${right}`)
    if (bottom !== undefined) posValues.push(`bottom: ${bottom}`)
    if (left !== undefined) posValues.push(`left: ${left}`)
    if (zIndex !== undefined) posValues.push(`zIndex: ${zIndex}`)

    if (posValues.length > 0) {
      text += `- Position values: ${posValues.join(", ")}\n`
    }
  }

  text += "\n"
  return text
}

/**
 * Helper function to format layout specification
 */
function formatLayout(layout: ComponentLayout): string {
  let text = `**Layout:**\n`
  text += `- Type: \`${layout.type}\`\n`

  switch (layout.type) {
    case "flex":
      if (layout.flex) {
        const { direction, justify, items, wrap, gap } = layout.flex
        if (direction) text += `- Direction: \`${direction}\`\n`
        if (justify) text += `- Justify: \`${justify}\`\n`
        if (items) text += `- Items: \`${items}\`\n`
        if (wrap) text += `- Wrap: \`${wrap}\`\n`
        if (gap !== undefined) text += `- Gap: \`${gap}\`\n`
      }
      break

    case "grid":
      if (layout.grid) {
        const { cols, rows, gap, autoFlow } = layout.grid
        if (cols !== undefined) text += `- Columns: \`${cols}\`\n`
        if (rows !== undefined) text += `- Rows: \`${rows}\`\n`
        if (gap !== undefined) text += `- Gap: \`${gap}\`\n`
        if (autoFlow) text += `- Auto flow: \`${autoFlow}\`\n`
      }
      break

    case "container":
      if (layout.container) {
        const { maxWidth, padding, centered } = layout.container
        if (maxWidth) text += `- Max width: \`${maxWidth}\`\n`
        if (padding) text += `- Padding: \`${padding}\`\n`
        if (centered !== undefined) text += `- Centered: ${centered}\n`
      }
      break

    case "none":
      text += `- No specific layout configuration\n`
      break
  }

  text += "\n"
  return text
}

/**
 * Helper function to format styling specification
 */
function formatStyling(styling: ComponentStyling): string {
  let text = `**Styling:**\n`

  if (styling.width) text += `- Width: \`${styling.width}\`\n`
  if (styling.height) text += `- Height: \`${styling.height}\`\n`
  if (styling.background) text += `- Background: \`${styling.background}\`\n`
  if (styling.border) text += `- Border: \`${styling.border}\`\n`
  if (styling.shadow) text += `- Shadow: \`${styling.shadow}\`\n`
  if (styling.className) text += `- Custom classes: \`${styling.className}\`\n`

  text += "\n"
  return text
}

/**
 * Helper function to format responsive behavior specification
 */
function formatResponsive(responsive: ResponsiveBehavior): string {
  let text = `**Responsive Behavior:**\n`

  if (responsive.mobile) {
    const behaviors: string[] = []
    if (responsive.mobile.hidden) behaviors.push("hidden")
    if (responsive.mobile.width) behaviors.push(`width: ${responsive.mobile.width}`)
    if (responsive.mobile.order !== undefined)
      behaviors.push(`order: ${responsive.mobile.order}`)
    if (behaviors.length > 0) {
      text += `- Mobile: ${behaviors.join(", ")}\n`
    }
  }

  if (responsive.tablet) {
    const behaviors: string[] = []
    if (responsive.tablet.hidden !== undefined)
      behaviors.push(responsive.tablet.hidden ? "hidden" : "visible")
    if (responsive.tablet.width) behaviors.push(`width: ${responsive.tablet.width}`)
    if (responsive.tablet.order !== undefined)
      behaviors.push(`order: ${responsive.tablet.order}`)
    if (behaviors.length > 0) {
      text += `- Tablet (md:): ${behaviors.join(", ")}\n`
    }
  }

  if (responsive.desktop) {
    const behaviors: string[] = []
    if (responsive.desktop.hidden !== undefined)
      behaviors.push(responsive.desktop.hidden ? "hidden" : "visible")
    if (responsive.desktop.width) behaviors.push(`width: ${responsive.desktop.width}`)
    if (responsive.desktop.order !== undefined)
      behaviors.push(`order: ${responsive.desktop.order}`)
    if (behaviors.length > 0) {
      text += `- Desktop (lg:): ${behaviors.join(", ")}\n`
    }
  }

  text += "\n"
  return text
}

/**
 * Template registry for - extensible for future frameworks
 */
export const templateRegistry: Record<
  string,
  Record<string, PromptTemplate>
> = {
  react: {
    tailwind: reactTailwindTemplate,
    // Future: css-modules, styled-components, etc.
  },
  // Future: vue, svelte, angular, etc.
}

/**
 * Get template by framework and CSS solution 
 */
export function getTemplate(
  framework: string,
  cssSolution: string
): PromptTemplate | null {
  return templateRegistry[framework]?.[cssSolution] || null
}
