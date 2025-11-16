/**
 * Props Validator Tests
 *
 * Tests for ARIA attribute validation
 */

import { describe, it, expect } from "vitest"
import {
  validateARIAProps,
  getRecommendedRole,
  getValidRoles,
  isValidRole,
  type ARIARole,
} from "../props-validator"
import type { SemanticTag } from "@/types/schema"

describe("Props Validator", () => {
  describe("validateARIAProps", () => {
    describe("Valid ARIA roles", () => {
      it("should pass for correct header role", () => {
        const result = validateARIAProps("header", {
          role: "banner",
          "aria-label": "Main navigation",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it("should pass for correct nav role", () => {
        const result = validateARIAProps("nav", {
          role: "navigation",
          "aria-label": "Primary navigation",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it("should pass for correct main role", () => {
        const result = validateARIAProps("main", {
          role: "main",
          "aria-label": "Main content",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it("should pass for correct aside role", () => {
        const result = validateARIAProps("aside", {
          role: "complementary",
          "aria-label": "Related links",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it("should pass for correct footer role", () => {
        const result = validateARIAProps("footer", {
          role: "contentinfo",
          "aria-label": "Site footer",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })

      it("should pass for section with region role and aria-label", () => {
        const result = validateARIAProps("section", {
          role: "region",
          "aria-label": "Hero section",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
        expect(result.warnings.length).toBe(0)
      })

      it("should pass for div with flexible roles", () => {
        const roles: ARIARole[] = ["region", "group", "banner", "navigation", "form"]

        roles.forEach((role) => {
          const result = validateARIAProps("div", { role })
          expect(result.valid).toBe(true)
          expect(result.errors.length).toBe(0)
        })
      })
    })

    describe("Invalid ARIA roles", () => {
      it("should fail for invalid header role", () => {
        const result = validateARIAProps("header", {
          role: "navigation",  // ❌ Invalid
        })

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('Invalid ARIA role "navigation" for <header>')
      })

      it("should fail for invalid nav role", () => {
        const result = validateARIAProps("nav", {
          role: "banner",  // ❌ Invalid
        })

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('Invalid ARIA role "banner" for <nav>')
      })

      it("should fail for invalid main role", () => {
        const result = validateARIAProps("main", {
          role: "complementary",  // ❌ Invalid
        })

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })

      it("should fail for non-string role", () => {
        const result = validateARIAProps("header", {
          role: 123,  // ❌ Must be string
        })

        expect(result.valid).toBe(false)
        expect(result.errors[0]).toContain("ARIA role must be a string")
      })
    })

    describe("ARIA label validation", () => {
      it("should pass for non-empty aria-label", () => {
        const result = validateARIAProps("div", {
          role: "region",
          "aria-label": "Main navigation",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
        expect(result.warnings.length).toBe(0)
      })

      it("should warn for empty aria-label", () => {
        const result = validateARIAProps("header", {
          role: "banner",
          "aria-label": "   ",  // ⚠️ Empty
        })

        expect(result.valid).toBe(true)  // Valid, but warning
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain("should not be empty")
      })

      it("should fail for non-string aria-label", () => {
        const result = validateARIAProps("header", {
          role: "banner",
          "aria-label": 123,  // ❌ Must be string
        })

        expect(result.valid).toBe(false)
        expect(result.errors[0]).toContain("aria-label must be a string")
      })

      it("should warn for region without aria-label", () => {
        const result = validateARIAProps("section", {
          role: "region",
          // ⚠️ Missing aria-label
        })

        expect(result.valid).toBe(true)  // Valid, but warning
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain("should have an aria-label")
      })
    })

    describe("Redundant roles", () => {
      it("should warn for redundant banner role on header", () => {
        const result = validateARIAProps("header", {
          role: "banner",  // ⚠️ Redundant (header implies banner)
        })

        expect(result.valid).toBe(true)  // Valid, but warning
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain("Redundant role")
      })

      it("should warn for redundant navigation role on nav", () => {
        const result = validateARIAProps("nav", {
          role: "navigation",  // ⚠️ Redundant
        })

        expect(result.valid).toBe(true)
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain("Redundant role")
      })

      it("should warn for redundant main role on main", () => {
        const result = validateARIAProps("main", {
          role: "main",  // ⚠️ Redundant
        })

        expect(result.valid).toBe(true)
        expect(result.warnings.length).toBeGreaterThan(0)
      })

      it("should not warn for role=none (explicit opt-out)", () => {
        const result = validateARIAProps("header", {
          role: "none",  // ✅ Valid (explicit opt-out)
        })

        expect(result.valid).toBe(true)
        expect(result.warnings.length).toBe(0)
      })
    })

    describe("Unknown ARIA attributes", () => {
      it("should warn for unknown ARIA attribute", () => {
        const result = validateARIAProps("div", {
          role: "region",
          "aria-labelby": "heading",  // ⚠️ Typo (should be aria-labelledby)
        })

        expect(result.valid).toBe(true)  // Valid, but warning
        expect(result.warnings.length).toBeGreaterThan(0)
        const unknownWarning = result.warnings.find((w) => w.includes("Unknown ARIA attribute"))
        expect(unknownWarning).toBeDefined()
        expect(unknownWarning).toContain("aria-labelby")
      })

      it("should pass for known ARIA attributes", () => {
        const result = validateARIAProps("div", {
          role: "region",
          "aria-label": "Content",
          "aria-labelledby": "heading",
          "aria-describedby": "description",
          "aria-hidden": "false",
          "aria-live": "polite",
          "aria-atomic": "true",
        })

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
        const unknownWarnings = result.warnings.filter((w) => w.includes("Unknown ARIA"))
        expect(unknownWarnings.length).toBe(0)
      })
    })

    describe("No props (undefined)", () => {
      it("should pass when props is undefined", () => {
        const result = validateARIAProps("header", undefined)

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
        expect(result.warnings.length).toBe(0)
      })

      it("should pass when props is empty object", () => {
        const result = validateARIAProps("header", {})

        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
      })
    })
  })

  describe("getRecommendedRole", () => {
    it("should return recommended role for header", () => {
      expect(getRecommendedRole("header")).toBe("banner")
    })

    it("should return recommended role for nav", () => {
      expect(getRecommendedRole("nav")).toBe("navigation")
    })

    it("should return recommended role for main", () => {
      expect(getRecommendedRole("main")).toBe("main")
    })

    it("should return recommended role for aside", () => {
      expect(getRecommendedRole("aside")).toBe("complementary")
    })

    it("should return recommended role for footer", () => {
      expect(getRecommendedRole("footer")).toBe("contentinfo")
    })

    it("should return recommended role for section", () => {
      expect(getRecommendedRole("section")).toBe("region")
    })

    it("should return recommended role for article", () => {
      expect(getRecommendedRole("article")).toBe("article")
    })

    it("should return recommended role for form", () => {
      expect(getRecommendedRole("form")).toBe("form")
    })

    it("should return recommended role for div", () => {
      expect(getRecommendedRole("div")).toBe("region")
    })
  })

  describe("getValidRoles", () => {
    it("should return all valid roles for header", () => {
      const roles = getValidRoles("header")
      expect(roles).toContain("banner")
      expect(roles).toContain("none")
      expect(roles.length).toBe(2)
    })

    it("should return all valid roles for div", () => {
      const roles = getValidRoles("div")
      expect(roles.length).toBeGreaterThan(5)  // div has many valid roles
      expect(roles).toContain("region")
      expect(roles).toContain("group")
      expect(roles).toContain("none")
    })

    it("should return limited roles for main", () => {
      const roles = getValidRoles("main")
      expect(roles).toEqual(["main", "none"])
    })
  })

  describe("isValidRole", () => {
    it("should return true for valid role combinations", () => {
      expect(isValidRole("header", "banner")).toBe(true)
      expect(isValidRole("nav", "navigation")).toBe(true)
      expect(isValidRole("main", "main")).toBe(true)
      expect(isValidRole("aside", "complementary")).toBe(true)
      expect(isValidRole("footer", "contentinfo")).toBe(true)
      expect(isValidRole("section", "region")).toBe(true)
      expect(isValidRole("article", "article")).toBe(true)
      expect(isValidRole("form", "form")).toBe(true)
      expect(isValidRole("div", "region")).toBe(true)
    })

    it("should return false for invalid role combinations", () => {
      expect(isValidRole("header", "navigation")).toBe(false)
      expect(isValidRole("nav", "banner")).toBe(false)
      expect(isValidRole("main", "complementary")).toBe(false)
      expect(isValidRole("aside", "banner")).toBe(false)
      expect(isValidRole("footer", "banner")).toBe(false)
    })

    it("should return true for role=none on all tags", () => {
      const tags: SemanticTag[] = ["header", "nav", "main", "aside", "footer", "section", "article", "div", "form"]

      tags.forEach((tag) => {
        expect(isValidRole(tag, "none")).toBe(true)
      })
    })
  })

  describe("Complex scenarios", () => {
    it("should validate multiple ARIA attributes together", () => {
      const result = validateARIAProps("section", {
        role: "region",
        "aria-label": "Hero section",
        "aria-labelledby": "hero-heading",
        "aria-describedby": "hero-description",
      })

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
      expect(result.warnings.length).toBe(0)
    })

    it("should detect multiple errors", () => {
      const result = validateARIAProps("header", {
        role: 123,  // ❌ Wrong type
        "aria-label": 456,  // ❌ Wrong type
      })

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(2)
    })

    it("should handle props with non-ARIA attributes", () => {
      const result = validateARIAProps("div", {
        role: "region",
        "aria-label": "Content",
        className: "container",  // Regular prop
        children: "Some content",  // Regular prop
        onClick: () => {},  // Event handler
      })

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })
})
