/**
 * Props Validator - ARIA Attributes Type Safety
 *
 * Validates that ARIA attributes match semantic tags according to WAI-ARIA specifications
 */

import type { SemanticTag } from "@/types/schema"

/**
 * ARIA Role Type
 *
 * Based on WAI-ARIA 1.2 specification
 * https://www.w3.org/TR/wai-aria-1.2/#role_definitions
 */
export type ARIARole =
  | "banner"        // header (site-wide)
  | "navigation"    // nav
  | "main"          // main
  | "contentinfo"   // footer (site-wide)
  | "complementary" // aside
  | "region"        // section (with aria-label)
  | "article"       // article
  | "form"          // form
  | "group"         // generic group
  | "img"           // figure, img
  | "search"        // search form
  | "none"          // no role

/**
 * Valid ARIA roles for each semantic tag
 *
 * Based on WCAG 2.2 and WAI-ARIA best practices
 */
const VALID_ROLES_BY_TAG: Record<SemanticTag, ARIARole[]> = {
  header: ["banner", "none"],  // banner for site-wide header, none for nested headers
  nav: ["navigation", "none"],  // navigation role, or none if nested
  main: ["main", "none"],  // main role, or none if multiple main elements
  aside: ["complementary", "region", "none"],  // complementary is default, region if labeled
  footer: ["contentinfo", "none"],  // contentinfo for site-wide footer, none for nested footers
  section: ["region", "none"],  // region if labeled, otherwise use semantic tag
  article: ["article", "none"],
  div: [
    // div can have many roles as it's generic
    "region",
    "group",
    "none",
    "img",
    "search",
    "banner",
    "navigation",
    "main",
    "contentinfo",
    "complementary",
    "article",
    "form",
  ],
  form: ["form", "search", "none"],
}

/**
 * Props Validation Result
 */
export interface PropsValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate ARIA props against semantic tag
 *
 * @param semanticTag - The HTML semantic tag
 * @param props - Component props (potentially containing ARIA attributes)
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateARIAProps("header", { role: "banner", "aria-label": "Main navigation" })
 * if (!result.valid) {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validateARIAProps(
  semanticTag: SemanticTag,
  props: Record<string, unknown> | undefined
): PropsValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // If no props, it's valid (props are optional)
  if (!props) {
    return { valid: true, errors: [], warnings: [] }
  }

  // Validate ARIA role
  const role = props.role
  if (role !== undefined) {
    if (typeof role !== "string") {
      errors.push(`ARIA role must be a string, got ${typeof role}`)
    } else {
      const validRoles = VALID_ROLES_BY_TAG[semanticTag]
      if (!validRoles.includes(role as ARIARole)) {
        errors.push(
          `Invalid ARIA role "${role}" for <${semanticTag}>. Valid roles: ${validRoles.join(", ")}`
        )
      }
    }
  }

  // Validate aria-label (if present)
  const ariaLabel = props["aria-label"]
  if (ariaLabel !== undefined) {
    if (typeof ariaLabel !== "string") {
      errors.push(`aria-label must be a string, got ${typeof ariaLabel}`)
    } else if (ariaLabel.trim().length === 0) {
      warnings.push(`aria-label should not be empty`)
    }
  }

  // Check for required aria-label in certain cases
  if (role === "region" && !props["aria-label"]) {
    warnings.push(
      `<${semanticTag}> with role="region" should have an aria-label for accessibility`
    )
  }

  // Check for redundant roles (semantic tag already implies the role)
  const redundantRoles: Partial<Record<SemanticTag, ARIARole>> = {
    header: "banner",
    nav: "navigation",
    main: "main",
    aside: "complementary",
    footer: "contentinfo",
    article: "article",
    form: "form",
  }

  const implicitRole = redundantRoles[semanticTag]
  if (implicitRole && role === implicitRole) {
    warnings.push(
      `Redundant role="${role}" on <${semanticTag}> (already implied by semantic tag). Consider removing it.`
    )
  }

  // Check for unknown ARIA attributes (common typos)
  const knownARIAAttrs = [
    "role",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-hidden",
    "aria-live",
    "aria-atomic",
    "aria-relevant",
    "aria-busy",
    "aria-controls",
    "aria-current",
    "aria-expanded",
    "aria-haspopup",
    "aria-pressed",
    "aria-selected",
    "aria-checked",
    "aria-disabled",
    "aria-readonly",
    "aria-required",
    "aria-invalid",
    "aria-errormessage",
  ]

  Object.keys(props).forEach((key) => {
    if (key.startsWith("aria-") && !knownARIAAttrs.includes(key)) {
      warnings.push(
        `Unknown ARIA attribute "${key}". Check for typos or consult WAI-ARIA spec.`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get recommended ARIA role for a semantic tag
 *
 * Returns the most common/recommended role for the given semantic tag
 *
 * @param semanticTag - The HTML semantic tag
 * @returns Recommended ARIA role (first in the valid roles list)
 *
 * @example
 * ```typescript
 * const role = getRecommendedRole("header") // "banner"
 * const role = getRecommendedRole("aside")  // "complementary"
 * ```
 */
export function getRecommendedRole(semanticTag: SemanticTag): ARIARole {
  return VALID_ROLES_BY_TAG[semanticTag][0]
}

/**
 * Get all valid ARIA roles for a semantic tag
 *
 * @param semanticTag - The HTML semantic tag
 * @returns Array of valid ARIA roles
 *
 * @example
 * ```typescript
 * const roles = getValidRoles("div") // ["region", "group", "none", ...]
 * ```
 */
export function getValidRoles(semanticTag: SemanticTag): ARIARole[] {
  return VALID_ROLES_BY_TAG[semanticTag]
}

/**
 * Check if a role is valid for a semantic tag
 *
 * @param semanticTag - The HTML semantic tag
 * @param role - The ARIA role to check
 * @returns True if the role is valid for the tag
 *
 * @example
 * ```typescript
 * isValidRole("header", "banner")     // true
 * isValidRole("header", "navigation") // false
 * ```
 */
export function isValidRole(semanticTag: SemanticTag, role: string): boolean {
  return VALID_ROLES_BY_TAG[semanticTag].includes(role as ARIARole)
}
