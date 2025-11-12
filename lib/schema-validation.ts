/**
 * Schema Validation Logic
 *
 * Schema 구조의 유효성을 검증하고 제약 조건을 확인
 */

import type {
  LaydlerSchema,
  Component,
  ComponentPositioning,
  ComponentLayout,
  LayoutConfig,
  Breakpoint,
} from "@/types/schema"

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  field?: string
  componentId?: string
}

export interface ValidationWarning {
  code: string
  message: string
  field?: string
  componentId?: string
}

/**
 * Schema 전체 검증
 */
export function validateSchema(
  schema: LaydlerSchema
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. Schema version 검증
  if (schema.schemaVersion !== "2.0") {
    errors.push({
      code: "INVALID_VERSION",
      message: `Schema version must be "2.0", got "${schema.schemaVersion}"`,
      field: "schemaVersion",
    })
  }

  // 2. Components 검증
  if (!schema.components || schema.components.length === 0) {
    errors.push({
      code: "NO_COMPONENTS",
      message: "Schema must have at least one component",
      field: "components",
    })
  } else {
    // 각 컴포넌트 검증
    schema.components.forEach((component) => {
      const componentErrors = validateComponent(component)
      errors.push(...componentErrors.errors)
      warnings.push(...componentErrors.warnings)
    })

    // 컴포넌트 ID 중복 검사
    const componentIds = schema.components.map((c) => c.id)
    const duplicateIds = componentIds.filter(
      (id, index) => componentIds.indexOf(id) !== index
    )
    if (duplicateIds.length > 0) {
      errors.push({
        code: "DUPLICATE_COMPONENT_ID",
        message: `Duplicate component IDs found: ${duplicateIds.join(", ")}`,
        field: "components",
      })
    }
  }

  // 3. Breakpoints 검증
  const breakpointErrors = validateBreakpoints(schema.breakpoints)
  errors.push(...breakpointErrors.errors)
  warnings.push(...breakpointErrors.warnings)

  // 4. Layouts 검증 - 정의된 브레이크포인트에 대한 레이아웃 존재 확인
  const breakpointNames = schema.breakpoints.map((bp) => bp.name)
  breakpointNames.forEach((bpName) => {
    if (!schema.layouts[bpName]) {
      errors.push({
        code: "MISSING_LAYOUT",
        message: `Missing layout configuration for breakpoint: ${bpName}`,
        field: `layouts.${bpName}`,
      })
    } else {
      const layoutErrors = validateLayoutConfig(
        schema.layouts[bpName] as LayoutConfig,
        schema.components,
        bpName
      )
      errors.push(...layoutErrors.errors)
      warnings.push(...layoutErrors.warnings)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Component 검증
 */
function validateComponent(component: Component): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. ID 검증
  if (!component.id || component.id.trim() === "") {
    errors.push({
      code: "INVALID_COMPONENT_ID",
      message: "Component ID cannot be empty",
      componentId: component.id,
    })
  }

  // 2. Name 검증 (PascalCase)
  const nameRegex = /^[A-Z][a-zA-Z0-9]*$/
  if (!nameRegex.test(component.name)) {
    errors.push({
      code: "INVALID_COMPONENT_NAME",
      message: `Component name must be PascalCase, got "${component.name}"`,
      componentId: component.id,
      field: "name",
    })
  }

  // 3. Positioning 검증
  const positioningErrors = validatePositioning(component.positioning)
  errors.push(
    ...positioningErrors.errors.map((e) => ({
      ...e,
      componentId: component.id,
    }))
  )
  warnings.push(
    ...positioningErrors.warnings.map((w) => ({
      ...w,
      componentId: component.id,
    }))
  )

  // 4. Layout 검증
  const layoutErrors = validateComponentLayout(component.layout)
  errors.push(
    ...layoutErrors.errors.map((e) => ({
      ...e,
      componentId: component.id,
    }))
  )
  warnings.push(
    ...layoutErrors.warnings.map((w) => ({
      ...w,
      componentId: component.id,
    }))
  )

  // 5. Semantic tag에 따른 권장사항 검증
  const semanticWarnings = validateSemanticTagUsage(component)
  warnings.push(
    ...semanticWarnings.map((w) => ({
      ...w,
      componentId: component.id,
    }))
  )

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Positioning 검증
 */
function validatePositioning(
  positioning: ComponentPositioning
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // fixed/sticky/absolute는 position 값이 필요
  if (
    ["fixed", "sticky", "absolute"].includes(positioning.type) &&
    (!positioning.position ||
      Object.keys(positioning.position).length === 0)
  ) {
    warnings.push({
      code: "MISSING_POSITION_VALUES",
      message: `Positioning type "${positioning.type}" usually requires position values (top, left, etc.)`,
      field: "positioning.position",
    })
  }

  // fixed는 일반적으로 top/bottom 중 하나 필요
  if (positioning.type === "fixed" && positioning.position) {
    if (
      positioning.position.top === undefined &&
      positioning.position.bottom === undefined
    ) {
      warnings.push({
        code: "FIXED_WITHOUT_VERTICAL_POSITION",
        message:
          'Fixed positioning usually needs either "top" or "bottom" value',
        field: "positioning.position",
      })
    }
  }

  // zIndex 범위 검증
  if (
    positioning.position?.zIndex !== undefined &&
    (positioning.position.zIndex < 0 || positioning.position.zIndex > 9999)
  ) {
    warnings.push({
      code: "UNUSUAL_ZINDEX",
      message: `z-index value ${positioning.position.zIndex} is outside typical range (0-9999)`,
      field: "positioning.position.zIndex",
    })
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Component Layout 검증
 */
function validateComponentLayout(layout: ComponentLayout): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Layout type에 따른 설정 검증
  switch (layout.type) {
    case "flex":
      if (!layout.flex) {
        warnings.push({
          code: "FLEX_WITHOUT_CONFIG",
          message: 'Layout type is "flex" but no flex configuration provided',
          field: "layout.flex",
        })
      }
      break

    case "grid":
      if (!layout.grid) {
        warnings.push({
          code: "GRID_WITHOUT_CONFIG",
          message: 'Layout type is "grid" but no grid configuration provided',
          field: "layout.grid",
        })
      } else {
        // Grid는 cols 또는 rows 중 하나는 있어야 함
        if (!layout.grid.cols && !layout.grid.rows) {
          warnings.push({
            code: "GRID_WITHOUT_COLS_OR_ROWS",
            message:
              "Grid layout should specify either cols or rows (or both)",
            field: "layout.grid",
          })
        }
      }
      break

    case "container":
      if (!layout.container) {
        warnings.push({
          code: "CONTAINER_WITHOUT_CONFIG",
          message:
            'Layout type is "container" but no container configuration provided',
          field: "layout.container",
        })
      }
      break

    case "none":
      // none은 설정 불필요
      break
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Semantic Tag 사용 검증 (권장사항)
 */
function validateSemanticTagUsage(component: Component): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  switch (component.semanticTag) {
    case "header":
      // Header는 fixed나 sticky 권장
      if (
        component.positioning.type !== "fixed" &&
        component.positioning.type !== "sticky"
      ) {
        warnings.push({
          code: "HEADER_NOT_FIXED_OR_STICKY",
          message:
            'Semantic tag "header" is typically fixed or sticky positioned',
          field: "positioning.type",
        })
      }
      break

    case "footer":
      // Footer는 static 권장
      if (component.positioning.type !== "static") {
        warnings.push({
          code: "FOOTER_NOT_STATIC",
          message: 'Semantic tag "footer" is typically static positioned',
          field: "positioning.type",
        })
      }
      break

    case "nav":
      // Nav는 flex layout 권장
      if (component.layout.type !== "flex") {
        warnings.push({
          code: "NAV_NOT_FLEX",
          message: 'Semantic tag "nav" typically uses flex layout',
          field: "layout.type",
        })
      }
      break

    case "main":
      // Main은 flex-1 또는 container 권장
      if (
        component.layout.type !== "container" &&
        !component.styling?.className?.includes("flex-1")
      ) {
        warnings.push({
          code: "MAIN_WITHOUT_FLEX1_OR_CONTAINER",
          message:
            'Semantic tag "main" typically uses container layout or flex-1 class',
          field: "layout.type",
        })
      }
      break
  }

  return warnings
}

/**
 * Breakpoints 검증
 */
function validateBreakpoints(breakpoints: Breakpoint[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 최소 1개 이상의 브레이크포인트 필요
  if (!breakpoints || breakpoints.length === 0) {
    errors.push({
      code: "NO_BREAKPOINTS",
      message: "Schema must have at least one breakpoint",
      field: "breakpoints",
    })
    return { valid: false, errors, warnings }
  }

  // 브레이크포인트 이름 중복 검사
  const breakpointNames = breakpoints.map((bp) => bp.name)
  const duplicateNames = breakpointNames.filter(
    (name, index) => breakpointNames.indexOf(name) !== index
  )
  if (duplicateNames.length > 0) {
    errors.push({
      code: "DUPLICATE_BREAKPOINT_NAME",
      message: `Duplicate breakpoint names found: ${duplicateNames.join(", ")}`,
      field: "breakpoints",
    })
  }

  // minWidth 순서 검증
  const sortedByMinWidth = [...breakpoints].sort(
    (a, b) => a.minWidth - b.minWidth
  )
  const isOrdered = breakpoints.every(
    (bp, index) => bp.minWidth === sortedByMinWidth[index].minWidth
  )

  if (!isOrdered) {
    warnings.push({
      code: "BREAKPOINTS_NOT_SORTED",
      message: "Breakpoints should be sorted by minWidth in ascending order",
      field: "breakpoints",
    })
  }

  // minWidth 값 검증
  breakpoints.forEach((bp) => {
    if (bp.minWidth < 0) {
      errors.push({
        code: "INVALID_MIN_WIDTH",
        message: `Breakpoint "${bp.name}" has negative minWidth: ${bp.minWidth}`,
        field: `breakpoints.${bp.name}.minWidth`,
      })
    }
  })

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * LayoutConfig 검증
 */
function validateLayoutConfig(
  layout: LayoutConfig,
  allComponents: Component[],
  breakpointName: string
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. components 배열 검증
  if (!layout.components || layout.components.length === 0) {
    errors.push({
      code: "EMPTY_LAYOUT",
      message: `Layout for "${breakpointName}" has no components`,
      field: `layouts.${breakpointName}.components`,
    })
  }

  // 2. 참조하는 컴포넌트 ID가 실제로 존재하는지 확인
  const allComponentIds = allComponents.map((c) => c.id)
  layout.components.forEach((componentId) => {
    if (!allComponentIds.includes(componentId)) {
      errors.push({
        code: "INVALID_COMPONENT_REFERENCE",
        message: `Layout references non-existent component: ${componentId}`,
        field: `layouts.${breakpointName}.components`,
      })
    }
  })

  // 3. roles 검증
  if (layout.roles) {
    Object.entries(layout.roles).forEach(([role, componentId]) => {
      if (componentId && !layout.components.includes(componentId)) {
        errors.push({
          code: "ROLE_COMPONENT_NOT_IN_LAYOUT",
          message: `Role "${role}" references component "${componentId}" which is not in the layout`,
          field: `layouts.${breakpointName}.roles.${role}`,
        })
      }
    })
  }

  // 4. Structure에 따른 권장사항
  switch (layout.structure) {
    case "vertical":
      if (
        layout.containerLayout?.type === "flex" &&
        layout.containerLayout.flex?.direction !== "column"
      ) {
        warnings.push({
          code: "VERTICAL_STRUCTURE_NOT_COLUMN",
          message:
            'Structure "vertical" typically uses flex direction "column"',
          field: `layouts.${breakpointName}.containerLayout.flex.direction`,
        })
      }
      break

    case "horizontal":
      if (
        layout.containerLayout?.type === "flex" &&
        layout.containerLayout.flex?.direction !== "row"
      ) {
        warnings.push({
          code: "HORIZONTAL_STRUCTURE_NOT_ROW",
          message:
            'Structure "horizontal" typically uses flex direction "row"',
          field: `layouts.${breakpointName}.containerLayout.flex.direction`,
        })
      }
      break

    case "sidebar-main":
      if (!layout.roles?.sidebar || !layout.roles?.main) {
        warnings.push({
          code: "SIDEBAR_MAIN_WITHOUT_ROLES",
          message:
            'Structure "sidebar-main" should specify sidebar and main roles',
          field: `layouts.${breakpointName}.roles`,
        })
      }
      break
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * 검증 결과를 사람이 읽기 쉬운 형식으로 포맷
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []

  if (result.valid) {
    lines.push("✅ Schema validation passed!")
  } else {
    lines.push("❌ Schema validation failed")
  }

  if (result.errors.length > 0) {
    lines.push("\n🚨 Errors:")
    result.errors.forEach((error, index) => {
      lines.push(
        `  ${index + 1}. [${error.code}] ${error.message}${
          error.componentId ? ` (Component: ${error.componentId})` : ""
        }${error.field ? ` (Field: ${error.field})` : ""}`
      )
    })
  }

  if (result.warnings.length > 0) {
    lines.push("\n⚠️  Warnings:")
    result.warnings.forEach((warning, index) => {
      lines.push(
        `  ${index + 1}. [${warning.code}] ${warning.message}${
          warning.componentId ? ` (Component: ${warning.componentId})` : ""
        }${warning.field ? ` (Field: ${warning.field})` : ""}`
      )
    })
  }

  return lines.join("\n")
}
