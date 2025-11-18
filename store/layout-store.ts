/**
 * Laylder Layout Store (Zustand)
 * Schema 지원 - Component Independence 기반
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

interface HistoryActions {
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
}
import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  ComponentPositioning,
  ComponentLayout,
  ComponentStyling,
  ResponsiveBehavior,
  LayoutConfig,
} from "@/types/schema"
import {
  createEmptySchema,
  createSchemaWithBreakpoint,
  generateComponentId,
  cloneSchema,
  normalizeSchema,
  GRID_CONSTRAINTS,
  DEFAULT_GRID_CONFIG,
} from "@/lib/schema-utils"
import { calculateMinimumGridSize } from "@/lib/grid-constraints"
import { UnionFind, calculateConnectedGroups } from "@/lib/union-find"
import type { ResponsiveCanvasLayout } from "@/types/schema"

/**
 * Layout store state
 */
interface LayoutState extends HistoryActions {
  // Core data
  schema: LaydlerSchema

  // UI state
  currentBreakpoint: string // "mobile" | "tablet" | "desktop"
  selectedComponentId: string | null
  showLinkingPanel: boolean // Whether to show the Component Linking panel

  // Component Links (for responsive component linking across breakpoints)
  componentLinks: Array<{ source: string; target: string }>

  // Actions: Component management
  addComponent: (component: Omit<Component, "id">) => void
  updateComponent: (id: string, updates: Partial<Omit<Component, "id">>) => void
  deleteComponent: (id: string) => void
  duplicateComponent: (id: string) => void

  // Actions: Component properties (V2 specific)
  updateComponentPositioning: (id: string, positioning: ComponentPositioning) => void
  updateComponentLayout: (id: string, layout: ComponentLayout) => void
  updateComponentStyling: (id: string, styling: ComponentStyling) => void
  updateComponentResponsive: (id: string, responsive: ResponsiveBehavior) => void

  // Actions: Layout management (V2 - simplified)
  updateLayout: (breakpoint: string, layout: LayoutConfig) => void
  addComponentToLayout: (breakpoint: string, componentId: string) => void
  reorderComponentsInLayout: (breakpoint: string, newOrder: string[]) => void

  // Actions: Breakpoint management
  setCurrentBreakpoint: (breakpoint: string) => void
  addBreakpoint: (breakpoint: Breakpoint) => void
  updateBreakpoint: (oldName: string, newBreakpoint: Breakpoint) => void
  deleteBreakpoint: (name: string) => void

  // Actions: Grid management
  addGridRow: (breakpointName: string) => void
  addGridColumn: (breakpointName: string) => void
  removeGridRow: (breakpointName: string) => void
  removeGridColumn: (breakpointName: string) => void

  // Actions: Selection
  setSelectedComponentId: (id: string | null) => void

  // Actions: Schema operations
  exportSchema: () => LaydlerSchema
  importSchema: (schema: LaydlerSchema) => void
  initializeSchema: (breakpointType: "mobile" | "tablet" | "desktop") => void
  resetSchema: () => void

  // Actions: Component Linking (for responsive component management)
  addComponentLink: (sourceId: string, targetId: string) => void
  removeComponentLink: (sourceId: string, targetId: string) => void
  clearAllLinks: () => void
  getLinkedComponentGroup: (componentId: string) => string[]

  // Actions: UI state management
  setShowLinkingPanel: (show: boolean) => void
  openLinkingPanel: () => void
  closeLinkingPanel: () => void
}


/**
 * Theme state for V2
 */
interface ThemeState {
  currentTheme: string // theme ID
  setTheme: (themeId: string) => void
}

/**
 * Create layout store V2
 */
