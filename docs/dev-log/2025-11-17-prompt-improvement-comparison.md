# Prompt Improvement Comparison (2025-11-17)

## 📊 개요

Laylder의 AI 프롬프트 생성 시스템을 2025년 React/TypeScript 모범 사례에 맞춰 개선했습니다.

---

## 🎯 개선 목표

1. **React.FC 제거**: 2025년 권장 사항이 아닌 패턴 제거
2. **유틸리티 타입 도입**: PropsWithChildren, ComponentPropsWithoutRef 등 사용
3. **cn() 유틸리티 필수화**: className 관리 표준화
4. **컴포넌트 중복 제거**: 단일 컴포넌트 + 반응형 클래스 패턴
5. **타입 안전성 강화**: React.AriaRole 등 정확한 타입 사용
6. **문서화 개선**: JSDoc 주석 필수화

---

## 📝 변경 사항 상세

### 1. **Code Quality Standards 섹션 추가**

**이전 (AS-IS):**
```markdown
**Code Style (2025 Best Practices):**
- ❌ **DO NOT** use `React.FC` type (deprecated pattern)
- ✅ **DO** use explicit function signatures
- ✅ **DO** use modern React patterns
```

**개선 (TO-BE):**
```markdown
**Code Quality Standards (2025):**

**TypeScript Component Patterns:**
- ❌ **DO NOT** use `React.FC` or `React.FunctionComponent`
- ✅ **DO** use standard function components with direct prop typing
- ✅ **DO** use utility types: `PropsWithChildren`, `ComponentPropsWithoutRef`
- ✅ **DO** use `React.AriaRole` for role attributes
- ✅ **DO** export proper TypeScript types
- ✅ **DO** include JSDoc comments

**Component Structure Best Practices:**
- ✅ **DO** use `cn()` utility for conditional className merging
- ✅ **DO** separate component definition from usage
- ✅ **DO** use composition patterns (Card.Header, Card.Body)
- ❌ **DO NOT** duplicate components for different breakpoints
- ❌ **DO NOT** mix demo content with component logic
```

**차이점:**
- ✅ 구체적인 유틸리티 타입 명시
- ✅ cn() 유틸리티 필수화
- ✅ 컴포넌트 중복 금지 명확화
- ✅ Composition 패턴 권장

---

### 2. **Example Component Pattern 추가**

**이전 (AS-IS):**
- 예시 코드 없음
- 개발자가 직접 패턴 유추해야 함

**개선 (TO-BE):**
```markdown
**Example Component Pattern:**
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
\`\`\`
```

**차이점:**
- ✅ 명확한 예시 코드 제공
- ✅ PropsWithChildren 사용법 시연
- ✅ cn() 유틸리티 사용법 시연
- ✅ JSDoc 주석 예시
- ✅ 타입 export 패턴 명확화

---

### 3. **Required Utilities 섹션 추가**

**이전 (AS-IS):**
- cn() 유틸리티 언급 없음
- 개발자가 직접 구현해야 함

**개선 (TO-BE):**
```markdown
**Required Utilities:**
Every generated codebase MUST include this utility function:

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
```

**차이점:**
- ✅ cn() 유틸리티 필수 명시
- ✅ 구현 코드 제공
- ✅ clsx + tailwind-merge 조합 명확화

---

### 4. **Responsive Design Without Duplication 예시 추가**

**이전 (AS-IS):**
- 컴포넌트 중복에 대한 구체적 가이드 없음
- AI가 mobile/desktop용 컴포넌트를 별도로 생성

**개선 (TO-BE):**
```markdown
**Responsive Design Without Duplication:**
\`\`\`typescript
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
\`\`\`
```

**차이점:**
- ✅ 안티패턴 명확히 표시
- ✅ 올바른 패턴 예시 제공
- ✅ 단일 컴포넌트 + 반응형 클래스 강조

---

### 5. **Code Quality Checklist 강화**

**이전 (AS-IS):**
```markdown
### Code Quality Checklist

- [ ] All components use specified semantic tags
- [ ] TypeScript types are properly defined
- [ ] Positioning and layout follow specifications
- [ ] Responsive behavior is implemented
- [ ] Code is clean, readable, and well-commented
- [ ] Accessibility is considered
- [ ] Content: ONLY display component name + ID
```

**개선 (TO-BE):**
```markdown
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
- [ ] NO component duplication across breakpoints
- [ ] Single component instances with responsive content

**Accessibility:**
- [ ] ARIA labels and roles are type-safe
- [ ] Keyboard navigation support (`focus:ring-2`, `focus:outline-none`)
- [ ] Screen reader support (semantic tags + ARIA)

**Content & Code Quality:**
- [ ] Content: ONLY display component name + ID
- [ ] NO placeholder content, mock data, or creative additions
- [ ] Code is clean, readable, and well-commented
- [ ] Include `lib/utils.ts` with `cn()` function
```

**차이점:**
- ✅ 카테고리별로 체크리스트 분류
- ✅ 구체적인 검증 항목 추가
- ✅ cn() 유틸리티 필수 체크
- ✅ 컴포넌트 중복 금지 체크
- ✅ 접근성 항목 강화

