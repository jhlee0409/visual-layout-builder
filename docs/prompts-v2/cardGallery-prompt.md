# Layout Code Generation Request

Generate a responsive layout using REACT and TAILWIND.

## Requirements

- Framework: react
- CSS Solution: tailwind
- TypeScript: Yes
- Schema Version: 2.0

## Components (2)

1. **PageHeader** (`<header>`)
   - Positioning: sticky (top: 0, zIndex: 50)
   - Layout: container
   - Responsive: No
2. **CardGrid** (`<main>`)
   - Positioning: static
   - Layout: grid
   - Responsive: Yes

## Breakpoints

- **mobile**: 0px+
- **tablet**: 768px+
- **desktop**: 1024px+

## Layout Structure

Structure Type: **vertical**

Component Order:
1. PageHeader (c1)
2. CardGrid (c2)


Roles:
- header: c1
- main: c2

## Expected Code Structure

### Component Files

#### `components/PageHeader.tsx`

```tsx
export function PageHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container max-w-7xl mx-auto">
        {children || "Gallery"}
      </div>
    </header>
  )
}
```

#### `components/CardGrid.tsx`

```tsx
export function CardGrid({ children }: { children?: React.ReactNode }) {
  return (
    <main className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 flex-1 container mx-auto max-w-7xl px-8 py-8">
      {children || "Card items will be placed here"}
    </main>
  )
}
```

### Layout Composition

#### `app/page.tsx` or `app/layout.tsx`

```tsx
import { PageHeader } from "@/components/PageHeader"
import { CardGrid } from "@/components/CardGrid"

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader />
      <CardGrid />
    </div>
  )
}
```

## Responsive Behavior

- **CardGrid**: 

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