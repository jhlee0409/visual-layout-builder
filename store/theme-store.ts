/**
 * Theme Store (Zustand)
 *
 * 테마 상태 관리
 */

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { Theme } from "@/lib/theme-system"
import { THEME_PRESETS, getThemeById } from "@/lib/theme-system"

interface ThemeState {
  // Current theme
  currentThemeId: string

  // Actions
  setTheme: (themeId: string) => void
  getCurrentTheme: () => Theme | undefined
}

/**
 * Create theme store V2
 */
export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - Default Light Theme
        currentThemeId: "light-default",

        // Set theme
        setTheme: (themeId) => {
          const theme = getThemeById(themeId)
          if (theme) {
            set({ currentThemeId: themeId }, false, "setTheme")
          }
        },

        // Get current theme
        getCurrentTheme: () => {
          return getThemeById(get().currentThemeId)
        },
      }),
      {
        name: "laylder-theme-store", // LocalStorage key
      }
    ),
    {
      name: "laylder-theme-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)

/**
 * Selector: Get all available themes
 */
export const useAvailableThemes = () => THEME_PRESETS

/**
 * Selector: Get current theme object
 */
export const useCurrentTheme = () => {
  return useThemeStore((state) => {
    return getThemeById(state.currentThemeId) || THEME_PRESETS[0]
  })
}
