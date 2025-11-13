/**
 * Prompt Generation Validation Script
 *
 * 각 샘플 스키마에 대해 프롬프트를 생성하고 검증합니다.
 */

import { generatePrompt, generateSchemaSummary, estimateTokenCount, getRecommendedModel } from "../lib/prompt-generator"
import { sampleSchemas } from "../lib/sample-data"
import type { LaydlerSchema } from "../types/schema"

/**
 * 프롬프트 내용 검증
 */
interface ValidationCheck {
  name: string
  passed: boolean
  details: string
}

function validatePromptContent(
  schema: LaydlerSchema,
  prompt: string
): ValidationCheck[] {
  const checks: ValidationCheck[] = []

  // 1. 모든 컴포넌트가 프롬프트에 포함되는지 확인
  schema.components.forEach((comp) => {
    const included = prompt.includes(comp.name) && prompt.includes(comp.id)
    checks.push({
      name: `Component ${comp.name} (${comp.id}) included`,
      passed: included,
      details: included ? "Found in prompt" : "NOT FOUND in prompt",
    })
  })

  // 2. Positioning 정보가 포함되는지 확인
  schema.components.forEach((comp) => {
    const positioningIncluded = prompt.includes(`Positioning:`) &&
                                 prompt.includes(`Type: \`${comp.positioning.type}\``)
    checks.push({
      name: `${comp.name} positioning (${comp.positioning.type})`,
      passed: positioningIncluded,
      details: positioningIncluded
        ? `Positioning type "${comp.positioning.type}" found`
        : `Positioning type "${comp.positioning.type}" NOT FOUND`,
    })

    // fixed/sticky/absolute의 경우 position 값 확인
    if (comp.positioning.position && ["fixed", "sticky", "absolute"].includes(comp.positioning.type)) {
      const { top, left, right, bottom } = comp.positioning.position
      const hasPositionValues =
        (top !== undefined && prompt.includes(`top: ${top}`)) ||
        (left !== undefined && prompt.includes(`left: ${left}`)) ||
        (right !== undefined && prompt.includes(`right: ${right}`)) ||
        (bottom !== undefined && prompt.includes(`bottom: ${bottom}`))

      checks.push({
        name: `${comp.name} position values`,
        passed: hasPositionValues,
        details: hasPositionValues
          ? "Position values found"
          : "Position values NOT FOUND",
      })
    }
  })

  // 3. Layout 정보가 포함되는지 확인
  schema.components.forEach((comp) => {
    const layoutIncluded = prompt.includes(`Layout:`) &&
                           prompt.includes(`Type: \`${comp.layout.type}\``)
    checks.push({
      name: `${comp.name} layout (${comp.layout.type})`,
      passed: layoutIncluded,
      details: layoutIncluded
        ? `Layout type "${comp.layout.type}" found`
        : `Layout type "${comp.layout.type}" NOT FOUND`,
    })

    // Flex layout의 경우 flex 설정 확인
    if (comp.layout.type === "flex" && comp.layout.flex) {
      const { direction, justify, items } = comp.layout.flex
      const hasFlexConfig =
        (direction && prompt.includes(`Direction: \`${direction}\``)) ||
        (justify && prompt.includes(`Justify: \`${justify}\``)) ||
        (items && prompt.includes(`Items: \`${items}\``))

      checks.push({
        name: `${comp.name} flex configuration`,
        passed: !!hasFlexConfig,
        details: hasFlexConfig
          ? "Flex configuration found"
          : "Flex configuration NOT FOUND",
      })
    }

    // Grid layout의 경우 grid 설정 확인
    if (comp.layout.type === "grid" && comp.layout.grid) {
      const { cols, rows, gap } = comp.layout.grid
      const hasGridConfig =
        (cols && prompt.includes(`Columns: \`${cols}\``)) ||
        (rows && prompt.includes(`Rows: \`${rows}\``)) ||
        (gap && prompt.includes(`Gap: \`${gap}\``))

      checks.push({
        name: `${comp.name} grid configuration`,
        passed: !!hasGridConfig,
        details: hasGridConfig
          ? "Grid configuration found"
          : "Grid configuration NOT FOUND",
      })
    }

    // Container layout의 경우 container 설정 확인
    if (comp.layout.type === "container" && comp.layout.container) {
      const { maxWidth, padding } = comp.layout.container
      const hasContainerConfig =
        (maxWidth && prompt.includes(`Max width: \`${maxWidth}\``)) ||
        (padding && prompt.includes(`Padding: \`${padding}\``))

      checks.push({
        name: `${comp.name} container configuration`,
        passed: !!hasContainerConfig,
        details: hasContainerConfig
          ? "Container configuration found"
          : "Container configuration NOT FOUND",
      })
    }
  })

  // 4. Styling 정보가 포함되는지 확인
  schema.components.forEach((comp) => {
    if (comp.styling) {
      const { width, height, background, border, shadow, className } = comp.styling
      const hasStyling =
        (width && prompt.includes(`Width: \`${width}\``)) ||
        (height && prompt.includes(`Height: \`${height}\``)) ||
        (background && prompt.includes(`Background: \`${background}\``)) ||
        (border && prompt.includes(`Border: \`${border}\``)) ||
        (shadow && prompt.includes(`Shadow: \`${shadow}\``)) ||
        (className && prompt.includes(`Custom classes: \`${className}\``))

      checks.push({
        name: `${comp.name} styling`,
        passed: !!hasStyling,
        details: hasStyling
          ? "Styling information found"
          : "Styling information NOT FOUND",
      })
    }
  })

  // 5. Responsive 동작이 포함되는지 확인
  schema.components.forEach((comp) => {
    if (comp.responsive) {
      const responsiveIncluded = prompt.includes(`Responsive Behavior:`)
      checks.push({
        name: `${comp.name} responsive behavior`,
        passed: responsiveIncluded,
        details: responsiveIncluded
          ? "Responsive behavior found"
          : "Responsive behavior NOT FOUND",
      })

      // hidden 속성 확인
      if (comp.responsive.mobile?.hidden !== undefined) {
        const hiddenMentioned = prompt.includes("hidden") || prompt.includes("visible")
        checks.push({
          name: `${comp.name} mobile visibility`,
          passed: hiddenMentioned,
          details: hiddenMentioned
            ? "Mobile visibility mentioned"
            : "Mobile visibility NOT MENTIONED",
        })
      }
    }
  })

  // 6. Breakpoint별 layout structure가 포함되는지 확인
  schema.breakpoints.forEach((bp) => {
    const layout = schema.layouts[bp.name]
    if (layout) {
      const structureIncluded = prompt.includes(`Layout Structure: \`${layout.structure}\``)
      checks.push({
        name: `${bp.name} layout structure (${layout.structure})`,
        passed: structureIncluded,
        details: structureIncluded
          ? `Structure "${layout.structure}" found`
          : `Structure "${layout.structure}" NOT FOUND`,
      })

      // Component order 확인
      const orderIncluded = prompt.includes(`Component Order:`)
      checks.push({
        name: `${bp.name} component order`,
        passed: orderIncluded,
        details: orderIncluded
          ? "Component order section found"
          : "Component order section NOT FOUND",
      })
    }
  })

  // 7. Implementation guidance 확인
  const hasImplementationGuidance = prompt.includes(`Implementation Instructions`)
  checks.push({
    name: "Implementation guidance",
    passed: hasImplementationGuidance,
    details: hasImplementationGuidance
      ? "Implementation instructions found"
      : "Implementation instructions NOT FOUND",
  })

  // 8. Full Schema JSON 확인
  const hasFullSchemaJSON = prompt.includes(`## Full Schema (JSON)`) &&
                            prompt.includes(`"schemaVersion": "2.0"`)
  checks.push({
    name: "Full Schema JSON",
    passed: hasFullSchemaJSON,
    details: hasFullSchemaJSON
      ? "Full Schema JSON included"
      : "Full Schema JSON NOT INCLUDED",
  })

  return checks
}

