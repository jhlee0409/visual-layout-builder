/**
 * Comprehensive Prompt Variable Mapping Verification
 *
 * 모든 Schema 변수 조합에 대해 프롬프트 매핑을 검증
 * - 9 SemanticTag × 5 Positioning × 4 Layout = 180개 기본 조합
 * - Responsive behavior 조합
 * - Canvas layout edge cases
 * - Styling 필드 조합
 */

import { generatePrompt } from "./lib/prompt-generator"
import type { LaydlerSchema, SemanticTag, Component } from "./types/schema"

// 색상 출력 헬퍼
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
}

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

// ============================================================================
// 테스트 데이터 생성기
// ============================================================================

const allSemanticTags: SemanticTag[] = [
  "header", "nav", "main", "aside", "footer", "section", "article", "div", "form"
]

const allPositioningTypes = ["static", "fixed", "sticky", "absolute", "relative"] as const

const allLayoutTypes = ["flex", "grid", "container", "none"] as const

/**
 * 모든 SemanticTag + Positioning 조합 테스트
 */
function testSemanticTagPositioningCombinations() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 1: SemanticTag × Positioning Combinations", "cyan")
  log("=".repeat(80), "cyan")
  log(`Total combinations: ${allSemanticTags.length} × ${allPositioningTypes.length} = ${allSemanticTags.length * allPositioningTypes.length}`, "blue")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  allSemanticTags.forEach((tag) => {
    allPositioningTypes.forEach((posType) => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          {
            id: "c1",
            name: "TestComponent",
            semanticTag: tag,
            positioning: { type: posType },
            layout: { type: "none" },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 }
            }
          }
        ],
        breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
        layouts: { mobile: { structure: "vertical", components: ["c1"] } }
      }

      const result = generatePrompt(schema, "react", "tailwind")

      if (result.success && result.prompt) {
        const hasTag = result.prompt.includes(`<${tag}>`)
        const hasPositioning = result.prompt.includes(`Type: \`${posType}\``)

        if (hasTag && hasPositioning) {
          passed++
        } else {
          failed++
          failures.push(`${tag} + ${posType}: ${!hasTag ? "tag missing" : "positioning missing"}`)
        }
      } else {
        failed++
        failures.push(`${tag} + ${posType}: generation failed`)
      }
    })
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

/**
 * 모든 Layout Type + Config 조합 테스트
 */
