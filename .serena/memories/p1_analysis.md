# P1-1 Analysis: Current UI Architecture

## Current State (V1 Schema)

### Store: `/store/layout-store.ts`
- Uses V1 schema from `/types/schema.ts`
- Grid-template-areas based approach
- State: `schema`, `currentBreakpoint`, `selectedComponentId`
- Actions: Component CRUD, Grid layout management, Breakpoint management

### UI Components
1. **Main Page** (`/app/page.tsx`)
   - 3-panel layout: Header + (Canvas 70% + Panels 30%)
   - BreakpointSwitcher, KonvaCanvas, ComponentPanel, BreakpointManager

2. **KonvaCanvas** (`/components/grid-canvas/KonvaCanvas.tsx`)
   - Renders grid using Konva.js
   - Grid-template-areas visualization
   - Component drag/drop within grid cells
   - Space key panning, wheel zoom

3. **ComponentPanel** (`/components/component-panel/`)
   - ComponentForm: Add new components
   - ComponentList: Show all components

4. **BreakpointPanel** (`/components/breakpoint-panel/`)
   - BreakpointSwitcher: Switch between mobile/tablet/desktop
   - BreakpointManager: Add/edit/delete breakpoints

## V1 Schema Structure
```typescript
interface Component {
  id: string
  name: string
  semanticTag: SemanticTag
  props?: Record<string, unknown>
}

interface LaydlerSchema {
  schemaVersion: string
  components: Component[]
  breakpoints: Breakpoint[]
  layouts: {
    [breakpoint]: {
      grid: {
        rows: string
        columns: string
        areas: string[][] // grid-template-areas
      }
    }
  }
}
```

## V2 Schema Structure (Target)
```typescript
interface Component {
  id: string
  name: string
  semanticTag: SemanticTag
  positioning: ComponentPositioning  // NEW
  layout: ComponentLayout            // NEW
  styling?: ComponentStyling         // NEW
  responsive?: ResponsiveBehavior    // NEW
  props?: Record<string, unknown>
}

interface LaydlerSchemaV2 {
  schemaVersion: "2.0"
  components: Component[]
  breakpoints: Breakpoint[]
  layouts: {
    [breakpoint]: LayoutConfig  // Changed structure
  }
}
```

## P1-1 Migration Strategy

### Option A: Dual Schema Support (Recommended)
**Pros**: Backward compatibility, gradual migration, safe
**Cons**: More code, two systems temporarily

**Steps**:
1. Keep V1 store as-is
2. Create V2 store (`/store/layout-store-v2.ts`)
3. Create V2 UI components
4. Add schema version detection
5. Route to appropriate store/UI

### Option B: Direct Migration
**Pros**: Clean, single system
**Cons**: Breaking change, all-at-once

**Steps**:
1. Update store to V2 schema
2. Update all UI components
3. Provide V1→V2 migration utility
4. Update sample data

## Key Changes Needed

### Store Changes
- `addComponent`: Add positioning, layout, styling, responsive fields
- `updateComponent`: Support new fields
- `updateGridLayout`: Remove grid-template-areas logic
- Remove: `updateGridAreas`, `updateGridSize` (not needed in V2)
- Add: `updateComponentPositioning`, `updateComponentLayout`, `updateComponentStyling`, `updateComponentResponsive`

### UI Changes
1. **ComponentForm**: Add fields for positioning, layout, styling, responsive
2. **KonvaCanvas**: Remove grid-template-areas visualization, show component positioning preview
3. **ComponentList**: Show new properties
4. **BreakpointManager**: Simplified (no grid-areas)

## Decision: Go with Option A (Dual Schema Support)
- Safer migration path
- Users can test V2 without losing V1 work
- Can deprecate V1 later