/**
 * 샘플 스키마 테스트
 */
function testSampleSchema(name: string, schema: LaydlerSchema) {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`Testing: ${name}`)
  console.log("=".repeat(80))

  // Schema summary
  const summary = generateSchemaSummary(schema)
  console.log(`\n📊 Schema Summary:`)
  console.log(summary)

  // Generate prompt
  const result = generatePrompt(schema, "react", "tailwind")

  if (!result.success) {
    console.log(`\n❌ Prompt generation FAILED`)
    console.log(`\nErrors:`)
    result.errors?.forEach((error) => console.log(`  - ${error}`))
    return
  }

  console.log(`\n✅ Prompt generation SUCCEEDED`)

  // Token estimation
  const tokenCount = estimateTokenCount(result.prompt!)
  const recommendedModel = getRecommendedModel(tokenCount)
  console.log(`\n📏 Token Count: ~${tokenCount} tokens`)
  console.log(`💡 Recommended Model: ${recommendedModel}`)

  // Warnings
  if (result.warnings && result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`)
    result.warnings.forEach((warning) => console.log(`  - ${warning}`))
  }

  // Validate prompt content
  console.log(`\n🔍 Validating Prompt Content:`)
  const checks = validatePromptContent(schema, result.prompt!)

  const passedChecks = checks.filter((c) => c.passed)
  const failedChecks = checks.filter((c) => !c.passed)

  console.log(`\n✅ Passed: ${passedChecks.length}/${checks.length}`)
  console.log(`❌ Failed: ${failedChecks.length}/${checks.length}`)

  if (failedChecks.length > 0) {
    console.log(`\n❌ Failed Checks:`)
    failedChecks.forEach((check) => {
      console.log(`  - ${check.name}: ${check.details}`)
    })
  }

  // Show first 500 characters of prompt
  console.log(`\n📝 Prompt Preview (first 500 chars):`)
  console.log(result.prompt!.substring(0, 500) + "...")

  return {
    name,
    success: result.success,
    tokenCount,
    passedChecks: passedChecks.length,
    totalChecks: checks.length,
    failedChecks,
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   Prompt Generation Validation Test                        ║
╚════════════════════════════════════════════════════════════════════════════╝
`)

  const results = [
    testSampleSchema("GitHub Style", sampleSchemas.github),
    testSampleSchema("Dashboard", sampleSchemas.dashboard),
    testSampleSchema("Marketing Site", sampleSchemas.marketing),
    testSampleSchema("Card Gallery", sampleSchemas.cardGallery),
  ]

  // Summary
  console.log(`\n${"=".repeat(80)}`)
  console.log(`SUMMARY`)
  console.log("=".repeat(80))

  results.forEach((result) => {
    if (!result) return
    const percentage = ((result.passedChecks / result.totalChecks) * 100).toFixed(1)
    const status = result.passedChecks === result.totalChecks ? "✅" : "⚠️ "
    console.log(`${status} ${result.name}: ${result.passedChecks}/${result.totalChecks} checks passed (${percentage}%) | ~${result.tokenCount} tokens`)
  })

  // Overall status
  const allPassed = results.every((r) => r && r.passedChecks === r.totalChecks)
  console.log(`\n${"=".repeat(80)}`)
  if (allPassed) {
    console.log(`✅ ALL TESTS PASSED - Prompt generation is working correctly!`)
  } else {
    console.log(`⚠️  SOME TESTS FAILED - Review failed checks above`)
  }
  console.log("=".repeat(80))
}

main()
