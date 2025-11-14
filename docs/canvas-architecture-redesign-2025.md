# 🏗️ Canvas 직렬화 및 프롬프트 생성 아키텍처 재설계 (2025)

**작성일**: 2025-11-14
**목적**: Canvas 객체의 직렬화, 관리, AI 프롬프트 변환 파이프라인을 2025년 최신 패턴 기반으로 근본적으로 재설계

---

## 🔍 현재 아키텍처의 근본 문제

### 1. **정보 손실: 2D → 1D 변환**

**Canvas (2D Grid 배치):**
```
Row 0:    [Header (c1) - 전체 너비]
Row 1-6:  [Section (c7)] [ImageBanner (c4)        ]
Row 3-6:  [              ] [Cont(c2)] [Cont(c5)   ]
Row 7:    [Footer (c6)                 ] [CTA(c3)]
```

**Schema Layout (1D 배열):**
```json
{
  "components": ["c1", "c2", "c3", "c4", "c5", "c6", "c7"]
}
```

**문제**: Canvas의 **공간적 관계 정보** (좌우 배치, 겹침, 그리드 위치) 완전히 손실

---

### 2. **Prompt에 Canvas 좌표 미포함**

**현재 Prompt (lib/prompt-templates.ts:98-151):**
```markdown
### Desktop Layout
**Component Order:**
1. c1
2. c2
3. c3
4. c4
5. c5
6. c6
7. c7
```

**누락된 정보:**
- c7 (Section)이 **좌측 사이드바** (x=0, width=2)
- c4 (ImageBanner)가 **우측 메인 영역** (x=2, width=10)
- c2, c5가 **가로로 나란히** 배치 (c2: x=2-6, c5: x=7-11)
- c6 (Footer)와 c3 (CTA)가 **같은 행**에 배치 (y=7)

**결과**: AI가 단순 세로 나열로만 구현 → **c6-c7 순서 오류** 발생

---

### 3. **Structure Type의 모호함**

**Schema:**
```json
{
  "structure": "vertical"
}
```

**실제 Canvas 배치**: 복잡한 2D Grid 레이아웃 (사이드바 + 메인 + 푸터)

**문제**: "vertical"이라는 추상적 표현이 실제 Grid 배치를 표현하지 못함

---

## 📚 2025년 Industry Best Practices 리서치

### 1. **Figma → Webflow/Framer 패턴**

**핵심 발견**:
- Figma Auto Layout → Flexbox/Grid **명시적 변환**
- 2D 배치 정보를 **grid-template-areas**로 직렬화
- Visual intent (Canvas) ≠ DOM order (코드)를 **분리**

**예시** (Figma to Webflow):
```html
<!-- Figma Auto Layout 정보가 CSS Grid로 변환됨 -->
<div class="grid grid-cols-12 gap-4">
  <aside class="col-span-2">Section</aside>
  <main class="col-span-10">ImageBanner</main>
</div>
```

---

### 2. **CSS Grid + Flexbox Hybrid (2025 Standard)**

**베스트 프랙티스** (출처: CSS Grid vs Flexbox 2025 guides):

- **Macro Layout**: CSS Grid (페이지 전체 구조)
- **Micro Layout**: Flexbox (컴포넌트 내부 정렬)

**구현 패턴**:
```css
/* Macro: Page-level Grid */
.layout-container {
  display: grid;
  grid-template-columns: 2fr 10fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

/* Micro: Component-level Flexbox */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**Laylder 적용**: Canvas Grid → CSS Grid template areas 변환 필요

---

### 3. **AI Code Generation Prompt Engineering (2025)**

**핵심 패턴** (IBM, Lakera Prompt Engineering Guides):

**구조화된 Specification**:
```markdown
1. Context (현재 상황)
2. Task (수행할 작업)
3. Specifications (상세 스펙)
4. Constraints (제약 조건)
5. Examples (참조 예시)
```

**Layout Specification 예시**:
```markdown
## Visual Layout (Canvas Grid)

Desktop layout uses a 12-column × 8-row grid:

Row 0: Header (full width, 12 cols)
Row 1-6:
  - Section (left sidebar, cols 0-1)
  - ImageBanner (main area, cols 2-11)
