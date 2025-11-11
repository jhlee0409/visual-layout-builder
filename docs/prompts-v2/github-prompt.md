# Layout Code Generation Request

Generate a responsive layout using REACT and TAILWIND.

## Requirements

- Framework: react
- CSS Solution: tailwind
- TypeScript: Yes
- Schema Version: 2.0

## Components (3)

1. **GlobalHeader** (`<header>`)
   - Positioning: fixed (top: 0, left: 0, right: 0, zIndex: 50)
   - Layout: container
   - Responsive: No
2. **Sidebar** (`<nav>`)
   - Positioning: sticky (top: 4rem)
   - Layout: flex
   - Responsive: Yes
3. **MainContent** (`<main>`)
   - Positioning: static
   - Layout: container
   - Responsive: No

## Breakpoints

- **mobile**: 0px+
- **tablet**: 768px+
- **desktop**: 1024px+

## Layout Structure

Structure Type: **sidebar-main**

Component Order:
1. GlobalHeader (c1)
2. Sidebar (c2)
3. MainContent (c3)


Roles:
- header: c1
- sidebar: c2
- main: c3

## Expected Code Structure

### Component Files

#### `components/GlobalHeader.tsx`

```tsx
export function GlobalHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        {children || "Global Header"}
      </div>
    </header>
  )
}
```

#### `components/Sidebar.tsx`

```tsx
export function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-16 flex flex-col gap-2 w-64 border-r hidden md:hidden lg:block">
      {children || "Navigation Menu"}
    </nav>
  )
}
```

#### `components/MainContent.tsx`

```tsx
export function MainContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="container max-w-7xl mx-auto px-8">
        {children || "Main Content Area"}
      </div>
    </main>
  )
}
```

### Layout Composition

#### `app/page.tsx` or `app/layout.tsx`

```tsx
import { GlobalHeader } from "@/components/GlobalHeader"
import { Sidebar } from "@/components/Sidebar"
import { MainContent } from "@/components/MainContent"

export default function Layout() {
  return (
    <>
      <GlobalHeader />
      <div className="flex pt-16">
        <Sidebar />
        <MainContent>
          {/* Page content goes here */}
        </MainContent>
      </div>
    </>
  )
}
```

## Responsive Behavior

- **Sidebar**: Hidden on mobile, Hidden on tablet, Visible on desktop

## Additional Requirements

1. **Component Independence**: Each component should be self-contained with its own positioning, layout, and styling.
2. **Semantic HTML**: Use appropriate HTML5 semantic tags (`<header>`, `<nav>`, `<main>`, `<footer>`, etc.).
3. **Flexbox First**: Use Flexbox for page structure, Grid only for card layouts.
4. **Tailwind Classes**: Use Tailwind utility classes for all styling.
5. **Responsive Design**: Follow mobile-first approach with responsive modifiers (`md:`, `lg:`).
6. **Clean Code**: Generate production-ready, clean, and maintainable code.

## Output Format

Please generate:
1. Individual component files (`components/[ComponentName].tsx`)
2. Main layout file (`app/page.tsx` or `app/layout.tsx`)
3. All components should be properly typed with TypeScript
4. Use React functional components with proper props typing