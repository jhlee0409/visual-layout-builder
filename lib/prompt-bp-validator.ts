/**
 * Prompt & Generated Code Best Practice Validator
 *
 * AI가 생성한 코드가 프롬프트의 Best Practice를 준수하는지 검증합니다.
 *
 * 검증 항목:
 * 1. Code Style Best Practices (2025 patterns)
 * 2. CSS Mapping Accuracy (Schema ↔ Tailwind)
 * 3. Layout-Only Principle (no placeholder content)
 * 4. Semantic HTML & Accessibility
 */

import type { LaydlerSchema, Component } from "@/types/schema"
import { generateComponentClasses } from "./code-generator"

/**
 * Validation Result Types
 */
export interface ValidationIssue {
  severity: "error" | "warning" | "info"
  category: "code-style" | "css-mapping" | "layout-only" | "semantic-html"
  componentId?: string
  message: string
  suggestion?: string
  codeSnippet?: string
}

export interface BPValidationResult {
  valid: boolean
  score: number // 0-100 점수
  issues: ValidationIssue[]
  summary: {
    errors: number
    warnings: number
    infos: number
    totalChecks: number
    passedChecks: number
  }
}

/**
 * AI가 생성한 코드를 Best Practice에 따라 검증
 *
 * @param generatedCode - AI가 생성한 React 코드
 * @param schema - 원본 Laylder Schema
 * @returns 검증 결과
 *
 * @example
 * ```typescript
 * const result = validateGeneratedCode(aiCode, schema)
 * if (!result.valid) {
 *   console.log('Issues found:', result.issues)
 *   console.log('Score:', result.score)
 * }
 * ```
 */
export function validateGeneratedCode(
  generatedCode: string,
  schema: LaydlerSchema
): BPValidationResult {
  const issues: ValidationIssue[] = []
  let totalChecks = 0
  let passedChecks = 0

  // 1. Code Style Best Practices 검증
  const codeStyleChecks = validateCodeStyle(generatedCode)
  issues.push(...codeStyleChecks.issues)
  totalChecks += codeStyleChecks.totalChecks
  passedChecks += codeStyleChecks.passedChecks

  // 2. CSS Mapping Accuracy 검증
  const cssMappingChecks = validateCSSMapping(generatedCode, schema)
  issues.push(...cssMappingChecks.issues)
  totalChecks += cssMappingChecks.totalChecks
  passedChecks += cssMappingChecks.passedChecks

  // 3. Layout-Only Principle 검증
  const layoutOnlyChecks = validateLayoutOnlyPrinciple(generatedCode)
  issues.push(...layoutOnlyChecks.issues)
  totalChecks += layoutOnlyChecks.totalChecks
  passedChecks += layoutOnlyChecks.passedChecks

  // 4. Semantic HTML 검증
  const semanticHTMLChecks = validateSemanticHTML(generatedCode, schema)
  issues.push(...semanticHTMLChecks.issues)
  totalChecks += semanticHTMLChecks.totalChecks
  passedChecks += semanticHTMLChecks.passedChecks

  // 점수 계산 (0-100)
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0

  // 에러가 있으면 invalid
  const errors = issues.filter((i) => i.severity === "error")
  const warnings = issues.filter((i) => i.severity === "warning")
  const infos = issues.filter((i) => i.severity === "info")

  return {
    valid: errors.length === 0,
    score,
    issues,
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
      totalChecks,
      passedChecks,
    },
  }
}

/**
 * 1. Code Style Best Practices 검증 (2025 patterns)
 */
