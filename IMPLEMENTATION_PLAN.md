# Laylder 레이아웃 개선 구현 계획

## 📋 전체 개요

**목표**: VSCode/Figma 스타일의 리사이징 가능한 전문가급 레이아웃 구현

**라이브러리**: `react-resizable-panels` by Brian Vaughn

**완료 조건**: 모든 Phase 구현 완료 + 테스트 통과 + E2E 검증

---

## Phase 1: 기본 Resizable Panels 도입

### 🎯 목표
- 좌측 Library 패널 리사이징 (15-35%)
- 우측 Layers/Properties 수직 스플릿 (탭 제거)
- autoSaveId로 레이아웃 영구 저장

### 📝 체크리스트
- [ ] react-resizable-panels 설치
- [ ] app/page.tsx에 PanelGroup 적용
- [ ] 좌측 Library Panel을 리사이징 가능하게 변경
- [ ] 우측 Layers/Properties를 수직 분할로 변경
- [ ] autoSaveId 설정 (laylder-main-layout)
- [ ] PanelResizeHandle 스타일링
- [ ] 빌드 에러 해결
- [ ] TypeScript 타입 에러 해결
- [ ] 로컬 테스트 (http://localhost:3000)
- [ ] E2E 테스트 작성 및 통과

### ✅ 완료 조건
- 빌드 성공 (pnpm build)
- TypeScript 에러 0개
- 브라우저에서 정상 작동
- 패널 리사이징 동작 확인
- 레이아웃 localStorage 저장 확인
- E2E 테스트 통과

### 📊 예상 결과
- Canvas 공간 30% 증가 가능
- 사용자별 레이아웃 자동 저장
- 전문가급 UX 제공

---

## Phase 2: 고급 기능 추가

### 🎯 목표
- Collapsible 패널 (완전 축소/복원)
- Imperative API로 "Reset Layout" 버튼
- 키보드 단축키 지원

### 📝 체크리스트
- [ ] Panel collapsible 속성 추가
- [ ] ImperativePanelGroupHandle useRef 설정
- [ ] Reset Layout 버튼 구현
- [ ] 패널 토글 아이콘 추가
- [ ] 키보드 단축키 구현 (Cmd+B, Cmd+J)
- [ ] 애니메이션 효과 추가
- [ ] 빌드 에러 해결
- [ ] TypeScript 타입 에러 해결
- [ ] 로컬 테스트
- [ ] E2E 테스트 작성 및 통과

### ✅ 완료 조건
- 빌드 성공
- TypeScript 에러 0개
- Collapsible 동작 확인
- Reset Layout 버튼 동작 확인
- 키보드 단축키 동작 확인
- E2E 테스트 통과

### 📊 예상 결과
- Canvas 공간 최대 100% 활용 가능
- UX 편의성 대폭 향상
- 접근성 개선

---

## Phase 3: 모바일 최적화

### 🎯 목표
- < 1024px 화면에서 Drawer 사용
- 터치 친화적 인터페이스
- Bottom Sheet 패턴

### 📝 체크리스트
- [ ] vaul 라이브러리 설치 (shadcn/ui Drawer)
- [ ] useMediaQuery 훅 구현
- [ ] 모바일용 Drawer 컴포넌트 생성
- [ ] 데스크탑/모바일 조건부 렌더링
- [ ] Library Drawer (좌측)
- [ ] Layers/Properties Drawer (하단)
- [ ] 터치 제스처 테스트
- [ ] 빌드 에러 해결
- [ ] TypeScript 타입 에러 해결
- [ ] 모바일 브라우저 테스트
- [ ] E2E 테스트 (모바일 뷰포트)

### ✅ 완료 조건
- 빌드 성공
- TypeScript 에러 0개
- 데스크탑 레이아웃 정상 동작
- 모바일 Drawer 정상 동작
- 터치 제스처 동작 확인
- E2E 테스트 통과 (모바일 포함)

### 📊 예상 결과
- 모바일 Canvas 전체 화면 활용
- 네이티브 앱 수준의 UX
- 크로스 플랫폼 최적화

---

## 🔄 자동화 워크플로우

```
Phase N 시작
  ↓
체크리스트 실행
  ↓
구현 완료
  ↓
빌드 테스트 (pnpm build)
  ↓
타입 체크 (tsc --noEmit)
  ↓
로컬 실행 테스트
  ↓
E2E 테스트 작성
  ↓
E2E 테스트 실행 (pnpm test:e2e)
  ↓
모든 테스트 통과?
  ├─ YES → 커밋 → Phase N+1 시작
  └─ NO → 디버깅 → 수정 → 재테스트
```

---

## 📊 진행 상황 추적

### Phase 1: 기본 Resizable Panels
- 상태: 🔄 진행 중
- 시작 시간: -
- 완료 시간: -

### Phase 2: 고급 기능
- 상태: ⏳ 대기 중
- 시작 시간: -
- 완료 시간: -

### Phase 3: 모바일 최적화
- 상태: ⏳ 대기 중
- 시작 시간: -
- 완료 시간: -

---

## 🎯 최종 검증 체크리스트

- [ ] 모든 Phase 완료
- [ ] 전체 빌드 성공
- [ ] TypeScript 에러 0개
- [ ] ESLint 경고 0개
- [ ] 모든 E2E 테스트 통과
- [ ] 데스크탑 브라우저 테스트
- [ ] 모바일 브라우저 테스트
- [ ] 성능 검증 (Lighthouse)
- [ ] 접근성 검증 (a11y)
- [ ] 최종 커밋 및 문서화

---

## 📝 참고 문서

- React Resizable Panels: https://github.com/bvaughn/react-resizable-panels
- Vaul (Drawer): https://github.com/emilkowalski/vaul
- shadcn/ui Drawer: https://ui.shadcn.com/docs/components/drawer
- Context7 Documentation: /bvaughn/react-resizable-panels

---

**마지막 업데이트**: 2025-11-12
**담당자**: Claude Code (Automated)
**상태**: 🚀 자동 실행 중
