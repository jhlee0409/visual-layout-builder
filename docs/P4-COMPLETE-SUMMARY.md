# P4: 고급 기능 추가 (Option B) - 완료 요약

## 완료 날짜
2025년 1월 (현재 세션)

## 전체 개요

P3에서 MVP 완성도를 향상시킨 후, P4에서는 고급 기능을 추가하여 사용자 경험을 대폭 개선했습니다.

**Option B 선택 이유**: MVP가 완료된 상태에서 실용적인 기능 추가가 개발자 경험 개선보다 우선순위가 높다고 판단

---

## 구현 항목

### P4-1: Drag & Drop (컴포넌트 순서 변경) ✅

**목적**: Layers Tree에서 드래그로 컴포넌트 순서를 직관적으로 변경

**구현 파일**:
- `/components/layers-tree-v2/SortableLayerItem.tsx` (신규)
- `/components/layers-tree-v2/LayersTreeV2.tsx` (업데이트)
- `/store/layout-store-v2.ts` (메서드 추가)

**주요 기능**:
```typescript
// @dnd-kit 사용 (v6.3.1 core, v9.0.0 sortable)
import { useSortable } from "@dnd-kit/sortable"
import { DndContext, closestCenter } from "@dnd-kit/core"

// SortableLayerItem 컴포넌트
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: component.id
})

// Drag Handle (GripVertical 아이콘)
<div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
  <GripVertical className="w-4 h-4" />
</div>

// Drag End Handler
const handleDragEnd = (event: DragEndEvent) => {
  const newOrder = arrayMove(componentIds, oldIndex, newIndex)
  reorderComponentsInLayout(currentBreakpoint, newOrder)
}

// Store 메서드
reorderComponentsInLayout: (breakpoint, newOrder) => {
  // layout.components 배열을 새 순서로 업데이트
}
```

**UX 개선**:
- Hover 시에만 Drag Handle 표시 (opacity: 0 → 100)
- 드래깅 중 시각적 피드백 (opacity: 0.5, z-50, shadow-lg)
- Pointer + Keyboard 센서로 접근성 확보
- Breakpoint별 독립적인 순서 관리

---

### P4-2: Responsive Preview (Breakpoint 전환) ✅

**목적**: 모바일/태블릿/데스크톱 뷰를 쉽게 전환하여 반응형 디자인 확인

**구현 파일**:
- `/components/breakpoint-panel-v2/BreakpointSwitcherV2.tsx` (신규)
- `/components/breakpoint-panel-v2/index.ts` (신규)
- `/app/v2/page.tsx` (V2 전용 페이지 생성)

**주요 기능**:
```typescript
// BreakpointSwitcherV2
export function BreakpointSwitcherV2() {
  const breakpoints = useLayoutStoreV2((state) => state.schema.breakpoints)
  const currentBreakpoint = useLayoutStoreV2((state) => state.currentBreakpoint)
  const setCurrentBreakpoint = useLayoutStoreV2((state) => state.setCurrentBreakpoint)

  // Breakpoint 이름에 따라 아이콘 자동 매핑
  const getIcon = (name: string) => {
    if (name.includes("mobile")) return <Smartphone />
    if (name.includes("tablet")) return <Tablet />
    return <Monitor />
  }

  // 현재 breakpoint 정보 표시
  <Badge>≥ {currentBreakpointConfig.minWidth}px</Badge>
}
```

**V2 전용 페이지 구조** (`/app/v2/page.tsx`):
```
┌─────────────────────────────────────────────────┐
│  Header (V1 링크, 컴포넌트 수, Theme, 액션)      │
├──────────┬────────────────────┬─────────────────┤
│  Library │  Canvas (Flex)     │ Layers/Props    │
│  (280px) │  + Breakpoint UI   │  (320px)        │
│          │                    │  [Tabs]         │
└──────────┴────────────────────┴─────────────────┘
```

**3-Panel 레이아웃**:
- **Left Panel** (280px): LibraryPanelV2 - 컴포넌트 템플릿
- **Center Panel** (Flex): CanvasV2 + BreakpointSwitcherV2
- **Right Panel** (320px): LayersTreeV2 ↔ PropertiesPanelV2 (탭 전환)

