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
 * Similar structure to V1 but with schema characteristics:
 * - Component Independence (positioning, layout, styling, responsive)
 * - Structure-based layouts (vertical/horizontal/sidebar-main)
 * - No direct code generation - pure specification only
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
 * Based on Component Independence architecture
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
2. **Layout Strategy**:
   - Use CSS Grid for page-level positioning (based on Canvas Grid coordinates)
   - Use Flexbox for component internal layout (flex-col, flex-row, gap utilities)
   - Use CSS Grid for content grids within components (grid-cols-3, auto-fit, etc.)
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
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Inline cn utility - included for maximum portability
// (Optional: Move to shared file like lib/utils.ts if preferred)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

**🔧 cn() Utility - Inline Approach (Maximum Compatibility):**

For maximum portability across different project structures, include the \`cn()\` utility **inline in each component**:

\`\`\`typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Inline cn utility - works in any project structure
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

**Why Inline?**
- ✅ **No file path assumptions**: Works regardless of project structure (Next.js, Vite, CRA, etc.)
- ✅ **Copy-paste friendly**: Users can paste components directly without setup
- ✅ **Zero configuration**: No need to create utility files or configure import aliases
- ✅ **Beginner friendly**: Users see exactly what \`cn()\` does

**Install dependencies (Required):**
\`\`\`bash
npm install clsx tailwind-merge
# or: pnpm add clsx tailwind-merge
# or: yarn add clsx tailwind-merge
\`\`\`

**Optional Refactoring (For Experienced Users):**

If you prefer to reduce duplication, you can extract \`cn()\` to a shared file:

1. Create a utility file at your preferred location:
   - Next.js: \`lib/utils.ts\` → \`import { cn } from '@/lib/utils'\`
   - Vite: \`src/utils/cn.ts\` → \`import { cn } from '@/utils/cn'\`
   - CRA: \`src/lib/utils.js\` → \`import { cn } from '../lib/utils'\`

2. Move the inline \`cn()\` function to that file

3. Replace inline utilities in all components with the import

**Note:** Modern bundlers (Webpack, Vite, etc.) will tree-shake duplicate \`cn()\` functions, so inline duplication has minimal bundle impact.

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
- **MANDATORY borders on ALL components** (\`border-gray-300\`) - see Component-Specific Standards below
- Minimal rounded corners for sections/articles (\`rounded-lg\`, \`rounded-md\`, \`rounded\`)
- Responsive behavior (hidden, width overrides, responsive utilities)
- ARIA attributes for accessibility (role, aria-label, etc.)
- Focus states for keyboard navigation (\`focus-within:ring-2\`)
- Motion reduce support (\`motion-reduce:transition-none\`)
- **Content**: Display ONLY component name and ID (e.g., "Header (c1)") - NO additional text

**❌ DO NOT Generate:**
- Theme colors (\`bg-blue\`, \`bg-purple\`, \`text-white\`, gradients)
- Shadows (\`shadow-sm\`, \`shadow-md\`, \`shadow-lg\`)
- Background colors except \`bg-white\` for sticky/fixed headers
- Typography styles (\`prose\`, \`font-fancy\`, custom font classes)
- Placeholder content beyond component name + ID
- Mock text, lorem ipsum, or feature descriptions
- Navigation links, buttons with text, or interactive elements
- Icons, images, or decorative elements
- Any creative additions beyond the schema specifications

**🚨 CRITICAL - User Theme Freedom:**
The generated layout must be a **blank canvas** for users to apply their own:
- Brand colors
- Custom shadows
- Border radius styles
- Background patterns
- Typography systems

Only use gray-scale colors for layout division (e.g., \`border-gray-300\`). All theme colors will be added by the user.

**📐 Component-Specific Styling Standards (2025 Wireframe Philosophy):**

**All components MUST include borders for clear layout visualization.**

**\`<header>\` - Page Header:**
\`\`\`typescript
<header className={cn(
  'border-b border-gray-300',  // Clear bottom division
  'py-4 px-6',                  // Consistent padding
  'flex items-center justify-between', // Common header layout
  'sticky top-0 z-50',         // If positioning is sticky/fixed
  'bg-white',                   // Only for sticky/fixed headers
)}>
  Header (c1)
</header>
\`\`\`

**\`<nav>\` - Navigation (Horizontal):**
\`\`\`typescript
<nav className={cn(
  'border-b border-gray-300',  // Bottom border for separation
  'py-2 px-4',
  'flex gap-6',                // Horizontal layout
)}>
  Nav (c2)
</nav>
\`\`\`

**\`<nav>\` - Navigation (Sidebar):**
\`\`\`typescript
<nav className={cn(
  'border-r border-gray-300',  // Right border (left sidebar)
  'py-4 px-4',
  'w-64',                      // Fixed width
  'flex flex-col gap-2',       // Vertical layout
)}>
  Nav (c2)
</nav>
\`\`\`

**\`<main>\` - Main Content:**
\`\`\`typescript
<main className={cn(
  'border border-gray-300',    // All sides bordered
  'p-4 md:p-6 lg:p-8',        // Responsive padding
  'flex-1',                    // Grow to fill space
  'flex flex-col gap-6',       // Vertical content flow
)}>
  Main (c3)
</main>
\`\`\`

**\`<aside>\` - Sidebar Content:**
\`\`\`typescript
<aside className={cn(
  'border-l border-gray-300',  // Left border (right sidebar)
  'p-4',
  'w-64 lg:w-80',             // Responsive width
  'flex flex-col gap-4',
)}>
  Aside (c4)
</aside>
\`\`\`

**\`<footer>\` - Page Footer:**
\`\`\`typescript
<footer className={cn(
  'border-t border-gray-300',  // Top border for separation
  'py-6 px-6',
  'flex justify-center',       // or justify-between
)}>
  Footer (c5)
</footer>
\`\`\`

**\`<section>\` - Content Section:**
\`\`\`typescript
<section className={cn(
  'border border-gray-300',    // Full border
  'p-4 md:p-6',               // Responsive padding
  'rounded-lg',                // Subtle rounding
  'flex flex-col gap-4',
)}>
  Section (c6)
</section>
\`\`\`

**\`<article>\` - Article Content:**
\`\`\`typescript
<article className={cn(
  'border border-gray-300',
  'p-4',
  'rounded-md',
  'flex flex-col gap-3',
)}>
  Article (c7)
</article>
\`\`\`

**\`<div>\` / \`<form>\` - Generic Container:**
\`\`\`typescript
<div className={cn(
  'border border-gray-300',
  'p-4',
  'rounded',
)}>
  Container (c8)
</div>
\`\`\`

**🎯 Critical Styling Rules:**

1. **EVERY component MUST have a border** (\`border-gray-300\`)
2. **Content MUST be**: "ComponentName (id)" only (e.g., "Header (c1)")
3. **No backgrounds** except:
   - \`bg-white\` for sticky/fixed headers (positioning clarity)
   - \`bg-gray-50\` for subtle division (optional, rare)
4. **Consistent padding**: p-4 (mobile), p-6 (tablet), p-8 (desktop)
5. **Border positions**:
   - Header: \`border-b\` (bottom only)
   - Footer: \`border-t\` (top only)
   - Sidebar Nav/Aside: \`border-r\` or \`border-l\` (side only)
   - Main/Section/Article/Div: \`border\` (all sides)
6. **Rounded corners** (minimal):
   - Section: \`rounded-lg\`
   - Article: \`rounded-md\`
   - Generic: \`rounded\`
   - Header/Footer/Nav: no rounding
7. **Tailwind Class Order**: positioning → box-model → borders → backgrounds → typography

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

      // Visual Layout Description (Canvas Grid information)
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

        // CSS Grid Positioning
        const gridCSS = generateGridCSS(layoutDesc.visualLayout)
        const tailwindClasses = generateTailwindClasses(layoutDesc.visualLayout)

        section += `**CSS Grid Positioning:**\n\n`
        section += `For precise 2D positioning, use CSS Grid:\n\n`
        section += `\`\`\`css\n`
        section += gridCSS
        section += `\`\`\`\n\n`

        section += `Or with Tailwind CSS (Arbitrary Values):\n\n`
        section += `Container: \`${tailwindClasses.container}\`\n\n`
        section += `**Note:** \`grid-rows-[repeat(N,auto)]\` uses Tailwind arbitrary values (v3.0+) for auto-sizing rows.\n\n`
        section += `Components:\n`
        Object.entries(tailwindClasses.components).forEach(([id, classes]) => {
          const comp = components.find(c => c.id === id)
          section += `- **${comp?.name} (${id})**: \`${classes}\`\n`
        })
        section += "\n"

        // Implementation Strategy
        section += `**Implementation Strategy:**\n\n`
        layoutDesc.implementationHints.forEach((hint) => {
          section += `- ${hint}\n`
        })
        section += "\n"

      } catch (error) {
        // Fallback: When Canvas coordinate information is missing (backward compatibility)
        // Only log in development environment (not production)
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Visual layout description failed for ${layoutKey}:`, error)
        }
      }

      // Structure type with dynamic descriptions
      const flowDescriptions: Record<string, string> = {
        vertical: "vertical scrolling layout",
        horizontal: "horizontal scrolling layout",
        "sidebar-main": "sidebar layout with main content area",
        "sidebar-main-sidebar": "three-column layout with left and right sidebars",
        custom: "custom layout structure"
      }
      const flowDescription = flowDescriptions[layout.structure] || layout.structure
      section += `**Page Flow:** \`${layout.structure}\` (${flowDescription})\n\n`

      // IMPORTANT: Layout Priority (shown first)
      section += `**🚨 IMPORTANT - Layout Priority:**\n\n`
      section += `1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide\n`
      section += `2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)\n`
      section += `3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally\n`
      section += `4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid\n\n`

      // Component order (DOM order) - Sorted by Canvas coordinates
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
      `### 🎯 Universal Layout Pattern (Reusable Architecture)\n\n` +
      `**This pattern works for ALL Canvas layouts - vertical, horizontal, side-by-side, or mixed:**\n\n` +
      `\`\`\`tsx\n` +
      `// Container: Grid with auto rows (Tailwind arbitrary values)\n` +
      `<div className="grid grid-cols-12 grid-rows-[repeat(8,auto)] gap-4">\n` +
      `  {/* Wrapper: Grid positioning */}\n` +
      `  <div className="col-span-full row-start-1 row-end-2">\n` +
      `    {/* Component: Border + Padding + Layout */}\n` +
      `    <header className={cn(\n` +
      `      'border-b border-gray-300 py-4 px-6',  // Styling HERE\n` +
      `      'flex items-center justify-between',   // Layout HERE\n` +
      `      'sticky top-0 z-50 bg-white'           // Positioning HERE\n` +
      `    )}>\n` +
      `      Header (c1)  {/* Content: Name + ID only */}\n` +
      `    </header>\n` +
      `  </div>\n\n` +
      `  {/* Side-by-side: Use h-full for equal heights */}\n` +
      `  <div className="col-start-1 col-end-4 row-start-2 row-end-8 h-full">\n` +
      `    <aside className={cn(\n` +
      `      'border-r border-gray-300 p-4',\n` +
      `      'flex flex-col gap-4',\n` +
      `      'h-full'  // Fill grid cell vertically\n` +
      `    )}>\n` +
      `      Sidebar (c2)\n` +
      `    </aside>\n` +
      `  </div>\n\n` +
      `  <div className="col-start-4 col-end-13 row-start-2 row-end-8 h-full">\n` +
      `    <main className={cn(\n` +
      `      'border border-gray-300 p-6',\n` +
      `      'flex flex-col gap-6',\n` +
      `      'h-full'  // Fill grid cell vertically\n` +
      `    )}>\n` +
      `      Main (c3)\n` +
      `    </main>\n` +
      `  </div>\n` +
      `</div>\n` +
      `\`\`\`\n\n` +
      `**🚨 CRITICAL RULES (Non-Negotiable):**\n\n` +
      `1. **Container MUST use arbitrary values** \`grid-rows-[repeat(N,auto)]\` for auto-sizing rows (Tailwind v3.0+)\n` +
      `2. **Wrapper div** handles grid positioning (\`col-span-*\`, \`row-start-*\`, \`row-end-*\`)\n` +
      `3. **Component tag** contains ALL styling (border, padding, layout) - NOT children div\n` +
      `4. **Side-by-side components** MUST use \`h-full\` on both wrapper AND component\n` +
      `5. **Content** is ONLY component name + ID (e.g., "Header (c1)") - NO placeholder text\n\n` +
      `---\n\n` +
      `### ♻️ Component Reusability Patterns\n\n` +
      `**Level 1: Extract Reusable GridCell Wrapper**\n\n` +
      `\`\`\`tsx\n` +
      `type GridCellProps = PropsWithChildren<{\n` +
      `  colSpan?: string\n` +
      `  rowStart?: number\n` +
      `  rowEnd?: number\n` +
      `  className?: string\n` +
      `}>\n\n` +
      `function GridCell({ colSpan = 'col-span-full', rowStart, rowEnd, className, children }: GridCellProps) {\n` +
      `  return (\n` +
      `    <div className={cn(\n` +
      `      colSpan,\n` +
      `      rowStart && \`row-start-\${rowStart}\`,\n` +
      `      rowEnd && \`row-end-\${rowEnd}\`,\n` +
      `      className\n` +
      `    )}>\n` +
      `      {children}\n` +
      `    </div>\n` +
      `  )\n` +
      `}\n\n` +
      `// Usage: Cleaner, reusable\n` +
      `<GridCell colSpan="col-span-full" rowStart={1} rowEnd={2}>\n` +
      `  <header className="border-b py-4 px-6">Header (c1)</header>\n` +
      `</GridCell>\n` +
      `\`\`\`\n\n` +
      `**Level 2: Extract GridLayout Container**\n\n` +
      `\`\`\`tsx\n` +
      `type GridLayoutProps = PropsWithChildren<{\n` +
      `  cols?: number\n` +
      `  rows?: number\n` +
      `  gap?: number\n` +
      `  className?: string\n` +
      `}>\n\n` +
      `function GridLayout({ cols = 12, rows = 8, gap = 4, className, children }: GridLayoutProps) {\n` +
      `  return (\n` +
      `    <div className={cn(\n` +
      `      'grid',\n` +
      `      \`grid-cols-\${cols}\`,\n` +
      `      \`grid-rows-[repeat(\${rows},auto)]\`,  // Auto-sizing rows\n` +
      `      \`gap-\${gap}\`,\n` +
      `      className\n` +
      `    )}>\n` +
      `      {children}\n` +
      `    </div>\n` +
      `  )\n` +
      `}\n\n` +
      `// Usage: Fully configurable\n` +
      `<GridLayout cols={12} rows={8}>\n` +
      `  <GridCell rowStart={1} rowEnd={2}>...</GridCell>\n` +
      `</GridLayout>\n` +
      `\`\`\`\n\n` +
      `**Level 3: Composition Pattern (Compound Components)**\n\n` +
      `\`\`\`tsx\n` +
      `// Compound component pattern for complex layouts\n` +
      `function PageLayout({ children }: PropsWithChildren) {\n` +
      `  return (\n` +
      `    <GridLayout cols={12} rows={8}>\n` +
      `      {children}\n` +
      `    </GridLayout>\n` +
      `  )\n` +
      `}\n\n` +
      `PageLayout.Header = ({ children }: PropsWithChildren) => (\n` +
      `  <GridCell rowStart={1} rowEnd={2}>\n` +
      `    <header className="border-b py-4 px-6 sticky top-0 z-50 bg-white">\n` +
      `      {children}\n` +
      `    </header>\n` +
      `  </GridCell>\n` +
      `)\n\n` +
      `PageLayout.Sidebar = ({ children }: PropsWithChildren) => (\n` +
      `  <GridCell colSpan="col-start-1 col-end-4" rowStart={2} rowEnd={8} className="h-full">\n` +
      `    <aside className="border-r p-4 flex flex-col gap-4 h-full">\n` +
      `      {children}\n` +
      `    </aside>\n` +
      `  </GridCell>\n` +
      `)\n\n` +
      `PageLayout.Main = ({ children }: PropsWithChildren) => (\n` +
      `  <GridCell colSpan="col-start-4 col-end-13" rowStart={2} rowEnd={8} className="h-full">\n` +
      `    <main className="border p-6 flex flex-col gap-6 h-full">\n` +
      `      {children}\n` +
      `    </main>\n` +
      `  </GridCell>\n` +
      `)\n\n` +
      `// Usage: Highly readable, composable\n` +
      `<PageLayout>\n` +
      `  <PageLayout.Header>Header (c1)</PageLayout.Header>\n` +
      `  <PageLayout.Sidebar>Sidebar (c2)</PageLayout.Sidebar>\n` +
      `  <PageLayout.Main>Main (c3)</PageLayout.Main>\n` +
      `</PageLayout>\n` +
      `\`\`\`\n\n` +
      `**🎯 Reusability Best Practices:**\n\n` +
      `1. **Start simple** (inline code), then extract when patterns emerge\n` +
      `2. **Props over duplication**: Use props for variants instead of copying components\n` +
      `3. **Composition over configuration**: Prefer compound components for complex layouts\n` +
      `4. **Type safety**: Always export TypeScript types for reusable components\n` +
      `5. **Single Responsibility**: Each component should have ONE clear purpose\n\n` +
      `---\n\n` +
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
      `**Layout Architecture (Universal Pattern):**\n` +
      `- [ ] **Grid container uses Tailwind arbitrary values** \`grid-rows-[repeat(N,auto)]\` (NOT fixed \`grid-rows-N\`)\n` +
      `- [ ] **Wrapper div** handles grid positioning only (\`col-span-*\`, \`row-start-*\`, \`row-end-*\`)\n` +
      `- [ ] **Component tag** contains ALL styling (border, padding, layout) - NOT children div\n` +
      `- [ ] **Side-by-side components** use \`h-full\` on both wrapper AND component tag\n` +
      `- [ ] Follow the 3-tier pattern: Container (grid) → Wrapper (positioning) → Component (styling)\n\n` +
      `**Component Reusability:**\n` +
      `- [ ] Extract repeated patterns into reusable components (GridCell, GridLayout)\n` +
      `- [ ] Use props for variants instead of duplicating code\n` +
      `- [ ] Consider composition patterns (compound components) for complex layouts\n` +
      `- [ ] Export TypeScript types for all reusable components\n` +
      `- [ ] Each component has a single, clear responsibility\n\n` +
      `**Styling & Borders (2025 Wireframe Standards):**\n` +
      `- [ ] **EVERY component has a border** (\`border-gray-300\`) ON THE COMPONENT TAG\n` +
      `- [ ] **Border/padding MUST be in component tag** - NOT in children div ❌\n` +
      `- [ ] Border positions follow component type (header: border-b, footer: border-t, main: border)\n` +
      `- [ ] Consistent padding (p-4 mobile, p-6 tablet, p-8 desktop)\n` +
      `- [ ] Minimal rounded corners (section: rounded-lg, article: rounded-md, div: rounded)\n` +
      `- [ ] NO backgrounds except bg-white for sticky/fixed headers\n` +
      `- [ ] NO theme colors, shadows, or decorative styling\n\n` +
      `**Content & Code Quality:**\n` +
      `- [ ] **Content: ONLY display component name + ID** (e.g., "Header (c1)")\n` +
      `- [ ] **NO placeholder content, mock data, lorem ipsum, or creative text**\n` +
      `- [ ] **NO children div with styling** - Component tag is self-contained\n` +
      `- [ ] Code is clean, readable, and well-commented\n` +
      `- [ ] Include inline \`cn()\` utility in each component (or extract to shared file)\n` +
      `- [ ] Install dependencies: \`npm install clsx tailwind-merge\`\n` +
      `- [ ] Tailwind class order: positioning → box-model → borders → backgrounds → typography\n`
  },
}

/**
 * Helper function to format positioning specification for AI prompt
 *
 * Converts ComponentPositioning object to formatted markdown text
 * describing the component's positioning strategy and CSS values.
 *
 * @param positioning - Component positioning configuration
 * @returns Formatted markdown text describing positioning (strategy, top, right, bottom, left, zIndex)
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
 * Helper function to format layout specification for AI prompt
 *
 * Converts ComponentLayout object to formatted markdown text
 * describing the component's internal layout system (flex, grid, container, or none).
 *
 * @param layout - Component layout configuration
 * @returns Formatted markdown text describing layout type and configuration
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
 * Helper function to format styling specification for AI prompt
 *
 * Converts ComponentStyling object to formatted markdown text
 * describing the component's visual styling properties (width, height, background, border, etc.).
 *
 * @param styling - Component styling configuration
 * @returns Formatted markdown text describing styling properties
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
