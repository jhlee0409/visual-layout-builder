import { describe, it, expect, beforeEach } from "vitest"
import { useLayoutStore } from "@/store/layout-store"

/**
 * ExportModal Component Linking Logic Tests
 *
 * Tests the business logic for the component linking prompt flow:
 * - When to show the linking prompt modal
 * - Component linking state management
 * - Edge cases with breakpoints and links
 */
describe("ExportModal Component Linking Logic", () => {
  beforeEach(() => {
    // Reset store to clean state
    useLayoutStore.setState({
      schema: {
        schemaVersion: "2.0",
        components: [],
        breakpoints: [
          { name: "mobile", minWidth: 0, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: "vertical", components: [] },
        },
      },
      currentBreakpoint: "mobile",
      selectedComponentId: null,
      componentLinks: [],
      showLinkingPanel: false,
    })
  })

  describe("shouldShowLinkingPrompt - decision logic", () => {
    it("should NOT show prompt with 0 breakpoints", () => {
      const store = useLayoutStore.getState()
      store.schema.breakpoints = []

      const hasMultipleBreakpoints = store.schema.breakpoints.length >= 2
      const hasNoLinks = store.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(shouldShow).toBe(false)
    })

    it("should NOT show prompt with 1 breakpoint", () => {
      const store = useLayoutStore.getState()
      // Default state has 1 breakpoint (mobile)

      const hasMultipleBreakpoints = store.schema.breakpoints.length >= 2
      const hasNoLinks = store.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(shouldShow).toBe(false)
    })

    it("should show prompt with 2+ breakpoints and no links", () => {
      const store = useLayoutStore.getState()

      // Add second breakpoint
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      const state = useLayoutStore.getState()
      const hasMultipleBreakpoints = state.schema.breakpoints.length >= 2
      const hasNoLinks = state.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(hasMultipleBreakpoints).toBe(true)
      expect(hasNoLinks).toBe(true)
      expect(shouldShow).toBe(true)
    })

    it("should NOT show prompt with 2+ breakpoints but has links", () => {
      const store = useLayoutStore.getState()

      // Add second breakpoint
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      // Add two components
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })

      const state = useLayoutStore.getState()
      const [c1, c2] = state.schema.components

      // Add link
      store.addComponentLink(c1.id, c2.id)

      const finalState = useLayoutStore.getState()
      const hasMultipleBreakpoints = finalState.schema.breakpoints.length >= 2
      const hasNoLinks = finalState.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(hasMultipleBreakpoints).toBe(true)
      expect(hasNoLinks).toBe(false)
      expect(shouldShow).toBe(false)
    })

    it("should show prompt with 3+ breakpoints and no links", () => {
      const store = useLayoutStore.getState()

      // Add multiple breakpoints
      store.addBreakpoint({
        name: "tablet",
        minWidth: 768,
        gridCols: 12,
        gridRows: 8,
      })
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      const state = useLayoutStore.getState()
      const hasMultipleBreakpoints = state.schema.breakpoints.length >= 2
      const hasNoLinks = state.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(state.schema.breakpoints.length).toBe(3)
      expect(hasMultipleBreakpoints).toBe(true)
      expect(hasNoLinks).toBe(true)
      expect(shouldShow).toBe(true)
    })
  })

  describe("Component Linking Panel Integration", () => {
    it("should open linking panel when requested", () => {
      const store = useLayoutStore.getState()

      expect(store.showLinkingPanel).toBe(false)

      // Simulate "Link Components Now" button click
      store.openLinkingPanel()

      const state = useLayoutStore.getState()
      expect(state.showLinkingPanel).toBe(true)
    })

    it("should close linking panel when requested", () => {
      const store = useLayoutStore.getState()

      // Open panel
      store.openLinkingPanel()
      expect(useLayoutStore.getState().showLinkingPanel).toBe(true)

      // Close panel
      store.closeLinkingPanel()
      expect(useLayoutStore.getState().showLinkingPanel).toBe(false)
    })

    it("should maintain links after closing panel", () => {
      const store = useLayoutStore.getState()

      // Add components
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "flex" },
      })

      const state = useLayoutStore.getState()
      const [c1, c2] = state.schema.components

      // Open panel, add link, close panel
      store.openLinkingPanel()
      store.addComponentLink(c1.id, c2.id)
      store.closeLinkingPanel()

      const finalState = useLayoutStore.getState()
      expect(finalState.showLinkingPanel).toBe(false)
      expect(finalState.componentLinks).toHaveLength(1)
      expect(finalState.componentLinks[0]).toEqual({
        source: c1.id,
        target: c2.id,
      })
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty schema gracefully", () => {
      const store = useLayoutStore.getState()

      const hasMultipleBreakpoints = store.schema.breakpoints.length >= 2
      const hasNoLinks = store.componentLinks.length === 0
      const shouldShow = hasMultipleBreakpoints && hasNoLinks

      expect(store.schema.components).toHaveLength(0)
      expect(shouldShow).toBe(false)
    })

    it("should handle adding/removing breakpoints dynamically", () => {
      const store = useLayoutStore.getState()

      // Initially 1 breakpoint
      expect(store.schema.breakpoints.length).toBe(1)

      // Add desktop
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      let state = useLayoutStore.getState()
      let shouldShow = state.schema.breakpoints.length >= 2 && state.componentLinks.length === 0
      expect(shouldShow).toBe(true)

      // Delete desktop
      store.deleteBreakpoint("desktop")

      state = useLayoutStore.getState()
      shouldShow = state.schema.breakpoints.length >= 2 && state.componentLinks.length === 0
      expect(shouldShow).toBe(false)
    })

    it("should handle clearing all links", () => {
      const store = useLayoutStore.getState()

      // Setup: 2 breakpoints, 2 components, 1 link
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })

      const state = useLayoutStore.getState()
      const [c1, c2] = state.schema.components
      store.addComponentLink(c1.id, c2.id)

      // Verify link exists
      let finalState = useLayoutStore.getState()
      expect(finalState.componentLinks).toHaveLength(1)

      // Clear all links
      store.clearAllLinks()

      finalState = useLayoutStore.getState()
      expect(finalState.componentLinks).toHaveLength(0)

      // Should show prompt again after clearing
      const shouldShow = finalState.schema.breakpoints.length >= 2 && finalState.componentLinks.length === 0
      expect(shouldShow).toBe(true)
    })
  })

  describe("Prompt Modal State Management", () => {
    it("should track modal visibility state separately from linking panel", () => {
      const store = useLayoutStore.getState()

      // These are separate concerns
      expect(store.showLinkingPanel).toBe(false)

      // Modal visibility would be component state (showLinkingPromptModal)
      // Panel visibility is store state (showLinkingPanel)

      // Opening panel should not affect modal logic
      store.openLinkingPanel()
      expect(useLayoutStore.getState().showLinkingPanel).toBe(true)
    })

    it("should handle flow: modal → panel → back", () => {
      const store = useLayoutStore.getState()

      // Setup: 2 breakpoints, no links
      store.addBreakpoint({
        name: "desktop",
        minWidth: 1024,
        gridCols: 12,
        gridRows: 8,
      })

      // User clicks "Link Components Now"
      // 1. Modal closes (component state)
      // 2. Panel opens (store state)
      store.openLinkingPanel()

      let state = useLayoutStore.getState()
      expect(state.showLinkingPanel).toBe(true)

      // User adds a link
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })
      store.addComponent({
        name: "Header",
        semanticTag: "header",
        positioning: { type: "fixed" },
        layout: { type: "flex" },
      })

      state = useLayoutStore.getState()
      const [c1, c2] = state.schema.components
      store.addComponentLink(c1.id, c2.id)

      // User closes panel
      store.closeLinkingPanel()

      state = useLayoutStore.getState()
      expect(state.showLinkingPanel).toBe(false)
      expect(state.componentLinks).toHaveLength(1)

      // If user reopens ExportModal, should not show prompt (has links now)
      const shouldShow = state.schema.breakpoints.length >= 2 && state.componentLinks.length === 0
      expect(shouldShow).toBe(false)
    })
  })
})
