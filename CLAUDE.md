# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Laylder는 AI 기반 코드 생성을 위한 비주얼 레이아웃 빌더입니다. 사용자가 드래그 앤 드롭으로 컴포넌트를 배치하면 Schema V2를 생성하고, 이를 AI 프롬프트로 변환하여 실제 프로덕션 코드를 생성합니다.

**핵심 기술**: Next.js 15 (App Router), React 19, TypeScript, Zustand, Konva (Canvas), Playwright (E2E)

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

# E2E 테스트 실행 (전체)
pnpm test:e2e

# E2E 테스트 UI 모드
pnpm test:e2e:ui

# E2E 테스트 Headed 모드
pnpm test:e2e:headed

# 특정 테스트 파일 실행
pnpm test:e2e -- e2e/v2-02-panels.spec.ts

# Schema V2 검증 스크립트
npx tsx scripts/validate-schema-v2.ts
```

## 아키텍처 핵심 개념

### Schema V2 - Component Independence

Laylder의 핵심은 **Schema V2**로, 기존 V1의 grid-template-areas 방식을 버리고 **Component Independence** 원칙을 채택했습니다.

**설계 원칙 (types/schema-v2.ts)**:
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
  responsive?: ResponsiveBehavior  // mobile, tablet, desktop별 override
  responsiveCanvasLayout?: ResponsiveCanvasLayout  // Canvas 배치 정보
}
```

**LayoutConfig** (grid-template-areas 없음):
```typescript
interface LayoutConfig {
  structure: "vertical" | "horizontal" | "sidebar-main" | "sidebar-main-sidebar" | "custom"
  components: string[]  // 배치 순서
  containerLayout?: ContainerLayoutConfig  // 전체 컨테이너 레이아웃
  roles?: { header?: string; sidebar?: string; main?: string; footer?: string }
}
```

**V1 vs V2 비교**:
- **V1 문제**: 모든 컴포넌트를 grid-template-areas로 강제 배치 → 비현실적
- **V2 해결**: 각 컴포넌트가 자신의 positioning 전략을 가짐 → 실제 프로덕션 패턴

### State Management - Zustand

**store/layout-store-v2.ts**가 핵심 상태 관리를 담당합니다.

**주요 State**:
- `schema`: LaydlerSchemaV2 (components, breakpoints, layouts)
- `currentBreakpoint`: "mobile" | "tablet" | "desktop"
- `selectedComponentId`: 현재 선택된 컴포넌트

**주요 Actions**:
- Component 관리: `addComponent`, `updateComponent`, `deleteComponent`, `duplicateComponent`
- V2 특화: `updateComponentPositioning`, `updateComponentLayout`, `updateComponentStyling`, `updateComponentResponsive`
- Layout 관리: `updateLayout`, `addComponentToLayout`, `reorderComponentsInLayout`
- Breakpoint 관리: `setCurrentBreakpoint`, `addBreakpoint`, `updateBreakpoint`, `deleteBreakpoint`
- Schema 작업: `exportSchema`, `importSchema`, `loadSampleSchema`, `resetSchema`

**Breakpoint Inheritance**: `normalizeSchemaV2()`를 통해 Mobile → Tablet → Desktop 순서로 상속 처리

### Canvas System - Konva

