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

/**
 * Layout store state
 */
interface LayoutState extends HistoryActions {
  // Core data
  schema: LaydlerSchema

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
          const currentLayout = state.schema.layouts[state.currentBreakpoint as keyof typeof state.schema.layouts]

          // 업데이트된 스키마 (현재 breakpoint에만 추가)
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

          // Breakpoint Inheritance 적용: Mobile → Tablet → Desktop
          const normalizedSchema = normalizeSchema(updatedSchema)

          return {
            schema: normalizedSchema,
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
          const currentLayout = state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]

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

          // Apply default grid config if not provided
          const breakpointWithDefaults = {
            ...breakpoint,
            gridCols: breakpoint.gridCols ?? DEFAULT_GRID_CONFIG[breakpoint.name as keyof typeof DEFAULT_GRID_CONFIG]?.gridCols ?? 12,
            gridRows: breakpoint.gridRows ?? DEFAULT_GRID_CONFIG[breakpoint.name as keyof typeof DEFAULT_GRID_CONFIG]?.gridRows ?? 8,
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

          // Remove responsiveCanvasLayout for deleted breakpoint from all components
          const components = state.schema.components.map((component) => {
            if (component.responsiveCanvasLayout) {
              const rcl = { ...component.responsiveCanvasLayout }
              delete rcl[name as keyof typeof rcl]

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
          const currentLayout = state.schema.layouts[breakpointName as keyof typeof state.schema.layouts]
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
          const currentLayout = state.schema.layouts[breakpointName as keyof typeof state.schema.layouts]
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
          },
          false,
          "resetSchema"
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
    return state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]
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
      const layout = state.schema.layouts[breakpoint as keyof typeof state.schema.layouts]
      if (!layout) return []

      const componentIds = new Set(layout.components)
      return state.schema.components.filter((c) => componentIds.has(c.id))
    })
  )
}
