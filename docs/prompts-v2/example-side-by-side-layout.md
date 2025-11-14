You are an expert React developer. Generate a responsive layout component based on the following Schema specifications.

**Schema Architecture:**
- **Component Independence**: Each component has its own positioning, layout, styling, and responsive behavior
- **Flexbox First**: Use Flexbox for page structure, CSS Grid only for card/content layouts
- **Semantic HTML**: Follow HTML5 semantic principles
- **Mobile First**: Implement responsive design with mobile-first approach
- **Breakpoint Inheritance**: Mobile → Tablet → Desktop cascade (명시되지 않은 breakpoint는 이전 breakpoint 설정 자동 상속)

**Requirements:**
- Use React functional components with TypeScript
- Use Tailwind CSS utility classes for all styling
- Each component must implement its specified positioning, layout, and styling
- Follow the exact specifications provided for each component
- Apply mobile-first responsive design: base styles for mobile, then md: for tablet, lg: for desktop

---

## Components

You need to create 5 components with the following specifications:

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

**Default Props:**
```json
{
  "children": "Header Content"
}
```

### 2. Footer (c2)
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

**Default Props:**
```json
{
  "children": "Footer Content"
}
```

### 3. Sidebar (c3)
- **Semantic Tag:** `<aside>`
- **Component Name:** `Sidebar`

**Positioning:**
- Type: `sticky`
- Position values: top: 4rem, zIndex: 40

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1rem`

**Styling:**
- Width: `16rem`
- Background: `gray-50`
- Border: `r`

**Default Props:**
```json
{
  "children": "Sidebar Navigation"
}
```

### 4. Section (c4)
- **Semantic Tag:** `<section>`
- **Component Name:** `Section`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1.5rem`

**Styling:**
- Custom classes: `py-8`

**Default Props:**
```json
{
  "children": "Section Content"
}
```

### 5. Section (c5)
- **Semantic Tag:** `<section>`
- **Component Name:** `Section`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1.5rem`

**Styling:**
- Custom classes: `py-8`

**Default Props:**
```json
{
  "children": "Section Content"
}
```


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 5 components.

- Row 0: Header (c1, full width)
- Row 1-6: Sidebar (c3, cols 0-2), Section (c4, cols 3-7), Section (c5, cols 8-11)
- Row 7: Footer (c2, full width)

**Spatial Relationships:**

- **Sidebar (c3)** is positioned to the **LEFT** of **Section (c4)**
- **Section (c4)** is positioned to the **LEFT** of **Section (c5)**
- **Sidebar (c3)** acts as a **SIDEBAR** (narrow column spanning multiple rows on the left)
- **Header (c1)** spans **FULL WIDTH** as a header bar
- **Footer (c2)** spans **FULL WIDTH** as a footer bar
- **Sidebar (c3), Section (c4), Section (c5)** are positioned **SIDE-BY-SIDE** in the same row

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
  grid-area: 2 / 1 / 8 / 4;
}
.section {
  grid-area: 2 / 4 / 8 / 9;
}
.section {
  grid-area: 2 / 9 / 8 / 13;
}
.footer {
  grid-area: 8 / 1 / 9 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-full row-span-1`
- **Sidebar (c3)**: `col-span-3 row-start-2 row-end-8`
- **Section (c4)**: `col-start-4 col-end-9 row-start-2 row-end-8`
- **Section (c5)**: `col-start-9 col-end-13 row-start-2 row-end-8`
- **Footer (c2)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- **Use CSS Grid** for the main layout container (not simple flexbox) due to complex 2D positioning
- Set up a `display: grid` container with `grid-template-columns: repeat(12, 1fr)`
- Each component should use `grid-area` or `grid-column`/`grid-row` to specify its exact position
- **Sidebar** should be implemented as a sticky or fixed sidebar on the left
- Components in the **same row** should be placed **side-by-side** using grid columns, NOT stacked vertically
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **desktop** breakpoint - other breakpoints may have different arrangements

**Layout Structure:** `vertical`

**Component Order (DOM):**

For accessibility and SEO, the DOM order is:

1. c1
2. c2
3. c3
4. c4
5. c5

**Note:** Visual positioning (above) may differ from DOM order.


---

## Implementation Instructions

1. **Main Layout Component:**
   - Create a main container component (e.g., `ResponsiveLayout` or `RootLayout`)
   - Implement responsive structure changes using Tailwind breakpoints
   - Follow the structure specifications for each breakpoint (vertical/horizontal/sidebar-main)

2. **Component Implementation:**
   - Each component MUST use its specified semantic tag
   - Apply positioning classes according to component specifications
   - Implement layout (flex/grid/container) as specified
   - Add styling classes as specified
   - Implement responsive behavior for each breakpoint

3. **Positioning Guidelines:**
   - `static`: Default flow (no position class needed)
   - `fixed`: Use Tailwind `fixed` with specified position values (e.g., `fixed top-0 left-0 right-0 z-50`)
   - `sticky`: Use Tailwind `sticky` with specified position values
   - `absolute`: Use Tailwind `absolute` with specified position values
   - `relative`: Use Tailwind `relative`

4. **Layout Guidelines:**
   - `flex`: Use Tailwind flex utilities (`flex`, `flex-col`, `justify-center`, etc.)
   - `grid`: Use Tailwind grid utilities (`grid`, `grid-cols-3`, `gap-4`, etc.)
   - `container`: Wrap content in a container div with max-width and centering
   - `none`: No specific layout - let content flow naturally

5. **Responsive Behavior:**
   - **Mobile First Approach**: Base styles apply to mobile, use md: and lg: prefixes for larger breakpoints
   - **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)
   - **Override Strategy**: Use responsive prefixes to override inherited styles (e.g., `hidden md:block` = hidden on mobile, visible on tablet+)
   - Use Tailwind responsive prefixes (`md:`, `lg:`) for tablet and desktop
   - Handle visibility changes (hidden/block) as specified
   - Apply responsive width/order changes as specified

6. **Code Quality:**
   - Use TypeScript with proper type definitions
   - Follow React best practices (functional components, hooks)
   - Use semantic HTML5 tags as specified
   - Add placeholder content for demonstration
   - Keep component code clean and maintainable

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
      "props": {
        "children": "Header Content"
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
      "id": "c2",
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
      "props": {
        "children": "Footer Content"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 7,
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
          "top": "4rem",
          "zIndex": 40
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
        "width": "16rem",
        "background": "gray-50",
        "border": "r"
      },
      "props": {
        "children": "Sidebar Navigation"
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
      "name": "Section",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1.5rem"
        }
      },
      "styling": {
        "className": "py-8"
      },
      "props": {
        "children": "Section Content"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 3,
          "y": 1,
          "width": 5,
          "height": 6
        }
      }
    },
    {
      "id": "c5",
      "name": "Section",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1.5rem"
        }
      },
      "styling": {
        "className": "py-8"
      },
      "props": {
        "children": "Section Content"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 8,
          "y": 1,
          "width": 4,
          "height": 6
        }
      }
    }
  ],
  "breakpoints": [
    {
      "name": "desktop",
      "minWidth": 1024,
      "gridCols": 12,
      "gridRows": 8
    }
  ],
  "layouts": {
    "desktop": {
      "structure": "vertical",
      "components": [
        "c1",
        "c2",
        "c3",
        "c4",
        "c5"
      ]
    }
  }
}
```
