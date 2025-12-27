# Migration Guide: v0.x → v1.0.0

## Overview

Visual Layout Builder v1.0.0 transforms the project into a **pure layout builder** with a focus on structural layouts and accessibility. This is a **BREAKING CHANGE** that removes all theme colors and styling elements.

---

## ⚠️ Breaking Changes

### 1. **Component Library: All Theme Colors Removed**

**Before (v0.x):**
```typescript
{
  name: "Hero Section",
  styling: {
    className: "min-h-[500px] px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
  }
}
```

**After (v1.0.0):**
```typescript
{
  name: "Hero Section",
  styling: {
    className: "min-h-[500px] px-4 text-center border border-gray-300"
  },
  props: {
    role: "region",
    "aria-label": "Hero section"
  }
}
```

**Removed Elements:**
- ❌ `bg-white`, `bg-gray-50`, `bg-gray-100` (background colors)
- ❌ `bg-gradient-to-r from-blue-500 to-purple-600` (gradients)
- ❌ `bg-blue-600`, `text-white` (theme colors)
- ❌ `shadow-sm`, `shadow-md`, `shadow-lg` (shadows)
- ❌ `rounded-lg`, `rounded-xl` (rounded corners)
- ❌ `prose prose-lg` (typography styles)

**Added Elements:**
- ✅ ARIA attributes (`role`, `aria-label`)
- ✅ Focus states (`focus-within:ring-2`)
- ✅ Motion reduce support (`motion-reduce:transition-none`)
- ✅ Minimal borders for layout division only

---

### 2. **Prompt Generation: Layout-Only Philosophy**

**Before (v0.x):**
- AI prompts included theme colors and styling suggestions
- Generated code could include `bg-blue`, `shadow-lg`, etc.

**After (v1.0.0):**
- AI prompts explicitly forbid theme colors
- Generated code uses only layout structure and gray-scale borders
- Strong emphasis on user theme freedom

**New Prompt Sections:**
```markdown
❌ DO NOT Generate:
- Theme colors (bg-blue, bg-purple, text-white, gradients)
- Shadows (shadow-sm, shadow-md, shadow-lg)
- Rounded corners (rounded-lg, rounded-xl)
```

---

## 📋 Migration Steps

### Step 1: Update Your Schema Files

If you have existing schema JSON files, you need to:

1. **Remove theme colors from `styling.className`**:
   ```typescript
   // Before
   styling: {
     className: "bg-white shadow-md rounded-lg p-4"
   }

   // After
   styling: {
     className: "border border-gray-300 p-4"
   }
   ```

2. **Add ARIA attributes to `props`**:
   ```typescript
   // Add accessibility attributes
   props: {
     role: "banner",  // or "navigation", "main", "contentinfo", etc.
     "aria-label": "Header navigation"
   }
   ```

3. **Add focus states for interactive components**:
   ```typescript
   styling: {
     className: "border border-gray-300 focus-within:ring-2 focus-within:ring-gray-900"
   }
   ```

### Step 2: Update AI-Generated Code

If you previously generated code with Visual Layout Builder v0.x:

1. **Remove theme-specific classes** from your components
2. **Apply your own theme** using:
   - Tailwind config customization
   - CSS custom properties
   - Component-level styling

**Example:**
```tsx
// v1.0.0 generates this (layout only)
<header className="sticky top-0 border-b border-gray-300">
  Header (c1)
</header>

// You add your theme
<header className="sticky top-0 border-b bg-blue-600 text-white shadow-lg">
  <YourHeaderContent />
</header>
```

### Step 3: Apply Your Own Theme

Visual Layout Builder v1.0.0 provides the layout structure. You need to add styling:

**Option 1: Tailwind Config**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      }
    }
  }
}
```

**Option 2: CSS Custom Properties**
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --shadow-default: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-default);
}
```

**Option 3: Component-Level Styling**
```tsx
import { cn } from "@/lib/utils"

function Header() {
  return (
    <header className={cn(
      "sticky top-0 border-b",  // Layout (from Visual Layout Builder)
      "bg-blue-600 text-white shadow-lg"  // Your theme
    )}>
      {/* Your content */}
    </header>
  )
}
```

---

