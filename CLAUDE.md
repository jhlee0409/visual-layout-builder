# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Laylder는 AI 기반 코드 생성을 위한 비주얼 레이아웃 빌더입니다. 사용자가 드래그 앤 드롭으로 컴포넌트를 배치하면 Schema를 생성하고, 이를 AI 프롬프트로 변환하여 실제 프로덕션 코드를 생성합니다.

**핵심 기술**: Next.js 15 (App Router), React 19, TypeScript, Zustand, Konva (Canvas), Vitest (Unit Tests), Playwright (E2E Tests)

## 개발 명령어

```bash
# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# 유닛 테스트 실행 (Vitest)
pnpm test              # Watch mode
pnpm test:run          # Run once
pnpm test:ui           # UI mode
pnpm test:coverage     # With coverage

# E2E 테스트 실행 (Playwright)
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:headed
```

## 아키텍처 핵심 개념

### Schema - Component Independence

Laylder의 핵심은 **Component Independence** 원칙을 채택한 Schema 시스템입니다.

**설계 원칙 (types/schema.ts)**:
1. **Component Independence**: 각 컴포넌트가 독립적으로 positioning, layout, styling 정의
2. **Flexbox First, Grid Secondary**: Flexbox를 페이지 구조에, Grid를 카드 배치에 사용
3. **Semantic HTML First**: 시맨틱 태그에 적합한 positioning 전략 적용 (header → fixed/sticky, footer → static)
4. **Responsive Per Component**: 컴포넌트별로 반응형 동작 정의
5. **Separation of Concerns**: Layout(배치)과 Style(스타일) 명확히 분리

**Component 구조**:
```typescript
interface Component {
  id: string
  name: string  // PascalCase
  semanticTag: "header" | "nav" | "main" | "aside" | "footer" | "section" | "article" | "div" | "form"
  positioning: ComponentPositioning  // fixed, sticky, static, absolute, relative
  layout: ComponentLayout  // flex, grid, container, none
  styling?: ComponentStyling  // width, height, background, border, shadow, className
  responsive?: ResponsiveBehavior  // breakpoint별 override
  responsiveCanvasLayout?: ResponsiveCanvasLayout  // Canvas 배치 정보
}
```

**LayoutConfig**:
```typescript
interface LayoutConfig {
  structure: "vertical" | "horizontal" | "sidebar-main" | "sidebar-main-sidebar" | "custom"
  components: string[]  // 배치 순서
  containerLayout?: ContainerLayoutConfig  // 전체 컨테이너 레이아웃
  roles?: { header?: string; sidebar?: string; main?: string; footer?: string }
}
```

### ⚠️ Dynamic Breakpoint Support (2025-11-15)

시스템이 무제한 커스텀 breakpoint를 지원합니다.

#### 타입 변경사항

**현재 (동적 breakpoint):**
```typescript
// ✅ 무제한 커스텀 breakpoint 지원
interface LaydlerSchema {
  layouts: Record<string, LayoutConfig>  // 모든 string 키 허용
}

// 예시: 커스텀 breakpoint 사용
const schema: LaydlerSchema = {
  layouts: {
    mobile: { ... },
    laptop: { ... },      // ✅ 커스텀
    ultrawide: { ... },   // ✅ 커스텀
    '4k': { ... }         // ✅ 커스텀
  }
}
```

#### 마이그레이션 가이드

**1. TypeScript 코드 수정**

```typescript
// ✅ 타입 추론 활용 (권장)
const layouts = schema.layouts  // TypeScript가 자동 추론

// ✅ 명시적 타입 지정
const layouts: Record<string, LayoutConfig> = schema.layouts
```

**2. Breakpoint 접근 방식**

```typescript
// ✅ 직접 접근
const layout = schema.layouts[breakpoint]

// ✅ Optional chaining + bracket notation
if (component.responsive?.['laptop']) { ... }
```

**3. Breakpoint 검증 규칙**

```typescript
// ❌ Invalid breakpoint names (ValidationError 발생)
{ name: '' }                  // Empty name → EMPTY_BREAKPOINT_NAME
{ name: 'mobile@tablet' }     // Special characters → INVALID_BREAKPOINT_NAME
{ name: 'mobile tablet' }     // Spaces → INVALID_BREAKPOINT_NAME
{ name: '모바일' }             // Unicode → INVALID_BREAKPOINT_NAME
{ name: 'a'.repeat(101) }     // >100 chars → BREAKPOINT_NAME_TOO_LONG
{ name: 'constructor' }       // Reserved word → RESERVED_BREAKPOINT_NAME

// ✅ Valid breakpoint names
{ name: 'mobile' }            // Alphanumeric
{ name: '4k' }                // Starting with number (allowed)
{ name: 'mobile-sm' }         // Hyphen
{ name: 'tablet_md' }         // Underscore
{ name: 'desktop-2xl' }       // Mixed
```