function validateCodeStyle(code: string): {
  issues: ValidationIssue[]
  totalChecks: number
  passedChecks: number
} {
  const issues: ValidationIssue[] = []
  let totalChecks = 0
  let passedChecks = 0

  // Check 1: React.FC 패턴 사용 금지 (deprecated)
  totalChecks++
  const reactFCPattern = /React\.FC|React\.FunctionComponent/g
  const reactFCMatches = code.match(reactFCPattern)
  if (reactFCMatches && reactFCMatches.length > 0) {
    issues.push({
      severity: "error",
      category: "code-style",
      message: `React.FC pattern detected (deprecated). Found ${reactFCMatches.length} occurrence(s).`,
      suggestion: "Use explicit function signatures: `function Component(props: Props) { ... }`",
      codeSnippet: reactFCMatches[0],
    })
  } else {
    passedChecks++
  }

  // Check 2: 명시적 함수 시그니처 사용
  totalChecks++
  const explicitFunctionPattern = /function\s+\w+\s*\(\s*\{[^}]*\}\s*:\s*\{/g
  const explicitMatches = code.match(explicitFunctionPattern)
  if (explicitMatches && explicitMatches.length > 0) {
    passedChecks++
  } else {
    // 함수가 있는지 확인
    const hasFunctions = /function\s+\w+|const\s+\w+\s*=\s*\(/g.test(code)
    if (hasFunctions) {
      issues.push({
        severity: "warning",
        category: "code-style",
        message: "Components should use explicit function signatures with type annotations.",
        suggestion: "Use: `function Component({ prop }: { prop: Type }) { ... }`",
      })
    } else {
      passedChecks++ // 함수가 없으면 pass
    }
  }

  // Check 3: Class components 사용 금지 (hooks only)
  totalChecks++
  const classComponentPattern = /class\s+\w+\s+extends\s+(React\.)?Component/g
  const classMatches = code.match(classComponentPattern)
  if (classMatches && classMatches.length > 0) {
    issues.push({
      severity: "error",
      category: "code-style",
      message: `Class components detected (${classMatches.length} occurrence(s)). Use function components only.`,
      suggestion: "Convert to function components with hooks.",
      codeSnippet: classMatches[0],
    })
  } else {
    passedChecks++
  }

  // Check 4: Modern React patterns (no deprecated lifecycle methods)
  totalChecks++
  const deprecatedLifecyclePattern = /componentWillMount|componentWillReceiveProps|componentWillUpdate/g
  const deprecatedMatches = code.match(deprecatedLifecyclePattern)
  if (deprecatedMatches && deprecatedMatches.length > 0) {
    issues.push({
      severity: "error",
      category: "code-style",
      message: `Deprecated lifecycle methods detected (${deprecatedMatches.length} occurrence(s)).`,
      suggestion: "Use useEffect hook instead.",
      codeSnippet: deprecatedMatches[0],
    })
  } else {
    passedChecks++
  }

  return { issues, totalChecks, passedChecks }
}

/**
 * 2. CSS Mapping Accuracy 검증
 */
function validateCSSMapping(code: string, schema: LaydlerSchema): {
  issues: ValidationIssue[]
  totalChecks: number
  passedChecks: number
} {
  const issues: ValidationIssue[] = []
  let totalChecks = 0
  let passedChecks = 0

  schema.components.forEach((component) => {
    // 컴포넌트의 예상 Tailwind classes 생성
    const expectedClasses = generateComponentClasses(component)
    const expectedClassArray = expectedClasses.split(/\s+/).filter(Boolean)

    // 컴포넌트 정의 찾기
    const componentPattern = new RegExp(
      `function\\s+${component.name}[\\s\\S]*?return[\\s\\S]*?<${component.semanticTag}[\\s\\S]*?className=["'\`]([^"'\`]+)["'\`]`,
      "m"
    )
    const match = code.match(componentPattern)

    if (match && match[1]) {
      const actualClasses = match[1].split(/\s+/).filter(Boolean)

      // 핵심 클래스들만 검증 (positioning, layout 관련)
      const coreClasses = expectedClassArray.filter((cls) => {
        return (
          // Positioning classes
          cls.match(/^(fixed|sticky|absolute|relative)$/) ||
          cls.match(/^(top|right|bottom|left|z)-/) ||
          // Layout classes
          cls.match(/^(flex|grid)/) ||
          cls.match(/^(container|mx-auto|max-w-)/) ||
          // Responsive classes
          cls.match(/^(hidden|block|md:|lg:)/)
        )
      })

      coreClasses.forEach((expectedClass) => {
        totalChecks++
        if (actualClasses.includes(expectedClass)) {
          passedChecks++
        } else {
          issues.push({
            severity: "warning",
            category: "css-mapping",
            componentId: component.id,
            message: `Component ${component.name} (${component.id}) is missing expected Tailwind class: "${expectedClass}"`,
            suggestion: `Add "${expectedClass}" to className`,
          })
        }
      })
    } else {
      // 컴포넌트를 찾을 수 없음
      totalChecks++
      issues.push({
        severity: "error",
        category: "css-mapping",
        componentId: component.id,
        message: `Component ${component.name} (${component.id}) not found in generated code or has no className`,
        suggestion: `Ensure component is defined with correct semantic tag <${component.semanticTag}> and className`,
      })
    }
  })

  return { issues, totalChecks, passedChecks }
}

/**
 * 3. Layout-Only Principle 검증
 */
function validateLayoutOnlyPrinciple(code: string): {
  issues: ValidationIssue[]
  totalChecks: number
  passedChecks: number
} {
  const issues: ValidationIssue[] = []
  let totalChecks = 0
  let passedChecks = 0

  // Check 1: Placeholder content 금지 (Lorem ipsum, dummy text 등)
  totalChecks++
  const placeholderPatterns = [
    /lorem\s+ipsum/gi,
    /placeholder\s+content/gi,
    /dummy\s+text/gi,
    /sample\s+text/gi,
  ]

  let foundPlaceholder = false
  placeholderPatterns.forEach((pattern) => {
    const matches = code.match(pattern)
    if (matches && matches.length > 0) {
      foundPlaceholder = true
      issues.push({
        severity: "error",
        category: "layout-only",
        message: `Placeholder content detected: "${matches[0]}"`,
        suggestion: "Remove placeholder content. Only display component name + ID.",
        codeSnippet: matches[0],
      })
    }
  })
  if (!foundPlaceholder) {
    passedChecks++
  }

  // Check 2: Mock navigation links 금지
  totalChecks++
  const mockLinkPatterns = [
    /<a\s+href=["']#["']/g,
    /<Link\s+to=["']\/\w+["']/g,
  ]

  let foundMockLinks = false
  mockLinkPatterns.forEach((pattern) => {
    const matches = code.match(pattern)
    if (matches && matches.length > 0) {
      foundMockLinks = true
      issues.push({
        severity: "warning",
        category: "layout-only",
        message: `Mock navigation links detected (${matches.length} occurrence(s))`,
        suggestion: "Remove mock links. This is a layout-only tool.",
        codeSnippet: matches[0],
      })
    }
  })
  if (!foundMockLinks) {
    passedChecks++
  }

  // Check 3: Mock buttons 금지
  totalChecks++
  const mockButtonPattern = /<button[^>]*>(?!.*\(c\d+\))[\s\S]*?<\/button>/gi
  const buttonMatches = code.match(mockButtonPattern)
  if (buttonMatches && buttonMatches.length > 0) {
    const realButtons = buttonMatches.filter((btn) => {
      // children을 사용하는 버튼은 허용
      return !btn.includes("{children}")
    })
    if (realButtons.length > 0) {
      issues.push({
        severity: "warning",
        category: "layout-only",
        message: `Mock buttons detected (${realButtons.length} occurrence(s))`,
        suggestion: "Remove mock buttons unless part of component structure.",
      })
    } else {
      passedChecks++
    }
  } else {
    passedChecks++
  }

  return { issues, totalChecks, passedChecks }
}

/**
 * 4. Semantic HTML 검증
 */
function validateSemanticHTML(code: string, schema: LaydlerSchema): {
  issues: ValidationIssue[]
  totalChecks: number
  passedChecks: number
} {
  const issues: ValidationIssue[] = []
  let totalChecks = 0
  let passedChecks = 0

  schema.components.forEach((component) => {
    // 컴포넌트에 올바른 semantic tag가 사용되었는지 확인
    totalChecks++
    const semanticTagPattern = new RegExp(
      `function\\s+${component.name}[\\s\\S]*?return[\\s\\S]*?<${component.semanticTag}`,
      "m"
    )
    const match = code.match(semanticTagPattern)

    if (match) {
      passedChecks++
    } else {
      // div 태그 사용 여부 확인
      const divPattern = new RegExp(
        `function\\s+${component.name}[\\s\\S]*?return[\\s\\S]*?<div`,
        "m"
      )
      const divMatch = code.match(divPattern)

      if (divMatch) {
        issues.push({
          severity: "error",
          category: "semantic-html",
          componentId: component.id,
          message: `Component ${component.name} (${component.id}) should use <${component.semanticTag}> but uses <div>`,
          suggestion: `Use semantic tag: <${component.semanticTag}>`,
        })
      } else {
        issues.push({
          severity: "error",
          category: "semantic-html",
          componentId: component.id,
          message: `Component ${component.name} (${component.id}) not found or does not use correct semantic tag <${component.semanticTag}>`,
          suggestion: `Ensure component uses <${component.semanticTag}>`,
        })
      }
    }
  })

  return { issues, totalChecks, passedChecks }
}

/**
 * 프롬프트 품질 검증 (프롬프트 자체가 Best Practice를 잘 전달하는지)
 *
 * @param prompt - 생성된 프롬프트
 * @returns 검증 결과
 */
export function validatePromptQuality(prompt: string): {
  hasBestPractices: boolean
  hasCodeStyleGuidelines: boolean
  hasCSSMappingExamples: boolean
  hasLayoutOnlyInstructions: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Best Practice 섹션 존재 확인
  const hasBestPractices = /Code Style.*2025.*Best Practices/i.test(prompt)
  if (!hasBestPractices) {
    issues.push("Prompt is missing 'Code Style (2025 Best Practices)' section")
  }

  // Code Style Guidelines 확인
  const hasCodeStyleGuidelines =
    /React\.FC.*deprecated/i.test(prompt) &&
    /explicit function signatures/i.test(prompt)
  if (!hasCodeStyleGuidelines) {
    issues.push("Prompt is missing code style guidelines (React.FC, function signatures)")
  }

  // CSS Mapping Examples 확인
  const hasCSSMappingExamples =
    /Positioning Guidelines/i.test(prompt) &&
    /Layout Guidelines/i.test(prompt)
  if (!hasCSSMappingExamples) {
    issues.push("Prompt is missing CSS mapping guidelines")
  }

  // Layout-Only Instructions 확인
  const hasLayoutOnlyInstructions =
    /Layout-Only Code Generation/i.test(prompt) &&
    /DO NOT.*placeholder content/i.test(prompt)
  if (!hasLayoutOnlyInstructions) {
    issues.push("Prompt is missing layout-only instructions")
  }

  return {
    hasBestPractices,
    hasCodeStyleGuidelines,
    hasCSSMappingExamples,
    hasLayoutOnlyInstructions,
    issues,
  }
}

/**
 * 검증 결과를 사람이 읽기 쉬운 형식으로 포맷팅
 */
export function formatValidationResult(result: BPValidationResult): string {
  const lines: string[] = []

  lines.push("=".repeat(80))
  lines.push(`Best Practice Validation Result`)
  lines.push("=".repeat(80))
  lines.push("")
  lines.push(`Overall Score: ${result.score}/100`)
  lines.push(`Status: ${result.valid ? "✅ PASSED" : "❌ FAILED"}`)
  lines.push("")
  lines.push(`Summary:`)
  lines.push(`  - Total Checks: ${result.summary.totalChecks}`)
  lines.push(`  - Passed: ${result.summary.passedChecks}`)
  lines.push(`  - Errors: ${result.summary.errors}`)
  lines.push(`  - Warnings: ${result.summary.warnings}`)
  lines.push(`  - Infos: ${result.summary.infos}`)
  lines.push("")

  if (result.issues.length > 0) {
    lines.push("Issues Found:")
    lines.push("-".repeat(80))

    // 카테고리별로 그룹화
    const byCategory = result.issues.reduce(
      (acc, issue) => {
        if (!acc[issue.category]) {
          acc[issue.category] = []
        }
        acc[issue.category].push(issue)
        return acc
      },
      {} as Record<string, ValidationIssue[]>
    )

    Object.entries(byCategory).forEach(([category, issues]) => {
      lines.push("")
      lines.push(`📁 ${category.toUpperCase()}:`)
      lines.push("")

      issues.forEach((issue, index) => {
        const icon =
          issue.severity === "error"
            ? "❌"
            : issue.severity === "warning"
              ? "⚠️"
              : "ℹ️"

        lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`)
        if (issue.componentId) {
          lines.push(`     Component: ${issue.componentId}`)
        }
        if (issue.suggestion) {
          lines.push(`     💡 Suggestion: ${issue.suggestion}`)
        }
        if (issue.codeSnippet) {
          lines.push(`     📝 Code: ${issue.codeSnippet}`)
        }
        lines.push("")
      })
    })
  } else {
    lines.push("✅ No issues found! Code follows all Best Practices.")
  }

  lines.push("=".repeat(80))

  return lines.join("\n")
}
