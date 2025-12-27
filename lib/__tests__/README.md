# Unit Tests Guide

## 개요

Visual Layout Builder 프로젝트의 핵심 비즈니스 로직을 검증하는 Vitest 기반 단위 테스트입니다.

**현재 커버리지**: 89.22% (136 tests)

## 테스트 실행

```bash
# Watch mode (개발 중)
pnpm test

# 단일 실행
pnpm test:run

# 커버리지 포함
pnpm test:coverage

# UI 모드
pnpm test:ui

# 특정 파일만 실행
pnpm test schema-validation.test.ts
```

## 테스트 구조

```
lib/__tests__/
├── fixtures/               # 공통 Test Fixtures
│   └── component-fixtures.ts
├── grid-constraints.test.ts   # 100% coverage ✓
├── snap-to-grid.test.ts       # 100% coverage ✓
├── prompt-generator.test.ts   # 100% coverage ✓
├── smart-layout.test.ts       # 94.36% coverage ✓
├── schema-validation.test.ts  # 80.55% coverage
└── schema-utils.test.ts       # 80.55% coverage
```

## 테스트 작성 가이드

### 1. AAA 패턴 사용

모든 테스트는 **Arrange-Act-Assert** 패턴을 따릅니다.

```typescript
it('should validate component positioning', () => {
  // Arrange: 테스트 데이터 준비
  const component = createHeaderComponent()

  // Act: 동작 수행
  const result = validateComponent(component)

  // Assert: 결과 검증
  expect(result.valid).toBe(true)
})
```

### 2. Fixtures 활용

중복을 줄이기 위해 공통 fixture를 사용하세요.

```typescript
import { createHeaderComponent, createMinimalSchema } from './fixtures/component-fixtures'

it('should handle header component', () => {
  const header = createHeaderComponent({
    id: 'custom-header',
    canvasLayout: { x: 0, y: 0, width: 10, height: 2 },
  })

  expect(header.semanticTag).toBe('header')
})
```

### 3. 명확한 테스트 설명

```typescript
// ✅ 좋은 예
it('should detect column clipping when reducing grid width', () => { ... })

// ❌ 나쁜 예
it('test grid resize', () => { ... })
```

### 4. Edge Case 커버

```typescript
describe('edge cases', () => {
  it('should handle empty component array', () => { ... })
  it('should handle negative coordinates', () => { ... })
  it('should handle component without layout', () => { ... })
})
```

## 커버리지 임계값

현재 설정된 최소 임계값 (향후 회귀 방지):

- **Lines**: 85% (현재 89.22%)
- **Functions**: 80% (현재 93.75%)
- **Branches**: 70% (현재 76.45%)
- **Statements**: 85% (현재 89.26%)

새로운 PR은 이 임계값을 통과해야 합니다.

## 제외된 파일

다음 파일들은 단위 테스트에서 제외되며, 다른 테스트 전략이 필요합니다:

### Zustand Stores (`store/**/*.ts`)
- **이유**: React 컴포넌트와 상호작용하는 상태 관리
- **대안**: Playwright E2E 테스트 또는 React Testing Library

### AI Strategies (`lib/prompt-strategies/**/*.ts`)
- **이유**: 외부 AI API 의존성
- **대안**: E2E 테스트 또는 Integration 테스트

### 샘플 데이터 (`lib/sample-data.ts`)
- **이유**: 정적 데이터, 로직 없음
- **대안**: 필요 없음

### UI 유틸리티 (`lib/file-exporter.ts` 등)
- **이유**: 파일 시스템 작업, React 의존성
- **대안**: E2E 테스트

## CI/CD 통합

GitHub Actions에서 자동으로 실행됩니다:

- ✅ TypeScript 타입 체크
- ✅ ESLint 검사
- ✅ 단위 테스트 실행
- ✅ 커버리지 검증 (임계값 통과 필수)
- ✅ PR에 커버리지 리포트 코멘트

## 문제 해결

### 테스트가 실패하면?

1. **로컬에서 재현**: `pnpm test:run`
2. **특정 파일만 실행**: `pnpm test [파일명]`
3. **디버그 모드**: VS Code debugger 사용
4. **커버리지 확인**: `pnpm test:coverage`

### 커버리지가 떨어지면?

1. 새로운 기능에 테스트 추가
2. Edge case 커버
3. `pnpm test:coverage`로 어떤 라인이 누락되었는지 확인

## 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [CLAUDE.md - 테스트 전략](../../CLAUDE.md#테스트-전략-및-필수-가이드)
