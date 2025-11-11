/**
 * Schema V2 Validation Test Script
 *
 * 샘플 스키마들에 대해 검증 로직을 실행하고 결과를 출력
 */

import {
  validateSchemaV2,
  formatValidationResult,
} from "../lib/schema-validation-v2"
import { sampleSchemasV2 } from "../lib/sample-data-v2"

function main() {
  console.log("🔍 Schema V2 Validation Test\n")
  console.log("=" .repeat(60))

  const schemas = Object.entries(sampleSchemasV2)

  schemas.forEach(([name, schema]) => {
    console.log(`\n📋 Testing: ${name}`)
    console.log("-".repeat(60))

    const result = validateSchemaV2(schema)
    console.log(formatValidationResult(result))

    if (result.valid && result.warnings.length === 0) {
      console.log("\n🎉 Perfect! No errors or warnings.")
    }
  })

  console.log("\n" + "=".repeat(60))
  console.log("✅ Validation test completed")
}

main()
