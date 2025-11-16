# Component Library Reference - CSS & Properties

Laylder의 모든 사전 정의 컴포넌트 템플릿의 기본 CSS 및 프로퍼티 설정입니다.

## 목차

- [Layout Components](#layout-components)
  - [Sticky Header](#sticky-header)
  - [Main Content](#main-content)
  - [Footer](#footer)
  - [Grid Container](#grid-container)
- [Navigation Components](#navigation-components)
  - [Left Sidebar](#left-sidebar)
  - [Horizontal Navbar](#horizontal-navbar)
- [Content Components](#content-components)
  - [Section](#section)
  - [Article](#article)
  - [Container Div](#container-div)
  - [Hero Section](#hero-section)
  - [Card](#card)
  - [CTA Section](#cta-section)
  - [Image Banner](#image-banner)
- [Form Components](#form-components)
  - [Form](#form)
  - [Button Group](#button-group)

---

## Layout Components

### Sticky Header

**ID:** `header-sticky`
**Semantic Tag:** `<header>`
**Default Name:** `Header`

#### Positioning
```typescript
type: "sticky"
position: {
  top: 0
  zIndex: 50
}
```

**Tailwind Classes:** `sticky top-0 z-50`

#### Layout
```typescript
type: "container"
container: {
  maxWidth: "full"
  padding: "1rem"
  centered: true
}
```

**Tailwind Classes:** `container max-w-full mx-auto px-4`

#### Styling
```typescript
background: "white"
border: "b"
shadow: "sm"
```

**Tailwind Classes:** `bg-white border-b shadow-sm`

#### Complete Expected Classes
```
sticky top-0 z-50 bg-white border-b shadow-sm
```

#### Usage
고정된 상단 헤더. 스크롤 시 상단에 유지됩니다.

---

### Main Content

**ID:** `main-content`
**Semantic Tag:** `<main>`
**Default Name:** `Main`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none - default flow)

#### Layout
```typescript
type: "container"
container: {
  maxWidth: "7xl"
  padding: "2rem"
  centered: true
}
```

**Tailwind Classes:** `container max-w-7xl mx-auto px-8`

#### Styling
```typescript
className: "flex-1 min-h-screen"
```

**Tailwind Classes:** `flex-1 min-h-screen`

#### Complete Expected Classes
```
flex-1 min-h-screen container max-w-7xl mx-auto px-8
```

#### Usage
메인 컨텐츠 영역. Flexbox 레이아웃에서 남은 공간을 모두 차지합니다.

---

### Footer

**ID:** `footer-standard`
**Semantic Tag:** `<footer>`
**Default Name:** `Footer`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none - default flow)

#### Layout
```typescript
type: "container"
container: {
  maxWidth: "full"
  padding: "2rem 1rem"
  centered: true
}
```

**Tailwind Classes:** `container max-w-full mx-auto px-4 py-8`

#### Styling
```typescript
background: "gray-100"
border: "t"
```

**Tailwind Classes:** `bg-gray-100 border-t`

#### Complete Expected Classes
```
bg-gray-100 border-t container max-w-full mx-auto px-4 py-8
```

#### Usage
페이지 하단 Footer. 전체 너비를 차지합니다.

---

### Grid Container

**ID:** `grid-container`
**Semantic Tag:** `<div>`
**Default Name:** `GridContainer`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "grid"
grid: {
  cols: 2
  gap: "1.5rem"
}
```

**Tailwind Classes:** `grid grid-cols-2 gap-6`

#### Styling
```typescript
className: "p-4"
```

**Tailwind Classes:** `p-4`

#### Complete Expected Classes
```
grid grid-cols-2 gap-6 p-4
```

#### Usage
2열 그리드 레이아웃. 카드나 아이템을 배치할 때 사용합니다.

---

## Navigation Components

### Left Sidebar

**ID:** `sidebar-left`
**Semantic Tag:** `<aside>`
**Default Name:** `Sidebar`

#### Positioning
```typescript
type: "sticky"
position: {
  top: "4rem"  // Header 높이만큼 offset
  zIndex: 40
}
```

**Tailwind Classes:** `sticky top-16 z-40`

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1rem"
}
```

**Tailwind Classes:** `flex flex-col gap-4`

#### Styling
```typescript
width: "16rem"  // 256px = w-64
background: "gray-50"
border: "r"
```

**Tailwind Classes:** `w-64 bg-gray-50 border-r`

#### Complete Expected Classes
```
sticky top-16 z-40 flex flex-col gap-4 w-64 bg-gray-50 border-r
```

#### Responsive Behavior
기본적으로 responsive 설정이 없지만, 일반적으로 모바일에서는 숨기고 데스크탑에서만 표시합니다.

**권장 Responsive:**
```typescript
responsive: {
  mobile: { hidden: true }
  tablet: { hidden: true }
  desktop: { hidden: false }
}
```

**Tailwind:** `hidden lg:flex`

#### Usage
좌측 사이드바 네비게이션. Header 아래에 sticky로 고정됩니다.

---

### Horizontal Navbar

**ID:** `navbar-horizontal`
**Semantic Tag:** `<nav>`
**Default Name:** `Navbar`

#### Positioning
```typescript
type: "sticky"
position: {
  top: 0
  zIndex: 50
}
```

**Tailwind Classes:** `sticky top-0 z-50`

#### Layout
```typescript
type: "flex"
flex: {
  direction: "row"
  gap: "2rem"
  items: "center"
  justify: "between"
}
```

**Tailwind Classes:** `flex flex-row gap-8 items-center justify-between`

#### Styling
```typescript
background: "white"
border: "b"
className: "px-6 py-4"
```

**Tailwind Classes:** `bg-white border-b px-6 py-4`

#### Complete Expected Classes
```
sticky top-0 z-50 flex flex-row gap-8 items-center justify-between bg-white border-b px-6 py-4
```

#### Usage
수평 네비게이션 바. 로고와 메뉴를 양쪽 끝에 배치할 때 사용합니다.

---

## Content Components

### Section

**ID:** `section-standard`
**Semantic Tag:** `<section>`
**Default Name:** `Section`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1.5rem"
}
```

**Tailwind Classes:** `flex flex-col gap-6`

#### Styling
```typescript
className: "py-8"
```

**Tailwind Classes:** `py-8`

#### Complete Expected Classes
```
flex flex-col gap-6 py-8
```

#### Usage
일반적인 섹션 컨테이너. 수직으로 컨텐츠를 배치합니다.

---

### Article

**ID:** `article-blog`
**Semantic Tag:** `<article>`
**Default Name:** `Article`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1rem"
}
```

**Tailwind Classes:** `flex flex-col gap-4`

#### Styling
```typescript
className: "prose prose-lg"
```

**Tailwind Classes:** `prose prose-lg`

#### Complete Expected Classes
```
flex flex-col gap-4 prose prose-lg
```

#### Usage
블로그 아티클이나 독립적인 컨텐츠. Tailwind Typography 플러그인 사용.

---

### Container Div

**ID:** `div-container`
**Semantic Tag:** `<div>`
**Default Name:** `Container`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
}
```

**Tailwind Classes:** `flex flex-col`

#### Styling
```typescript
className: "p-4"
```

**Tailwind Classes:** `p-4`

#### Complete Expected Classes
```
flex flex-col p-4
```

#### Usage
범용 컨테이너. 특별한 의미가 없는 wrapper로 사용합니다.

---

### Hero Section

**ID:** `hero-section`
**Semantic Tag:** `<section>`
**Default Name:** `Hero`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "2rem"
  items: "center"
  justify: "center"
}
```

**Tailwind Classes:** `flex flex-col gap-8 items-center justify-center`

#### Styling
```typescript
className: "min-h-[500px] px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
```

**Tailwind Classes:** `min-h-[500px] px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white`

#### Complete Expected Classes
```
flex flex-col gap-8 items-center justify-center min-h-[500px] px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white
```

#### Usage
메인 Hero 섹션. 그라디언트 배경과 중앙 정렬된 컨텐츠.

---

### Card

**ID:** `card-container`
**Semantic Tag:** `<div>`
**Default Name:** `Card`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1rem"
}
```

**Tailwind Classes:** `flex flex-col gap-4`

#### Styling
```typescript
className: "p-6 bg-white rounded-lg shadow-md border border-gray-200"
```

**Tailwind Classes:** `p-6 bg-white rounded-lg shadow-md border border-gray-200`

#### Complete Expected Classes
```
flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md border border-gray-200
```

#### Usage
카드 레이아웃. 그림자와 둥근 모서리가 있는 컨테이너.

---

### CTA Section

**ID:** `cta-section`
**Semantic Tag:** `<section>`
**Default Name:** `CTA`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1.5rem"
  items: "center"
  justify: "center"
}
```

**Tailwind Classes:** `flex flex-col gap-6 items-center justify-center`

#### Styling
```typescript
className: "py-16 px-4 text-center bg-blue-600 text-white rounded-lg"
```

**Tailwind Classes:** `py-16 px-4 text-center bg-blue-600 text-white rounded-lg`

#### Complete Expected Classes
```
flex flex-col gap-6 items-center justify-center py-16 px-4 text-center bg-blue-600 text-white rounded-lg
```

#### Usage
Call-to-Action 섹션. 버튼이나 중요한 메시지를 강조할 때 사용.

---

### Image Banner

**ID:** `image-banner`
**Semantic Tag:** `<div>`
**Default Name:** `ImageBanner`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "container"
container: {
  maxWidth: "full"
  padding: "0"
  centered: false
}
```

**Tailwind Classes:** `container max-w-full`

#### Styling
```typescript
className: "relative h-[400px] bg-gray-300 overflow-hidden"
```

**Tailwind Classes:** `relative h-[400px] bg-gray-300 overflow-hidden`

#### Complete Expected Classes
```
relative h-[400px] bg-gray-300 overflow-hidden container max-w-full
```

#### Usage
이미지 배너. 고정 높이를 가진 이미지 컨테이너.

---

## Form Components

### Form

**ID:** `form-standard`
**Semantic Tag:** `<form>`
**Default Name:** `Form`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "column"
  gap: "1.5rem"
}
```

**Tailwind Classes:** `flex flex-col gap-6`

#### Styling
```typescript
className: "max-w-md p-6 bg-white rounded-lg shadow"
```

**Tailwind Classes:** `max-w-md p-6 bg-white rounded-lg shadow`

#### Complete Expected Classes
```
flex flex-col gap-6 max-w-md p-6 bg-white rounded-lg shadow
```

#### Usage
폼 컨테이너. 입력 필드들을 수직으로 배치합니다.

---

### Button Group

**ID:** `button-group`
**Semantic Tag:** `<div>`
**Default Name:** `ButtonGroup`

#### Positioning
```typescript
type: "static"
```

**Tailwind Classes:** (none)

#### Layout
```typescript
type: "flex"
flex: {
  direction: "row"
  gap: "0.75rem"
  items: "center"
}
```

**Tailwind Classes:** `flex flex-row gap-3 items-center`

#### Styling
```typescript
className: "p-4"
```

**Tailwind Classes:** `p-4`

#### Complete Expected Classes
```
flex flex-row gap-3 items-center p-4
```

#### Usage
버튼 그룹. 여러 버튼을 수평으로 배치합니다.

---

## CSS 변환 규칙 (Schema → Tailwind)

### Spacing 변환

| Schema Value | Tailwind Class | Pixels |
|--------------|----------------|--------|
| `0.25rem` | `gap-1`, `p-1` | 4px |
| `0.5rem` | `gap-2`, `p-2` | 8px |
| `0.75rem` | `gap-3`, `p-3` | 12px |
| `1rem` | `gap-4`, `p-4` | 16px |
| `1.5rem` | `gap-6`, `p-6` | 24px |
| `2rem` | `gap-8`, `p-8` | 32px |
| `4rem` | `top-16`, `mt-16` | 64px |
| `16rem` | `w-64`, `max-w-64` | 256px |

**변환 공식:** `rem * 4 = Tailwind number` (1rem = 4 in Tailwind)

### Positioning 변환

| Schema Type | Tailwind Class |
|-------------|----------------|
| `static` | (none - default) |
| `fixed` | `fixed` |
| `sticky` | `sticky` |
| `absolute` | `absolute` |
| `relative` | `relative` |

**Position Values:**
- `top: 0` → `top-0`
- `right: 0` → `right-0`
- `zIndex: 50` → `z-50`

### Layout 변환

#### Flexbox

| Schema | Tailwind |
|--------|----------|
| `type: "flex"` | `flex` |
| `direction: "row"` | `flex-row` |
| `direction: "column"` | `flex-col` |
| `justify: "between"` | `justify-between` |
| `justify: "center"` | `justify-center` |
| `items: "center"` | `items-center` |
| `gap: "1rem"` | `gap-4` |

#### Grid

| Schema | Tailwind |
|--------|----------|
| `type: "grid"` | `grid` |
| `cols: 2` | `grid-cols-2` |
| `gap: "1.5rem"` | `gap-6` |

#### Container

| Schema | Tailwind |
|--------|----------|
| `type: "container"` | `container` |
| `maxWidth: "7xl"` | `max-w-7xl` |
| `centered: true` | `mx-auto` |
| `padding: "2rem"` | `px-8` |

### Responsive 변환

| Schema | Tailwind |
|--------|----------|
| `mobile: { hidden: true }` | `hidden` |
| `desktop: { hidden: false }` | `lg:block` |
| `tablet: { width: "50%" }` | `md:w-1/2` |

**Breakpoint Prefixes:**
- Mobile (0px-767px): (no prefix)
- Tablet (768px-1023px): `md:`
- Desktop (1024px+): `lg:`

---

## 컴포넌트 선택 가이드

### 페이지 구조 (Layout)

| 사용 목적 | 컴포넌트 | 특징 |
|----------|---------|-----|
| 상단 고정 헤더 | **Sticky Header** | sticky, top-0, z-50 |
| 메인 컨텐츠 영역 | **Main Content** | flex-1, container, max-w-7xl |
| 하단 Footer | **Footer** | bg-gray-100, border-t, full width |
| 그리드 레이아웃 | **Grid Container** | grid-cols-2, gap-6 |

### 네비게이션 (Navigation)

| 사용 목적 | 컴포넌트 | 특징 |
|----------|---------|-----|
| 좌측 사이드바 | **Left Sidebar** | w-64, sticky, border-r |
| 수평 메뉴 | **Horizontal Navbar** | flex-row, justify-between |

### 컨텐츠 (Content)

| 사용 목적 | 컴포넌트 | 특징 |
|----------|---------|-----|
| 일반 섹션 | **Section** | flex-col, gap-6, py-8 |
| 블로그 글 | **Article** | prose, prose-lg |
| 범용 컨테이너 | **Container Div** | flex-col, p-4 |
| Hero 배너 | **Hero Section** | min-h-[500px], gradient, centered |
| 카드 | **Card** | rounded-lg, shadow-md, border |
| CTA 버튼 영역 | **CTA Section** | bg-blue-600, text-white, py-16 |
| 이미지 배너 | **Image Banner** | h-[400px], overflow-hidden |

### 폼 (Form)

| 사용 목적 | 컴포넌트 | 특징 |
|----------|---------|-----|
| 폼 컨테이너 | **Form** | flex-col, gap-6, max-w-md |
| 버튼 그룹 | **Button Group** | flex-row, gap-3, items-center |

---

## Best Practices

### 1. Semantic Tag 선택

- **Header/Footer**: 페이지 전체 → `<header>`, `<footer>`
- **Navigation**: 메뉴 → `<nav>`, `<aside>`
- **Main Content**: 주요 컨텐츠 → `<main>`
- **Sections**: 주제별 그룹 → `<section>`
- **Articles**: 독립적인 컨텐츠 → `<article>`
- **Forms**: 사용자 입력 → `<form>`
- **Generic**: 특별한 의미 없음 → `<div>`

### 2. Positioning 선택

- **Header**: `sticky` 또는 `fixed` (top-0, z-50)
- **Footer**: `static` (default flow)
- **Sidebar**: `sticky` (top-16, header 아래)
- **Main**: `static` with `flex-1`
- **Modal/Overlay**: `fixed` (z-50+)

### 3. Layout 선택

- **Page Structure**: `flex` with `direction: "column"`
- **Horizontal Menu**: `flex` with `direction: "row"`
- **Card Grid**: `grid` with `cols: 2` or `cols: 3`
- **Centered Content**: `container` with `centered: true`

### 4. Responsive Strategy

```typescript
// 모바일에서 숨기고 데스크탑에서 표시
responsive: {
  mobile: { hidden: true }
  desktop: { hidden: false }
}
// → hidden lg:block

// 모바일 전체 너비, 데스크탑 절반 너비
responsive: {
  mobile: { width: "100%" }
  desktop: { width: "50%" }
}
// → w-full lg:w-1/2
```

---

## 참고 문서

- **Schema Types**: `types/schema.ts`
- **Component Library**: `lib/component-library.ts`
- **Code Generator**: `lib/code-generator.ts`
- **Tailwind Config**: `tailwind.config.ts`
- **Best Practice Validator**: `lib/prompt-bp-validator.ts`
