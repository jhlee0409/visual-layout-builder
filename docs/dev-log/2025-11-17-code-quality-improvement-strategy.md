# Code Quality Improvement Strategy (2025-11-17)

## 📋 Overview

This document outlines a comprehensive strategy to improve the quality of AI-generated React code from Laylder's prompt system, based on 2025 industry best practices.

---

## 🔍 Current Code Analysis

### ❌ Issues with Current Generated Code

#### 1. **React.FC Usage (Not Recommended in 2025)**

```typescript
// ❌ Current approach
const Header: React.FC<HeaderProps> = ({ children, role, 'aria-label': ariaLabel }) => {
  return <header>...</header>
}
```

**Problems:**
- **Not deprecated**, but **no longer recommended** (as of TypeScript 5.1+)
- Less flexible with generic components
- Implicit behavior may hide intent
- Community consensus: direct prop typing is simpler and better

**Why it's problematic:**
- React.FC adds unnecessary abstraction
- Type inference issues with generics
- Doesn't align with modern React development patterns
- Creates confusion for developers familiar with current best practices

#### 2. **Excessive Grid Complexity**

```typescript
// ❌ Current approach: Too many hidden/shown toggles
<div className="col-span-full row-span-1 lg:hidden">
  <Header>...</Header>
</div>
<div className="hidden lg:col-span-full lg:row-span-1 lg:block">
  <Header>...</Header>
</div>
```

**Problems:**
- Duplicate component instances across breakpoints
- Hard to maintain when components need updates
- Bloated DOM (hidden elements still exist)
- Difficult to read and understand layout logic

#### 3. **Missing Modern React Patterns**

**Current code lacks:**
- Component composition patterns
- Utility type usage (`PropsWithChildren`, `ComponentPropsWithoutRef`)
- `cn` utility for conditional classNames
- Proper type narrowing with discriminated unions
- React.memo for performance optimization
- Lazy loading for code splitting

#### 4. **Hardcoded Content in Components**

```typescript
// ❌ Current approach
<Header>
  <h1 className="text-xl font-bold">Header Content (Mobile)</h1>
  <p className="text-sm text-gray-600">Navigation • Menu • Logo</p>
</Header>
```

**Problems:**
- Demo content mixed with component structure
- Not production-ready (needs to be replaced)
- Doesn't demonstrate proper data flow patterns

#### 5. **Inconsistent Type Safety**

```typescript
// ❌ Current approach
interface HeaderProps {
  children: React.ReactNode
  role?: string
  'aria-label'?: string
}
```

**Problems:**
- `role` should use `React.AriaRole` type
- ARIA attributes should use proper React types
- Missing HTML attribute spreading support

---

## ✅ 2025 React Best Practices

Based on industry research and React 19 features:

### 1. **Function Components with Direct Typing**

```typescript
// ✅ Recommended approach
type HeaderProps = {
  children: React.ReactNode
  role?: React.AriaRole
  'aria-label'?: string
}

function Header({ children, role, 'aria-label': ariaLabel }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </header>
  )
}

// Or with explicit return type
function Header({ children, role, 'aria-label': ariaLabel }: HeaderProps): JSX.Element {
  return <header>...</header>
}
```

**Benefits:**
- ✅ Simpler, more explicit syntax
- ✅ Better generic component support
- ✅ Aligns with community standards
- ✅ Easier to read and understand

### 2. **Utility Types for Better Type Safety**

```typescript
// ✅ Use built-in utility types
import type { PropsWithChildren, ComponentPropsWithoutRef } from 'react'

// For components with children
type CardProps = PropsWithChildren<{
  variant?: 'default' | 'outlined' | 'filled'
}>

// For components extending HTML elements
type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary'
}
```

### 3. **Discriminated Unions for State Modeling**

```typescript
// ✅ Type-safe state modeling
type ComponentState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: Data }

function Component({ state }: { state: ComponentState }) {
  switch (state.status) {
    case 'loading':
      return <Spinner />
    case 'error':
      return <Error message={state.error.message} />
    case 'success':
      return <Content data={state.data} />
  }
}
```

### 4. **cn Utility for Conditional Classes**

```typescript
// ✅ Use clsx/tailwind-merge for className management
import { cn } from '@/lib/utils'

type ButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Button({ variant = 'primary', size = 'md', className }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-semibold transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
    />
  )
}
```

### 5. **Responsive Design Without Duplication**

