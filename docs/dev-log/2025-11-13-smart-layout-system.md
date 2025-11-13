# Dev Log: 스마트 레이아웃 배치 시스템 구현 - 2025-11-13

## 작업 개요

**목표**:
1. 컴포넌트 기본 그리드 크기를 1x1로 변경
2. positioning/layout 속성에 따라 Canvas에서 실제 프리뷰처럼 자동 배치되도록 개선

**완료 시간**: 2025-11-13
**커밋**: `5af63c1` - "Feat: 스마트 레이아웃 배치 시스템 구현"

---

## Phase 1: 현재 Canvas 그리드 시스템 분석 ✅

**완료 시간**: 10분

### 주요 발견사항

1. **기존 기본 그리드 크기**: `KonvaCanvas.tsx:348-349`
   ```typescript
   const defaultWidth = 4
   const defaultHeight = 3
   ```

2. **Canvas Layout 구조**:
   - `CanvasLayout`: x, y, width, height (그리드 기반 좌표)
   - `ResponsiveCanvasLayout`: breakpoint별 배치 정보 (mobile, tablet, desktop)

3. **현재 문제점**:
   - 모든 컴포넌트가 Canvas에서 자유롭게 배치 가능
   - `positioning` (sticky, fixed, static) 속성이 실제 배치에 반영되지 않음
   - 예: header(sticky)가 Canvas 중간에 배치될 수 있음 → 비현실적

4. **영향받는 파일**:
   - `types/schema.ts` - CanvasLayout, ResponsiveCanvasLayout 타입
   - `components/canvas/KonvaCanvas.tsx` - 드롭 시 기본 크기 설정
   - `lib/component-library.ts` - 템플릿 정의
   - `store/layout-store.ts` - 컴포넌트 추가 로직

---

## Phase 2: 2025년 기준 최신 웹 레이아웃 패턴 리서치 ✅

**완료 시간**: 15분

### 리서치 키워드
- Modern web layout patterns 2025
- CSS positioning best practices 2025
- Sticky header footer patterns 2025
- Fixed vs sticky positioning 2025

### 핵심 발견사항

#### 1. Sticky Positioning (position: sticky)
- **용도**: Navigation menus, table headers, sidebars
- **특징**: 스크롤 시 특정 위치에 도달하면 고정됨 (문서 흐름 유지)
- **요구사항**: `top`, `bottom`, `left`, `right` 중 하나 이상 설정 필요
- **주의사항**: 부모에 `overflow: hidden`이 있으면 작동 안 함
- **일반적 위치**:
  - Header: `top: 0`
  - Sidebar: `top: 4rem` (header 아래)

#### 2. Fixed Positioning (position: fixed)
- **용도**: Modal, floating buttons, fixed headers
- **특징**: 뷰포트 기준으로 완전히 고정 (문서 흐름에서 제거)
- **주의사항**: z-index 관리 필수, 콘텐츠 overlap 방지를 위한 margin/padding 필요
- **일반적 위치**:
  - Header: `top: 0`
  - Sidebar: `left: 0` 또는 `right: 0`

#### 3. Static Positioning (position: static)
- **용도**: Main content, Footer
- **특징**: 일반 문서 흐름
- **일반적 위치**:
  - Footer: 최하단 (Flexbox: `margin-top: auto` 또는 Grid: last row)
  - Main: 중앙, `flex-grow: 1`로 가용 공간 채우기

#### 4. Modern Layout Best Practices (2025)

**Flexbox Method (Most Popular)**:
```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex-grow: 1;
}
```

**Grid Method**:
```css
.wrapper {
  display: grid;
  grid-template-rows: auto 1fr auto; /* header, main, footer */
  min-height: 100vh;
}
```

### 배치 전략 정리

| Semantic Tag | Positioning  | Canvas 위치                    |
|--------------|--------------|--------------------------------|
| `header`     | sticky/fixed | 최상단 (y=0), 전체 너비        |
| `footer`     | static       | 최하단, 전체 너비              |
| `aside`      | sticky/fixed | 좌측 (x=0) 또는 우측 끝단      |
| `nav`        | sticky/fixed | 최상단 (header와 동일)         |
| `main`       | static       | 중앙 영역 (header/sidebar 고려)|
| 기타         | static       | 빈 공간에 순차 배치            |

---

## Phase 3: 컴포넌트 기본 그리드 크기를 1x1로 변경 ✅

**완료 시간**: 5분

### 변경 내용

**파일**: `components/canvas/KonvaCanvas.tsx`

```diff
- const defaultWidth = 4
- const defaultHeight = 3
+ const defaultWidth = 1
+ const defaultHeight = 1
```

### 변경 이유
1. **유연성 증가**: 1x1 기본 크기로 더 세밀한 레이아웃 조정 가능
2. **스마트 배치 준비**: semanticTag에 따라 적절한 크기로 자동 조정 예정
3. **2025년 패턴 반영**: 컴포넌트별 역할에 맞는 크기 적용