**4. Breakpoint 제한**

최대 10개 breakpoint까지 지원합니다.

```typescript
// ❌ Invalid: 11개 breakpoint (최대 10개)
const schema: LaydlerSchema = {
  breakpoints: [ /* 11개 */ ]
}
// → TOO_MANY_BREAKPOINTS error
```

### State Management - Zustand

**store/layout-store.ts**가 핵심 상태 관리를 담당합니다.

**주요 State**:
- `schema`: LaydlerSchema (components, breakpoints, layouts)
- `currentBreakpoint`: string (동적 breakpoint 이름)
- `selectedComponentId`: 현재 선택된 컴포넌트
- `componentLinks`: 컴포넌트 간 링크 관계

**주요 Actions**:
- Component 관리: `addComponent`, `updateComponent`, `deleteComponent`, `duplicateComponent`
- Component 세부 업데이트: `updateComponentPositioning`, `updateComponentLayout`, `updateComponentStyling`, `updateComponentResponsive`
- Layout 관리: `updateLayout`, `addComponentToLayout`, `reorderComponentsInLayout`
- Breakpoint 관리: `setCurrentBreakpoint`, `addBreakpoint`, `updateBreakpoint`, `deleteBreakpoint`
- Schema 작업: `exportSchema`, `importSchema`, `loadSampleSchema`, `resetSchema`
- Component Linking: `addComponentLink`, `removeComponentLink`, `clearAllLinks`

**Schema 정규화**: `normalizeSchema()`를 통해 Breakpoint Inheritance 처리

### Component Linking - Cross-Breakpoint Relationships

**2025년 11월 아키텍처 결정**: Component Links는 순수한 메타데이터로, 컴포넌트 병합(merge) 없이 관계만 저장합니다.

**핵심 원칙**:
1. **Links Are Metadata, Not Merge Operations**: 컴포넌트를 물리적으로 병합하지 않고, 관계만 저장
2. **Component Independence Preservation**: 각 컴포넌트는 독립적으로 유지되며, 링크는 AI 프롬프트 생성 시에만 사용
3. **Manual Linking Only**: 자동 링크 기능 제거 - 사용자가 명시적으로 연결

**데이터 구조**:
```typescript
interface ComponentLink {
  source: string  // Source component ID
  target: string  // Target component ID
}

// Store state
componentLinks: Array<{ source: string; target: string }>
```

**Graph Algorithm (lib/graph-utils.ts)**:
- `calculateLinkGroups()`: DFS 기반 연결 컴포넌트 탐지 (O(V + E))
- `validateComponentLinks()`: Orphaned refs, self-loops, duplicates 검증
- `getComponentGroup()`: 특정 컴포넌트의 그룹 조회
- `areComponentsLinked()`: 두 컴포넌트의 연결 여부 확인

**AI Prompt Integration**:
- 링크는 `generatePrompt()`에 전달되어 "Component Links" 섹션 생성
- AI에게 "같은 그룹의 컴포넌트는 동일한 UI 요소의 반응형 버전"임을 알림
- 검증 실패 시 warnings로 사용자에게 피드백 제공

**UI Components**:
- `ComponentLinkingPanel`: React Flow 기반 시각적 링킹 인터페이스
- `ExportModal`: 링크 정보를 포함한 프롬프트 생성

**Performance Considerations**:
- `calculateLinkGroups()`는 < 50ms (100개 컴포넌트 기준)
- React 컴포넌트에서 반복 호출 시 `useMemo()` 사용 권장

### Canvas System - Konva

