# Layout Code Generation Request

Generate a responsive layout using REACT and TAILWIND.

## Requirements

- Framework: react
- CSS Solution: tailwind
- TypeScript: Yes
- Schema Version: 2.0

## Components (3)

1. **TopNavbar** (`<header>`)
   - Positioning: fixed (top: 0, left: 0, right: 0, zIndex: 50)
   - Layout: flex
   - Responsive: No
2. **SideMenu** (`<nav>`)
   - Positioning: fixed (top: 4rem, left: 0, bottom: 0)
   - Layout: flex
   - Responsive: Yes
3. **DashboardContent** (`<main>`)
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
1. TopNavbar (c1)
2. SideMenu (c2)
3. DashboardContent (c3)


Roles:
- header: c1
- sidebar: c2
- main: c3

## Expected Code Structure

### Component Files

#### `components/TopNavbar.tsx`

```tsx
export function TopNavbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex flex-row justify-between items-center h-16 bg-slate-900 text-white px-6">
      {children || "Dashboard"}
    </header>
  )
}
```

#### `components/SideMenu.tsx`

```tsx
export function SideMenu({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="fixed top-16 bottom-0 left-0 flex flex-col gap-1 w-64 bg-slate-800 text-white p-4 hidden md:block lg:block">
      {children || "Menu"}
    </nav>
  )
}
```

#### `components/DashboardContent.tsx`

```tsx
export function DashboardContent({ children }: { children?: React.ReactNode }) {
  return (
    <main className="ml-0 lg:ml-64 pt-16">
      <div className="container px-8">
        {children || "Dashboard Content"}
      </div>
    </main>
  )
}
```

### Layout Composition

#### `app/page.tsx` or `app/layout.tsx`

```tsx
import { TopNavbar } from "@/components/TopNavbar"
import { SideMenu } from "@/components/SideMenu"
import { DashboardContent } from "@/components/DashboardContent"

export default function Layout() {
  return (
    <>
      <TopNavbar />
      <div className="flex pt-16">
        <SideMenu />
        <DashboardContent>
          {/* Page content goes here */}
        </DashboardContent>
      </div>
    </>
  )
}
```

## Responsive Behavior

- **SideMenu**: Hidden on mobile, Visible on desktop

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