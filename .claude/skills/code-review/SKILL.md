---
name: code-review
description: Review code for Visual Layout Builder quality standards including TypeScript patterns, React 2025 best practices, accessibility, and performance. Use when reviewing PRs, checking code quality, or ensuring compliance with project conventions.
allowed-tools: Read, Glob, Grep
---

# Code Review Skill

Visual Layout Builder 프로젝트의 2025 코드 품질 표준에 따른 코드 리뷰 전문 스킬입니다. TypeScript, React, 접근성, 성능 기준을 검증합니다.

## When to Use

- PR 코드 리뷰
- 새로운 기능 코드 검토
- 리팩토링 전 코드 분석
- TypeScript 타입 안전성 검토
- React 컴포넌트 패턴 검증
- 접근성(a11y) 준수 확인
- 성능 이슈 식별

## Code Quality Checklist

### TypeScript Patterns

#### ✅ DO

```typescript
// Standard function components with direct prop typing
type HeaderProps = PropsWithChildren<{
  variant?: 'default' | 'sticky' | 'fixed'
  className?: string
  role?: React.AriaRole
}>

function Header({ children, variant = 'default', className, role = 'banner' }: HeaderProps) {
  return (
    <header className={cn('...', className)} role={role}>
      {children}
    </header>
  )
}

export { Header }
export type { HeaderProps }
```

#### ❌ DON'T

```typescript
// Don't use React.FC (not recommended in 2025)
const Header: React.FC<HeaderProps> = ({ children }) => { ... }

// Don't use any without type narrowing
const data: any = fetchData()

// Don't hardcode demo content in components
return <header>My Company Name</header>
```

### React 2025 Best Practices

#### Component Structure

```typescript
// ✅ Good: Separation of component and usage
// components/Header.tsx
function Header({ children, variant }: HeaderProps) {
  return <header>{children}</header>
}

// app/page.tsx
function Page() {
  return <Header variant="sticky"><Logo /><Nav /></Header>
}
```

#### Responsive Without Duplication

```typescript
// ❌ Bad: Duplicate components for breakpoints
<div className="block md:hidden"><Header>Mobile</Header></div>
<div className="hidden md:block"><Header>Desktop</Header></div>

// ✅ Good: Single component with responsive behavior
<Header>
  <div className="flex items-center justify-between">
    <Logo />
    <nav className="hidden lg:flex gap-6"><NavLinks /></nav>
    <button className="lg:hidden"><MenuIcon /></button>
  </div>
</Header>
```

#### Utility Function (cn)

```typescript
// Every component should have cn() utility inline or imported
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  'base-classes',
  variant === 'active' && 'active-classes',
  className
)}>
```

### Accessibility (WCAG 2.2)

#### Required Attributes

```typescript
// ✅ All interactive elements need accessibility attributes
<header
  role="banner"
  aria-label="Main navigation"
>

<nav
  role="navigation"
  aria-label="Primary"
>

<main
  role="main"
  aria-label="Page content"
>

<button
  type="button"
  aria-label="Open menu"
  aria-expanded={isOpen}
>
```

#### Keyboard Navigation

```typescript
// ✅ Focus states are required
<button
  className="focus:outline-none focus:ring-2 focus:ring-offset-2"
  onKeyDown={handleKeyDown}
>
```

#### Screen Reader Support

```typescript
// ✅ Skip links for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Zustand Store Patterns

#### Action Naming

```typescript
// ✅ Always include action name for DevTools
set((state) => ({
  schema: updatedSchema
}), false, "updateSchema")  // ← Action name
```

#### Selector Optimization

```typescript
// ✅ Use shallow comparison for derived state
import { useShallow } from 'zustand/react/shallow'

const components = useLayoutStore(
  useShallow((state) => {
    const layout = state.schema.layouts[state.currentBreakpoint]
    return state.schema.components.filter(c => layout.components.includes(c.id))
  })
)
```

#### State Immutability

```typescript
// ✅ Immutable updates
set((state) => ({
  schema: {
    ...state.schema,
    components: state.schema.components.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  }
}))

// ❌ Mutation (don't do this)
set((state) => {
  state.schema.components[0].name = 'NewName'  // Mutating!
  return state
})
```

### Performance Patterns

#### Memoization

```typescript
// ✅ Memoize expensive components
import { memo } from 'react'

const HeavyComponent = memo(function HeavyComponent({ data }: Props) {
  return <div>{/* expensive rendering */}</div>
})
```

#### Lazy Loading

```typescript
// ✅ Code splitting for large components
import { lazy, Suspense } from 'react'

const DashboardContent = lazy(() => import('./DashboardContent'))

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  )
}
```

#### useMemo for Expensive Calculations

```typescript
// ✅ Memoize expensive calculations
const linkGroups = useMemo(
  () => calculateLinkGroups(componentIds, componentLinks),
  [componentIds, componentLinks]
)
```

### Schema Normalization

```typescript
// ✅ Always normalize after schema changes
import { normalizeSchema } from '@/lib/schema-utils'

const updatedSchema = { ...schema, components: newComponents }
const normalizedSchema = normalizeSchema(updatedSchema)
// Use normalizedSchema
```

### Error Handling

```typescript
// ✅ Proper error boundaries
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

## Code Smell Detection

### Over-Engineering

```typescript
// ❌ Over-engineered: unnecessary abstraction
class ComponentFactory {
  static create(type: string) { ... }
}

// ✅ Simple: direct implementation
function createComponent(type: string): Component { ... }
```

### Dead Code

```typescript
// ❌ Unused imports
import { unusedFunction } from './utils'

// ❌ Commented-out code
// const oldImplementation = () => { ... }

// ❌ Unused variables
const unused = 'never used'
```

### Magic Numbers

```typescript
// ❌ Magic numbers
if (components.length > 10) { ... }

// ✅ Named constants
const MAX_BREAKPOINTS = 10
if (components.length > MAX_BREAKPOINTS) { ... }
```

## Review Checklist Template

```markdown
## Code Review Checklist

### TypeScript
- [ ] No `any` types without justification
- [ ] Proper type exports
- [ ] Function components use direct prop typing (not React.FC)

### React Patterns
- [ ] No component duplication for responsive
- [ ] Proper use of cn() utility
- [ ] Memoization where needed

### Accessibility
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Focus states styled

### State Management
- [ ] Immutable updates
- [ ] Action names for DevTools
- [ ] Shallow selectors for derived state

### Schema
- [ ] normalizeSchema() called after changes
- [ ] Component names are PascalCase
- [ ] Canvas layouts validated

### Testing
- [ ] Tests added for new features
- [ ] Edge cases covered
- [ ] AAA pattern followed

### Performance
- [ ] No unnecessary re-renders
- [ ] Large components code-split
- [ ] Expensive calculations memoized
```

## Common Review Comments

### Type Safety

```
Consider adding explicit return type:
- function process(data) → function process(data: Input): Output
```

### Component Patterns

```
This component could benefit from memo() since it receives
the same props frequently but parent re-renders often.
```

### Accessibility

```
Missing aria-label on this interactive element.
Screen readers won't announce its purpose.
```

### Performance

```
This calculation runs on every render.
Consider wrapping in useMemo with appropriate dependencies.
```

### Schema

```
normalizeSchema() should be called after modifying
schema.layouts to ensure breakpoint inheritance.
```

## Reference Files

- `docs/dev-log/2025-11-17-code-quality-improvement-strategy.md`
- `docs/dev-log/2025-11-17-ideal-code-example.tsx`
- `CLAUDE.md` - Code Quality Guidelines section
- `types/schema.ts` - Type definitions
- `lib/utils.ts` - cn() utility
