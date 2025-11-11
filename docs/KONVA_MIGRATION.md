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

### ⏳ Step 1: Konva 기본 캔버스
- [ ] KonvaCanvas.tsx 생성
- [ ] Konva Stage 초기화
- [ ] 기본 레이어 구조 설정
- [ ] 홈 페이지에 통합

### ⏳ Step 2: 무한 그리드 배경
- [ ] GridBackground.tsx 생성
- [ ] 뷰포트 기반 그리드 라인 렌더링
- [ ] Pan 시 그리드 업데이트
- [ ] Zoom 시 그리드 스케일링

### ⏳ Step 3: Pan & Zoom 구현
- [ ] 마우스 휠 이벤트 핸들링
- [ ] Pan (드래그) 구현
- [ ] Zoom (Ctrl/Cmd + Wheel) 구현
- [ ] 줌 레벨 제한 (0.1x ~ 3x)

### ⏳ Step 4: 컴포넌트 렌더링
- [ ] ComponentNode.tsx 생성
- [ ] Store areas → Konva positions 변환
- [ ] 컴포넌트 Group 렌더링
- [ ] 선택 상태 표시

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
| Step 1: 기본 캔버스 | ⏳ | - | - | Konva Stage 초기화 |
| Step 2: 무한 그리드 | ⏳ | - | - | 그리드 배경 렌더링 |
| Step 3: Pan & Zoom | ⏳ | - | - | 캔버스 이동/확대 |
| Step 4: 컴포넌트 렌더링 | ⏳ | - | - | Store 연동 |
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
_최종 업데이트: 2025-11-11 - Step 0 완료 (준비 작업)_