**components/canvas/** 디렉토리가 Canvas 렌더링을 담당합니다.

**구조**:
- `KonvaCanvas.tsx`: Konva Stage/Layer를 사용한 Canvas 구현
- `ComponentNode.tsx`: 개별 컴포넌트를 Konva Rect로 렌더링
- `Canvas.tsx`: Canvas + 컴포넌트 관리 로직

**Canvas Layout**:
```typescript
interface CanvasLayout {
  x: number  // Grid column 시작 위치 (0-based)
  y: number  // Grid row 시작 위치 (0-based)
  width: number  // Grid column span
  height: number  // Grid row span
}
```

Canvas는 **Grid 기반 좌표계**를 사용하여 자유로운 드래그 앤 드롭을 지원합니다.

**Smart Layout System** (2025-11-13):

`lib/smart-layout.ts`가 positioning/layout 기반 스마트 배치를 담당합니다.

**핵심 함수**:
- `calculateSmartPosition()`: semanticTag와 positioning을 기반으로 최적 배치 위치 자동 계산
- `findEmptySlot()`: 빈 공간 찾기 (collision 방지)
- `getRecommendedSize()`: 컴포넌트 타입별 추천 크기 반환

**배치 전략 (2025년 최신 웹 레이아웃 패턴 반영)**:
- **Header** (sticky/fixed): 최상단 (y=0), 전체 너비
- **Footer** (static): 최하단, 전체 너비
- **Sidebar** (aside): 좌측 (x=0) 또는 우측 끝단, 전체 높이의 1/4 너비
- **Nav** (sticky/fixed): Header 아래 또는 최상단
- **Main**: 중앙 영역 (header/sidebar 고려하여 가용 공간 최대 활용)
- **기타** (section, article, div, form): 빈 공간에 1x1 크기로 자동 배치

### Canvas → Code Generation Architecture (2025 Redesign)

**2025년 11월 14일** - Canvas JSON export 정확성 향상을 위한 완전한 아키텍처 재설계가 완료되었습니다.

#### 문제 배경

기존 시스템의 문제점:
- Canvas 2D Grid 정보 (x, y, width, height)가 AI 프롬프트로 변환 시 손실됨
- 1D component 배열만 전달되어 AI가 side-by-side 레이아웃을 이해하지 못함
- 결과: AI 생성 코드에서 컴포넌트 순서 오류 발생

#### 해결 방법 (2025 Industry Patterns 기반)

**핵심 라이브러리**:

1. **`lib/canvas-to-grid.ts`** - Canvas Grid → CSS Grid 변환
   ```typescript
   // Canvas 좌표 (0-based) → CSS Grid (1-based) 변환
   canvasToGridPositions(components, breakpoint, gridCols, gridRows)
   // → { componentId, gridArea: "1 / 1 / 2 / 13", gridColumn, gridRow }

   // CSS Grid 코드 생성
   generateGridCSS(visualLayout)
   // → "display: grid; grid-template-columns: repeat(12, 1fr); ..."

   // Tailwind CSS 클래스 생성
   generateTailwindClasses(visualLayout)
   // → { container: "grid grid-cols-12", components: {...} }

   // Grid 복잡도 분석
   analyzeGridComplexity(components, breakpoint)
   // → { hasSideBySide, recommendedImplementation, maxComponentsPerRow }
   ```

2. **`lib/visual-layout-descriptor.ts`** - Canvas를 자연어로 설명
   ```typescript
   describeVisualLayout(components, breakpoint, gridCols, gridRows)
   // Returns:
   // - summary: "12-column × 8-row grid system with 3 components"
   // - rowByRow: ["Row 0: Header (c1, cols 0-11, full width)", ...]
   // - spatialRelationships: ["Sidebar (c2) is LEFT of Main (c3)", ...]
   // - implementationHints: ["Use CSS Grid for complex 2D positioning", ...]
   // - visualLayout: CSS Grid positioning data
   ```

3. **`lib/canvas-utils.ts`** - 공통 Canvas 유틸리티
   ```typescript
   // Type-safe Canvas Layout 추출
   getCanvasLayoutForBreakpoint(component, 'desktop')
   // → { x, y, width, height } | undefined

   // Row별로 컴포넌트 그룹화
   groupComponentsByRow(components, breakpoint)
   // → [{ rowRange: [0], components: [...] }, ...]

   // Canvas layout이 있는 컴포넌트만 필터링
   filterComponentsWithCanvasLayout(components, breakpoint)

   // Canvas layout 존재 여부 확인
   hasCanvasLayout(component, 'desktop')
   ```

4. **`lib/schema-validation.ts`** - 강화된 검증

   **9가지 Canvas 검증 코드**:
   - ✅ `CANVAS_LAYOUT_ORDER_MISMATCH` - Canvas 순서 ≠ DOM 순서
   - ✅ `COMPLEX_GRID_LAYOUT_DETECTED` - Side-by-side 컴포넌트
   - ✅ `CANVAS_COMPONENTS_OVERLAP` - 컴포넌트 겹침
   - ✅ `CANVAS_OUT_OF_BOUNDS` - Grid 범위 초과
   - ✅ `CANVAS_ZERO_SIZE` - width=0 또는 height=0
   - ❌ `CANVAS_NEGATIVE_COORDINATE` - x<0 또는 y<0 (에러)
   - ✅ `CANVAS_FRACTIONAL_COORDINATE` - 소수점 좌표
   - ✅ `CANVAS_COMPONENT_NOT_IN_LAYOUT` - Layout에 없는 컴포넌트
   - ✅ `MISSING_CANVAS_LAYOUT` - Canvas 정보 누락

### AI Prompt Generation & Model Strategies

**lib/prompt-generator.ts**가 Schema를 AI 프롬프트로 변환합니다.

**생성 흐름**:
1. Schema normalization (breakpoint inheritance 적용)
2. Schema validation (`lib/schema-validation.ts`)
3. Model-specific strategy 선택 (`lib/prompt-strategies/`)
4. Prompt sections 생성:
   - System prompt (아키텍처 설명)
   - Components section (positioning, layout, styling, responsive)
   - Visual Layout section (Canvas 2D Grid 정보)
   - Layouts section (structure 기반)
   - Instructions section (구현 지침)
   - Component Links section (링크 관계)
   - Full Schema JSON (참조용)

**검증 기준** (lib/schema-validation.ts):
- Component name은 PascalCase
- Header는 fixed/sticky 권장, Footer는 static 권장
- Flex layout은 flex config 필요, Grid layout은 cols/rows 필요
- Layout의 components가 실제 component ID를 참조하는지 확인

#### AI Model Strategies (2025-11-13)

**lib/prompt-strategies/** 디렉토리에서 AI 모델별 최적화된 프롬프트 전략을 제공합니다.

**지원 모델**:
- **Claude**: Sonnet 4.5, Sonnet 4, Opus 4, Haiku 3.5
- **GPT**: GPT-4.1, GPT-4 Turbo, GPT-4
- **Gemini**: 2.5 Pro, 2.0 Pro, 2.0 Flash
- **DeepSeek**: R1, V3, Coder V2
- **Grok**: Grok 3, Grok 2

**핵심 파일**:
- `base-strategy.ts`: 기본 전략 클래스
- `claude-strategy.ts`: Claude 모델 최적화 (extended thinking, CoT)
- `gpt-strategy.ts`: GPT 모델 최적화 (o1 reasoning support)
- `gemini-strategy.ts`: Gemini 모델 최적화
- `deepseek-strategy.ts`: DeepSeek 모델 최적화
- `grok-strategy.ts`: Grok 모델 최적화
- `strategy-factory.ts`: Factory pattern으로 전략 생성

**사용 예시**:
```typescript
import { createPromptStrategy } from '@/lib/prompt-strategies'

// 1. 전략 생성
const strategy = createPromptStrategy('claude-sonnet-4.5')

// 2. 프롬프트 생성
const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
  optimizationLevel: 'quality',  // 'speed' | 'balanced' | 'quality'
  chainOfThought: true,           // CoT 활성화
  verbosity: 'detailed'           // 'concise' | 'normal' | 'detailed'
})

// 3. 결과 사용
if (result.success) {
  console.log(result.prompt)
  console.log(`Estimated tokens: ${result.estimatedTokens}`)
}
```

**Model Recommendation System**:
```typescript
import { getModelRecommendations } from '@/lib/prompt-strategies'

const recommendations = getModelRecommendations({
  schemaComplexity: 'complex',
  responsiveComplexity: 'medium',
  needsFrameworkSpecialization: true,
  costSensitivity: 'medium',
  qualityRequirement: 'production',
  speedPriority: 'medium'
})

// Returns: [{ modelId, score, reasoning }, ...]
const bestModel = recommendations[0]
```

**AI Model Registry** (lib/ai-model-registry.ts):
- 모델 메타데이터 (provider, capabilities, context window)
- Token 추정 알고리즘
- Model 추천 로직

### Component Library

**lib/component-library.ts**는 사전 정의된 컴포넌트 템플릿을 제공합니다.

**카테고리**:
- **layout**: Sticky Header, Main Content, Footer
- **navigation**: Left Sidebar, Horizontal Navbar
- **content**: Section, Article, Container Div, Hero Section, Card
- **form**: Form, Button Group

각 템플릿은 positioning, layout, styling이 사전 설정되어 있어 드래그 앤 드롭으로 즉시 사용 가능합니다.

### Export & Code Generation

**lib/file-exporter.ts**와 **lib/code-generator.ts**가 Schema를 실제 코드로 변환합니다.

**Export 옵션**:
- **Schema JSON**: Schema를 JSON 파일로 내보내기
- **AI Prompt**: Claude/GPT에 복붙할 프롬프트 생성 (모델별 최적화)
- **Code Bundle**: React/Tailwind 코드 + 압축 (JSZip)

**코드 생성 전략**:
- Component 단위 독립 파일 생성 (예: `Header.tsx`, `Sidebar.tsx`)
- Tailwind 클래스 자동 변환 (positioning → `fixed top-0`, layout → `flex flex-col`)
- Responsive 처리 (`hidden lg:block`)

## 폴더 구조

```
/app              # Next.js App Router (layout.tsx, page.tsx)
/components       # React 컴포넌트
  /canvas         # Konva Canvas 시스템
  /library-panel
  /properties-panel
  /breakpoint-panel
  /layers-tree
  /export-modal
  /theme-selector
  /component-linking-panel
  /initial-breakpoint-modal
  /ui             # shadcn/ui 컴포넌트
/lib              # 핵심 비즈니스 로직
  schema-validation.ts        # Schema 검증 + 에러/경고
  schema-utils.ts             # Schema 생성, 복제, 정규화
  component-library.ts        # 사전 정의 템플릿
  prompt-generator.ts         # AI 프롬프트 생성
  code-generator.ts           # React 코드 생성
  file-exporter.ts            # 파일 내보내기
  canvas-to-grid.ts           # Canvas Grid → CSS Grid 변환
  visual-layout-descriptor.ts # Canvas를 자연어로 설명
  canvas-utils.ts             # 공통 Canvas 유틸리티
  smart-layout.ts             # 스마트 배치 로직
  graph-utils.ts              # Component Linking 그래프 알고리즘
  grid-constraints.ts         # Grid 제약 조건
  snap-to-grid.ts             # Grid 스냅 로직
  ai-model-registry.ts        # AI 모델 메타데이터
  /prompt-strategies/         # AI 모델별 프롬프트 전략
    base-strategy.ts
    claude-strategy.ts
    gpt-strategy.ts
    gemini-strategy.ts
    deepseek-strategy.ts
    grok-strategy.ts
    strategy-factory.ts
  /__tests__/                 # Vitest 유닛 테스트
/store            # Zustand 상태 관리
  layout-store.ts
  theme-store.ts
  toast-store.ts
  alert-dialog-store.ts
/types            # TypeScript 타입 정의
  schema.ts       # 핵심 타입 정의
  ai-models.ts    # AI 모델 타입 정의
/scripts          # 테스트 스크립트
  test-ai-model-strategies.ts
  test-grok-strategy.ts
  validate-schema.ts
/docs             # Schema 예시 및 문서
  schema-v2-examples.md
  prompts-v2/
  dev-log/
/e2e              # Playwright E2E 테스트
```

## 중요 파일

### 핵심 타입
- **types/schema.ts**: Schema 전체 타입 정의

### 상태 관리
- **store/layout-store.ts**: 레이아웃 상태 + actions

### 비즈니스 로직
- **lib/schema-utils.ts**: Schema 생성, 복제, 정규화
- **lib/schema-validation.ts**: Schema 검증 + 에러/경고 (9가지 Canvas 검증 포함)
- **lib/prompt-generator.ts**: AI 프롬프트 생성
- **lib/component-library.ts**: 사전 정의 템플릿
- **lib/smart-layout.ts**: 스마트 배치 로직 (positioning/semanticTag 기반 자동 배치)

### Canvas 관련 (2025 Architecture)
- **lib/canvas-to-grid.ts**: Canvas Grid → CSS Grid 변환, grid-area 생성
- **lib/visual-layout-descriptor.ts**: Canvas를 자연어 설명으로 변환 (AI용)
- **lib/canvas-utils.ts**: 공통 Canvas 유틸리티 (type-safe breakpoint access, grouping)

### AI Model Strategies
- **lib/prompt-strategies/**: AI 모델별 최적화된 프롬프트 전략
- **lib/ai-model-registry.ts**: AI 모델 메타데이터 및 추천 시스템

### UI 컴포넌트
- **components/canvas/KonvaCanvas.tsx**: Canvas 렌더링
- **components/library-panel/LibraryPanel.tsx**: 컴포넌트 라이브러리
- **components/properties-panel/PropertiesPanel.tsx**: 속성 편집기
- **components/component-linking-panel/ComponentLinkingPanel.tsx**: 컴포넌트 링킹 인터페이스

## 🧪 테스트 전략 및 필수 가이드

### 테스트 철학

Laylder는 **Vitest 기반 Unit 테스트** + **Playwright E2E 테스트** 전략을 사용합니다.

**핵심 원칙**:
1. **비즈니스 로직 검증**: 핵심 로직을 독립적으로 테스트
2. **빠른 피드백**: Vitest로 작성된 테스트를 즉시 실행
3. **높은 신뢰도**: 각 모듈의 정확성을 보장
4. **회귀 방지**: 모든 주요 기능은 Unit 테스트로 보호
5. **커버리지 추적**: 코드 커버리지를 통한 품질 관리

### Vitest Unit 테스트

**테스트 프레임워크**: Vitest 4.0
**테스트 파일 위치**: `lib/__tests__/` 디렉토리
**테스트 환경**: Happy DOM

```bash
# 유닛 테스트 실행
pnpm test              # Watch mode
pnpm test:run          # Run once
pnpm test:ui           # UI mode
pnpm test:coverage     # With coverage
```

### 테스트 파일 구조

```
lib/__tests__/
├── canvas-comprehensive-validation.test.ts  # Canvas 검증 (33 tests)
├── canvas-edge-cases.test.ts                # Canvas 엣지 케이스 (13 tests)
├── canvas-integration.test.ts               # Canvas 통합 (39 tests)
├── canvas-json-export.test.ts               # Canvas JSON export (22 tests)
├── canvas-to-prompt-e2e.test.ts             # Canvas to Prompt E2E (16 tests)
├── canvas-utils.test.ts                     # Canvas 유틸리티 (13 tests)
├── component-linking-store.test.ts          # Component Linking (25 tests)
├── dynamic-breakpoints.test.ts              # 동적 Breakpoint (24 tests)
├── graph-utils.test.ts                      # 그래프 알고리즘 (20 tests)
├── grid-constraints.test.ts                 # 그리드 제약 조건 (33 tests)
├── performance.test.ts                      # 성능 테스트 (10 tests)
├── prompt-generation-negative.test.ts       # 프롬프트 생성 음수 케이스 (18 tests)
├── prompt-generator.test.ts                 # 프롬프트 생성 (7 tests)
├── prompt-quality.test.ts                   # 프롬프트 품질 (46 tests)
├── schema-utils.test.ts                     # 스키마 유틸리티 (27 tests)
├── schema-validation.test.ts                # 스키마 검증 (78 tests)
├── side-by-side-layouts.test.ts             # Side-by-side 레이아웃 (21 tests)
├── smart-layout.test.ts                     # 스마트 레이아웃 (41 tests)
├── snap-to-grid.test.ts                     # 그리드 스냅 (7 tests)
└── union-find.test.ts                       # Union-Find (13 tests)
```

**명명 규칙**:
- `[모듈명].test.ts`: Vitest 유닛 테스트 파일
- AAA 패턴 (Arrange-Act-Assert) 사용
- `describe` / `it` 블록으로 구조화

### Playwright E2E 테스트

**테스트 프레임워크**: Playwright 1.56
**테스트 파일 위치**: `e2e/` 디렉토리

```bash
# E2E 테스트 실행
pnpm test:e2e          # Headless mode
pnpm test:e2e:ui       # UI mode
pnpm test:e2e:headed   # Headed mode (브라우저 보임)
```

### 테스트 커버리지

**현재 커버리지 (핵심 비즈니스 로직)**:
- **전체**: 500+ 테스트, 12,000+ lines of test code
- **canvas-to-grid.ts**: 100% ✅
- **snap-to-grid.ts**: 100% ✅
- **prompt-generator.ts**: 95%+ ✅
- **grid-constraints.ts**: 90%+ ✅
- **schema-validation.ts**: 85%+ ✅
- **schema-utils.ts**: 80%+ ✅
- **smart-layout.ts**: 75%+ ✅

**커버리지 리포트 위치**: `coverage/` 디렉토리 (HTML 형식으로 확인 가능)

### 테스트 작성 필수 규칙

#### 1. Vitest describe/it 구조

```typescript
import { describe, it, expect } from 'vitest'
import { functionToTest } from '../module'

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should perform expected behavior', () => {
      // Arrange: 테스트 데이터 준비
      const input = { /* ... */ }

      // Act: 동작 수행
      const result = functionToTest(input)

      // Assert: 결과 검증
      expect(result).toBe(expectedValue)
      expect(result).toHaveProperty('key', 'value')
    })
  })
})
```

#### 2. AAA 패턴 (Arrange-Act-Assert)

**✅ 권장 (명확한 구조)**:
```typescript
describe('Prompt Generator', () => {
  it('should generate valid prompt for valid schema', () => {
    // Arrange: 초기 데이터 준비
    const validSchema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [/* ... */],
      breakpoints: [/* ... */],
      layouts: { /* ... */ }
    }

    // Act: 동작 수행
    const result = generatePrompt(validSchema, 'react', 'tailwind')

    // Assert: 결과 검증
    expect(result.success).toBe(true)
    expect(result.prompt).toBeDefined()
    expect(result.errors).toBeUndefined()
  })
})
```

#### 3. 테스트 독립성 보장

```typescript
// ✅ 좋은 예: 각 테스트가 독립적
describe('Schema Utils', () => {
  it('should create empty schema', () => {
    const schema = createEmptySchema()
    expect(schema.components).toHaveLength(0)
  })

  it('should generate component ID', () => {
    const components = [
      { id: 'c1', name: 'Header', /* ... */ }
    ]
    const nextId = generateComponentId(components)
    expect(nextId).toBe('c2')
  })
})
```

## 샘플 데이터

**lib/sample-data.ts**에 4가지 실제 레이아웃 샘플이 있습니다:
1. **github**: GitHub 스타일 (Header + Sidebar + Main)
2. **dashboard**: 대시보드 레이아웃 (Fixed Header + Side Menu + Content)
3. **marketing**: 마케팅 사이트 (Sticky Header + Hero + Features + Footer)
4. **cardGallery**: 카드 갤러리 (Header + Grid Layout)

UI에서 `loadSampleSchema("github")`로 로드 가능합니다.

## 개발 시 주의사항

### Schema 정규화 필수

`addComponent`, `addComponentToLayout` 등 Schema를 수정하는 모든 작업 후에는 반드시 `normalizeSchema()`를 호출하여 Breakpoint Inheritance를 적용해야 합니다.

```typescript
// ❌ 잘못된 예
const updatedSchema = {
  ...state.schema,
  components: [...state.schema.components, newComponent]
}

