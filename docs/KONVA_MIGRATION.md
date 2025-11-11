# 🎨 Konva 캔버스 시스템 마이그레이션

> **문서 목적:** react-grid-layout → Konva 기반 무한 캔버스 시스템 전환 과정을 상세히 기록합니다.

**시작 날짜:** 2025-11-11
**시작 커밋:** `029af4d` (Phase 4 완료)
**롤백 대상:** `35d04f37` (Fix grid alignment and prevent selection)
**브랜치:** `claude/laylder-mvp-architecture-011CV1Gkw2n2Vg2S6nbATtnE`

---

## 📋 마이그레이션 이유

### 현재 문제점 (react-grid-layout)
- ❌ 고정 그리드 (12×20) → 자유도 부족
- ❌ 스크롤 발생 → UX 저해
- ❌ Pan & Zoom 불가능
- ❌ 무한 캔버스 불가능

### Konva 전환 목표
- ✅ 무한 캔버스 (Pan & Zoom)
- ✅ 동적 그리드 (필요에 따라 확장)
- ✅ 그리드 스냅 유지 (100px 셀 단위)
- ✅ 컴포넌트 D&D
- ✅ 라이브러리 → 캔버스 D&D
- ✅ 기존 패널 유지 (ComponentPanel, BreakpointPanel)

---

## 🏗️ 아키텍처 설계

### 컴포넌트 구조
```
┌─────────────────────────────────────────────────────────┐
│                    App Layout (기존)                      │
├──────────────────────┬──────────────────────────────────┤
│   GridCanvas (NEW)   │  Right Panels (기존 유지)          │
│   ┌──────────────┐   │  ┌────────────────────────────┐  │
│   │ Konva Stage  │   │  │ ComponentPanel             │  │
│   │              │   │  │ - ComponentForm            │  │
│   │ [무한 그리드] │   │  │ - ComponentList            │  │
│   │ [Pan & Zoom] │   │  └────────────────────────────┘  │
│   │ [컴포넌트]   │   │  ┌────────────────────────────┐  │
│   │              │   │  │ BreakpointPanel            │  │
│   └──────────────┘   │  │ - BreakpointSwitcher       │  │
│                      │  │ - BreakpointManager        │  │
└──────────────────────┴──┴────────────────────────────────┘
```

### 파일 구조
```
components/grid-canvas/
├── KonvaCanvas.tsx           # 메인 Konva 캔버스 (NEW)
├── GridBackground.tsx        # 무한 그리드 배경 레이어 (NEW)
├── ComponentNode.tsx         # 개별 컴포넌트 노드 (NEW)
└── index.ts                  # Exports

lib/
└── konva-utils.ts            # Konva 유틸리티 함수 (NEW)
    - snapToGrid()
    - getGridCell()
    - getCellPosition()
    - areasToKonvaPositions()
    - konvaPositionsToAreas()
```

### 그리드 시스템
```typescript
// Grid Configuration
const CELL_SIZE = 100  // 100px per cell
const GRID_COLOR = 'rgba(128, 128, 128, 0.2)'
const SNAP_THRESHOLD = CELL_SIZE / 2

// Grid Functions
- snapToGrid(x, y) → (snappedX, snappedY)
- getGridCell(x, y) → (col, row)
- getCellPosition(col, row) → (x, y)
```

### Pan & Zoom 설계
```typescript
// Pan
- Shift + Wheel: 수평 스크롤
- 일반 Wheel: 수직 스크롤
- Drag (Space + Mouse): 캔버스 이동

// Zoom
- Ctrl/Cmd + Wheel: 확대/축소
- 최소: 0.1x, 최대: 3x
- 마우스 포인터 중심으로 확대/축소
```

### 데이터 변환
```typescript
// Store areas (기존) ↔ Konva positions (신규)

interface KonvaComponent {
  id: string
  col: number  // Grid column
  row: number  // Grid row
  w: number    // Width in cells
  h: number    // Height in cells
}

// areas → Konva
function areasToKonvaPositions(areas: string[][]): KonvaComponent[]

// Konva → areas (저장용)
function konvaPositionsToAreas(positions: KonvaComponent[]): string[][]
```

---

## 📝 구현 단계

