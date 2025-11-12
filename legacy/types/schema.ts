/**
 * Laylder Schema Type Definitions
 * Based on PRD 0.3 Section 4: Core Data Structure (JSON)
 */

/**
 * Semantic HTML tags supported by Laylder
 */
export type SemanticTag =
  | "header"
  | "nav"
  | "main"
  | "aside"
  | "footer"
  | "section"
  | "article"
  | "div"

/**
 * Component definition
 * Each component represents a semantic layout element
 */
export interface Component {
  /** Unique identifier (auto-generated: c1, c2, c3...) */
  id: string

  /** Component name for file/component generation (e.g., GlobalHeader, Sidebar) */
  name: string

  /** HTML semantic tag to use */
  semanticTag: SemanticTag

  /** Default props to pass to the component */
  props?: Record<string, unknown>
}

/**
 * Breakpoint definition for responsive design
 */
export interface Breakpoint {
  /** Breakpoint name (mobile, tablet, desktop) */
  name: string

  /** Minimum width in pixels (0 for mobile-first) */
  minWidth: number

  /** Number of grid columns for this breakpoint (e.g., mobile: 4, tablet: 8, desktop: 12) */
  gridCols: number

  /** Number of grid rows for this breakpoint (e.g., 20 for all breakpoints) */
  gridRows: number
}

/**
 * Grid layout configuration for a specific breakpoint
 */
export interface GridLayout {
  /** CSS Grid rows definition (e.g., "60px auto 1fr 80px") */
  rows: string

  /** CSS Grid columns definition (e.g., "1fr" or "200px 1fr") */
  columns: string

  /** 2D array representing grid-template-areas
   * Each inner array is a row, containing component IDs
   * Components not in areas are hidden at this breakpoint
   */
  areas: string[][]
}

/**
 * Layout configurations for each breakpoint
 * Allows custom breakpoint names while providing default ones
 */
export type BreakpointLayouts = Record<
  string,
  {
    grid: GridLayout
  }
>

/**
 * Main Laylder Schema
 * Framework-neutral layout specification
 */
export interface LaydlerSchema {
  /** Schema version for backward compatibility */
  schemaVersion: string

  /** Array of all components in the layout */
  components: Component[]

  /** Breakpoint definitions (customizable) */
  breakpoints: Breakpoint[]

  /** Layout configuration for each breakpoint */
  layouts: BreakpointLayouts
}

/**
 * Target frameworks supported for code generation
 */
export type TargetFramework =
  | "react"
  | "vue"
  | "svelte"
  | "html"
  | "angular"

/**
 * CSS solutions supported for code generation
 */
export type CSSolution =
  | "styled-components"
  | "tailwind"
  | "css-modules"
  | "plain-css"
  | "scss"

/**
 * Generation options selected by user
 */
export interface GenerationOptions {
  /** Target framework for code generation */
  framework: TargetFramework

  /** CSS solution to use */
  cssSolution: CSSolution
}

/**
 * Complete generation package
 * Includes schema + generation options
 */
export interface GenerationPackage {
  schema: LaydlerSchema
  options: GenerationOptions
}
