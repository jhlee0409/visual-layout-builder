# 📊 LAYLDER MVP 개발 진행 상황

> **문서 목적:** 각 단계별로 완료된 작업, 생성된 파일, 중요한 기술적 결정사항을 상세히 기록합니다. 컨텍스트 손실 시 이 문서를 참조하여 빠르게 상황을 파악할 수 있습니다.

---

## ✅ Step 0.1: 프로젝트 초기화 (COMPLETED)

**날짜:** 2024-11-11
**커밋:** `e5c3a3c`
**브랜치:** `claude/laylder-mvp-architecture-011CV1Gkw2n2Vg2S6nbATtnE`

### 생성된 파일
```
/
├── package.json              # 의존성 및 스크립트
├── pnpm-lock.yaml
├── tsconfig.json             # TypeScript 설정
├── next.config.ts            # Next.js 설정
├── tailwind.config.ts        # Tailwind + shadcn/ui 테마
├── postcss.config.js
├── .eslintrc.json
├── .gitignore
├── README.md
├── components.json           # shadcn/ui 설정
├── app/
│   ├── layout.tsx           # Root Layout
│   ├── page.tsx             # 홈 페이지
│   └── globals.css          # Tailwind + CSS 변수
└── lib/
    └── utils.ts             # cn() 헬퍼
```

### 기술 스택 (확정)
- **Framework:** Next.js 15.5.6 (App Router)
- **React:** 19.2.0
- **TypeScript:** 5.9.3
- **Package Manager:** pnpm 10.20.0
- **Styling:** Tailwind CSS 3.4.18 + shadcn/ui
- **State:** Zustand 5.0.8
- **DnD:** @dnd-kit/core 6.3.1
- **Validation:** Zod 3.25.76

### 주요 결정사항
1. **Next.js App Router 채택**: 서버 컴포넌트 활용 + 파일 기반 라우팅
2. **shadcn/ui 사용**: 복사/붙여넣기 방식의 UI 컴포넌트 (번들 사이즈 최적화)
3. **Path alias `@/*`**: 절대 경로 임포트로 가독성 향상
4. **CSS 변수 기반 테마**: Light/Dark 모드 지원 준비

### 검증
- ✅ `pnpm build` 성공
- ✅ TypeScript 컴파일 오류 없음

---

## ✅ Step 1.1: JSON 스키마 TypeScript 타입 정의 (COMPLETED)

**날짜:** 2024-11-11
**커밋:** `9dcb8bd`

### 생성된 파일
```
types/
└── schema.ts                 # 모든 타입 정의 (159줄)

lib/
├── validation.ts             # Zod 스키마 (164줄)
├── sample-data.ts            # 샘플 레이아웃 4개 (299줄)
├── schema-utils.ts           # 유틸리티 함수 (171줄)
└── test-validation.ts        # 검증 테스트

package.json
└── devDependencies: tsx 추가
```

### 핵심 타입 정의

#### 1. Component
```typescript
interface Component {
  id: string              // c1, c2, c3... (자동 생성)
  name: string            // PascalCase (예: GlobalHeader)
  semanticTag: SemanticTag // header, nav, main, aside, footer, section, article, div
  props?: Record<string, unknown>
}
```

#### 2. Breakpoint
```typescript
interface Breakpoint {
  name: string      // mobile, tablet, desktop (커스터마이징 가능)
  minWidth: number  // 0, 768, 1024 (모바일 우선)
}
```

#### 3. GridLayout
```typescript
interface GridLayout {
  rows: string        // "60px auto 1fr 80px"
  columns: string     // "1fr" or "250px 1fr 250px"
  areas: string[][]   // [["c1"], ["c2"], ["c3"]]
}
```

#### 4. LaydlerSchema (최상위)
```typescript
interface LaydlerSchema {
  schemaVersion: string
  components: Component[]
  breakpoints: Breakpoint[]
  layouts: BreakpointLayouts  // { mobile: {grid}, tablet: {grid}, ... }
}
```