### ✅ Step 0: 준비 작업
- [x] 커밋 35d04f37로 롤백
- [x] Konva 의존성 설치 (konva 10.0.8, react-konva 19.2.0)
- [x] react-grid-layout 제거

**상세 내역:**
- 롤백 대상: `35d04f37` (Fix grid alignment and prevent selection)
- 설치된 패키지:
  - `konva@10.0.8`
  - `react-konva@19.2.0`
- 제거된 패키지:
  - `react-grid-layout@1.5.2`
  - `@types/react-grid-layout@1.3.5`

### ✅ Step 1: Konva 기본 캔버스
- [x] KonvaCanvas.tsx 생성
- [x] Konva Stage 초기화 (1200x800px)
- [x] 기본 레이어 구조 설정 (Grid Layer + Component Layer)
- [x] 홈 페이지에 통합
- [x] 기본 Pan & Zoom 구현
- [x] 임시 그리드 배경 (20x20 셀)
- [x] 테스트 컴포넌트 렌더링

**상세 내역:**
- 파일 생성: `components/grid-canvas/KonvaCanvas.tsx` (177줄)
- 기존 파일 백업:
  - `GridCanvas.tsx` → `GridCanvas.tsx.backup`
  - `GridCell.tsx` → `GridCell.tsx.backup`
  - `GridToolbar.tsx` → `GridToolbar.tsx.backup`
- `globals.css`에서 react-grid-layout CSS import 제거
- Pan & Zoom 기능:
  - Ctrl/Cmd + Wheel: 확대/축소 (0.1x ~ 3x)
  - Shift + Wheel: 수평 이동
  - Wheel: 수직 이동
  - Drag: 캔버스 전체 이동
- 임시 그리드: 20×20 셀 (CELL_SIZE = 100px)
- 테스트 컴포넌트: 100,100 위치에 200×100 크기
- 빌드 성공: Route (app) / - 158 kB

### ✅ Step 1.5: 브레이크포인트별 그리드 크기 정의
- [x] Breakpoint 타입에 gridCols/gridRows 추가
- [x] 샘플 데이터에 gridCols/gridRows 추가 (mobile: 4×20, tablet: 8×20, desktop: 12×20)
- [x] Store 로직 업데이트 (addBreakpoint에서 gridCols/gridRows 기반 레이아웃 생성)
- [x] BreakpointManager UI 업데이트 (gridCols/gridRows 입력 필드)
- [x] Validation 스키마 업데이트 (Zod)

**상세 내역:**
- 타입 변경: `types/schema.ts` - Breakpoint에 gridCols, gridRows 필드 추가
- 샘플 데이터 업데이트: `lib/sample-data.ts` - 모든 breakpoints에 gridCols/gridRows 추가
- 유틸리티 업데이트: `lib/schema-utils.ts` - createDefaultBreakpoints() 함수 업데이트
- Store 업데이트: `store/layout-store.ts` - addBreakpoint 로직에서 gridCols/gridRows 기반 areas 생성
- UI 업데이트: `components/breakpoint-panel/BreakpointManager.tsx` - gridCols/gridRows 입력 필드 추가
- Validation: `lib/validation.ts` - Zod schema에 gridCols/gridRows 검증 추가
- 테스트 파일 업데이트: `lib/test-validation.ts`, `store/test-store.ts`
- 빌드 성공: Route (app) / - 260 kB

**핵심 결정:**
- 브레이크포인트별 고정 그리드 크기 방식 채택
- 무한 캔버스 UX + 고정 데이터 구조 = AI 코드 생성 가능
- 기본 그리드 크기: mobile(4열), tablet(8열), desktop(12열), 모두 20행
- CELL_SIZE = 100px 유지

### ✅ Step 2: 브레이크포인트 기반 그리드 배경
- [x] KonvaCanvas에서 현재 브레이크포인트의 gridCols/gridRows 가져오기
- [x] 브레이크포인트별 gridCols × gridRows 크기로 그리드 렌더링
- [x] 툴바에 현재 그리드 크기 표시 ("Grid: 12 × 20")

**상세 내역:**
- KonvaCanvas.tsx 업데이트:
  - `useLayoutStore`에서 현재 브레이크포인트 및 breakpoints 가져오기
  - 현재 브레이크포인트의 gridCols, gridRows 계산 (fallback: 12, 20)
  - Grid Layer에서 gridRows × gridCols만큼 Rect 렌더링
  - 툴바에 "Grid: {gridCols} × {gridRows}" 표시 추가
