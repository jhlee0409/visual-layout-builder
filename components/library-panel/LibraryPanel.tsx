"use client"

import { useState, useRef, useEffect } from "react"
import { useLayoutStore } from "@/store/layout-store"
import {
  COMPONENT_LIBRARY,
  COMPONENT_CATEGORIES,
  createComponentFromTemplate,
  type ComponentTemplate,
} from "@/lib/component-library"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutGrid,
  Menu,
  FileText,
  FormInput,
  PanelLeft,
  Box,
  Square,
  Plus,
  Search,
  Layout,
} from "lucide-react"

/**
 * Library Panel - 컴포넌트 라이브러리
 *
 * 사전 정의된 컴포넌트를 선택하여 Canvas에 추가
 */
export function LibraryPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>("layout")
  const [searchQuery, setSearchQuery] = useState("")
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  const addComponent = useLayoutStore((state) => state.addComponent)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const addComponentToLayout = useLayoutStore((state) => state.addComponentToLayout)

  // 휠 스크롤로 가로 스크롤 처리
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (categoryScrollRef.current) {
        // deltaY(세로 스크롤)을 가로 스크롤로 변환
        e.preventDefault()
        categoryScrollRef.current.scrollLeft += e.deltaY
      }
    }

    const element = categoryScrollRef.current
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  // 아이콘 매핑
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      LayoutGrid,
      Menu,
      FileText,
      FormInput,
    }
    const Icon = icons[iconName] || LayoutGrid
    return <Icon className="w-4 h-4" />
  }

  const getTemplateIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      LayoutHeader: Layout,
      LayoutGrid,
      LayoutFooter: Box,
      PanelLeft,
      Menu,
      Box,
      FileText,
      Square,
      FormInput,
    }
    const Icon = icons[iconName] || Box
    return <Icon className="w-5 h-5" />
  }

  // 필터링된 컴포넌트 목록
  const filteredComponents = COMPONENT_LIBRARY.filter((template) => {
    const matchesCategory = template.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // 드래그 시작 핸들러
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    template: ComponentTemplate
  ) => {
    // 드래그 데이터에 template ID 저장
    e.dataTransfer.setData("application/json", JSON.stringify(template))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <Card className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Component Library</h3>
        <p className="text-sm text-gray-600">
          Drag components to canvas to add
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div
        ref={categoryScrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {COMPONENT_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="gap-2 whitespace-nowrap flex-shrink-0"
          >
            {getCategoryIcon(category.icon)}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No components found</p>
          </div>
        ) : (
          filteredComponents.map((template) => (
            <Card
              key={template.id}
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              className="p-3 hover:shadow-md transition-shadow cursor-move border-2 hover:border-blue-300"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {getTemplateIcon(template.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {template.template.semanticTag}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{template.description}</p>

                  {/* Properties Preview */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {template.template.positioning.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.template.layout.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        {filteredComponents.length} component
        {filteredComponents.length !== 1 ? "s" : ""} available
      </div>
    </Card>
  )
}
