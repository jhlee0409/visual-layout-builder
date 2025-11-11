# 🗺️ LAYLDER MVP 개발 마스터 플랜

> **문서 목적:** 'Laylder' 프로젝트의 전체 개발 로드맵과 각 단계별 상세 작업 내역을 기록하여, 컨텍스트 손실을 방지하고 일관된 개발 방향을 유지합니다.

**프로젝트명:** Laylder
**버전:** MVP 0.1
**기반 문서:** PRD 0.3 (Final Product Specification)
**개발 철학:** 시맨틱 우선 + 반응형 아키텍처 + 프레임워크 중립성

---

## 📋 전체 개발 단계 (18 Steps)

### **Phase 0: 프로젝트 기반 구축** ✅ COMPLETED
- ✅ **Step 0.1** - 프로젝트 초기화 및 기술 스택 결정
  - Next.js 15 + React 19 + TypeScript
  - pnpm 패키지 매니저
  - Tailwind CSS + shadcn/ui
  - Zustand, @dnd-kit, Zod
  - 커밋: `e5c3a3c`

### **Phase 1: 데이터 모델 정의** ✅ COMPLETED
- ✅ **Step 1.1** - JSON 스키마 TypeScript 타입 정의
  - `/types/schema.ts`: 모든 인터페이스 정의
  - `/lib/validation.ts`: Zod 스키마 및 검증 함수
  - `/lib/sample-data.ts`: PRD 예시 + 4가지 샘플 레이아웃
  - `/lib/schema-utils.ts`: 스키마 조작 유틸리티
  - 6개 검증 테스트 모두 PASS
  - 커밋: `9dcb8bd`

- ✅ **Step 1.2** - Zustand 스토어 설계
  - `/store/layout-store.ts`: 전역 상태 관리 (18개 actions + 4개 selectors)
  - State: schema, currentBreakpoint, selectedComponentId
  - Actions: CRUD + 그리드 + breakpoint + import/export
  - 12개 테스트 모두 PASS
  - 문서화 시스템 구축 (MASTER_PLAN.md, PROGRESS.md)
  - 커밋: (pending)

### **Phase 2: 핵심 UI 컴포넌트 구현** 🔄 IN PROGRESS
- ✅ **Step 2.1** - 그리드 캔버스 구현 (PRD 3.1)
  - CSS Grid 기반 캔버스 렌더링
  - 컴포넌트 선택 기능
  - 그리드 행/열 추가/삭제
  - 병합된 셀 표시
  - shadcn/ui 컴포넌트 (Button, Card, Badge)
  - 커밋: (pending)

- ⏳ **Step 2.2** - 컴포넌트 속성 패널 구현 (PRD 3.2)
  - 컴포넌트 추가 폼
  - 속성 편집 UI
  - defaultProps JSON 편집기

- ⏳ **Step 2.3** - 반응형 제어판 구현 (PRD 3.3)
  - 모바일/태블릿/데스크톱 뷰 전환
  - 각 breakpoint별 독립 상태
  - 브레이크포인트 커스터마이징

- ⏳ **Step 2.4** - 생성 옵션 모달 구현 (PRD 3.4)
  - Framework 선택 (MVP: React만)
  - CSS Solution 선택 (MVP: Tailwind만)
  - Generate 버튼

### **Phase 3: 상태 관리 및 비즈니스 로직** ⏳ PLANNED
- ⏳ **Step 3.1** - Zustand 스토어 통합
- ⏳ **Step 3.2** - 그리드 레이아웃 계산 로직
- ⏳ **Step 3.3** - 반응형 레이아웃 관리

### **Phase 4: 동적 프롬프트 엔진 구현** ⏳ PLANNED
- ⏳ **Step 4.1** - 프롬프트 템플릿 라이브러리 구축
- ⏳ **Step 4.2** - JSON → 프롬프트 변환 함수
- ⏳ **Step 4.3** - 출력 UI

### **Phase 5: 통합 및 워크플로우 완성** ⏳ PLANNED
- ⏳ **Step 5.1** - 전체 워크플로우 연결
- ⏳ **Step 5.2** - 샘플 프로젝트 테스트

### **Phase 6: 배포 및 마무리** ⏳ PLANNED
- ⏳ **Step 6.1** - 빌드 최적화
- ⏳ **Step 6.2** - 배포 준비

---

## 🎯 PRD 0.3 핵심 요구사항 체크리스트

### 1. 핵심 기능 (PRD 3장)
- [ ] 3.1 그리드 캔버스 (DnD)
- [ ] 3.2 컴포넌트 속성 패널
- [ ] 3.3 반응형 제어판 (3개 뷰)
- [ ] 3.4 생성 옵션 모달

### 2. 데이터 구조 (PRD 4장)
- [x] Component 인터페이스
- [x] Breakpoint 인터페이스
- [x] GridLayout 인터페이스
- [x] LaydlerSchema 인터페이스
- [x] 런타임 검증 (Zod)

### 3. 동적 프롬프트 엔진 (PRD 5장)
- [ ] React + Tailwind 템플릿
- [ ] JSON → 프롬프트 변환
- [ ] 클립보드 복사 기능

### 4. MVP 제약사항 (PRD 6.1)
- [ ] 단일 기술 스택: React + Tailwind만 지원
- [ ] 웹사이트 형태로 배포
- [ ] 복사/붙여넷기 방식 (파일 자동 생성은 Phase 2)

---

## 🧠 핵심 설계 원칙 (절대 잊지 말 것)

### 1. 프레임워크 중립성
`LaydlerSchema`는 React/Vue/Svelte 등에 독립적인 순수 데이터 구조여야 합니다.

### 2. 시맨틱 우선
모든 컴포넌트는 HTML5 시맨틱 태그(`<header>`, `<nav>`, `<main>` 등)를 명시해야 합니다.

### 3. 반응형 아키텍처
각 breakpoint는 완전히 독립적인 그리드 레이아웃을 가질 수 있습니다. (예: 모바일에서 컴포넌트 숨김 가능)

---

## 📚 중요 참조 문서

- **PRD 0.3**: 프로젝트 요구사항 정의 (시스템 프롬프트에 포함)
- **PROGRESS.md**: 각 단계별 상세 구현 내역 및 결정사항
- **ARCHITECTURE.md**: 생성 예정 - 아키텍처 다이어그램 및 데이터 흐름

---

_최종 업데이트: Step 2.1 완료 시점_
