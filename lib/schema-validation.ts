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

  // 5. Canvas-Layout consistency 검증
  const canvasLayoutResult = validateCanvasLayoutConsistency(schema)
  errors.push(...canvasLayoutResult.errors)
  warnings.push(...canvasLayoutResult.warnings)

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
 * Canvas-Layout Consistency 검증
 *
 * Canvas Grid 상의 시각적 배치와 Layout의 component 순서가 다를 경우 경고
 * AI가 잘못된 순서로 코드를 생성할 수 있으므로 사용자에게 알림
 *
 * @param schema - LaydlerSchema
 * @returns ValidationResult - Canvas-Layout 불일치 검증 결과 (에러 + 경고)
 */
function validateCanvasLayoutConsistency(
  schema: LaydlerSchema
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  schema.breakpoints.forEach((breakpoint) => {
    const breakpointName = breakpoint.name
    const layout = schema.layouts[breakpointName] as LayoutConfig | undefined

    if (!layout) return

    // 1. Canvas Grid 기준으로 컴포넌트 정렬 (y축 우선, 같은 row면 x축)
    const componentsWithCanvas = schema.components
      .filter((c) => layout.components.includes(c.id))
      .map((c) => {
        // Responsive Canvas Layout 또는 기본 Canvas Layout 사용
        const canvasLayout =
          c.responsiveCanvasLayout?.[
            breakpointName as keyof typeof c.responsiveCanvasLayout
          ] || c.canvasLayout

        return {
          id: c.id,
          name: c.name,
          canvasLayout,
        }
      })
      .filter((c) => c.canvasLayout !== undefined)

    // Canvas layout이 없는 컴포넌트가 있으면 검증 불가
    if (componentsWithCanvas.length === 0) return
    if (componentsWithCanvas.length !== layout.components.length) {
      warnings.push({
        code: "MISSING_CANVAS_LAYOUT",
        message: `Some components in "${breakpointName}" layout are missing Canvas layout information. Canvas-based visual layout may not be accurate.`,
        field: `layouts.${breakpointName}`,
      })
      return
    }

    // Canvas Grid 기준으로 정렬 (y축 우선, x축 보조)
    const sortedByCanvas = [...componentsWithCanvas].sort((a, b) => {
      const aY = a.canvasLayout!.y
      const bY = b.canvasLayout!.y
      const aX = a.canvasLayout!.x
      const bX = b.canvasLayout!.x

      if (aY !== bY) return aY - bY
      return aX - bX
    })

    const canvasOrder = sortedByCanvas.map((c) => c.id)
    const layoutOrder = layout.components

    // 2. 순서 비교
    const orderMismatch = canvasOrder.some(
      (id, index) => id !== layoutOrder[index]
    )

    if (orderMismatch) {
      // 불일치 컴포넌트 찾기
      const mismatchedComponents = canvasOrder.filter(
        (id, index) => id !== layoutOrder[index]
      )

      warnings.push({
        code: "CANVAS_LAYOUT_ORDER_MISMATCH",
        message: `Visual layout (Canvas Grid) differs from DOM order (layout.components) in "${breakpointName}" breakpoint. Components affected: ${mismatchedComponents.join(", ")}. This may cause AI to generate code with incorrect positioning. Canvas order: [${canvasOrder.join(", ")}], Layout order: [${layoutOrder.join(", ")}]`,
        field: `layouts.${breakpointName}.components`,
      })
    }

    // 3. 복잡한 Grid 패턴 감지 (같은 row에 여러 컴포넌트)
    const rowGroups = new Map<number, string[]>()
    componentsWithCanvas.forEach((c) => {
      const row = c.canvasLayout!.y
      if (!rowGroups.has(row)) {
        rowGroups.set(row, [])
      }
      rowGroups.get(row)!.push(c.id)
    })

    const complexRows = Array.from(rowGroups.entries()).filter(
      ([_, components]) => components.length > 1
    )

    if (complexRows.length > 0) {
      const complexRowDescriptions = complexRows.map(([row, components]) => {
        const componentNames = components
          .map((id) => {
            const comp = schema.components.find((c) => c.id === id)
            return comp ? `${comp.name} (${id})` : id
          })
          .join(", ")
        return `Row ${row}: ${componentNames}`
      })

      warnings.push({
        code: "COMPLEX_GRID_LAYOUT_DETECTED",
        message: `Complex 2D Grid layout detected in "${breakpointName}" with components side-by-side: ${complexRowDescriptions.join("; ")}. Make sure your prompt includes Canvas Grid positioning information (Visual Layout Description) for accurate AI code generation.`,
        field: `layouts.${breakpointName}`,
      })
    }

    // 4. Overlap detection (components in same row with overlapping x ranges)
    complexRows.forEach(([row, componentIds]) => {
      for (let i = 0; i < componentIds.length; i++) {
        for (let j = i + 1; j < componentIds.length; j++) {
          const comp1 = componentsWithCanvas.find((c) => c.id === componentIds[i])
          const comp2 = componentsWithCanvas.find((c) => c.id === componentIds[j])

          if (!comp1 || !comp2) continue

          const layout1 = comp1.canvasLayout!
          const layout2 = comp2.canvasLayout!

          // Check if x ranges overlap
          const overlap = !(
            layout1.x + layout1.width <= layout2.x ||
            layout2.x + layout2.width <= layout1.x
          )

          if (overlap) {
            warnings.push({
              code: "CANVAS_COMPONENTS_OVERLAP",
              message: `Components ${comp1.name} (${comp1.id}) and ${comp2.name} (${comp2.id}) have overlapping Canvas Grid positions in "${breakpointName}" breakpoint. This may cause rendering issues or unexpected AI code generation.`,
              field: `layouts.${breakpointName}`,
            })
          }
        }
      }
    })
  })

  // 5. Additional Canvas Layout validations for ALL components
  const additionalWarnings = validateCanvasLayoutBounds(
    schema,
    errors
  )
  warnings.push(...additionalWarnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Canvas Layout Bounds 검증
 *
 * Canvas Layout의 좌표, 크기, 범위 등을 검증
 * - 음수 좌표 (에러)
 * - 크기 0 (경고)
 * - 그리드 범위 초과 (경고)
 * - 소수점 좌표 (경고)
 * - Canvas에만 있고 Layout에 없는 컴포넌트 (경고)
 */
function validateCanvasLayoutBounds(
  schema: LaydlerSchema,
  errors: ValidationError[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  schema.components.forEach((component) => {
    // Check both canvasLayout and responsiveCanvasLayout
    const layoutsToCheck: Array<{
      layout: { x: number; y: number; width: number; height: number }
      breakpoint?: string
    }> = []

    if (component.canvasLayout) {
      layoutsToCheck.push({ layout: component.canvasLayout })
    }

    if (component.responsiveCanvasLayout) {
      Object.entries(component.responsiveCanvasLayout).forEach(
        ([breakpointName, layout]) => {
          if (layout) {
            layoutsToCheck.push({ layout, breakpoint: breakpointName })
          }
        }
      )
    }

    layoutsToCheck.forEach(({ layout, breakpoint }) => {
      const contextMsg = breakpoint
        ? ` in "${breakpoint}" breakpoint`
        : ""

      // 1. Negative coordinates (ERROR)
      if (layout.x < 0 || layout.y < 0) {
        errors.push({
          code: "CANVAS_NEGATIVE_COORDINATE",
          message: `Component "${component.name}" (${component.id}) has negative Canvas coordinates (x: ${layout.x}, y: ${layout.y})${contextMsg}. Coordinates must be non-negative.`,
          componentId: component.id,
          field: breakpoint ? `responsiveCanvasLayout.${breakpoint}` : "canvasLayout",
        })
      }

      // 2. Zero size (WARNING)
      if (layout.width === 0 || layout.height === 0) {
        warnings.push({
          code: "CANVAS_ZERO_SIZE",
          message: `Component "${component.name}" (${component.id}) has zero width or height (width: ${layout.width}, height: ${layout.height})${contextMsg}. This component will not be visible.`,
          componentId: component.id,
          field: breakpoint ? `responsiveCanvasLayout.${breakpoint}` : "canvasLayout",
        })
      }

      // 3. Fractional coordinates (WARNING)
      if (
        !Number.isInteger(layout.x) ||
        !Number.isInteger(layout.y) ||
        !Number.isInteger(layout.width) ||
        !Number.isInteger(layout.height)
      ) {
        warnings.push({
          code: "CANVAS_FRACTIONAL_COORDINATE",
          message: `Component "${component.name}" (${component.id}) has fractional Canvas coordinates (x: ${layout.x}, y: ${layout.y}, width: ${layout.width}, height: ${layout.height})${contextMsg}. Grid positions should be integers for consistent rendering.`,
          componentId: component.id,
          field: breakpoint ? `responsiveCanvasLayout.${breakpoint}` : "canvasLayout",
        })
      }

      // 4. Out of bounds (WARNING)
      // Find appropriate breakpoint for checking bounds
      let bp: Breakpoint | undefined
      if (breakpoint) {
        bp = schema.breakpoints.find((b) => b.name === breakpoint)
      } else if (schema.breakpoints.length > 0) {
        // For canvasLayout without breakpoint, use first/default breakpoint
        bp = schema.breakpoints[0]
      }

      if (bp) {
        const exceedsWidth = layout.x + layout.width > bp.gridCols
        const exceedsHeight = layout.y + layout.height > bp.gridRows

        if (exceedsWidth || exceedsHeight) {
          warnings.push({
            code: "CANVAS_OUT_OF_BOUNDS",
            message: `Component "${component.name}" (${component.id}) exceeds grid boundaries${contextMsg}. Position: (${layout.x}, ${layout.y}), Size: ${layout.width}×${layout.height}, Grid: ${bp.gridCols}×${bp.gridRows}. ${exceedsWidth ? `Exceeds width (${layout.x + layout.width} > ${bp.gridCols}). ` : ""}${exceedsHeight ? `Exceeds height (${layout.y + layout.height} > ${bp.gridRows}).` : ""}`,
            componentId: component.id,
            field: breakpoint ? `responsiveCanvasLayout.${breakpoint}` : "canvasLayout",
          })
        }
      }
    })

    // 5. Component has Canvas layout but not in any layout.components (WARNING)
    const hasCanvasLayout = component.canvasLayout || component.responsiveCanvasLayout

    if (hasCanvasLayout) {
      const inAnyLayout = Object.values(schema.layouts).some((layout) =>
        (layout as LayoutConfig).components.includes(component.id)
      )

      if (!inAnyLayout) {
        warnings.push({
          code: "CANVAS_COMPONENT_NOT_IN_LAYOUT",
          message: `Component "${component.name}" (${component.id}) has Canvas layout information but is not included in any breakpoint's layout.components array. This component will not be rendered.`,
          componentId: component.id,
          field: "canvasLayout",
        })
      }
    }
  })

  return warnings
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
