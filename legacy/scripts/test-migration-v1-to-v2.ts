/**
 * Migration V1→V2 Test
 *
 * V1 Schema를 V2로 마이그레이션 테스트
 */

import { sampleSchema } from "../lib/sample-data"
import { migrateV1ToV2, validateMigration } from "../lib/migration-v1-to-v2"
import { validateSchemaV2 } from "../lib/schema-validation-v2"
import * as fs from "fs"
import * as path from "path"

console.log("🧪 Migration V1→V2 Test")
console.log("=".repeat(70))
console.log()

// Test 1: Migrate sample V1 schema
console.log("🔄 Test 1: Migrate Sample V1 Schema")
console.log("-".repeat(70))
console.log()

console.log("V1 Schema:")
console.log(`  Components: ${sampleSchema.components.length}`)
console.log(`  Breakpoints: ${sampleSchema.breakpoints.length}`)
console.log(`  Layouts: ${Object.keys(sampleSchema.layouts).length}`)
console.log()

const v2Schema = migrateV1ToV2(sampleSchema)

console.log("V2 Schema:")
console.log(`  Schema Version: ${v2Schema.schemaVersion}`)
console.log(`  Components: ${v2Schema.components.length}`)
console.log(`  Breakpoints: ${v2Schema.breakpoints.length}`)
console.log(`  Layouts: ${Object.keys(v2Schema.layouts).length}`)
console.log()

// Test 2: Validate migrated schema
console.log("✅ Test 2: Validate Migrated Schema")
console.log("-".repeat(70))
console.log()

const migrationValidation = validateMigration(v2Schema)
console.log(`Migration Valid: ${migrationValidation.valid}`)

if (migrationValidation.warnings.length > 0) {
  console.log("\nWarnings:")
  migrationValidation.warnings.forEach((warning) => {
    console.log(`  ⚠️  ${warning}`)
  })
}

console.log()

const schemaValidation = validateSchemaV2(v2Schema)
console.log(`Schema V2 Valid: ${schemaValidation.valid}`)
console.log(`Errors: ${schemaValidation.errors.length}`)
console.log(`Warnings: ${schemaValidation.warnings.length}`)

if (schemaValidation.errors.length > 0) {
  console.log("\nErrors:")
  schemaValidation.errors.forEach((error) => {
    console.log(`  ❌ ${error.code}: ${error.message}`)
  })
}

if (schemaValidation.warnings.length > 0) {
  console.log("\nWarnings:")
  schemaValidation.warnings.forEach((warning) => {
    console.log(`  ⚠️  ${warning.code}: ${warning.message}`)
  })
}

console.log()

// Test 3: Check component properties
console.log("🔍 Test 3: Check Component Properties")
console.log("-".repeat(70))
console.log()

v2Schema.components.forEach((comp) => {
  console.log(`${comp.name} (${comp.semanticTag}):`)
  console.log(`  Positioning: ${comp.positioning.type}`)
  console.log(`  Layout: ${comp.layout.type}`)
  console.log(`  Styling: ${comp.styling ? "Yes" : "No"}`)
  console.log(`  Responsive: ${comp.responsive ? "Yes" : "No"}`)
  console.log()
})

// Test 4: Check layouts
console.log("📐 Test 4: Check Layouts")
console.log("-".repeat(70))
console.log()

for (const breakpoint in v2Schema.layouts) {
  const layout = v2Schema.layouts[breakpoint as keyof typeof v2Schema.layouts]
  console.log(`${breakpoint}:`)
  console.log(`  Structure: ${layout.structure}`)
  console.log(`  Components: ${layout.components.length}`)
  if (layout.roles) {
    console.log(`  Roles:`)
    for (const role in layout.roles) {
      console.log(`    ${role}: ${layout.roles[role as keyof typeof layout.roles]}`)
    }
  }
  console.log()
}

// Test 5: Save migrated schema
console.log("💾 Test 5: Save Migrated Schema")
console.log("-".repeat(70))
console.log()

const outputDir = path.join(process.cwd(), "migration-test")
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputPath = path.join(outputDir, "migrated-schema-v2.json")
fs.writeFileSync(outputPath, JSON.stringify(v2Schema, null, 2), "utf-8")
console.log(`✅ Saved migrated schema: ${outputPath}`)

console.log()

// Test 6: Comparison
console.log("📊 Test 6: Before/After Comparison")
console.log("-".repeat(70))
console.log()

console.log("V1 Component (Before):")
console.log(JSON.stringify(sampleSchema.components[0], null, 2))
console.log()

console.log("V2 Component (After):")
console.log(JSON.stringify(v2Schema.components[0], null, 2))
console.log()

console.log("=".repeat(70))
console.log("🎉 Migration V1→V2 Test Complete")
console.log()
