/**
 * Schema V2 Integration Test
 *
 * Schema V2의 전체 기능을 통합 테스트
 * - 타입 정의 검증
 * - 샘플 데이터 검증
 * - 검증 로직 작동 확인
 * - 생성될 코드 예시 검증
 */

import { sampleSchemasV2 } from "../lib/sample-data-v2"
import {
  validateSchemaV2,
  formatValidationResult,
} from "../lib/schema-validation-v2"

console.log("🧪 Schema V2 Integration Test")
console.log("=" .repeat(70))
console.log()

// Test Suite 1: 샘플 스키마 검증
console.log("📦 Test Suite 1: Sample Schema Validation")
console.log("-".repeat(70))

const schemas = Object.entries(sampleSchemasV2)
let allValid = true

schemas.forEach(([name, schema]) => {
  const result = validateSchemaV2(schema)
  const status = result.valid ? "✅ PASS" : "❌ FAIL"
  console.log(`${status} ${name}`)

  if (!result.valid || result.warnings.length > 0) {
    console.log(formatValidationResult(result))
    console.log()
  }

  allValid = allValid && result.valid
})

console.log()

// Test Suite 2: 스키마 구조 검증
console.log("🏗️  Test Suite 2: Schema Structure Verification")
console.log("-".repeat(70))

schemas.forEach(([name, schema]) => {
  console.log(`\n📋 ${name}:`)

  // 1. Schema version 확인
  const versionOk = schema.schemaVersion === "2.0"
  console.log(
    `  ${versionOk ? "✅" : "❌"} Schema version: ${schema.schemaVersion}`
  )

  // 2. Components 확인
  const hasComponents = schema.components.length > 0
  console.log(
    `  ${hasComponents ? "✅" : "❌"} Components: ${schema.components.length}`
  )

  // 3. Breakpoints 확인
  const breakpointNames = schema.breakpoints.map((bp) => bp.name)
  const hasAllBreakpoints =
    breakpointNames.includes("mobile") &&
    breakpointNames.includes("tablet") &&
    breakpointNames.includes("desktop")
  console.log(
    `  ${hasAllBreakpoints ? "✅" : "❌"} Breakpoints: ${breakpointNames.join(", ")}`
  )

  // 4. Layouts 확인
  const hasAllLayouts =
    schema.layouts.mobile &&
    schema.layouts.tablet &&
    schema.layouts.desktop
  console.log(`  ${hasAllLayouts ? "✅" : "❌"} Layouts: mobile, tablet, desktop`)

  // 5. Component positioning 확인
  const positioningTypes = schema.components.map((c) => c.positioning.type)
  const hasFixedOrSticky =
    positioningTypes.includes("fixed") || positioningTypes.includes("sticky")
  console.log(
    `  ${hasFixedOrSticky ? "✅" : "❌"} Positioning variety: ${[...new Set(positioningTypes)].join(", ")}`
  )

  // 6. Layout types 확인
  const layoutTypes = schema.components.map((c) => c.layout.type)
  const hasFlexOrContainer =
    layoutTypes.includes("flex") || layoutTypes.includes("container")
  console.log(
    `  ${hasFlexOrContainer ? "✅" : "❌"} Layout types: ${[...new Set(layoutTypes)].join(", ")}`
  )
})

console.log()

// Test Suite 3: Component Independence 검증
console.log("🔗 Test Suite 3: Component Independence")
console.log("-".repeat(70))

schemas.forEach(([name, schema]) => {
  console.log(`\n📋 ${name}:`)

  schema.components.forEach((component) => {
    // 각 컴포넌트가 독립적으로 positioning, layout을 가지고 있는지 확인
    const hasPositioning = !!component.positioning
    const hasLayout = !!component.layout
    const isIndependent = hasPositioning && hasLayout

    console.log(
      `  ${isIndependent ? "✅" : "❌"} ${component.name} (${component.id}): positioning=${component.positioning.type}, layout=${component.layout.type}`
    )
  })
})

console.log()

// Test Suite 4: 실제 코드 패턴 검증
console.log("🎨 Test Suite 4: Real-World Code Pattern Verification")
console.log("-".repeat(70))

const codePatterns = {
  "Fixed Header": (schema: any) =>
    schema.components.some(
      (c: any) =>
        c.semanticTag === "header" &&
        c.positioning.type === "fixed" &&
        c.positioning.position?.top !== undefined
    ),
  "Sticky Sidebar": (schema: any) =>
    schema.components.some(
      (c: any) =>
        (c.semanticTag === "nav" || c.semanticTag === "aside") &&
        c.positioning.type === "sticky"
    ),
  "Container Layout": (schema: any) =>
    schema.components.some((c: any) => c.layout.type === "container"),
  "Flex Layout": (schema: any) =>
    schema.components.some((c: any) => c.layout.type === "flex"),
  "Responsive Behavior": (schema: any) =>
    schema.components.some((c: any) => c.responsive !== undefined),
  "Static Footer": (schema: any) =>
    schema.components.some(
      (c: any) =>
        c.semanticTag === "footer" && c.positioning.type === "static"
    ),
}

schemas.forEach(([name, schema]) => {
  console.log(`\n📋 ${name}:`)

  Object.entries(codePatterns).forEach(([patternName, checkFn]) => {
    const hasPattern = checkFn(schema)
    console.log(`  ${hasPattern ? "✅" : "⚪"} ${patternName}`)
  })
})

console.log()

// Test Suite 5: 반응형 동작 검증
console.log("📱 Test Suite 5: Responsive Behavior")
console.log("-".repeat(70))

schemas.forEach(([name, schema]) => {
  console.log(`\n📋 ${name}:`)

  const responsiveComponents = schema.components.filter(
    (c) => c.responsive !== undefined
  )

  if (responsiveComponents.length > 0) {
    responsiveComponents.forEach((c) => {
      const behaviors = []
      if (c.responsive?.mobile?.hidden) behaviors.push("mobile: hidden")
      if (c.responsive?.tablet?.hidden) behaviors.push("tablet: hidden")
      if (c.responsive?.desktop?.hidden === false)
        behaviors.push("desktop: visible")

      console.log(`  ✅ ${c.name}: ${behaviors.join(", ")}`)
    })
  } else {
    console.log(`  ⚪ No responsive components`)
  }
})

console.log()

// Final Summary
console.log("=" .repeat(70))
console.log("📊 Test Summary")
console.log("-".repeat(70))
console.log(`Total Schemas Tested: ${schemas.length}`)
console.log(`All Validations Passed: ${allValid ? "✅ YES" : "❌ NO"}`)
console.log()

if (allValid) {
  console.log("🎉 All integration tests passed!")
  console.log("✅ Schema V2 is ready for implementation")
  console.log()
  console.log("Next Steps:")
  console.log("  1. P0-2: Component Independence Strategy")
  console.log("  2. P0-3: Prompt Generation Logic Rewrite")
  console.log("  3. P1: Implementation & Testing")
} else {
  console.log("❌ Some tests failed. Please review the results above.")
  process.exit(1)
}

console.log()
console.log("=" .repeat(70))
