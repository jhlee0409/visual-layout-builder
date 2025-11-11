/**
 * Prompt Generator V2 Test
 *
 * Schema V2 → AI Prompt 변환 테스트
 */

import { sampleSchemasV2, defaultGenerationPackageV2 } from "../lib/sample-data-v2"
import {
  generatePromptFromSchemaV2,
  generateSimplePrompt,
} from "../lib/prompt-generator-v2"
import * as fs from "fs"
import * as path from "path"

console.log("🧪 Prompt Generator V2 Test")
console.log("=" .repeat(70))
console.log()

// Test 1: Simple Prompt Generation
console.log("📝 Test 1: Simple Prompt Generation")
console.log("-".repeat(70))

Object.entries(sampleSchemasV2).forEach(([name, schema]) => {
  console.log(`\n${name}:`)
  console.log(generateSimplePrompt(schema))
})

console.log()

// Test 2: Full Prompt Generation for GitHub Layout
console.log("📄 Test 2: Full Prompt Generation (GitHub Layout)")
console.log("-".repeat(70))
console.log()

const fullPrompt = generatePromptFromSchemaV2(defaultGenerationPackageV2)
console.log(fullPrompt)

console.log()
console.log("=" .repeat(70))

// Test 3: Save Prompts to Files
console.log("\n💾 Test 3: Saving Prompts to Files")
console.log("-".repeat(70))

const outputDir = path.join(process.cwd(), "docs", "prompts-v2")

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`✅ Created directory: ${outputDir}`)
}

Object.entries(sampleSchemasV2).forEach(([name, schema]) => {
  const pkg = {
    schema,
    options: {
      framework: "react" as const,
      cssSolution: "tailwind" as const,
      typescript: true,
    },
  }

  const prompt = generatePromptFromSchemaV2(pkg)
  const filename = path.join(outputDir, `${name}-prompt.md`)

  fs.writeFileSync(filename, prompt, "utf-8")
  console.log(`✅ Saved: ${name}-prompt.md`)
})

console.log()
console.log("=" .repeat(70))
console.log("🎉 Prompt Generator V2 Test Complete")
console.log()
console.log("Generated files are in: docs/prompts-v2/")
console.log()
