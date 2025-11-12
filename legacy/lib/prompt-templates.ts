import type { LaydlerSchema, Component, Breakpoint } from "@/types/schema"

/**
 * Prompt Template Types
 * PRD 5.1: Template Library for different frameworks and CSS solutions
 */

export interface PromptTemplate {
  framework: string
  cssSolution: string
  systemPrompt: string
  componentSection: (components: Component[]) => string
  layoutSection: (
    breakpoints: Breakpoint[],
    layouts: LaydlerSchema["layouts"]
  ) => string
  instructionsSection: () => string
}

/**
 * React + Tailwind CSS Template
 * PRD 5.1: Default template for MVP
 */
export const reactTailwindTemplate: PromptTemplate = {
  framework: "react",
  cssSolution: "tailwind",

  systemPrompt: `You are an expert React developer. Generate a responsive layout component based on the following specifications.

**Requirements:**
- Use React functional components with TypeScript
- Use Tailwind CSS for styling
- Implement responsive design using CSS Grid
- Follow semantic HTML principles
- Use the exact grid layout specifications provided
- Component names and semantic tags must match exactly`,

  componentSection: (components: Component[]) => {
    let section = `## Components\n\n`
    section += `You need to create ${components.length} components with the following specifications:\n\n`

    components.forEach((comp, index) => {
      section += `### ${index + 1}. ${comp.name} (${comp.id})\n`
      section += `- **Semantic Tag:** \`<${comp.semanticTag}>\`\n`
      section += `- **Component Name:** \`${comp.name}\`\n`

      if (comp.props && Object.keys(comp.props).length > 0) {
        section += `- **Default Props:**\n`
        section += "```json\n"
        section += JSON.stringify(comp.props, null, 2)
        section += "\n```\n"
      } else {
        section += `- **Props:** None (placeholder component)\n`
      }

      section += `\n`
    })

    return section
  },

  layoutSection: (breakpoints: Breakpoint[], layouts: LaydlerSchema["layouts"]) => {
    let section = `## Responsive Grid Layouts\n\n`
    section += `Implement the following responsive layouts using CSS Grid and Tailwind CSS:\n\n`

    breakpoints.forEach((breakpoint, index) => {
      const layout = layouts[breakpoint.name]
      if (!layout) return

      section += `### ${index + 1}. ${breakpoint.name.charAt(0).toUpperCase() + breakpoint.name.slice(1)} (≥${breakpoint.minWidth}px)\n\n`

      const { rows, columns, areas } = layout.grid

      // Grid template configuration
      section += `**Grid Configuration:**\n`
      section += `- **Rows:** \`${rows}\`\n`
      section += `- **Columns:** \`${columns}\`\n\n`

      // Grid areas visualization
      section += `**Grid Areas (Component Placement):**\n`
      section += "```\n"
      areas.forEach((row, rowIndex) => {
        section += `Row ${rowIndex + 1}: [${row.map(id => id || "empty").join(", ")}]\n`
      })
      section += "```\n\n"

      // CSS Grid template areas syntax
      section += `**CSS Grid Template Areas:**\n`
      section += "```css\n"
      section += `grid-template-rows: ${rows};\n`
      section += `grid-template-columns: ${columns};\n`
      section += `grid-template-areas:\n`
      areas.forEach(row => {
        const areaRow = row.map(id => id || ".").join(" ")
        section += `  "${areaRow}"\n`
      })
      section += "```\n\n"

      // Tailwind CSS classes
      section += `**Tailwind CSS Classes (for ≥${breakpoint.minWidth}px):**\n`
      const breakpointPrefix = getBreakpointPrefix(breakpoint.minWidth)
      section += `- Use \`${breakpointPrefix}:grid\` for grid container\n`
      section += `- Apply custom grid template using \`style\` prop or custom Tailwind config\n\n`
    })

    return section
  },

  instructionsSection: () => {
    return `## Implementation Instructions\n\n` +
      `1. **Main Layout Component:**\n` +
      `   - Create a main container component (e.g., \`ResponsiveLayout\`)\n` +
      `   - Use CSS Grid with the specifications above\n` +
      `   - Apply responsive styles using Tailwind breakpoints\n\n` +
      `2. **Child Components:**\n` +
      `   - Each component should use its specified semantic tag\n` +
      `   - Components should accept their default props\n` +
      `   - Add placeholder content for demonstration\n\n` +
      `3. **Styling Guidelines:**\n` +
      `   - Use Tailwind utility classes wherever possible\n` +
      `   - For complex grid layouts, use inline styles or custom CSS\n` +
      `   - Ensure proper spacing and visual hierarchy\n\n` +
      `4. **Responsive Behavior:**\n` +
      `   - Implement mobile-first approach\n` +
      `   - Each breakpoint should have its independent grid layout\n` +
      `   - Test on different screen sizes\n\n` +
      `5. **Code Quality:**\n` +
      `   - Use TypeScript with proper type definitions\n` +
      `   - Follow React best practices\n` +
      `   - Add comments for complex grid configurations\n`
  },
}

/**
 * Helper function to get Tailwind breakpoint prefix
 */
function getBreakpointPrefix(minWidth: number): string {
  if (minWidth >= 1536) return "2xl"
  if (minWidth >= 1280) return "xl"
  if (minWidth >= 1024) return "lg"
  if (minWidth >= 768) return "md"
  if (minWidth >= 640) return "sm"
  return "" // mobile (no prefix)
}

/**
 * Template registry - extensible for future frameworks
 */
export const templateRegistry: Record<string, Record<string, PromptTemplate>> = {
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