### Zod 검증 규칙
1. **Component ID**: Regex `^c\d+$` (c1, c2, c3...)
2. **Component name**: Regex `^[A-Z][a-zA-Z0-9]*$` (PascalCase)
3. **minWidth**: `>= 0`
4. **Component references**: `validateComponentReferences()`로 그리드의 모든 ID가 components 배열에 존재하는지 확인

### 샘플 데이터
1. **`sampleSchema`**: PRD 4장 예시 (Header + Sidebar + Main + Ad)
2. **`simpleSingleColumnSchema`**: 블로그용 단순 레이아웃
3. **`dashboardLayoutSchema`**: 대시보드 UI
4. **`productPageSchema`**: 이커머스 상품 페이지

### 검증 결과
```bash
$ pnpm tsx lib/test-validation.ts
✅ Test 1: PRD sample schema 검증 통과
✅ Test 2: Simple schema 검증 통과
✅ Test 3: Component reference 검증 통과
✅ Test 4: 빈 components 배열 거부
✅ Test 5: 잘못된 ID 형식 거부
✅ Test 6: 존재하지 않는 참조 감지
🎉 6/6 PASS
```

### 주요 결정사항
1. **`BreakpointLayouts`를 `Record<string, {...}>` 타입으로 변경**: 커스텀 breakpoint 지원
2. **Component ID 자동 생성 로직**: `generateComponentId()` 함수로 다음 ID 계산
3. **Component visibility 체크**: `getComponentVisibility()`로 각 breakpoint별 컴포넌트 가시성 추적
4. **Grid 구조 검증**: `isValidGridStructure()`로 모든 row가 같은 column 수를 가지는지 확인

### PRD 연관성
- ✅ PRD 4장 완벽 구현
- ✅ 프레임워크 중립성 보장 (순수 데이터 구조)
- ✅ 시맨틱 우선 (SemanticTag 타입)
- ✅ 반응형 아키텍처 (각 breakpoint별 독립 레이아웃)

---

## ✅ Step 1.2: Zustand 스토어 설계 (COMPLETED)

**날짜:** 2024-11-11
**커밋:** (pending)

### 생성된 파일
```
store/
├── layout-store.ts           # Zustand 스토어 (350줄)
└── test-store.ts             # 스토어 테스트

docs/
├── MASTER_PLAN.md            # 전체 개발 로드맵
└── PROGRESS.md               # 단계별 진행 상황 (이 문서)
```

### 스토어 구조

#### State
```typescript
interface LayoutState {
  schema: LaydlerSchema              // 전체 레이아웃 스키마
  currentBreakpoint: string          // 현재 활성 뷰 (mobile/tablet/desktop)
  selectedComponentId: string | null // 속성 패널에서 편집 중인 컴포넌트
}
```

#### Actions (18개)

**Component CRUD:**
- `addComponent(component)` - 새 컴포넌트 추가 (ID 자동 생성)
- `updateComponent(id, updates)` - 컴포넌트 속성 수정
- `deleteComponent(id)` - 컴포넌트 삭제 (모든 레이아웃에서 제거)

**Grid Layout:**
- `updateGridLayout(breakpoint, layout)` - 전체 그리드 레이아웃 교체
- `updateGridAreas(breakpoint, areas)` - 그리드 areas만 수정 (DnD용)

**Breakpoint Management:**
- `setCurrentBreakpoint(breakpoint)` - 뷰 전환
- `addBreakpoint(breakpoint)` - 커스텀 breakpoint 추가 (자동 정렬)
- `updateBreakpoint(oldName, newBreakpoint)` - breakpoint 수정 (이름 변경 시 layouts 키도 갱신)
- `deleteBreakpoint(name)` - breakpoint 삭제 (최소 1개 유지)

**Selection:**
- `setSelectedComponentId(id)` - 컴포넌트 선택/해제

