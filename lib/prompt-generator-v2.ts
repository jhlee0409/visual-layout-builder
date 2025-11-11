/**
 * Prompt Generator V2
 *
 * Schema V2를 AI가 이해할 수 있는 프롬프트로 변환
 */

import type { LaydlerSchemaV2, GenerationPackageV2 } from "@/types/schema-v2"
import { generateComponentCode } from "./code-generator-v2"

/**
 * Schema V2를 AI 프롬프트로 변환
 *
 * AI가 생성해야 할 코드의 명확한 예시를 포함
 */
export function generatePromptFromSchemaV2(
  pkg: GenerationPackageV2
): string {
  const { schema, options } = pkg
  const { framework, cssSolution } = options

  const sections: string[] = []

  // 1. 헤더
  sections.push(`# Layout Code Generation Request

Generate a responsive layout using ${framework.toUpperCase()} and ${cssSolution.toUpperCase()}.

## Requirements

- Framework: ${framework}
- CSS Solution: ${cssSolution}
${options.typescript ? "- TypeScript: Yes" : ""}
- Schema Version: ${schema.schemaVersion}`)

  // 2. Components 목록
  sections.push(`\n## Components (${schema.components.length})

${schema.components.map((c, i) => `${i + 1}. **${c.name}** (\`<${c.semanticTag}>\`)
   - Positioning: ${c.positioning.type}${c.positioning.position ? ` (${Object.entries(c.positioning.position).map(([k, v]) => `${k}: ${v}`).join(", ")})` : ""}
   - Layout: ${c.layout.type}
   - Responsive: ${c.responsive ? "Yes" : "No"}`).join("\n")}`)

  // 3. Breakpoints
  sections.push(`\n## Breakpoints

${schema.breakpoints.map((bp) => `- **${bp.name}**: ${bp.minWidth}px+`).join("\n")}`)

  // 4. Layout Structure
  const desktopLayout = schema.layouts.desktop
  sections.push(`\n## Layout Structure

Structure Type: **${desktopLayout.structure}**

Component Order:
${desktopLayout.components.map((id, i) => {
    const comp = schema.components.find((c) => c.id === id)
    return `${i + 1}. ${comp?.name || id} (${id})`
  }).join("\n")}

${desktopLayout.roles ? `\nRoles:
${Object.entries(desktopLayout.roles).map(([role, id]) => `- ${role}: ${id}`).join("\n")}` : ""}`)

  // 5. 생성될 코드 예시
  sections.push(`\n## Expected Code Structure

### Component Files

${schema.components.map((component) => {
    const code = generateComponentCode(component, framework as "react", cssSolution as "tailwind")
    return `#### \`components/${component.name}.tsx\`

\`\`\`tsx
${code}
\`\`\``
  }).join("\n\n")}`)

  // 6. Layout 조합 예시
  const layoutExample = generateLayoutExample(schema, framework as "react")
  sections.push(`\n### Layout Composition

#### \`app/page.tsx\` or \`app/layout.tsx\`

\`\`\`tsx
${layoutExample}
\`\`\``)

  // 7. Responsive Behavior 설명
  const responsiveComponents = schema.components.filter((c) => c.responsive)
  if (responsiveComponents.length > 0) {
    sections.push(`\n## Responsive Behavior

${responsiveComponents.map((c) => {
      const behaviors: string[] = []
      if (c.responsive?.mobile?.hidden) behaviors.push("Hidden on mobile")
      if (c.responsive?.tablet?.hidden) behaviors.push("Hidden on tablet")
      if (c.responsive?.desktop?.hidden === false) behaviors.push("Visible on desktop")
      return `- **${c.name}**: ${behaviors.join(", ")}`
    }).join("\n")}`)
  }

  // 8. 추가 요구사항
  sections.push(`\n## Additional Requirements

1. **Component Independence**: Each component should be self-contained with its own positioning, layout, and styling.
2. **Semantic HTML**: Use appropriate HTML5 semantic tags (\`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`, etc.).
3. **Flexbox First**: Use Flexbox for page structure, Grid only for card layouts.
4. **Tailwind Classes**: Use Tailwind utility classes for all styling.
5. **Responsive Design**: Follow mobile-first approach with responsive modifiers (\`md:\`, \`lg:\`).
6. **Clean Code**: Generate production-ready, clean, and maintainable code.

## Output Format

Please generate:
1. Individual component files (\`components/[ComponentName].tsx\`)
2. Main layout file (\`app/page.tsx\` or \`app/layout.tsx\`)
3. All components should be properly typed with TypeScript
4. Use React functional components with proper props typing`)

  return sections.join("\n")
}

/**
 * Layout 조합 예시 생성
 */
function generateLayoutExample(
  schema: LaydlerSchemaV2,
  framework: "react" | "vue"
): string {
  if (framework !== "react") {
    throw new Error("Currently only React is supported")
  }

  const desktopLayout = schema.layouts.desktop
  const structure = desktopLayout.structure

  // Component imports
  const imports = schema.components
    .map((c) => `import { ${c.name} } from "@/components/${c.name}"`)
    .join("\n")

  let layoutCode = ""

  switch (structure) {
    case "vertical":
      // 수직 배치: Header → Main → Footer
      layoutCode = `export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
${desktopLayout.components.map((id) => {
        const comp = schema.components.find((c) => c.id === id)
        return `      <${comp?.name} />`
      }).join("\n")}
    </div>
  )
}`
      break

    case "sidebar-main":
      // Sidebar + Main 구조
      const header = desktopLayout.roles?.header
      const sidebar = desktopLayout.roles?.sidebar
      const main = desktopLayout.roles?.main

      const headerComp = header
        ? schema.components.find((c) => c.id === header)
        : null
      const sidebarComp = sidebar
        ? schema.components.find((c) => c.id === sidebar)
        : null
      const mainComp = main
        ? schema.components.find((c) => c.id === main)
        : null

      layoutCode = `export default function Layout() {
  return (
    <>
${headerComp ? `      <${headerComp.name} />` : ""}
      <div className="flex${headerComp?.positioning.type === "fixed" ? " pt-16" : ""}">
${sidebarComp ? `        <${sidebarComp.name} />` : ""}
${mainComp ? `        <${mainComp.name}>` : ""}
          {/* Page content goes here */}
${mainComp ? `        </${mainComp.name}>` : ""}
      </div>
    </>
  )
}`
      break

    case "horizontal":
      // 수평 배치
      layoutCode = `export default function Layout() {
  return (
    <div className="flex">
${desktopLayout.components.map((id) => {
        const comp = schema.components.find((c) => c.id === id)
        return `      <${comp?.name} />`
      }).join("\n")}
    </div>
  )
}`
      break

    default:
      // Custom structure
      layoutCode = `export default function Layout() {
  return (
    <>
${desktopLayout.components.map((id) => {
        const comp = schema.components.find((c) => c.id === id)
        return `      <${comp?.name} />`
      }).join("\n")}
    </>
  )
}`
  }

  return `${imports}

${layoutCode}`
}

/**
 * 간단한 프롬프트 생성 (디버깅용)
 */
export function generateSimplePrompt(schema: LaydlerSchemaV2): string {
  return `Generate a ${schema.layouts.desktop.structure} layout with:
${schema.components.map((c) => `- ${c.name} (${c.semanticTag}): ${c.positioning.type} positioning`).join("\n")}

Use React + Tailwind CSS.`
}
