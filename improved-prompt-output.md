**Note:** This is a specification-based task. Follow the schema exactly without creative deviations.

You are a senior React developer with expertise in modern web development, responsive design, and best practices.

**Your Task:**
Generate a production-quality, responsive layout component based on the provided Laylder Schema specifications.

**Schema Architecture (Component Independence):**

The Laylder Schema follows a **Component-First** approach where each component is independently defined with its own:
- **Positioning Strategy**: How the component is positioned (fixed, sticky, static, absolute, relative)
- **Layout System**: Internal layout structure (flexbox, CSS grid, container, or none)
- **Styling**: Visual properties (width, height, background, border, shadow, custom classes)
- **Responsive Behavior**: Breakpoint-specific overrides (mobile, tablet, desktop)

**Core Principles:**
1. **Component Independence**: Each component operates independently with its own positioning and layout
2. **Flexbox First**: Use Flexbox for page structure, CSS Grid only for card/content layouts
3. **Semantic HTML First**: Follow HTML5 semantic principles (header, nav, main, aside, footer, section, article)
4. **Mobile First**: Implement responsive design with mobile-first approach (base styles for mobile, then md: for tablet, lg: for desktop)
5. **Breakpoint Inheritance**: Mobile → Tablet → Desktop cascade (unspecified breakpoints inherit from previous breakpoint)

**Quality Standards:**
- Production-ready code quality
- Type-safe TypeScript implementation
- Accessible semantic HTML
- Clean, maintainable code structure
- Proper use of Tailwind CSS utility classes
- Responsive design following mobile-first principles

**Code Quality Standards (2025):**

**TypeScript Component Patterns:**
- ❌ **DO NOT** use `React.FC` or `React.FunctionComponent` (not recommended in 2025)
- ✅ **DO** use standard function components with direct prop typing
- ✅ **DO** use utility types: `PropsWithChildren`, `ComponentPropsWithoutRef`
- ✅ **DO** use `React.AriaRole` for role attributes (type-safe)
- ✅ **DO** export proper TypeScript types for all components
- ✅ **DO** include JSDoc comments for all exported components

**Example Component Pattern:**
```typescript
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
        'w-full border-b border-gray-300 px-4 py-4',
        { 'sticky top-0 z-50': variant === 'sticky' },
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
```

**Component Structure Best Practices:**
- ✅ **DO** use `cn()` utility for conditional className merging
- ✅ **DO** separate component definition from usage
- ✅ **DO** use composition patterns for complex components (e.g., `Card.Header`, `Card.Body`)
- ❌ **DO NOT** duplicate components for different breakpoints
- ❌ **DO NOT** mix demo content with component logic
- ✅ **DO** only generate layout structure with component name + ID as content

**Required Utilities:**
Every generated codebase MUST include this utility function:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Responsive Design Without Duplication:**
```typescript
// ❌ DON'T: Duplicate components
<div className="block md:hidden"><Header>Mobile</Header></div>
<div className="hidden md:block"><Header>Desktop</Header></div>

// ✅ DO: Single component with responsive behavior
<div className="col-span-full">
  <Header>
    <nav className="hidden lg:flex gap-6">Desktop Nav</nav>
    <button className="lg:hidden">Mobile Menu</button>
  </Header>
</div>
```

**🎨 Layout-Only Code Generation (2025 Philosophy):**

This is a **pure layout builder tool**. We provide ONLY the structural layout - users will add their own themes and styling.

**✅ DO Generate:**
- Component wrapper with correct semantic tag
- Positioning classes (sticky, fixed, absolute, relative, static)
- Layout classes (flex, grid, container)
- **Minimal** borders for layout division (e.g., `border-b`, `border-r`, `border border-gray-300`)
- Responsive behavior (hidden, width overrides, responsive utilities)
- ARIA attributes for accessibility (role, aria-label, etc.)
- Focus states for keyboard navigation (`focus-within:ring-2`)
- Motion reduce support (`motion-reduce:transition-none`)
- **Content**: Just display the component name and ID (e.g., "Header (c1)")

