# Prompt Alignment with Component Library - 2025-11-16

## 변경 사항 요약

Component Library를 순수 레이아웃 빌더로 변경한 후, **Prompt Generation 시스템도 이에 맞춰 업데이트**했습니다.

---

## 🎯 목표

> Component Library의 "layout-only" 철학을 AI 프롬프트에도 완전히 반영

- ✅ ARIA attributes (props)를 프롬프트에 포함
- ✅ Layout-only 철학을 시스템 프롬프트에 명시
- ✅ Theme 색상 사용 금지를 명확히 지시
- ✅ 접근성 (WCAG 2.2) 요구사항 강조

---

## 📋 변경 내역

### 1. **Prompt Template 업데이트** (lib/prompt-templates.ts)

#### ✅ Props (ARIA Attributes) 섹션 추가

**Before:**
```typescript
// Styling
if (comp.styling) {
  section += formatStyling(comp.styling)
}

// Responsive
if (comp.responsive) {
  section += formatResponsive(comp.responsive)
}
```

**After:**
```typescript
// Styling
if (comp.styling) {
  section += formatStyling(comp.styling)
}

// Props (ARIA attributes, accessibility)
if (comp.props) {
  section += formatProps(comp.props)  // ← NEW
}

// Responsive
if (comp.responsive) {
  section += formatResponsive(comp.responsive)
}
```

**New Function:**
```typescript
function formatProps(props: Record<string, unknown>): string {
  let text = `**Props (Accessibility & Attributes):**\n`

  Object.entries(props).forEach(([key, value]) => {
    // Skip children prop (content placeholder)
    if (key === 'children') return

    const formattedValue = typeof value === 'string' ? `"${value}"` : String(value)
    text += `- ${key}: ${formattedValue}\n`
  })

  text += "\n"
  return text
}
```

**결과:**
- 모든 ARIA attributes (role, aria-label)가 프롬프트에 포함됨
- AI가 접근성 속성을 정확히 구현 가능

---

#### ✅ System Prompt 강화 - Layout-Only Philosophy

**Before:**
```typescript
**Layout-Only Code Generation:**
This is a **layout builder tool**. Generate **ONLY** the structural layout code:
- Component wrapper with correct semantic tag
- Positioning classes (sticky, fixed, etc.)
- Layout classes (flex, grid, container)
- Styling classes (background, border, shadow)  // ← 모호함
- Responsive behavior (hidden, width overrides)
- **Content**: Just display the component name and ID
```

**After:**
```typescript
**🎨 Layout-Only Code Generation (2025 Philosophy):**

This is a **pure layout builder tool**. We provide ONLY the structural layout - users will add their own themes and styling.

**✅ DO Generate:**
- Component wrapper with correct semantic tag
- Positioning classes (sticky, fixed, absolute, relative, static)
- Layout classes (flex, grid, container)
- **Minimal** borders for layout division (e.g., \`border-b\`, \`border-r\`, \`border border-gray-300\`)
- Responsive behavior (hidden, width overrides, responsive utilities)
- ARIA attributes for accessibility (role, aria-label, etc.)
- Focus states for keyboard navigation (\`focus-within:ring-2\`)
- Motion reduce support (\`motion-reduce:transition-none\`)
- **Content**: Just display the component name and ID (e.g., "Header (c1)")

**❌ DO NOT Generate:**
- Theme colors (\`bg-blue\`, \`bg-purple\`, \`text-white\`, gradients)
- Shadows (\`shadow-sm\`, \`shadow-md\`, \`shadow-lg\`)
- Rounded corners (\`rounded-lg\`, \`rounded-xl\`) - users will style these
- Background colors (\`bg-white\`, \`bg-gray-100\`) - keep transparent or minimal gray for division only
- Typography styles (\`prose\`, \`font-fancy\`) - users will apply their own
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

Only use gray-scale colors for layout division (e.g., \`border-gray-300\`). All theme colors will be added by the user.
```

**핵심 변경:**
1. **명확한 DO / DO NOT 리스트**: AI가 따라야 할 규칙을 구체적으로 명시
2. **Theme 색상 금지 명시**: bg-blue, bg-purple, gradients 등 구체적 예시
3. **접근성 요소 강조**: ARIA attributes, focus states, motion reduce
4. **User Theme Freedom 강조**: 유저가 자신의 테마를 적용할 것임을 명시

---

### 2. **Test Script 추가** (scripts/test-prompt-alignment.ts)

**목적**: 생성된 프롬프트가 component library와 일치하는지 자동 검증

**검증 항목**:
1. ❌ **Theme 색상이 Component 스펙에 없는지** 확인
   - `bg-white`, `bg-blue-`, `bg-purple-`, `bg-gradient`, `shadow-sm`, `shadow-md`, `shadow-lg`
2. ✅ **Layout-only 요소가 포함되어 있는지** 확인
   - `border-gray`, `focus-within:ring`, `motion-reduce`, `aria-label`

**실행 결과**:
```
================================================================================
TESTING: Component CSS in Generated Prompt
================================================================================

✅ No theme colors in component specifications
✅ Layout-only elements found:
   - border-gray
   - focus-within:ring
   - motion-reduce
   - aria-label

================================================================================
Component Sections Check
================================================================================

📊 Total components in prompt: 6

================================================================================
✅ PROMPT ALIGNED: Layout-only philosophy confirmed
================================================================================
```

---

### 3. **Test Threshold 업데이트** (lib/__tests__/prompt-quality.test.ts)

