/**
 * Test validation functions
 * Run this to verify Zod schemas work correctly
 */

import {
  validateSchema,
  safeValidateSchema,
  validateComponentReferences,
} from "./validation"
import { sampleSchema, simpleSingleColumnSchema } from "./sample-data"

console.log("🧪 Testing Laylder Schema Validation\n")

// Test 1: Valid schema (PRD example)
console.log("Test 1: Validating PRD sample schema...")
try {
  const result = validateSchema(sampleSchema)
  console.log("✅ PASS: Sample schema is valid")
  console.log(`   Components: ${result.components.length}`)
  console.log(`   Breakpoints: ${result.breakpoints.length}`)
  console.log(`   Layouts: ${Object.keys(result.layouts).join(", ")}`)
} catch (error) {
  console.error("❌ FAIL:", error)
}

console.log()

// Test 2: Valid schema (simple layout)
console.log("Test 2: Validating simple single-column schema...")
try {
  const result = validateSchema(simpleSingleColumnSchema)
  console.log("✅ PASS: Simple schema is valid")
} catch (error) {
  console.error("❌ FAIL:", error)
}

console.log()

// Test 3: Component reference validation
console.log("Test 3: Validating component references...")
const errors = validateComponentReferences(sampleSchema)
if (errors.length === 0) {
  console.log("✅ PASS: All component references are valid")
} else {
  console.error("❌ FAIL: Invalid component references:")
  errors.forEach((err) => console.error(`   - ${err}`))
}

console.log()

// Test 4: Invalid schema (missing required field)
console.log("Test 4: Testing invalid schema (should fail)...")
const invalidSchema = {
  schemaVersion: "1.1",
  components: [], // Empty components (invalid - needs at least one)
  breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 }],
  layouts: {
    mobile: {
      grid: {
        rows: "1fr",
        columns: "1fr",
        areas: [[""]],
      },
    },
  },
}

const result = safeValidateSchema(invalidSchema)
if (!result.success) {
  console.log("✅ PASS: Correctly rejected invalid schema")
  console.log(`   Error: ${result.error.errors[0].message}`)
} else {
  console.error("❌ FAIL: Should have rejected invalid schema")
}

console.log()

// Test 5: Invalid component ID format
console.log("Test 5: Testing invalid component ID format...")
const invalidIdSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "component1", // Invalid format (should be c1)
      name: "Test",
      semanticTag: "div",
    },
  ],
  breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 }],
  layouts: {
    mobile: {
      grid: {
        rows: "1fr",
        columns: "1fr",
        areas: [["component1"]],
      },
    },
  },
}

const result2 = safeValidateSchema(invalidIdSchema)
if (!result2.success) {
  console.log("✅ PASS: Correctly rejected invalid component ID")
  console.log(`   Error: ${result2.error.errors[0].message}`)
} else {
  console.error("❌ FAIL: Should have rejected invalid component ID")
}

console.log()

// Test 6: Invalid component reference (component used but not defined)
console.log("Test 6: Testing invalid component reference...")
const invalidRefSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "c1",
      name: "Test",
      semanticTag: "div" as const,
    },
  ],
  breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 }],
  layouts: {
    mobile: {
      grid: {
        rows: "1fr",
        columns: "1fr",
        areas: [["c999"]], // c999 doesn't exist
      },
    },
  },
}

try {
  validateSchema(invalidRefSchema) // This should pass Zod validation
  const refErrors = validateComponentReferences(invalidRefSchema)
  if (refErrors.length > 0) {
    console.log("✅ PASS: Detected invalid component reference")
    console.log(`   Error: ${refErrors[0]}`)
  } else {
    console.error("❌ FAIL: Should have detected invalid reference")
  }
} catch (error) {
  console.error("❌ FAIL: Unexpected error:", error)
}

console.log()
console.log("🎉 Validation tests complete!")
