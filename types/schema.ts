/**
 * Laylder Schema - Component-First Layout System
 *
 * 설계 원칙:
 * 1. Component Independence: 각 컴포넌트는 독립적으로 동작
 * 2. Flexbox First: Flexbox를 기본으로, Grid는 보조적으로 사용
 * 3. Semantic HTML First: 시맨틱 태그에 적합한 기본 동작 제공
 * 4. Responsive Per Component: 컴포넌트별 반응형 설정
 * 5. Separation of Concerns: Layout(배치) vs Style(스타일) 분리
 */

/**
 * 시맨틱 HTML5 태그
 */
export type SemanticTag =
  | "header"
  | "nav"
  | "main"
  | "aside"
  | "footer"
  | "section"
  | "article"
  | "div"
  | "form"

/**
 * 컴포넌트 포지셔닝 전략
 *
 * - static: 기본 문서 흐름 (default)
 * - fixed: 뷰포트 기준 고정 (Header에 주로 사용)
 * - sticky: 스크롤 시 특정 위치에 고정 (Sidebar, Header)
 * - absolute: 부모 기준 절대 위치
 * - relative: 자신의 원래 위치 기준 상대 위치
 */
export interface ComponentPositioning {
  type: "static" | "fixed" | "sticky" | "absolute" | "relative"
  position?: {
    top?: number | string
    right?: number | string
    bottom?: number | string
    left?: number | string
    zIndex?: number
  }
}

/**
 * Flexbox 레이아웃 설정
 */
export interface FlexLayout {
  /** Flex direction: 주축 방향 */
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  /** Justify content: 주축 정렬 */
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  /** Align items: 교차축 정렬 */
  items?: "start" | "end" | "center" | "baseline" | "stretch"
  /** Flex wrap: 줄바꿈 */
  wrap?: "wrap" | "nowrap" | "wrap-reverse"
  /** Gap: 자식 요소 간격 */
  gap?: number | string
  /** Flex grow: 확장 비율 (자식에 적용) */
  grow?: number
  /** Flex shrink: 축소 비율 (자식에 적용) */
  shrink?: number
}

/**
 * CSS Grid 레이아웃 설정
 */
export interface GridLayout {
  /** Grid columns: 열 정의 (예: 3, "repeat(3, 1fr)", "200px 1fr 200px") */
  cols?: number | string
  /** Grid rows: 행 정의 (예: 2, "auto 1fr", "100px auto") */
  rows?: number | string
  /** Gap: 셀 간격 */
  gap?: number | string
  /** Grid auto flow: 자동 배치 방향 */
  autoFlow?: "row" | "column" | "row dense" | "column dense"
}

/**
 * Container 레이아웃 설정
 * 중앙 정렬되고 최대 너비가 제한된 컨테이너
 */
export interface ContainerLayout {
  /** Max width: 최대 너비 (Tailwind breakpoint 기준) */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"
  /** Padding: 좌우 패딩 */
  padding?: number | string
  /** Centered: 중앙 정렬 여부 (기본: true) */
  centered?: boolean
}

/**
 * 컴포넌트 레이아웃 타입
 *
 * - flex: Flexbox 레이아웃 (페이지 구조, 1차원 배치)
 * - grid: CSS Grid 레이아웃 (카드 그리드, 갤러리)
 * - container: 중앙 정렬 컨테이너 (Main 컨텐츠 영역)
 * - none: 레이아웃 없음 (단순 wrapper)
 */
export interface ComponentLayout {
  type: "flex" | "grid" | "container" | "none"
  flex?: FlexLayout
  grid?: GridLayout
  container?: ContainerLayout
}

/**
 * 컴포넌트 스타일링
 * Layout과 분리된 순수 스타일 속성
 */
export interface ComponentStyling {
  /** Width: 너비 */
  width?: string | number
  /** Height: 높이 */
  height?: string | number
  /** Background: 배경색 */
  background?: string
  /** Border: 테두리 */
  border?: string
  /** Shadow: 그림자 */
  shadow?: string
  /** Custom className: 추가 Tailwind 클래스 */
  className?: string
}

/**
 * Breakpoint-specific behavior override
 */
export interface ResponsiveBehaviorConfig {
  /** 이 breakpoint에서 숨김 */
  hidden?: boolean
  /** Flexbox order 속성 */
  order?: number
  /** 너비 override */
  width?: string
  /** 포지셔닝 override */
  positioning?: ComponentPositioning
}

/**
 * 반응형 동작 설정
 * 각 breakpoint에서의 컴포넌트 동작 override
 *
 * Supports dynamic breakpoint names (not just mobile/tablet/desktop)
 * Example: { Mobile: {...}, Tablet: {...}, Laptop: {...}, Desktop: {...}, UltraWide: {...} }
 */
export interface ResponsiveBehavior {
  mobile?: ResponsiveBehaviorConfig
  tablet?: ResponsiveBehaviorConfig
  desktop?: ResponsiveBehaviorConfig
  [breakpoint: string]: ResponsiveBehaviorConfig | undefined  // Support custom breakpoint names
}

/**
 * 컴포넌트 정의 
 *
 * 각 컴포넌트는 독립적으로 자신의 positioning, layout, styling을 정의
 */
