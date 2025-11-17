/**
 * IDEAL CODE EXAMPLE (2025 Best Practices)
 *
 * This file demonstrates how AI should generate React components
 * following modern TypeScript and React 19 patterns.
 *
 * Key improvements:
 * - No React.FC usage
 * - Direct prop typing
 * - Utility types (PropsWithChildren, etc.)
 * - cn() utility for className merging
 * - No component duplication
 * - Proper TypeScript types
 * - JSDoc comments
 * - Accessibility-first approach
 */

import type { PropsWithChildren, ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Common props for layout components
 */
type LayoutComponentProps = {
  className?: string
  role?: React.AriaRole
  'aria-label'?: string
}

/**
 * Positioning variant types
 */
type PositioningVariant = 'static' | 'sticky' | 'fixed' | 'absolute' | 'relative'

// ============================================================================
// Header Component
// ============================================================================

type HeaderProps = PropsWithChildren<
  LayoutComponentProps & {
    variant?: 'sticky' | 'fixed' | 'default'
  }
>

/**
 * Header component for page navigation
 * Supports sticky and fixed positioning strategies
 *
 * @example
 * ```tsx
 * <Header variant="sticky" aria-label="Main navigation">
 *   <nav>Navigation content</nav>
 * </Header>
 * ```
 */
function Header({
  children,
  variant = 'sticky',
  className,
  role = 'banner',
  'aria-label': ariaLabel,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'mx-auto w-full max-w-full border-b border-gray-300 bg-white px-4 py-4',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-900',
        'focus-within:ring-offset-2 motion-reduce:transition-none',
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

// ============================================================================
// Footer Component
// ============================================================================

type FooterProps = PropsWithChildren<LayoutComponentProps>

/**
 * Footer component for site footer content
 * Uses static positioning by default
 *
 * @example
 * ```tsx
 * <Footer aria-label="Site footer">
 *   <p>© 2024 Company Name</p>
 * </Footer>
 * ```
 */
function Footer({
  children,
  className,
  role = 'contentinfo',
  'aria-label': ariaLabel,
}: FooterProps) {
  return (
    <footer
      className={cn(
        'mx-auto w-full max-w-full border-t border-gray-300 px-4 py-8',
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </footer>
  )
}

// ============================================================================
// Section Component
// ============================================================================

type SectionProps = PropsWithChildren<LayoutComponentProps>

/**
 * Section component for content areas
 * Uses flexbox layout with configurable gap
 *
 * @example
 * ```tsx
 * <Section aria-label="Features section">
 *   <h2>Features</h2>
 *   <p>Description</p>
 * </Section>
 * ```
 */
function Section({
  children,
  className,
  role,
  'aria-label': ariaLabel,
}: SectionProps) {
  return (
    <section
      className={cn('flex flex-col gap-6 py-8', className)}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}

// ============================================================================
// Card Component (Composition Pattern)
// ============================================================================

type CardProps = PropsWithChildren<{
  className?: string
  variant?: 'default' | 'outlined' | 'filled'
}>

/**
 * Card component with composition pattern
 * Supports Header, Body, and Footer subcomponents
 *
 * @example
 * ```tsx
 * <Card variant="outlined">
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Actions</Card.Footer>
 * </Card>
 * ```
 */
function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg',
        {
          'border border-gray-300 bg-white': variant === 'default',
          'border-2 border-gray-400 bg-white': variant === 'outlined',
          'bg-gray-100': variant === 'filled',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Card header subcomponent
 */
Card.Header = function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('border-b border-gray-200 p-6', className)}>
      {children}
    </div>
  )
}

/**
 * Card body subcomponent
 */
Card.Body = function CardBody({ children, className }: CardProps) {
  return <div className={cn('flex flex-col gap-4 p-6', className)}>{children}</div>
}

/**
 * Card footer subcomponent
 */
Card.Footer = function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('border-t border-gray-200 p-6', className)}>
      {children}
    </div>
  )
}

// ============================================================================
// Hero Component
// ============================================================================

type HeroProps = PropsWithChildren<LayoutComponentProps>

/**
 * Hero section component for prominent content
 * Centered layout with flexbox
 *
 * @example
 * ```tsx
 * <Hero aria-label="Hero section">
 *   <h1>Welcome</h1>
 *   <p>Description</p>
 * </Hero>
 * ```
 */
function Hero({
  children,
  className,
  role = 'region',
  'aria-label': ariaLabel,
}: HeroProps) {
  return (
    <section
      className={cn(
        'flex min-h-[500px] flex-col items-center justify-center gap-8',
        'border border-gray-300 px-4 text-center',
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}

// ============================================================================
// Main Layout Component (Single, No Duplication)
// ============================================================================

/**
 * Main layout component
 * Implements responsive grid without component duplication
 *
 * Features:
 * - Mobile: 4-column grid, vertical stack
 * - Desktop: 12-column grid, complex layout with sidebars
 */
function Layout() {
  return (
    <div className="grid grid-cols-4 grid-rows-8 gap-4 lg:grid-cols-12 lg:grid-rows-8">
      {/* Header - Single instance, responsive content */}
      <div className="col-span-full row-span-1">
        <Header variant="sticky" aria-label="Main navigation">
          {/* Mobile: Simple header */}
          <div className="flex items-center justify-between lg:hidden">
            <h1 className="text-xl font-bold">Logo</h1>
            <button
              className="rounded p-2 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Desktop: Full navigation */}
          <div className="hidden items-center justify-between lg:flex">
            <h1 className="text-2xl font-bold">Company Logo</h1>
            <nav className="flex gap-6">
              <a href="/" className="hover:text-blue-600">
                Home
              </a>
              <a href="/about" className="hover:text-blue-600">
                About
              </a>
              <a href="/contact" className="hover:text-blue-600">
                Contact
              </a>
            </nav>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Sign In
            </button>
          </div>
        </Header>
      </div>

      {/* Hero - Desktop only */}
      <div className="hidden lg:col-span-full lg:row-start-2 lg:row-end-4 lg:block">
        <Hero aria-label="Hero section">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to Our Platform
          </h1>
          <p className="max-w-2xl text-xl text-gray-600">
            Discover amazing features and capabilities designed to enhance your
            experience.
          </p>
          <button className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
            Get Started
          </button>
        </Hero>
      </div>

      {/* Main Content Area - Responsive grid positioning */}
      <div className="col-span-full row-start-2 row-end-5 lg:col-span-2 lg:row-start-4 lg:row-end-8">
        <Card variant="outlined">
          <Card.Header>
            <h3 className="text-lg font-semibold">Sidebar Card</h3>
          </Card.Header>
          <Card.Body>
            <p className="text-sm text-gray-600">
              This sidebar appears on desktop only, positioned on the left.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Feature 1
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Feature 2
              </li>
            </ul>
          </Card.Body>
        </Card>
      </div>

      {/* Section 1 - Responsive positioning */}
      <div className="col-span-full row-start-5 row-end-8 lg:col-start-3 lg:col-end-7 lg:row-start-4 lg:row-end-8">
        <Section>
          <h2 className="text-3xl font-bold">Main Content Section</h2>
          <p className="leading-relaxed text-gray-700">
            This section adapts its position based on viewport size. On mobile,
            it stacks vertically. On desktop, it's part of a complex grid layout.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-purple-200 bg-purple-50 p-4">
              <h4 className="mb-2 font-semibold">Content Block 1</h4>
              <p className="text-sm text-gray-600">
                Description of feature or content
              </p>
            </div>
            <div className="rounded border border-purple-200 bg-purple-50 p-4">
              <h4 className="mb-2 font-semibold">Content Block 2</h4>
              <p className="text-sm text-gray-600">
                Description of feature or content
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* Additional desktop-only sections */}
      <div className="hidden lg:col-start-7 lg:col-end-9 lg:row-start-4 lg:row-end-8 lg:block">
        <Card>
          <Card.Body>
            <h3 className="text-lg font-semibold">Middle Card</h3>
            <p className="text-sm text-gray-600">
              This card appears between main content and right section on desktop.
            </p>
          </Card.Body>
        </Card>
      </div>

      <div className="hidden lg:col-start-9 lg:col-end-13 lg:row-start-4 lg:row-end-8 lg:block">
        <Section>
          <h2 className="text-3xl font-bold">Right Section</h2>
          <p className="leading-relaxed text-gray-700">
            Additional content area on the right side of desktop layout.
          </p>
        </Section>
      </div>

      {/* Footer - Single instance */}
      <div className="col-span-full row-start-8 row-end-9">
        <Footer aria-label="Site footer">
          {/* Mobile: Simple footer */}
          <p className="text-center text-sm text-gray-600 lg:hidden">
            © 2024 Company Name
          </p>

          {/* Desktop: Rich footer */}
          <div className="hidden items-center justify-between lg:flex">
            <p className="text-sm text-gray-600">
              © 2024 Company Name. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="transition-colors hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="transition-colors hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </Footer>
      </div>
    </div>
  )
}

// ============================================================================
// Icon Components (Placeholder)
// ============================================================================

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { Layout, Header, Footer, Section, Card, Hero }
export type { HeaderProps, FooterProps, SectionProps, CardProps, HeroProps }

// ============================================================================
// Usage Example
// ============================================================================

/**
 * Example usage in a Next.js page:
 *
 * ```tsx
 * import { Layout } from '@/components/Layout'
 *
 * export default function HomePage() {
 *   return <Layout />
 * }
 * ```
 *
 * Example usage with custom content:
 *
 * ```tsx
 * import { Header, Section, Footer } from '@/components/Layout'
 *
 * export default function CustomPage() {
 *   return (
 *     <div className="grid grid-cols-4 lg:grid-cols-12">
 *       <div className="col-span-full">
 *         <Header>
 *           <YourNavigationComponent />
 *         </Header>
 *       </div>
 *
 *       <div className="col-span-full lg:col-span-8">
 *         <Section>
 *           <YourMainContent />
 *         </Section>
 *       </div>
 *
 *       <div className="col-span-full">
 *         <Footer>
 *           <YourFooterContent />
 *         </Footer>
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */
