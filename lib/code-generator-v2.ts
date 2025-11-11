/**
 * Code Generator V2
 *
 * Schema V2를 실제 React + Tailwind 코드로 변환
 */

import type {
  ComponentPositioning,
  ComponentLayout,
  ComponentStyling,
  ResponsiveBehavior,
  Component,
} from "@/types/schema-v2"

/**
 * Positioning을 Tailwind className으로 변환
 *
 * @example
 * { type: "fixed", position: { top: 0, left: 0, right: 0, zIndex: 50 } }
 * → "fixed top-0 left-0 right-0 z-50"
 */
export function generatePositioningClasses(
  positioning: ComponentPositioning
): string {
  const classes: string[] = []

  // 1. Positioning type
  if (positioning.type !== "static") {
    classes.push(positioning.type)
  }

  // 2. Position values
  if (positioning.position) {
    const { top, right, bottom, left, zIndex } = positioning.position

    // Top
    if (top !== undefined) {
      if (typeof top === "number") {
        classes.push(`top-${top}`)
      } else {
        // "4rem" → "top-16" (4rem = 16 in Tailwind)
        const value = parsePositionValue(top)
        if (value) classes.push(`top-${value}`)
      }
    }

    // Right
    if (right !== undefined) {
      if (typeof right === "number") {
        classes.push(`right-${right}`)
      } else {
        const value = parsePositionValue(right)
        if (value) classes.push(`right-${value}`)
      }
    }

    // Bottom
    if (bottom !== undefined) {
      if (typeof bottom === "number") {
        classes.push(`bottom-${bottom}`)
      } else {
        const value = parsePositionValue(bottom)
        if (value) classes.push(`bottom-${value}`)
      }
    }

    // Left
    if (left !== undefined) {
      if (typeof left === "number") {
        classes.push(`left-${left}`)
      } else {
        const value = parsePositionValue(left)
        if (value) classes.push(`left-${value}`)
      }
    }

    // Z-index
    if (zIndex !== undefined) {
      classes.push(`z-${zIndex}`)
    }
  }

  return classes.join(" ")
}

/**
 * Position value를 Tailwind spacing으로 변환
 *
 * @example
 * "4rem" → "16"  (4 * 4 = 16)
 * "1rem" → "4"
 * "0" → "0"
 */
function parsePositionValue(value: string | number): string | null {
  if (typeof value === "number") return value.toString()

  // "0" → "0"
  if (value === "0") return "0"

  // "4rem" → 16
  const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/)
  if (remMatch) {
    const rem = parseFloat(remMatch[1])
    return (rem * 4).toString() // 1rem = 4 in Tailwind
  }

  // "16px" → 4
  const pxMatch = value.match(/^(\d+)px$/)
  if (pxMatch) {
    const px = parseInt(pxMatch[1], 10)
    return (px / 4).toString() // 4px = 1 in Tailwind
  }

  return null
}

/**
 * Layout을 Tailwind className으로 변환
 *
 * @example
 * { type: "flex", flex: { direction: "column", gap: "0.5rem" } }
 * → "flex flex-col gap-2"
 */
export function generateLayoutClasses(layout: ComponentLayout): string {
  const classes: string[] = []

  switch (layout.type) {
    case "flex":
      classes.push("flex")

      if (layout.flex) {
        const { direction, justify, items, wrap, gap } = layout.flex

        // Direction
        if (direction) {
          const directionMap: Record<string, string> = {
            row: "flex-row",
            column: "flex-col",
            "row-reverse": "flex-row-reverse",
            "column-reverse": "flex-col-reverse",
          }
          classes.push(directionMap[direction])
        }

        // Justify
        if (justify) {
          const justifyMap: Record<string, string> = {
            start: "justify-start",
            end: "justify-end",
            center: "justify-center",
            between: "justify-between",
            around: "justify-around",
            evenly: "justify-evenly",
          }
          classes.push(justifyMap[justify])
        }

        // Items
        if (items) {
          const itemsMap: Record<string, string> = {
            start: "items-start",
            end: "items-end",
            center: "items-center",
            baseline: "items-baseline",
            stretch: "items-stretch",
          }
          classes.push(itemsMap[items])
        }

        // Wrap
        if (wrap) {
          const wrapMap: Record<string, string> = {
            wrap: "flex-wrap",
            nowrap: "flex-nowrap",
            "wrap-reverse": "flex-wrap-reverse",
          }
          classes.push(wrapMap[wrap])
        }

        // Gap
        if (gap !== undefined) {
          const gapValue = parseSpacingValue(gap)
          if (gapValue) classes.push(`gap-${gapValue}`)
        }
      }
      break

    case "grid":
      classes.push("grid")

      if (layout.grid) {
        const { cols, rows, gap, autoFlow } = layout.grid

        // Columns
        if (cols !== undefined) {
          if (typeof cols === "number") {
            classes.push(`grid-cols-${cols}`)
          } else {
            // "repeat(auto-fill, minmax(300px, 1fr))"
            classes.push(`grid-cols-[${cols.replace(/\s/g, "")}]`)
          }
        }

        // Rows
        if (rows !== undefined) {
          if (typeof rows === "number") {
            classes.push(`grid-rows-${rows}`)
          } else {
            classes.push(`grid-rows-[${rows.replace(/\s/g, "")}]`)
          }
        }

        // Gap
        if (gap !== undefined) {
          const gapValue = parseSpacingValue(gap)
          if (gapValue) classes.push(`gap-${gapValue}`)
        }

        // Auto flow
        if (autoFlow) {
          const flowMap: Record<string, string> = {
            row: "grid-flow-row",
            column: "grid-flow-col",
            "row dense": "grid-flow-row-dense",
            "column dense": "grid-flow-col-dense",
          }
          classes.push(flowMap[autoFlow])
        }
      }
      break

    case "container":
      // Container는 wrapper div에 적용됨
      break

    case "none":
      // No layout classes
      break
  }

  return classes.join(" ")
}

