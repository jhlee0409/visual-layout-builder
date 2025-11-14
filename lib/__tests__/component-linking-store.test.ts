import { describe, it, expect, beforeEach } from "vitest"
import { useLayoutStore } from "@/store/layout-store"
import type { Component } from "@/types/schema"

describe("Component Linking Store Actions", () => {
  beforeEach(() => {
    // Reset store before each test
    useLayoutStore.setState({
      schema: {
        schemaVersion: "2.0",
        components: [],
        breakpoints: [
          { name: "mobile", minWidth: 0, gridCols: 12, gridRows: 8 },
          { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: "vertical", components: [] },
          desktop: { structure: "vertical", components: [] },
        },
      },
      currentBreakpoint: "mobile",
      selectedComponentId: null,
      componentLinks: [],
    })
  })

  describe("addComponentLink", () => {
    it("should add link between two components", () => {
      const store = useLayoutStore.getState()

      // Add two components
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      expect(components.length).toBe(2)

      const [c1, c2] = components

      // Link them
      store.addComponentLink(c1.id, c2.id)

      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(1)
      expect(links[0]).toEqual({ source: c1.id, target: c2.id })
    })

    it("should not add duplicate link", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1, c2] = components

      // Add link twice
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c1.id, c2.id)

      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(1)
    })

    it("should not add link with reverse direction as duplicate", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1, c2] = components

      // Add link in both directions
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c2.id, c1.id)

      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(1)
    })

    it("should not add link for non-existent component", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1] = components

      // Try to link with non-existent component
      store.addComponentLink(c1.id, "non-existent-id")

      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(0)
    })

    it("should not link component to itself", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1] = components

      // Try to link component to itself
      store.addComponentLink(c1.id, c1.id)

      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(0)
    })
  })

  describe("removeComponentLink", () => {
    it("should remove existing link", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1, c2] = components

      store.addComponentLink(c1.id, c2.id)
      expect(useLayoutStore.getState().componentLinks).toHaveLength(1)

      store.removeComponentLink(c1.id, c2.id)
      expect(useLayoutStore.getState().componentLinks).toHaveLength(0)
    })

    it("should remove link regardless of direction", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1, c2] = components

      store.addComponentLink(c1.id, c2.id)

      // Remove with reversed direction
      store.removeComponentLink(c2.id, c1.id)

      expect(useLayoutStore.getState().componentLinks).toHaveLength(0)
    })
  })

  describe("clearAllLinks", () => {
    it("should clear all component links", () => {
      const store = useLayoutStore.getState()

      // Add 3 components
      for (let i = 0; i < 3; i++) {
        store.addComponent({
          name: `Component${i}`,
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      const components = useLayoutStore.getState().schema.components
      const [c1, c2, c3] = components

      // Add links
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c2.id, c3.id)

      expect(useLayoutStore.getState().componentLinks).toHaveLength(2)

      // Clear all
      store.clearAllLinks()

      expect(useLayoutStore.getState().componentLinks).toHaveLength(0)
    })
  })

  describe("deleteComponent (orphaned links cleanup)", () => {
    it("should remove all links related to deleted component", () => {
      const store = useLayoutStore.getState()

      // Add 3 components
      for (let i = 0; i < 3; i++) {
        store.addComponent({
          name: `Component${i}`,
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      const components = useLayoutStore.getState().schema.components
      const [c1, c2, c3] = components

      // Add links: c1 - c2, c2 - c3
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c2.id, c3.id)

      expect(useLayoutStore.getState().componentLinks).toHaveLength(2)

      // Delete c2
      store.deleteComponent(c2.id)

      // Both links should be removed (orphaned links cleanup)
      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(0)
    })

    it("should keep unrelated links when deleting component", () => {
      const store = useLayoutStore.getState()

      // Add 4 components
      for (let i = 0; i < 4; i++) {
        store.addComponent({
          name: `Component${i}`,
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      const components = useLayoutStore.getState().schema.components
      const [c1, c2, c3, c4] = components

      // Add links: c1 - c2, c3 - c4
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c3.id, c4.id)

      expect(useLayoutStore.getState().componentLinks).toHaveLength(2)

      // Delete c1
      store.deleteComponent(c1.id)

      // Only c1-c2 link should be removed
      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(1)
      expect(links[0]).toEqual({ source: c3.id, target: c4.id })
    })
  })

  describe("mergeLinkedComponents", () => {
    it("should merge two linked components", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 10, width: 12, height: 2 },
        },
      })

      store.setCurrentBreakpoint("mobile")
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 8, width: 12, height: 2 },
        },
      })

      const components = useLayoutStore.getState().schema.components
      expect(components).toHaveLength(2)

      const [c1, c2] = components

      // Link them
      store.addComponentLink(c1.id, c2.id)

      // Merge
      store.mergeLinkedComponents()

      // Should have 1 component
      const mergedComponents = useLayoutStore.getState().schema.components
      expect(mergedComponents).toHaveLength(1)

      // Should have both responsiveCanvasLayout
      const merged = mergedComponents[0]
      expect(merged.responsiveCanvasLayout).toBeDefined()
      expect(merged.responsiveCanvasLayout?.desktop).toBeDefined()
      expect(merged.responsiveCanvasLayout?.mobile).toBeDefined()
    })

    it("should handle transitive connections (c-1 → c-2 → c-3)", () => {
      const store = useLayoutStore.getState()

      // Add 3 components
      for (let i = 0; i < 3; i++) {
        store.addComponent({
          name: "Footer",
          semanticTag: "footer",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      const components = useLayoutStore.getState().schema.components
      expect(components).toHaveLength(3)

      const [c1, c2, c3] = components

      // Link: c1 → c2, c2 → c3
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c2.id, c3.id)

      // Merge
      store.mergeLinkedComponents()

      // Should have 1 component (all merged)
      const mergedComponents = useLayoutStore.getState().schema.components
      expect(mergedComponents).toHaveLength(1)
    })

    it("should update layouts with merged component ID", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      store.setCurrentBreakpoint("mobile")
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1, c2] = components

      // Link and merge
      store.addComponentLink(c1.id, c2.id)
      store.mergeLinkedComponents()

      // Check layouts
      const { layouts } = useLayoutStore.getState().schema

      // Desktop layout should have c1 (root)
      expect(layouts.desktop.components).toContain(c1.id)
      expect(layouts.desktop.components).not.toContain(c2.id)

      // Mobile layout should also have c1 (merged)
      expect(layouts.mobile.components).toContain(c1.id)
      expect(layouts.mobile.components).not.toContain(c2.id)
    })
  })

  describe("autoLinkSimilarComponents", () => {
    it("should link components with same name and semanticTag", () => {
      const store = useLayoutStore.getState()

      // Add 2 Footer components
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      store.setCurrentBreakpoint("mobile")
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      // Add 1 Header component (should not be linked)
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })

      expect(useLayoutStore.getState().componentLinks).toHaveLength(0)

      // Auto-link
      store.autoLinkSimilarComponents()

      // Should have 1 link (Footer - Footer)
      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(1)
    })

    it("should link multiple similar components sequentially", () => {
      const store = useLayoutStore.getState()

      // Add 3 Footer components
      for (let i = 0; i < 3; i++) {
        store.addComponent({
          name: "Footer",
          semanticTag: "footer",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      // Auto-link
      store.autoLinkSimilarComponents()

      // Should have 2 links (c1-c2, c2-c3)
      const links = useLayoutStore.getState().componentLinks
      expect(links).toHaveLength(2)
    })
  })

  describe("getLinkedComponentGroup", () => {
    it("should return group of linked components", () => {
      const store = useLayoutStore.getState()

      // Add 3 components
      for (let i = 0; i < 3; i++) {
        store.addComponent({
          name: `Component${i}`,
          semanticTag: "div",
          positioning: { type: "static" },
          layout: { type: "flex" },
        })
      }

      const components = useLayoutStore.getState().schema.components
      const [c1, c2, c3] = components

      // Link: c1 - c2, c2 - c3
      store.addComponentLink(c1.id, c2.id)
      store.addComponentLink(c2.id, c3.id)

      // Get group
      const group = store.getLinkedComponentGroup(c1.id)

      expect(group).toHaveLength(3)
      expect(group).toContain(c1.id)
      expect(group).toContain(c2.id)
      expect(group).toContain(c3.id)
    })

    it("should return only self for unlinked component", () => {
      const store = useLayoutStore.getState()

      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const components = useLayoutStore.getState().schema.components
      const [c1] = components

      const group = store.getLinkedComponentGroup(c1.id)

      expect(group).toEqual([c1.id])
    })
  })
})
