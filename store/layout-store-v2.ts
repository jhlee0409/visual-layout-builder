/**
 * Laylder Layout Store V2 (Zustand)
 * Schema V2 지원 - Component Independence 기반
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface HistoryActions {
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
}
import type {
  LaydlerSchemaV2,
  Component,
  Breakpoint,
  ComponentPositioning,
  ComponentLayout,
  ComponentStyling,
  ResponsiveBehavior,
  LayoutConfig,
} from "@/types/schema-v2"
import {
  createEmptySchemaV2,
  generateComponentId,
  cloneSchemaV2,
} from "@/lib/schema-utils-v2"
import { sampleSchemasV2 } from "@/lib/sample-data-v2"

/**
 * Layout store V2 state
 */
interface LayoutStateV2 extends HistoryActions {
  // Core data
  schema: LaydlerSchemaV2

  // UI state
  currentBreakpoint: string // "mobile" | "tablet" | "desktop"
  selectedComponentId: string | null

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

  // Actions: Selection
  setSelectedComponentId: (id: string | null) => void

  // Actions: Schema operations
  exportSchema: () => LaydlerSchemaV2
  importSchema: (schema: LaydlerSchemaV2) => void
  resetSchema: () => void
  loadSampleSchema: (sampleName: "github" | "dashboard" | "marketing" | "cardGallery") => void
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
export const useLayoutStoreV2 = create<LayoutStateV2>()(
  devtools(
    (set, get) => ({
      // Initial state
      schema: createEmptySchemaV2(),
      currentBreakpoint: "mobile",
      selectedComponentId: null,

      // Component management
      addComponent: (componentData) => {
        set((state) => {
          const newId = generateComponentId(state.schema.components)
          const newComponent: Component = {
            id: newId,
            ...componentData,
          }

          // V2: Components are independent, just add to array
          // Layout is managed through LayoutConfig.components array
          const currentLayout = state.schema.layouts[state.currentBreakpoint as keyof typeof state.schema.layouts]

          return {
            schema: {
              ...state.schema,
              components: [...state.schema.components, newComponent],
              layouts: {
                ...state.schema.layouts,
                [state.currentBreakpoint]: {
                  ...currentLayout,
                  components: [...currentLayout.components, newId],
                },
              },
            },
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
            const layout = layouts[breakpoint as keyof typeof layouts]
            layouts[breakpoint as keyof typeof layouts] = {
              ...layout,
              components: layout.components.filter((cid: string) => cid !== id),
            }

            // Remove from roles if present
            if (layout.roles) {
              const newRoles = { ...layout.roles }
              for (const role in newRoles) {
                if (newRoles[role as keyof typeof newRoles] === id) {
                  delete newRoles[role as keyof typeof newRoles]
                }
              }
              layouts[breakpoint as keyof typeof layouts] = {
                ...layouts[breakpoint as keyof typeof layouts],
                roles: Object.keys(newRoles).length > 0 ? newRoles : undefined,
              }
            }
          }

          return {
            schema: {
              ...state.schema,
              components,
              layouts,
            },
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
          const currentLayout = state.schema.layouts[state.currentBreakpoint as keyof typeof state.schema.layouts]

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

      // V2 specific: Component properties updates
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
          const currentLayout = state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]

          // Check if component already exists in layout
          if (currentLayout.components.includes(componentId)) {
            return state
          }

          return {
            schema: {
              ...state.schema,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: {
                  ...currentLayout,
                  components: [...currentLayout.components, componentId],
                },
              },
            },
          }
        }, false, "addComponentToLayout")
      },

      reorderComponentsInLayout: (breakpoint, newOrder) => {
        set((state) => {
          const currentLayout = state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]

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

          // Create empty layout for new breakpoint
          const emptyLayout: LayoutConfig = {
            structure: "vertical",
            components: [],
          }

          return {
            schema: {
              ...state.schema,
              breakpoints: [...state.schema.breakpoints, breakpoint].sort(
                (a, b) => a.minWidth - b.minWidth
              ),
              layouts: {
                ...state.schema.layouts,
                [breakpoint.name]: emptyLayout,
              },
            },
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
            const oldLayout = layouts[oldName as keyof typeof layouts]
            layouts = { ...layouts }
            delete layouts[oldName as keyof typeof layouts]
            layouts[newBreakpoint.name as keyof typeof layouts] = oldLayout
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
          delete layouts[name as keyof typeof layouts]

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
            },
            currentBreakpoint,
          }
        }, false, "deleteBreakpoint")
      },

      // Selection
      setSelectedComponentId: (id) => {
        set({ selectedComponentId: id }, false, "setSelectedComponentId")
      },

      // Schema operations
      exportSchema: () => {
        return cloneSchemaV2(get().schema)
      },

      importSchema: (schema) => {
        set(
          {
            schema: cloneSchemaV2(schema),
            currentBreakpoint: schema.breakpoints[0]?.name || "mobile",
            selectedComponentId: null,
          },
          false,
          "importSchema"
        )
      },

      resetSchema: () => {
        set(
          {
            schema: createEmptySchemaV2(),
            currentBreakpoint: "mobile",
            selectedComponentId: null,
          },
          false,
          "resetSchema"
        )
      },

      loadSampleSchema: (sampleName) => {
        const sample = sampleSchemasV2[sampleName]
        if (!sample) {
          console.error(`Sample schema not found: ${sampleName}`)
          return
        }

        set(
          {
            schema: cloneSchemaV2(sample),
            currentBreakpoint: "mobile",
            selectedComponentId: null,
          },
          false,
          "loadSampleSchema"
        )
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
      name: "laylder-layout-store-v2",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)

/**
 * Selectors for derived state
 */
export const useCurrentLayoutV2 = () => {
  return useLayoutStoreV2((state) => {
    const breakpoint = state.currentBreakpoint
    return state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]
  })
}

export const useCurrentBreakpointConfigV2 = () => {
  return useLayoutStoreV2((state) => {
    const breakpoint = state.currentBreakpoint
    return state.schema.breakpoints.find((bp) => bp.name === breakpoint)
  })
}

export const useSelectedComponentV2 = () => {
  return useLayoutStoreV2((state) => {
    if (!state.selectedComponentId) return null
    return state.schema.components.find((c) => c.id === state.selectedComponentId)
  })
}

export const useComponentsInCurrentLayoutV2 = () => {
  return useLayoutStoreV2((state) => {
    const breakpoint = state.currentBreakpoint
    const layout = state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]
    if (!layout) return []

    const componentIds = new Set(layout.components)

    return state.schema.components.filter((c) => componentIds.has(c.id))
  })
}