---

## 📊 테스트 결과

### 자동 검증 테스트 (10/10 통과)

```
✅ Code Quality Standards section
✅ React.FC prohibition
✅ PropsWithChildren recommendation
✅ cn() utility requirement
✅ React.AriaRole type
✅ JSDoc comment requirement
✅ Component duplication prohibition
✅ Example component pattern
✅ Responsive design without duplication example
✅ Required utilities section
```

### 생성된 프롬프트 통계

| 메트릭 | 이전 | 개선 | 변화 |
|--------|------|------|------|
| **줄 수** | ~450 | ~710 | +58% |
| **문자 수** | ~12,000 | ~20,400 | +70% |
| **예상 토큰** | ~3,000 | ~5,100 | +70% |

**증가 이유:**
- Code Quality Standards 섹션 추가 (~100줄)
- Example Component Pattern (~40줄)
- Required Utilities 섹션 (~15줄)
- Responsive Design 예시 (~20줄)
- Code Quality Checklist 강화 (~30줄)

**가치:**
- 명확한 가이드라인으로 AI 생성 코드 품질 향상
- 개발자의 추가 수정 작업 감소
- 일관된 코드 스타일 보장

---

## 🎯 기대 효과

### Before (이전 생성 코드)

```typescript
// ❌ 문제점
const Header: React.FC<HeaderProps> = ({ children, role, 'aria-label': ariaLabel }) => {
  return <header className="sticky top-0 z-50 border-b">{children}</header>
}

// ❌ 컴포넌트 중복
<div className="block md:hidden"><Header>Mobile</Header></div>
<div className="hidden md:block"><Header>Desktop</Header></div>
```

**문제점:**
1. React.FC 사용 (2025년 권장 아님)
2. cn() 유틸리티 없음
3. 타입 export 없음
4. JSDoc 주석 없음
5. 컴포넌트 중복
6. ARIA 타입 안전성 부족

### After (개선된 생성 코드)

```typescript
// ✅ 개선
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
 * @param variant - Positioning strategy
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
        'w-full border-b px-4 py-4',
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

// ✅ 단일 컴포넌트 + 반응형
<div className="col-span-full">
  <Header>
    <nav className="hidden lg:flex gap-6">Desktop Nav</nav>
    <button className="lg:hidden">Mobile Menu</button>
  </Header>
</div>
```

**개선점:**
1. ✅ 표준 함수 컴포넌트
2. ✅ PropsWithChildren 타입 사용
3. ✅ cn() 유틸리티로 className 관리
4. ✅ React.AriaRole 타입 안전성
5. ✅ JSDoc 주석
6. ✅ 타입 별도 export
7. ✅ 컴포넌트 중복 없음
8. ✅ 단일 컴포넌트 + 반응형 클래스

---

## 📦 변경된 파일

1. **lib/prompt-templates.ts** ✅
   - systemPrompt에 Code Quality Standards 추가
   - instructionsSection에 강화된 체크리스트 추가
   - Example Component Pattern 추가
   - Required Utilities 섹션 추가
   - Responsive Design 예시 추가

2. **CLAUDE.md** ✅
   - Code Quality Guidelines (2025) 섹션 추가
   - 프로젝트 전체 가이드라인으로 반영

3. **docs/dev-log/** ✅
   - 2025-11-17-code-quality-improvement-strategy.md (전략 문서)
   - 2025-11-17-ideal-code-example.tsx (이상적인 예시 코드)
   - 2025-11-17-prompt-improvement-comparison.md (이 문서)

---

## 🚀 다음 단계

### 즉시 적용 가능

현재 변경사항은 이미 적용되었으며, 다음 프롬프트 생성부터 자동으로 적용됩니다:

1. **Export Modal에서 테스트**
   - UI에서 Schema 생성
   - Export 버튼 클릭
   - "AI Prompt" 선택
   - 개선된 프롬프트 확인

2. **AI에게 전달**
   - Claude, GPT, Gemini 등에 프롬프트 복사
   - 개선된 코드 품질 확인
   - React.FC 미사용 확인
   - cn() 유틸리티 포함 확인
   - 컴포넌트 중복 없음 확인

### 추가 개선 고려 사항

1. **파일 구조 개선**
   - 컴포넌트별 개별 파일 생성
   - lib/utils.ts 자동 생성
   - Barrel exports 추가

2. **Composition 패턴 강화**
   - Card.Header, Card.Body 패턴 적용
   - 복잡한 컴포넌트 분해

3. **성능 최적화 패턴**
   - memo() 사용 가이드
   - lazy() 코드 스플리팅 가이드

---

## 📚 참고 문서

- [Code Quality Strategy](/docs/dev-log/2025-11-17-code-quality-improvement-strategy.md)
- [Ideal Code Example](/docs/dev-log/2025-11-17-ideal-code-example.tsx)
- [CLAUDE.md](/CLAUDE.md#code-quality-guidelines-2025)
- [React TypeScript Cheatsheets](https://github.com/typescript-cheatsheets/react)
- [Total TypeScript - React.FC](https://www.totaltypescript.com/you-can-stop-hating-react-fc)