**탭 전환 UI**:
```typescript
const [activeTab, setActiveTab] = useState<"layers" | "properties">("layers")

<div className="flex">
  <button
    className={activeTab === "layers" ? "border-b-2 border-blue-500 bg-blue-50" : ""}
    onClick={() => setActiveTab("layers")}
  >
    Layers
  </button>
  <button
    className={activeTab === "properties" ? "border-b-2 border-blue-500 bg-blue-50" : ""}
    onClick={() => setActiveTab("properties")}
  >
    Properties
  </button>
</div>

{activeTab === "layers" ? <LayersTreeV2 /> : <PropertiesPanelV2 />}
```

---

### P4-3: Component Library 확장 ✅

**목적**: 실용적인 컴포넌트 템플릿 추가로 라이브러리 확장 (9개 → 15개)

**구현 파일**:
- `/lib/component-library-v2.ts` (템플릿 추가)

**추가된 템플릿 (6개)**:

1. **Hero Section** (`hero-section`)
   ```typescript
   {
     semanticTag: "section",
     layout: { type: "flex", direction: "column", items: "center", justify: "center" },
     styling: {
       className: "min-h-[500px] bg-gradient-to-r from-blue-500 to-purple-600 text-white"
     }
   }
   ```

2. **Card** (`card-container`)
   ```typescript
   {
     semanticTag: "div",
     layout: { type: "flex", direction: "column", gap: "1rem" },
     styling: {
       className: "p-6 bg-white rounded-lg shadow-md border border-gray-200"
     }
   }
   ```

3. **Grid Container** (`grid-container`)
   ```typescript
   {
     layout: { type: "grid", cols: 2, gap: "1.5rem" }
   }
   ```

4. **CTA Section** (`cta-section`)
   ```typescript
   {
     semanticTag: "section",
     layout: { type: "flex", direction: "column", items: "center" },
     styling: {
       className: "py-16 px-4 text-center bg-blue-600 text-white rounded-lg"
     }
   }
   ```

5. **Image Banner** (`image-banner`)
   ```typescript
   {
     layout: { type: "container", maxWidth: "full", padding: "0" },
     styling: { className: "relative h-[400px] bg-gray-300 overflow-hidden" }
   }
   ```

6. **Button Group** (`button-group`)
   ```typescript
   {
     layout: { type: "flex", direction: "row", gap: "0.75rem", items: "center" }
   }
   ```

**카테고리 분포**:
- **Layout**: 4개 (Header, Main, Footer, Grid Container)
- **Navigation**: 2개 (Sidebar, Navbar)
- **Content**: 6개 (Section, Article, Div, Hero, Card, CTA, Image Banner)
- **Form**: 2개 (Form, Button Group)

---

### P4-4: Theme System ✅

**목적**: 디자인 시스템 및 테마 관리 (Light/Dark 모드, Color Presets)

**구현 파일**:
- `/lib/theme-system-v2.ts` (신규) - Theme 정의 및 유틸리티
- `/store/theme-store-v2.ts` (신규) - Zustand + persist
- `/components/theme-selector-v2/ThemeSelectorV2.tsx` (신규)
- `/components/theme-selector-v2/index.ts` (신규)
- `/app/v2/page.tsx` (Theme Selector 통합)

**Theme 인터페이스**:
```typescript
interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  success: string
  warning: string
}

interface Theme {
  id: string
  name: string
  description: string
  mode: "light" | "dark"
  colors: ThemeColors
}
```

**사전 정의된 6개 테마 프리셋**:

| 테마 ID | 이름 | 모드 | 설명 |
|---------|------|------|------|
| `light-default` | Default Light | Light | 기본 라이트 테마 (blue-500 primary) |
| `dark-default` | Default Dark | Dark | 기본 다크 테마 (blue-400 primary) |
| `light-nature` | Nature Light | Light | 자연 친화적 (green-500 primary) |
| `dark-ocean` | Ocean Dark | Dark | 오션 블루 (sky-500 primary) |
| `light-minimal` | Minimal Light | Light | 미니멀 (black primary) |
| `dark-minimal` | Minimal Dark | Dark | 미니멀 (white primary) |

