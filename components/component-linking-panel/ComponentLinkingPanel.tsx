"use client"

import { useCallback, useMemo, useEffect } from "react"
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { X, Link, Trash2 } from "lucide-react"
import { ComponentCardNode } from "./ComponentCardNode"
import type { Component } from "@/types/schema"
import { UnionFind, calculateConnectedGroups } from "@/lib/union-find"

// 커스텀 노드 타입 등록
const nodeTypes = {
  componentCard: ComponentCardNode,
}

/**
 * Component Linking Panel
 *
 * FigJam 스타일로 브레이크포인트별 컴포넌트를 시각화하고 연결
 * - 이미 추가된 컴포넌트만 표시 (새 컴포넌트 추가 불가)
 * - 드래그로 컴포넌트 간 연결 생성
 * - Union-Find 알고리즘으로 자동 그룹화 (c-1 → c-2 → c-3 → 모두 연결)
 */
export function ComponentLinkingPanel({ onClose }: { onClose: () => void }) {
  const schema = useLayoutStore((state) => state.schema)
  const componentLinks = useLayoutStore((state) => state.componentLinks)
  const addComponentLink = useLayoutStore((state) => state.addComponentLink)
  const removeComponentLink = useLayoutStore((state) => state.removeComponentLink)
  const clearAllLinks = useLayoutStore((state) => state.clearAllLinks)
  const autoLinkSimilar = useLayoutStore((state) => state.autoLinkSimilarComponents)
  const mergeLinkedComponents = useLayoutStore((state) => state.mergeLinkedComponents)

  // Apply changes when closing
  const handleClose = useCallback(() => {
    // Merge all linked components before closing
    mergeLinkedComponents()
    onClose()
  }, [mergeLinkedComponents, onClose])

  // 브레이크포인트별로 이미 추가된 컴포넌트만 그룹화
  const componentsByBreakpoint = useMemo(() => {
    const result: Record<string, Array<{ component: Component; breakpoint: string }>> = {}

    schema.breakpoints.forEach((bp) => {
      const layout = schema.layouts[bp.name]
      if (!layout) return

      result[bp.name] = layout.components
        .map((componentId) => {
          const component = schema.components.find((c) => c.id === componentId)
          return component ? { component, breakpoint: bp.name } : null
        })
        .filter((item): item is { component: Component; breakpoint: string } => item !== null)
    })

    return result
  }, [schema])

  // React Flow 노드 생성 (3열 레이아웃, 이미 추가된 컴포넌트만)
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    const columnWidth = 280
    const columnGap = 150
    const cardHeight = 90
    const cardGap = 20

    // Schema의 실제 breakpoint 사용 (하드코딩 제거)
    const breakpointOrder = schema.breakpoints.map((bp) => bp.name)
    const breakpointIcons: Record<string, string> = {
      mobile: "📱",
      tablet: "📱",
      desktop: "🖥️",
      default: "📐", // fallback for unknown breakpoints
    }

    breakpointOrder.forEach((bp, colIndex) => {
      const x = colIndex * (columnWidth + columnGap) + 50
      const components = componentsByBreakpoint[bp] || []

      // Column header
      nodes.push({
        id: `header-${bp}`,
        type: "default",
        position: { x, y: 20 },
        data: {
          label: (
            <div className="text-center">
              <div className="text-2xl">{breakpointIcons[bp] || breakpointIcons.default}</div>
              <div className="font-semibold capitalize">{bp}</div>
              <div className="text-xs text-gray-500">({components.length} components)</div>
            </div>
          ),
        },
        draggable: false,
        selectable: false,
        style: {
          background: "transparent",
          border: "none",
          width: columnWidth,
        },
      })

      // Component cards (이미 추가된 것만)
      if (components.length === 0) {
        // 빈 상태 표시 (추가 버튼 없음)
        nodes.push({
          id: `empty-${bp}`,
          type: "default",
          position: { x, y: 120 },
          data: {
            label: (
              <div className="text-center text-gray-400 text-sm py-8">
                No components in {bp}
                <div className="text-xs mt-2 text-gray-500">
                  Add components from Library Panel
                </div>
              </div>
            ),
          },
          draggable: false,
          selectable: false,
          style: {
            background: "#f9fafb",
            border: "2px dashed #d1d5db",
            borderRadius: 8,
            width: columnWidth,
          },
        })
      } else {
        components.forEach((item, rowIndex) => {
          const y = 120 + rowIndex * (cardHeight + cardGap)
          nodes.push({
            id: `${bp}-${item.component.id}`,
            type: "componentCard",
            position: { x, y },
            data: {
              componentId: item.component.id,
              componentName: item.component.name,
              semanticTag: item.component.semanticTag,
              breakpoint: bp,
            },
          })
        })
      }
    })

    return nodes
  }, [componentsByBreakpoint, schema.breakpoints])

  // React Flow 엣지 생성 (componentLinks 기반)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []

    componentLinks.forEach((link, index) => {
      // source와 target이 어느 breakpoint에 있는지 찾기
      const sourceBreakpoint = findBreakpointForComponent(link.source, componentsByBreakpoint)
      const targetBreakpoint = findBreakpointForComponent(link.target, componentsByBreakpoint)

      if (!sourceBreakpoint || !targetBreakpoint) return

      edges.push({
        id: `e-${index}`,
        source: `${sourceBreakpoint}-${link.source}`,
        target: `${targetBreakpoint}-${link.target}`,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        label: "🔗",
        type: "smoothstep",
      })
    })

    return edges
  }, [componentLinks, componentsByBreakpoint])

  // Node ID → Component ID 매핑 (type-safe, Map 기반)
  const nodeIdToComponentId = useMemo(() => {
    const map = new Map<string, string>()

    Object.entries(componentsByBreakpoint).forEach(([bp, components]) => {
      components.forEach((item) => {
        const nodeId = `${bp}-${item.component.id}`
        map.set(nodeId, item.component.id)
      })
    })

    return map
  }, [componentsByBreakpoint])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // State synchronization: componentLinks 변경 시 React Flow edges 자동 업데이트
  useEffect(() => {
    const newEdges: Edge[] = []

    componentLinks.forEach((link, index) => {
      const sourceBreakpoint = findBreakpointForComponent(link.source, componentsByBreakpoint)
      const targetBreakpoint = findBreakpointForComponent(link.target, componentsByBreakpoint)

      if (!sourceBreakpoint || !targetBreakpoint) return

      newEdges.push({
        id: `e-${index}`,
        source: `${sourceBreakpoint}-${link.source}`,
        target: `${targetBreakpoint}-${link.target}`,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        label: "🔗",
        type: "smoothstep",
      })
    })

    setEdges(newEdges)
  }, [componentLinks, componentsByBreakpoint, setEdges])

  // 연결 생성 핸들러
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      // Map을 사용하여 type-safe하게 component ID 추출
      const sourceComponentId = nodeIdToComponentId.get(connection.source)
      const targetComponentId = nodeIdToComponentId.get(connection.target)

      if (!sourceComponentId || !targetComponentId) {
        console.warn("Cannot find component IDs for connection")
        return
      }

      // 같은 컴포넌트면 연결 불가
      if (sourceComponentId === targetComponentId) {
        console.warn("Cannot link component to itself")
        return
      }

      // Store에 link 추가 (자동으로 Union-Find 그룹화 및 병합)
      addComponentLink(sourceComponentId, targetComponentId)
    },
    [nodeIdToComponentId, addComponentLink]
  )

  // 엣지 삭제 핸들러 (Map 기반, type-safe)
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        const sourceId = nodeIdToComponentId.get(edge.source)
        const targetId = nodeIdToComponentId.get(edge.target)

        if (sourceId && targetId) {
          removeComponentLink(sourceId, targetId)
        } else {
          console.warn(`Cannot find component IDs for edge: ${edge.id}`)
        }
      })
    },
    [nodeIdToComponentId, removeComponentLink]
  )

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-4 bg-white shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Component Linking</h2>
          <p className="text-xs text-gray-500">Connect components across breakpoints</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => autoLinkSimilar()}>
            <Link className="w-4 h-4 mr-2" />
            Auto-Link Similar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => clearAllLinks()}
            disabled={componentLinks.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Links
          </Button>

          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[calc(100vh-4rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false} // 노드 드래그 비활성화 (연결만 가능)
          deleteKeyCode={["Backspace", "Delete"]} // 엣지 삭제 키
        >
          <Controls showInteractive={false} />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="font-semibold text-sm text-blue-900 mb-2">💡 How to link components:</div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• Drag from one component&apos;s handle (●) to another</div>
          <div>• Click &quot;Auto-Link Similar&quot; to connect same-name components</div>
          <div>• Select edge and press Delete/Backspace to unlink</div>
          <div className="text-blue-600 mt-2 pt-2 border-t border-blue-200">
            ℹ️ To add new components, use the Library Panel (left sidebar)
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="absolute top-20 right-4 bg-white border rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold mb-2">Statistics</div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total components:</span>
            <span className="font-medium">{schema.components.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Links:</span>
            <span className="font-medium">{componentLinks.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Connected groups:</span>
            <span className="font-medium">
              {calculateConnectedGroupsCount(schema.components, componentLinks)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper: 컴포넌트가 어느 breakpoint에 속하는지 찾기
function findBreakpointForComponent(
  componentId: string,
  componentsByBreakpoint: Record<string, Array<{ component: Component; breakpoint: string }>>
): string | null {
  for (const [bp, components] of Object.entries(componentsByBreakpoint)) {
    if (components.some((item) => item.component.id === componentId)) {
      return bp
    }
  }
  return null
}

// Helper: 연결된 그룹 개수 계산
function calculateConnectedGroupsCount(
  components: Component[],
  links: Array<{ source: string; target: string }>
): number {
  if (components.length === 0) return 0
  const uf = new UnionFind(components.map((c) => c.id))
  links.forEach(({ source, target }) => uf.union(source, target))
  return uf.getGroups().size
}