---

## Phase 4: positioning/layout 기반 스마트 배치 로직 구현 ✅

**완료 시간**: 40분

### 설계 결정사항

#### 1. 새로운 파일 생성: `lib/smart-layout.ts`

**이유**:
- 배치 로직을 Canvas 컴포넌트에서 분리 (Separation of Concerns)
- 재사용성 향상 (다른 컴포넌트에서도 사용 가능)
- 테스트 용이성

#### 2. 핵심 함수

##### `calculateSmartPosition()`
```typescript
export function calculateSmartPosition(
  template: ComponentTemplate,
  gridCols: number,
  gridRows: number,
  existingComponents: Component[],
  currentBreakpoint: string
): SmartPosition
```

**로직**:
1. **Header** (semanticTag === "header"):
   - 위치: `x: 0, y: 0`
   - 크기: `width: gridCols, height: 1` (전체 너비)

2. **Footer** (semanticTag === "footer"):
   - 위치: `x: 0, y: gridRows - 1` (최하단)
   - 크기: `width: gridCols, height: 1`

3. **Nav** (semanticTag === "nav", sticky/fixed):
   - Header 존재 시: `y: 1` (header 아래)
   - Header 없으면: `y: 0` (최상단)
   - 크기: `width: gridCols, height: 1`

4. **Sidebar** (semanticTag === "aside"):
   - 좌측 sidebar 미존재 시: `x: 0` (좌측 배치)
   - 좌측 sidebar 존재 시: `x: gridCols - sidebarWidth` (우측 배치)
   - 크기: `width: floor(gridCols / 4), height: gridRows - topOffset - 1`
   - topOffset: header/nav 고려

5. **Main** (semanticTag === "main"):
   - 위치: sidebar, header 고려하여 중앙 영역
   - 크기: 가용 공간 최대 활용
   - Footer 고려: `height: gridRows - topOffset - bottomOffset`

6. **기타** (section, article, div, form):
   - `findEmptySlot()` 호출하여 빈 공간 찾기
   - 크기: `1x1`

##### `findEmptySlot()`
```typescript
export function findEmptySlot(
  existingComponents: Component[],
  gridCols: number,
  gridRows: number,
  currentBreakpoint: string,
  width: number = 1,
  height: number = 1
): SmartPosition
```

**알고리즘**:
1. 위에서 아래로 (y축), 왼쪽에서 오른쪽으로 (x축) 스캔
2. 각 위치에서 collision 체크 (STRICT: 경계 접촉도 collision으로 간주)
3. 빈 공간 발견 시 즉시 반환
4. 빈 공간 없으면 가장 아래 컴포넌트 하단에 배치

##### `getRecommendedSize()`
```typescript
export function getRecommendedSize(
  semanticTag: SemanticTag,
  gridCols: number,
  gridRows: number
): { width: number; height: number }
```

**추천 크기**:
- `header`, `footer`, `nav`: 전체 너비 × 1 높이
- `aside`: 너비 1/4 × 전체 높이
- `main`: 너비 3/4 × 전체 높이
- `section`, `article`: 너비 1/2 × 높이 1/3
- `div`, `form`: 1x1

### KonvaCanvas.tsx 수정

**변경 전**:
```typescript
// Calculate position considering stage scale and position
const pointerX = e.clientX - containerRect.left
const pointerY = e.clientY - containerRect.top

let gridX = Math.floor((pointerX / stageScale - stagePosition.x) / CELL_SIZE)
let gridY = Math.floor((pointerY / stageScale - stagePosition.y) / CELL_SIZE)

const defaultWidth = 1
const defaultHeight = 1

gridX = Math.max(0, Math.min(gridX, gridCols - defaultWidth))
gridY = Math.max(0, Math.min(gridY, gridRows - defaultHeight))
```

**변경 후**:
```typescript
// Get fresh components in current layout for smart positioning (동기화)
const freshState = useLayoutStore.getState()
const freshCurrentLayout = freshState.schema.layouts[currentBreakpoint]
const freshComponentIds = new Set(freshCurrentLayout.components)
const freshComponentsInLayout = freshState.schema.components.filter((c) =>
  freshComponentIds.has(c.id)
)

// Calculate smart position based on semantic tag and positioning (2025 layout patterns)
const smartPosition = calculateSmartPosition(
  template,
  gridCols,
  gridRows,
  freshComponentsInLayout,
  currentBreakpoint
)

const gridX = smartPosition.x
const gridY = smartPosition.y
const defaultWidth = smartPosition.width
const defaultHeight = smartPosition.height
```

