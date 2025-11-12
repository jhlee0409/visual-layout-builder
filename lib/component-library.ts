/**
 * Component Library V2
 *
 * 사전 정의된 컴포넌트 템플릿 라이브러리
 */

import type { Component } from "@/types/schema"

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: "layout" | "navigation" | "content" | "form"
  icon: string
  template: Omit<Component, "id">
}

/**
 * 컴포넌트 라이브러리
 *
 * 각 카테고리별 사전 정의 템플릿
 */
export const COMPONENT_LIBRARY: ComponentTemplate[] = [
  // Layout Components
  {
    id: "header-sticky",
    name: "Sticky Header",
    description: "Fixed header at the top",
    category: "layout",
    icon: "LayoutHeader",
    template: {
      name: "Header",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 },
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
        children: "Header Content",
      },
    },
  },
  {
    id: "main-content",
    name: "Main Content",
    description: "Main content area",
    category: "layout",
    icon: "LayoutGrid",
    template: {
      name: "Main",
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
        className: "flex-1 min-h-screen",
      },
      props: {
        children: "Main Content",
      },
    },
  },
  {
    id: "footer-standard",
    name: "Footer",
    description: "Bottom footer",
    category: "layout",
    icon: "LayoutFooter",
    template: {
      name: "Footer",
      semanticTag: "footer",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "2rem 1rem",
          centered: true,
        },
      },
      styling: {
        background: "gray-100",
        border: "t",
      },
      props: {
        children: "Footer Content",
      },
    },
  },

  // Navigation Components
  {
    id: "sidebar-left",
    name: "Left Sidebar",
    description: "Left sidebar navigation",
    category: "navigation",
    icon: "PanelLeft",
    template: {
      name: "Sidebar",
      semanticTag: "aside",
      positioning: {
        type: "sticky",
        position: { top: "4rem", zIndex: 40 },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        width: "16rem",
        background: "gray-50",
        border: "r",
      },
      props: {
        children: "Sidebar Navigation",
      },
    },
  },
  {
    id: "navbar-horizontal",
    name: "Horizontal Navbar",
    description: "Horizontal navigation bar",
    category: "navigation",
    icon: "Menu",
    template: {
      name: "Navbar",
      semanticTag: "nav",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          gap: "2rem",
          items: "center",
          justify: "between",
        },
      },
      styling: {
        background: "white",
        border: "b",
        className: "px-6 py-4",
      },
      props: {
        children: "Navigation Links",
      },
    },
  },

  // Content Components
  {
    id: "section-standard",
    name: "Section",
    description: "Content section",
    category: "content",
    icon: "Box",
    template: {
      name: "Section",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "py-8",
      },
      props: {
        children: "Section Content",
      },
    },
  },
  {
    id: "article-blog",
    name: "Article",
    description: "Blog article",
    category: "content",
    icon: "FileText",
    template: {
      name: "Article",
      semanticTag: "article",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        className: "prose prose-lg",
      },
      props: {
        children: "Article Content",
      },
    },
  },
  {
    id: "div-container",
    name: "Container Div",
    description: "General purpose container",
    category: "content",
    icon: "Square",
    template: {
      name: "Container",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Container Content",
      },
    },
  },

  // Form Components
  {
    id: "form-standard",
    name: "Form",
    description: "Form container",
    category: "form",
    icon: "FormInput",
    template: {
      name: "Form",
      semanticTag: "form",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "max-w-md p-6 bg-white rounded-lg shadow",
      },
      props: {
        children: "Form Fields",
      },
    },
  },

  // New Templates - Extended Library
  {
    id: "hero-section",
    name: "Hero Section",
    description: "Hero section with large banner",
    category: "content",
    icon: "Layout",
    template: {
      name: "Hero",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "2rem",
          items: "center",
          justify: "center",
        },
      },
      styling: {
        className: "min-h-[500px] px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white",
      },
      props: {
        children: "Hero Content",
      },
    },
  },
  {
    id: "card-container",
    name: "Card",
    description: "Card layout",
    category: "content",
    icon: "Square",
    template: {
      name: "Card",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        className: "p-6 bg-white rounded-lg shadow-md border border-gray-200",
      },
      props: {
        children: "Card Content",
      },
    },
  },
  {
    id: "grid-container",
    name: "Grid Container",
    description: "Grid layout (2 columns)",
    category: "layout",
    icon: "LayoutGrid",
    template: {
      name: "GridContainer",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "grid",
        grid: {
          cols: 2,
          gap: "1.5rem",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Grid Items",
      },
    },
  },
  {
    id: "cta-section",
    name: "CTA Section",
    description: "Call-to-Action area",
    category: "content",
    icon: "Box",
    template: {
      name: "CTA",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
          items: "center",
          justify: "center",
        },
      },
      styling: {
        className: "py-16 px-4 text-center bg-blue-600 text-white rounded-lg",
      },
      props: {
        children: "CTA Content",
      },
    },
  },
  {
    id: "image-banner",
    name: "Image Banner",
    description: "Image banner",
    category: "content",
    icon: "Layout",
    template: {
      name: "ImageBanner",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "0",
          centered: false,
        },
      },
      styling: {
        className: "relative h-[400px] bg-gray-300 overflow-hidden",
      },
      props: {
        children: "Image",
      },
    },
  },
  {
    id: "button-group",
    name: "Button Group",
    description: "Button group",
    category: "form",
    icon: "FormInput",
    template: {
      name: "ButtonGroup",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          gap: "0.75rem",
          items: "center",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Buttons",
      },
    },
  },
]

/**
 * 카테고리별 컴포넌트 필터
 */
export function getComponentsByCategory(
  category: ComponentTemplate["category"]
): ComponentTemplate[] {
  return COMPONENT_LIBRARY.filter((template) => template.category === category)
}

/**
 * ID로 템플릿 찾기
 */
export function getTemplateById(id: string): ComponentTemplate | undefined {
  return COMPONENT_LIBRARY.find((template) => template.id === id)
}

/**
 * 템플릿에서 새 컴포넌트 생성
 */
export function createComponentFromTemplate(
  template: ComponentTemplate,
  customId?: string
): Component {
  return {
    id: customId || `${template.id}-${Date.now()}`,
    ...template.template,
  }
}

/**
 * 모든 카테고리 목록
 */
export const COMPONENT_CATEGORIES = [
  { id: "layout", name: "Layout", icon: "LayoutGrid" },
  { id: "navigation", name: "Navigation", icon: "Menu" },
  { id: "content", name: "Content", icon: "FileText" },
  { id: "form", name: "Form", icon: "FormInput" },
] as const
