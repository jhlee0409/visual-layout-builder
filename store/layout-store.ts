/**
 * Laylder Layout Store (Zustand)
 * Central state management for layout design
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  GridLayout,
} from "@/types/schema"
import {
  createEmptySchema,
  generateComponentId,
  cloneSchema,
} from "@/lib/schema-utils"
import { sampleSchema } from "@/lib/sample-data"

/**
 * Layout store state
 */
interface LayoutState {
  // Core data
  schema: LaydlerSchema

  // UI state
  currentBreakpoint: string // "mobile" | "tablet" | "desktop"
  selectedComponentId: string | null // ID of component being edited in properties panel

  // Actions: Component management
  addComponent: (component: Omit<Component, "id">) => void
  updateComponent: (id: string, updates: Partial<Omit<Component, "id">>) => void
  deleteComponent: (id: string) => void

  // Actions: Grid layout management
  updateGridLayout: (breakpoint: string, layout: GridLayout) => void
  updateGridAreas: (breakpoint: string, areas: string[][]) => void
  updateGridSize: (breakpoint: string, gridRows: number, gridCols: number) => void

  // Actions: Breakpoint management
  setCurrentBreakpoint: (breakpoint: string) => void
  addBreakpoint: (breakpoint: Breakpoint) => void
  updateBreakpoint: (oldName: string, newBreakpoint: Breakpoint) => void
  deleteBreakpoint: (name: string) => void

  // Actions: Selection
  setSelectedComponentId: (id: string | null) => void

  // Actions: Schema operations
  exportSchema: () => LaydlerSchema
  importSchema: (schema: LaydlerSchema) => void
  resetSchema: () => void
  loadSampleSchema: () => void
}

/**
 * Create layout store
 */
export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      // Initial state
      schema: createEmptySchema(),
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

          // Auto-place component in current breakpoint's grid
          const currentLayout = state.schema.layouts[state.currentBreakpoint]
          const areas = currentLayout?.grid.areas || [[""]]

          // Find first empty cell
          let placed = false
          const newAreas = areas.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (!placed && cell === "") {
                placed = true
                return newId
              }
              return cell
            })
          )

          // If no empty cell found, add a new row
          if (!placed) {
            const cols = areas[0]?.length || 1
            const newRow = Array(cols).fill("").map((_, idx) => idx === 0 ? newId : "")
            newAreas.push(newRow)
          }

          return {
            schema: {
              ...state.schema,
              components: [...state.schema.components, newComponent],
              layouts: {
                ...state.schema.layouts,
                [state.currentBreakpoint]: {
                  grid: {
                    ...currentLayout.grid,
                    areas: newAreas,
                  },
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

          // Remove component from all grid layouts
          const layouts = { ...state.schema.layouts }
          for (const breakpoint in layouts) {
            const layout = layouts[breakpoint]
            layouts[breakpoint] = {
              grid: {
                ...layout.grid,
                areas: layout.grid.areas.map((row) =>
                  row.map((cellId) => (cellId === id ? "" : cellId))
                ),
              },
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

      // Grid layout management
      updateGridLayout: (breakpoint, layout) => {
        set((state) => {
          return {
            schema: {
              ...state.schema,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: { grid: layout },
              },
            },
          }
        }, false, "updateGridLayout")
      },

      updateGridAreas: (breakpoint, areas) => {
        set((state) => {
          const currentLayout = state.schema.layouts[breakpoint]
          if (!currentLayout) return state

          return {
            schema: {
              ...state.schema,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: {
                  grid: {
                    ...currentLayout.grid,
                    areas,
                  },
                },
              },
            },
          }
        }, false, "updateGridAreas")
      },

      updateGridSize: (breakpoint, gridRows, gridCols) => {
        set((state) => {
          const currentLayout = state.schema.layouts[breakpoint]
          if (!currentLayout) return state

          // Update breakpoint config
          const breakpoints = state.schema.breakpoints.map((bp) =>
            bp.name === breakpoint ? { ...bp, gridRows, gridCols } : bp
          )

          // Resize areas array
          const oldAreas = currentLayout.grid.areas
          const newAreas: string[][] = []

          for (let r = 0; r < gridRows; r++) {
            const row: string[] = []
            for (let c = 0; c < gridCols; c++) {
              row.push(oldAreas[r]?.[c] ?? "")
            }
            newAreas.push(row)
          }

          return {
            schema: {
              ...state.schema,
              breakpoints,
              layouts: {
                ...state.schema.layouts,
                [breakpoint]: {
                  grid: {
                    rows: `repeat(${gridRows}, 100px)`,
                    columns: `repeat(${gridCols}, 100px)`,
                    areas: newAreas,
                  },
                },
              },
            },
          }
        }, false, "updateGridSize")
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

          // Create empty layout matching breakpoint grid size
          const { gridCols, gridRows } = breakpoint
          const emptyAreas = Array(gridRows)
            .fill(null)
            .map(() => Array(gridCols).fill(""))

          // Add breakpoint and create empty layout
          return {
            schema: {
              ...state.schema,
              breakpoints: [...state.schema.breakpoints, breakpoint].sort(
                (a, b) => a.minWidth - b.minWidth
              ),
              layouts: {
                ...state.schema.layouts,
                [breakpoint.name]: {
                  grid: {
                    rows: `repeat(${gridRows}, 100px)`,
                    columns: `repeat(${gridCols}, 100px)`,
                    areas: emptyAreas,
                  },
                },
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

      loadSampleSchema: () => {
        set(
          {
            schema: cloneSchema(sampleSchema),
            currentBreakpoint: "mobile",
            selectedComponentId: null,
          },
          false,
          "loadSampleSchema"
        )
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
  return useLayoutStore((state) => {
    const breakpoint = state.currentBreakpoint
    const layout = state.schema.layouts[breakpoint]
    if (!layout) return []

    const usedIds = new Set<string>()
    layout.grid.areas.forEach((row) => {
      row.forEach((id) => {
        if (id) usedIds.add(id)
      })
    })

    return state.schema.components.filter((c) => usedIds.has(c.id))
  })
}
