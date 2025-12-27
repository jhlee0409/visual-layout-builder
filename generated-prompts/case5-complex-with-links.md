**Note:** This is a specification-based task. Follow the schema exactly without creative deviations.

You are a senior React developer with expertise in modern web development, responsive design, and best practices.

**Your Task:**
Generate a production-quality, responsive layout component based on the provided Visual Layout Builder Schema specifications.

**Schema Architecture (Component Independence):**

The Visual Layout Builder Schema follows a **Component-First** approach where each component is independently defined with its own:
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

**Code Style (2025 Best Practices):**
- ❌ **DO NOT** use `React.FC` type (deprecated pattern)
- ✅ **DO** use explicit function signatures: `function Component(props: Props) { ... }`
- ✅ **DO** use modern React patterns (no class components, hooks only)
- ❌ **DO NOT** add placeholder content or mock data
- ✅ **DO** only generate layout structure with component name + ID as content

**Layout-Only Code Generation:**
This is a **layout builder tool**. Generate **ONLY** the structural layout code:
- Component wrapper with correct semantic tag
- Positioning classes (sticky, fixed, etc.)
- Layout classes (flex, grid, container)
- Styling classes (background, border, shadow)
- Responsive behavior (hidden, width overrides)
- **Content**: Just display the component name and ID (e.g., "Header (c1)")

**DO NOT generate:**
- Detailed placeholder content
- Mock text, descriptions, or feature highlights
- Navigation links, buttons, or interactive elements
- Any creative additions beyond the schema specifications

**Approach:**
1. Read and understand the complete Schema specification
2. Plan the component structure and relationships
3. Implement each component following its specifications exactly
4. Apply responsive behavior for each breakpoint
5. Ensure accessibility and semantic HTML compliance

Let's build a high-quality, production-ready layout.

---

## Components

You need to create 6 components with the following specifications:

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
- Background: `white`
- Border: `b`
- Shadow: `sm`

---

### 2. Header (c2)
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
- Background: `white`
- Border: `b`
- Shadow: `sm`

---

### 3. Sidebar (c3)
- **Semantic Tag:** `<aside>`
- **Component Name:** `Sidebar`

**Positioning:**
- Type: `sticky`
- Position values: top: 64, left: 0

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1rem`

**Styling:**
- Background: `gray-50`
- Border: `r`

---

### 4. MainContent (c4)
- **Semantic Tag:** `<main>`
- **Component Name:** `MainContent`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `2rem`

**Styling:**
- Custom classes: `p-8`

---

### 5. Footer (c5)
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
- Background: `gray-100`
- Border: `t`

---

### 6. Footer (c6)
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
- Background: `gray-100`
- Border: `t`

---


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **4-column × 8-row grid system** with 3 components.

- Row 0: Header (c1, full width)
- Row 1-6: MainContent (c4, full width)
- Row 7: Footer (c5, full width)

**Spatial Relationships:**

- **Header (c1)** spans **FULL WIDTH** as a header bar
- **MainContent (c4)** spans **FULL WIDTH** as a full-width section
- **Footer (c5)** spans **FULL WIDTH** as a footer bar

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
- **MainContent (c4)**: `col-span-full row-start-2 row-end-8`
- **Footer (c5)**: `col-span-full row-start-8 row-end-9`

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

**DOM Order (Reference Only - DO NOT use for visual positioning):**

For screen readers and SEO crawlers, the HTML source order is:

1. c1 (Canvas row 0)
2. c4 (Canvas row 1)
3. c5 (Canvas row 7)

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!

### 2. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 6 components.

- Row 0: Header (c1, cols 0-3), Header (c2, full width)
- Row 1-6: Sidebar (c3, cols 0-2), MainContent (c4, cols 3-11)
- Row 7: Footer (c5, cols 0-3), Footer (c6, full width)

**Spatial Relationships:**

- **Header (c1)** is positioned to the **LEFT** of **Header (c2)**
- **Sidebar (c3)** is positioned to the **LEFT** of **MainContent (c4)**
- **Footer (c5)** is positioned to the **LEFT** of **Footer (c6)**
- **Sidebar (c3)** acts as a **SIDEBAR** (narrow column spanning multiple rows on the left)
- **Header (c2)** spans **FULL WIDTH** as a header bar
- **Footer (c6)** spans **FULL WIDTH** as a footer bar
- **Header (c1), Header (c2)** are positioned **SIDE-BY-SIDE** in the same row
- **Sidebar (c3), MainContent (c4)** are positioned **SIDE-BY-SIDE** in the same row
- **Footer (c5), Footer (c6)** are positioned **SIDE-BY-SIDE** in the same row

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
  grid-area: 1 / 1 / 2 / 5;
}
.header {
  grid-area: 1 / 1 / 2 / 13;
}
.sidebar {
  grid-area: 2 / 1 / 8 / 4;
}
.maincontent {
  grid-area: 2 / 4 / 8 / 13;
}
.footer {
  grid-area: 8 / 1 / 9 / 5;
}
.footer {
  grid-area: 8 / 1 / 9 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-4 row-span-1`
