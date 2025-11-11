# Schema V2 Examples & Generated Code

이 문서는 Schema V2의 각 샘플 스키마와 그로부터 생성될 실제 React/Tailwind 코드를 보여줍니다.

## 설계 원칙 복습

1. **Component Independence**: 각 컴포넌트는 독립적으로 자신의 positioning, layout, styling을 정의
2. **Flexbox First, Grid Secondary**: Flexbox를 페이지 구조에, Grid를 카드 배치에 사용
3. **Semantic HTML First**: 시맨틱 태그에 적합한 positioning 전략 적용
4. **Responsive Per Component**: 컴포넌트별로 반응형 동작 정의
5. **Separation of Concerns**: Layout(배치)과 Style(스타일) 분리

---

## 1. GitHub-Style Layout

### Schema 구조

```typescript
{
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "GlobalHeader",
      semanticTag: "header",
      positioning: {
        type: "fixed",
        position: { top: 0, left: 0, right: 0, zIndex: 50 }
      },
      layout: {
        type: "container",
        container: { maxWidth: "full", padding: "1rem", centered: true }
      },
      styling: {
        background: "white",
        border: "b",
        shadow: "sm"
      }
    },
    {
      id: "c2",
      name: "Sidebar",
      semanticTag: "nav",
      positioning: {
        type: "sticky",
        position: { top: "4rem" }
      },
      layout: {
        type: "flex",
        flex: { direction: "column", gap: "0.5rem" }
      },
      styling: { width: "16rem", border: "r" },
      responsive: {
        mobile: { hidden: true },
        tablet: { hidden: true },
        desktop: { hidden: false }
      }
    },
    {
      id: "c3",
      name: "MainContent",
      semanticTag: "main",
      positioning: { type: "static" },
      layout: {
        type: "container",
        container: { maxWidth: "7xl", padding: "2rem", centered: true }
      },
      styling: { className: "flex-1" }
    }
  ],
  layouts: {
    desktop: {
      structure: "sidebar-main",
      components: ["c1", "c2", "c3"],
      roles: { header: "c1", sidebar: "c2", main: "c3" }
    }
  }
}
```

### 생성될 코드

```tsx
// components/GlobalHeader.tsx
export function GlobalHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        {children || "Global Header"}
      </div>
    </header>
  )
}

// components/Sidebar.tsx
export function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="hidden lg:block w-64 border-r sticky top-16">
      <div className="flex flex-col gap-2">
        {children || "Navigation Menu"}
      </div>
    </nav>
  )
}

// components/MainContent.tsx
export function MainContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-7xl px-8">
        {children || "Main Content Area"}
      </div>
    </main>
  )
}

// app/page.tsx (또는 layout)
export default function Layout() {
  return (
    <>
      <GlobalHeader />
      <div className="flex pt-16">
        <Sidebar />
        <MainContent />
      </div>
    </>
  )
}
```

### 결과 분석

✅ **올바른 패턴**
- Header: `fixed top-0` - 항상 상단 고정
- Sidebar: `sticky top-16` - 스크롤 시 Header 아래 고정
- Main: `flex-1` - 남은 공간 차지
- 반응형: Sidebar는 Desktop에서만 표시 (hidden lg:block)

❌ **이전 V1의 문제점**
```tsx
// V1에서 생성되던 잘못된 코드
<div className="grid grid-cols-[repeat(12,1fr)]" style={{ gridTemplateAreas: "..." }}>
  <header style={{ gridArea: "c1" }}>...</header>
  <nav style={{ gridArea: "c2" }}>...</nav>
  <main style={{ gridArea: "c3" }}>...</main>
</div>
```
→ 실제 웹사이트에서 사용하지 않는 비현실적 패턴

---

## 2. Dashboard Layout

### Schema 구조

```typescript
{
  components: [
    {
      id: "c1",
      name: "TopNavbar",
      semanticTag: "header",
      positioning: {
        type: "fixed",
        position: { top: 0, left: 0, right: 0, zIndex: 50 }
      },
      layout: {
        type: "flex",
        flex: { direction: "row", justify: "between", items: "center" }
      },
      styling: {
        height: "4rem",
        background: "slate-900",
        className: "text-white px-6"
      }
    },
    {
      id: "c2",
      name: "SideMenu",
      semanticTag: "nav",
      positioning: {
        type: "fixed",
        position: { top: "4rem", left: 0, bottom: 0 }
      },
      layout: {
        type: "flex",
        flex: { direction: "column", gap: "0.25rem" }
      },
      styling: {
        width: "16rem",
        background: "slate-800",
        className: "text-white p-4"
      }
    },
    {
      id: "c3",
      name: "DashboardContent",
      semanticTag: "main",
      positioning: { type: "static" },
      styling: { className: "ml-0 lg:ml-64 pt-16" }
    }
  ]
}
```