```typescript
// ✅ Single component with responsive classes
function Layout() {
  return (
    <div className="grid grid-cols-4 gap-4 lg:grid-cols-12">
      {/* Single Header component with responsive behavior */}
      <div className="col-span-full">
        <Header>
          {/* Content adapts based on viewport */}
          <div className="flex items-center justify-between">
            <Logo />
            <nav className="hidden md:block">
              <NavigationMenu />
            </nav>
            <MobileMenu className="md:hidden" />
          </div>
        </Header>
      </div>

      {/* Responsive grid items */}
      <div className="col-span-full lg:col-span-2">
        <Sidebar />
      </div>
      <div className="col-span-full lg:col-span-10">
        <MainContent />
      </div>
    </div>
  )
}
```

### 6. **Component Composition Pattern**

```typescript
// ✅ Composable components
type CardProps = PropsWithChildren<{
  className?: string
}>

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-300 bg-white', className)}>
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('border-b border-gray-200 p-4', className)}>
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className }: CardProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('border-t border-gray-200 p-4', className)}>
      {children}
    </div>
  )
}

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### 7. **Performance Optimization**

```typescript
// ✅ Memoization for expensive components
import { memo } from 'react'

type HeavyComponentProps = {
  data: ComplexData[]
  onAction: (id: string) => void
}

const HeavyComponent = memo(function HeavyComponent({ data, onAction }: HeavyComponentProps) {
  return (
    <div>
      {data.map(item => (
        <ComplexItem key={item.id} data={item} onAction={onAction} />
      ))}
    </div>
  )
})

// ✅ Lazy loading for code splitting
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

### 8. **Proper ARIA and Accessibility**

```typescript
// ✅ Type-safe ARIA attributes
import type { AriaRole, AriaAttributes } from 'react'

type AccessibleComponentProps = {
  role?: AriaRole
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
} & AriaAttributes

function AccessibleComponent(props: AccessibleComponentProps) {
  const { role, 'aria-label': ariaLabel, ...rest } = props
  return (
    <div role={role} aria-label={ariaLabel} {...rest}>
      Content
    </div>
  )
}
```

---

## 🎯 Prompt Improvement Strategy

### Strategy 1: Update Code Quality Guidelines Section

**Add to prompt:**

```markdown
## Code Quality Standards (2025)

### TypeScript Component Patterns

**DO:**
- ✅ Use standard function components with direct prop typing
- ✅ Use utility types: `PropsWithChildren`, `ComponentPropsWithoutRef`
- ✅ Use discriminated unions for state modeling
- ✅ Use `React.AriaRole` for role attributes
- ✅ Export proper TypeScript types for all components
- ✅ Use `cn()` utility for conditional className merging

**DON'T:**
- ❌ Don't use `React.FC` or `React.FunctionComponent`
- ❌ Don't use `any` or `unknown` without proper type narrowing
- ❌ Don't use string literals for role attributes
- ❌ Don't hardcode demo content in production components

### Component Structure

**DO:**
- ✅ Separate component definition from usage
- ✅ Use composition patterns for complex components
- ✅ Implement proper prop spreading for HTML attributes
- ✅ Use memo() for performance-critical components
- ✅ Implement lazy loading for large components

**DON'T:**
- ❌ Don't duplicate components across breakpoints
- ❌ Don't mix demo content with component logic
- ❌ Don't create overly complex conditional rendering

### Example: Recommended Component Pattern

\`\`\`typescript
import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type HeaderProps = PropsWithChildren<{
  variant?: 'default' | 'sticky' | 'fixed'
  className?: string
  role?: React.AriaRole
  'aria-label'?: string
}>

/**
 * Header component for page navigation
 * @param variant - Positioning strategy (default: 'default')
 * @param className - Additional Tailwind classes
 */
function Header({
  children,
  variant = 'default',
  className,
  role = 'banner',
  'aria-label': ariaLabel,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'w-full border-b border-gray-300 bg-white px-4 py-4',
        {
          'sticky top-0 z-50': variant === 'sticky',
          'fixed top-0 left-0 right-0 z-50': variant === 'fixed',
        },
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </header>
  )
}

export { Header }
export type { HeaderProps }
\`\`\`
```

### Strategy 2: Add Utility Functions to Generated Code

**Always include these utilities:**

```markdown
## Required Utility Functions

Include the following utility function in every generated code:

\`\`\`typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

**Usage:** Import and use `cn()` for all className construction.
```

