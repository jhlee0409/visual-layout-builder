/**
 * Test Zustand Layout Store
 * Run this to verify store actions work correctly
 */

import { useLayoutStore } from "./layout-store"

console.log("🧪 Testing Laylder Layout Store\n")

// Get store instance (outside React)
const store = useLayoutStore.getState()

// Test 1: Initial state
console.log("Test 1: Initial state...")
console.log("✅ Initial schema loaded")
console.log(`   Components: ${store.schema.components.length}`)
console.log(`   Breakpoints: ${store.schema.breakpoints.length}`)
console.log(`   Current breakpoint: ${store.currentBreakpoint}`)
console.log(`   Selected component: ${store.selectedComponentId ?? "none"}`)
console.log()

// Test 2: Load sample schema
console.log("Test 2: Loading sample schema...")
store.loadSampleSchema()
const afterLoad = useLayoutStore.getState()
console.log("✅ Sample schema loaded")
console.log(`   Components: ${afterLoad.schema.components.length}`)
console.log(
  `   Names: ${afterLoad.schema.components.map((c) => c.name).join(", ")}`
)
console.log()

// Test 3: Add component
console.log("Test 3: Adding new component...")
store.addComponent({
  name: "TestComponent",
  semanticTag: "section",
  props: { children: "Test" },
})
const afterAdd = useLayoutStore.getState()
const newComponent = afterAdd.schema.components[afterAdd.schema.components.length - 1]
console.log("✅ Component added")
console.log(`   ID: ${newComponent.id}`)
console.log(`   Name: ${newComponent.name}`)
console.log(`   Total components: ${afterAdd.schema.components.length}`)
console.log()

// Test 4: Update component
console.log("Test 4: Updating component...")
const firstComponentId = afterAdd.schema.components[0].id
store.updateComponent(firstComponentId, {
  name: "UpdatedHeader",
  props: { children: "Updated Header Text" },
})
const afterUpdate = useLayoutStore.getState()
const updatedComponent = afterUpdate.schema.components.find(
  (c) => c.id === firstComponentId
)
console.log("✅ Component updated")
console.log(`   New name: ${updatedComponent?.name}`)
console.log(`   New props: ${JSON.stringify(updatedComponent?.props)}`)
console.log()

// Test 5: Select component
console.log("Test 5: Selecting component...")
store.setSelectedComponentId(firstComponentId)
const afterSelect = useLayoutStore.getState()
console.log("✅ Component selected")
console.log(`   Selected ID: ${afterSelect.selectedComponentId}`)
console.log()

// Test 6: Switch breakpoint
console.log("Test 6: Switching breakpoint...")
store.setCurrentBreakpoint("desktop")
const afterSwitch = useLayoutStore.getState()
console.log("✅ Breakpoint switched")
console.log(`   Current breakpoint: ${afterSwitch.currentBreakpoint}`)
console.log(
  `   Desktop layout: ${afterSwitch.schema.layouts.desktop.grid.columns}`
)
console.log()

// Test 7: Add custom breakpoint
console.log("Test 7: Adding custom breakpoint...")
store.addBreakpoint({
  name: "wide",
  minWidth: 1440,
  gridCols: 16,
  gridRows: 20,
})
const afterAddBp = useLayoutStore.getState()
console.log("✅ Breakpoint added")
console.log(`   Total breakpoints: ${afterAddBp.schema.breakpoints.length}`)
console.log(
  `   Names: ${afterAddBp.schema.breakpoints.map((bp) => bp.name).join(", ")}`
)
console.log()

// Test 8: Update grid layout
console.log("Test 8: Updating grid layout...")
store.updateGridLayout("mobile", {
  rows: "100px 1fr 100px",
  columns: "1fr",
  areas: [["c1"], ["c3"], ["c4"]],
})
const afterGridUpdate = useLayoutStore.getState()
console.log("✅ Grid layout updated")
console.log(`   Mobile rows: ${afterGridUpdate.schema.layouts.mobile.grid.rows}`)
console.log(
  `   Mobile areas: ${JSON.stringify(afterGridUpdate.schema.layouts.mobile.grid.areas)}`
)
console.log()

// Test 9: Export schema
console.log("Test 9: Exporting schema...")
const exportedSchema = store.exportSchema()
console.log("✅ Schema exported")
console.log(`   Schema version: ${exportedSchema.schemaVersion}`)
console.log(`   Is valid object: ${typeof exportedSchema === "object"}`)
console.log(`   Has components: ${Array.isArray(exportedSchema.components)}`)
console.log()

// Test 10: Delete component
console.log("Test 10: Deleting component...")
const componentCountBefore = useLayoutStore.getState().schema.components.length
const componentToDelete = useLayoutStore.getState().schema.components[
  useLayoutStore.getState().schema.components.length - 1
]
store.deleteComponent(componentToDelete.id)
const afterDelete = useLayoutStore.getState()
console.log("✅ Component deleted")
console.log(`   Deleted ID: ${componentToDelete.id}`)
console.log(`   Components before: ${componentCountBefore}`)
console.log(`   Components after: ${afterDelete.schema.components.length}`)
console.log(
  `   Selected component cleared: ${afterDelete.selectedComponentId === null}`
)
console.log()

// Test 11: Reset schema
console.log("Test 11: Resetting schema...")
store.resetSchema()
const afterReset = useLayoutStore.getState()
console.log("✅ Schema reset")
console.log(`   Components: ${afterReset.schema.components.length}`)
console.log(`   Breakpoints: ${afterReset.schema.breakpoints.length}`)
console.log(`   Current breakpoint: ${afterReset.currentBreakpoint}`)
console.log()

// Test 12: Import schema
console.log("Test 12: Importing schema...")
const customSchema = {
  schemaVersion: "1.1",
  components: [
    { id: "c1", name: "Header", semanticTag: "header" as const, props: {} },
    { id: "c2", name: "Main", semanticTag: "main" as const, props: {} },
  ],
  breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 }],
  layouts: {
    mobile: {
      grid: {
        rows: "auto 1fr",
        columns: "1fr",
        areas: [["c1"], ["c2"]],
      },
    },
  },
}
store.importSchema(customSchema)
const afterImport = useLayoutStore.getState()
console.log("✅ Schema imported")
console.log(`   Components: ${afterImport.schema.components.length}`)
console.log(
  `   Component names: ${afterImport.schema.components.map((c) => c.name).join(", ")}`
)
console.log()

console.log("🎉 All store tests complete!")
console.log("\n📊 Final state:")
console.log(`   Components: ${afterImport.schema.components.length}`)
console.log(`   Breakpoints: ${afterImport.schema.breakpoints.length}`)
console.log(`   Current view: ${afterImport.currentBreakpoint}`)
