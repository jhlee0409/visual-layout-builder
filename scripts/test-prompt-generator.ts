/**
 * Prompt Generator V2 Test
 *
 * Schema V2 → AI Prompt 변환 테스트
 */

import { sampleSchemas } from "../lib/sample-data"
import { generatePrompt } from "../lib/prompt-generator"
import * as fs from "fs"
import * as path from "path"

console.log("🧪 Prompt Generator V2 Test")
console.log("=" .repeat(70))
console.log()

// Test 1: Full Prompt Generation for GitHub Layout
console.log("📄 Test 1: Full Prompt Generation (GitHub Layout)")
console.log("-".repeat(70))
console.log()

const githubSchema = sampleSchemas.github
const result = generatePrompt(githubSchema, "react", "tailwind")

if (!result.success) {
  console.error("❌ Generation failed:")
  result.errors?.forEach((err) => console.error(`  - ${err}`))
  process.exit(1)
}

console.log(result.prompt)

if (result.warnings && result.warnings.length > 0) {
  console.log("\n⚠️  Warnings:")
  result.warnings.forEach((warn) => console.log(`  - ${warn}`))
}

console.log()
console.log("=" .repeat(70))

// Test 2: Save Prompts to Files
console.log("\n💾 Test 2: Saving Prompts to Files")
console.log("-".repeat(70))

const outputDir = path.join(process.cwd(), "docs", "prompts-v2")

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`✅ Created directory: ${outputDir}`)
}

Object.entries(sampleSchemas).forEach(([name, schema]) => {
  const result = generatePrompt(schema, "react", "tailwind")

  if (!result.success) {
    console.error(`❌ Failed to generate prompt for ${name}`)
    return
  }

  const filename = path.join(outputDir, `${name}-prompt.md`)
  fs.writeFileSync(filename, result.prompt!, "utf-8")
  console.log(`✅ Saved: ${name}-prompt.md`)
})

console.log()
console.log("=" .repeat(70))
console.log("🎉 Prompt Generator V2 Test Complete")
console.log()
console.log("Generated files are in: docs/prompts-v2/")
console.log()
