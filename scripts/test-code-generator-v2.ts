/**
 * Code Generator V2 Test
 *
 * Schema V2 → React + Tailwind 코드 생성 테스트
 */

import { sampleSchemasV2 } from "../lib/sample-data-v2"
import {
  generateComponentCode,
  generateComponentClasses,
  generatePositioningClasses,
  generateLayoutClasses,
  generateStylingClasses,
  generateResponsiveClasses,
} from "../lib/code-generator-v2"

console.log("🧪 Code Generator V2 Test")
console.log("=" .repeat(70))
console.log()

// Test Suite 1: Individual Class Generation
console.log("📦 Test Suite 1: Individual Class Generation")
console.log("-".repeat(70))

const testComponent = sampleSchemasV2.github.components[0] // GlobalHeader

console.log("\n📋 Test Component: GlobalHeader")
console.log("Input:")
console.log(JSON.stringify(testComponent, null, 2))
console.log()

console.log("Output:")
console.log("1. Positioning classes:")
console.log(`   "${generatePositioningClasses(testComponent.positioning)}"`)
console.log()

console.log("2. Layout classes:")
console.log(`   "${generateLayoutClasses(testComponent.layout)}"`)
console.log()

console.log("3. Styling classes:")
console.log(`   "${generateStylingClasses(testComponent.styling)}"`)
console.log()

console.log("4. Responsive classes:")
console.log(`   "${generateResponsiveClasses(testComponent.responsive)}"`)
console.log()

console.log("5. Combined classes:")
console.log(`   "${generateComponentClasses(testComponent)}"`)
console.log()

// Test Suite 2: Full Component Code Generation
console.log("🎨 Test Suite 2: Full Component Code Generation")
console.log("-".repeat(70))

Object.entries(sampleSchemasV2).forEach(([schemaName, schema]) => {
  console.log(`\n📋 Schema: ${schemaName}`)
  console.log("-".repeat(70))

  schema.components.forEach((component) => {
    console.log(`\n// components/${component.name}.tsx`)
    console.log(generateComponentCode(component))
  })
})

console.log()

// Test Suite 3: Verification
console.log("✅ Test Suite 3: Generated Code Verification")
console.log("-".repeat(70))

const verificationTests = [
  {
    name: "Fixed Header",
    test: () => {
      const header = sampleSchemasV2.github.components[0]
      const classes = generateComponentClasses(header)
      return classes.includes("fixed") && classes.includes("top-0")
    },
  },
  {
    name: "Sticky Sidebar",
    test: () => {
      const sidebar = sampleSchemasV2.github.components[1]
      const classes = generateComponentClasses(sidebar)
      return classes.includes("sticky")
    },
  },
  {
    name: "Responsive Hidden",
    test: () => {
      const sidebar = sampleSchemasV2.github.components[1]
      const classes = generateResponsiveClasses(sidebar.responsive)
      return classes.includes("hidden") && classes.includes("lg:block")
    },
  },
  {
    name: "Flex Layout",
    test: () => {
      const navbar = sampleSchemasV2.dashboard.components[0]
      const classes = generateLayoutClasses(navbar.layout)
      return classes.includes("flex") && classes.includes("justify-between")
    },
  },
  {
    name: "Grid Layout",
    test: () => {
      const cardGrid = sampleSchemasV2.cardGallery.components[1]
      const classes = generateLayoutClasses(cardGrid.layout)
      return classes.includes("grid")
    },
  },
  {
    name: "Container Wrapper",
    test: () => {
      const main = sampleSchemasV2.github.components[2]
      const code = generateComponentCode(main)
      return code.includes("container mx-auto")
    },
  },
]

console.log()
verificationTests.forEach((test) => {
  const result = test.test()
  console.log(`${result ? "✅" : "❌"} ${test.name}`)
})

console.log()

// Test Suite 4: Class Format Validation
console.log("🔍 Test Suite 4: Class Format Validation")
console.log("-".repeat(70))

Object.entries(sampleSchemasV2).forEach(([schemaName, schema]) => {
  console.log(`\n📋 ${schemaName}:`)

  schema.components.forEach((component) => {
    const classes = generateComponentClasses(component)
    const classList = classes.split(" ")

    // 중복 클래스 체크
    const duplicates = classList.filter(
      (cls, index) => classList.indexOf(cls) !== index
    )
    if (duplicates.length > 0) {
      console.log(`  ❌ ${component.name}: Duplicate classes found: ${duplicates.join(", ")}`)
    } else {
      console.log(`  ✅ ${component.name}: ${classList.length} unique classes`)
    }
  })
})

console.log()

// Test Suite 5: Expected Output Patterns
console.log("📝 Test Suite 5: Expected Output Patterns")
console.log("-".repeat(70))

const expectedPatterns = [
  {
    schema: "github",
    component: 0,
    patterns: ["fixed", "top-0", "left-0", "right-0", "z-50", "bg-white", "border-b"],
  },
  {
    schema: "dashboard",
    component: 0,
    patterns: ["fixed", "flex", "justify-between", "items-center", "bg-slate-900"],
  },
  {
    schema: "marketing",
    component: 0,
    patterns: ["sticky", "top-0", "flex", "bg-white", "border-b", "shadow-sm"],
  },
  {
    schema: "cardGallery",
    component: 1,
    patterns: ["grid", "flex-1"],
  },
]

expectedPatterns.forEach(({ schema, component, patterns }) => {
  const comp = (sampleSchemasV2 as any)[schema].components[component]
  const classes = generateComponentClasses(comp)

  console.log(`\n${schema} > ${comp.name}:`)
  patterns.forEach((pattern) => {
    const has = classes.includes(pattern)
    console.log(`  ${has ? "✅" : "❌"} "${pattern}"`)
  })
})

console.log()
console.log("=" .repeat(70))
console.log("🎉 Code Generator V2 Test Complete")
console.log()