**Schema Operations:**
- `exportSchema()` - 스키마 깊은 복사 후 반환
- `importSchema(schema)` - 외부 스키마 로드
- `resetSchema()` - 빈 스키마로 초기화
- `loadSampleSchema()` - PRD 예시 스키마 로드

#### Selectors (4개)
React 컴포넌트에서 사용할 파생 상태:
- `useCurrentLayout()` - 현재 breakpoint의 레이아웃
- `useCurrentBreakpointConfig()` - 현재 breakpoint 설정
- `useSelectedComponent()` - 선택된 컴포넌트 객체
- `useComponentsInCurrentLayout()` - 현재 레이아웃에 표시되는 컴포넌트 목록

### 주요 결정사항

1. **Devtools 미들웨어만 활성화**
   - 개발 환경에서만 Redux DevTools 연동
   - 각 action에 명확한 이름 부여 (예: "addComponent", "updateGridLayout")

2. **Immer 미들웨어 미사용**
   - 스토어 로직이 비교적 단순하여 수동 불변성 관리
   - 번들 사이즈 최적화

3. **Persist 미들웨어는 향후 추가**
   - MVP에서는 localStorage 저장 미지원
   - Phase 2에서 "프로젝트 저장" 기능 추가 시 구현 예정
   - 현재는 주석으로 placeholder 남김

4. **Component ID 자동 생성**
   - `addComponent` 호출 시 `generateComponentId()`로 다음 ID 계산
   - 사용자는 name과 semanticTag만 제공

5. **deleteComponent의 cascade 동작**
   - 컴포넌트 삭제 시 모든 breakpoint의 grid areas에서 해당 ID 제거
   - 선택된 컴포넌트였다면 selection도 해제

6. **Breakpoint 자동 정렬**
   - `addBreakpoint`와 `updateBreakpoint` 시 minWidth 기준 오름차순 정렬
   - UI에서 항상 정렬된 순서로 표시 보장

### 테스트 결과
```bash
$ pnpm tsx store/test-store.ts
✅ Test 1: Initial state (빈 스키마)
✅ Test 2: Sample schema 로드 (4개 컴포넌트)
✅ Test 3: 컴포넌트 추가 (c5 자동 생성)
✅ Test 4: 컴포넌트 수정 (name, props 변경)
✅ Test 5: 컴포넌트 선택
✅ Test 6: Breakpoint 전환 (mobile → desktop)
✅ Test 7: 커스텀 breakpoint 추가 (wide: 1440px)
✅ Test 8: Grid layout 수정
✅ Test 9: Schema export (깊은 복사)
✅ Test 10: 컴포넌트 삭제
✅ Test 11: Schema reset
✅ Test 12: Schema import
🎉 12/12 tests PASS
```

### 문서화 시스템 구축

**추가 지시사항 반영**: "컨텍스트 유지를 위한 문서 업데이트"

1. **`/docs/MASTER_PLAN.md`**: 전체 18단계 로드맵 + PRD 체크리스트
2. **`/docs/PROGRESS.md`**: 각 단계별 상세 구현 내역 (이 문서)

**문서화 원칙:**
- 각 단계 완료 시 PROGRESS.md 업데이트
- 중요한 기술적 결정사항 기록
- 컨텍스트 압축 대비 참조 문서 유지

### PRD 연관성
- ✅ PRD 3장 준비 완료: UI 컴포넌트가 사용할 상태 관리 기반 마련
- ✅ 반응형 제어판(3.3) 구현 준비: `setCurrentBreakpoint`, `addBreakpoint` 완성
- ✅ 컴포넌트 속성 패널(3.2) 구현 준비: `addComponent`, `updateComponent` 완성
- ✅ 그리드 캔버스(3.1) 구현 준비: `updateGridAreas` 완성

### Phase 1 진행 상황
- ✅ Phase 1.1: 데이터 모델 정의
- ✅ Phase 1.2: Zustand 스토어 설계 (현재 완료)
- ⏳ Phase 2: UI 컴포넌트 구현 (다음 단계)

---

## ✅ Step 2.1: 그리드 캔버스 구현 (COMPLETED)

**날짜:** 2024-11-11
**커밋:** (pending)

### 생성된 파일
```
components/
├── ui/
│   ├── button.tsx            # Button 컴포넌트 (shadcn/ui)
│   ├── card.tsx              # Card 컴포넌트 (shadcn/ui)
│   └── badge.tsx             # Badge 컴포넌트 (shadcn/ui)
└── grid-canvas/
    ├── GridCanvas.tsx        # 메인 캔버스 컴포넌트 (130줄)
    ├── GridCell.tsx          # 개별 셀 컴포넌트 (60줄)
    ├── GridToolbar.tsx       # 그리드 제어 툴바 (130줄)
    └── index.ts              # 내보내기

app/
└── page.tsx                  # 홈 페이지 (GridCanvas 통합)

package.json
└── dependencies: @radix-ui/react-slot 추가
```

### 핵심 구현 내용

#### 1. GridCanvas.tsx - 메인 캔버스
**기능:**
- 현재 breakpoint의 grid layout을 시각적으로 렌더링
- CSS Grid `grid-template-rows`, `grid-template-columns`, `grid-area` 활용
- 컴포넌트 선택 기능 (클릭 시 selectedComponentId 업데이트)
- 병합된 셀 감지 및 표시

**주요 로직:**
```typescript
// Merged cell 감지: 같은 컴포넌트 ID의 첫 번째 셀만 렌더링
const isMergedCell = (rowIndex, colIndex) => {
  const currentId = areas[rowIndex][colIndex]
  // 이전에 같은 ID가 나타났으면 merged cell
  for (let r = 0; r < areas.length; r++) {
    for (let c = 0; c < areas[r].length; c++) {
      if (areas[r][c] === currentId) {
        if (r < rowIndex || (r === rowIndex && c < colIndex)) {
          return true // Skip rendering
        }
        return false // First occurrence
      }
    }
  }
}

// Grid-area 계산: 병합된 영역의 범위 계산
const getGridArea = (rowIndex, colIndex) => {
  const currentId = areas[rowIndex][colIndex]
  let minRow = rowIndex, maxRow = rowIndex
  let minCol = colIndex, maxCol = colIndex

  // 같은 ID를 가진 모든 셀의 min/max 찾기
  for (let r = 0; r < areas.length; r++) {
    for (let c = 0; c < areas[r].length; c++) {
      if (areas[r][c] === currentId) {
        minRow = Math.min(minRow, r)
        maxRow = Math.max(maxRow, r)
        minCol = Math.min(minCol, c)
        maxCol = Math.max(maxCol, c)
      }
    }
  }

  // CSS grid-area: row-start / col-start / row-end / col-end (1-based)
  return `${minRow + 1} / ${minCol + 1} / ${maxRow + 2} / ${maxCol + 2}`
}
```

#### 2. GridCell.tsx - 개별 셀
**기능:**
- 빈 셀 vs 배치된 컴포넌트 구분
- 컴포넌트 ID와 이름 표시 (Badge + 텍스트)
- 선택 상태 시각화 (border + ring)
- 클릭으로 선택/해제

**스타일:**
- 빈 셀: 점선 테두리, 회색 배경, 좌표 표시 [row,col]
- 배치된 셀: 실선 테두리, 흰색 배경, 컴포넌트 정보 표시
- 선택된 셀: primary 색상 테두리 + ring 효과

#### 3. GridToolbar.tsx - 그리드 제어
**기능:**
- 현재 breakpoint 표시 (Badge)
- 그리드 크기 표시 (rows × cols)
- 행/열 추가/삭제 버튼
- 최소 1행 1열 유지 (삭제 버튼 비활성화)

