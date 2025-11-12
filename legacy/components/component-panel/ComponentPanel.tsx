"use client"

import { ComponentForm } from "./ComponentForm"
import { ComponentList } from "./ComponentList"

/**
 * ComponentPanel - Right sidebar panel for component management
 * Contains form for adding components and list of all components
 */
export function ComponentPanel() {
  return (
    <div className="space-y-6">
      <ComponentForm />
      <ComponentList />
    </div>
  )
}