**핵심 변경**:
- **드롭 위치 무시**: 마우스 포인터 위치 대신 스마트 배치 로직 사용
- **semanticTag 기반**: 컴포넌트 역할에 따라 적절한 위치 자동 계산
- **기존 컴포넌트 고려**: header, sidebar 등 기존 요소를 고려하여 배치

---

## Phase 5: 코드 검증 및 커밋 ✅

**완료 시간**: 10분

### Git 작업

```bash
# 변경사항 확인
git status

# 스테이징
git add components/canvas/KonvaCanvas.tsx lib/smart-layout.ts

# 커밋
git commit -m "..."

# 푸시
git push -u origin claude/set-grid-default-one-by-one-011CV5PuAh6vAqUeEQzx9f1W
```

**커밋 ID**: `5af63c1`
**브랜치**: `claude/set-grid-default-one-by-one-011CV5PuAh6vAqUeEQzx9f1W`

### 변경 파일
- ✅ `lib/smart-layout.ts` (신규 생성, 313 lines)
- ✅ `components/canvas/KonvaCanvas.tsx` (수정, +9 -18 lines)

---

## Phase 6: 문서화 및 컨텍스트 저장 ✅

**완료 시간**: 진행 중

### 문서화 항목

1. **Dev Log 작성**: `docs/dev-log/2025-11-13-smart-layout-system.md` (현재 파일)
2. **CLAUDE.md 업데이트 예정**: 스마트 레이아웃 시스템 섹션 추가

---

## 검증 완료 항목

- ✅ TypeScript 타입 체크 (타입 에러 없음)
- ✅ Collision detection 로직 검증
- ✅ ResponsiveCanvasLayout 지원 확인
- ✅ Breakpoint별 독립적 배치 확인
- ✅ Git commit & push 성공

---

## 다음 작업자를 위한 힌트

### 사용 방법

1. **Library Panel에서 컴포넌트 드래그**:
   - Header: 자동으로 최상단 전체 너비에 배치
   - Footer: 자동으로 최하단 전체 너비에 배치
   - Sidebar: 좌측 또는 우측 끝단에 배치
   - Main: 중앙 영역에 배치 (header/sidebar 고려)

2. **스마트 배치 로직 수정**:
   - `lib/smart-layout.ts`의 `calculateSmartPosition()` 함수 수정
   - semanticTag별 조건문 추가/수정

3. **기본 크기 변경**:
   - `lib/smart-layout.ts`의 `getRecommendedSize()` 함수 수정

### 주의사항

1. **Collision Detection**:
   - 현재 STRICT 모드 (경계 접촉도 collision)
   - 필요 시 `findEmptySlot()`의 collision 로직 조정

2. **Responsive Support**:
   - Breakpoint 전환 시 각 breakpoint별 독립적인 배치 유지
   - `normalizeSchema()`가 Inheritance 처리

3. **Performance**:
   - `calculateSmartPosition()`은 드롭마다 호출됨
   - 대량 컴포넌트 시 성능 고려 필요

### 테스트 시나리오

1. **Header 추가**: 최상단에 배치되는지 확인
2. **Footer 추가**: 최하단에 배치되는지 확인
3. **Sidebar 추가**:
   - 첫 번째 Sidebar: 좌측 배치
   - 두 번째 Sidebar: 우측 배치
4. **Main 추가**: Header/Sidebar를 피해 중앙 영역 배치 확인
5. **기타 컴포넌트**: 빈 공간에 1x1 크기로 배치 확인
6. **Breakpoint 전환**: 각 breakpoint에서 독립적 배치 확인

---

## 참고 자료

### 2025년 웹 레이아웃 패턴
- [CSS Position Property Guide - CodeLucky](https://codelucky.com/css-position-property/)
- [Sticky Footer Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/How_to/Layout_cookbook/Sticky_footers)
- [Modern Layout Patterns - CSS-Tricks](https://css-tricks.com/how-to-use-css-grid-for-sticky-headers-and-footers/)

### 관련 파일
- `types/schema.ts` - Schema 타입 정의
- `lib/schema-utils.ts` - normalizeSchema()
- `store/layout-store.ts` - addComponent(), updateComponent()
- `components/canvas/ComponentNode.tsx` - 컴포넌트 렌더링

---

## 요약

**목표 달성**:
1. ✅ 기본 그리드 크기 1x1 변경
2. ✅ positioning/layout 기반 스마트 배치 시스템 구현
3. ✅ 2025년 최신 웹 레이아웃 패턴 반영

**핵심 개선사항**:
- Header는 항상 최상단
- Footer는 항상 최하단
- Sidebar는 좌측/우측 끝단
- Main은 중앙 영역 (가용 공간 최대 활용)
- 기타 컴포넌트는 빈 공간에 자동 배치

**기술적 성과**:
- 재사용 가능한 배치 로직 모듈화
- Collision detection 강화
- Responsive 지원
- Clean code & Type safety
