import { describe, it, expect } from "vitest"
import { UnionFind, calculateConnectedGroups, getConnectedGroup } from "../union-find"

describe("UnionFind", () => {
  describe("constructor", () => {
    it("should initialize with independent elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      expect(uf.find("a")).toBe("a")
      expect(uf.find("b")).toBe("b")
      expect(uf.find("c")).toBe("c")
    })

    it("should handle empty array", () => {
      const uf = new UnionFind<string>([])
      expect(uf.getAllElements()).toEqual([])
    })
  })

  describe("union and find", () => {
    it("should union two elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")

      expect(uf.find("a")).toBe(uf.find("b"))
      expect(uf.find("c")).not.toBe(uf.find("a"))
    })

    it("should handle transitive connections (a-b-c)", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")
      uf.union("b", "c")

      // All three should have the same root
      expect(uf.find("a")).toBe(uf.find("b"))
      expect(uf.find("b")).toBe(uf.find("c"))
      expect(uf.find("a")).toBe(uf.find("c"))
    })

    it("should handle complex graph (diamond shape)", () => {
      const uf = new UnionFind(["a", "b", "c", "d"])

      uf.union("a", "b")
      uf.union("a", "c")
      uf.union("b", "d")
      uf.union("c", "d")

      // All should be connected
      const root = uf.find("a")
      expect(uf.find("b")).toBe(root)
      expect(uf.find("c")).toBe(root)
      expect(uf.find("d")).toBe(root)
    })

    it("should handle union of already connected elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")
      uf.union("a", "b") // Duplicate

      expect(uf.find("a")).toBe(uf.find("b"))
      expect(uf.getGroups().size).toBe(2) // {a,b}, {c}
    })
  })

  describe("isConnected", () => {
    it("should return true for connected elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")

      expect(uf.isConnected("a", "b")).toBe(true)
      expect(uf.isConnected("b", "a")).toBe(true)
    })

    it("should return false for disconnected elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")

      expect(uf.isConnected("a", "c")).toBe(false)
      expect(uf.isConnected("b", "c")).toBe(false)
    })

    it("should return true for transitively connected elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")
      uf.union("b", "c")

      expect(uf.isConnected("a", "c")).toBe(true)
    })
  })

  describe("getGroups", () => {
    it("should return correct groups for independent elements", () => {
      const uf = new UnionFind(["a", "b", "c"])

      const groups = uf.getGroups()

      expect(groups.size).toBe(3)
      expect(Array.from(groups.values()).every((g) => g.size === 1)).toBe(true)
    })

    it("should return correct groups after unions", () => {
      const uf = new UnionFind(["a", "b", "c", "d"])

      uf.union("a", "b")
      uf.union("c", "d")

      const groups = uf.getGroups()

      expect(groups.size).toBe(2)

      const sizes = Array.from(groups.values()).map((g) => g.size).sort()
      expect(sizes).toEqual([2, 2])
    })

    it("should return single group when all connected", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")
      uf.union("b", "c")

      const groups = uf.getGroups()

      expect(groups.size).toBe(1)
      expect(Array.from(groups.values())[0].size).toBe(3)
    })
  })

  describe("getGroupMembers", () => {
    it("should return only self for isolated element", () => {
      const uf = new UnionFind(["a", "b", "c"])

      const members = uf.getGroupMembers("a")

      expect(members.size).toBe(1)
      expect(members.has("a")).toBe(true)
    })

    it("should return all connected members", () => {
      const uf = new UnionFind(["a", "b", "c", "d"])

      uf.union("a", "b")
      uf.union("b", "c")

      const members = uf.getGroupMembers("a")

      expect(members.size).toBe(3)
      expect(members.has("a")).toBe(true)
      expect(members.has("b")).toBe(true)
      expect(members.has("c")).toBe(true)
      expect(members.has("d")).toBe(false)
    })

    it("should return same members for any element in group", () => {
      const uf = new UnionFind(["a", "b", "c"])

      uf.union("a", "b")
      uf.union("b", "c")

      const membersA = uf.getGroupMembers("a")
      const membersB = uf.getGroupMembers("b")
      const membersC = uf.getGroupMembers("c")

      expect(membersA).toEqual(membersB)
      expect(membersB).toEqual(membersC)
    })
  })

  describe("dynamic element addition", () => {
    it("should handle elements not in initial set", () => {
      const uf = new UnionFind(["a", "b"])

      // find() on new element should auto-initialize
      expect(uf.find("c")).toBe("c")

      uf.union("a", "c")
      expect(uf.find("a")).toBe(uf.find("c"))
    })
  })
})