- **Header (c2)**: `col-span-full row-span-1`
- **Sidebar (c3)**: `col-span-3 row-start-2 row-end-8`
- **MainContent (c4)**: `col-start-4 col-end-13 row-start-2 row-end-8`
- **Footer (c5)**: `col-span-4 row-start-8 row-end-9`
- **Footer (c6)**: `col-span-full row-start-8 row-end-9`

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

**DOM Order (Reference Only - DO NOT use for visual positioning):**

For screen readers and SEO crawlers, the HTML source order is:

1. c2 (Canvas row 0)
2. c1 (Canvas row 0)
3. c3 (Canvas row 1)
4. c4 (Canvas row 1)
5. c6 (Canvas row 7)
6. c5 (Canvas row 7)

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!


---

## Component Links (Cross-Breakpoint Relationships)


The following components are **linked** and represent the **SAME UI element** across different breakpoints:


**Group 1:** Header (c1), Header (c2)

**Group 2:** Footer (c5), Footer (c6)


🚨 **CRITICAL IMPLEMENTATION RULE - Component Links:**

Components in the same link group MUST be rendered as a **SINGLE React component** with responsive styling.
DO NOT create separate React components for each component ID in a group.

**Implementation Strategy:**
- Each link group = 1 React component definition
- Total unique components: 2 (NOT 6)
- Use Tailwind responsive classes for breakpoint-specific styling
- Apply grid positioning for each breakpoint using responsive grid utilities

**Example (CORRECT - 2025 Pattern):**
```tsx
// Group 1: Header (c1 @ mobile), Header (c2 @ desktop) → SINGLE component
interface HeaderProps {}

function Header({}: HeaderProps) {
  return (
    <header className="
      sticky top-0 z-50 bg-white border-b shadow-sm
      col-span-full row-span-1
    ">
      Header (c1/c2)
    </header>
  )
}
```

**Example (WRONG - DO NOT DO THIS):**
```tsx
// ❌ WRONG: Separate components for same UI element
const HeaderMobile: React.FC = () => <header>...</header>  // c1 ❌
const HeaderDesktop: React.FC = () => <header>...</header> // c2 ❌

// ❌ WRONG: Using deprecated React.FC
const Header: React.FC<Props> = ({ children }) => { ... }
```

**Breakpoint-Specific Components (No Links):**

If a component exists ONLY in certain breakpoints (e.g., Sidebar only on desktop), use conditional rendering:

```tsx
// Component appears only on desktop (≥1024px)
function Sidebar({}: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-4 ...">
      Sidebar (c4)
    </aside>
  )
}
```


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

- [ ] All components use specified semantic tags
- [ ] TypeScript types are properly defined (use explicit function signatures, NOT React.FC)
- [ ] Positioning and layout follow specifications exactly
- [ ] Responsive behavior is implemented for all breakpoints
- [ ] Code is clean, readable, and well-commented
- [ ] Accessibility is considered (ARIA labels, keyboard navigation)
- [ ] **Content: ONLY display component name + ID** (e.g., "Header (c1)")
- [ ] **NO placeholder content, mock data, or creative additions**

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
        "background": "white",
        "border": "b",
        "shadow": "sm"
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
          "width": 4,
          "height": 1
        }
      }
    },
    {
      "id": "c2",
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
        "background": "white",
        "border": "b",
        "shadow": "sm"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 1
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
          "top": 64,
          "left": 0
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
        "background": "gray-50",
        "border": "r"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 1,
          "width": 3,
          "height": 6
        }
      }
    },
    {
      "id": "c4",
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
        "className": "p-8"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 1,
          "width": 4,
          "height": 6
        },
        "desktop": {
          "x": 3,
          "y": 1,
          "width": 9,
          "height": 6
        }
      }
    },
    {
      "id": "c5",
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
        "background": "gray-100",
        "border": "t"
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
          "width": 4,
          "height": 1
        }
      }
    },
    {
      "id": "c6",
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
        "background": "gray-100",
        "border": "t"
      },
      "responsiveCanvasLayout": {
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
        "c4",
        "c5"
      ]
    },
    "desktop": {
      "structure": "sidebar-main",
      "components": [
        "c2",
        "c1",
        "c3",
        "c4",
        "c6",
        "c5"
      ]
    }
  }
}

```
