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

  systemPrompt: `**Note:** This is a specification-based task. Follow the schema exactly without creative deviations.

You are a senior React developer with expertise in modern web development, responsive design, and best practices.

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
- Proper use of Tailwind CSS utility classes
- Responsive design following mobile-first principles

**Code Quality Standards (2025):**

**TypeScript Component Patterns:**
- ❌ **DO NOT** use \`React.FC\` or \`React.FunctionComponent\` (not recommended in 2025)
- ✅ **DO** use standard function components with direct prop typing
- ✅ **DO** use utility types: \`PropsWithChildren\`, \`ComponentPropsWithoutRef\`
- ✅ **DO** use \`React.AriaRole\` for role attributes (type-safe)
- ✅ **DO** export proper TypeScript types for all components
- ✅ **DO** include JSDoc comments for all exported components

**Example Component Pattern:**
\`\`\`typescript
import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type HeaderProps = PropsWithChildren<{
  variant?: 'default' | 'sticky' | 'fixed'
  className?: string
  role?: React.AriaRole
  'aria-label'?: string
}>

/**
 * Header component for page navigation
 * @param variant - Positioning strategy (default: 'default')
 */
function Header({
  children,
  variant = 'default',
  className,
  role = 'banner',
  'aria-label': ariaLabel,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full border-b border-gray-300 px-4 py-4',
        { 'sticky top-0 z-50': variant === 'sticky' },
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </header>
  )
}

export { Header }
export type { HeaderProps }
\`\`\`

**Component Structure Best Practices:**
- ✅ **DO** use \`cn()\` utility for conditional className merging
- ✅ **DO** separate component definition from usage
- ✅ **DO** use composition patterns for complex components (e.g., \`Card.Header\`, \`Card.Body\`)
- ❌ **DO NOT** duplicate components for different breakpoints
- ❌ **DO NOT** mix demo content with component logic
- ✅ **DO** only generate layout structure with component name + ID as content

**Required Utilities:**
Every generated codebase MUST include this utility function:

\`\`\`typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

**Responsive Design Without Duplication:**
\`\`\`typescript
// ❌ DON'T: Duplicate components
<div className="block md:hidden"><Header>Mobile</Header></div>
<div className="hidden md:block"><Header>Desktop</Header></div>

// ✅ DO: Single component with responsive behavior
<div className="col-span-full">
  <Header>
    <nav className="hidden lg:flex gap-6">Desktop Nav</nav>
    <button className="lg:hidden">Mobile Menu</button>
  </Header>
</div>
\`\`\`

**🎨 Layout-Only Code Generation (2025 Philosophy):**

This is a **pure layout builder tool**. We provide ONLY the structural layout - users will add their own themes and styling.

**✅ DO Generate:**
- Component wrapper with correct semantic tag
- Positioning classes (sticky, fixed, absolute, relative, static)
- Layout classes (flex, grid, container)
- **Minimal** borders for layout division (e.g., \`border-b\`, \`border-r\`, \`border border-gray-300\`)
- Responsive behavior (hidden, width overrides, responsive utilities)
- ARIA attributes for accessibility (role, aria-label, etc.)
- Focus states for keyboard navigation (\`focus-within:ring-2\`)
- Motion reduce support (\`motion-reduce:transition-none\`)
- **Content**: Just display the component name and ID (e.g., "Header (c1)")

**❌ DO NOT Generate:**
- Theme colors (\`bg-blue\`, \`bg-purple\`, \`text-white\`, gradients)
- Shadows (\`shadow-sm\`, \`shadow-md\`, \`shadow-lg\`)
- Rounded corners (\`rounded-lg\`, \`rounded-xl\`) - users will style these
- Background colors (\`bg-white\`, \`bg-gray-100\`) - keep transparent or minimal gray for division only
- Typography styles (\`prose\`, \`font-fancy\`) - users will apply their own
- Detailed placeholder content, mock text, or feature highlights
- Navigation links, buttons, or interactive elements
- Any creative additions beyond the schema specifications

**🚨 CRITICAL - User Theme Freedom:**
The generated layout must be a **blank canvas** for users to apply their own:
- Brand colors
- Custom shadows
- Border radius styles
- Background patterns
- Typography systems

Only use gray-scale colors for layout division (e.g., \`border-gray-300\`). All theme colors will be added by the user.

**Approach:**
1. Read and understand the complete Schema specification
2. Plan the component structure and relationships
3. Implement each component following its specifications exactly
4. Apply responsive behavior for each breakpoint
5. Ensure accessibility and semantic HTML compliance

Let's build a high-quality, production-ready layout.`,

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

      // Props (ARIA attributes, accessibility)
      if (comp.props) {
        section += formatProps(comp.props)
      }

      // Responsive
      if (comp.responsive) {
        section += formatResponsive(comp.responsive)
      }

      section += `---\n\n`
    })

    return section
  },

  layoutSection: (components: Component[], breakpoints: Breakpoint[], layouts: LaydlerSchema["layouts"]) => {
    let section = `## Responsive Page Structure\n\n`
    section += `Implement the following page structures for each breakpoint:\n\n`

    breakpoints.forEach((breakpoint, index) => {
      const layoutKey = breakpoint.name  // Dynamic breakpoint support
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
        // Only log in development environment (not production)
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Visual layout description failed for ${layoutKey}:`, error)
        }
      }

      // Structure type (기존)
      section += `**Page Flow:** \`${layout.structure}\` (vertical scrolling with horizontal content areas)\n\n`

      // 🚨 IMPORTANT - Layout Priority (먼저 표시)
      section += `**🚨 IMPORTANT - Layout Priority:**\n\n`
      section += `1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide\n`
      section += `2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)\n`
      section += `3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally\n`
      section += `4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid\n\n`

      // Component order (DOM 순서) - Canvas 좌표 기준으로 정렬
      section += `**Component Order (DOM):**\n\n`
      section += `For screen readers and SEO crawlers, the HTML source order is:\n\n`
      section += `⚠️ **Note:** Visual positioning may differ from DOM order. Use Canvas Grid coordinates for layout.\n\n`

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
      section += `\n**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!\n\n`

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
      `### Positioning Guidelines\n\n` +
      `- **static**: Default flow (no position class needed)\n` +
      `- **fixed**: Use Tailwind \`fixed\` with position values (e.g., \`fixed top-0 left-0 right-0 z-50\`)\n` +
      `- **sticky**: Use Tailwind \`sticky\` with position values (e.g., \`sticky top-0 z-40\`)\n` +
      `- **absolute**: Use Tailwind \`absolute\` with position values\n` +
      `- **relative**: Use Tailwind \`relative\`\n\n` +
      `### Layout Guidelines\n\n` +
      `- **flex**: Use Tailwind flex utilities (\`flex\`, \`flex-col\`, \`justify-center\`, \`items-center\`, \`gap-4\`, etc.)\n` +
      `- **grid**: Use Tailwind grid utilities (\`grid\`, \`grid-cols-3\`, \`gap-4\`, etc.)\n` +
      `- **container**: Wrap content in a container div with max-width and centering\n` +
      `- **none**: No specific layout - let content flow naturally\n\n` +
      `### Responsive Design Guidelines\n\n` +
      `- **Mobile First**: Base styles apply to mobile, use \`md:\` and \`lg:\` prefixes for larger breakpoints\n` +
      `- **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)\n` +
      `- **Override Strategy**: Use responsive prefixes to override inherited styles\n` +
      `  - Example: \`hidden md:block\` = hidden on mobile, visible on tablet+\n` +
      `  - Example: \`w-full md:w-1/2 lg:w-1/3\` = full width on mobile, half on tablet, third on desktop\n\n` +
      `### Code Quality Checklist\n\n` +
      `**TypeScript & Component Structure:**\n` +
      `- [ ] Use standard function components (NOT \`React.FC\`)\n` +
      `- [ ] Use utility types (\`PropsWithChildren\`, \`ComponentPropsWithoutRef\`)\n` +
      `- [ ] Use \`React.AriaRole\` for role attributes\n` +
      `- [ ] Export component and props type separately\n` +
      `- [ ] Include JSDoc comments for all components\n` +
      `- [ ] Use \`cn()\` utility for all className operations\n\n` +
      `**Layout & Responsive:**\n` +
      `- [ ] All components use specified semantic tags\n` +
      `- [ ] Positioning and layout follow specifications exactly\n` +
      `- [ ] Responsive behavior implemented for all breakpoints\n` +
      `- [ ] NO component duplication across breakpoints (use responsive classes instead)\n` +
      `- [ ] Single component instances with responsive content\n\n` +
      `**Accessibility:**\n` +
      `- [ ] ARIA labels and roles are type-safe\n` +
      `- [ ] Keyboard navigation support (\`focus:ring-2\`, \`focus:outline-none\`)\n` +
      `- [ ] Screen reader support (semantic tags + ARIA)\n\n` +
      `**Content & Code Quality:**\n` +
      `- [ ] **Content: ONLY display component name + ID** (e.g., "Header (c1)")\n` +
      `- [ ] **NO placeholder content, mock data, or creative additions**\n` +
      `- [ ] Code is clean, readable, and well-commented\n` +
      `- [ ] Include \`lib/utils.ts\` with \`cn()\` function\n`
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
 * Helper function to format component props specification
 */
function formatProps(props: Record<string, unknown>): string {
  let text = `**Props (Accessibility & Attributes):**\n`

  Object.entries(props).forEach(([key, value]) => {
    // Skip children prop (content placeholder)
    if (key === 'children') return

    // Format value appropriately
    const formattedValue = typeof value === 'string' ? `"${value}"` : String(value)
    text += `- ${key}: ${formattedValue}\n`
  })

  text += "\n"
  return text
}

/**
 * Helper function to format responsive behavior specification
 *
 * Supports dynamic breakpoint names (not just mobile/tablet/desktop)
 * Iterates over all properties in ResponsiveBehavior object
 */
function formatResponsive(responsive: ResponsiveBehavior): string {
  let text = `**Responsive Behavior:**\n`

  // Dynamically iterate over all breakpoints in responsive object
  // Supports any number of breakpoints (mobile, tablet, laptop, desktop, ultrawide, etc.)
  Object.entries(responsive).forEach(([breakpointName, config]) => {
    if (!config) return  // Skip undefined entries

    const behaviors: string[] = []

    if (config.hidden !== undefined) {
      behaviors.push(config.hidden ? "hidden" : "visible")
    }
    if (config.width) {
      behaviors.push(`width: ${config.width}`)
    }
    if (config.order !== undefined) {
      behaviors.push(`order: ${config.order}`)
    }
    if (config.positioning) {
      behaviors.push(`positioning: ${config.positioning.type}`)
    }

    if (behaviors.length > 0) {
      // Capitalize first letter for display
      const displayName = breakpointName.charAt(0).toUpperCase() + breakpointName.slice(1)
      text += `- ${displayName}: ${behaviors.join(", ")}\n`
    }
  })

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