**동작:**
- `+ Row`: 마지막에 새 행 추가 (`1fr` 추가, 빈 셀 배열 추가)
- `- Row`: 마지막 행 제거 (최소 1행 유지)
- `+ Column`: 모든 행에 빈 셀 추가 (`1fr` 추가)
- `- Column`: 모든 행의 마지막 셀 제거 (최소 1열 유지)

#### 4. 홈 페이지 통합
**추가 기능:**
- `Load Sample` 버튼: PRD 예시 스키마 로드 (4개 컴포넌트)
- `Reset` 버튼: 빈 스키마로 초기화
- 컴포넌트 개수 표시

### 주요 결정사항

1. **shadcn/ui 수동 설치**
   - 환경 제한으로 CLI 접근 불가
   - Button, Card, Badge 컴포넌트를 수동으로 생성
   - `@radix-ui/react-slot` 의존성 추가

2. **React Hook ESLint 오류 해결**
   - 초기 버전: early return 이후 `useMemo` 호출 → 오류
   - 해결: `useMemo`를 일반 함수로 변경
   - React Hook은 조건부로 호출할 수 없음

3. **DnD 통합 보류**
   - Step 2.1에서는 기본 렌더링과 선택 기능만 구현
   - @dnd-kit 통합은 다음 단계(Step 2.5 또는 별도)로 연기
   - 현재는 GridToolbar의 행/열 추가/삭제로 그리드 편집 가능

4. **Grid-area 계산 로직**
   - PRD 예시처럼 하나의 컴포넌트가 여러 셀 차지 가능
   - 같은 컴포넌트 ID의 모든 셀을 찾아 min/max 계산
   - CSS `grid-area` 속성으로 병합 영역 표시

5. **600px 고정 높이**
   - 캔버스 높이를 `h-[600px]`로 고정
   - 스크롤 없이 전체 그리드 한눈에 확인 가능
   - 향후 사용자 커스터마이징 가능하도록 개선 예정

### 테스트 결과
```bash
$ pnpm tsc --noEmit
# ✅ TypeScript 컴파일 오류 없음

$ pnpm build
# ✅ Next.js 프로덕션 빌드 성공
# Route (app): / - 13 kB (First Load JS: 115 kB)
```

### 구현된 기능 (PRD 3.1 체크)
- ✅ CSS Grid 기반 캔버스 렌더링
- ✅ 각 셀에 컴포넌트 ID 표시
- ✅ 빈 셀 vs 배치된 셀 시각적 구분
- ✅ 컴포넌트 클릭으로 선택/해제
- ✅ 그리드 행/열 추가/삭제
- ✅ 병합된 셀 (merged area) 올바르게 표시
- ⏸️ DnD로 셀 병합 (다음 단계로 연기)
- ⏸️ 컴포넌트 드래그로 배치/이동 (다음 단계로 연기)

### PRD 연관성
- ✅ **PRD 3.1 (그리드 캔버스)**: 핵심 렌더링 기능 구현 완료
- ✅ Store 연동: `useCurrentLayout`, `setSelectedComponentId` 사용
- ✅ 반응형 준비: 현재 breakpoint의 레이아웃만 표시 (뷰 전환은 다음 단계)

### 미구현 항목 (향후 작업)
1. **DnD 기능** (Step 2.5 예정)
   - 드래그로 컴포넌트 배치
   - 드래그로 여러 셀 병합
   - 컴포넌트 이동/제거
2. **Breakpoint 전환 UI** (Step 2.3 예정)
   - 모바일/태블릿/데스크톱 버튼
   - 뷰포트 미리보기
3. **Component 속성 패널** (Step 2.2 예정)
   - 선택된 컴포넌트 속성 편집
   - 새 컴포넌트 추가 폼

### Phase 2 진행 상황
- ✅ Phase 2.1: 그리드 캔버스 구현 (현재 완료)
- ⏳ Phase 2.2: 컴포넌트 속성 패널 (다음 단계)

---

_최종 업데이트: Step 2.1 완료 시점_
_다음 업데이트: Step 2.2 시작 시_
