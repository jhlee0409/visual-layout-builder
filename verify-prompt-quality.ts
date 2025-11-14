/**
 * Verify Prompt Quality
 *
 * 실제 8개 컴포넌트 Schema로 프롬프트 생성하고 품질 검증
 */

import { generatePrompt } from "./lib/prompt-generator"
import type { LaydlerSchema } from "./types/schema"

// 사용자가 제공한 실제 8개 컴포넌트 Schema
const userSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      styling: { background: "white", border: "b", shadow: "sm" },
      props: { children: "Header Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
        tablet: { x: 0, y: 0, width: 4, height: 1 },
        desktop: { x: 0, y: 0, width: 4, height: 1 }
      }
    },
    {
      id: "c2",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      styling: { background: "white", border: "b", shadow: "sm" },
      props: { children: "Header Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 0, width: 12, height: 1 }
      }
    },
    {
      id: "c3",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
      styling: { background: "gray-100", border: "t" },
      props: { children: "Footer Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 7, width: 12, height: 1 }
      }
    },
    {
      id: "c4",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 1, width: 6, height: 6 }
      }
    },
    {
      id: "c5",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 6, y: 1, width: 6, height: 6 }
      }
    },
    {
      id: "c6",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
      styling: { background: "gray-100", border: "t" },
      props: { children: "Footer Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 7, width: 4, height: 1 },
        tablet: { x: 0, y: 7, width: 4, height: 1 },
        desktop: { x: 0, y: 7, width: 4, height: 1 }
      }
    },
    {
      id: "c7",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 1, width: 4, height: 3 },
        tablet: { x: 0, y: 1, width: 1, height: 1 },
        desktop: { x: 0, y: 1, width: 1, height: 1 }
      }
    },
    {
      id: "c8",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 4, width: 4, height: 3 },
        tablet: { x: 0, y: 4, width: 1, height: 1 },
        desktop: { x: 0, y: 4, width: 1, height: 1 }
      }
    }
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
  ],
  layouts: {
    mobile: { structure: "vertical", components: ["c1", "c7", "c8", "c6"] },
    Desktop: { structure: "vertical", components: ["c2", "c4", "c5", "c3"] },
    tablet: { structure: "vertical", components: ["c1"] },
    desktop: { structure: "vertical", components: ["c1"] }
  }
}

// Component Links (사용자가 수동으로 연결한 정보)
const componentLinks = [
  { source: "c1", target: "c2" }, // Header
  { source: "c7", target: "c4" }, // Section Left
  { source: "c8", target: "c5" }, // Section Right
  { source: "c6", target: "c3" }, // Footer
]

console.log("🧪 Prompt Quality Verification\n")
console.log("=" .repeat(80))

// 1. Schema 정보 출력
console.log("\n📋 INPUT - Schema Information:")
console.log("-".repeat(80))
console.log(`Total Components: ${userSchema.components.length}`)
console.log(`Breakpoints: ${userSchema.breakpoints.map(bp => bp.name).join(", ")}`)
console.log(`Component Links: ${componentLinks.length} groups`)

userSchema.components.forEach(comp => {
  const canvasLayouts = Object.keys(comp.responsiveCanvasLayout || {})
  console.log(`  - ${comp.id}: ${comp.name} (${comp.semanticTag}) → Canvas: ${canvasLayouts.join(", ")}`)
})

// 2. Prompt 생성
console.log("\n⚙️  Generating Prompt...")
const result = generatePrompt(userSchema, "react", "tailwind", componentLinks)

if (!result.success) {
  console.error("❌ Prompt generation failed:", result.errors)
  process.exit(1)
}

const prompt = result.prompt!

// 3. Prompt 품질 검증
console.log("\n✅ Prompt Generated Successfully!")
console.log("-".repeat(80))

// 3-1. Component Links 섹션 검증
console.log("\n📊 Validation 1: Component Links Enforcement")
const hasCriticalRule = prompt.includes("CRITICAL IMPLEMENTATION RULE")
const hasMustBeTreated = prompt.includes("MUST be treated as the SAME component")
const hasCorrectExample = prompt.includes("Example (CORRECT)")
const hasWrongExample = prompt.includes("Example (WRONG")
const hasValidationRule = prompt.includes("Each link group = 1 React component")

console.log(`  ✓ Has CRITICAL RULE: ${hasCriticalRule ? "✅" : "❌"}`)
console.log(`  ✓ Has MUST BE TREATED: ${hasMustBeTreated ? "✅" : "❌"}`)
console.log(`  ✓ Has CORRECT example: ${hasCorrectExample ? "✅" : "❌"}`)
console.log(`  ✓ Has WRONG example: ${hasWrongExample ? "✅" : "❌"}`)
console.log(`  ✓ Has Validation Rule: ${hasValidationRule ? "✅" : "❌"}`)