**Before:**
```typescript
// For a simple schema, should be < 2000 tokens
expect(estimatedTokens).toBeLessThan(2000)
```

**After:**
```typescript
// For a simple schema, should be < 2500 tokens (updated for 2025 improvements)
// Increased from 2000 to account for:
// - ARIA attributes section (Props)
// - Enhanced layout-only philosophy instructions
// - Stronger accessibility guidelines
expect(estimatedTokens).toBeLessThan(2500)
```

**이유**:
- Props 섹션 추가로 인한 프롬프트 길이 증가 (약 12.5%)
- 2000 → 2251 tokens (실제 측정값)
- 2500으로 버퍼 확보

---

## 📊 변경 통계

### Prompt 길이 증가 (Before → After)

| Schema | Before | After | Increase |
|--------|--------|-------|----------|
| **GitHub Style** | ~3668 tokens | ~3961 tokens | +8% |
| **Dashboard** | ~3637 tokens | ~3929 tokens | +8% |
| **Marketing Site** | ~3779 tokens | ~4082 tokens | +8% |

**증가 이유**:
1. Props (ARIA attributes) 섹션 추가: ~150-200 tokens
2. Enhanced system prompt: ~100 tokens
3. Stronger accessibility guidelines: ~50 tokens

---

## ✅ 검증 결과

### Lint & TypeScript
```bash
✅ npx tsc --noEmit (no errors)
```

### Build
```bash
✅ pnpm build (successful)
✅ Next.js 15.5.6 production build complete
```

### Tests
```bash
✅ 25 test files passed
✅ 519 tests passed
✅ 0 tests failed
```

### Prompt Quality
```bash
✅ Best Practices Section: ✓
✅ Code Style Guidelines: ✓
✅ CSS Mapping Examples: ✓
✅ Layout-Only Instructions: ✓
```

### Prompt Alignment
```bash
✅ No theme colors in component specifications
✅ Layout-only elements found (border-gray, focus-within:ring, motion-reduce, aria-label)
✅ PROMPT ALIGNED: Layout-only philosophy confirmed
```

---

## 🎯 달성한 목표

### 1. **Component Library와 Prompt의 완벽한 정렬**
- ✅ Component library에서 제거한 theme 색상이 프롬프트에서도 금지됨
- ✅ Component library에 추가한 ARIA attributes가 프롬프트에 포함됨
- ✅ Focus states, motion reduce 등 접근성 요소가 프롬프트에 명시됨

### 2. **AI에게 명확한 지침 제공**
- ✅ DO / DO NOT 리스트로 구체적 예시 제공
- ✅ Theme 색상 금지를 명시적으로 강조
- ✅ User theme freedom 개념 설명

### 3. **자동 검증 시스템 구축**
- ✅ `test-prompt-alignment.ts` 스크립트로 자동 검증
- ✅ CI/CD에서 실행 가능한 테스트

---

## 📄 영향받는 파일

```
lib/prompt-templates.ts              ← Props 섹션 추가, System prompt 강화
lib/__tests__/prompt-quality.test.ts ← Token threshold 업데이트
scripts/test-prompt-alignment.ts     ← NEW: 자동 검증 스크립트
```

---

## 🧪 테스트 방법

### 1. Prompt 품질 검증
```bash
pnpm tsx scripts/validate-prompt-quality.ts
```

### 2. Prompt Alignment 검증
```bash
pnpm tsx scripts/test-prompt-alignment.ts
```

### 3. 전체 테스트 실행
```bash
pnpm test:run
```

---

## 💡 실전 예시

### Before (Theme 포함 프롬프트)

```markdown
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
- Background: `white`     ← ❌ Theme color
- Border: `b`
- Shadow: `sm`           ← ❌ Styling element
```

### After (Layout-Only 프롬프트)

```markdown
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
- Border: `b`                                           ← ✅ Layout division only
- Custom classes: `focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none`

**Props (Accessibility & Attributes):**                 ← ✅ NEW SECTION
- role: "banner"
- aria-label: "Main navigation"
```

**차이점**:
1. ❌ `background: white` 제거 (theme color)
2. ❌ `shadow: sm` 제거 (styling element)
3. ✅ Focus states 추가 (accessibility)
4. ✅ ARIA attributes 추가 (새 섹션)

---

## 🚀 다음 단계

### ✅ 완료된 작업
1. ✅ Component Library를 layout-only로 변환
2. ✅ Prompt Generation을 layout-only 철학에 맞춰 업데이트
3. ✅ 자동 검증 시스템 구축
4. ✅ 모든 테스트 통과

### 🎯 향후 작업 (선택 사항)
1. **User Documentation 업데이트**
   - "Layout-only philosophy" 설명 추가
   - Theme 적용 예시 제공 (예: Tailwind theme 커스터마이징)
2. **Export Modal UI 개선**
   - "Layout-only" 배지 표시
   - "Add your own theme" 안내 메시지
3. **Example Themes 제공**
   - GitHub theme preset
   - Material Design theme preset
   - Custom brand theme template

---

## 결론

Visual Layout Builder의 **Component Library**와 **Prompt Generation** 시스템이 완벽히 정렬되었습니다.

- ✅ Component Library: 순수 레이아웃 빌더 (theme 색상 제거)
- ✅ Prompt Generation: Layout-only 철학 강조 (AI에게 명확한 지침)
- ✅ 자동 검증: 지속적인 품질 보증 (test-prompt-alignment.ts)

**유저는 이제 Visual Layout Builder로 레이아웃 구조를 생성하고, 자신의 theme를 자유롭게 적용할 수 있습니다.** 🎨