**Theme Store (Zustand + Persist)**:
```typescript
export const useThemeStoreV2 = create<ThemeStateV2>()(
  devtools(
    persist(
      (set, get) => ({
        currentThemeId: "light-default", // Default theme

        setTheme: (themeId) => {
          const theme = getThemeById(themeId)
          if (theme) {
            set({ currentThemeId: themeId }, false, "setTheme")
          }
        },

        getCurrentTheme: () => getThemeById(get().currentThemeId),
      }),
      {
        name: "laylder-theme-store-v2", // LocalStorage key
      }
    )
  )
)

// Selectors
export const useCurrentTheme = () => { /* ... */ }
export const useAvailableThemes = () => THEME_PRESETS
```

**Theme Selector UI**:
```typescript
export function ThemeSelectorV2() {
  // Dropdown UI with:
  // - Light Themes 섹션 (Sun 아이콘)
  // - Dark Themes 섹션 (Moon 아이콘)
  // - 각 테마: 이름, 설명, Active Badge, Color Preview (3개 색상)
  // - 클릭으로 테마 전환
}
```

**유틸리티 함수**:
```typescript
// CSS 변수로 변환
themeToCSSVariables(theme) → {
  "--color-primary": "#3b82f6",
  /* ... */
}

// Tailwind Config 생성
themeToTailwindConfig(theme) → `
module.exports = {
  theme: {
    extend: {
      colors: { /* ... */ }
    }
  }
}
`
```

**LocalStorage 저장**:
- Theme 선택은 브라우저 LocalStorage에 저장
- 페이지 새로고침 후에도 테마 유지
- Key: `laylder-theme-store-v2`

---

## 검증 결과

### TypeScript 컴파일 ✅
```bash
npx tsc --noEmit
# 0 errors - All P4 phases
```

### 기능 검증
1. **Drag & Drop**: @dnd-kit 통합, 순서 변경, Breakpoint별 독립 ✅
2. **Responsive Preview**: Breakpoint 전환, 탭 UI, 3-panel 레이아웃 ✅
3. **Component Library**: 15개 템플릿, 4개 카테고리 ✅
4. **Theme System**: 6개 프리셋, LocalStorage persist, UI 통합 ✅

---

## P4 완료 파일 목록

### Components (7 files)
1. `/components/layers-tree-v2/SortableLayerItem.tsx` (NEW)
2. `/components/layers-tree-v2/LayersTreeV2.tsx` (UPDATED)
3. `/components/breakpoint-panel-v2/BreakpointSwitcherV2.tsx` (NEW)
4. `/components/breakpoint-panel-v2/index.ts` (NEW)
5. `/components/theme-selector-v2/ThemeSelectorV2.tsx` (NEW)
6. `/components/theme-selector-v2/index.ts` (NEW)

### Pages (1 file)
7. `/app/v2/page.tsx` (NEW) - V2 전용 3-panel 레이아웃

### Store (2 files)
8. `/store/layout-store-v2.ts` (UPDATED) - `reorderComponentsInLayout` 추가
9. `/store/theme-store-v2.ts` (NEW) - Theme 상태 관리

### Library (2 files)
10. `/lib/component-library-v2.ts` (UPDATED) - 6개 템플릿 추가
11. `/lib/theme-system-v2.ts` (NEW) - Theme 정의 및 유틸리티

---

## 기술 스택

### UI Components & Libraries
- **@dnd-kit**: v6.3.1 (core), v9.0.0 (sortable) - Drag & Drop
- **Zustand**: State management (theme-store-v2)
- **Zustand middleware**: devtools, persist (LocalStorage)
- **Lucide React**: Icons (GripVertical, Sun, Moon, Palette, etc.)
- **Tailwind CSS**: Styling, gradients, responsive

### Patterns
- **Sortable Pattern**: useSortable hook, DndContext, SortableContext
- **State Persistence**: Zustand persist middleware
- **Tab Pattern**: useState로 activeTab 관리
- **Dropdown Pattern**: isOpen state + backdrop + absolute positioning

---

## 아키텍처 하이라이트

### 1. Drag & Drop Architecture
```typescript
// Sensor 설정 (Pointer + Keyboard)
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

// DndContext → SortableContext → useSortable
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
    {componentsInLayout.map(component => (
      <SortableLayerItem key={component.id} component={component} />
    ))}
  </SortableContext>
</DndContext>

// Store action
reorderComponentsInLayout(breakpoint, newOrder) → layouts[breakpoint].components = newOrder
```