// 3-2. Component 정보 명확성
console.log("\n📊 Validation 2: Component Information Clarity")
const hasAllComponents = userSchema.components.every(comp =>
  prompt.includes(comp.id) && prompt.includes(comp.name)
)
console.log(`  ✓ All component IDs present: ${hasAllComponents ? "✅" : "❌"}`)

const hasPositioningInfo = prompt.includes("sticky") && prompt.includes("static")
console.log(`  ✓ Positioning info present: ${hasPositioningInfo ? "✅" : "❌"}`)

const hasLayoutInfo = prompt.includes("flex") && prompt.includes("container")
console.log(`  ✓ Layout info present: ${hasLayoutInfo ? "✅" : "❌"}`)

// 3-3. Breakpoint 정보 명확성
console.log("\n📊 Validation 3: Breakpoint Information")
const hasAllBreakpoints = userSchema.breakpoints.every(bp =>
  prompt.includes(bp.name)
)
console.log(`  ✓ All breakpoints present: ${hasAllBreakpoints ? "✅" : "❌"}`)

// 3-4. Canvas Grid 정보
console.log("\n📊 Validation 4: Canvas Grid Visual Layout")
const hasVisualLayout = prompt.includes("Visual Layout (Canvas Grid)")
const hasGridPositioning = prompt.includes("grid-area") || prompt.includes("CSS Grid Positioning")
const hasSideBySide = prompt.includes("side-by-side") || prompt.includes("SIDE-BY-SIDE")

console.log(`  ✓ Has Visual Layout section: ${hasVisualLayout ? "✅" : "❌"}`)
console.log(`  ✓ Has Grid positioning: ${hasGridPositioning ? "✅" : "❌"}`)
console.log(`  ✓ Describes side-by-side: ${hasSideBySide ? "✅" : "❌"}`)

// 3-5. Implementation Strategy
console.log("\n📊 Validation 5: Implementation Strategy")
const hasImplementationStrategy = prompt.includes("Implementation Strategy")
const warnsAboutFlexbox = prompt.includes("CSS Grid") && prompt.includes("not simple flexbox")

console.log(`  ✓ Has Implementation Strategy: ${hasImplementationStrategy ? "✅" : "❌"}`)
console.log(`  ✓ Warns about Grid vs Flexbox: ${warnsAboutFlexbox ? "✅" : "❌"}`)

// 4. 전체 점수
console.log("\n" + "=".repeat(80))
console.log("📊 OVERALL QUALITY SCORE")
console.log("=".repeat(80))

const checks = [
  hasCriticalRule,
  hasMustBeTreated,
  hasCorrectExample,
  hasWrongExample,
  hasValidationRule,
  hasAllComponents,
  hasPositioningInfo,
  hasLayoutInfo,
  hasAllBreakpoints,
  hasVisualLayout,
  hasGridPositioning,
  hasSideBySide,
  hasImplementationStrategy,
  warnsAboutFlexbox,
]

const passedChecks = checks.filter(Boolean).length
const totalChecks = checks.length
const scorePercentage = Math.round((passedChecks / totalChecks) * 100)

console.log(`\nPassed: ${passedChecks}/${totalChecks} checks (${scorePercentage}%)`)

if (scorePercentage >= 90) {
  console.log("✅ EXCELLENT - Prompt quality is very high")
} else if (scorePercentage >= 70) {
  console.log("⚠️  GOOD - Prompt quality is acceptable but can be improved")
} else {
  console.log("❌ POOR - Prompt quality needs significant improvement")
}

// 5. 프롬프트 샘플 출력 (Component Links 섹션)
console.log("\n" + "=".repeat(80))
console.log("📄 PROMPT SAMPLE - Component Links Section")
console.log("=".repeat(80))

const linksStartIndex = prompt.indexOf("## Component Links")
const linksEndIndex = prompt.indexOf("---", linksStartIndex)
if (linksStartIndex !== -1 && linksEndIndex !== -1) {
  const linksSection = prompt.substring(linksStartIndex, linksEndIndex)
  console.log(linksSection)
} else {
  console.log("❌ Component Links section not found!")
}

// 6. 프롬프트 길이 정보
console.log("\n" + "=".repeat(80))
console.log("📏 PROMPT SIZE METRICS")
console.log("=".repeat(80))
console.log(`Total length: ${prompt.length} characters`)
console.log(`Estimated tokens: ${Math.round(prompt.length / 4)} tokens (rough estimate)`)
console.log(`Lines: ${prompt.split('\n').length}`)

// 7. 최종 판정
console.log("\n" + "=".repeat(80))
console.log("🎯 FINAL VERDICT")
console.log("=".repeat(80))

if (passedChecks === totalChecks) {
  console.log("✅ All quality checks passed!")
  console.log("✅ This prompt should generate single DOM structure correctly.")
  console.log("✅ Component Links are enforced as CRITICAL rules.")
  console.log("✅ Visual layout information is clear and detailed.")
} else {
  console.log(`⚠️  ${totalChecks - passedChecks} check(s) failed.`)
  console.log("Review the prompt generation logic.")
}

console.log("\n" + "=".repeat(80))