### 생성될 코드

```tsx
// components/TopNavbar.tsx
export function TopNavbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 text-white px-6">
      <div className="flex flex-row justify-between items-center h-full">
        {children || "Dashboard"}
      </div>
    </header>
  )
}

// components/SideMenu.tsx
export function SideMenu({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-slate-800 text-white p-4">
      <div className="flex flex-col gap-1">
        {children || "Menu"}
      </div>
    </nav>
  )
}

// components/DashboardContent.tsx
export function DashboardContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className="ml-0 lg:ml-64 pt-16">
      <div className="container mx-auto px-8 py-8">
        {children || "Dashboard Content"}
      </div>
    </main>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <>
      <TopNavbar />
      <SideMenu />
      <DashboardContent>
        {/* Dashboard widgets */}
      </DashboardContent>
    </>
  )
}
```

### 결과 분석

✅ **올바른 패턴**
- 전체 화면 대시보드: fixed positioning 활용
- Sidebar: `fixed left-0` - 화면 왼쪽에 고정
- Content: `ml-64` - Sidebar 너비만큼 왼쪽 마진
- Dark theme: bg-slate-900, bg-slate-800 사용

---

## 3. Marketing Site Layout

### Schema 구조

```typescript
{
  components: [
    {
      id: "c1",
      name: "SiteHeader",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 }
      },
      layout: {
        type: "flex",
        flex: { direction: "row", justify: "between", items: "center" }
      },
      styling: {
        background: "white",
        border: "b",
        shadow: "sm",
        className: "px-6 py-4"
      }
    },
    {
      id: "c2",
      name: "HeroSection",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: {
        type: "container",
        container: { maxWidth: "7xl", padding: "4rem 2rem", centered: true }
      }
    },
    {
      id: "c3",
      name: "FeaturesSection",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: {
        type: "container",
        container: { maxWidth: "7xl", padding: "4rem 2rem", centered: true }
      }
    },
    {
      id: "c4",
      name: "SiteFooter",
      semanticTag: "footer",
      positioning: { type: "static" },
      styling: {
        background: "slate-900",
        className: "text-white mt-16"
      }
    }
  ],
  layouts: {
    desktop: {
      structure: "vertical",
      components: ["c1", "c2", "c3", "c4"],
      containerLayout: {
        type: "flex",
        flex: { direction: "column", gap: 0 }
      }
    }
  }
}
```

### 생성될 코드

```tsx
// components/SiteHeader.tsx
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4">
      <div className="flex flex-row justify-between items-center">
        {children || "Company Logo"}
      </div>
    </header>
  )
}

// components/HeroSection.tsx
export function HeroSection({ children }: { children?: React.ReactNode }) {
  return (
    <section>
      <div className="container mx-auto max-w-7xl px-8 py-16">
        {children || "Hero Content"}
      </div>
    </section>
  )
}

// components/FeaturesSection.tsx
export function FeaturesSection({ children }: { children?: React.ReactNode }) {
  return (
    <section>
      <div className="container mx-auto max-w-7xl px-8 py-16">
        {children || "Features"}
      </div>
    </section>
  )
}

// components/SiteFooter.tsx
export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="container mx-auto max-w-7xl px-8 py-8">
        {children || "Footer"}
      </div>
    </footer>
  )
}

// app/page.tsx
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <SiteFooter />
    </div>
  )
}
```

### 결과 분석

✅ **올바른 패턴**
- Header: `sticky top-0` - 스크롤 시 상단 고정
- Sections: 수직 배치 (vertical structure)
- Footer: `static` - 문서 흐름 끝에 위치
- Container 패턴: `max-w-7xl mx-auto` - 중앙 정렬

---

## 4. Card Gallery Layout

### Schema 구조

```typescript
{
  components: [
    {
      id: "c1",
      name: "PageHeader",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 }
      }
    },
    {
      id: "c2",
      name: "CardGrid",
      semanticTag: "main",
      positioning: { type: "static" },
      layout: {
        type: "grid",  // ← Grid 사용 (올바른 사용 예시)
        grid: {
          cols: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }
      },
      styling: { className: "flex-1 container mx-auto max-w-7xl px-8 py-8" }
    }
  ]
}
```

### 생성될 코드