/**
 * Spacing value를 Tailwind spacing으로 변환
 *
 * @example
 * "0.5rem" → "2"
 * "1rem" → "4"
 * 16 → "16"
 */
function parseSpacingValue(value: string | number): string | null {
  if (typeof value === "number") return value.toString()

  // "0.5rem" → 2
  const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/)
  if (remMatch) {
    const rem = parseFloat(remMatch[1])
    return (rem * 4).toString()
  }

  // "8px" → 2
  const pxMatch = value.match(/^(\d+)px$/)
  if (pxMatch) {
    const px = parseInt(pxMatch[1], 10)
    return (px / 4).toString()
  }

  return null
}

/**
 * Styling을 Tailwind className으로 변환
 *
 * @example
 * { width: "16rem", background: "white", border: "b" }
 * → "w-64 bg-white border-b"
 */
export function generateStylingClasses(styling?: ComponentStyling): string {
  if (!styling) return ""

  const classes: string[] = []

  // Width
  if (styling.width) {
    const widthValue = parseSizeValue(styling.width)
    if (widthValue) classes.push(`w-${widthValue}`)
  }

  // Height
  if (styling.height) {
    const heightValue = parseSizeValue(styling.height)
    if (heightValue) classes.push(`h-${heightValue}`)
  }

  // Background
  if (styling.background) {
    classes.push(`bg-${styling.background}`)
  }

  // Border
  if (styling.border) {
    // "b" → "border-b"
    // "r" → "border-r"
    classes.push(`border-${styling.border}`)
  }

  // Shadow
  if (styling.shadow) {
    classes.push(`shadow-${styling.shadow}`)
  }

  // Custom className
  if (styling.className) {
    classes.push(styling.className)
  }

  return classes.join(" ")
}

/**
 * Size value를 Tailwind size로 변환
 *
 * @example
 * "16rem" → "64"  (16 * 4 = 64)
 * "4rem" → "16"
 * "full" → "full"
 */
function parseSizeValue(value: string | number): string | null {
  if (typeof value === "number") return value.toString()

  // "full", "screen", "auto" 등은 그대로
  if (["full", "screen", "auto", "min", "max", "fit"].includes(value)) {
    return value
  }

  // "16rem" → 64
  const remMatch = value.match(/^(\d+(?:\.\d+)?)rem$/)
  if (remMatch) {
    const rem = parseFloat(remMatch[1])
    return (rem * 4).toString()
  }

  // "64px" → 16
  const pxMatch = value.match(/^(\d+)px$/)
  if (pxMatch) {
    const px = parseInt(pxMatch[1], 10)
    return (px / 4).toString()
  }

  return null
}

/**
 * Responsive behavior를 Tailwind responsive classes로 변환
 *
 * @example
 * { mobile: { hidden: true }, desktop: { hidden: false } }
 * → "hidden lg:block"
 */
