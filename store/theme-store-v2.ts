/**
 * Theme Store V2 (Zustand)
 *
 * 테마 상태 관리
 */

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { Theme } from "@/lib/theme-system-v2"
import { THEME_PRESETS, getThemeById } from "@/lib/theme-system-v2"

interface ThemeStateV2 {
  // Current theme
  currentThemeId: string

  // Actions
  setTheme: (themeId: string) => void
  getCurrentTheme: () => Theme | undefined
}

/**
 * Create theme store V2
 */
export const useThemeStoreV2 = create<ThemeStateV2>()(
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
        name: "laylder-theme-store-v2", // LocalStorage key
      }
    ),
    {
      name: "laylder-theme-store-v2",
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
  return useThemeStoreV2((state) => {
    return getThemeById(state.currentThemeId) || THEME_PRESETS[0]
  })
}