### 2. V2 Page Structure
```
/v2 route
├─ Header (V1 link, Theme, Actions)
├─ Left Panel (LibraryPanelV2) - 280px fixed
├─ Center Panel
│  ├─ BreakpointSwitcherV2
│  └─ CanvasV2 (flex-1)
└─ Right Panel (320px fixed)
   ├─ Tabs (Layers ↔ Properties)
   └─ Content (LayersTreeV2 | PropertiesPanelV2)
```

### 3. Theme System Flow
```
User clicks theme → setTheme(themeId) → Zustand store update
→ LocalStorage persist → useCurrentTheme selector
→ UI re-render with new theme
```

---

## 사용자 경험 개선

### Before P4 (P3 완료 상태)
- ❌ 컴포넌트 순서 변경: 수동으로 delete + re-add
- ❌ Breakpoint 전환: 없음 (현재 breakpoint만 표시)
- ❌ V2 페이지: 없음 (V1만 존재)
- ❌ Theme: 없음 (Tailwind 기본 색상만)

### After P4 (현재)
- ✅ 컴포넌트 순서 변경: Drag handle로 직관적 이동
- ✅ Breakpoint 전환: 아이콘 버튼으로 즉시 전환, minWidth 표시
- ✅ V2 페이지: `/v2` route로 V2 전용 3-panel UI
- ✅ Theme: 6개 프리셋, LocalStorage 저장, Color Preview

### Drag & Drop UX
1. **Hover 시 Handle 표시** - 평상시 숨김, hover 시 opacity 100%
2. **드래깅 중 피드백** - opacity 0.5, z-50, shadow-lg
3. **Keyboard 지원** - 접근성 (sortableKeyboardCoordinates)
4. **Smooth transition** - CSS Transform + Transition

### Theme Selector UX
1. **Dropdown UI** - Backdrop + absolute positioning
2. **Light/Dark 섹션** - 시각적 그룹핑 (Sun/Moon 아이콘)
3. **Active Badge** - 현재 선택된 테마 표시
4. **Color Preview** - 3개 색상 칩으로 미리보기
5. **Hover Effects** - border-blue-300, bg-gray-50

---

## Option B 달성도

| 목표 | 상태 | 완성도 |
|------|------|--------|
| Drag & Drop | ✅ | 100% |
| Responsive Preview | ✅ | 100% |
| Component Library 확장 | ✅ | 100% (9개 → 15개) |
| Theme System | ✅ | 100% (6개 프리셋, persist) |

**전체 완성도**: 100%

---

## 다음 단계 제안

### Option C: 개발자 경험 개선
1. **Hot Reload** - 실시간 변경 반영
2. **Error Boundaries** - 에러 처리 개선
3. **Performance** - 렌더링 최적화 (React.memo, useMemo)
4. **Documentation** - 사용자 가이드

### Undo/Redo 완전 구현
- History tracking with Zustand middleware
- State snapshot 관리 (temporal middleware)
- Selective undo (특정 action만)
- History limit 설정 (최대 20개 스냅샷)

### Advanced Drag & Drop
- Library → Canvas 드래그 (P2에서 구현됨)
- Canvas 내 컴포넌트 이동 (그리드 스냅)
- 컴포넌트 리사이즈 (드래그로 크기 조절)

### Theme System 고도화
- 커스텀 테마 생성 UI
- Theme Export/Import (JSON)
- Real-time Canvas 테마 적용 (CSS 변수)
- Color picker 통합

---

## 결론

**P4 (Option B: 고급 기능 추가) 완료** ✅

- ✅ P4-1: Drag & Drop - @dnd-kit 통합, 순서 변경
- ✅ P4-2: Responsive Preview - Breakpoint 전환, 3-panel UI
- ✅ P4-3: Component Library 확장 - 15개 템플릿
- ✅ P4-4: Theme System - 6개 프리셋, LocalStorage

**Schema V2 MVP는 이제 프로덕션 수준의 기능을 갖췄습니다**:
- 컴포넌트 추가 (Library Panel)
- 드래그로 순서 변경 (Layers Tree)
- Breakpoint 전환 (Responsive Preview)
- 속성 편집 (Properties Panel)
- 테마 선택 (Theme Selector)
- 미리보기 (Canvas V2)
- 코드 Export (Export Modal)

**접근 URL**:
- V1 (Konva 기반): `http://localhost:3000`
- V2 (Schema V2): `http://localhost:3000/v2`

다음 우선순위는 사용자 피드백 및 실제 사용 사례에 따라 결정할 수 있습니다.