export function generateResponsiveClasses(
  responsive?: ResponsiveBehavior
): string {
  if (!responsive) return ""

  const classes: string[] = []

  // Mobile (default, no prefix)
  if (responsive.mobile?.hidden) {
    classes.push("hidden")
  }

  // Tablet (md prefix)
  if (responsive.tablet) {
    if (responsive.tablet.hidden === false && responsive.mobile?.hidden) {
      classes.push("md:block")
    } else if (responsive.tablet.hidden) {
      classes.push("md:hidden")
    }

    if (responsive.tablet.width) {
      const widthValue = parseSizeValue(responsive.tablet.width)
      if (widthValue) classes.push(`md:w-${widthValue}`)
    }

    if (responsive.tablet.order !== undefined) {
      classes.push(`md:order-${responsive.tablet.order}`)
    }
  }

  // Desktop (lg prefix)
  if (responsive.desktop) {
    if (
      responsive.desktop.hidden === false &&
      (responsive.mobile?.hidden || responsive.tablet?.hidden)
    ) {
      classes.push("lg:block")
    } else if (responsive.desktop.hidden) {
      classes.push("lg:hidden")
    }

    if (responsive.desktop.width) {
      const widthValue = parseSizeValue(responsive.desktop.width)
      if (widthValue) classes.push(`lg:w-${widthValue}`)
    }

    if (responsive.desktop.order !== undefined) {
      classes.push(`lg:order-${responsive.desktop.order}`)
    }
  }

  return classes.join(" ")
}

/**
 * Component 전체를 Tailwind className으로 변환
 */
export function generateComponentClasses(component: Component): string {
  const classes: string[] = []

  // 1. Positioning
  const positioningClasses = generatePositioningClasses(component.positioning)
  if (positioningClasses) classes.push(positioningClasses)

  // 2. Layout
  const layoutClasses = generateLayoutClasses(component.layout)
  if (layoutClasses) classes.push(layoutClasses)

  // 3. Styling
  const stylingClasses = generateStylingClasses(component.styling)
  if (stylingClasses) classes.push(stylingClasses)

  // 4. Responsive
  const responsiveClasses = generateResponsiveClasses(component.responsive)
  if (responsiveClasses) classes.push(responsiveClasses)

  return classes.join(" ")
}

/**
 * Container wrapper를 생성해야 하는지 확인
 */
function needsContainerWrapper(layout: ComponentLayout): boolean {
  return layout.type === "container" && !!layout.container
}

/**
 * Container wrapper className 생성
 */
function generateContainerWrapperClasses(
  container: NonNullable<ComponentLayout["container"]>
): string {
  const classes: string[] = ["container"]

  // Max width
  if (container.maxWidth && container.maxWidth !== "full") {
    classes.push(`max-w-${container.maxWidth}`)
  }

  // Centered (default true)
  if (container.centered !== false) {
    classes.push("mx-auto")
  }

  // Padding
  if (container.padding) {
    const paddingValue = parseSpacingValue(container.padding)
    if (paddingValue) {
      classes.push(`px-${paddingValue}`)
    }
  }

  return classes.join(" ")
}

/**
 * Component를 React TSX 코드로 생성
 *
 * @example
 * generateComponentCode(component, "react", "tailwind")
 * →
 * ```tsx
 * export function GlobalHeader({ children }: { children?: React.ReactNode }) {
 *   return (
 *     <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
 *       <div className="container mx-auto px-4">
 *         {children || "Header"}
 *       </div>
 *     </header>
 *   )
 * }
 * ```
 */
export function generateComponentCode(
  component: Component,
  framework: "react" | "vue" = "react",
  cssSolution: "tailwind" | "css-modules" = "tailwind"
): string {
  if (framework !== "react" || cssSolution !== "tailwind") {
    throw new Error("Currently only React + Tailwind is supported")
  }

  const className = generateComponentClasses(component)
  const defaultChildren =
    (component.props?.children as string) || component.name

  const hasContainerWrapper = needsContainerWrapper(component.layout)

  let innerContent = "{children"
  if (defaultChildren !== component.name) {
    innerContent += ` || "${defaultChildren}"`
  }
  innerContent += "}"

  // Container wrapper가 필요한 경우
  if (hasContainerWrapper && component.layout.container) {
    const wrapperClasses = generateContainerWrapperClasses(
      component.layout.container
    )

    return `export function ${component.name}({ children }: { children?: React.ReactNode }) {
  return (
    <${component.semanticTag}${className ? ` className="${className}"` : ""}>
      <div className="${wrapperClasses}">
        ${innerContent}
      </div>
    </${component.semanticTag}>
  )
}`
  }

  // 일반 컴포넌트
  return `export function ${component.name}({ children }: { children?: React.ReactNode }) {
  return (
    <${component.semanticTag}${className ? ` className="${className}"` : ""}>
      ${innerContent}
    </${component.semanticTag}>
  )
}`
}