// ✅ 올바른 예
const updatedSchema = {
  ...state.schema,
  components: [...state.schema.components, newComponent]
}
const normalizedSchema = normalizeSchema(updatedSchema)
```

### Component Name은 PascalCase

Schema validation에서 PascalCase를 강제합니다. `MyComponent`, `Header`, `MainContent` 형식을 사용하세요.

### Positioning 전략 이해

- **header**: `fixed top-0` 또는 `sticky top-0` 권장
- **footer**: `static` 권장
- **sidebar**: `sticky top-16` (header 아래) 또는 `fixed left-0`
- **main**: `static` + `flex-1` 또는 `container` 권장

### Breakpoint Inheritance

- Mobile 설정이 기본값
- Tablet은 Mobile을 상속 (명시적 override만 적용)
- Desktop은 Tablet을 상속 (명시적 override만 적용)

이 패턴은 `normalizeSchema()`에서 자동 처리되므로, 사용자는 변경된 부분만 입력하면 됩니다.

## 코드 작성 가이드

### Zustand Action 작성 시

모든 action은 `set()` 함수 마지막 인자로 action 이름을 전달하여 Redux DevTools에서 추적 가능하게 하세요.

```typescript
addComponent: (component) => {
  set((state) => ({
    schema: { ...state.schema, components: [...state.schema.components, component] }
  }), false, "addComponent")  // ← action 이름
}
```

### Canvas 좌표 계산

Canvas는 Grid 기반이므로, 실제 픽셀 좌표를 Grid 좌표로 변환해야 합니다.

```typescript
const gridX = Math.floor(pixelX / cellWidth)
const gridY = Math.floor(pixelY / cellHeight)
```

### 새로운 Component Template 추가

`lib/component-library.ts`의 `COMPONENT_LIBRARY` 배열에 추가하세요. Template은 반드시 `positioning`, `layout` 필드를 포함해야 합니다.

### AI Prompt Template 수정

`lib/prompt-templates.ts`에서 framework별 template을 수정할 수 있습니다. System prompt, component section, layout section, instructions section으로 구분됩니다.

### AI Model Strategy 추가

새로운 AI 모델 지원을 추가하려면:

1. **모델 메타데이터 추가** (`lib/ai-model-registry.ts`)
2. **전략 클래스 작성** (`lib/prompt-strategies/[model]-strategy.ts`)
3. **Factory 매핑** (`lib/prompt-strategies/strategy-factory.ts`)
4. **테스트 작성** (`scripts/test-[model]-strategy.ts`)

## 🚨 필수 개발 워크플로우 (MANDATORY)

**모든 작업은 반드시 다음 워크플로우를 따라야 합니다. 이 프로세스는 품질 보증과 컨텍스트 유지를 위해 필수입니다.**

### 1. Plan First (계획 수립)

**모든 작업 시작 전에 반드시 계획을 수립하세요.**

```markdown
## 작업 계획
- [ ] Phase 1: 요구사항 분석 및 관련 파일 파악
- [ ] Phase 2: 구현 설계 및 아키텍처 검토
- [ ] Phase 3: 코드 작성 및 단위 검증
- [ ] Phase 4: Unit 테스트 작성 및 검증
- [ ] Phase 5: 문서화 및 컨텍스트 저장
```

**계획 작성 규칙**:
- 최소 3개 이상의 Phase로 구성
- 각 Phase는 검증 가능한 단위로 분할
- 예상 소요 시간 및 리스크 명시
- Phase 간 의존성 명확히 표시

### 2. Task Breakdown (태스크 분해)

**각 Phase를 구체적인 Task로 분해하세요.**

**Task 작성 규칙**:
- Task는 30분 이내 완료 가능한 단위
- 각 Task는 명확한 완료 조건 포함
- Task 번호는 Phase.Task 형식 (예: 1.1, 1.2)
- 의존 관계 있는 Task는 순서 명시

### 3. Continuous Verification (지속적 검증)

**각 Task 완료 후 반드시 검증을 수행하세요.**

#### ✅ Task Level 검증

```bash
# 코드 작성 후 즉시 검증
pnpm lint              # 린트 통과 확인
npx tsc --noEmit       # TypeScript 타입 검증
```

**검증 실패 시**:
- 다음 Task로 절대 진행하지 마세요
- 실패 원인 분석 → 수정 → 재검증
- 3회 이상 실패 시 접근 방법 재검토

#### ✅ Phase Level 검증

```bash
# Phase 완료 시 통합 검증
pnpm build             # 빌드 성공 확인
pnpm test:run          # 유닛 테스트 통과
pnpm test:e2e          # E2E 테스트 통과 (UI 작업 시)
pnpm dev               # Dev 서버 동작 확인 (UI 작업 시)
```

**Phase 완료 기준**:
- 모든 Task 완료 체크
- 빌드 성공 (pnpm build)
- 관련 Unit 테스트 통과 (기존 테스트 깨지지 않음)
- 새로운 기능의 Unit 테스트 작성 및 통과 (기능 추가 시)
- 수동 UI 검증 완료 (UI 작업 시)

#### ✅ 테스트 작성 필수 시점

**다음 작업 시 Unit 테스트 반드시 작성**:

1. **새로운 AI 모델 추가**
2. **전략 로직 변경**
3. **버그 수정** (회귀 방지)
4. **새로운 비즈니스 로직 추가**

**테스트 작성 생략 가능** (예외):
- 내부 리팩토링 (동작 변경 없음)
- 타입 정의 추가
- 문서화 작업
- 스타일 변경 (CSS만)
- UI 컴포넌트 수정 (비즈니스 로직 없음)

### 4. Documentation & Context Preservation (문서화 및 컨텍스트 보존)

**Phase 완료 시마다 반드시 문서화하세요.**

#### 📝 Phase Summary 작성

**docs/dev-log/** 디렉토리에 작업 로그 작성:

```markdown
# Dev Log: [작업명] - [날짜]