describe("calculateConnectedGroups", () => {
  it("should calculate groups from edges", () => {
    const elements = ["a", "b", "c", "d"]
    const edges = [
      { source: "a", target: "b" },
      { source: "c", target: "d" },
    ]

    const groups = calculateConnectedGroups(elements, edges)

    expect(groups.size).toBe(2)
  })

  it("should handle transitive connections", () => {
    const elements = ["c-1", "c-2", "c-3"]
    const edges = [
      { source: "c-1", target: "c-2" },
      { source: "c-2", target: "c-3" },
    ]

    const groups = calculateConnectedGroups(elements, edges)

    // Should be 1 group with all 3 elements
    expect(groups.size).toBe(1)
    const group = Array.from(groups.values())[0]
    expect(group.size).toBe(3)
    expect(group.has("c-1")).toBe(true)
    expect(group.has("c-2")).toBe(true)
    expect(group.has("c-3")).toBe(true)
  })

  it("should handle empty edges", () => {
    const elements = ["a", "b", "c"]
    const edges: Array<{ source: string; target: string }> = []

    const groups = calculateConnectedGroups(elements, edges)

    expect(groups.size).toBe(3)
    expect(Array.from(groups.values()).every((g) => g.size === 1)).toBe(true)
  })

  it("should handle complex component linking scenario", () => {
    const elements = ["c-1", "c-2", "c-3", "c-4", "c-5"]
    const edges = [
      { source: "c-1", target: "c-2" }, // Footer group
      { source: "c-2", target: "c-3" }, // Footer group (transitive)
      { source: "c-4", target: "c-5" }, // Header group
    ]

    const groups = calculateConnectedGroups(elements, edges)

    // Should have 2 groups: {c-1, c-2, c-3}, {c-4, c-5}
    expect(groups.size).toBe(2)

    const groupSizes = Array.from(groups.values())
      .map((g) => g.size)
      .sort()
    expect(groupSizes).toEqual([2, 3])
  })
})

describe("getConnectedGroup", () => {
  it("should return connected group for element", () => {
    const elements = ["a", "b", "c", "d"]
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ]

    const group = getConnectedGroup("a", elements, edges)

    expect(group).toHaveLength(3)
    expect(group).toContain("a")
    expect(group).toContain("b")
    expect(group).toContain("c")
    expect(group).not.toContain("d")
  })

  it("should return only self for isolated element", () => {
    const elements = ["a", "b", "c"]
    const edges = [{ source: "a", target: "b" }]

    const group = getConnectedGroup("c", elements, edges)

    expect(group).toEqual(["c"])
  })
})

describe("Path Compression optimization", () => {
  it("should compress paths after find operations", () => {
    const uf = new UnionFind(["a", "b", "c", "d", "e"])

    // Create a long chain: a -> b -> c -> d -> e
    uf.union("a", "b")
    uf.union("b", "c")
    uf.union("c", "d")
    uf.union("d", "e")

    // First find on 'e' will compress the path
    const root1 = uf.find("e")

    // Second find should be faster due to path compression
    const root2 = uf.find("e")

    expect(root1).toBe(root2)
    expect(uf.find("a")).toBe(root1)
  })
})

describe("Edge cases", () => {
  it("should handle single element", () => {
    const uf = new UnionFind(["a"])

    expect(uf.find("a")).toBe("a")
    expect(uf.getGroups().size).toBe(1)
    expect(uf.getGroupMembers("a").size).toBe(1)
  })

  it("should handle numeric IDs", () => {
    const uf = new UnionFind([1, 2, 3])

    uf.union(1, 2)

    expect(uf.isConnected(1, 2)).toBe(true)
    expect(uf.isConnected(2, 3)).toBe(false)
  })

  it("should handle string component IDs with hyphens", () => {
    const uf = new UnionFind(["c-1", "c-2", "c-10"])

    uf.union("c-1", "c-2")

    expect(uf.isConnected("c-1", "c-2")).toBe(true)
    expect(uf.isConnected("c-1", "c-10")).toBe(false)
  })

  it("should handle large number of elements efficiently", () => {
    const n = 1000
    const elements = Array.from({ length: n }, (_, i) => `e-${i}`)
    const uf = new UnionFind(elements)

    // Connect all elements sequentially
    const startTime = Date.now()
    for (let i = 0; i < n - 1; i++) {
      uf.union(`e-${i}`, `e-${i + 1}`)
    }
    const unionTime = Date.now() - startTime

    // Check connectivity (should be fast with path compression)
    const findStartTime = Date.now()
    for (let i = 0; i < n; i++) {
      uf.find(`e-${i}`)
    }
    const findTime = Date.now() - findStartTime

    expect(uf.getGroups().size).toBe(1)
    expect(unionTime).toBeLessThan(100) // Should be very fast
    expect(findTime).toBeLessThan(50) // Path compression makes this fast
  })
})