Row 3-6:
  - Container c2 (cols 2-6)
  - Container c5 (cols 7-11)
Row 7:
  - Footer (cols 0-10)
  - CTA (col 11)

**Implementation**: Use CSS Grid for macro layout.
```

---

## 🎯 개선된 아키텍처 설계

### Phase 1: Canvas Grid → CSS Grid 변환기

**새 유틸리티**: `lib/canvas-to-grid.ts`

```typescript
/**
 * Canvas Grid 좌표를 CSS Grid 정보로 변환
 *
 * Figma Auto Layout → Webflow 패턴 적용
 */

export interface GridPosition {
  componentId: string
  gridArea: string  // "1 / 1 / 2 / 13" (row-start / col-start / row-end / col-end)
  gridColumn: string  // "1 / 13"
  gridRow: string  // "1 / 2"
}

export interface VisualLayout {
  gridCols: number
  gridRows: number
  positions: GridPosition[]
  templateAreas?: string  // "header header" / "sidebar main"
}

/**
 * Canvas Layout을 CSS Grid 정보로 변환
 */
export function canvasToGridPositions(
  components: Component[],
  breakpoint: string
): VisualLayout {
  const positions: GridPosition[] = []

  components.forEach((comp) => {
    const layout =
      comp.responsiveCanvasLayout?.[breakpoint] ||
      comp.canvasLayout

    if (!layout) return

    // CSS Grid 좌표 (1-based index)
    const rowStart = layout.y + 1
    const rowEnd = layout.y + layout.height + 1
    const colStart = layout.x + 1
    const colEnd = layout.x + layout.width + 1

    positions.push({
      componentId: comp.id,
      gridArea: `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`,
      gridColumn: `${colStart} / ${colEnd}`,
      gridRow: `${rowStart} / ${rowEnd}`,
    })
  })

  // Grid template areas 생성 (선택적)
  const templateAreas = generateTemplateAreas(components, breakpoint)

  return {
    gridCols: 12,  // Canvas gridCols
    gridRows: 8,   // Canvas gridRows
    positions,
    templateAreas,
  }
}

/**
 * Grid Template Areas 생성 (Figma Auto Layout 스타일)
 *
 * 예: "header header header"
 *     "sidebar main main"
 *     "footer footer footer"
 */
function generateTemplateAreas(
  components: Component[],
  breakpoint: string
): string | undefined {
  // 복잡한 Grid는 template-areas 사용 불가 (겹침, 불규칙한 배치)
  // 단순한 구조만 지원

  // TODO: 구현 (간단한 sidebar-main 패턴만 지원)
  return undefined
}
```

---

### Phase 2: Visual Layout Description 생성

**새 유틸리티**: `lib/visual-layout-descriptor.ts`

```typescript
/**
 * Canvas 배치를 자연어로 설명 (AI가 이해하기 쉬운 형태)
 *
 * Prompt Engineering 2025 패턴 적용
 */

export interface LayoutDescription {
  summary: string
  rowByRow: string[]
  spatialRelationships: string[]
  implementationHints: string[]
}

/**
 * Canvas Grid 배치를 prose로 설명
 */