export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      // Initial state - 빈 스키마로 시작 (사용자가 브레이크포인트 선택 후 초기화)
      schema: {
        schemaVersion: "2.0",
        components: [],
        breakpoints: [],
        layouts: {
          mobile: { structure: "vertical", components: [] },
          tablet: { structure: "vertical", components: [] },
          desktop: { structure: "vertical", components: [] },
        },
      },
      currentBreakpoint: "mobile",
      selectedComponentId: null,
      showLinkingPanel: false,
      componentLinks: [],

      // Component management
      addComponent: (componentData) => {
        set((state) => {
          const newId = generateComponentId(state.schema.components)
          const newComponent: Component = {
            ...componentData,
            id: newId,  // Override with generated ID (must be last to ensure it's not overwritten)
          }

          //: Components are independent, just add to array
          // Layout is managed through LayoutConfig.components array
          const currentLayout = state.schema.layouts[state.currentBreakpoint]

          // 업데이트된 스키마 (현재 breakpoint에만 추가)
          // ⚠️ CRITICAL: normalizeSchema()를 호출하지 않음
          // 이유: 사용자가 breakpoint별로 독립적으로 컴포넌트를 추가할 수 있도록 함
          // Component Links로 cross-breakpoint relationships를 명시적으로 관리
          const updatedSchema: LaydlerSchema = {
            ...state.schema,
            components: [...state.schema.components, newComponent],
            layouts: {
              ...state.schema.layouts,
              [state.currentBreakpoint]: {
                ...currentLayout,
                components: [...currentLayout.components, newId],
              },
            },
          }

          return {
            schema: updatedSchema,
          }
        }, false, "addComponent")
      },

      updateComponent: (id, updates) => {
        set((state) => {
          const components = state.schema.components.map((component) =>
            component.id === id ? { ...component, ...updates } : component
          )

          return {
            schema: {
              ...state.schema,
              components,
            },
          }
        }, false, "updateComponent")
      },

      deleteComponent: (id) => {
        set((state) => {
          // Remove component from components array
          const components = state.schema.components.filter((c) => c.id !== id)

          // Remove component from all layout configs
          const layouts = { ...state.schema.layouts }
          for (const breakpoint in layouts) {
            const layout = layouts[breakpoint]
            layouts[breakpoint] = {
              ...layout,
              components: layout.components.filter((cid: string) => cid !== id),
            }

            // Remove from roles if present
            if (layout.roles) {
              const newRoles = { ...layout.roles }
              // Use Object.keys with proper typing to avoid type assertions
              ;(Object.keys(newRoles) as Array<keyof typeof newRoles>).forEach(
                (role) => {
                  if (newRoles[role] === id) {
                    delete newRoles[role]
                  }
                }
              )
              layouts[breakpoint] = {
                ...layouts[breakpoint],
                roles: Object.keys(newRoles).length > 0 ? newRoles : undefined,
              }
            }
          }

          // Remove all component links related to this component (orphaned links cleanup)
          const componentLinks = state.componentLinks.filter(
            (link) => link.source !== id && link.target !== id
          )

          return {
            schema: {
              ...state.schema,
              components,
              layouts,
            },
            componentLinks,
            selectedComponentId:
              state.selectedComponentId === id ? null : state.selectedComponentId,
          }
        }, false, "deleteComponent")
      },

      duplicateComponent: (id) => {
        set((state) => {
          // Find component to duplicate
          const originalComponent = state.schema.components.find((c) => c.id === id)
          if (!originalComponent) return state

          // Create duplicate with new ID
          const newId = generateComponentId(state.schema.components)
          const duplicateComponent: Component = {
            ...originalComponent,
            id: newId,
            name: `${originalComponent.name} Copy`,
          }

          // Add duplicate to current breakpoint's layout
          const currentLayout = state.schema.layouts[state.currentBreakpoint]

          return {
            schema: {
              ...state.schema,
              components: [...state.schema.components, duplicateComponent],
              layouts: {
                ...state.schema.layouts,
                [state.currentBreakpoint]: {
                  ...currentLayout,
                  components: [...currentLayout.components, newId],
                },
              },
            },
            selectedComponentId: newId, // Auto-select duplicated component
          }
        }, false, "duplicateComponent")
      },

      // specific: Component properties updates
      updateComponentPositioning: (id, positioning) => {
        set((state) => {
          const components = state.schema.components.map((component) =>
            component.id === id ? { ...component, positioning } : component
          )

          return {
            schema: {
              ...state.schema,
              components,
            },
          }
        }, false, "updateComponentPositioning")
      },

      updateComponentLayout: (id, layout) => {
        set((state) => {
          const components = state.schema.components.map((component) =>
            component.id === id ? { ...component, layout } : component
          )

          return {
            schema: {
              ...state.schema,
              components,
            },
          }
        }, false, "updateComponentLayout")
      },

      updateComponentStyling: (id, styling) => {
        set((state) => {
          const components = state.schema.components.map((component) =>
            component.id === id ? { ...component, styling } : component
          )

          return {
            schema: {
              ...state.schema,
              components,
            },
          }
        }, false, "updateComponentStyling")
      },

      updateComponentResponsive: (id, responsive) => {
        set((state) => {
          const components = state.schema.components.map((component) =>
            component.id === id ? { ...component, responsive } : component
          )

          return {
            schema: {
              ...state.schema,
              components,
            },
          }
        }, false, "updateComponentResponsive")
      },

      // Layout management (V2 - simplified, no grid-template-areas)
      updateLayout: (breakpoint, layout) => {
        set((state) => {
          return {
            schema: {
              ...state.schema,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: layout,
              },
            },
          }
        }, false, "updateLayout")
      },

      addComponentToLayout: (breakpoint, componentId) => {
        set((state) => {
          const currentLayout = state.schema.layouts[breakpoint]

          // Check if component already exists in layout
          if (currentLayout.components.includes(componentId)) {
            return state
          }

          // 업데이트된 스키마 (특정 breakpoint에만 추가)
          const updatedSchema: LaydlerSchema = {
            ...state.schema,
            layouts: {
              ...state.schema.layouts,
              [breakpoint]: {
                ...currentLayout,
                components: [...currentLayout.components, componentId],
              },
            },
          }

          // Breakpoint Inheritance 적용: Mobile → Tablet → Desktop
          const normalizedSchema = normalizeSchema(updatedSchema)

          return {
            schema: normalizedSchema,
          }
        }, false, "addComponentToLayout")
      },

      reorderComponentsInLayout: (breakpoint, newOrder) => {
        set((state) => {
          const currentLayout = state.schema.layouts[breakpoint]

          return {
            schema: {
              ...state.schema,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: {
                  ...currentLayout,
                  components: newOrder,
                },
              },
            },
          }
        }, false, "reorderComponentsInLayout")
      },

      // Breakpoint management
      setCurrentBreakpoint: (breakpoint) => {
        set({ currentBreakpoint: breakpoint }, false, "setCurrentBreakpoint")
      },

      addBreakpoint: (breakpoint) => {
        set((state) => {
          // Check if breakpoint already exists
          const exists = state.schema.breakpoints.some(
            (bp) => bp.name === breakpoint.name
          )
          if (exists) return state

          // Apply default grid config if not provided
          const breakpointWithDefaults = {
            ...breakpoint,
            gridCols: breakpoint.gridCols ?? DEFAULT_GRID_CONFIG[breakpoint.name]?.gridCols ?? 12,
            gridRows: breakpoint.gridRows ?? DEFAULT_GRID_CONFIG[breakpoint.name]?.gridRows ?? 8,
          }

          // Create empty layout for new breakpoint
          const emptyLayout: LayoutConfig = {
            structure: "vertical",
            components: [],
          }

          // Create updated schema
          const updatedSchema: LaydlerSchema = {
            ...state.schema,
            breakpoints: [...state.schema.breakpoints, breakpointWithDefaults].sort(
              (a, b) => a.minWidth - b.minWidth
            ),
            layouts: {
              ...state.schema.layouts,
              [breakpoint.name]: emptyLayout,
            },
          }

          // Apply normalization to handle component responsiveCanvasLayout inheritance
          const normalizedSchema = normalizeSchema(updatedSchema)

          return {
            schema: normalizedSchema,
          }
        }, false, "addBreakpoint")
      },

      updateBreakpoint: (oldName, newBreakpoint) => {
        set((state) => {
          // Update breakpoint in array
          const breakpoints = state.schema.breakpoints.map((bp) =>
            bp.name === oldName ? newBreakpoint : bp
          )

          // If name changed, update layouts keys
          let layouts = state.schema.layouts
          if (oldName !== newBreakpoint.name) {
            const oldLayout = layouts[oldName]
            layouts = { ...layouts }
            delete layouts[oldName]
            layouts[newBreakpoint.name] = oldLayout
          }

          return {
            schema: {
              ...state.schema,
              breakpoints: breakpoints.sort((a, b) => a.minWidth - b.minWidth),
              layouts,
            },
            currentBreakpoint:
              state.currentBreakpoint === oldName
                ? newBreakpoint.name
                : state.currentBreakpoint,
          }
        }, false, "updateBreakpoint")
      },

      deleteBreakpoint: (name) => {
        set((state) => {
          // Don't allow deleting if only one breakpoint left
          if (state.schema.breakpoints.length <= 1) return state

          const breakpoints = state.schema.breakpoints.filter(
            (bp) => bp.name !== name
          )
          const layouts = { ...state.schema.layouts }
          delete layouts[name]

          // Remove responsiveCanvasLayout for deleted breakpoint from all components
          const components = state.schema.components.map((component) => {
            if (component.responsiveCanvasLayout) {
              const rcl = { ...component.responsiveCanvasLayout }
              delete rcl[name]

              // If no layouts left, remove responsiveCanvasLayout entirely
              const hasLayouts = Object.keys(rcl).length > 0
              return hasLayouts
                ? { ...component, responsiveCanvasLayout: rcl }
                : { ...component, responsiveCanvasLayout: undefined }
            }
            return component
          })

          // If deleted breakpoint was selected, switch to first available
          let currentBreakpoint = state.currentBreakpoint
          if (currentBreakpoint === name) {
            currentBreakpoint = breakpoints[0].name
          }

          return {
            schema: {
              ...state.schema,
              breakpoints,
              layouts,
              components,
            },
            currentBreakpoint,
          }
        }, false, "deleteBreakpoint")
      },

      // Grid management
      addGridRow: (breakpointName) => {
        set((state) => {
          const breakpoints = state.schema.breakpoints.map((bp) => {
            if (bp.name === breakpointName) {
              const newGridRows = Math.min(bp.gridRows + 1, GRID_CONSTRAINTS.maxRows)
              return { ...bp, gridRows: newGridRows }
            }
            return bp
          })

          return {
            schema: {
              ...state.schema,
              breakpoints,
            },
          }
        }, false, "addGridRow")
      },

      addGridColumn: (breakpointName) => {
        set((state) => {
          const breakpoints = state.schema.breakpoints.map((bp) => {
            if (bp.name === breakpointName) {
              const newGridCols = Math.min(bp.gridCols + 1, GRID_CONSTRAINTS.maxCols)
              return { ...bp, gridCols: newGridCols }
            }
            return bp
          })

          return {
            schema: {
              ...state.schema,
              breakpoints,
            },
          }
        }, false, "addGridColumn")
      },

      removeGridRow: (breakpointName) => {
        set((state) => {
          // Get components in current breakpoint's layout
          const currentLayout = state.schema.layouts[breakpointName]
          const componentIds = new Set(currentLayout.components)
          const components = state.schema.components.filter((c) => componentIds.has(c.id))

          // Find current breakpoint config
          const bp = state.schema.breakpoints.find((b) => b.name === breakpointName)
          if (!bp) return state

          const newGridRows = bp.gridRows - 1

          // Calculate dynamic minimum based on component positions
          const { minRows } = calculateMinimumGridSize(components, breakpointName)
          const absoluteMin = Math.max(GRID_CONSTRAINTS.minRows, minRows)

          // Validate: Don't allow reducing if it would clip components
          if (newGridRows < absoluteMin) {
            console.warn(
              `❌ Cannot reduce rows to ${newGridRows}: Components occupy up to row ${minRows}. Minimum required: ${absoluteMin}`
            )
            return state // Reject the change
          }

          // Safe to reduce
          const breakpoints = state.schema.breakpoints.map((b) => {
            if (b.name === breakpointName) {
              return { ...b, gridRows: newGridRows }
            }
            return b
          })

          return {
            schema: {
              ...state.schema,
              breakpoints,
            },
          }
        }, false, "removeGridRow")
      },

      removeGridColumn: (breakpointName) => {
        set((state) => {
          // Get components in current breakpoint's layout
          const currentLayout = state.schema.layouts[breakpointName]
          const componentIds = new Set(currentLayout.components)
          const components = state.schema.components.filter((c) => componentIds.has(c.id))

          // Find current breakpoint config
          const bp = state.schema.breakpoints.find((b) => b.name === breakpointName)
          if (!bp) return state

          const newGridCols = bp.gridCols - 1

          // Calculate dynamic minimum based on component positions
          const { minCols } = calculateMinimumGridSize(components, breakpointName)
          const absoluteMin = Math.max(GRID_CONSTRAINTS.minCols, minCols)

          // Validate: Don't allow reducing if it would clip components
          if (newGridCols < absoluteMin) {
            console.warn(
              `❌ Cannot reduce columns to ${newGridCols}: Components occupy up to column ${minCols}. Minimum required: ${absoluteMin}`
            )
            return state // Reject the change
          }

          // Safe to reduce
          const breakpoints = state.schema.breakpoints.map((b) => {
            if (b.name === breakpointName) {
              return { ...b, gridCols: newGridCols }
            }
            return b
          })

          return {
            schema: {
              ...state.schema,
              breakpoints,
            },
          }
        }, false, "removeGridColumn")
      },

      // Selection
      setSelectedComponentId: (id) => {
        set({ selectedComponentId: id }, false, "setSelectedComponentId")
      },

      // Schema operations
      exportSchema: () => {
        return cloneSchema(get().schema)
      },

      importSchema: (schema) => {
        set(
          {
            schema: cloneSchema(schema),
            currentBreakpoint: schema.breakpoints[0]?.name || "mobile",
            selectedComponentId: null,
          },
          false,
          "importSchema"
        )
      },

      initializeSchema: (breakpointType) => {
        set(
          {
            schema: createSchemaWithBreakpoint(breakpointType),
            currentBreakpoint: breakpointType,
            selectedComponentId: null,
          },
          false,
          "initializeSchema"
        )
      },

      resetSchema: () => {
        set(
          {
            schema: createEmptySchema(),
            currentBreakpoint: "mobile",
            selectedComponentId: null,
            componentLinks: [],
          },
          false,
          "resetSchema"
        )
      },

      // Component Linking actions
      addComponentLink: (sourceId, targetId) => {
        const state = get()

        // Validation: Check if both components exist
        const sourceExists = state.schema.components.some((c) => c.id === sourceId)
        const targetExists = state.schema.components.some((c) => c.id === targetId)

        if (!sourceExists) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Cannot link: source component "${sourceId}" does not exist`)
          }
          return
        }

        if (!targetExists) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Cannot link: target component "${targetId}" does not exist`)
          }
          return
        }

        // Validation: Cannot link component to itself
        if (sourceId === targetId) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Cannot link component "${sourceId}" to itself`)
          }
          return
        }

        set((state) => {
          // 중복 체크 (exact same link already exists)
          const exists = state.componentLinks.some(
            (link) =>
              (link.source === sourceId && link.target === targetId) ||
              (link.source === targetId && link.target === sourceId)
          )

          if (exists) return state

          // 1-to-1 Constraint: Remove any existing links for source component
          const sourceExistingLink = state.componentLinks.find(
            (link) => link.source === sourceId || link.target === sourceId
          )

          // 1-to-1 Constraint: Remove any existing links for target component
          const targetExistingLink = state.componentLinks.find(
            (link) => link.source === targetId || link.target === targetId
          )

          // Filter out existing links for both source and target
          let updatedLinks = state.componentLinks

          if (sourceExistingLink) {
            if (process.env.NODE_ENV === "development") {
              console.log(`[Store] Removing source's existing link: ${sourceExistingLink.source} ↔ ${sourceExistingLink.target}`)
            }
            updatedLinks = updatedLinks.filter(
              (link) =>
                !(
                  (link.source === sourceExistingLink.source && link.target === sourceExistingLink.target) ||
                  (link.source === sourceExistingLink.target && link.target === sourceExistingLink.source)
                )
            )
          }

          if (targetExistingLink && targetExistingLink !== sourceExistingLink) {
            if (process.env.NODE_ENV === "development") {
              console.log(`[Store] Removing target's existing link: ${targetExistingLink.source} ↔ ${targetExistingLink.target}`)
            }
            updatedLinks = updatedLinks.filter(
              (link) =>
                !(
                  (link.source === targetExistingLink.source && link.target === targetExistingLink.target) ||
                  (link.source === targetExistingLink.target && link.target === targetExistingLink.source)
                )
            )
          }

          // Add new link
          return {
            componentLinks: [
              ...updatedLinks,
              { source: sourceId, target: targetId },
            ],
          }
        }, false, "addComponentLink")
      },

      removeComponentLink: (sourceId, targetId) => {
        set((state) => ({
          componentLinks: state.componentLinks.filter(
            (link) =>
              !(
                (link.source === sourceId && link.target === targetId) ||
                (link.source === targetId && link.target === sourceId)
              )
          ),
        }), false, "removeComponentLink")
      },

      clearAllLinks: () => {
        set(
          { componentLinks: [] },
          false,
          "clearAllLinks"
        )
      },

      getLinkedComponentGroup: (componentId) => {
        const state = get()
        const componentIds = state.schema.components.map((c) => c.id)

        // Union-Find로 그룹 계산
        const groups = calculateConnectedGroups(componentIds, state.componentLinks)

        // componentId가 속한 그룹 찾기
        for (const [, members] of groups.entries()) {
          if (members.has(componentId)) {
            return Array.from(members)
          }
        }

        return [componentId] // 연결 없으면 자기 자신만
      },

      // UI state management
      setShowLinkingPanel: (show) => {
        set({ showLinkingPanel: show }, false, "setShowLinkingPanel")
      },

      openLinkingPanel: () => {
        set({ showLinkingPanel: true }, false, "openLinkingPanel")
      },

      closeLinkingPanel: () => {
        set({ showLinkingPanel: false }, false, "closeLinkingPanel")
      },

      // History actions (간단 구현)
      undo: () => {
        // TODO: Implement history tracking
        console.log("Undo not yet implemented")
      },
      redo: () => {
        // TODO: Implement history tracking
        console.log("Redo not yet implemented")
      },
      canUndo: () => false,
      canRedo: () => false,
      clearHistory: () => {
        console.log("Clear history not yet implemented")
      },
    }),
    {
      name: "laylder-layout-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)

/**
 * Selectors for derived state
 */
export const useCurrentLayout = () => {
  return useLayoutStore((state) => {
    const breakpoint = state.currentBreakpoint
    return state.schema.layouts[breakpoint]
  })
}

export const useCurrentBreakpointConfig = () => {
  return useLayoutStore((state) => {
    const breakpoint = state.currentBreakpoint
    return state.schema.breakpoints.find((bp) => bp.name === breakpoint)
  })
}

export const useSelectedComponent = () => {
  return useLayoutStore((state) => {
    if (!state.selectedComponentId) return null
    return state.schema.components.find((c) => c.id === state.selectedComponentId)
  })
}

export const useComponentsInCurrentLayout = () => {
  return useLayoutStore(
    useShallow((state) => {
      const breakpoint = state.currentBreakpoint
      const layout = state.schema.layouts[breakpoint]
      if (!layout) return []

      const componentIds = new Set(layout.components)
      return state.schema.components.filter((c) => componentIds.has(c.id))
    })
  )
}