/**
 * Canvas Layout (자유 배치를 위한 Grid 기반 좌표)
 *
 * Visual Layout Builder에서 드래그로 배치한 위치 정보
 * Grid 기반 (12×20 또는 사용자 정의)
 */
export interface CanvasLayout {
  /** X position: Grid column 시작 위치 (0부터 시작) */
  x: number
  /** Y position: Grid row 시작 위치 (0부터 시작) */
  y: number
  /** Width: Grid column span (차지하는 열 개수) */
  width: number
  /** Height: Grid row span (차지하는 행 개수) */
  height: number
}

/**
 * Breakpoint별 Canvas Layout
 * 각 breakpoint에서 다른 위치에 배치 가능
 *
 * Supports dynamic breakpoint names (not just mobile/tablet/desktop)
 * Example: { mobile: {...}, Desktop: {...}, custom: {...} }
 */
export interface ResponsiveCanvasLayout {
  mobile?: CanvasLayout
  tablet?: CanvasLayout
  desktop?: CanvasLayout
  [breakpoint: string]: CanvasLayout | undefined // Support custom breakpoint names
}

export interface Component {
  /** Component ID: 고유 식별자 */
  id: string
  /** Component Name: PascalCase 이름 */
  name: string
  /** Semantic Tag: HTML5 시맨틱 태그 */
  semanticTag: SemanticTag
  /** Positioning: 포지셔닝 전략 */
  positioning: ComponentPositioning
  /** Layout: 내부 레이아웃 타입 */
  layout: ComponentLayout
  /** Styling: 스타일 속성 (optional) */
  styling?: ComponentStyling
  /** Responsive: 반응형 동작 (optional) */
  responsive?: ResponsiveBehavior
  /** Props: React props (optional) */
  props?: Record<string, unknown>
  /** Canvas Layout: Canvas 배치 정보 (optional, backwards compatibility) */
  canvasLayout?: CanvasLayout
  /** Responsive Canvas Layout: Breakpoint별 Canvas 배치 정보 (optional, 권장) */
  responsiveCanvasLayout?: ResponsiveCanvasLayout
}

/**
 * 레이아웃 구조 타입
 *
 * 일반적인 웹 레이아웃 패턴
 */
export type LayoutStructure =
  | "vertical" // Header → Main → Footer (수직 배치)
  | "horizontal" // Sidebar → Main (수평 배치)
  | "sidebar-main" // Sidebar + Main (사이드바 + 메인)
  | "sidebar-main-sidebar" // Sidebar + Main + Sidebar (양쪽 사이드바)
  | "custom" // 커스텀 구조

/**
 * 컨테이너 레이아웃 설정
 * LayoutConfig의 전체 컨테이너에 적용되는 레이아웃
 */
export interface ContainerLayoutConfig {
  type: "flex" | "grid"
  flex?: {
    direction?: "row" | "column"
    gap?: number | string
  }
  grid?: {
    cols?: number | string
    rows?: number | string
    gap?: number | string
  }
}

/**
 * 레이아웃 설정
 *
 * 컴포넌트 간의 관계와 구조를 정의
 * grid-template-areas 대신 structure + components 순서로 정의
 */
export interface LayoutConfig {
  /** Structure: 레이아웃 구조 타입 */
  structure: LayoutStructure
  /** Components: 컴포넌트 ID 배열 (배치 순서) */
  components: string[]
  /** Container Layout: 전체 컨테이너 레이아웃 (optional) */
  containerLayout?: ContainerLayoutConfig
  /** Roles: 특수 역할 지정 (optional) */
  roles?: {
    header?: string
    sidebar?: string
    main?: string
    footer?: string
  }
}

/**
 * Breakpoint 정의 
 *
 * Canvas의 그리드 사이즈를 브레이크포인트별로 다르게 설정 가능
 */
export interface Breakpoint {
  /** Breakpoint name: mobile, tablet, desktop */
  name: string
  /** Min width: 최소 너비 (px) */
  minWidth: number
  /** Grid columns: Canvas 그리드 열 개수 */
  gridCols: number
  /** Grid rows: Canvas 그리드 행 개수 */
  gridRows: number
}

/**
 * Laylder Schema
 *
 * Component-first, Flexbox-first 레이아웃 시스템
 */
export interface LaydlerSchema {
  /** Schema version: "2.0" */
  schemaVersion: "2.0"
  /** Components: 컴포넌트 정의 배열 */
  components: Component[]
  /** Breakpoints: 반응형 breakpoint 정의 */
  breakpoints: Breakpoint[]
  /** Layouts: breakpoint별 레이아웃 설정 (동적 키 지원) */
  layouts: Record<string, LayoutConfig>
}

/**
 * Type Aliases for V2 Clarity
 * V2 타입임을 명시적으로 표현하기 위한 alias
 */
export type LaydlerSchemaV2 = LaydlerSchema
export type ComponentV2 = Component
export type BreakpointV2 = Breakpoint

/**
 * Generation Package
 * AI 프롬프트로 전달될 최종 패키지
 */
export interface GenerationPackage {
  /** Schema: Laylder Schema */
  schema: LaydlerSchema
  /** Options: 생성 옵션 */
  options: {
    framework: "react" | "vue" | "svelte" | "solid"
    cssSolution: "tailwind" | "css-modules" | "styled-components" | "emotion"
    typescript?: boolean
  }
}
