/**
 * Test Prompt Generation
 * PRD 5.2: Verify prompt generation with sample data
 *
 * Run: npx tsx lib/test-prompt-generation.ts
 */

import { sampleSchemas } from "./sample-data"
import {
  generatePrompt,
  generateSchemaSummary,
  estimateTokenCount,
  getRecommendedModel,
} from "./prompt-generator"

console.log("🧪 Testing Prompt Generation System\n")
console.log("=" .repeat(60))

// Test 1: Generate prompt from sample schema
console.log("\n📝 Test 1: Generate prompt from sample 'default' schema")
console.log("-" .repeat(60))

const testSchema = sampleSchemas.default
const result = generatePrompt(testSchema, "react", "tailwind")

if (!result.success) {
  console.error("❌ FAILED: Prompt generation failed")
  console.error("Errors:", result.errors)
  process.exit(1)
}

console.log("✅ PASSED: Prompt generated successfully")

// Test 2: Verify prompt structure
console.log("\n📝 Test 2: Verify prompt structure")
console.log("-" .repeat(60))

const prompt = result.prompt!
const requiredSections = [
  "You are an expert React developer",
  "## Components",
  "## Responsive Grid Layouts",
  "## Implementation Instructions",
  "## Full Schema (JSON)",
]

let allSectionsPresent = true
requiredSections.forEach((section) => {
  const present = prompt.includes(section)
  console.log(`${present ? "✅" : "❌"} "${section.substring(0, 40)}..."`)
  if (!present) allSectionsPresent = false
})

if (!allSectionsPresent) {
  console.error("\n❌ FAILED: Some required sections are missing")
  process.exit(1)
}

console.log("\n✅ PASSED: All required sections present")

// Test 3: Verify component information
console.log("\n📝 Test 3: Verify component information")
console.log("-" .repeat(60))

const componentNames = ["GlobalHeader", "Sidebar", "MainContent", "AdBanner"]
let allComponentsPresent = true
componentNames.forEach((name) => {
  const present = prompt.includes(name)
  console.log(`${present ? "✅" : "❌"} Component: ${name}`)
  if (!present) allComponentsPresent = false
})

if (!allComponentsPresent) {
  console.error("\n❌ FAILED: Some components are missing")
  process.exit(1)
}

console.log("\n✅ PASSED: All components present")

// Test 4: Verify breakpoint layouts
console.log("\n📝 Test 4: Verify breakpoint layouts")
console.log("-" .repeat(60))

const breakpoints = ["Mobile", "Tablet", "Desktop"]
let allBreakpointsPresent = true
breakpoints.forEach((name) => {
  const present = prompt.includes(name)
  console.log(`${present ? "✅" : "❌"} Breakpoint: ${name}`)
  if (!present) allBreakpointsPresent = false
})

if (!allBreakpointsPresent) {
  console.error("\n❌ FAILED: Some breakpoints are missing")
  process.exit(1)
}

console.log("\n✅ PASSED: All breakpoints present")

// Test 5: Verify grid layout syntax
console.log("\n📝 Test 5: Verify grid layout syntax")
console.log("-" .repeat(60))

const gridKeywords = [
  "grid-template-rows",
  "grid-template-columns",
  "grid-template-areas",
  "CSS Grid",
]
let allKeywordsPresent = true
gridKeywords.forEach((keyword) => {
  const present = prompt.includes(keyword)
  console.log(`${present ? "✅" : "❌"} Keyword: ${keyword}`)
  if (!present) allKeywordsPresent = false
})

if (!allKeywordsPresent) {
  console.error("\n❌ FAILED: Some grid keywords are missing")
  process.exit(1)
}

console.log("\n✅ PASSED: All grid keywords present")

// Test 6: Schema summary
console.log("\n📝 Test 6: Generate schema summary")
console.log("-" .repeat(60))

const summary = generateSchemaSummary(testSchema)
console.log(summary)
console.log("\n✅ PASSED: Schema summary generated")

// Test 7: Token estimation
console.log("\n📝 Test 7: Estimate token count")
console.log("-" .repeat(60))

const tokenCount = estimateTokenCount(prompt)
const recommendedModel = getRecommendedModel(tokenCount)

console.log(`Prompt length: ${prompt.length} characters`)
console.log(`Estimated tokens: ${tokenCount}`)
console.log(`Recommended model: ${recommendedModel}`)
console.log("\n✅ PASSED: Token estimation completed")

// Test 8: Invalid schema handling
console.log("\n📝 Test 8: Handle invalid schema")
console.log("-" .repeat(60))

const invalidSchema = {
  schemaVersion: "0.1.0",
  components: [],
  breakpoints: [],
  layouts: {},
} as any

const invalidResult = generatePrompt(invalidSchema, "react", "tailwind")

if (invalidResult.success) {
  console.error("❌ FAILED: Should have failed for empty schema")
  process.exit(1)
}

console.log("✅ PASSED: Invalid schema rejected")
console.log(`Errors: ${invalidResult.errors?.join(", ")}`)

// Test 9: Invalid framework/CSS
console.log("\n📝 Test 9: Handle unsupported framework/CSS")
console.log("-" .repeat(60))

const unsupportedResult = generatePrompt(testSchema, "vue", "scss")

if (unsupportedResult.success) {
  console.error("❌ FAILED: Should have failed for unsupported framework")
  process.exit(1)
}

console.log("✅ PASSED: Unsupported framework/CSS rejected")
console.log(`Errors: ${unsupportedResult.errors?.join(", ")}`)

// Final summary
console.log("\n" + "=" .repeat(60))
console.log("🎉 ALL TESTS PASSED!")
console.log("=" .repeat(60))

// Optional: Write prompt to file for inspection
if (process.argv.includes("--output")) {
  const fs = require("fs")
  const outputPath = "/tmp/generated-prompt.md"
  fs.writeFileSync(outputPath, prompt)
  console.log(`\n📄 Prompt written to: ${outputPath}`)
}

console.log("\n💡 Run with --output flag to save generated prompt to file")