## 🆕 New Features in v1.0.0

### 1. **Full WCAG 2.2 Accessibility Compliance**
- All components include ARIA attributes
- Keyboard navigation support (focus states)
- Screen reader optimization (landmark roles)
- Motion reduce support

### 2. **Enhanced Prompt Quality System**
- 4-category validation (Code Style, CSS Mapping, Layout-Only, Semantic HTML)
- Best Practice scoring (0-100)
- Automatic validation scripts

### 3. **Props (ARIA Attributes) in Prompts**
- AI prompts now include accessibility attributes
- Generated code is WCAG 2.2 compliant by default

---

## 🔧 Compatibility Mode (Temporary Workaround)

If you need time to migrate, you can manually restore theme colors:

**1. Component Library (Short-term)**

Edit `lib/component-library.ts` and add your theme colors back temporarily:

```typescript
{
  id: "sticky-header",
  name: "Sticky Header",
  styling: {
    border: "b",
    className: "focus-within:ring-2 bg-white shadow-sm",  // Add your colors
  }
}
```

**2. Post-Generation Styling (Recommended)**

Use this approach instead:
```typescript
// Generate layout with Visual Layout Builder v1.0.0
const layout = generateCode(schema)

// Apply your theme separately
const themedLayout = applyTheme(layout, {
  headerBg: "bg-blue-600",
  headerText: "text-white",
  shadow: "shadow-lg"
})
```

---

## 📊 Impact Summary

| Component | v0.x | v1.0.0 | Change |
|-----------|------|--------|--------|
| **Sticky Header** | `bg-white shadow-sm` | `border-b` | Theme removed |
| **Hero Section** | `bg-gradient-to-r from-blue-500 to-purple-600` | `border border-gray-300` | Gradient removed |
| **Card** | `bg-white rounded-lg shadow-md` | `border border-gray-300` | Styling removed |
| **Footer** | `bg-gray-100` | `border-t border-gray-300` | Background removed |

**All components**: Added ARIA attributes, focus states, motion reduce support

---

## 🧪 Testing Your Migration

Run these commands to verify your migration:

```bash
# 1. Validate schema
pnpm tsx scripts/validate-schema.ts your-schema.json

# 2. Check prompt alignment
pnpm tsx scripts/test-prompt-alignment.ts

# 3. Validate generated code
pnpm tsx scripts/validate-prompt-quality.ts

# 4. Run full test suite
pnpm test:run
```

---

## 📚 Additional Resources

- **Component Library Reference**: `docs/component-library-reference.md`
- **2025 CSS Analysis**: `docs/dev-log/2025-11-16-component-css-analysis.md`
- **Prompt Alignment**: `docs/dev-log/2025-11-16-prompt-alignment-with-component-library.md`

---

## ❓ FAQ

### Q: Can I still use Visual Layout Builder for styled components?

**A:** No. Visual Layout Builder v1.0.0 is a pure layout builder. Apply your own styles after generation.

### Q: Will my v0.x schemas work in v1.0.0?

**A:** They will work, but generated code will have theme colors removed. Follow the migration steps above.

### Q: How do I add theme colors back?

**A:** Apply them manually after generation, or use Tailwind config to customize the generated layout.

### Q: Is there a deprecation period?

**A:** No. v1.0.0 is the first stable release with a clear architectural vision. All future versions will maintain layout-only philosophy.

### Q: What about existing projects using v0.x?

**A:** Pin your version to `0.1.0` until you're ready to migrate:
```json
{
  "dependencies": {
    "laylder": "0.1.0"
  }
}
```

---

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the documentation: `docs/`
2. Review test examples: `lib/__tests__/`
3. Open an issue: https://github.com/jhlee0409/laylder/issues

---

## 🎉 Benefits of v1.0.0

**Why this change is good for you:**

✅ **Complete theme freedom** - No more fighting with preset colors
✅ **Better accessibility** - WCAG 2.2 compliant out of the box
✅ **Cleaner code** - Layout structure separate from styling
✅ **Easier maintenance** - Change themes without touching layout
✅ **Modern architecture** - Follows 2025 web standards

**Visual Layout Builder v1.0.0 = Layout structure. Your creativity = Theme.**
