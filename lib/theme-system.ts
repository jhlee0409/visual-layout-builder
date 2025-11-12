/**
 * Theme System V2
 *
 * 디자인 시스템 및 테마 관리
 */

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  success: string
  warning: string
}

export interface Theme {
  id: string
  name: string
  description: string
  mode: "light" | "dark"
  colors: ThemeColors
}

/**
 * 사전 정의된 테마 프리셋
 */
export const THEME_PRESETS: Theme[] = [
  {
    id: "light-default",
    name: "Default Light",
    description: "기본 라이트 테마",
    mode: "light",
    colors: {
      primary: "#3b82f6", // blue-500
      secondary: "#8b5cf6", // violet-500
      accent: "#06b6d4", // cyan-500
      background: "#ffffff",
      surface: "#f9fafb", // gray-50
      text: "#111827", // gray-900
      textSecondary: "#6b7280", // gray-500
      border: "#e5e7eb", // gray-200
      error: "#ef4444", // red-500
      success: "#10b981", // green-500
      warning: "#f59e0b", // amber-500
    },
  },
  {
    id: "dark-default",
    name: "Default Dark",
    description: "기본 다크 테마",
    mode: "dark",
    colors: {
      primary: "#60a5fa", // blue-400
      secondary: "#a78bfa", // violet-400
      accent: "#22d3ee", // cyan-400
      background: "#111827", // gray-900
      surface: "#1f2937", // gray-800
      text: "#f9fafb", // gray-50
      textSecondary: "#9ca3af", // gray-400
      border: "#374151", // gray-700
      error: "#f87171", // red-400
      success: "#34d399", // green-400
      warning: "#fbbf24", // amber-400
    },
  },
  {
    id: "light-nature",
    name: "Nature Light",
    description: "자연 친화적 라이트 테마",
    mode: "light",
    colors: {
      primary: "#10b981", // green-500
      secondary: "#059669", // green-600
      accent: "#84cc16", // lime-500
      background: "#ffffff",
      surface: "#f0fdf4", // green-50
      text: "#14532d", // green-900
      textSecondary: "#6b7280",
      border: "#d1fae5", // green-200
      error: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
    },
  },
  {
    id: "dark-ocean",
    name: "Ocean Dark",
    description: "오션 블루 다크 테마",
    mode: "dark",
    colors: {
      primary: "#0ea5e9", // sky-500
      secondary: "#06b6d4", // cyan-500
      accent: "#3b82f6", // blue-500
      background: "#0c4a6e", // sky-900
      surface: "#075985", // sky-800
      text: "#f0f9ff", // sky-50
      textSecondary: "#7dd3fc", // sky-300
      border: "#0369a1", // sky-700
      error: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
    },
  },
  {
    id: "light-minimal",
    name: "Minimal Light",
    description: "미니멀 라이트 테마",
    mode: "light",
    colors: {
      primary: "#000000",
      secondary: "#525252", // gray-600
      accent: "#737373", // gray-500
      background: "#ffffff",
      surface: "#fafafa", // gray-50
      text: "#000000",
      textSecondary: "#737373",
      border: "#e5e5e5", // gray-200
      error: "#dc2626", // red-600
      success: "#16a34a", // green-600
      warning: "#ca8a04", // yellow-600
    },
  },
  {
    id: "dark-minimal",
    name: "Minimal Dark",
    description: "미니멀 다크 테마",
    mode: "dark",
    colors: {
      primary: "#ffffff",
      secondary: "#a3a3a3", // gray-400
      accent: "#737373", // gray-500
      background: "#000000",
      surface: "#0a0a0a", // gray-950
      text: "#ffffff",
      textSecondary: "#a3a3a3",
      border: "#262626", // gray-800
      error: "#f87171", // red-400
      success: "#4ade80", // green-400
      warning: "#facc15", // yellow-400
    },
  },
]

/**
 * 테마 ID로 테마 찾기
 */
export function getThemeById(id: string): Theme | undefined {
  return THEME_PRESETS.find((theme) => theme.id === id)
}

/**
 * 모드별 테마 필터
 */
export function getThemesByMode(mode: "light" | "dark"): Theme[] {
  return THEME_PRESETS.filter((theme) => theme.mode === mode)
}

/**
 * 테마를 CSS 변수로 변환
 */
export function themeToCSSVariables(theme: Theme): Record<string, string> {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-text-secondary": theme.colors.textSecondary,
    "--color-border": theme.colors.border,
    "--color-error": theme.colors.error,
    "--color-success": theme.colors.success,
    "--color-warning": theme.colors.warning,
  }
}

/**
 * 테마를 Tailwind 클래스로 변환
 */
export function themeToTailwindConfig(theme: Theme): string {
  return `
// Tailwind Configuration for ${theme.name}
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.colors.primary}',
        secondary: '${theme.colors.secondary}',
        accent: '${theme.colors.accent}',
        background: '${theme.colors.background}',
        surface: '${theme.colors.surface}',
        text: {
          DEFAULT: '${theme.colors.text}',
          secondary: '${theme.colors.textSecondary}',
        },
        border: '${theme.colors.border}',
        error: '${theme.colors.error}',
        success: '${theme.colors.success}',
        warning: '${theme.colors.warning}',
      },
    },
  },
}
`.trim()
}
