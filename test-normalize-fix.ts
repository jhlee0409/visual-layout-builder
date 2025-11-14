/**
 * Test normalizeSchema() fix for dynamic breakpoint inheritance
 *
 * Test Case: User's 8-component schema with "Desktop" (capital D)
 */

import { normalizeSchema } from "./lib/schema-utils"
import type { LaydlerSchema } from "./types/schema"

// Simplified version of user's 8-component schema
const userSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
      }
    },
    {
      id: "c7",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 1, width: 4, height: 3 },
      }
    },
    {
      id: "c8",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 4, width: 4, height: 3 },
      }
    },
    {
      id: "c6",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 7, width: 4, height: 1 },
      }
    },
    {
      id: "c2",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 0, width: 12, height: 1 },
      }
    },
    {
      id: "c4",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 1, width: 6, height: 6 },
      }
    },
    {
      id: "c5",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      responsiveCanvasLayout: {
        Desktop: { x: 6, y: 1, width: 6, height: 6 },
      }
    },
    {
      id: "c3",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 7, width: 12, height: 1 },
      }
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c7", "c8", "c6"],
    },
    Desktop: {
      structure: "vertical",
      components: ["c2", "c4", "c5", "c3"],
    },
  },
}

console.log("🧪 Testing normalizeSchema() with user's 8-component schema...\n")

console.log("📋 BEFORE normalization:")
console.log("  - mobile breakpoint components:", userSchema.layouts.mobile.components)
console.log("  - Desktop breakpoint components:", userSchema.layouts.Desktop.components)
console.log("  - c1 Canvas layouts:", Object.keys(userSchema.components[0].responsiveCanvasLayout || {}))
console.log("  - c2 Canvas layouts:", Object.keys(userSchema.components[4].responsiveCanvasLayout || {}))

const normalized = normalizeSchema(userSchema)

console.log("\n✅ AFTER normalization:")
console.log("  - mobile breakpoint components:", normalized.layouts.mobile.components)
console.log("  - Desktop breakpoint components:", normalized.layouts.Desktop.components)
console.log("  - c1 Canvas layouts:", Object.keys(normalized.components[0].responsiveCanvasLayout || {}))
console.log("  - c2 Canvas layouts:", Object.keys(normalized.components[4].responsiveCanvasLayout || {}))

// Validation
const mobileComponents = new Set(normalized.layouts.mobile.components)
const desktopComponents = new Set(normalized.layouts.Desktop.components)

console.log("\n🔍 Validation:")
console.log("  ✓ c1 in mobile?", mobileComponents.has("c1"))
console.log("  ✓ c1 in Desktop?", desktopComponents.has("c1"), "(inherited from mobile)")
console.log("  ✓ c7 in Desktop?", desktopComponents.has("c7"), "(inherited from mobile)")
console.log("  ✓ c2 in Desktop?", desktopComponents.has("c2"))
console.log("  ✓ c4 in Desktop?", desktopComponents.has("c4"))

// Check Canvas Layout inheritance
const c1 = normalized.components.find(c => c.id === "c1")
const c1HasDesktopCanvas = c1?.responsiveCanvasLayout?.Desktop !== undefined

console.log("\n🎨 Canvas Layout Inheritance:")
console.log("  ✓ c1 has Desktop Canvas layout?", c1HasDesktopCanvas, "(inherited from mobile)")
console.log("  - c1.responsiveCanvasLayout:", c1?.responsiveCanvasLayout)

// Expected behavior:
// - All components should appear in both breakpoints
// - Components with mobile-only Canvas should inherit to Desktop
console.log("\n🎯 Expected behavior:")
console.log("  - Desktop should have ALL components (c1, c7, c8, c6, c2, c4, c5, c3)")
console.log("  - Actual Desktop components:", normalized.layouts.Desktop.components)
console.log("  - Match?", normalized.layouts.Desktop.components.length === 8)

if (normalized.layouts.Desktop.components.length === 8) {
  console.log("\n✅ SUCCESS! normalizeSchema() correctly inherits components across breakpoints")
  console.log("   This should eliminate the need for Component Links!")
} else {
  console.log("\n❌ FAILED! Desktop only has", normalized.layouts.Desktop.components.length, "components")
  console.log("   Expected: 8 components")
}