export function describeVisualLayout(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): LayoutDescription {
  const positions = canvasToGridPositions(components, breakpoint)

  // 1. Summary
  const summary = `Desktop layout uses a ${gridCols}-column × ${gridRows}-row grid system.`

  // 2. Row-by-row description
  const rowByRow: string[] = []
  const componentsGroupedByRow = groupComponentsByRow(components, breakpoint)

  componentsGroupedByRow.forEach((row, rowIndex) => {
    const rowDesc = row.map(c => {
      const layout = c.responsiveCanvasLayout?.[breakpoint] || c.canvasLayout!
      return `${c.name} (${c.id}, cols ${layout.x}-${layout.x + layout.width - 1})`
    }).join(", ")

    rowByRow.push(`Row ${rowIndex}: ${rowDesc}`)
  })

  // 3. Spatial relationships
  const spatialRelationships: string[] = []

  // 좌우 배치 감지
  const sideBySideComponents = detectSideBySide(components, breakpoint)
  sideBySideComponents.forEach(([left, right]) => {
    spatialRelationships.push(
      `${left.name} (${left.id}) is positioned to the LEFT of ${right.name} (${right.id})`
    )
  })

  // 사이드바 패턴 감지
  const sidebar = detectSidebar(components, breakpoint, gridCols, gridRows)
  if (sidebar) {
    spatialRelationships.push(
      `${sidebar.name} (${sidebar.id}) acts as a SIDEBAR (narrow column on the left)`
    )
  }

  // 4. Implementation hints
  const implementationHints: string[] = [
    `Use CSS Grid for the main layout container with ${gridCols} columns`,
    `Apply grid-column and grid-row to position each component`,
    `Components in the same row should be placed side-by-side, not stacked`,
  ]

  if (sidebar) {
    implementationHints.push(
      `Implement ${sidebar.name} as a sticky sidebar on the left`
    )
  }

  return {
    summary,
    rowByRow,
    spatialRelationships,
    implementationHints,
  }
}

/**
 * Row별로 컴포넌트 그룹화
 */
function groupComponentsByRow(
  components: Component[],
  breakpoint: string
): Component[][] {
  const rowMap = new Map<number, Component[]>()

  components.forEach((comp) => {
    const layout = comp.responsiveCanvasLayout?.[breakpoint] || comp.canvasLayout
    if (!layout) return

    // 시작 row만 사용 (겹침 무시)
    const row = layout.y
    if (!rowMap.has(row)) {
      rowMap.set(row, [])
    }
    rowMap.get(row)!.push(comp)
  })

  // Row 순서대로 정렬
  return Array.from(rowMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, comps]) => comps.sort((a, b) => {
      const aX = (a.responsiveCanvasLayout?.[breakpoint] || a.canvasLayout)!.x
      const bX = (b.responsiveCanvasLayout?.[breakpoint] || b.canvasLayout)!.x
      return aX - bX
    }))
}

/**
 * 좌우 배치된 컴포넌트 쌍 감지
 */
function detectSideBySide(
  components: Component[],
  breakpoint: string
): [Component, Component][] {
  const pairs: [Component, Component][] = []

  // 같은 row에서 x 좌표가 다른 컴포넌트 찾기
  const grouped = groupComponentsByRow(components, breakpoint)
  grouped.forEach((row) => {
    for (let i = 0; i < row.length - 1; i++) {
      pairs.push([row[i], row[i + 1]])
    }
  })

  return pairs
}

/**
 * Sidebar 패턴 감지
 */
