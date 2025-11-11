# Layout Code Generation Request

Generate a responsive layout using REACT and TAILWIND.

## Requirements

- Framework: react
- CSS Solution: tailwind
- TypeScript: Yes
- Schema Version: 2.0

## Components (4)

1. **SiteHeader** (`<header>`)
   - Positioning: sticky (top: 0, zIndex: 50)
   - Layout: flex
   - Responsive: No
2. **HeroSection** (`<section>`)
   - Positioning: static
   - Layout: container
   - Responsive: No
3. **FeaturesSection** (`<section>`)
   - Positioning: static
   - Layout: container
   - Responsive: No
4. **SiteFooter** (`<footer>`)
   - Positioning: static
   - Layout: container
   - Responsive: No

## Breakpoints

- **mobile**: 0px+
- **tablet**: 768px+
- **desktop**: 1024px+

## Layout Structure

Structure Type: **vertical**

Component Order:
1. SiteHeader (c1)
2. HeroSection (c2)
3. FeaturesSection (c3)
4. SiteFooter (c4)


Roles:
- header: c1
- main: c2
- footer: c4

## Expected Code Structure

### Component Files

#### `components/SiteHeader.tsx`

```tsx
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 flex flex-row justify-between items-center bg-white border-b shadow-sm px-6 py-4">
      {children || "Company Logo"}
    </header>
  )
}
```

#### `components/HeroSection.tsx`

```tsx
export function HeroSection({ children }: { children?: React.ReactNode }) {
  return (
    <section>
      <div className="container max-w-7xl mx-auto">
        {children || "Hero Content"}
      </div>
    </section>
  )
}
```

#### `components/FeaturesSection.tsx`

```tsx
export function FeaturesSection({ children }: { children?: React.ReactNode }) {
  return (
    <section>
      <div className="container max-w-7xl mx-auto">
        {children || "Features"}
      </div>
    </section>
  )
}
```

#### `components/SiteFooter.tsx`

```tsx
export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="container max-w-7xl mx-auto px-8">
        {children || "Footer"}
      </div>
    </footer>
  )
}
```

### Layout Composition

#### `app/page.tsx` or `app/layout.tsx`

```tsx
import { SiteHeader } from "@/components/SiteHeader"
import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { SiteFooter } from "@/components/SiteFooter"

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <SiteFooter />
    </div>
  )
}
```

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