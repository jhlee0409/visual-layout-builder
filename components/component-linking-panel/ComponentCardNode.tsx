import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Badge } from "@/components/ui/badge"

/**
 * Component Card Node for React Flow
 *
 * 브레이크포인트별로 추가된 컴포넌트를 표시하는 커스텀 노드
 */
export interface ComponentCardData {
  componentId: string
  componentName: string
  semanticTag: string
  breakpoint: string
}

export const ComponentCardNode = memo(({ data }: NodeProps) => {
  const cardData = data as unknown as ComponentCardData

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow w-64">
      {/* Left handle (input) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 hover:bg-blue-600 transition-colors"
        style={{ left: -6 }}
      />

      {/* Component info */}
      <div className="space-y-1">
        <div className="font-semibold text-sm truncate">{cardData.componentName}</div>
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {cardData.semanticTag}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {cardData.componentId}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">{cardData.breakpoint}</div>
      </div>

      {/* Right handle (output) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 hover:bg-blue-600 transition-colors"
        style={{ right: -6 }}
      />
    </div>
  )
})

ComponentCardNode.displayName = "ComponentCardNode"
