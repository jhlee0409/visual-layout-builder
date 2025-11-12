/**
 * Test Script for normalizeSchema()
 *
 * Mobile → Tablet → Desktop 자동 상속 테스트
 */

import { normalizeSchema } from "../lib/schema-utils"
import type { LaydlerSchema } from "../types/schema"

console.log("🧪 normalizeSchema() Test")
console.log("=".repeat(70))
console.log()

// Test Case 1: Mobile만 설정한 경우
console.log("📋 Test 1: Mobile만 설정 → Tablet/Desktop 자동 상속")
console.log("-".repeat(70))

const testSchema1: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 6, height: 2 },
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: [],
    },
    desktop: {
      structure: "vertical",
      components: [],
    },
  },
}

const normalized1 = normalizeSchema(testSchema1)

console.log("✅ layouts.mobile.components:", normalized1.layouts.mobile.components)
console.log("✅ layouts.tablet.components:", normalized1.layouts.tablet.components, "(Mobile에서 상속)")
console.log("✅ layouts.desktop.components:", normalized1.layouts.desktop.components, "(Tablet에서 상속)")
console.log()
console.log("✅ responsiveCanvasLayout.mobile:", normalized1.components[0].responsiveCanvasLayout?.mobile)
console.log("✅ responsiveCanvasLayout.tablet:", normalized1.components[0].responsiveCanvasLayout?.tablet, "(Mobile에서 상속)")
console.log("✅ responsiveCanvasLayout.desktop:", normalized1.components[0].responsiveCanvasLayout?.desktop, "(Tablet에서 상속)")
console.log()

// Test Case 2: Mobile + Tablet 설정 → Desktop만 상속
console.log("📋 Test 2: Mobile + Tablet 설정 → Desktop 자동 상속")
console.log("-".repeat(70))

const testSchema2: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 6, height: 2 },
        tablet: { x: 0, y: 0, width: 8, height: 2 },  // Tablet에서 명시적 변경
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "horizontal",  // Tablet에서 명시적 변경
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: [],
    },
  },
}

const normalized2 = normalizeSchema(testSchema2)

console.log("✅ layouts.mobile.structure:", normalized2.layouts.mobile.structure)
console.log("✅ layouts.tablet.structure:", normalized2.layouts.tablet.structure, "(명시적 설정)")
console.log("✅ layouts.desktop.structure:", normalized2.layouts.desktop.structure, "(Tablet에서 상속)")
console.log("✅ layouts.desktop.components:", normalized2.layouts.desktop.components, "(Tablet에서 상속)")
console.log()
console.log("✅ responsiveCanvasLayout.mobile.width:", normalized2.components[0].responsiveCanvasLayout?.mobile?.width)
console.log("✅ responsiveCanvasLayout.tablet.width:", normalized2.components[0].responsiveCanvasLayout?.tablet?.width, "(명시적 설정)")
console.log("✅ responsiveCanvasLayout.desktop.width:", normalized2.components[0].responsiveCanvasLayout?.desktop?.width, "(Tablet에서 상속)")
console.log()

// Test Case 3: 모두 명시 → 상속 없음
console.log("📋 Test 3: 모든 breakpoint 명시 → 상속 없음")
console.log("-".repeat(70))

const testSchema3: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 6, height: 2 },
        tablet: { x: 0, y: 0, width: 8, height: 2 },
        desktop: { x: 0, y: 0, width: 12, height: 2 },
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "horizontal",
      components: ["c1"],
    },
    desktop: {
      structure: "sidebar-main",
      components: ["c1"],
    },
  },
}

const normalized3 = normalizeSchema(testSchema3)

console.log("✅ layouts.mobile.structure:", normalized3.layouts.mobile.structure)
console.log("✅ layouts.tablet.structure:", normalized3.layouts.tablet.structure)
console.log("✅ layouts.desktop.structure:", normalized3.layouts.desktop.structure)
console.log()
console.log("✅ responsiveCanvasLayout.mobile.width:", normalized3.components[0].responsiveCanvasLayout?.mobile?.width)
console.log("✅ responsiveCanvasLayout.tablet.width:", normalized3.components[0].responsiveCanvasLayout?.tablet?.width)
console.log("✅ responsiveCanvasLayout.desktop.width:", normalized3.components[0].responsiveCanvasLayout?.desktop?.width)
console.log()

console.log("=".repeat(70))
console.log("🎉 normalizeSchema() Test Complete")
console.log()