**❌ DO NOT Generate:**
- Theme colors (`bg-blue`, `bg-purple`, `text-white`, gradients)
- Shadows (`shadow-sm`, `shadow-md`, `shadow-lg`)
- Rounded corners (`rounded-lg`, `rounded-xl`) - users will style these
- Background colors (`bg-white`, `bg-gray-100`) - keep transparent or minimal gray for division only
- Typography styles (`prose`, `font-fancy`) - users will apply their own
- Detailed placeholder content, mock text, or feature highlights
- Navigation links, buttons, or interactive elements
- Any creative additions beyond the schema specifications

**🚨 CRITICAL - User Theme Freedom:**
The generated layout must be a **blank canvas** for users to apply their own:
- Brand colors
- Custom shadows
- Border radius styles
- Background patterns
- Typography systems

Only use gray-scale colors for layout division (e.g., `border-gray-300`). All theme colors will be added by the user.

**Approach:**
1. Read and understand the complete Schema specification
2. Plan the component structure and relationships
3. Implement each component following its specifications exactly
4. Apply responsive behavior for each breakpoint
5. Ensure accessibility and semantic HTML compliance

Let's build a high-quality, production-ready layout.

---

## Components

You need to create 4 components with the following specifications:

### 1. Header (c1)
- **Semantic Tag:** `<header>`
- **Component Name:** `Header`

**Positioning:**
- Type: `sticky`
- Position values: top: 0, zIndex: 50

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `1rem`
- Centered: true

**Styling:**
- Border: `b`
- Custom classes: `focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none`

**Props (Accessibility & Attributes):**
- role: "banner"
- aria-label: "Main navigation"

---

### 2. MainContent (c2)
- **Semantic Tag:** `<main>`
- **Component Name:** `MainContent`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `2rem`

**Styling:**
- Custom classes: `min-h-screen px-4 py-8`

**Props (Accessibility & Attributes):**
- role: "main"

---

### 3. Sidebar (c3)
- **Semantic Tag:** `<aside>`
- **Component Name:** `Sidebar`

**Positioning:**
- Type: `sticky`
- Position values: top: 64

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1rem`

**Styling:**
- Border: `r`
- Custom classes: `h-full`

**Props (Accessibility & Attributes):**
- role: "complementary"
- aria-label: "Sidebar navigation"

**Responsive Behavior:**
- Mobile: hidden
- Desktop: visible

---

### 4. Footer (c4)
- **Semantic Tag:** `<footer>`
- **Component Name:** `Footer`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `2rem 1rem`
- Centered: true

**Styling:**
- Border: `t`

**Props (Accessibility & Attributes):**
- role: "contentinfo"
- aria-label: "Site footer"

---


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **4-column × 8-row grid system** with 3 components.

- Row 0: Header (c1, full width)
- Row 1-6: MainContent (c2, full width)
- Row 7: Footer (c4, full width)

**Spatial Relationships:**

- **Header (c1)** spans **FULL WIDTH** as a header bar
- **MainContent (c2)** spans **FULL WIDTH** as a full-width section
- **Footer (c4)** spans **FULL WIDTH** as a footer bar

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.header {
  grid-area: 1 / 1 / 2 / 5;
}
.maincontent {
  grid-area: 2 / 1 / 8 / 5;
}
.footer {
  grid-area: 8 / 1 / 9 / 5;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-4 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-full row-span-1`
- **MainContent (c2)**: `col-span-full row-start-2 row-end-8`
- **Footer (c4)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- While this layout could use Flexbox, CSS Grid is **strongly recommended** for precise positioning and future flexibility
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **mobile** breakpoint - other breakpoints may have different arrangements

**Page Flow:** `vertical` (vertical scrolling with horizontal content areas)

**🚨 IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**Component Order (DOM):**

For screen readers and SEO crawlers, the HTML source order is:

⚠️ **Note:** Visual positioning may differ from DOM order. Use Canvas Grid coordinates for layout.