- 빌드 성공: Route (app) / - 260 kB

**결과:**
- mobile 브레이크포인트: 4열 × 20행 그리드 표시
- tablet 브레이크포인트: 8열 × 20행 그리드 표시
- desktop 브레이크포인트: 12열 × 20행 그리드 표시
- 브레이크포인트 전환 시 그리드 크기 자동 업데이트

### ✅ Step 3: Pan & Zoom 구현
- [x] 마우스 휠 이벤트 핸들링
- [x] Pan (드래그) 구현
- [x] Zoom (Ctrl/Cmd + Wheel) 구현
- [x] 줌 레벨 제한 (0.1x ~ 3x)

**비고:** Step 1에서 이미 완전히 구현되었음

### ✅ Step 4: 컴포넌트 렌더링 (그리드 스냅)
- [x] ComponentNode.tsx 생성
- [x] Store areas → Konva positions 변환
- [x] 컴포넌트 렌더링 (그리드 셀 기반 위치/크기)
- [x] 선택 상태 표시

**상세 내역:**
- **ComponentNode.tsx 생성**:
  - Grid cell 좌표(gridRow, gridCol)를 Konva 픽셀 좌표로 변환 (x = col * 100, y = row * 100)
  - rowSpan, colSpan 기반 컴포넌트 크기 계산
  - 선택 상태에 따른 시각적 스타일링 (파란 테두리, 그림자)
  - 컴포넌트 정보 표시: name (bold), semanticTag (monospace), id
  - onClick 핸들러로 선택 기능 제공

- **KonvaCanvas.tsx 업데이트**:
  - Store에서 schema, selectedComponentId, setSelectedComponentId 가져오기
  - 현재 브레이크포인트의 areas 데이터 가져오기
  - **areas 분석 로직** (핵심):
    - 2D areas 배열을 순회하며 각 컴포넌트 ID 발견
    - 같은 ID의 연속된 셀을 하나의 컴포넌트로 병합
    - colSpan 계산: 가로로 같은 ID가 연속된 개수
    - rowSpan 계산: 세로로 같은 ID가 연속된 개수 (직사각형 보장)
    - 처리된 셀은 Set으로 추적하여 중복 처리 방지
  - Component Layer에서 ComponentNode 렌더링
  - 클릭 시 선택 상태 업데이트

- **테스트 조건**:
  - sample schema의 desktop layout:
    - c1 (Header): 0행, 0-2열 (1×3 span)
    - c2 (Sidebar): 1행, 0열 (1×1 span)
    - c3 (MainContent): 1행, 1열 (1×1 span)
    - c4 (AdBanner): 1행, 2열 (1×1 span)

- **빌드 성공:** Route (app) / - 261 kB

### ⏳ Step 5: 컴포넌트 D&D
- [ ] Draggable 설정
- [ ] 드래그 중 그리드 스냅
- [ ] 드래그 종료 시 store 업데이트
- [ ] 충돌 방지 로직

### ⏳ Step 6: 컴포넌트 Resize
- [ ] Resize 핸들 추가
- [ ] Resize 시 그리드 스냅
- [ ] 최소 크기 제한 (1×1 셀)
- [ ] Resize 종료 시 store 업데이트

### ⏳ Step 7: 라이브러리 → 캔버스 D&D
- [ ] ComponentList에서 드래그 시작
- [ ] 캔버스로 드롭 감지
- [ ] 빈 셀 검증
- [ ] 컴포넌트 배치

### ⏳ Step 8: 통합 및 테스트
- [ ] 기존 패널과 통합 테스트
- [ ] Breakpoint 전환 테스트
- [ ] 컴포넌트 추가/삭제 테스트
- [ ] AI 프롬프트 생성 테스트

---

## 🔧 기술 스택

### 추가되는 의존성
```json
{
  "konva": "^9.3.0",
  "react-konva": "^18.2.0"
}
```

### 제거되는 의존성
```json
{
  "react-grid-layout": "^1.5.2",
  "@types/react-grid-layout": "^1.3.5"
}
```

---

## 📊 진행 상황 추적