**components/canvas-v2/** 디렉토리가 Canvas 렌더링을 담당합니다.

**구조**:
- `KonvaCanvasV2.tsx`: Konva Stage/Layer를 사용한 Canvas 구현
- `ComponentNodeV2.tsx`: 개별 컴포넌트를 Konva Rect로 렌더링
- `CanvasV2.tsx`: Canvas + 컴포넌트 관리 로직

**Canvas Layout**:
```typescript
interface CanvasLayout {
  x: number  // Grid column 시작 위치
  y: number  // Grid row 시작 위치
  width: number  // Grid column span
  height: number  // Grid row span
}
```

Canvas는 **Grid 기반 좌표계** (기본 12×20)를 사용하여 자유로운 드래그 앤 드롭을 지원합니다.

**Smart Layout System** (2025-11-13 추가):

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

**기본 그리드 크기**: 드롭 시 기본 1×1 크기 (스마트 배치 로직이 semanticTag에 따라 자동 조정)

### AI Prompt Generation

**lib/prompt-generator-v2.ts**가 Schema V2를 AI 프롬프트로 변환합니다.

**생성 흐름**:
1. Schema normalization (breakpoint inheritance 적용)
2. Schema validation (`lib/schema-validation-v2.ts`)
3. Template 선택 (`lib/prompt-templates-v2.ts`)
4. Prompt sections 생성:
   - System prompt (V2 아키텍처 설명)
   - Components section (positioning, layout, styling, responsive)
   - Layouts section (structure 기반)
   - Instructions section (V2 구현 지침)
   - Full Schema JSON (참조용)

**검증 기준** (lib/schema-validation-v2.ts):
- Component name은 PascalCase
- Header는 fixed/sticky 권장, Footer는 static 권장
- Flex layout은 flex config 필요, Grid layout은 cols/rows 필요
- Layout의 components가 실제 component ID를 참조하는지 확인

### Component Library

**lib/component-library-v2.ts**는 사전 정의된 컴포넌트 템플릿을 제공합니다.

**카테고리**:
- **layout**: Sticky Header, Main Content, Footer
- **navigation**: Left Sidebar, Horizontal Navbar
- **content**: Section, Article, Container Div, Hero Section, Card
- **form**: Form, Button Group

각 템플릿은 positioning, layout, styling이 사전 설정되어 있어 드래그 앤 드롭으로 즉시 사용 가능합니다.

### Export & Code Generation

**lib/file-exporter-v2.ts**와 **lib/code-generator-v2.ts**가 Schema를 실제 코드로 변환합니다.

**Export 옵션**:
- **Schema JSON**: Schema V2를 JSON 파일로 내보내기
- **AI Prompt**: Claude/GPT에 복붙할 프롬프트 생성
- **Code Bundle**: React/Tailwind 코드 + 압축 (JSZip)

**코드 생성 전략**:
- Component 단위 독립 파일 생성 (예: `Header.tsx`, `Sidebar.tsx`)
- Tailwind 클래스 자동 변환 (positioning → `fixed top-0`, layout → `flex flex-col`)
- Responsive 처리 (`hidden lg:block`)

## 폴더 구조 특징

```
/app              # Next.js App Router (layout.tsx, page.tsx)
/components       # React 컴포넌트 (V2 suffix)
  /canvas-v2      # Konva Canvas 시스템
  /library-panel-v2
  /properties-panel-v2
  /breakpoint-panel-v2
  /layers-tree-v2
  /export-modal-v2
  /theme-selector-v2
  /initial-breakpoint-modal
  /ui             # shadcn/ui 컴포넌트
/lib              # 핵심 비즈니스 로직 (V2 suffix)
  schema-validation-v2.ts
  schema-utils-v2.ts
  component-library-v2.ts
  prompt-generator-v2.ts
  code-generator-v2.ts
  file-exporter-v2.ts
/store            # Zustand 상태 관리 (V2 suffix)
  layout-store-v2.ts
  theme-store-v2.ts
/types            # TypeScript 타입 정의
  schema-v2.ts    # 핵심 타입 정의
/e2e              # Playwright E2E 테스트
/docs             # Schema V2 예시 및 문서
  schema-v2-examples.md
  prompts-v2/
```

**V2 Suffix**: V1에서 V2로 마이그레이션 중이며, V2 suffix가 있는 파일이 현재 사용 중인 최신 버전입니다.

## 중요 파일

### 핵심 타입
- **types/schema-v2.ts**: Schema V2 전체 타입 정의

### 상태 관리
- **store/layout-store-v2.ts**: 레이아웃 상태 + actions

### 비즈니스 로직
- **lib/schema-utils-v2.ts**: Schema 생성, 복제, 정규화
- **lib/schema-validation-v2.ts**: Schema 검증 + 에러/경고
- **lib/prompt-generator-v2.ts**: AI 프롬프트 생성
- **lib/component-library-v2.ts**: 사전 정의 템플릿
- **lib/smart-layout.ts**: 스마트 배치 로직 (positioning/semanticTag 기반 자동 배치)

### UI 컴포넌트
- **components/canvas-v2/KonvaCanvasV2.tsx**: Canvas 렌더링
- **components/library-panel-v2/LibraryPanelV2.tsx**: 컴포넌트 라이브러리
- **components/properties-panel-v2/PropertiesPanelV2.tsx**: 속성 편집기

## 🧪 테스트 전략 및 필수 가이드

### 테스트 철학

Laylder는 **E2E 테스트 우선 (E2E-First Testing)** 전략을 사용합니다.

**핵심 원칙**:
1. **실제 사용자 플로우 검증**: Unit 테스트보다 E2E 테스트 우선
2. **브라우저 환경 필수**: Canvas(Konva), Zustand, React 19 통합 동작 검증
3. **시각적 피드백**: 실제 UI 동작 확인 필수
4. **회귀 방지**: 모든 주요 기능은 E2E 테스트로 보호

### Playwright E2E 테스트

**설정 파일**: `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,  // 로컬 개발 시 기존 서버 재사용
    timeout: 120000,
  },
  projects: [{ name: 'chromium' }],  // Chrome에서만 실행
}
```

**자동 Dev 서버 시작**: Playwright가 테스트 전에 자동으로 `pnpm dev` 실행

### 테스트 파일 구조

```
e2e/
├── v2-01-basic-flow.spec.ts         # 기본 플로우 (페이지 로드, 샘플 로드, Reset)
├── v2-02-panels.spec.ts             # 패널 시스템 (Library, Canvas, Properties)
├── v2-03-breakpoints.spec.ts        # 브레이크포인트 전환 (Mobile/Tablet/Desktop)
├── v2-04-export.spec.ts             # Export 모달 (AI Prompt 생성)
└── resizable-panels.spec.ts         # 리사이즈 기능
```

**명명 규칙**:
- `v2-XX-[기능명].spec.ts`: V2 기능별 테스트
- `[컴포넌트명].spec.ts`: 특정 컴포넌트 테스트

### 테스트 실행 명령어

```bash
# 전체 E2E 테스트 실행 (헤드리스)
pnpm test:e2e

# UI 모드 (디버깅, 스텝 바이 스텝 실행)
pnpm test:e2e:ui

# Headed 모드 (브라우저 보면서 실행)
pnpm test:e2e:headed

# 특정 파일만 실행
pnpm test:e2e -- e2e/v2-01-basic-flow.spec.ts

# 특정 테스트 케이스만 실행
pnpm test:e2e -- e2e/v2-01-basic-flow.spec.ts -g "샘플 레이아웃"

# 디버그 모드 (Inspector 활성화)
pnpm test:e2e -- --debug

# 특정 브라우저 지정
pnpm test:e2e -- --project=chromium
```

### 테스트 작성 필수 규칙

#### 1. test.describe로 그룹화

```typescript
test.describe('V2 기본 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v2')  // 각 테스트 전 페이지 로드
  })

  test('V2 페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 테스트 로직
  })
})
```

#### 2. 명확한 Selector 사용

**✅ 권장 (접근성 기반)**:
```typescript
// Role + Name
await page.getByRole('button', { name: 'Load Sample' })

// Label
await page.getByLabel('Component Name')

// Placeholder
await page.getByPlaceholder('Search components')
```

**⚠️ 주의 (취약함)**:
```typescript
// CSS 클래스 (스타일 변경 시 깨짐)
await page.locator('.btn-primary')  // ❌

// 텍스트 직접 매칭 (i18n 시 깨짐)
await page.locator('text=로드')  // ❌
```

**✅ 올바른 예시**:
```typescript
// Header 내부에서만 검색 (범위 좁히기)
await page.locator('header').getByText(/\d+ components/)

// Canvas 요소 (Konva)
const canvas = page.locator('canvas').first()
await expect(canvas).toBeVisible()

// 모달 (role 사용)
const modal = page.locator('[role="dialog"]')
await expect(modal).toBeVisible()
```

#### 3. 적절한 대기 (Wait) 전략

**❌ 절대 금지**:
```typescript
await page.waitForTimeout(1000)  // 임의의 대기 시간
```

**✅ 권장**:
```typescript
// 요소가 보일 때까지 대기 (자동 retry)
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

// 특정 상태까지 대기
await expect(page.locator('header').getByText(/[1-9]\d* components/))
  .toBeVisible({ timeout: 3000 })

// 네트워크 응답 대기
await page.waitForResponse(response =>
  response.url().includes('/api/save') && response.status() === 200
)

// 네비게이션 대기
await page.waitForURL('/v2')
```

**예외적으로 허용** (애니메이션 완료 대기):
```typescript
// 탭 전환 애니메이션
await propertiesTab.click()
await page.waitForTimeout(300)  // 300ms는 Tailwind 기본 transition
```

#### 4. 에러 메시지 명확화

```typescript
// ❌ 나쁜 예
await expect(page.locator('button')).toBeVisible()

// ✅ 좋은 예
await expect(
  page.getByRole('button', { name: 'Load Sample' }),
  'Load Sample 버튼이 표시되어야 합니다'
).toBeVisible()
```

#### 5. 테스트 독립성 보장

```typescript
test.describe('Component CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v2')
    // 매 테스트마다 초기 상태로 리셋
    await page.getByRole('button', { name: 'Reset' }).click()
  })

  test('컴포넌트 추가', async ({ page }) => {
    // 이 테스트는 다른 테스트에 영향받지 않음
  })

  test('컴포넌트 삭제', async ({ page }) => {
    // 독립적으로 실행 가능
  })
})
```

### 테스트 커버리지 기준

**필수 커버리지 (P0)**:
- [x] 페이지 로드 및 초기화
- [x] 샘플 데이터 로드
- [x] 컴포넌트 추가/삭제
- [x] 브레이크포인트 전환
- [x] Export 모달 열기/닫기
- [ ] Canvas 드래그 앤 드롭 (TODO)
- [ ] Properties 패널 수정 (TODO)

**권장 커버리지 (P1)**:
- [ ] 컴포넌트 복제
- [ ] Undo/Redo (구현 후)
- [ ] 레이아웃 구조 변경
- [ ] 반응형 설정 변경

### 테스트 실패 디버깅

#### Playwright UI Mode 활용

```bash
pnpm test:e2e:ui
```

**기능**:
- 테스트 단계별 실행 (Step Over)
- DOM 스냅샷 확인
- 네트워크 요청 모니터링
- 콘솔 로그 확인

#### Trace Viewer 활용

```bash
# 실패한 테스트의 trace 확인
pnpm test:e2e -- --trace on

# Trace 파일 열기
npx playwright show-trace trace.zip
```

**trace에서 확인 가능**:
- 각 액션별 스크린샷
- DOM 상태 변화
- 네트워크 타임라인
- 콘솔 로그

#### Screenshot 활용

```typescript
test('실패 시 스크린샷', async ({ page }) => {
  await page.goto('/v2')

  // 실패 가능성 있는 작업
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

  // 수동 스크린샷 (디버깅용)
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true })
})
```

**자동 스크린샷**: `playwright.config.ts`에서 `screenshot: 'only-on-failure'` 설정됨

### 테스트 작성 워크플로우

#### 1. 테스트 계획 (Plan)

```markdown
## 테스트 계획: 컴포넌트 드래그 앤 드롭

### 테스트 시나리오
1. **Given**: Library Panel에서 Header 컴포넌트 선택
2. **When**: Canvas로 드래그 앤 드롭
3. **Then**: Canvas에 Header 컴포넌트 렌더링됨

### 검증 포인트
- [ ] Library Panel에 컴포넌트 목록 표시
- [ ] 드래그 시작 시 커서 변경
- [ ] 드롭 영역 하이라이트
- [ ] 드롭 후 컴포넌트 카운트 증가
- [ ] Canvas에 컴포넌트 시각적 표시
```

#### 2. 테스트 작성 (Write)

```typescript
test.describe('컴포넌트 드래그 앤 드롭', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v2')
  })

  test('Library에서 Canvas로 컴포넌트를 드래그할 수 있어야 함', async ({ page }) => {
    // Given: Library Panel에서 Header 컴포넌트 찾기
    const headerComponent = page.locator('aside').getByText('Sticky Header')
    await expect(headerComponent).toBeVisible()

    // When: Canvas로 드래그
    const canvas = page.locator('canvas').first()
    await headerComponent.dragTo(canvas)

    // Then: 컴포넌트 카운트 증가 확인
    await expect(page.locator('header').getByText(/1 components/)).toBeVisible()
  })
})
```

#### 3. 실행 및 디버깅 (Run & Debug)

```bash
# UI 모드로 디버깅
pnpm test:e2e:ui

# 특정 테스트만 실행
pnpm test:e2e -- -g "드래그"
```

#### 4. 검증 완료 (Verify)

- [x] 테스트 통과
- [x] 실제 브라우저에서 수동 검증
- [x] Edge case 추가 (빈 Canvas, 중복 드롭 등)

### 새로운 기능 개발 시 테스트 작성 필수

**워크플로우에 테스트 단계 추가**:

```markdown
## Phase 3: 구현 (40분)
- [ ] Task 3.1: 기능 구현
- [ ] Task 3.2: **E2E 테스트 작성** ← 필수
- [ ] Task 3.3: 테스트 통과 확인
```

**TDD (Test-Driven Development) 권장**:

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트 통과하는 최소 코드 작성
3. **Refactor**: 코드 리팩토링 (테스트는 계속 통과)

```typescript
// 1. Red: 실패하는 테스트
test('컴포넌트 복제 버튼이 동작해야 함', async ({ page }) => {
  await page.goto('/v2')
  await page.getByRole('button', { name: 'Load Sample' }).click()

  // 컴포넌트 선택
  const component = page.locator('canvas').first()
  await component.click()

  // 복제 버튼 클릭 (아직 구현 안 됨 → 실패)
  await page.getByRole('button', { name: 'Duplicate' }).click()

  // 컴포넌트 수 증가 확인
  await expect(page.locator('header').getByText(/\d+ components/)).toContainText('2')
})

// 2. Green: 구현
// store/layout-store-v2.ts에 duplicateComponent action 구현

// 3. Refactor: 코드 정리 (테스트는 계속 통과)
```

### CI/CD 통합

**GitHub Actions 예시** (`.github/workflows/e2e.yml`):

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 테스트 베스트 프랙티스

#### ✅ DO (해야 할 것)

1. **실제 사용자 플로우 테스트**
   ```typescript
   test('사용자가 레이아웃을 생성하고 Export할 수 있어야 함', async ({ page }) => {
     await page.goto('/v2')
     await page.getByRole('button', { name: 'Load Sample' }).click()
     await page.getByRole('button', { name: 'Generate Prompt' }).click()
     await expect(page.locator('[role="dialog"]')).toBeVisible()
   })
   ```

2. **명확한 테스트 이름**
   ```typescript
   // ✅ 좋은 예
   test('사용자가 Mobile에서 Desktop으로 브레이크포인트를 전환할 수 있어야 함', ...)

   // ❌ 나쁜 예
   test('브레이크포인트 테스트', ...)
   ```

3. **AAA 패턴 (Arrange-Act-Assert)**
   ```typescript
   test('컴포넌트 삭제', async ({ page }) => {
     // Arrange: 초기 상태 설정
     await page.goto('/v2')
     await page.getByRole('button', { name: 'Load Sample' }).click()

     // Act: 동작 수행
     const deleteButton = page.getByRole('button', { name: 'Delete' })
     await deleteButton.click()

     // Assert: 결과 검증
     await expect(page.locator('header').getByText(/0 components/)).toBeVisible()
   })
   ```

4. **Accessibility 검증 포함**
   ```typescript
   test('모든 버튼이 접근 가능해야 함', async ({ page }) => {
     await page.goto('/v2')

     // role과 name으로 찾을 수 있어야 함
     await expect(page.getByRole('button', { name: 'Load Sample' })).toBeVisible()
     await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible()
   })
   ```

#### ❌ DON'T (하지 말아야 할 것)

1. **절대 경로 하드코딩**
   ```typescript
   // ❌ 나쁜 예
   await page.goto('http://localhost:3000/v2')

   // ✅ 좋은 예
   await page.goto('/v2')  // baseURL 사용
   ```

2. **임의의 대기 시간**
   ```typescript
   // ❌ 나쁜 예
   await page.waitForTimeout(5000)

   // ✅ 좋은 예
   await expect(element).toBeVisible({ timeout: 5000 })
   ```

3. **테스트 간 의존성**
   ```typescript
   // ❌ 나쁜 예
   test('컴포넌트 추가', async ({ page }) => {
     // 전역 변수에 저장
     globalComponentId = '...'
   })

   test('컴포넌트 삭제', async ({ page }) => {
     // 이전 테스트의 globalComponentId 사용
   })

   // ✅ 좋은 예: 각 테스트가 독립적으로 실행 가능
   ```

### 테스트 리뷰 체크리스트

새로운 테스트 작성 시 다음을 확인하세요:

```markdown
## 테스트 리뷰 체크리스트
- [ ] 테스트 이름이 명확한가? (무엇을, 어떻게, 결과는)
- [ ] AAA 패턴을 따르는가? (Arrange-Act-Assert)
- [ ] 적절한 Selector를 사용하는가? (Role 우선)
- [ ] 하드코딩된 대기 시간이 없는가?
- [ ] 테스트가 독립적으로 실행 가능한가?
- [ ] Edge case를 고려했는가?
- [ ] 실패 시 디버깅이 쉬운가? (명확한 에러 메시지)
- [ ] beforeEach로 초기화하는가?
- [ ] 실제 브라우저에서 수동 검증했는가?
```

### 테스트 유지보수

#### 정기 리뷰 (월 1회)

```markdown
## 테스트 유지보수 체크리스트
- [ ] Skip된 테스트 재활성화 시도 (test.describe.skip → test.describe)
- [ ] 깨진 테스트 수정
- [ ] 중복 테스트 제거
- [ ] 느린 테스트 최적화 (timeout 확인)
- [ ] Deprecated API 업데이트
- [ ] 새로운 기능에 대한 테스트 추가
```

#### 테스트 실패 시 대응

1. **로컬에서 재현**: `pnpm test:e2e:headed`
2. **Trace 확인**: 스크린샷, DOM, 네트워크
3. **로그 확인**: 콘솔 에러, 네트워크 에러
4. **수동 재현**: 실제 브라우저에서 동일 플로우
5. **수정 후 재검증**: 테스트 통과 확인

## 샘플 데이터

**lib/sample-data-v2.ts**에 4가지 실제 레이아웃 샘플이 있습니다:
1. **github**: GitHub 스타일 (Header + Sidebar + Main)
2. **dashboard**: 대시보드 레이아웃 (Fixed Header + Side Menu + Content)
3. **marketing**: 마케팅 사이트 (Sticky Header + Hero + Features + Footer)
4. **cardGallery**: 카드 갤러리 (Header + Grid Layout)

UI에서 `loadSampleSchema("github")`로 로드 가능합니다.

## 개발 시 주의사항

### Schema 정규화 필수

`addComponent`, `addComponentToLayout` 등 Schema를 수정하는 모든 작업 후에는 반드시 `normalizeSchemaV2()`를 호출하여 Breakpoint Inheritance를 적용해야 합니다.

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
const normalizedSchema = normalizeSchemaV2(updatedSchema)
```

### V2 타입 사용

V1 타입 (LaydlerSchemaV1, LayoutStoreV1 등)은 레거시이며 사용하지 마세요. 항상 V2 타입을 사용하세요.

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

이 패턴은 `normalizeSchemaV2()`에서 자동 처리되므로, 사용자는 변경된 부분만 입력하면 됩니다.

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

`lib/component-library-v2.ts`의 `COMPONENT_LIBRARY` 배열에 추가하세요. Template은 반드시 `positioning`, `layout` 필드를 포함해야 합니다.

### AI Prompt Template 수정

`lib/prompt-templates-v2.ts`에서 framework별 template을 수정할 수 있습니다. System prompt, component section, layout section, instructions section으로 구분됩니다.

## 🚨 필수 개발 워크플로우 (MANDATORY)

**모든 작업은 반드시 다음 워크플로우를 따라야 합니다. 이 프로세스는 품질 보증과 컨텍스트 유지를 위해 필수입니다.**

### 1. Plan First (계획 수립)

**모든 작업 시작 전에 반드시 계획을 수립하세요.**

```markdown
## 작업 계획
- [ ] Phase 1: 요구사항 분석 및 관련 파일 파악
- [ ] Phase 2: 구현 설계 및 아키텍처 검토
- [ ] Phase 3: 코드 작성 및 단위 검증
- [ ] Phase 4: 통합 테스트 및 E2E 검증
- [ ] Phase 5: 문서화 및 컨텍스트 저장
```

**계획 작성 규칙**:
- 최소 3개 이상의 Phase로 구성
- 각 Phase는 검증 가능한 단위로 분할
- 예상 소요 시간 및 리스크 명시
- Phase 간 의존성 명확히 표시

### 2. Task Breakdown (태스크 분해)

**각 Phase를 구체적인 Task로 분해하세요.**

```markdown
## Phase 1: 요구사항 분석
- [ ] Task 1.1: Schema V2 타입 정의 확인 (types/schema-v2.ts)
- [ ] Task 1.2: 기존 validation 로직 분석 (lib/schema-validation-v2.ts)
- [ ] Task 1.3: 영향받는 컴포넌트 목록 작성
- [ ] Task 1.4: 테스트 케이스 시나리오 설계

## Phase 2: 구현 설계
- [ ] Task 2.1: 새로운 타입 인터페이스 설계
- [ ] Task 2.2: Zustand store action 설계
- [ ] Task 2.3: Validation rule 설계
- [ ] Task 2.4: 에러 핸들링 전략 수립
```

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
pnpm lint  # 린트 통과 확인

# TypeScript 타입 검증
npx tsc --noEmit

# Schema 관련 작업 시
npx tsx scripts/validate-schema-v2.ts
```

**검증 실패 시**:
- 다음 Task로 절대 진행하지 마세요
- 실패 원인 분석 → 수정 → 재검증
- 3회 이상 실패 시 접근 방법 재검토

#### ✅ Phase Level 검증

```bash
# Phase 완료 시 통합 검증
pnpm build  # 빌드 성공 확인

# 관련 E2E 테스트 실행
pnpm test:e2e -- e2e/v2-02-panels.spec.ts

# 전체 E2E 테스트 (기능 추가 시 필수)
pnpm test:e2e

# Dev 서버 동작 확인
pnpm dev
# → http://localhost:3000 접속하여 UI 동작 검증
```

**Phase 완료 기준**:
- 모든 Task 완료 체크
- 빌드 성공 (pnpm build)
- 관련 테스트 통과 (기존 테스트 깨지지 않음)
- 새로운 기능의 E2E 테스트 작성 및 통과 (기능 추가 시)
- 수동 UI 검증 완료 (해당 시)

#### ✅ 테스트 작성 필수 시점

**다음 작업 시 E2E 테스트 반드시 작성**:

1. **새로운 UI 기능 추가**
   ```markdown
   - [ ] Task 3.1: 기능 구현 (예: 컴포넌트 복제 버튼)
   - [ ] Task 3.2: E2E 테스트 작성 (e2e/v2-05-component-duplication.spec.ts)
   - [ ] Task 3.3: 테스트 통과 확인
   ```

2. **사용자 플로우 변경**
   ```markdown
   - [ ] Task 2.1: 플로우 수정 (예: Export 모달 개선)
   - [ ] Task 2.2: 기존 테스트 업데이트 (e2e/v2-04-export.spec.ts)
   - [ ] Task 2.3: 새로운 시나리오 추가
   ```

3. **버그 수정**
   ```markdown
   - [ ] Task 1.1: 버그 재현 테스트 작성 (실패하는 테스트)
   - [ ] Task 1.2: 버그 수정
   - [ ] Task 1.3: 테스트 통과 확인 (회귀 방지)
   ```

**테스트 작성 생략 가능** (예외):
- 내부 리팩토링 (동작 변경 없음)
- 타입 정의 추가
- 문서화 작업
- 스타일 변경 (CSS만)

### 4. Documentation & Context Preservation (문서화 및 컨텍스트 보존)

**Phase 완료 시마다 반드시 문서화하세요.**

#### 📝 Phase Summary 작성

**docs/dev-log/** 디렉토리에 작업 로그 작성:

```markdown
# Dev Log: [작업명] - [날짜]

## Phase 1: 요구사항 분석 ✅
- **완료 시간**: 2024-01-15 10:30
- **주요 발견사항**:
  - Schema V2는 Component Independence 원칙 기반
  - normalizeSchemaV2()가 Breakpoint Inheritance 처리
  - validation은 PascalCase naming 강제
- **영향받는 파일**:
  - types/schema-v2.ts (타입 정의)
  - lib/schema-validation-v2.ts (검증 로직)
  - store/layout-store-v2.ts (상태 관리)
- **다음 Phase 전제조건**: Schema 구조 이해 완료

## Phase 2: 구현 설계 ✅
- **완료 시간**: 2024-01-15 12:00
- **설계 결정사항**:
  1. ComponentPositioning에 새로운 type 추가
  2. Validation rule 확장 (semantic tag 검증 강화)
  3. Error message 한글화
- **검증 완료**:
  - TypeScript 컴파일 통과
  - 기존 테스트 모두 통과
- **리스크**: 기존 샘플 데이터 호환성 확인 필요
```

#### 📚 Context File 업데이트

**중요 결정사항은 CLAUDE.md나 별도 context 파일에 기록**:

```markdown
## Context: [기능명] Implementation

### 핵심 개념
- **문제**: 기존 방식의 한계점 설명
- **해결**: 새로운 접근 방법 설명
- **근거**: 왜 이 방법을 선택했는지

### 중요 파일 및 역할
- `lib/schema-validation-v2.ts`: 검증 로직, line 150-200 참조
- `store/layout-store-v2.ts`: normalizeSchemaV2() 호출 패턴, line 145

### 주의사항
- normalizeSchemaV2() 누락 시 Breakpoint Inheritance 동작 안 함
- PascalCase 검증 실패 시 명확한 에러 메시지 제공 필요

### 테스트 시나리오
1. 정상 케이스: 모든 필드 올바른 값
2. 에러 케이스: Component name이 camelCase
3. 경계 케이스: Breakpoint 없는 상태에서 추가

### 다음 작업자를 위한 힌트
- Schema 수정 시 반드시 normalizeSchemaV2() 호출
- Validation 추가 시 ValidationError/Warning 타입 사용
- E2E 테스트는 실제 UI 동작 기반으로 작성
```

### 5. Gate Keeping (게이트 키핑)

**다음 Phase로 이동하기 전 체크리스트:**

```markdown
## Phase 완료 체크리스트 (Gate)
- [ ] 모든 Task 완료 확인
- [ ] 린트 통과 (pnpm lint)
- [ ] 빌드 성공 (pnpm build)
- [ ] TypeScript 타입 체크 통과 (npx tsc --noEmit)
- [ ] 관련 테스트 통과 (pnpm test:e2e)
- [ ] Schema 검증 통과 (해당 시)
- [ ] Dev 서버 정상 동작 확인 (해당 시)
- [ ] Phase Summary 문서 작성 완료
- [ ] Context 파일 업데이트 완료
- [ ] Git commit 완료 (의미 있는 단위)
```

**⚠️ 하나라도 미완료 시 다음 Phase 진행 금지**

### 6. Session Context Maintenance (세션 컨텍스트 유지)

**장시간 작업 시 컨텍스트 손실 방지:**

#### 30분마다 Checkpoint

```markdown
## Checkpoint: [시간]
- **현재 Phase**: Phase 2 - Task 2.3 진행 중
- **완료된 작업**: Task 2.1, 2.2 완료
- **현재 상태**: Validation rule 작성 중
- **다음 할 일**: Task 2.3 완료 → Task 2.4 시작
- **기억해야 할 것**:
  - normalizeSchemaV2()는 모든 Schema 수정 후 호출
  - PascalCase 검증은 regex: /^[A-Z][a-zA-Z0-9]*$/
  - 테스트 파일: e2e/v2-03-breakpoints.spec.ts
```

#### Context Loss 복구 프로토콜

**세션 재개 시 (새로운 대화 시작 등):**

1. **CLAUDE.md 재확인**: 아키텍처 재숙지
2. **최신 Dev Log 읽기**: 마지막 작업 상태 파악
3. **Git log 확인**: 최근 변경사항 확인
4. **진행 중인 Plan 확인**: 다음 Task 식별
5. **검증 재수행**: 현재 상태 확인 (lint, build, test)

### 7. Quality Gates (품질 게이트)

**최종 완료 전 필수 통과 항목:**

```bash
# Gate 1: 코드 품질
pnpm lint
npx tsc --noEmit

# Gate 2: 기능 검증
pnpm build
pnpm test:e2e

# Gate 3: Schema 일관성 (Schema 관련 작업 시)
npx tsx scripts/validate-schema-v2.ts

# Gate 4: 수동 검증
pnpm dev
# → 브라우저에서 실제 사용자 플로우 테스트
```

**모든 Gate 통과 시에만 작업 완료로 간주**

## 워크플로우 예시

### Example: 새로운 Component Type 추가

```markdown
## Plan: "grid-item" Positioning Type 추가

### Phase 1: 분석 (30분)
- [ ] Task 1.1: ComponentPositioning 타입 구조 분석
- [ ] Task 1.2: 기존 positioning type 사용 패턴 조사
- [ ] Task 1.3: grid-item이 필요한 use case 정의
- [ ] Task 1.4: 영향받는 파일 목록 작성
- **검증**: 타입 구조 이해 완료, use case 명확화

### Phase 2: 타입 정의 (20분)
- [ ] Task 2.1: types/schema-v2.ts에 "grid-item" 추가
- [ ] Task 2.2: ComponentPositioning 인터페이스 확장
- **검증**: TypeScript 컴파일 통과

### Phase 3: Validation (30분)
- [ ] Task 3.1: lib/schema-validation-v2.ts 업데이트
- [ ] Task 3.2: grid-item 전용 validation rule 추가
- [ ] Task 3.3: 에러 메시지 작성
- **검증**: Schema validation 테스트 통과

### Phase 4: Store 통합 (40분)
- [ ] Task 4.1: store/layout-store-v2.ts action 업데이트
- [ ] Task 4.2: updateComponentPositioning 테스트
- **검증**: Dev 서버 정상 동작, UI 반영 확인

### Phase 5: 테스트 및 문서화 (50분)
- [ ] Task 5.1: E2E 테스트 케이스 추가
- [ ] Task 5.2: sample-data-v2.ts에 예시 추가
- [ ] Task 5.3: Dev Log 작성
- [ ] Task 5.4: CLAUDE.md 업데이트
- **검증**: 전체 테스트 통과, 문서화 완료

### 최종 검증
- [ ] pnpm lint ✅
- [ ] pnpm build ✅
- [ ] pnpm test:e2e ✅
- [ ] npx tsx scripts/validate-schema-v2.ts ✅
- [ ] Dev 서버 수동 테스트 ✅
- [ ] 문서화 완료 ✅
```

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

**30분마다:**
```
[ ] Checkpoint 작성 (현재 상태 기록)
```

**최종 완료 시:**
```
[ ] 모든 Quality Gate 통과
[ ] 전체 문서화 완료
[ ] Dev Log 최종 업데이트
```

## 문서 참조

- **docs/schema-v2-examples.md**: Schema V2 예시 및 생성 코드 샘플
- **docs/prompts-v2/**: 각 샘플 레이아웃별 AI 프롬프트 예시
- **docs/dev-log/**: 개발 작업 로그 및 컨텍스트 (작업 시 생성)