1. c1 (Canvas row 0)
2. c2 (Canvas row 1)
3. c4 (Canvas row 7)

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!

### 2. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 4 components.

- Row 0: Header (c1, full width)
- Row 1-6: Sidebar (c3, cols 0-1), MainContent (c2, cols 2-9)
- Row 7: Footer (c4, full width)

**Spatial Relationships:**

- **Sidebar (c3)** is positioned to the **LEFT** of **MainContent (c2)**
- **Sidebar (c3)** acts as a **SIDEBAR** (narrow column spanning multiple rows on the left)
- **Header (c1)** spans **FULL WIDTH** as a header bar
- **Footer (c4)** spans **FULL WIDTH** as a footer bar
- **MainContent (c2), Sidebar (c3)** are positioned **SIDE-BY-SIDE** in the same row

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.header {
  grid-area: 1 / 1 / 2 / 13;
}
.sidebar {
  grid-area: 2 / 1 / 8 / 3;
}
.maincontent {
  grid-area: 2 / 3 / 8 / 11;
}
.footer {
  grid-area: 8 / 1 / 9 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-full row-span-1`
- **Sidebar (c3)**: `col-span-2 row-start-2 row-end-8`
- **MainContent (c2)**: `col-start-3 col-end-11 row-start-2 row-end-8`
- **Footer (c4)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- 🚨 **CRITICAL**: This layout has components positioned **side-by-side** in the same row. You MUST use CSS Grid (not flexbox column) to achieve horizontal positioning. DO NOT stack these components vertically!
- **Use CSS Grid** for the main layout container due to complex 2D positioning. Create a grid container with `display: grid; grid-template-columns: repeat(12, 1fr);`
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- **Sidebar** should be implemented as a sticky sidebar (use `position: sticky` with appropriate `top` value) positioned on the left side
- For side-by-side components: Use grid-column spans to place components horizontally. Example: Component A uses `grid-column: 1 / 4`, Component B uses `grid-column: 4 / 9`, both with the same `grid-row` value
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **desktop** breakpoint - other breakpoints may have different arrangements

**Page Flow:** `sidebar-main` (vertical scrolling with horizontal content areas)

**🚨 IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**Component Order (DOM):**

For screen readers and SEO crawlers, the HTML source order is:

⚠️ **Note:** Visual positioning may differ from DOM order. Use Canvas Grid coordinates for layout.

1. c1 (Canvas row 0)
2. c3 (Canvas row 1)
3. c2 (Canvas row 1)
4. c4 (Canvas row 7)

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!

**Layout Roles:**
- **Header:** c1
- **Sidebar:** c3
- **Main:** c2
- **Footer:** c4


---

## Implementation Instructions

### Positioning Guidelines

- **static**: Default flow (no position class needed)
- **fixed**: Use Tailwind `fixed` with position values (e.g., `fixed top-0 left-0 right-0 z-50`)
- **sticky**: Use Tailwind `sticky` with position values (e.g., `sticky top-0 z-40`)
- **absolute**: Use Tailwind `absolute` with position values
- **relative**: Use Tailwind `relative`

### Layout Guidelines

- **flex**: Use Tailwind flex utilities (`flex`, `flex-col`, `justify-center`, `items-center`, `gap-4`, etc.)
- **grid**: Use Tailwind grid utilities (`grid`, `grid-cols-3`, `gap-4`, etc.)
- **container**: Wrap content in a container div with max-width and centering
- **none**: No specific layout - let content flow naturally

### Responsive Design Guidelines

- **Mobile First**: Base styles apply to mobile, use `md:` and `lg:` prefixes for larger breakpoints
- **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)
- **Override Strategy**: Use responsive prefixes to override inherited styles
  - Example: `hidden md:block` = hidden on mobile, visible on tablet+
  - Example: `w-full md:w-1/2 lg:w-1/3` = full width on mobile, half on tablet, third on desktop

### Code Quality Checklist

**TypeScript & Component Structure:**
- [ ] Use standard function components (NOT `React.FC`)
- [ ] Use utility types (`PropsWithChildren`, `ComponentPropsWithoutRef`)
- [ ] Use `React.AriaRole` for role attributes
- [ ] Export component and props type separately
- [ ] Include JSDoc comments for all components
- [ ] Use `cn()` utility for all className operations

**Layout & Responsive:**
- [ ] All components use specified semantic tags
- [ ] Positioning and layout follow specifications exactly
- [ ] Responsive behavior implemented for all breakpoints
- [ ] NO component duplication across breakpoints (use responsive classes instead)
- [ ] Single component instances with responsive content

**Accessibility:**
- [ ] ARIA labels and roles are type-safe
- [ ] Keyboard navigation support (`focus:ring-2`, `focus:outline-none`)
- [ ] Screen reader support (semantic tags + ARIA)

**Content & Code Quality:**
- [ ] **Content: ONLY display component name + ID** (e.g., "Header (c1)")
- [ ] **NO placeholder content, mock data, or creative additions**
- [ ] Code is clean, readable, and well-commented
- [ ] Include `lib/utils.ts` with `cn()` function

---

## Full Schema (JSON)


For reference, here is the complete Schema in JSON format:


```json

{
  "schemaVersion": "2.0",
  "components": [
    {
      "id": "c1",
      "name": "Header",
      "semanticTag": "header",
      "positioning": {
        "type": "sticky",
        "position": {
          "top": 0,
          "zIndex": 50
        }
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "1rem",
          "centered": true
        }
      },
      "styling": {
        "border": "b",
        "className": "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none"
      },
      "props": {
        "children": "Header Content",
        "role": "banner",
        "aria-label": "Main navigation"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 0,
          "width": 4,
          "height": 1
        },
        "desktop": {
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 1
        }
      }
    },
    {
      "id": "c2",
      "name": "MainContent",
      "semanticTag": "main",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "2rem"
        }
      },
      "styling": {
        "className": "min-h-screen px-4 py-8"
      },
      "props": {
        "children": "Main Content",
        "role": "main"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 1,
          "width": 4,
          "height": 6
        },
        "desktop": {
          "x": 2,
          "y": 1,
          "width": 8,
          "height": 6
        }
      }
    },
    {
      "id": "c3",
      "name": "Sidebar",
      "semanticTag": "aside",
      "positioning": {
        "type": "sticky",
        "position": {
          "top": 64
        }
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1rem"
        }
      },
      "styling": {
        "border": "r",
        "className": "h-full"
      },
      "props": {
        "role": "complementary",
        "aria-label": "Sidebar navigation"
      },
      "responsive": {
        "mobile": {
          "hidden": true
        },
        "desktop": {
          "hidden": false
        }
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 1,
          "width": 2,
          "height": 6
        }
      }
    },
    {
      "id": "c4",
      "name": "Footer",
      "semanticTag": "footer",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "2rem 1rem",
          "centered": true
        }
      },
      "styling": {
        "border": "t"
      },
      "props": {
        "children": "Footer Content",
        "role": "contentinfo",
        "aria-label": "Site footer"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 7,
          "width": 4,
          "height": 1
        },
        "desktop": {
          "x": 0,
          "y": 7,
          "width": 12,
          "height": 1
        }
      }
    }
  ],
  "breakpoints": [
    {
      "name": "mobile",
      "minWidth": 0,
      "gridCols": 4,
      "gridRows": 8
    },
    {
      "name": "desktop",
      "minWidth": 1024,
      "gridCols": 12,
      "gridRows": 8
    }
  ],
  "layouts": {
    "mobile": {
      "structure": "vertical",
      "components": [
        "c1",
        "c2",
        "c4"
      ]
    },
    "desktop": {
      "structure": "sidebar-main",
      "components": [
        "c1",
        "c3",
        "c2",
        "c4"
      ],
      "roles": {
        "header": "c1",
        "sidebar": "c3",
        "main": "c2",
        "footer": "c4"
      }
    }
  }
}

```