```tsx
// components/PageHeader.tsx
export function PageHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto max-w-7xl px-8 py-4">
        {children || "Gallery"}
      </div>
    </header>
  )
}

// components/CardGrid.tsx
export function CardGrid({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1 container mx-auto max-w-7xl px-8 py-8">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {children || "Card items will be placed here"}
      </div>
    </main>
  )
}

// app/gallery/page.tsx
export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader />
      <CardGrid>
        {/* 카드 컴포넌트들 */}
        <Card />
        <Card />
        <Card />
        {/* ... */}
      </CardGrid>
    </div>
  )
}
```

### 결과 분석

✅ **Grid의 올바른 사용**
- 페이지 구조: Flexbox (flex flex-col)
- 카드 배치: CSS Grid (grid grid-cols-[...])
- `auto-fill`: 화면 크기에 따라 자동으로 열 개수 조정
- `minmax(300px, 1fr)`: 최소 300px, 최대 1fr

🎯 **Grid vs Flexbox 사용 구분**
- **Flexbox**: 페이지 구조 (Header, Main, Footer 배치)
- **Grid**: 카드, 갤러리, 상품 목록 등 2차원 배치

---

## Schema V2의 핵심 개선사항

### 1. Component Independence (컴포넌트 독립성)

**V1 문제:**
```typescript
// 모든 컴포넌트가 grid-template-areas에 종속
layouts: {
  desktop: {
    grid: {
      areas: [["c1", "c1"], ["c2", "c3"]]
    }
  }
}
```

**V2 해결:**
```typescript
// 각 컴포넌트가 독립적으로 자신의 위치 결정
{
  positioning: { type: "fixed", position: { top: 0 } },
  layout: { type: "flex", flex: { ... } },
  responsive: { mobile: { hidden: true } }
}
```

### 2. Flexbox First, Grid Secondary

**V1 문제:**
```tsx
// 모든 레이아웃을 Grid로 강제
<div style={{
  display: "grid",
  gridTemplateAreas: "..."
}}>
```

**V2 해결:**
```tsx
// Flexbox를 기본으로, Grid는 필요시만
<div className="flex">  {/* 페이지 구조 */}
  <aside />
  <main>
    <div className="grid">  {/* 카드 배치 */}
```

### 3. Semantic HTML with Smart Defaults

**V1 문제:**
```tsx
// Header도 grid item으로 취급
<header style={{ gridArea: "c1" }}>
```

**V2 해결:**
```tsx
// Header는 fixed/sticky로 고정
<header className="fixed top-0 z-50">
<footer className="static">  {/* Footer는 문서 끝 */}
```

### 4. Real-World Code Generation

**V1 출력:**
```tsx
❌ 실제 사용되지 않는 패턴
<div className="grid grid-cols-[repeat(12,1fr)]">
  <div style={{ gridArea: "1 / 1 / 2 / 13" }}>Header</div>
  <div style={{ gridArea: "2 / 1 / 3 / 3" }}>Sidebar</div>
  <div style={{ gridArea: "2 / 3 / 3 / 13" }}>Main</div>
</div>
```

**V2 출력:**
```tsx
✅ 실제 프로덕션에서 사용되는 패턴
<>
  <header className="fixed top-0 z-50">Header</header>
  <div className="flex pt-16">
    <aside className="sticky top-16 w-64">Sidebar</aside>
    <main className="flex-1">Main</main>
  </div>
</>
```

---

## 검증 결과

모든 샘플 스키마는 `validateSchemaV2()` 검증을 통과했습니다:

```bash
$ npx tsx scripts/validate-schema-v2.ts

📋 Testing: github
✅ Schema validation passed!
🎉 Perfect! No errors or warnings.

📋 Testing: dashboard
✅ Schema validation passed!
🎉 Perfect! No errors or warnings.

📋 Testing: marketing
✅ Schema validation passed!
🎉 Perfect! No errors or warnings.

📋 Testing: cardGallery
✅ Schema validation passed!
🎉 Perfect! No errors or warnings.
```

---

## 다음 단계

Schema V2가 완성되었으므로, 다음 작업이 필요합니다:

### P0-2: Component Independence Strategy
- V2 스키마를 읽어서 실제 컴포넌트 생성
- Positioning, Layout, Styling을 코드로 변환

### P0-3: Prompt Generation Logic Rewrite
- AI 프롬프트 생성 로직 재작성
- GenerationPackageV2를 AI가 이해할 수 있는 프롬프트로 변환

### P1: Implementation & Testing
- Code generator 구현
- Integration 테스트
- UI 업데이트

이 문서는 Schema V2의 설계 의도와 생성될 코드를 명확히 보여줍니다.
