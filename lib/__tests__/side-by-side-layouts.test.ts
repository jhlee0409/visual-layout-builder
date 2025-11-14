/**
 * Side-by-Side Layout Combinations Test
 *
 * 모든 가능한 side-by-side 레이아웃 조합이 올바른 프롬프트를 생성하는지 검증
 *
 * Test Coverage:
 * - 2개 컴포넌트 side-by-side (모든 semanticTag 조합)
 * - 3개 컴포넌트 side-by-side (현재 케이스)
 * - 4개 이상 컴포넌트 side-by-side
 * - 여러 row의 side-by-side 조합
 * - Complex grid layouts (header + nav + sidebar|main|aside + footer)
 */

import { describe, it, expect } from "vitest"
import { createPromptStrategy } from "../prompt-strategies/strategy-factory"
import type { LaydlerSchema, Component } from "@/types/schema"

describe("Side-by-Side Layout Combinations", () => {
  /**
   * Helper: Create component with Canvas layout
   */
  function createComponent(
    id: string,
    name: string,
    semanticTag: Component["semanticTag"],
    x: number,
    y: number,
    width: number,
    height: number
  ): Component {
    return {
      id,
      name,
      semanticTag,
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column" } },
      responsiveCanvasLayout: {
        desktop: { x, y, width, height },
      },
    }
  }

  /**
   * Helper: Generate prompt and check for Canvas Grid info
   */
  function generateAndValidate(schema: LaydlerSchema) {
    const strategy = createPromptStrategy("claude-sonnet-4.5")
    const result = strategy.generatePrompt(schema, "react", "tailwind", {
      targetModel: "claude-sonnet-4.5",
      optimizationLevel: "balanced",
      verbosity: "normal",
    })

    expect(result.success).toBe(true)
    expect(result.prompt).toBeDefined()

    const prompt = result.prompt!

    // Check for Canvas Grid section
    expect(prompt).toContain("Visual Layout (Canvas Grid)")
    // Note: Spatial Relationships may be empty for simple layouts
    expect(prompt).toContain("CSS Grid Positioning")
    expect(prompt).toContain("Implementation Strategy")

    // Check for CRITICAL warning (if side-by-side exists)
    const hasSideBySide = schema.components.some((c1, i) =>
      schema.components.slice(i + 1).some((c2) => {
        const layout1 = c1.responsiveCanvasLayout?.desktop || c1.canvasLayout
        const layout2 = c2.responsiveCanvasLayout?.desktop || c2.canvasLayout
        if (!layout1 || !layout2) return false
        return layout1.y === layout2.y // Same row
      })
    )

    if (hasSideBySide) {
      expect(prompt).toContain("🚨 **CRITICAL**")
      expect(prompt).toContain("SIDE-BY-SIDE") // Uppercase from Spatial Relationships
      expect(prompt).toContain("DO NOT stack")
    }

    // Check for Layout Priority section
    expect(prompt).toContain("🚨 IMPORTANT - Layout Priority")
    expect(prompt).toContain("PRIMARY")
    expect(prompt).toContain("Canvas Grid")
    expect(prompt).toContain("SECONDARY")
    expect(prompt).toContain("DOM order")

    // Check for DOM Order with Canvas row numbers
    expect(prompt).toContain("DOM Order (Reference Only")
    expect(prompt).toContain("Canvas row")

    return { result, prompt }
  }

  describe("2-Component Side-by-Side", () => {
    it("should handle Sidebar | Main", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Sidebar", "aside", 0, 0, 3, 8),
          createComponent("c2", "Main", "main", 3, 0, 9, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2"] } },
      }

      const { prompt } = generateAndValidate(schema)

      // Verify side-by-side detection
      expect(prompt).toContain("Sidebar (c1), Main (c2)")
      expect(prompt).toContain("SIDE-BY-SIDE")
      expect(prompt).toContain("grid-column")
    })

    it("should handle Section | Section", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "SectionLeft", "section", 0, 0, 6, 8),
          createComponent("c2", "SectionRight", "section", 6, 0, 6, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2"] } },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("SectionLeft")
      expect(prompt).toContain("SectionRight")
      expect(prompt).toContain("SIDE-BY-SIDE")
    })

    it("should handle Article | Aside", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Article", "article", 0, 0, 8, 8),
          createComponent("c2", "Aside", "aside", 8, 0, 4, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2"] } },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("Article")
      expect(prompt).toContain("Aside")
      expect(prompt).toContain("LEFT")
    })
  })

  describe("3-Component Side-by-Side", () => {
    it("should handle Sidebar | Main | Aside (current case)", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Sidebar", "aside", 0, 0, 3, 8),
          createComponent("c2", "Main", "main", 3, 0, 6, 8),
          createComponent("c3", "Aside", "aside", 9, 0, 3, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2", "c3"] } },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("Sidebar (c1), Main (c2), Aside (c3)")
      expect(prompt).toContain("SIDE-BY-SIDE")
      expect(prompt).toContain("3 components")
    })

    it("should handle Section | Section | Section (equal widths)", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Section1", "section", 0, 0, 4, 8),
          createComponent("c2", "Section2", "section", 4, 0, 4, 8),
          createComponent("c3", "Section3", "section", 8, 0, 4, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2", "c3"] } },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("Section1")
      expect(prompt).toContain("Section2")
      expect(prompt).toContain("Section3")
      expect(prompt).toContain("cols 0-3")
      expect(prompt).toContain("cols 4-7")
      expect(prompt).toContain("cols 8-11")
    })
  })

  describe("4+ Component Side-by-Side", () => {
    it("should handle 4 sections in a row", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Section1", "section", 0, 0, 3, 8),
          createComponent("c2", "Section2", "section", 3, 0, 3, 8),
          createComponent("c3", "Section3", "section", 6, 0, 3, 8),
          createComponent("c4", "Section4", "section", 9, 0, 3, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: "vertical", components: ["c1", "c2", "c3", "c4"] },
        },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("Section1")
      expect(prompt).toContain("Section2")
      expect(prompt).toContain("Section3")
      expect(prompt).toContain("Section4")
      expect(prompt).toContain("4 components")
    })

    it("should handle 6 sections in a row (extreme case)", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Col1", "div", 0, 0, 2, 8),
          createComponent("c2", "Col2", "div", 2, 0, 2, 8),
          createComponent("c3", "Col3", "div", 4, 0, 2, 8),
          createComponent("c4", "Col4", "div", 6, 0, 2, 8),
          createComponent("c5", "Col5", "div", 8, 0, 2, 8),
          createComponent("c6", "Col6", "div", 10, 0, 2, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: {
            structure: "vertical",
            components: ["c1", "c2", "c3", "c4", "c5", "c6"],
          },
        },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("6 components")
      expect(prompt).toContain("SIDE-BY-SIDE")
    })
  })

  describe("Multi-Row Side-by-Side", () => {
    it("should handle Header + (Sidebar|Main) + Footer", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Header", "header", 0, 0, 12, 1),
          createComponent("c2", "Sidebar", "aside", 0, 1, 3, 6),
          createComponent("c3", "Main", "main", 3, 1, 9, 6),
          createComponent("c4", "Footer", "footer", 0, 7, 12, 1),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: "vertical", components: ["c1", "c2", "c3", "c4"] },
        },
      }

      const { prompt } = generateAndValidate(schema)

      // Verify Header and Footer are full width
      expect(prompt).toContain("Header (c1, full width)")
      expect(prompt).toContain("Footer (c4, full width)")

      // Verify Sidebar and Main are side-by-side
      expect(prompt).toContain("Sidebar (c2)")
      expect(prompt).toContain("Main (c3)")
      expect(prompt).toContain("SIDE-BY-SIDE")

      // Verify row information
      expect(prompt).toContain("Row 0: Header")
      expect(prompt).toContain("Row 1-6: Sidebar")
      expect(prompt).toContain("Row 7: Footer")
    })

    it("should handle complex grid: Header + Nav + (Sidebar|Main|Aside) + Footer", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Header", "header", 0, 0, 12, 1),
          createComponent("c2", "Nav", "nav", 0, 1, 12, 1),
          createComponent("c3", "Sidebar", "aside", 0, 2, 3, 4),
          createComponent("c4", "Main", "main", 3, 2, 6, 4),
          createComponent("c5", "Aside", "aside", 9, 2, 3, 4),
          createComponent("c6", "Footer", "footer", 0, 6, 12, 2),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: {
            structure: "vertical",
            components: ["c1", "c2", "c3", "c4", "c5", "c6"],
          },
        },
      }

      const { prompt } = generateAndValidate(schema)

      // Verify all components are mentioned
      expect(prompt).toContain("Header")
      expect(prompt).toContain("Nav")
      expect(prompt).toContain("Sidebar")
      expect(prompt).toContain("Main")
      expect(prompt).toContain("Aside")
      expect(prompt).toContain("Footer")

      // Verify side-by-side detection for row 2
      expect(prompt).toContain("Sidebar (c3), Main (c4), Aside (c5)")
      expect(prompt).toContain("SIDE-BY-SIDE")

      // Verify multiple rows mentioned
      expect(prompt).toContain("Row 0")
      expect(prompt).toContain("Row 1")
      expect(prompt).toContain("Row 2")
      expect(prompt).toContain("Row 6")
    })

    it("should handle two separate side-by-side rows", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          // Row 0: Two cards side-by-side
          createComponent("c1", "Card1", "article", 0, 0, 6, 3),
          createComponent("c2", "Card2", "article", 6, 0, 6, 3),
          // Row 3: Three sections side-by-side
          createComponent("c3", "Section1", "section", 0, 3, 4, 5),
          createComponent("c4", "Section2", "section", 4, 3, 4, 5),
          createComponent("c5", "Section3", "section", 8, 3, 4, 5),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: {
            structure: "vertical",
            components: ["c1", "c2", "c3", "c4", "c5"],
          },
        },
      }

      const { prompt } = generateAndValidate(schema)

      // Verify both rows are side-by-side
      expect(prompt).toContain("Card1 (c1), Card2 (c2)")
      expect(prompt).toContain("Section1 (c3), Section2 (c4), Section3 (c5)")
      expect(prompt).toContain("SIDE-BY-SIDE")
    })
  })

  describe("Edge Cases", () => {
    // Note: Overlapping validation is covered in canvas-comprehensive-validation.test.ts

    it("should handle single component (no side-by-side)", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [createComponent("c1", "Main", "main", 0, 0, 12, 8)],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1"] } },
      }

      const { prompt } = generateAndValidate(schema)

      // Should NOT contain CRITICAL warning (no side-by-side layout)
      expect(prompt).not.toContain("🚨 **CRITICAL**")
      expect(prompt).not.toContain("SIDE-BY-SIDE") // Uppercase version
    })

    it("should handle vertical stack (no side-by-side)", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Section1", "section", 0, 0, 12, 2),
          createComponent("c2", "Section2", "section", 0, 2, 12, 2),
          createComponent("c3", "Section3", "section", 0, 4, 12, 2),
          createComponent("c4", "Section4", "section", 0, 6, 12, 2),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
        layouts: {
          desktop: { structure: "vertical", components: ["c1", "c2", "c3", "c4"] },
        },
      }

      const { prompt } = generateAndValidate(schema)

      // Should NOT contain CRITICAL warning (all different rows)
      expect(prompt).not.toContain("🚨 **CRITICAL**")
      expect(prompt).not.toContain("SIDE-BY-SIDE") // Uppercase version
    })
  })

  describe("Different SemanticTag Combinations", () => {
    const semanticTags: Component["semanticTag"][] = [
      "header",
      "nav",
      "main",
      "aside",
      "footer",
      "section",
      "article",
      "div",
      "form",
    ]

    it("should handle all semantic tag pairs side-by-side", () => {
      // Test a few representative pairs
      const pairs: [Component["semanticTag"], Component["semanticTag"]][] = [
        ["main", "aside"],
        ["article", "aside"],
        ["section", "section"],
        ["div", "div"],
        ["form", "article"],
      ]

      pairs.forEach(([tag1, tag2]) => {
        const schema: LaydlerSchema = {
          schemaVersion: "2.0",
          components: [
            createComponent("c1", `Component1`, tag1, 0, 0, 6, 8),
            createComponent("c2", `Component2`, tag2, 6, 0, 6, 8),
          ],
          breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }],
          layouts: { desktop: { structure: "vertical", components: ["c1", "c2"] } },
        }

        const { prompt } = generateAndValidate(schema)

        expect(prompt).toContain("SIDE-BY-SIDE")
        expect(prompt).toContain("🚨 **CRITICAL**")
      })
    })
  })

  describe("Different Grid Sizes", () => {
    it("should handle 24-column grid", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Narrow", "aside", 0, 0, 4, 8),
          createComponent("c2", "Wide", "main", 4, 0, 20, 8),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 24, gridRows: 8 }],
        layouts: { desktop: { structure: "vertical", components: ["c1", "c2"] } },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("24-column")
      expect(prompt).toContain("repeat(24, 1fr)")
    })

    it("should handle 16-row grid", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          createComponent("c1", "Top", "section", 0, 0, 12, 4),
          createComponent("c2", "Middle", "section", 0, 4, 12, 8),
          createComponent("c3", "Bottom", "section", 0, 12, 12, 4),
        ],
        breakpoints: [{ name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 16 }],
        layouts: {
          desktop: { structure: "vertical", components: ["c1", "c2", "c3"] },
        },
      }

      const { prompt } = generateAndValidate(schema)

      expect(prompt).toContain("16-row")
      expect(prompt).toContain("3 components")
    })
  })

  describe("Multi-Breakpoint Scenarios", () => {
    it("should handle mobile stacked, desktop side-by-side", () => {
      const schema: LaydlerSchema = {
        schemaVersion: "2.0",
        components: [
          {
            id: "c1",
            name: "Sidebar",
            semanticTag: "aside",
            positioning: { type: "static" },
            layout: { type: "flex", flex: { direction: "column" } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 12, height: 4 }, // Full width
              desktop: { x: 0, y: 0, width: 3, height: 8 }, // Left sidebar
            },
          },
          {
            id: "c2",
            name: "Main",
            semanticTag: "main",
            positioning: { type: "static" },
            layout: { type: "flex", flex: { direction: "column" } },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 4, width: 12, height: 8 }, // Full width below
              desktop: { x: 3, y: 0, width: 9, height: 8 }, // Right main
            },
          },
        ],
        breakpoints: [
          { name: "mobile", minWidth: 0, gridCols: 12, gridRows: 12 },
          { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: "vertical", components: ["c1", "c2"] },
          desktop: { structure: "vertical", components: ["c1", "c2"] },
        },
      }

      const strategy = createPromptStrategy("claude-sonnet-4.5")
      const result = strategy.generatePrompt(schema, "react", "tailwind", {
        targetModel: "claude-sonnet-4.5",
        optimizationLevel: "balanced",
        verbosity: "normal",
      })

      expect(result.success).toBe(true)

      const prompt = result.prompt!

      // Mobile: No side-by-side (stacked)
      expect(prompt).toContain("Mobile")

      // Desktop: Side-by-side
      expect(prompt).toContain("Desktop")
      expect(prompt).toContain("Sidebar (c1), Main (c2)")
      expect(prompt).toContain("SIDE-BY-SIDE")
    })
  })
})
