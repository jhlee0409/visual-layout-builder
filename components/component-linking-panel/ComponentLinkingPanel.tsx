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
  OnConnectStartParams,
  reconnectEdge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { X, Link, Trash2 } from "lucide-react"
import { ComponentCardNode } from "./ComponentCardNode"
import type { Component } from "@/types/schema"
import { UnionFind, calculateConnectedGroups } from "@/lib/union-find"
import styles from "./ComponentLinkingPanel.module.css"

// 커스텀 노드 타입 등록
const nodeTypes = {
  componentCard: ComponentCardNode,
}

// Color palette for multiple links (8 distinct colors for better UX)
const LINK_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
]

// Safe delimiter for edge IDs (avoids collision with component IDs)
const EDGE_ID_DELIMITER = "|||"

/**
 * Helper: Create edge from component link
 * Extracted to avoid code duplication and improve maintainability
 */
function createEdgeFromLink(
  link: { source: string; target: string },
  index: number,
  componentsByBreakpoint: Record<string, Array<{ component: Component; breakpoint: string }>>
): Edge | null {
  const sourceBreakpoint = findBreakpointForComponent(link.source, componentsByBreakpoint)
  const targetBreakpoint = findBreakpointForComponent(link.target, componentsByBreakpoint)

  if (!sourceBreakpoint || !targetBreakpoint) return null

  const sourceNodeId = `${sourceBreakpoint}-${link.source}`
  const targetNodeId = `${targetBreakpoint}-${link.target}`

  // Assign color based on link index (cycle through palette)
  const linkColor = LINK_COLORS[index % LINK_COLORS.length]

  return {
    id: `${sourceNodeId}${EDGE_ID_DELIMITER}${targetNodeId}`, // Stable, collision-safe ID
    source: sourceNodeId,
    target: targetNodeId,
    animated: true,
    style: {
      stroke: linkColor,
      strokeWidth: 2.5,
    },
    label: "🔗",
    type: "default", // Bezier curve (smooth, not straight)
    data: { linkColor, linkIndex: index }, // Store for hover/selection effects
  }
}

/**
 * Helper: Find existing link for a component
 * Returns the link where the component is either source or target
 */
function findLinkForComponent(
  componentId: string,
  links: Array<{ source: string; target: string }>
): { source: string; target: string } | null {
  return links.find((link) => link.source === componentId || link.target === componentId) || null
}

/**
 * Component Linking Panel
 *
 * FigJam 스타일로 브레이크포인트별 컴포넌트를 시각화하고 연결
 * - 이미 추가된 컴포넌트만 표시 (새 컴포넌트 추가 불가)
 * - 드래그로 컴포넌트 간 연결 생성
 * - **1대1 연결 제약**: 하나의 컴포넌트는 최대 하나의 링크만 가능
 * - 기존 연결된 컴포넌트 handle 클릭 시 기존 링크 제거 후 새 연결 시작
 */