### Strategy 3: Improve Responsive Layout Strategy

**Replace duplication with smart responsive design:**

```markdown
## Responsive Layout Implementation

**CRITICAL: Avoid Component Duplication**

Instead of creating separate component instances for each breakpoint, use responsive Tailwind classes:

\`\`\`typescript
// ❌ DON'T: Duplicate components
<div className="block md:hidden"><Header>Mobile</Header></div>
<div className="hidden md:block"><Header>Desktop</Header></div>

// ✅ DO: Single component with responsive behavior
<div className="col-span-full">
  <Header>
    <div className="flex items-center justify-between">
      <Logo />
      {/* Responsive navigation */}
      <nav className="hidden lg:flex gap-6">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>
      {/* Mobile menu button */}
      <button className="lg:hidden">
        <MenuIcon />
      </button>
    </div>
  </Header>
</div>
\`\`\`

**Grid Layout Strategy:**

For breakpoint-specific layouts, use responsive grid classes:

\`\`\`typescript
// ✅ Responsive grid without duplication
<div className="grid gap-4 grid-cols-4 lg:grid-cols-12">
  {/* Header: Full width on all breakpoints */}
  <div className="col-span-full">
    <Header />
  </div>

  {/* Sidebar: Hidden on mobile, 2 cols on desktop */}
  <aside className="hidden lg:block lg:col-span-2">
    <Sidebar />
  </aside>

  {/* Main: Full width mobile, 10 cols desktop */}
  <main className="col-span-full lg:col-span-10">
    <Content />
  </main>

  {/* Footer: Full width on all breakpoints */}
  <div className="col-span-full">
    <Footer />
  </div>
</div>
\`\`\`
```

### Strategy 4: Separate Component Files

**Generate proper file structure:**

```markdown
## File Organization

Generate the following file structure:

\`\`\`
/components
  /layout
    Header.tsx          # Individual component files
    Footer.tsx
    Sidebar.tsx
    MainContent.tsx
  /ui
    Card.tsx
    Button.tsx
    Section.tsx
  Layout.tsx            # Main layout composition
/lib
  utils.ts              # Utility functions (cn, etc.)
  types.ts              # Shared TypeScript types
\`\`\`

Each component file should:
- Export the component as named export
- Export the props type
- Include JSDoc comments
- Be self-contained and reusable
```

### Strategy 5: Add Production-Ready Patterns

```markdown
## Production-Ready Code Patterns

### 1. Error Boundaries

Wrap complex components with error boundaries:

\`\`\`typescript
import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong.</div>
    }

    return this.props.children
  }
}
\`\`\`

### 2. Loading States

Implement proper loading UI:

\`\`\`typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

function Component() {
  const [state, setState] = useState<LoadingState>('idle')

  return (
    <>
      {state === 'loading' && <Spinner />}
      {state === 'error' && <ErrorMessage />}
      {state === 'success' && <Content />}
    </>
  )
}
\`\`\`

### 3. Accessibility First

Always include:
- Semantic HTML tags
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader support

\`\`\`typescript
function AccessibleButton({
  onClick,
  children,
  isLoading,
  disabled,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled}
      className={cn(
        'rounded-lg px-4 py-2',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
\`\`\`
```

---

## 📝 Implementation Checklist

When updating the prompt generator:

- [ ] Remove all references to `React.FC`
- [ ] Add `cn()` utility to all generated code
- [ ] Use standard function components with direct typing
- [ ] Implement utility types (`PropsWithChildren`, etc.)
- [ ] Avoid component duplication across breakpoints
- [ ] Add JSDoc comments to all components
- [ ] Export proper TypeScript types
- [ ] Use semantic HTML with ARIA attributes
- [ ] Include error boundaries for production readiness
- [ ] Implement proper loading states
- [ ] Add keyboard navigation support
- [ ] Generate separate component files
- [ ] Include utility file (cn, types, etc.)

---

## 🎓 References

- [React TypeScript Cheatsheets](https://github.com/typescript-cheatsheets/react)
- [Total TypeScript - React.FC](https://www.totaltypescript.com/you-can-stop-hating-react-fc)
- [React 19 Features](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/utility-first)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

---

## 🚀 Next Steps

1. Update `lib/prompt-generator.ts` with new code quality guidelines
2. Create new prompt template with 2025 best practices
3. Test generated code quality with sample schemas
4. Update CLAUDE.md with Code Quality Guidelines section
5. Create example "ideal output" for reference