function detectSidebar(
  components: Component[],
  breakpoint: string,
  gridCols: number,
  gridRows: number
): Component | null {
  // 좌측 끝에 배치되고, 높이가 긴 (4+ rows) 컴포넌트
  const sidebar = components.find((comp) => {
    const layout = comp.responsiveCanvasLayout?.[breakpoint] || comp.canvasLayout
    if (!layout) return false

    return (
      layout.x === 0 &&
      layout.width <= gridCols / 4 &&  // 전체의 1/4 이하
      layout.height >= 4  // 4 rows 이상
    )
  })

  return sidebar || null
}
```

---

### Phase 3: Prompt Template 개선

**수정**: `lib/prompt-templates.ts`

```typescript
layoutSection: (breakpoints: Breakpoint[], layouts: LaydlerSchema["layouts"]) => {
  let section = `## Responsive Page Structure\n\n`
  section += `Implement the following page structures for each breakpoint:\n\n`

  breakpoints.forEach((breakpoint, index) => {
    const layoutKey = breakpoint.name as "mobile" | "tablet" | "desktop"
    const layout = layouts[layoutKey]
    if (!layout) return

    section += `### ${index + 1}. ${breakpoint.name.charAt(0).toUpperCase() + breakpoint.name.slice(1)} (≥${breakpoint.minWidth}px)\n\n`

    // **NEW: Visual Layout Description**
    const visualLayout = describeVisualLayout(
      components,  // Pass components
      layoutKey,
      breakpoint.gridCols,
      breakpoint.gridRows
    )

    section += `**Visual Layout (Canvas Grid):**\n\n`
    section += `${visualLayout.summary}\n\n`

    visualLayout.rowByRow.forEach((row) => {
      section += `- ${row}\n`
    })
    section += "\n"

    if (visualLayout.spatialRelationships.length > 0) {
      section += `**Spatial Relationships:**\n`
      visualLayout.spatialRelationships.forEach((rel) => {
        section += `- ${rel}\n`
      })
      section += "\n"
    }

    // **NEW: CSS Grid Positions**
    const gridPositions = canvasToGridPositions(components, layoutKey)
    section += `**CSS Grid Positioning:**\n\n`
    section += `\`\`\`css\n`
    section += `.layout-container {\n`
    section += `  display: grid;\n`
    section += `  grid-template-columns: repeat(${gridPositions.gridCols}, 1fr);\n`
    section += `  grid-template-rows: repeat(${gridPositions.gridRows}, auto);\n`
    section += `  gap: 1rem;\n`
    section += `}\n\n`

    gridPositions.positions.forEach((pos) => {
      const comp = components.find(c => c.id === pos.componentId)!
      section += `.${comp.name.toLowerCase()} {\n`
      section += `  grid-area: ${pos.gridArea};\n`
      section += `}\n`
    })
    section += `\`\`\`\n\n`

    // Structure type (기존)
    section += `**Layout Structure:** \`${layout.structure}\`\n\n`

    // Component order (기존)
    section += `**Component Order (DOM):**\n`
    layout.components.forEach((componentId: string, idx: number) => {
      section += `${idx + 1}. ${componentId}\n`
    })
    section += "\n"

    // **NEW: Implementation Guidance**
    section += `**Implementation Strategy:**\n`
    section += `- Use CSS Grid for macro (page-level) layout\n`
    section += `- Each component uses Flexbox for micro (internal) layout\n`
    visualLayout.implementationHints.forEach((hint) => {
      section += `- ${hint}\n`
    })
    section += "\n"
  })

  return section
}
```

---

### Phase 4: Schema Validation 강화

**새 검증**: `lib/schema-validation.ts`

```typescript
/**
 * Canvas Layout vs Layout Order 일관성 검증
 */
export function validateCanvasLayoutConsistency(
  schema: LaydlerSchema
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  schema.breakpoints.forEach((bp) => {
    const layout = schema.layouts[bp.name]
    if (!layout) return

    // Canvas y 좌표 기준 정렬
    const componentsSortedByCanvas = schema.components
      .filter(c => layout.components.includes(c.id))
      .filter(c => c.responsiveCanvasLayout?.[bp.name] || c.canvasLayout)
      .sort((a, b) => {
        const aY = (a.responsiveCanvasLayout?.[bp.name] || a.canvasLayout)!.y
        const bY = (b.responsiveCanvasLayout?.[bp.name] || b.canvasLayout)!.y
        return aY - bY
      })

    const canvasOrder = componentsSortedByCanvas.map(c => c.id)
    const layoutOrder = layout.components

    // 순서 불일치 검사
    const orderMismatch = !arraysEqual(canvasOrder, layoutOrder)

    if (orderMismatch) {
      warnings.push({
        code: 'CANVAS_LAYOUT_ORDER_MISMATCH',
        message: `Canvas y-axis order (${canvasOrder.join(', ')}) differs from layout order (${layoutOrder.join(', ')}) for breakpoint "${bp.name}". This may cause unexpected rendering.`,
        field: `layouts.${bp.name}.components`,
      })
    }

    // 복잡한 Grid 배치 감지 (같은 row에 여러 컴포넌트)
    const complexGrid = detectComplexGrid(schema.components, bp.name)
    if (complexGrid) {
      warnings.push({
        code: 'COMPLEX_GRID_LAYOUT_DETECTED',
        message: `Canvas has complex 2D grid layout for "${bp.name}". Consider using CSS Grid implementation instead of simple vertical stacking.`,
        field: `layouts.${bp.name}.structure`,
      })
    }
  })

  return warnings
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i])
}

