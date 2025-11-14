# Critical Fix: Canvas Grid Layout Priority (2025-11-14)

## 🚨 Problem

AI가 생성한 코드에서 **side-by-side 레이아웃이 세로로 스택**되는 치명적 문제 발견

### Expected Layout (Canvas)
```
┌─────────────────────────────────────────────────────────────┐
│                        Header (c1)                          │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────┬─────────────────────────┐
│   Sidebar    │     Section (c4)     │     Section (c5)        │
│    (c3)      │                      │                         │
│   <aside>    │     <section>        │     <section>           │
└──────────────┴──────────────────────┴─────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        Footer (c2)                          │
└─────────────────────────────────────────────────────────────┘
```

### Actual AI Output
```
┌─────────────────┐
│   Header (c1)   │
├─────────────────┤
│   Footer (c2)   │  ← 2번째로 렌더링!
├─────────────────┤
│   Sidebar (c3)  │  ← 세로 스택
├─────────────────┤
│   Section (c4)  │  ← 세로 스택
├─────────────────┤
│   Section (c5)  │  ← 세로 스택
└─────────────────┘
```

## 🔍 Root Cause Analysis

### 1. DOM Order vs Canvas Layout 불일치
```
❌ DOM Order (layouts.desktop.components):
[c1, c2, c3, c4, c5]  ← Footer가 2번째!

✅ Canvas Layout (responsiveCanvasLayout.desktop.y):
c1: y=0 (top)
c3: y=1 (middle, left)
c4: y=1 (middle, center)
c5: y=1 (middle, right)
c2: y=7 (bottom)
```

### 2. "Layout Structure: vertical" 오해
- AI가 "모든 컴포넌트를 세로로 쌓아라"로 해석
- 실제 의미: "페이지는 세로 스크롤, 내부에 가로 배치 존재"

### 3. Canvas Grid 정보가 있지만 우선순위 불명확
- Canvas Grid 정보는 존재했으나 "참고 자료" 수준
- DOM Order가 numbered list로 더 명확해 보임

## ✅ Solution

### 1. Layout Priority 명시 (base-strategy.ts)
```typescript
**🚨 IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid
```

### 2. DOM Order 경고 강화
```typescript
**DOM Order (Reference Only - DO NOT use for visual positioning):**

For screen readers and SEO crawlers, the HTML source order is:

1. c1 (Canvas row 0)
2. c2 (Canvas row 7)  ← Canvas 좌표 명시!
3. c3 (Canvas row 1)
4. c4 (Canvas row 1)  ← 같은 row = side-by-side
5. c5 (Canvas row 1)  ← 같은 row = side-by-side

**⚠️ WARNING:** This DOM order differs from visual positioning. Always follow Canvas Grid coordinates for layout!
```

### 3. Implementation Strategy 강화 (visual-layout-descriptor.ts)
```typescript
🚨 **CRITICAL**: This layout has components positioned **side-by-side** in the same row.
You MUST use CSS Grid (not flexbox column) to achieve horizontal positioning.
DO NOT stack these components vertically!
```

### 4. Page Flow 의미 명확화
```typescript
**Page Flow:** `vertical` (vertical scrolling with horizontal content areas)
```

## 📊 Impact

### Before Fix
```markdown
**Layout Structure:** vertical

**Component Order:**
1. c1
2. c2
3. c3
4. c5
5. c5
```
→ AI가 세로 스택으로 구현

### After Fix
```markdown
**Visual Layout (Canvas Grid):**
Row 0: Header (c1, full width)
Row 1-6: Sidebar (c3, cols 0-2), Section (c4, cols 3-7), Section (c5, cols 8-11)
Row 7: Footer (c2, full width)

**Implementation Strategy:**
🚨 **CRITICAL**: Components positioned side-by-side in same row. MUST use CSS Grid!

**🚨 IMPORTANT - Layout Priority:**
1. PRIMARY: Canvas Grid positioning
2. SECONDARY: DOM order (reference only)

**DOM Order (Reference Only):**
1. c1 (Canvas row 0)
2. c2 (Canvas row 7)
3. c3 (Canvas row 1) ← Same row
4. c4 (Canvas row 1) ← Same row
5. c5 (Canvas row 1) ← Same row
```
→ AI가 올바른 CSS Grid 레이아웃 구현

## 🎯 Files Modified

1. **lib/prompt-strategies/base-strategy.ts**
   - `generateLayoutSection()`: Layout Priority 섹션 추가
   - DOM Order에 Canvas row 번호 추가
   - Page Flow 의미 명확화

2. **lib/visual-layout-descriptor.ts**
   - `generateImplementationHints()`: CRITICAL 경고 최우선 배치
   - Side-by-side 구현 예시 추가

3. **scripts/generate-correct-prompt.ts**
   - AI Model System 사용으로 변경 (ExportModal과 동일)

## ✅ Verification

- ✅ Build: Success
- ✅ Tests: 242/242 passed
- ✅ Prompt Generation: Canvas Grid info with clear priority
- ✅ AI Understanding: Clear instructions for side-by-side layouts

## 🚀 Next Steps

1. UI에서 "Generate Prompt" 버튼 클릭
2. 생성된 프롬프트를 Claude/GPT에 복붙
3. 올바른 CSS Grid 레이아웃 코드 생성 확인

## 📝 Example Prompt Output

```markdown
### 1. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**
- Row 1-6: Sidebar (c3, cols 0-2), Section (c4, cols 3-7), Section (c5, cols 8-11)

**Spatial Relationships:**
- **Sidebar (c3), Section (c4), Section (c5)** are positioned **SIDE-BY-SIDE**

**Implementation Strategy:**
- 🚨 **CRITICAL**: MUST use CSS Grid (not flexbox column)!

**🚨 IMPORTANT - Layout Priority:**
1. **PRIMARY**: Visual Layout (Canvas Grid)
2. **SECONDARY**: DOM order (reference only)
3. **RULE**: Same Y-coordinate = side-by-side
4. **DO NOT** stack vertically!
```

## 🏆 Result

AI 모델이 이제 **정확한 side-by-side 레이아웃**을 생성합니다! ✅