function testLayoutTypeCombinations() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 2: Layout Type × Config Combinations", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  // Flex layouts
  const flexConfigs = [
    { direction: "row", gap: "1rem", justify: "start", items: "center" },
    { direction: "column", gap: "2rem", justify: "center", items: "stretch" },
    { direction: "row-reverse", wrap: "wrap" },
  ] as const

  flexConfigs.forEach((flexConfig, idx) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "FlexComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "flex", flex: flexConfig as any },
          responsiveCanvasLayout: { mobile: { x: 0, y: 0, width: 4, height: 1 } }
        }
      ],
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const hasLayoutType = result.prompt.includes("Type: `flex`")
      const hasDirection = flexConfig.direction ? result.prompt.includes(`Direction: \`${flexConfig.direction}\``) : true
      const hasGap = flexConfig.gap ? result.prompt.includes(`Gap: \`${flexConfig.gap}\``) : true
      const hasJustify = flexConfig.justify ? result.prompt.includes(`Justify: \`${flexConfig.justify}\``) : true
      const hasItems = flexConfig.items ? result.prompt.includes(`Items: \`${flexConfig.items}\``) : true

      if (hasLayoutType && hasDirection && hasGap && hasJustify && hasItems) {
        passed++
      } else {
        failed++
        const missing: string[] = []
        if (!hasLayoutType) missing.push("type")
        if (!hasDirection) missing.push("direction")
        if (!hasGap) missing.push("gap")
        if (!hasJustify) missing.push("justify")
        if (!hasItems) missing.push("items")
        failures.push(`Flex config ${idx}: missing ${missing.join(", ")}`)
      }
    } else {
      failed++
      failures.push(`Flex config ${idx}: generation failed`)
    }
  })

  // Grid layouts
  const gridConfigs = [
    { cols: 3, rows: 2, gap: "1rem" },
    { cols: 12, gap: "2rem", autoFlow: "dense" },
    { cols: 4, rows: 4, gap: "0.5rem" },
  ] as const

  gridConfigs.forEach((gridConfig, idx) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "GridComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "grid", grid: gridConfig as any },
          responsiveCanvasLayout: { mobile: { x: 0, y: 0, width: 4, height: 1 } }
        }
      ],
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const hasLayoutType = result.prompt.includes("Type: `grid`")
      const hasCols = gridConfig.cols ? result.prompt.includes(`Columns: \`${gridConfig.cols}\``) : true
      const hasRows = gridConfig.rows ? result.prompt.includes(`Rows: \`${gridConfig.rows}\``) : true
      const hasGap = gridConfig.gap ? result.prompt.includes(`Gap: \`${gridConfig.gap}\``) : true

      if (hasLayoutType && hasCols && hasRows && hasGap) {
        passed++
      } else {
        failed++
        const missing: string[] = []
        if (!hasLayoutType) missing.push("type")
        if (!hasCols) missing.push("cols")
        if (!hasRows) missing.push("rows")
        if (!hasGap) missing.push("gap")
        failures.push(`Grid config ${idx}: missing ${missing.join(", ")}`)
      }
    } else {
      failed++
      failures.push(`Grid config ${idx}: generation failed`)
    }
  })

  // Container layouts
  const containerConfigs = [
    { maxWidth: "1200px", padding: "1rem", centered: true },
    { maxWidth: "full", padding: "2rem 1rem", centered: false },
    { maxWidth: "md", centered: true },
  ] as const

  containerConfigs.forEach((containerConfig, idx) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "ContainerComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "container", container: containerConfig as any },
          responsiveCanvasLayout: { mobile: { x: 0, y: 0, width: 4, height: 1 } }
        }
      ],
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const hasLayoutType = result.prompt.includes("Type: `container`")
      const hasMaxWidth = containerConfig.maxWidth ? result.prompt.includes(`Max width: \`${containerConfig.maxWidth}\``) : true
      const hasPadding = containerConfig.padding ? result.prompt.includes(`Padding: \`${containerConfig.padding}\``) : true
      const hasCentered = containerConfig.centered !== undefined ? result.prompt.includes(`Centered: ${containerConfig.centered}`) : true

      if (hasLayoutType && hasMaxWidth && hasPadding && hasCentered) {
        passed++
      } else {
        failed++
        const missing: string[] = []
        if (!hasLayoutType) missing.push("type")
        if (!hasMaxWidth) missing.push("maxWidth")
        if (!hasPadding) missing.push("padding")
        if (!hasCentered) missing.push("centered")
        failures.push(`Container config ${idx}: missing ${missing.join(", ")}`)
      }
    } else {
      failed++
      failures.push(`Container config ${idx}: generation failed`)
    }
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

/**
 * Responsive Behavior 조합 테스트
 */
function testResponsiveBehaviorCombinations() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 3: Responsive Behavior Combinations", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  const responsiveCases = [
    {
      name: "Mobile hidden, Tablet visible",
      responsive: {
        mobile: { hidden: true },
        tablet: { hidden: false },
      },
      expectedMobile: "Mobile: hidden",
      expectedTablet: "Tablet (md:): visible",
    },
    {
      name: "Mobile order 1, Desktop order 3",
      responsive: {
        mobile: { order: 1 },
        desktop: { order: 3 },
      },
      expectedMobile: "Mobile: order: 1",
      expectedDesktop: "Desktop (lg:): order: 3",
    },
    {
      name: "Tablet width 50%",
      responsive: {
        tablet: { width: "50%" },
      },
      expectedTablet: "Tablet (md:): width: 50%",
    },
    {
      name: "All breakpoints with different widths",
      responsive: {
        mobile: { width: "100%" },
        tablet: { width: "50%" },
        desktop: { width: "33.333%" },
      },
      expectedMobile: "Mobile: width: 100%",
      expectedTablet: "Tablet (md:): width: 50%",
      expectedDesktop: "Desktop (lg:): width: 33.333%",
    },
  ] as const

  responsiveCases.forEach((testCase) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "ResponsiveComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "none" },
          responsive: testCase.responsive as any,
          responsiveCanvasLayout: { mobile: { x: 0, y: 0, width: 4, height: 1 } }
        }
      ],
      breakpoints: [
        { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
        { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: "vertical", components: ["c1"] },
        tablet: { structure: "vertical", components: ["c1"] },
        desktop: { structure: "vertical", components: ["c1"] },
      }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const checks: boolean[] = []
      if ("expectedMobile" in testCase) checks.push(result.prompt.includes(testCase.expectedMobile))
      if ("expectedTablet" in testCase) checks.push(result.prompt.includes(testCase.expectedTablet))
      if ("expectedDesktop" in testCase) checks.push(result.prompt.includes(testCase.expectedDesktop))

      if (checks.every(c => c)) {
        passed++
      } else {
        failed++
        failures.push(`${testCase.name}: some expectations not found`)
      }
    } else {
      failed++
      failures.push(`${testCase.name}: generation failed`)
    }
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

