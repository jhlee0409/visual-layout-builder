import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
} from "lucide-react"
import type { Component } from "@/types/schema"

interface LayerItemProps {
  component: Component
  isSelected: boolean
  isCollapsed: boolean
  onSelect: () => void
  onToggleCollapse: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function LayerItem({
  component,
  isSelected,
  isCollapsed,
  onSelect,
  onToggleCollapse,
  onDuplicate,
  onDelete,
}: LayerItemProps) {
  return (
    <div
      className={`
        group relative border rounded-lg transition-all
        ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* Main Row */}
      <div className="flex items-center gap-2 p-2 cursor-pointer" onClick={onSelect}>
        {/* Collapse Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCollapse()
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* Component Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">
              {component.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {component.semanticTag}
            </Badge>
          </div>
          {!isCollapsed && (
            <div className="text-xs text-gray-500 mt-0.5">
              {component.positioning.type} · {component.layout.type}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {!isCollapsed && (
        <div className="px-8 pb-2 space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>ID:</span>
            <span className="font-mono">{component.id}</span>
          </div>
          {component.styling?.background && (
            <div className="flex justify-between">
              <span>Background:</span>
              <span>{component.styling.background}</span>
            </div>
          )}
          {component.responsive && (
            <div className="flex justify-between">
              <span>Responsive:</span>
              <span>Yes</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
