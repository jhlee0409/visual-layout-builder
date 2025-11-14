/**
 * Generate Correct Prompt with Canvas Grid Information
 *
 * This script demonstrates how to properly generate prompts that include
 * Visual Layout (Canvas Grid) information for accurate code generation.
 */

import { readFileSync } from "fs"
import { createPromptStrategy } from "../lib/prompt-strategies/strategy-factory"
import type { LaydlerSchema } from "../types/schema"

// Read schema from test file
const schemaJSON = readFileSync("./test-schema.json", "utf-8")
const schema: LaydlerSchema = JSON.parse(schemaJSON)

// Generate prompt using AI Model System (same as ExportModal)
console.log("🚀 Generating prompt with AI Model System (Canvas Grid information)...\n")

const strategy = createPromptStrategy("claude-sonnet-4.5")
const result = strategy.generatePrompt(schema, "react", "tailwind", {
  targetModel: "claude-sonnet-4.5",
  optimizationLevel: "balanced",
  verbosity: "normal"
})

if (result.success) {
  console.log("✅ Prompt generated successfully!")
  console.log(`📊 Schema: ${schema.components.length} components, ${schema.breakpoints.length} breakpoints`)

  if (result.warnings && result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`)
    result.warnings.forEach((w) => console.log(`   - ${w}`))
  }

  console.log("\n" + "=".repeat(80))
  console.log("📝 GENERATED PROMPT (WITH CANVAS GRID INFO)")
  console.log("=".repeat(80) + "\n")

  console.log(result.prompt)

  console.log("\n" + "=".repeat(80))
  console.log("✅ Copy the prompt above and paste it to Claude/GPT")
  console.log("=".repeat(80))
} else {
  console.error("❌ Failed to generate prompt:")
  result.errors?.forEach((e) => console.error(`   - ${e}`))
  process.exit(1)
}