/**
 * Styling 필드 조합 테스트
 */
function testStylingCombinations() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 4: Styling Field Combinations", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  const stylingCases = [
    { background: "white", border: "b", shadow: "sm" },
    { background: "gray-100", border: "t", className: "custom-class" },
    { width: "100%", height: "auto", shadow: "lg" },
    { background: "blue-500", border: "2", shadow: "xl", className: "rounded-lg" },
    { width: "50vw", height: "100vh" },
  ] as const

  stylingCases.forEach((styling, idx) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "StyledComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "none" },
          styling: styling as any,
          responsiveCanvasLayout: { mobile: { x: 0, y: 0, width: 4, height: 1 } }
        }
      ],
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const checks: { field: string; passed: boolean }[] = []

      if ("background" in styling) {
        checks.push({ field: "background", passed: result.prompt.includes(`Background: \`${styling.background}\``) })
      }
      if ("border" in styling) {
        checks.push({ field: "border", passed: result.prompt.includes(`Border: \`${styling.border}\``) })
      }
      if ("shadow" in styling) {
        checks.push({ field: "shadow", passed: result.prompt.includes(`Shadow: \`${styling.shadow}\``) })
      }
      if ("className" in styling) {
        checks.push({ field: "className", passed: result.prompt.includes(`Custom classes: \`${styling.className}\``) })
      }
      if ("width" in styling) {
        checks.push({ field: "width", passed: result.prompt.includes(`Width: \`${styling.width}\``) })
      }
      if ("height" in styling) {
        checks.push({ field: "height", passed: result.prompt.includes(`Height: \`${styling.height}\``) })
      }

      if (checks.every(c => c.passed)) {
        passed++
      } else {
        failed++
        const missing = checks.filter(c => !c.passed).map(c => c.field)
        failures.push(`Styling case ${idx}: missing ${missing.join(", ")}`)
      }
    } else {
      failed++
      failures.push(`Styling case ${idx}: generation failed`)
    }
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

/**
 * Canvas Layout Edge Cases 테스트
 */
function testCanvasLayoutEdgeCases() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 5: Canvas Layout Edge Cases", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  const canvasCases = [
    {
      name: "Min size (1×1)",
      canvas: { x: 0, y: 0, width: 1, height: 1 }
    },
    {
      name: "Max mobile width (4×1)",
      canvas: { x: 0, y: 0, width: 4, height: 1 }
    },
    {
      name: "Max desktop width (12×1)",
      canvas: { x: 0, y: 0, width: 12, height: 1 }
    },
    {
      name: "Tall component (4×8)",
      canvas: { x: 0, y: 0, width: 4, height: 8 }
    },
    {
      name: "Mid-position component",
      canvas: { x: 3, y: 3, width: 6, height: 3 }
    },
  ] as const

  canvasCases.forEach((testCase) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "CanvasComponent",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "none" },
          responsiveCanvasLayout: {
            mobile: testCase.canvas
          }
        }
      ],
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 12, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      // Canvas 정보는 Visual Layout Description에 포함됨
      const hasCanvasInfo = result.prompt.includes("Visual Layout (Canvas Grid)")
      const hasGridCSS = result.prompt.includes("CSS Grid Positioning")

      if (hasCanvasInfo && hasGridCSS) {
        passed++
      } else {
        failed++
        const missing: string[] = []
        if (!hasCanvasInfo) missing.push("Canvas Grid")
        if (!hasGridCSS) missing.push("CSS Grid")
        failures.push(`${testCase.name}: missing ${missing.join(", ")}`)
      }
    } else {
      failed++
      failures.push(`${testCase.name}: generation failed`)
    }
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

/**
 * Breakpoint 조합 테스트
 */
