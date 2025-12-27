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

You need to create 1 components with the following specifications:

### 1. CardGrid (c1)
- **Semantic Tag:** `<section>`
- **Component Name:** `CardGrid`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `grid`
- Columns: `3`
- Rows: `2`
- Gap: `1.5rem`
- Auto flow: `row dense`

**Styling:**
- Custom classes: `p-8`

---


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **4-column × 8-row grid system** with 1 components.

- Row 0-5: CardGrid (c1, full width)

**Spatial Relationships:**

- **CardGrid (c1)** spans **FULL WIDTH** as a full-width section

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.cardgrid {
  grid-area: 1 / 1 / 7 / 5;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-4 grid-rows-8 gap-4`

Components:
- **CardGrid (c1)**: `col-span-full row-span-6`

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

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!

### 2. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 1 components.

- Row 0-3: CardGrid (c1, full width)

**Spatial Relationships:**

- **CardGrid (c1)** spans **FULL WIDTH** as a full-width section

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.cardgrid {
  grid-area: 1 / 1 / 5 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **CardGrid (c1)**: `col-span-full row-span-4`

**Implementation Strategy:**

- While this layout could use Flexbox, CSS Grid is **strongly recommended** for precise positioning and future flexibility
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **desktop** breakpoint - other breakpoints may have different arrangements

**Page Flow:** `vertical` (vertical scrolling with horizontal content areas)

**🚨 IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**DOM Order (Reference Only - DO NOT use for visual positioning):**

For screen readers and SEO crawlers, the HTML source order is:

1. c1 (Canvas row 0)

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!


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
      "name": "CardGrid",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "grid",
        "grid": {
          "cols": 3,
          "rows": 2,
          "gap": "1.5rem",
          "autoFlow": "row dense"
        }
      },
      "styling": {
        "className": "p-8"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 0,
          "width": 4,
          "height": 6
        },
        "desktop": {
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 4
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
        "c1"
      ]
    },
    "desktop": {
      "structure": "vertical",
      "components": [
        "c1"
      ]
    }
  }
}

```
