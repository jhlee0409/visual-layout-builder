/**
 * Zod Schema Validation
 * Runtime validation for Laylder JSON schemas
 */

import { z } from "zod"
import type {
  LaydlerSchema,
  Component,
  Breakpoint,
  GridLayout,
  GenerationOptions,
  GenerationPackage,
} from "@/types/schema"

/**
 * Semantic tag validation
 */
export const SemanticTagSchema = z.enum([
  "header",
  "nav",
  "main",
  "aside",
  "footer",
  "section",
  "article",
  "div",
])

/**
 * Component schema validation
 */
export const ComponentSchema = z.object({
  id: z.string().regex(/^c\d+$/, "Component ID must match pattern: c1, c2, c3..."),
  name: z
    .string()
    .min(1, "Component name is required")
    .regex(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Component name must be PascalCase (e.g., GlobalHeader)"
    ),
  semanticTag: SemanticTagSchema,
  props: z.record(z.unknown()).optional(),
}) satisfies z.ZodType<Component>

/**
 * Breakpoint schema validation
 */
export const BreakpointSchema = z.object({
  name: z.string().min(1, "Breakpoint name is required"),
  minWidth: z.number().min(0, "minWidth must be >= 0"),
  gridCols: z.number().min(1, "gridCols must be >= 1"),
  gridRows: z.number().min(1, "gridRows must be >= 1"),
}) satisfies z.ZodType<Breakpoint>

/**
 * Grid layout schema validation
 */
export const GridLayoutSchema = z.object({
  rows: z.string().min(1, "Grid rows definition is required"),
  columns: z.string().min(1, "Grid columns definition is required"),
  areas: z
    .array(z.array(z.string()))
    .min(1, "Grid areas must have at least one row"),
}) satisfies z.ZodType<GridLayout>

/**
 * Breakpoint layouts schema validation
 */
export const BreakpointLayoutsSchema = z.record(
  z.object({
    grid: GridLayoutSchema,
  })
)

/**
 * Main Laylder schema validation
 */
export const LaydlerSchemaSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+$/, "Schema version must be in format: 1.0, 1.1, etc."),
  components: z.array(ComponentSchema).min(1, "At least one component is required"),
  breakpoints: z.array(BreakpointSchema).min(1, "At least one breakpoint is required"),
  layouts: BreakpointLayoutsSchema,
}) satisfies z.ZodType<LaydlerSchema>

/**
 * Target framework validation
 */
export const TargetFrameworkSchema = z.enum([
  "react",
  "vue",
  "svelte",
  "html",
  "angular",
])

/**
 * CSS solution validation
 */
export const CSSSolutionSchema = z.enum([
  "styled-components",
  "tailwind",
  "css-modules",
  "plain-css",
  "scss",
])

/**
 * Generation options validation
 */
export const GenerationOptionsSchema = z.object({
  framework: TargetFrameworkSchema,
  cssSolution: CSSSolutionSchema,
}) satisfies z.ZodType<GenerationOptions>

/**
 * Generation package validation
 */
export const GenerationPackageSchema = z.object({
  schema: LaydlerSchemaSchema,
  options: GenerationOptionsSchema,
}) satisfies z.ZodType<GenerationPackage>

/**
 * Validate Laylder schema
 * @param data - Data to validate
 * @returns Validated schema or throws error
 */
export function validateSchema(data: unknown): LaydlerSchema {
  return LaydlerSchemaSchema.parse(data)
}

/**
 * Safely validate Laylder schema (returns error instead of throwing)
 * @param data - Data to validate
 * @returns Success result with data or error result
 */
export function safeValidateSchema(data: unknown) {
  return LaydlerSchemaSchema.safeParse(data)
}

/**
 * Validate generation package
 * @param data - Data to validate
 * @returns Validated package or throws error
 */
export function validateGenerationPackage(data: unknown): GenerationPackage {
  return GenerationPackageSchema.parse(data)
}

/**
 * Safely validate generation package
 * @param data - Data to validate
 * @returns Success result with data or error result
 */
export function safeValidateGenerationPackage(data: unknown) {
  return GenerationPackageSchema.safeParse(data)
}

/**
 * Validate that all component IDs in grid areas exist in components array
 * @param schema - Laylder schema to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateComponentReferences(schema: LaydlerSchema): string[] {
  const errors: string[] = []
  const componentIds = new Set(schema.components.map((c) => c.id))

  for (const [breakpointName, layout] of Object.entries(schema.layouts)) {
    const { areas } = layout.grid

    areas.forEach((row, rowIndex) => {
      row.forEach((componentId, colIndex) => {
        if (componentId && !componentIds.has(componentId)) {
          errors.push(
            `Invalid component ID "${componentId}" at ${breakpointName}.grid.areas[${rowIndex}][${colIndex}]. Component does not exist.`
          )
        }
      })
    })
  }

  return errors
}
