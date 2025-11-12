/**
 * Sample data for Schema
 * Real-world layout patterns using Component-first, Flexbox-first approach
 *
 * **Breakpoint Inheritance 예시:**
 * - Mobile만 설정 → Tablet/Desktop 자동 상속
 * - Mobile + Tablet 설정 → Desktop은 Tablet에서 상속
 * - 모든 breakpoint 명시 → 상속 없음
 */

import type {
  LaydlerSchema,
  GenerationPackage,
  Component,
  ComponentPositioning,
  ComponentLayout,
  ResponsiveBehavior,
} from "@/types/schema"

/**
 * GitHub-Style Layout
 * Fixed Header + Sidebar-Main layout with Flexbox
 *
 * 실제 생성될 코드:
 * <Header className="fixed top-0 left-0 right-0 z-50 bg-white border-b" />
 * <div className="flex pt-16">
 *   <Sidebar className="hidden lg:block w-64 border-r sticky top-16" />
 *   <Main className="flex-1">
 *     <div className="container mx-auto max-w-7xl px-8">
 *       {children}
 *     </div>
 *   </Main>
 * </div>
 */
export const githubStyleSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "GlobalHeader",
      semanticTag: "header",
      positioning: {
        type: "fixed",
        position: {
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        },
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "1rem",
          centered: true,
        },
      },
      styling: {
        background: "white",
        border: "b",
        shadow: "sm",
      },
      props: {
        children: "Global Header",
      },
    },
    {
      id: "c2",
      name: "Sidebar",
      semanticTag: "nav",
      positioning: {
        type: "sticky",
        position: {
          top: "4rem", // Header 높이만큼 offset
        },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "0.5rem",
        },
      },
      styling: {
        width: "16rem", // w-64
        border: "r",
      },
      responsive: {
        mobile: { hidden: true },
        tablet: { hidden: true },
        desktop: { hidden: false },
      },
      props: {
        children: "Navigation Menu",
      },
    },
    {
      id: "c3",
      name: "MainContent",
      semanticTag: "main",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      },
      styling: {
        className: "flex-1",
      },
      props: {
        children: "Main Content Area",
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c3"], // Sidebar hidden
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "4rem",
        },
      },
      roles: {
        header: "c1",
        main: "c3",
      },
    },
    tablet: {
      structure: "vertical",
      components: ["c1", "c3"], // Sidebar hidden
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "4rem",
        },
      },
      roles: {
        header: "c1",
        main: "c3",
      },
    },
    desktop: {
      structure: "sidebar-main",
      components: ["c1", "c2", "c3"], // All visible
      containerLayout: {
        type: "flex",
        flex: {
          direction: "row",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        sidebar: "c2",
        main: "c3",
      },
    },
  },
}

/**
 * Dashboard Layout
 * Full-height Sidebar + Main content area
 */
export const dashboardSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "TopNavbar",
      semanticTag: "header",
      positioning: {
        type: "fixed",
        position: {
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          justify: "between",
          items: "center",
        },
      },
      styling: {
        height: "4rem",
        background: "slate-900",
        className: "text-white px-6",
      },
      props: {
        children: "Dashboard",
      },
    },
    {
      id: "c2",
      name: "SideMenu",
      semanticTag: "nav",
      positioning: {
        type: "fixed",
        position: {
          top: "4rem",
          left: 0,
          bottom: 0,
        },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "0.25rem",
        },
      },
      styling: {
        width: "16rem",
        background: "slate-800",
        className: "text-white p-4",
      },
      responsive: {
        mobile: { hidden: true },
        tablet: { hidden: false },
        desktop: { hidden: false },
      },
      props: {
        children: "Menu",
      },
    },
    {
      id: "c3",
      name: "DashboardContent",
      semanticTag: "main",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "2rem",
          centered: false,
        },
      },
      styling: {
        className: "ml-0 lg:ml-64 pt-16",
      },
      props: {
        children: "Dashboard Content",
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c3"],
      roles: {
        header: "c1",
        main: "c3",
      },
    },
    tablet: {
      structure: "sidebar-main",
      components: ["c1", "c2", "c3"],
      roles: {
        header: "c1",
        sidebar: "c2",
        main: "c3",
      },
    },
    desktop: {
      structure: "sidebar-main",
      components: ["c1", "c2", "c3"],
      roles: {
        header: "c1",
        sidebar: "c2",
        main: "c3",
      },
    },
  },
}

/**
 * Marketing Site Layout
 * Sticky Header + Vertical sections + Footer
 */
export const marketingSiteSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "SiteHeader",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: {
          top: 0,
          zIndex: 50,
        },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          justify: "between",
          items: "center",
        },
      },
      styling: {
        background: "white",
        border: "b",
        shadow: "sm",
        className: "px-6 py-4",
      },
      props: {
        children: "Company Logo",
      },
    },
    {
      id: "c2",
      name: "HeroSection",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "4rem 2rem",
          centered: true,
        },
      },
      props: {
        children: "Hero Content",
      },
    },
    {
      id: "c3",
      name: "FeaturesSection",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "4rem 2rem",
          centered: true,
        },
      },
      props: {
        children: "Features",
      },
    },
    {
      id: "c4",
      name: "SiteFooter",
      semanticTag: "footer",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      },
      styling: {
        background: "slate-900",
        className: "text-white mt-16",
      },
      props: {
        children: "Footer",
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c2", "c3", "c4"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
        footer: "c4",
      },
    },
    tablet: {
      structure: "vertical",
      components: ["c1", "c2", "c3", "c4"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
        footer: "c4",
      },
    },
    desktop: {
      structure: "vertical",
      components: ["c1", "c2", "c3", "c4"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
        footer: "c4",
      },
    },
  },
}

/**
 * Card Grid Layout
 * Using CSS Grid for card gallery (secondary usage of Grid)
 */
export const cardGallerySchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "PageHeader",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: {
          top: 0,
          zIndex: 50,
        },
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "1rem 2rem",
          centered: true,
        },
      },
      styling: {
        background: "white",
        border: "b",
      },
      props: {
        children: "Gallery",
      },
    },
    {
      id: "c2",
      name: "CardGrid",
      semanticTag: "main",
      positioning: {
        type: "static",
      },
      layout: {
        type: "grid", // Grid 사용 (카드 배치용)
        grid: {
          cols: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "flex-1 container mx-auto max-w-7xl px-8 py-8",
      },
      responsive: {
        mobile: {
          // Mobile에서는 1열
        },
        tablet: {
          // Tablet에서는 2열
        },
        desktop: {
          // Desktop에서는 auto-fill
        },
      },
      props: {
        children: "Card items will be placed here",
      },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c2"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
      },
    },
    tablet: {
      structure: "vertical",
      components: ["c1", "c2"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
      },
    },
    desktop: {
      structure: "vertical",
      components: ["c1", "c2"],
      containerLayout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: 0,
        },
      },
      roles: {
        header: "c1",
        main: "c2",
      },
    },
  },
}

/**
 * All sample schemas
 */
export const sampleSchemas = {
  github: githubStyleSchema,
  dashboard: dashboardSchema,
  marketing: marketingSiteSchema,
  cardGallery: cardGallerySchema,
} as const

/**
 * Default generation package for
 */
export const defaultGenerationPackage: GenerationPackage = {
  schema: githubStyleSchema,
  options: {
    framework: "react",
    cssSolution: "tailwind",
    typescript: true,
  },
}