export function ComponentLinkingPanel({ onClose }: { onClose: () => void }) {
  const schema = useLayoutStore((state) => state.schema)
  const componentLinks = useLayoutStore((state) => state.componentLinks)
  const addComponentLink = useLayoutStore((state) => state.addComponentLink)
  const removeComponentLink = useLayoutStore((state) => state.removeComponentLink)
  const clearAllLinks = useLayoutStore((state) => state.clearAllLinks)

  // Simply close without merging
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

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

  // React Flow 노드 생성 (이미 추가된 컴포넌트만)
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    const columnWidth = 280
    const columnGap = 150
    const cardHeight = 90
    const cardGap = 20

    // Schema의 실제 breakpoint 사용
    const breakpointOrder = schema.breakpoints.map((bp) => bp.name)

    breakpointOrder.forEach((bp, colIndex) => {
      const x = colIndex * (columnWidth + columnGap) + 50
      const components = componentsByBreakpoint[bp] || []

      // Column header (no handles)
      nodes.push({
        id: `header-${bp}`,
        type: "default",
        position: { x, y: 20 },
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold capitalize text-lg">{bp}</div>
              <div className="text-xs text-gray-500">({components.length} components)</div>
            </div>
          ),
        },
        draggable: false,
        selectable: false,
        connectable: false, // Completely disable handles
        style: {
          background: "transparent",
          border: "none",
          width: columnWidth,
          pointerEvents: "none", // Prevent interaction with header
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
          connectable: false, // Completely disable handles
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
  // Uses helper function to avoid code duplication
  const initialEdges: Edge[] = useMemo(() => {
    return componentLinks
      .map((link, index) => createEdgeFromLink(link, index, componentsByBreakpoint))
      .filter((edge): edge is Edge => edge !== null)
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
  // Uses helper function to avoid code duplication
  useEffect(() => {
    const newEdges = componentLinks
      .map((link, index) => createEdgeFromLink(link, index, componentsByBreakpoint))
      .filter((edge): edge is Edge => edge !== null)

    setEdges(newEdges)
  }, [componentLinks, componentsByBreakpoint, setEdges])

  // Handle edge reconnection: Drag existing edge to different handle
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      console.log(`🔄 Reconnecting edge:`, { oldEdge, newConnection })

      // Extract old component IDs
      const oldSourceId = nodeIdToComponentId.get(oldEdge.source)
      const oldTargetId = nodeIdToComponentId.get(oldEdge.target)

      // Extract new component IDs
      const newSourceId = newConnection.source ? nodeIdToComponentId.get(newConnection.source) : null
      const newTargetId = newConnection.target ? nodeIdToComponentId.get(newConnection.target) : null

      if (!oldSourceId || !oldTargetId) {
        console.warn("❌ Cannot find old component IDs")
        return
      }

      if (!newSourceId || !newTargetId) {
        console.warn("❌ Cannot find new component IDs")
        return
      }

      // Prevent self-connection
      if (newSourceId === newTargetId) {
        console.warn("❌ Cannot link component to itself")
        return
      }

      // Check if new target already has a link (1-to-1 constraint)
      // Only check if the target has changed
      if (newTargetId !== oldTargetId) {
        const targetExistingLink = findLinkForComponent(newTargetId, componentLinks)
        if (targetExistingLink) {
          console.log(`🔄 Removing new target's existing link:`, targetExistingLink)
          removeComponentLink(targetExistingLink.source, targetExistingLink.target)
        }
      }

      // Check if new source already has a link (1-to-1 constraint)
      // Only check if the source has changed
      if (newSourceId !== oldSourceId) {
        const sourceExistingLink = findLinkForComponent(newSourceId, componentLinks)
        if (sourceExistingLink) {
          console.log(`🔄 Removing new source's existing link:`, sourceExistingLink)
          removeComponentLink(sourceExistingLink.source, sourceExistingLink.target)
        }
      }

      // Remove old link
      console.log(`🗑️ Removing old link: ${oldSourceId} ↔ ${oldTargetId}`)
      removeComponentLink(oldSourceId, oldTargetId)

      // Add new link
      console.log(`✅ Adding new link: ${newSourceId} ↔ ${newTargetId}`)
      addComponentLink(newSourceId, newTargetId)
    },
    [nodeIdToComponentId, componentLinks, addComponentLink, removeComponentLink]
  )

  // Handle new connection: Enforce 1-to-1 constraint
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      // Map을 사용하여 type-safe하게 component ID 추출
      const sourceComponentId = nodeIdToComponentId.get(connection.source)
      const targetComponentId = nodeIdToComponentId.get(connection.target)

      if (!sourceComponentId || !targetComponentId) {
        console.warn("❌ Cannot find component IDs for connection")
        return
      }

      // 같은 컴포넌트면 연결 불가
      if (sourceComponentId === targetComponentId) {
        console.warn("❌ Cannot link component to itself")
        return
      }

      // Check if source already has a link (1-to-1 constraint)
      const sourceExistingLink = findLinkForComponent(sourceComponentId, componentLinks)
      if (sourceExistingLink) {
        console.log(`🔄 Removing source's existing link:`, sourceExistingLink)
        removeComponentLink(sourceExistingLink.source, sourceExistingLink.target)
      }

      // Check if target already has a link (1-to-1 constraint)
      const targetExistingLink = findLinkForComponent(targetComponentId, componentLinks)
      if (targetExistingLink) {
        console.log(`🔄 Removing target's existing link:`, targetExistingLink)
        removeComponentLink(targetExistingLink.source, targetExistingLink.target)
      }

      // Add new link
      console.log(`✅ Adding link: ${sourceComponentId} ↔ ${targetComponentId}`)
      addComponentLink(sourceComponentId, targetComponentId)
    },
    [nodeIdToComponentId, componentLinks, addComponentLink, removeComponentLink]
  )

  // 엣지 삭제 핸들러 (Map 기반, type-safe)
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      console.log(`🗑️ Deleting ${edgesToDelete.length} edge(s)`)

      edgesToDelete.forEach((edge) => {
        const sourceId = nodeIdToComponentId.get(edge.source)
        const targetId = nodeIdToComponentId.get(edge.target)

        console.log(`  Edge ${edge.id}: ${edge.source} (${sourceId}) → ${edge.target} (${targetId})`)

        if (sourceId && targetId) {
          console.log(`  ✅ Removing link: ${sourceId} ↔ ${targetId}`)
          removeComponentLink(sourceId, targetId)
        } else {
          console.warn(`  ❌ Cannot find component IDs for edge: ${edge.id}`)
          console.warn(`    - Source: ${edge.source} → ${sourceId}`)
          console.warn(`    - Target: ${edge.target} → ${targetId}`)
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
      <div className={`h-[calc(100vh-4rem)] ${styles.container}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgesReconnectable={true} // Enable edge reconnection by dragging edge ends
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
          <div>• Drag from one component&apos;s handle (●) to another to create a link</div>
          <div>• <span className="font-semibold text-orange-600">1-to-1 constraint</span>: Each component can have only <span className="font-semibold">one link</span></div>
          <div>• To <span className="font-semibold">reconnect</span>: Drag the edge end to a different component</div>
          <div>• Each link has a <span className="font-semibold">unique color</span> for easy identification</div>
          <div>• <span className="font-semibold">Hover</span> over a link to see it highlighted</div>
          <div>• <span className="font-semibold">Click to select</span> a link (glows brighter with thicker line)</div>
          <div>• Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">Delete</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">Backspace</kbd> to unlink</div>
          <div className="text-blue-600 mt-2 pt-2 border-t border-blue-200">
            ℹ️ Links are reflected in the AI prompt for consistent component generation
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
