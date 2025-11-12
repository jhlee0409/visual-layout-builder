"use client"

import { useLayoutStoreV2 } from "@/store/layout-store-v2"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { LayerItem } from "./LayerItem"
import { useConfirm } from "@/store/alert-dialog-store"

/**
 * Layers Tree V2 - 컴포넌트 계층 구조
 *
 * 현재 breakpoint의 컴포넌트 목록을 트리 형태로 표시
 */
export function LayersTreeV2() {
  const schema = useLayoutStoreV2((state) => state.schema)
  const currentBreakpoint = useLayoutStoreV2((state) => state.currentBreakpoint)
  const selectedComponentId = useLayoutStoreV2(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStoreV2(
    (state) => state.setSelectedComponentId
  )
  const deleteComponent = useLayoutStoreV2((state) => state.deleteComponent)
  const duplicateComponent = useLayoutStoreV2((state) => state.duplicateComponent)

  const confirm = useConfirm()

  const currentLayout =
    schema.layouts[currentBreakpoint as keyof typeof schema.layouts]

  // 기본값: 모든 컴포넌트를 접힌 상태로 시작
  const [collapsedComponents, setCollapsedComponents] = useState<Set<string>>(
    () => new Set(currentLayout.components)
  )

  // 현재 레이아웃의 컴포넌트를 순서대로 가져오기
  const componentIds = currentLayout.components
  const componentsInLayout = componentIds
    .map((id) => schema.components.find((c) => c.id === id))
    .filter((c) => c !== undefined)

  // Collapse/Expand 토글
  const toggleCollapse = (componentId: string) => {
    const newCollapsed = new Set(collapsedComponents)
    if (newCollapsed.has(componentId)) {
      newCollapsed.delete(componentId)
    } else {
      newCollapsed.add(componentId)
    }
    setCollapsedComponents(newCollapsed)
  }

  // 컴포넌트 복제
  const handleDuplicate = (componentId: string) => {
    duplicateComponent(componentId)
  }

  // 컴포넌트 삭제
  const handleDelete = async (componentId: string) => {
    const confirmed = await confirm({
      title: "컴포넌트 삭제",
      description: `"${componentId}" 컴포넌트를 삭제하시겠습니까?`,
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    })

    if (confirmed) {
      deleteComponent(componentId)
    }
  }

  return (
    <Card className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Layers</h3>
        <p className="text-sm text-gray-600">
          {currentBreakpoint.charAt(0).toUpperCase() +
            currentBreakpoint.slice(1)}{" "}
          Layout
        </p>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {componentsInLayout.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-sm">No components in this layout</div>
            <div className="text-xs mt-1">
              Add components from the Library Panel
            </div>
          </div>
        ) : (
          componentsInLayout.map((component) => (
            <LayerItem
              key={component.id}
              component={component}
              isSelected={selectedComponentId === component.id}
              isCollapsed={collapsedComponents.has(component.id)}
              onSelect={() => setSelectedComponentId(component.id)}
              onToggleCollapse={() => toggleCollapse(component.id)}
              onDuplicate={() => handleDuplicate(component.id)}
              onDelete={() => handleDelete(component.id)}
            />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        {componentsInLayout.length} component
        {componentsInLayout.length !== 1 ? "s" : ""} •{" "}
        {schema.components.length} total
      </div>
    </Card>
  )
}
