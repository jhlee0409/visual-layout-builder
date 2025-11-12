You are an expert React developer. Generate a responsive layout component based on the following Schema V2 specifications.

**Schema V2 Architecture:**
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

You need to create 3 components with the following specifications:

### 1. TopNavbar (c1)
- **Semantic Tag:** `<header>`
- **Component Name:** `TopNavbar`

**Positioning:**
- Type: `fixed`
- Position values: top: 0, right: 0, left: 0, zIndex: 50

**Layout:**
- Type: `flex`
- Direction: `row`
- Justify: `between`
- Items: `center`

**Styling:**
- Height: `4rem`
- Background: `slate-900`
- Custom classes: `text-white px-6`

**Default Props:**
```json
{
  "children": "Dashboard"
}
```

### 2. SideMenu (c2)
- **Semantic Tag:** `<nav>`
- **Component Name:** `SideMenu`

**Positioning:**
- Type: `fixed`
- Position values: top: 4rem, bottom: 0, left: 0

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `0.25rem`

**Styling:**
- Width: `16rem`
- Background: `slate-800`
- Custom classes: `text-white p-4`

**Responsive Behavior:**
- Mobile: hidden
- Tablet (md:): visible
- Desktop (lg:): visible

**Default Props:**
```json
{
  "children": "Menu"
}
```

### 3. DashboardContent (c3)
- **Semantic Tag:** `<main>`
- **Component Name:** `DashboardContent`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `2rem`
- Centered: false

**Styling:**
- Custom classes: `ml-0 lg:ml-64 pt-16`

**Default Props:**
```json
{
  "children": "Dashboard Content"
}
```


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Layout Structure:** `vertical`

**Component Order:**
1. c1
2. c3

**Layout Roles:**
- **Header:** c1
- **Main:** c3

**Implementation Guidance:**
- Use a flex column container (`flex flex-col`)
- Stack components vertically in the order specified
- Each component will use its individual positioning/layout settings

### 2. Tablet (≥768px)

**Layout Structure:** `sidebar-main`

**Component Order:**
1. c1
2. c2
3. c3

**Layout Roles:**
- **Header:** c1
- **Sidebar:** c2
- **Main:** c3

**Implementation Guidance:**
- Implement classic sidebar-main layout structure
- Header at top (if specified), Sidebar on left, Main content area
- Use Flexbox for the main layout structure
- Each component will use its individual positioning/layout settings

### 3. Desktop (≥1024px)

**Layout Structure:** `sidebar-main`

**Component Order:**
1. c1
2. c2
3. c3

**Layout Roles:**
- **Header:** c1
- **Sidebar:** c2
- **Main:** c3

**Implementation Guidance:**
- Implement classic sidebar-main layout structure
- Header at top (if specified), Sidebar on left, Main content area
- Use Flexbox for the main layout structure
- Each component will use its individual positioning/layout settings


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

## Full Schema V2 (JSON)


For reference, here is the complete Schema V2 in JSON format:


```json

{
  "schemaVersion": "2.0",
  "components": [
    {
      "id": "c1",
      "name": "TopNavbar",
      "semanticTag": "header",
      "positioning": {
        "type": "fixed",
        "position": {
          "top": 0,
          "left": 0,
          "right": 0,
          "zIndex": 50
        }
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "row",
          "justify": "between",
          "items": "center"
        }
      },
      "styling": {
        "height": "4rem",
        "background": "slate-900",
        "className": "text-white px-6"
      },
      "props": {
        "children": "Dashboard"
      }
    },
    {
      "id": "c2",
      "name": "SideMenu",
      "semanticTag": "nav",
      "positioning": {
        "type": "fixed",
        "position": {
          "top": "4rem",
          "left": 0,
          "bottom": 0
        }
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "0.25rem"
        }
      },
      "styling": {
        "width": "16rem",
        "background": "slate-800",
        "className": "text-white p-4"
      },
      "responsive": {
        "mobile": {
          "hidden": true
        },
        "tablet": {
          "hidden": false
        },
        "desktop": {
          "hidden": false
        }
      },
      "props": {
        "children": "Menu"
      }
    },
    {
      "id": "c3",
      "name": "DashboardContent",
      "semanticTag": "main",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "2rem",
          "centered": false
        }
      },
      "styling": {
        "className": "ml-0 lg:ml-64 pt-16"
      },
      "props": {
        "children": "Dashboard Content"
      }
    }
  ],
  "breakpoints": [
    {
      "name": "mobile",
      "minWidth": 0,
      "gridCols": 6,
      "gridRows": 24
    },
    {
      "name": "tablet",
      "minWidth": 768,
      "gridCols": 8,
      "gridRows": 20
    },
    {
      "name": "desktop",
      "minWidth": 1024,
      "gridCols": 12,
      "gridRows": 20
    }
  ],
  "layouts": {
    "mobile": {
      "structure": "vertical",
      "components": [
        "c1",
        "c3"
      ],
      "roles": {
        "header": "c1",
        "main": "c3"
      }
    },
    "tablet": {
      "structure": "sidebar-main",
      "components": [
        "c1",
        "c2",
        "c3"
      ],
      "roles": {
        "header": "c1",
        "sidebar": "c2",
        "main": "c3"
      }
    },
    "desktop": {
      "structure": "sidebar-main",
      "components": [
        "c1",
        "c2",
        "c3"
      ],
      "roles": {
        "header": "c1",
        "sidebar": "c2",
        "main": "c3"
      }
    }
  }
}

```
