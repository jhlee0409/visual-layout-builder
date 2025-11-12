/**
 * Schema V2 Validation Test Script
 *
 * 샘플 스키마들에 대해 검증 로직을 실행하고 결과를 출력
 */

import {
  validateSchema,
  formatValidationResult,
} from "../lib/schema-validation"
import { sampleSchemas } from "../lib/sample-data"

function main() {
  console.log("🔍 Schema V2 Validation Test\n")
  console.log("=" .repeat(60))

  const schemas = Object.entries(sampleSchemas)

  schemas.forEach(([name, schema]) => {
    console.log(`\n📋 Testing: ${name}`)
    console.log("-".repeat(60))

    const result = validateSchema(schema)
    console.log(formatValidationResult(result))

    if (result.valid && result.warnings.length === 0) {
      console.log("\n🎉 Perfect! No errors or warnings.")
    }
  })

  console.log("\n" + "=".repeat(60))
  console.log("✅ Validation test completed")
}

main()