function detectComplexGrid(
  components: Component[],
  breakpoint: string
): boolean {
  const grouped = groupComponentsByRow(components, breakpoint)
  return grouped.some(row => row.length > 1)  // 2개 이상의 컴포넌트가 같은 row
}
```

---

## 🚀 구현 우선순위

### Priority 1 (즉시 구현 필요)

1. **Visual Layout Descriptor** (`lib/visual-layout-descriptor.ts`)
   - Canvas 배치를 prose로 설명
   - Spatial relationships 명시
   - 예상 시간: 2-3시간

2. **Prompt Template 개선** (`lib/prompt-templates.ts`)
   - Visual Layout Description 섹션 추가
   - Implementation Strategy 강화
   - 예상 시간: 1-2시간

3. **Validation 강화** (`lib/schema-validation.ts`)
   - Canvas-Layout 일관성 체크
   - Complex Grid 감지
   - 예상 시간: 1시간

### Priority 2 (중기 개선)

4. **Canvas to Grid Converter** (`lib/canvas-to-grid.ts`)
   - CSS Grid positioning 정보 생성
   - Grid template areas 생성 (간단한 패턴만)
   - 예상 시간: 3-4시간

5. **Layout Analyzer** (`lib/layout-analyzer.ts`)
   - Sidebar, Header, Footer 패턴 자동 감지
   - 최적의 Structure type 추천
   - 예상 시간: 2-3시간

### Priority 3 (장기 개선)

6. **AI Model 특화 Prompt** (`lib/prompt-strategies/`)
   - Claude 4.5: 복잡한 Grid 레이아웃 선호
   - GPT-4o: 간단한 Flexbox 선호
   - 모델별 최적화된 프롬프트
   - 예상 시간: 4-5시간

---

## 📊 예상 효과

### Before (현재)

```markdown
**Component Order:**
1. c1
2. c2
3. c3
...
```

**AI 해석**: 단순 세로 나열 → c6-c7 순서 오류

---

### After (개선 후)

```markdown
**Visual Layout (Canvas Grid):**

Desktop layout uses a 12-column × 8-row grid system.

- Row 0: Header (c1, cols 0-11)
- Row 1-6: Section (c7, cols 0-1), ImageBanner (c4, cols 2-11)
- Row 3-6: Container (c2, cols 2-6), Container (c5, cols 7-11)
- Row 7: Footer (c6, cols 0-10), CTA (c3, col 11)

**Spatial Relationships:**
- Section (c7) is positioned to the LEFT of ImageBanner (c4)
- Section (c7) acts as a SIDEBAR (narrow column on the left)
- Container (c2) and Container (c5) are SIDE-BY-SIDE in row 3-6

**CSS Grid Positioning:**
```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, auto);
}

.section {
  grid-area: 2 / 1 / 8 / 3;  /* Row 2-7, Col 1-2 */
}

.imagebanner {
  grid-area: 2 / 3 / 4 / 13;  /* Row 2-3, Col 3-12 */
}
```

**Implementation Strategy:**
- Use CSS Grid for macro (page-level) layout
- Section (c7) should be a sticky sidebar on the left
- Footer (c6) spans almost full width except CTA on the right
```

**AI 해석**: CSS Grid로 정확한 2D 배치 구현 → **100% 정확**

---

## 🎯 성공 지표

1. **Component 순서 정확도**: 85.7% → **100%**
2. **Canvas Grid 반영률**: 0% → **100%**
3. **AI 코드 생성 정확도**: 75% → **95%+**
4. **Validation 커버리지**: 3개 → **6개** 검증 규칙

---

## 📚 참고 문서

### Industry Standards (2025)
- Figma to Webflow plugin: Auto Layout → Grid conversion
- Framer: React SSR with responsive Grid
- CSS Grid + Flexbox hybrid patterns

### Prompt Engineering
- IBM Prompt Engineering Guide 2025
- Lakera Prompt Engineering Best Practices
- Structured Specification Pattern (Context-Task-Instructions)

### Implementation References
- `lib/prompt-templates.ts` (현재)
- `lib/schema-utils.ts` (현재)
- `lib/smart-layout.ts` (참고: positioning 패턴)

---

**작성자**: Claude Code
**리뷰 필요**: Architecture Team, AI Team
**구현 예정**: 2025-Q1
