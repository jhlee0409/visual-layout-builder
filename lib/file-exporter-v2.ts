/**
 * File Exporter V2
 *
 * Schema V2를 실제 파일로 export
 */

import type { GenerationPackageV2 } from "@/types/schema-v2"
import { generateComponentCode } from "./code-generator-v2"

export interface ExportedFile {
  path: string
  content: string
}

export interface ExportOptions {
  framework: "react" | "vue" | "svelte"
  cssSolution: "tailwind" | "css-modules" | "styled-components"
  includeTypes?: boolean
  includeComments?: boolean
}

/**
 * Schema V2를 파일 배열로 export
 *
 * @example
 * const files = exportToFiles(pkg)
 * // [
 * //   { path: "components/Header.tsx", content: "..." },
 * //   { path: "components/Sidebar.tsx", content: "..." },
 * //   { path: "app/page.tsx", content: "..." },
 * // ]
 */
export function exportToFiles(pkg: GenerationPackageV2): ExportedFile[] {
  const { schema, options } = pkg
  const files: ExportedFile[] = []

  // 1. Component 파일들
  schema.components.forEach((component) => {
    const code = generateComponentCode(
      component,
      options.framework as "react",
      options.cssSolution as "tailwind"
    )

    files.push({
      path: `components/${component.name}.tsx`,
      content: code,
    })
  })

  // 2. Layout 파일
  const layoutCode = generateLayoutFile(pkg)
  files.push({
    path: "app/page.tsx",
    content: layoutCode,
  })

  // 3. Schema JSON 파일 (optional, for reference)
  files.push({
    path: "schema.json",
    content: JSON.stringify(schema, null, 2),
  })

  return files
}

/**
 * Layout composition 파일 생성
 */
function generateLayoutFile(pkg: GenerationPackageV2): string {
  const { schema, options } = pkg
  const desktopLayout = schema.layouts.desktop
  const structure = desktopLayout.structure

  // Imports
  const imports = schema.components
    .map((c) => `import { ${c.name} } from "@/components/${c.name}"`)
    .join("\n")

  let layoutCode = ""

  switch (structure) {
    case "vertical":
      // Vertical stack: Header → Main → Footer
      layoutCode = `export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
${desktopLayout.components
        .map((id) => {
          const comp = schema.components.find((c) => c.id === id)
          return `      <${comp?.name} />`
        })
        .join("\n")}
    </div>
  )
}`
      break

    case "sidebar-main":
      // Sidebar + Main structure
      const header = desktopLayout.roles?.header
      const sidebar = desktopLayout.roles?.sidebar
      const main = desktopLayout.roles?.main

      const headerComp = header
        ? schema.components.find((c) => c.id === header)
        : null
      const sidebarComp = sidebar
        ? schema.components.find((c) => c.id === sidebar)
        : null
      const mainComp = main ? schema.components.find((c) => c.id === main) : null

      layoutCode = `export default function Page() {
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
      // Horizontal layout
      layoutCode = `export default function Page() {
  return (
    <div className="flex">
${desktopLayout.components
        .map((id) => {
          const comp = schema.components.find((c) => c.id === id)
          return `      <${comp?.name} />`
        })
        .join("\n")}
    </div>
  )
}`
      break

    default:
      // Custom structure
      layoutCode = `export default function Page() {
  return (
    <>
${desktopLayout.components
        .map((id) => {
          const comp = schema.components.find((c) => c.id === id)
          return `      <${comp?.name} />`
        })
        .join("\n")}
    </>
  )
}`
  }

  return `${imports}

${layoutCode}
`
}

/**
 * ZIP 파일로 export (브라우저)
 *
 * 브라우저에서 JSZip을 사용하여 ZIP 파일 생성
 * 이 함수는 클라이언트 사이드에서만 동작
 */
export async function exportToZip(
  pkg: GenerationPackageV2,
  filename: string = "laylder-export.zip"
): Promise<void> {
  const files = exportToFiles(pkg)

  // Dynamic import JSZip (client-side only)
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  // Add files to ZIP
  files.forEach((file) => {
    zip.file(file.path, file.content)
  })

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" })

  // Trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 개별 파일 다운로드 (브라우저)
 */
export function downloadFile(file: ExportedFile): void {
  const blob = new Blob([file.content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = file.path.replace(/\//g, "-") // components/Header.tsx → components-Header.tsx
  link.click()
  URL.revokeObjectURL(url)
}