| 단계 | 상태 | 커밋 | 완료일 | 비고 |
|-----|------|------|--------|------|
| Step 0: 준비 | ✅ | 35d04f37 | 2025-11-11 | 롤백 완료 + Konva 10.0.8, react-konva 19.2.0 설치 |
| Step 1: 기본 캔버스 | ✅ | 62545ac | 2025-11-11 | Konva Stage + 기본 Pan & Zoom |
| Step 1.5: 브레이크포인트 그리드 | ✅ | f639ca7 | 2025-11-11 | 브레이크포인트별 gridCols/gridRows 정의 (4/8/12 × 20) |
| Step 2: 그리드 배경 | ✅ | 69ba9d8 | 2025-11-11 | 브레이크포인트 크기 기반 그리드 렌더링 |
| Step 3: Pan & Zoom | ✅ | 62545ac | 2025-11-11 | Step 1에서 이미 완전히 구현됨 |
| Step 4: 컴포넌트 렌더링 | ✅ | TBD | 2025-11-11 | areas 분석 + ComponentNode 렌더링 |
| Step 5: 컴포넌트 D&D | ⏳ | - | - | 드래그 앤 드롭 |
| Step 6: 컴포넌트 Resize | ⏳ | - | - | 크기 조절 |
| Step 7: 라이브러리 D&D | ⏳ | - | - | 외부 → 캔버스 |
| Step 8: 통합 테스트 | ⏳ | - | - | 전체 기능 검증 |

---

## 🎯 성공 기준

### 필수 기능
- [ ] 무한 캔버스에서 Pan & Zoom 가능
- [ ] 컴포넌트가 그리드에 스냅되어 배치
- [ ] 컴포넌트 D&D로 이동 가능
- [ ] 컴포넌트 Resize로 크기 조절 가능
- [ ] 라이브러리에서 캔버스로 D&D 가능
- [ ] 기존 패널 (ComponentPanel, BreakpointPanel) 정상 작동
- [ ] Breakpoint 전환 시 레이아웃 자동 갱신
- [ ] AI 프롬프트 생성 기능 유지

### 성능 목표
- [ ] 30개 컴포넌트에서 60fps 유지
- [ ] Pan & Zoom 부드러운 애니메이션
- [ ] 컴포넌트 D&D 시 지연 없음

---

## 📚 참조 문서

- **MASTER_PLAN.md**: 전체 개발 로드맵
- **PROGRESS.md**: 단계별 구현 상세 내역
- **KONVA_MIGRATION.md**: 이 문서 (Konva 전환 과정)
- **Konva 공식 문서**: https://konvajs.org/docs/
- **react-konva 공식 문서**: https://konvajs.org/docs/react/

---

## ⚠️ 주의사항

### 데이터 호환성
- Store의 `areas` 구조는 유지 (기존 기능과 호환)
- Konva positions는 실시간 렌더링용
- 저장 시 positions → areas 변환 필수

### 성능 최적화
- 뷰포트 밖 그리드 라인은 렌더링하지 않음
- 컴포넌트 레이어는 별도 관리
- 드래그 중에는 불필요한 리렌더링 방지

### 기존 기능 유지
- ComponentPanel의 모든 기능 유지
- BreakpointPanel의 모든 기능 유지
- GenerationModal의 모든 기능 유지
- Store actions/selectors 변경 최소화

---

## 🔄 업데이트 규칙

**각 단계 완료 시 필수 작업:**

1. **진행 상황 테이블 업데이트**
   - 상태: ⏳ → ✅
   - 커밋 해시 기록
   - 완료일 기록
   - 비고 추가 (중요 결정사항)

2. **상세 구현 내역 추가**
   - 생성/수정된 파일 목록
   - 핵심 구현 코드
   - 주요 결정사항
   - 테스트 결과

3. **다음 단계 준비**
   - 남은 작업 확인
   - 블로커 식별
   - 다음 단계 계획

**컨텍스트 유지 원칙:**
- 각 세션 시작 시 이 문서 읽기
- 중요한 기술적 결정은 반드시 기록
- 실패한 시도도 기록 (같은 실수 방지)
- 코드 스니펫은 핵심만 간결하게

---

_최초 작성: 2025-11-11_
_최종 업데이트: 2025-11-11 - Step 4 완료 (컴포넌트 렌더링 및 선택 기능)_