## Phase 1: 요구사항 분석 ✅
- **완료 시간**: 2024-01-15 10:30
- **주요 발견사항**:
  - Schema는 Component Independence 원칙 기반
  - normalizeSchema()가 Breakpoint Inheritance 처리
  - validation은 PascalCase naming 강제
- **영향받는 파일**:
  - types/schema.ts (타입 정의)
  - lib/schema-validation.ts (검증 로직)
  - store/layout-store.ts (상태 관리)
- **다음 Phase 전제조건**: Schema 구조 이해 완료
```

#### 📚 Context File 업데이트

**중요 결정사항은 CLAUDE.md나 별도 context 파일에 기록**

### 5. Gate Keeping (게이트 키핑)

**다음 Phase로 이동하기 전 체크리스트:**

```markdown
## Phase 완료 체크리스트 (Gate)
- [ ] 모든 Task 완료 확인
- [ ] 린트 통과 (pnpm lint)
- [ ] 빌드 성공 (pnpm build)
- [ ] TypeScript 타입 체크 통과 (npx tsc --noEmit)
- [ ] 관련 Unit 테스트 통과 (pnpm test:run)
- [ ] E2E 테스트 통과 (해당 시)
- [ ] Dev 서버 정상 동작 확인 (UI 작업 시)
- [ ] Phase Summary 문서 작성 완료
- [ ] Context 파일 업데이트 완료
- [ ] Git commit 완료 (의미 있는 단위)
```

**⚠️ 하나라도 미완료 시 다음 Phase 진행 금지**

### 6. Quality Gates (품질 게이트)

**최종 완료 전 필수 통과 항목:**

```bash
# Gate 1: 코드 품질
pnpm lint
npx tsc --noEmit

