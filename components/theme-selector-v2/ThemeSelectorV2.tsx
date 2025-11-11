"use client"

import { useThemeStoreV2, useCurrentTheme, useAvailableThemes } from "@/store/theme-store-v2"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Moon, Palette } from "lucide-react"
import { useState } from "react"

/**
 * Theme Selector V2
 *
 * Light/Dark 모드 및 Color Preset 선택
 */
export function ThemeSelectorV2() {
  const [isOpen, setIsOpen] = useState(false)
  const currentTheme = useCurrentTheme()
  const availableThemes = useAvailableThemes()
  const setTheme = useThemeStoreV2((state) => state.setTheme)

  const lightThemes = availableThemes.filter((t) => t.mode === "light")
  const darkThemes = availableThemes.filter((t) => t.mode === "dark")

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {currentTheme.mode === "light" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
        <span>{currentTheme.name}</span>
      </Button>

      {/* Theme Selector Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <Card className="absolute right-0 top-full mt-2 w-[320px] p-4 z-50 shadow-lg">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <Palette className="w-4 h-4" />
                <h3 className="font-semibold">Theme</h3>
              </div>

              {/* Light Themes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Light Themes</span>
                </div>
                <div className="space-y-2">
                  {lightThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id)
                        setIsOpen(false)
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:border-blue-300 ${
                        currentTheme.id === theme.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {theme.description}
                          </div>
                        </div>
                        {currentTheme.id === theme.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {/* Color Preview */}
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark Themes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Dark Themes</span>
                </div>
                <div className="space-y-2">
                  {darkThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id)
                        setIsOpen(false)
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:border-blue-300 ${
                        currentTheme.id === theme.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {theme.description}
                          </div>
                        </div>
                        {currentTheme.id === theme.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {/* Color Preview */}
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
