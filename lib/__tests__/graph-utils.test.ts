/**
 * Unit Tests for Graph Utilities
 *
 * Tests for component linking graph algorithms and validation
 */

import { describe, it, expect } from "vitest"
import {
  calculateLinkGroups,
  validateComponentLinks,
  getComponentGroup,
  areComponentsLinked,
  type ComponentLink,
} from "../graph-utils"

describe("Graph Utils", () => {
  describe("calculateLinkGroups", () => {
    it("should return empty array for no links", () => {
      const result = calculateLinkGroups([])
      expect(result).toEqual([])
    })

    it("should create single group for two linked components", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(2)
      expect(groups[0]).toContain("c1")
      expect(groups[0]).toContain("c2")
    })

    it("should create single group for chain of linked components", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c3" },
        { source: "c3", target: "c4" },
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(4)
      expect(groups[0]).toContain("c1")
      expect(groups[0]).toContain("c2")
      expect(groups[0]).toContain("c3")
      expect(groups[0]).toContain("c4")
    })

    it("should create multiple groups for disconnected components", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c3", target: "c4" },
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(2)

      // Find groups by checking which contains c1
      const group1 = groups.find((g) => g.includes("c1"))
      const group2 = groups.find((g) => g.includes("c3"))

      expect(group1).toHaveLength(2)
      expect(group1).toContain("c1")
      expect(group1).toContain("c2")

      expect(group2).toHaveLength(2)
      expect(group2).toContain("c3")
      expect(group2).toContain("c4")
    })

    it("should handle complex graph with multiple connections", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c1", target: "c3" },
        { source: "c2", target: "c4" },
        { source: "c5", target: "c6" },
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(2)

      const largeGroup = groups.find((g) => g.length === 4)
      const smallGroup = groups.find((g) => g.length === 2)

      expect(largeGroup).toContain("c1")
      expect(largeGroup).toContain("c2")
      expect(largeGroup).toContain("c3")
      expect(largeGroup).toContain("c4")

      expect(smallGroup).toContain("c5")
      expect(smallGroup).toContain("c6")
    })

    it("should handle bidirectional links (should not create duplicates)", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c1" }, // Bidirectional
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(2)
      expect(groups[0]).toContain("c1")
      expect(groups[0]).toContain("c2")
    })

    it("should handle star topology (one node connected to many)", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c1", target: "c3" },
        { source: "c1", target: "c4" },
        { source: "c1", target: "c5" },
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(5)
      expect(groups[0]).toContain("c1")
      expect(groups[0]).toContain("c2")
      expect(groups[0]).toContain("c3")
      expect(groups[0]).toContain("c4")
      expect(groups[0]).toContain("c5")
    })

    it("should handle cycle (circular links)", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c3" },
        { source: "c3", target: "c1" }, // Creates cycle
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(3)
      expect(groups[0]).toContain("c1")
      expect(groups[0]).toContain("c2")
      expect(groups[0]).toContain("c3")
    })
  })

  describe("validateComponentLinks", () => {
    const validIds = new Set(["c1", "c2", "c3", "c4"])

    it("should validate links with all valid component IDs", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c3", target: "c4" },
      ]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should detect orphaned source component", () => {
      const links: ComponentLink[] = [{ source: "c99", target: "c2" }]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("Source component")
      expect(result.errors[0]).toContain("c99")
      expect(result.errors[0]).toContain("does not exist")
    })

    it("should detect orphaned target component", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c99" }]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("Target component")
      expect(result.errors[0]).toContain("c99")
      expect(result.errors[0]).toContain("does not exist")
    })

    it("should detect both orphaned source and target", () => {
      const links: ComponentLink[] = [{ source: "c98", target: "c99" }]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]).toContain("Source component")
      expect(result.errors[1]).toContain("Target component")
    })

    it("should detect self-loop", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c1" }]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("Self-loop")
      expect(result.errors[0]).toContain("c1")
    })

    it("should detect duplicate links (same direction)", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c1", target: "c2" }, // Duplicate
      ]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("Duplicate link")
    })

    it("should detect duplicate links (reverse direction)", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c1" }, // Reverse duplicate
      ]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("Duplicate link")
    })

    it("should detect multiple errors at once", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c1" }, // Self-loop
        { source: "c99", target: "c2" }, // Orphaned source
        { source: "c1", target: "c98" }, // Orphaned target
        { source: "c2", target: "c3" },
        { source: "c3", target: "c2" }, // Duplicate
      ]
      const result = validateComponentLinks(links, validIds)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it("should validate empty links array", () => {
      const result = validateComponentLinks([], validIds)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe("getComponentGroup", () => {
    it("should return single-member group for component not in any link (default)", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = getComponentGroup("c3", links)

      expect(result).toBeDefined()
      expect(result).toEqual(["c3"])
    })

    it("should return undefined for component not in any link when validateId=true", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = getComponentGroup("c3", links, true)

      expect(result).toBeUndefined()
    })

    it("should return group containing the component", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c3" },
      ]
      const result = getComponentGroup("c2", links)

      expect(result).toBeDefined()
      expect(result).toHaveLength(3)
      expect(result).toContain("c1")
      expect(result).toContain("c2")
      expect(result).toContain("c3")
    })

    it("should return correct group when multiple groups exist", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c3", target: "c4" },
      ]
      const result = getComponentGroup("c3", links)

      expect(result).toBeDefined()
      expect(result).toHaveLength(2)
      expect(result).toContain("c3")
      expect(result).toContain("c4")
      expect(result).not.toContain("c1")
      expect(result).not.toContain("c2")
    })

    it("should return undefined for empty links when validateId=true", () => {
      const result = getComponentGroup("c1", [], true)

      expect(result).toBeUndefined()
    })

    it("should return single-member group for empty links (default behavior)", () => {
      const result = getComponentGroup("c1", [])

      expect(result).toBeDefined()
      expect(result).toEqual(["c1"])
    })
  })

  describe("areComponentsLinked", () => {
    it("should return false when no links exist", () => {
      const result = areComponentsLinked("c1", "c2", [])

      expect(result).toBe(false)
    })

    it("should return true for directly linked components", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c1", "c2", links)

      expect(result).toBe(true)
    })

    it("should return true for reverse linked components", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c2", "c1", links)

      expect(result).toBe(true) // Undirected graph
    })

    it("should return true for transitively linked components", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c2", target: "c3" },
      ]
      const result = areComponentsLinked("c1", "c3", links)

      expect(result).toBe(true) // c1-c2-c3 are all in same group
    })

    it("should return false for components in different groups", () => {
      const links: ComponentLink[] = [
        { source: "c1", target: "c2" },
        { source: "c3", target: "c4" },
      ]
      const result = areComponentsLinked("c1", "c3", links)

      expect(result).toBe(false)
    })

    it("should return false when one component is not in any group", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c1", "c99", links)

      expect(result).toBe(false)
    })

    it("should return false when both components are not in any group", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c98", "c99", links)

      expect(result).toBe(false)
    })

    it("should handle self-check (component with itself)", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c1", "c1", links)

      // Component is always in same group as itself IF it's in any group
      expect(result).toBe(true)
    })

    it("should return false for self-check when not in any group", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = areComponentsLinked("c99", "c99", links)

      expect(result).toBe(false)
    })
  })

  describe("Edge Cases and Performance", () => {
    it("should handle large number of links efficiently", () => {
      // Create 100 components in a chain
      const links: ComponentLink[] = []
      for (let i = 1; i < 100; i++) {
        links.push({ source: `c${i}`, target: `c${i + 1}` })
      }

      const startTime = performance.now()
      const groups = calculateLinkGroups(links)
      const endTime = performance.now()

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(50) // Should be fast (< 50ms)
    })

    it("should handle many disconnected groups", () => {
      // Create 50 separate groups of 2 components each
      const links: ComponentLink[] = []
      for (let i = 0; i < 50; i++) {
        links.push({ source: `c${i * 2}`, target: `c${i * 2 + 1}` })
      }

      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(50)
      groups.forEach((group) => {
        expect(group).toHaveLength(2)
      })
    })

    it("should handle component IDs with special characters", () => {
      const links: ComponentLink[] = [
        { source: "c-1-mobile", target: "c-1-desktop" },
        { source: "c_2_mobile", target: "c_2_tablet" },
      ]
      const groups = calculateLinkGroups(links)

      expect(groups).toHaveLength(2)
    })

    it("should validate with empty component ID set", () => {
      const links: ComponentLink[] = [{ source: "c1", target: "c2" }]
      const result = validateComponentLinks(links, new Set())

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2) // Both source and target are orphaned
    })
  })
})
