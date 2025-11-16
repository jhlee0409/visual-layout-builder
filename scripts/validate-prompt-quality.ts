/**
 * Prompt Quality Validation Script
 *
 * 생성된 프롬프트가 Best Practice를 잘 전달하는지 검증하는 스크립트
 */

import { githubStyleSchema, dashboardSchema, marketingSiteSchema } from "../lib/sample-data"
import { generatePrompt } from "../lib/prompt-generator"
import { validatePromptQuality } from "../lib/prompt-bp-validator"

console.log("=".repeat(80))
console.log("Prompt Quality Validation")
console.log("=".repeat(80))
console.log()

const schemas = [
  { name: "GitHub Style", schema: githubStyleSchema },
  { name: "Dashboard", schema: dashboardSchema },
  { name: "Marketing Site", schema: marketingSiteSchema },
]

schemas.forEach(({ name, schema }) => {
  console.log(`\n📋 Testing: ${name}`)
  console.log("-".repeat(80))

  const result = generatePrompt(schema, "react", "tailwind")

  if (!result.success) {
    console.log("❌ Prompt generation failed:", result.errors)
    return
  }

  const validation = validatePromptQuality(result.prompt!)

  console.log(`\n✅ Best Practices Section: ${validation.hasBestPractices ? "✓" : "✗"}`)
  console.log(`✅ Code Style Guidelines: ${validation.hasCodeStyleGuidelines ? "✓" : "✗"}`)
  console.log(`✅ CSS Mapping Examples: ${validation.hasCSSMappingExamples ? "✓" : "✗"}`)
  console.log(`✅ Layout-Only Instructions: ${validation.hasLayoutOnlyInstructions ? "✓" : "✗"}`)

  if (validation.issues.length > 0) {
    console.log("\n⚠️  Issues:")
    validation.issues.forEach((issue) => {
      console.log(`   - ${issue}`)
    })
  } else {
    console.log("\n✅ All quality checks passed!")
  }

  console.log(`\n📊 Prompt length: ${result.prompt?.length || 0} characters`)
  console.log(`📊 Estimated tokens: ~${Math.ceil((result.prompt?.length || 0) / 4)}`)
})

console.log("\n" + "=".repeat(80))
console.log("Validation Complete")
console.log("=".repeat(80))
