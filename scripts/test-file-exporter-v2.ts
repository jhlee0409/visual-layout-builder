/**
 * File Exporter V2 Test
 *
 * Schema V2 → 실제 파일 생성 테스트
 */

import { sampleSchemasV2, defaultGenerationPackageV2 } from "../lib/sample-data-v2"
import { exportToFiles } from "../lib/file-exporter-v2"
import * as fs from "fs"
import * as path from "path"

console.log("🧪 File Exporter V2 Test")
console.log("=".repeat(70))
console.log()

// Test 1: GitHub Layout Export
console.log("📦 Test 1: Export GitHub Layout")
console.log("-".repeat(70))
console.log()

const githubPkg = defaultGenerationPackageV2
const githubFiles = exportToFiles(githubPkg)

console.log(`Generated ${githubFiles.length} files:`)
githubFiles.forEach((file) => {
  console.log(`  - ${file.path} (${file.content.length} chars)`)
})

console.log()

// Test 2: Save to disk
console.log("💾 Test 2: Save Files to Disk")
console.log("-".repeat(70))
console.log()

const outputDir = path.join(process.cwd(), "export-test-v2")

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`✅ Created directory: ${outputDir}`)
}

// Save all files
githubFiles.forEach((file) => {
  const filePath = path.join(outputDir, file.path)
  const fileDir = path.dirname(filePath)

  // Create subdirectories if needed
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }

  fs.writeFileSync(filePath, file.content, "utf-8")
  console.log(`✅ Saved: ${file.path}`)
})

console.log()

// Test 3: Export all sample schemas
console.log("📦 Test 3: Export All Sample Schemas")
console.log("-".repeat(70))
console.log()

Object.entries(sampleSchemasV2).forEach(([name, schema]) => {
  const pkg = {
    schema,
    options: {
      framework: "react" as const,
      cssSolution: "tailwind" as const,
      typescript: true,
    },
  }

  const files = exportToFiles(pkg)
  const sampleDir = path.join(outputDir, name)

  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true })
  }

  files.forEach((file) => {
    const filePath = path.join(sampleDir, file.path)
    const fileDir = path.dirname(filePath)

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true })
    }

    fs.writeFileSync(filePath, file.content, "utf-8")
  })

  console.log(`✅ ${name}: ${files.length} files exported`)
})

console.log()

// Test 4: Verify generated files
console.log("✅ Test 4: Verify Generated Files")
console.log("-".repeat(70))
console.log()

const verificationTests = [
  {
    name: "GlobalHeader component exists",
    test: () => {
      const filePath = path.join(outputDir, "components", "GlobalHeader.tsx")
      return fs.existsSync(filePath)
    },
  },
  {
    name: "GlobalHeader has className",
    test: () => {
      const filePath = path.join(outputDir, "components", "GlobalHeader.tsx")
      const content = fs.readFileSync(filePath, "utf-8")
      return content.includes('className="')
    },
  },
  {
    name: "GlobalHeader has fixed positioning",
    test: () => {
      const filePath = path.join(outputDir, "components", "GlobalHeader.tsx")
      const content = fs.readFileSync(filePath, "utf-8")
      return content.includes("fixed")
    },
  },
  {
    name: "Layout file exists",
    test: () => {
      const filePath = path.join(outputDir, "app", "page.tsx")
      return fs.existsSync(filePath)
    },
  },
  {
    name: "Layout file has imports",
    test: () => {
      const filePath = path.join(outputDir, "app", "page.tsx")
      const content = fs.readFileSync(filePath, "utf-8")
      return (
        content.includes("import") && content.includes("from \"@/components/")
      )
    },
  },
  {
    name: "Layout file has export default",
    test: () => {
      const filePath = path.join(outputDir, "app", "page.tsx")
      const content = fs.readFileSync(filePath, "utf-8")
      return content.includes("export default")
    },
  },
  {
    name: "Schema JSON exists",
    test: () => {
      const filePath = path.join(outputDir, "schema.json")
      return fs.existsSync(filePath)
    },
  },
  {
    name: "Schema JSON is valid",
    test: () => {
      const filePath = path.join(outputDir, "schema.json")
      const content = fs.readFileSync(filePath, "utf-8")
      const schema = JSON.parse(content)
      return schema.schemaVersion === "2.0"
    },
  },
]

verificationTests.forEach((test) => {
  const result = test.test()
  console.log(`${result ? "✅" : "❌"} ${test.name}`)
})

console.log()
console.log("=".repeat(70))
console.log("🎉 File Exporter V2 Test Complete")
console.log()
console.log(`Exported files are in: ${outputDir}`)
console.log()