# Gate 2: 기능 검증 (Unit Tests)
pnpm build
pnpm test:run

# Gate 3: E2E 검증 (UI 작업 시)
pnpm test:e2e

# Gate 4: 수동 검증 (UI 작업 시)
pnpm dev
# → 브라우저에서 실제 UI 동작 확인
```

**모든 Gate 통과 시에만 작업 완료로 간주**

## 워크플로우 체크리스트 (Quick Reference)

**모든 작업 시작 시:**
```
[ ] Plan 작성 (Phase 분할)
[ ] Task 분해 (30분 단위)
[ ] Context 파일 확인 (CLAUDE.md, dev-log)
```

**각 Task 완료 시:**
```
[ ] 코드 작성
[ ] 즉시 검증 (lint, tsc)
[ ] Task 체크 완료
```

**각 Phase 완료 시:**
```
[ ] 통합 검증 (build, test)
[ ] Phase Summary 작성
[ ] Context 파일 업데이트
[ ] Git commit (의미 있는 단위)
[ ] 다음 Phase 진행 여부 결정
```

**최종 완료 시:**
```
[ ] 모든 Quality Gate 통과
[ ] 전체 문서화 완료
[ ] Dev Log 최종 업데이트
```

## 문서 참조

- **docs/schema-v2-examples.md**: Schema 예시 및 생성 코드 샘플
- **docs/prompts-v2/**: 각 샘플 레이아웃별 AI 프롬프트 예시
- **docs/dev-log/**: 개발 작업 로그 및 컨텍스트
- **docs/canvas-architecture-redesign-2025.md**: Canvas 아키텍처 재설계 문서