function testBreakpointCombinations() {
  log("\n" + "=".repeat(80), "cyan")
  log("TEST 6: Breakpoint Combinations", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0
  const failures: string[] = []

  const breakpointCases = [
    {
      name: "Single breakpoint (mobile only)",
      breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
      layouts: { mobile: { structure: "vertical", components: ["c1"] } }
    },
    {
      name: "Two breakpoints (mobile + desktop)",
      breakpoints: [
        { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: "vertical", components: ["c1"] },
        desktop: { structure: "horizontal", components: ["c1"] },
      }
    },
    {
      name: "Three breakpoints (mobile + tablet + desktop)",
      breakpoints: [
        { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
        { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: "vertical", components: ["c1"] },
        tablet: { structure: "vertical", components: ["c1"] },
        desktop: { structure: "horizontal", components: ["c1"] },
      }
    },
    {
      name: "Custom breakpoint names",
      breakpoints: [
        { name: "Phone", minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: "Tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
        { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        Phone: { structure: "vertical", components: ["c1"] },
        Tablet: { structure: "vertical", components: ["c1"] },
        Desktop: { structure: "horizontal", components: ["c1"] },
      }
    },
  ] as const

  breakpointCases.forEach((testCase) => {
    const schema: LaydlerSchema = {
      schemaVersion: "2.0",
      components: [
        {
          id: "c1",
          name: "Component",
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "none" },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 }
          }
        }
      ],
      breakpoints: testCase.breakpoints as any,
      layouts: testCase.layouts as any
    }

    const result = generatePrompt(schema, "react", "tailwind")

    if (result.success && result.prompt) {
      const allBreakpointsIncluded = testCase.breakpoints.every(bp =>
        result.prompt!.includes(bp.name) &&
        result.prompt!.includes(`≥${bp.minWidth}px`)
      )

      if (allBreakpointsIncluded) {
        passed++
      } else {
        failed++
        failures.push(`${testCase.name}: some breakpoints not found`)
      }
    } else {
      failed++
      failures.push(`${testCase.name}: generation failed`)
    }
  })

  log(`\nResults: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "yellow")
  if (failures.length > 0) {
    log("\nFailures:", "red")
    failures.forEach(f => log(`  - ${f}`, "red"))
  }

  return { passed, failed, total: passed + failed }
}

// ============================================================================
// 메인 실행
// ============================================================================

log("\n" + "=".repeat(80), "magenta")
log("🔬 COMPREHENSIVE PROMPT VARIABLE MAPPING VERIFICATION", "magenta")
log("=".repeat(80), "magenta")
log("Testing ALL possible Schema variable combinations", "blue")
log("", "reset")

const results: Array<{ test: string; passed: number; failed: number; total: number }> = []

results.push({ test: "SemanticTag × Positioning", ...testSemanticTagPositioningCombinations() })
results.push({ test: "Layout Type × Config", ...testLayoutTypeCombinations() })
results.push({ test: "Responsive Behavior", ...testResponsiveBehaviorCombinations() })
results.push({ test: "Styling Fields", ...testStylingCombinations() })
results.push({ test: "Canvas Layout Edge Cases", ...testCanvasLayoutEdgeCases() })
results.push({ test: "Breakpoint Combinations", ...testBreakpointCombinations() })

// ============================================================================
// 최종 요약
// ============================================================================

log("\n" + "=".repeat(80), "magenta")
log("📊 FINAL SUMMARY", "magenta")
log("=".repeat(80), "magenta")

const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
const totalTests = results.reduce((sum, r) => sum + r.total, 0)
const overallScore = Math.round((totalPassed / totalTests) * 100)

log(`\nTotal Tests: ${totalTests}`, "blue")
log(`Passed: ${totalPassed}`, "green")
log(`Failed: ${totalFailed}`, totalFailed === 0 ? "green" : "red")
log(`Overall Score: ${overallScore}%`, overallScore === 100 ? "green" : overallScore >= 90 ? "yellow" : "red")

log("\nTest Breakdown:", "cyan")
results.forEach((r) => {
  const score = Math.round((r.passed / r.total) * 100)
  log(`  ${r.test}: ${r.passed}/${r.total} (${score}%)`, score === 100 ? "green" : "yellow")
})

log("\n" + "=".repeat(80), "magenta")
log("🎯 VERDICT", "magenta")
log("=".repeat(80), "magenta")

if (overallScore === 100) {
  log("✅ PERFECT - All variable combinations are accurately mapped!", "green")
  log("✅ Every Schema field across all combinations has correct prompt representation", "green")
  log("✅ AI will receive complete and accurate specifications for ALL cases", "green")
} else if (overallScore >= 95) {
  log("✅ EXCELLENT - Nearly all combinations work correctly", "green")
  log(`⚠️  ${totalFailed} case(s) need attention`, "yellow")
} else if (overallScore >= 85) {
  log("⚠️  GOOD - Most combinations work, but some issues exist", "yellow")
  log(`⚠️  ${totalFailed} case(s) failed`, "yellow")
  log("⚠️  Review specific test failures above", "yellow")
} else {
  log("❌ POOR - Significant mapping issues across combinations", "red")
  log(`❌ ${totalFailed}/${totalTests} cases failed`, "red")
  log("❌ Prompt generation needs improvement", "red")
}

log("\n" + "=".repeat(80), "magenta")

// Exit code
process.exit(totalFailed > 0 ? 1 : 0)
