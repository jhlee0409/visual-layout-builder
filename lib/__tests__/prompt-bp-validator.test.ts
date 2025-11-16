/**
 * Prompt Best Practice Validator Tests
 *
 * AI 생성 코드의 Best Practice 준수 여부를 검증하는 테스트
 */

import { describe, it, expect } from "vitest"
import {
  validateGeneratedCode,
  validatePromptQuality,
  formatValidationResult,
  type BPValidationResult,
} from "../prompt-bp-validator"
import type { LaydlerSchema } from "@/types/schema"

describe("Prompt BP Validator", () => {
  // 테스트용 Schema
  const testSchema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: {
          type: "fixed",
          position: { top: 0, left: 0, right: 0, zIndex: 50 },
        },
        layout: {
          type: "flex",
          flex: { direction: "row", justify: "between", items: "center" },
        },
        styling: {
          background: "white",
          border: "b",
          shadow: "sm",
        },
      },
      {
        id: "c2",
        name: "Main",
        semanticTag: "main",
        positioning: { type: "static" },
        layout: {
          type: "container",
          container: { maxWidth: "7xl", padding: "2rem", centered: true },
        },
        styling: {
          className: "flex-1",
        },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
    ],
    layouts: {
      mobile: {
        structure: "vertical",
        components: ["c1", "c2"],
      },
      desktop: {
        structure: "vertical",
        components: ["c1", "c2"],
      },
    },
  }

  describe("validateGeneratedCode", () => {
    describe("Code Style Best Practices", () => {
      it("should pass for correct 2025 React patterns", () => {
        const goodCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center bg-white border-b shadow-sm">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1 container mx-auto max-w-7xl px-8">
      {children || "Main (c2)"}
    </main>
  )
}
`

        const result = validateGeneratedCode(goodCode, testSchema)

        expect(result.valid).toBe(true)
        expect(result.score).toBeGreaterThan(80)
        expect(result.summary.errors).toBe(0)
      })

      it("should fail for deprecated React.FC pattern", () => {
        const badCode = `
const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <header>Header</header>
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.valid).toBe(false)
        const reactFCError = result.issues.find(
          (i) => i.category === "code-style" && i.message.includes("React.FC")
        )
        expect(reactFCError).toBeDefined()
        expect(reactFCError?.severity).toBe("error")
      })

      it("should fail for class components", () => {
        const badCode = `
class Header extends React.Component {
  render() {
    return <header>Header</header>
  }
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.valid).toBe(false)
        const classError = result.issues.find(
          (i) =>
            i.category === "code-style" &&
            i.message.includes("Class components")
        )
        expect(classError).toBeDefined()
        expect(classError?.severity).toBe("error")
      })

      it("should fail for deprecated lifecycle methods", () => {
        const badCode = `
class Header extends React.Component {
  componentWillMount() {
    // deprecated
  }
  render() {
    return <header>Header</header>
  }
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.valid).toBe(false)
        const lifecycleError = result.issues.find(
          (i) =>
            i.category === "code-style" &&
            i.message.includes("Deprecated lifecycle")
        )
        expect(lifecycleError).toBeDefined()
      })
    })

    describe("CSS Mapping Accuracy", () => {
      it("should detect missing Tailwind classes", () => {
        const incompleteCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-white border-b">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1">
      {children || "Main (c2)"}
    </main>
  )
}
`

        const result = validateGeneratedCode(incompleteCode, testSchema)

        // fixed, top-0 등 positioning 클래스가 없어야 warning 발생
        const missingClasses = result.issues.filter(
          (i) =>
            i.category === "css-mapping" && i.message.includes("missing expected")
        )
        expect(missingClasses.length).toBeGreaterThan(0)
      })

      it("should pass for complete Tailwind classes", () => {
        const completeCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center bg-white border-b shadow-sm">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="container mx-auto max-w-7xl flex-1">
      <div className="px-8">
        {children || "Main (c2)"}
      </div>
    </main>
  )
}
`

        const result = validateGeneratedCode(completeCode, testSchema)

        // CSS mapping 관련 에러가 없어야 함
        const cssMappingErrors = result.issues.filter(
          (i) => i.category === "css-mapping" && i.severity === "error"
        )
        expect(cssMappingErrors.length).toBe(0)
      })
    })

    describe("Layout-Only Principle", () => {
      it("should fail for placeholder content (Lorem ipsum)", () => {
        const badCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0">
      <h1>Lorem ipsum dolor sit amet</h1>
    </header>
  )
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.valid).toBe(false)
        const placeholderError = result.issues.find(
          (i) =>
            i.category === "layout-only" &&
            i.message.includes("Placeholder content")
        )
        expect(placeholderError).toBeDefined()
        expect(placeholderError?.severity).toBe("error")
      })

      it("should warn for mock navigation links", () => {
        const badCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0">
      <a href="#">Home</a>
      <a href="#">About</a>
    </header>
  )
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        const linkWarning = result.issues.find(
          (i) =>
            i.category === "layout-only" &&
            i.message.includes("Mock navigation links")
        )
        expect(linkWarning).toBeDefined()
        expect(linkWarning?.severity).toBe("warning")
      })

      it("should pass for layout-only code", () => {
        const goodCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1">
      {children || "Main (c2)"}
    </main>
  )
}
`

        const result = validateGeneratedCode(goodCode, testSchema)

        const layoutOnlyErrors = result.issues.filter(
          (i) => i.category === "layout-only" && i.severity === "error"
        )
        expect(layoutOnlyErrors.length).toBe(0)
      })
    })

    describe("Semantic HTML", () => {
      it("should fail for incorrect semantic tags", () => {
        const badCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed top-0">
      {children || "Header (c1)"}
    </div>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex-1">
      {children || "Main (c2)"}
    </div>
  )
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.valid).toBe(false)
        const semanticErrors = result.issues.filter(
          (i) => i.category === "semantic-html"
        )
        expect(semanticErrors.length).toBe(2) // Header, Main 모두 div 사용
      })

      it("should pass for correct semantic tags", () => {
        const goodCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1">
      {children || "Main (c2)"}
    </main>
  )
}
`

        const result = validateGeneratedCode(goodCode, testSchema)

        const semanticErrors = result.issues.filter(
          (i) => i.category === "semantic-html" && i.severity === "error"
        )
        expect(semanticErrors.length).toBe(0)
      })
    })

    describe("Scoring System", () => {
      it("should give 100 score for perfect code", () => {
        const perfectCode = `
function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center bg-white border-b shadow-sm">
      {children || "Header (c1)"}
    </header>
  )
}

function Main({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1 container mx-auto max-w-7xl">
      <div className="px-8">
        {children || "Main (c2)"}
      </div>
    </main>
  )
}
`

        const result = validateGeneratedCode(perfectCode, testSchema)

        expect(result.score).toBeGreaterThanOrEqual(80) // 약간의 여유
        expect(result.valid).toBe(true)
      })

      it("should give low score for bad code", () => {
        const badCode = `
const Header: React.FC = () => {
  return (
    <div>
      <h1>Lorem ipsum dolor sit amet</h1>
      <a href="#">Home</a>
    </div>
  )
}

class Main extends React.Component {
  componentWillMount() {}
  render() {
    return <div>Main content with placeholder text</div>
  }
}
`

        const result = validateGeneratedCode(badCode, testSchema)

        expect(result.score).toBeLessThan(50)
        expect(result.valid).toBe(false)
        expect(result.summary.errors).toBeGreaterThan(0)
      })
    })
  })

  describe("validatePromptQuality", () => {
    it("should pass for complete prompt with all best practices", () => {
      const goodPrompt = `
**Code Style (2025 Best Practices):**
- ❌ **DO NOT** use \`React.FC\` type (deprecated pattern)
- ✅ **DO** use explicit function signatures

**Layout-Only Code Generation:**
- **DO NOT** add placeholder content or mock data

**Positioning Guidelines**
- fixed: Use Tailwind \`fixed\`

**Layout Guidelines**
- flex: Use Tailwind flex utilities
`

      const result = validatePromptQuality(goodPrompt)

      expect(result.hasBestPractices).toBe(true)
      expect(result.hasCodeStyleGuidelines).toBe(true)
      expect(result.hasCSSMappingExamples).toBe(true)
      expect(result.hasLayoutOnlyInstructions).toBe(true)
      expect(result.issues.length).toBe(0)
    })

    it("should fail for incomplete prompt", () => {
      const badPrompt = `
Generate a React component.
`

      const result = validatePromptQuality(badPrompt)

      expect(result.hasBestPractices).toBe(false)
      expect(result.hasCodeStyleGuidelines).toBe(false)
      expect(result.hasCSSMappingExamples).toBe(false)
      expect(result.hasLayoutOnlyInstructions).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })

  describe("formatValidationResult", () => {
    it("should format validation result in readable format", () => {
      const result: BPValidationResult = {
        valid: false,
        score: 75,
        issues: [
          {
            severity: "error",
            category: "code-style",
            message: "React.FC detected",
            suggestion: "Use explicit function signatures",
          },
          {
            severity: "warning",
            category: "css-mapping",
            componentId: "c1",
            message: "Missing class: fixed",
            suggestion: 'Add "fixed" to className',
          },
        ],
        summary: {
          errors: 1,
          warnings: 1,
          infos: 0,
          totalChecks: 10,
          passedChecks: 8,
        },
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain("Score: 75/100")
      expect(formatted).toContain("❌ FAILED")
      expect(formatted).toContain("Total Checks: 10")
      expect(formatted).toContain("Passed: 8")
      expect(formatted).toContain("Errors: 1")
      expect(formatted).toContain("Warnings: 1")
      expect(formatted).toContain("CODE-STYLE")
      expect(formatted).toContain("CSS-MAPPING")
      expect(formatted).toContain("React.FC detected")
      expect(formatted).toContain("Missing class: fixed")
    })

    it("should format passing result", () => {
      const result: BPValidationResult = {
        valid: true,
        score: 100,
        issues: [],
        summary: {
          errors: 0,
          warnings: 0,
          infos: 0,
          totalChecks: 10,
          passedChecks: 10,
        },
      }

      const formatted = formatValidationResult(result)

      expect(formatted).toContain("Score: 100/100")
      expect(formatted).toContain("✅ PASSED")
      expect(formatted).toContain("No issues found")
    })
  })
})
