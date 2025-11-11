/**
 * Sample data for testing and demonstration
 * Based on PRD 0.3 Section 4: Core Data Structure example
 */

import type { LaydlerSchema, GenerationPackage } from "@/types/schema"

/**
 * Example schema from PRD 0.3
 * Classic layout: Header + Sidebar + Main + Ad Banner
 * Responsive behavior:
 * - Mobile: Stacked vertical layout
 * - Tablet: Header on top, Sidebar + Main in 2 columns (no ad)
 * - Desktop: Header on top, Sidebar + Main + Ad in 3 columns
 */
export const sampleSchema: LaydlerSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "c1",
      name: "GlobalHeader",
      semanticTag: "header",
      props: { children: "Header" },
    },
    {
      id: "c2",
      name: "Sidebar",
      semanticTag: "nav",
      props: { children: "Navigation" },
    },
    {
      id: "c3",
      name: "MainContent",
      semanticTag: "main",
      props: { children: "Main Content Area" },
    },
    {
      id: "c4",
      name: "AdBanner",
      semanticTag: "aside",
      props: { children: "AD" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      grid: {
        rows: "60px auto 1fr 80px",
        columns: "1fr",
        areas: [["c1"], ["c2"], ["c3"], ["c4"]],
      },
    },
    tablet: {
      grid: {
        rows: "80px 1fr",
        columns: "200px 1fr",
        areas: [
          ["c1", "c1"],
          ["c2", "c3"],
        ],
      },
    },
    desktop: {
      grid: {
        rows: "80px 1fr",
        columns: "250px 1fr 250px",
        areas: [
          ["c1", "c1", "c1"],
          ["c2", "c3", "c4"],
        ],
      },
    },
  },
}

/**
 * MVP generation package (React + Tailwind)
 * Default configuration for Phase 1
 */
export const sampleGenerationPackage: GenerationPackage = {
  schema: sampleSchema,
  options: {
    framework: "react",
    cssSolution: "tailwind",
  },
}

/**
 * Simple single-column layout
 * Good for blog posts or documentation
 */
export const simpleSingleColumnSchema: LaydlerSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "c1",
      name: "PageHeader",
      semanticTag: "header",
      props: { children: "Blog Title" },
    },
    {
      id: "c2",
      name: "ArticleContent",
      semanticTag: "article",
      props: { children: "Article content goes here" },
    },
    {
      id: "c3",
      name: "PageFooter",
      semanticTag: "footer",
      props: { children: "Copyright 2024" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      grid: {
        rows: "auto 1fr auto",
        columns: "1fr",
        areas: [["c1"], ["c2"], ["c3"]],
      },
    },
    tablet: {
      grid: {
        rows: "auto 1fr auto",
        columns: "1fr",
        areas: [["c1"], ["c2"], ["c3"]],
      },
    },
    desktop: {
      grid: {
        rows: "auto 1fr auto",
        columns: "1fr",
        areas: [["c1"], ["c2"], ["c3"]],
      },
    },
  },
}

/**
 * Dashboard layout with top navbar and side menu
 */
export const dashboardLayoutSchema: LaydlerSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "c1",
      name: "TopNavbar",
      semanticTag: "header",
      props: { children: "Dashboard" },
    },
    {
      id: "c2",
      name: "SideMenu",
      semanticTag: "nav",
      props: { children: "Menu" },
    },
    {
      id: "c3",
      name: "DashboardContent",
      semanticTag: "main",
      props: { children: "Dashboard Content" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      grid: {
        rows: "60px 1fr",
        columns: "1fr",
        areas: [["c1"], ["c3"]],
        // c2 (SideMenu) is hidden on mobile
      },
    },
    tablet: {
      grid: {
        rows: "60px 1fr",
        columns: "200px 1fr",
        areas: [
          ["c1", "c1"],
          ["c2", "c3"],
        ],
      },
    },
    desktop: {
      grid: {
        rows: "60px 1fr",
        columns: "250px 1fr",
        areas: [
          ["c1", "c1"],
          ["c2", "c3"],
        ],
      },
    },
  },
}

/**
 * E-commerce product page layout
 */
export const productPageSchema: LaydlerSchema = {
  schemaVersion: "1.1",
  components: [
    {
      id: "c1",
      name: "SiteHeader",
      semanticTag: "header",
      props: { children: "Shop Header" },
    },
    {
      id: "c2",
      name: "ProductImages",
      semanticTag: "section",
      props: { children: "Product Images" },
    },
    {
      id: "c3",
      name: "ProductDetails",
      semanticTag: "section",
      props: { children: "Product Details" },
    },
    {
      id: "c4",
      name: "RelatedProducts",
      semanticTag: "aside",
      props: { children: "You may also like" },
    },
    {
      id: "c5",
      name: "SiteFooter",
      semanticTag: "footer",
      props: { children: "Footer" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: {
      grid: {
        rows: "60px auto auto auto auto",
        columns: "1fr",
        areas: [["c1"], ["c2"], ["c3"], ["c4"], ["c5"]],
      },
    },
    tablet: {
      grid: {
        rows: "60px auto auto auto",
        columns: "1fr 1fr",
        areas: [
          ["c1", "c1"],
          ["c2", "c3"],
          ["c4", "c4"],
          ["c5", "c5"],
        ],
      },
    },
    desktop: {
      grid: {
        rows: "60px auto auto",
        columns: "2fr 1fr",
        areas: [
          ["c1", "c1"],
          ["c2", "c3"],
          ["c4", "c4"],
          ["c5", "c5"],
        ],
      },
    },
  },
}

/**
 * All sample schemas for easy access
 */
export const sampleSchemas = {
  default: sampleSchema,
  simple: simpleSingleColumnSchema,
  dashboard: dashboardLayoutSchema,
  productPage: productPageSchema,
} as const
