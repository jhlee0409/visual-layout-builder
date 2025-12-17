# Laylder

[![codecov](https://codecov.io/gh/jhlee0409/laylder/branch/main/graph/badge.svg)](https://codecov.io/gh/jhlee0409/laylder)

**Visual Layout Builder for AI-Powered Code Generation**

Laylder is a drag-and-drop layout builder that generates schemas for AI to produce production-ready React/Tailwind code. Design responsive layouts visually, export to AI prompts optimized for Claude, GPT, Gemini, and more.

![Laylder Screenshot](docs/screenshot.png)

## Features

- **Visual Canvas**: Drag-and-drop components on a grid-based canvas using Konva
- **Component Independence**: Each component independently defines positioning, layout, and styling
- **Responsive Design**: Support for custom breakpoints (mobile, tablet, desktop, or any custom breakpoint)
- **AI-Optimized Export**: Generate prompts tailored for Claude, GPT, Gemini, DeepSeek, and Grok
- **Component Linking**: Link components across breakpoints for responsive variations
- **Smart Layout**: Automatic positioning based on semantic tags (header → top, footer → bottom)
- **Schema Validation**: Comprehensive validation with 9+ canvas-specific checks
- **Accessibility First**: WCAG 2.2 compliant output with ARIA attributes

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui (Radix) |
| **State** | Zustand 5 |
| **Canvas** | Konva / react-konva |
| **Drag & Drop** | dnd-kit, React Flow (@xyflow/react) |
| **Testing** | Vitest 4 (579+ unit tests), Playwright 1.56 (E2E) |
| **Validation** | Zod |
| **Package Manager** | pnpm |

## Project Structure

```
laylder/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/             # React components
│   ├── canvas/             # Konva canvas system
│   ├── library-panel/      # Component template library
│   ├── properties-panel/   # Property editor
│   ├── breakpoint-panel/   # Breakpoint switcher
│   ├── layers-tree/        # Layer management
│   ├── export-modal/       # Export functionality
│   ├── component-linking-panel/  # Cross-breakpoint linking
│   └── ui/                 # shadcn/ui components
├── lib/                    # Business logic
│   ├── prompt-strategies/  # AI model-specific strategies
│   ├── __tests__/          # Unit tests (579+ tests)
│   ├── schema-validation.ts
│   ├── prompt-generator.ts
│   ├── canvas-to-grid.ts
│   └── ...
├── store/                  # Zustand state management
│   └── layout-store.ts     # Main schema store
├── types/                  # TypeScript types
│   └── schema.ts           # Core schema types
├── e2e/                    # Playwright E2E tests
└── docs/                   # Documentation
```

## Core Concepts

### Schema Architecture

Laylder uses a **Component Independence** architecture where each component defines its own:

```typescript
interface Component {
  id: string
  name: string                    // PascalCase
  semanticTag: SemanticTag        // header, nav, main, aside, footer, etc.
  positioning: ComponentPositioning  // fixed, sticky, static, absolute, relative
  layout: ComponentLayout         // flex, grid, container, none
  styling?: ComponentStyling      // width, height, border, className
  responsive?: ResponsiveBehavior // breakpoint-specific overrides
  responsiveCanvasLayout?: ResponsiveCanvasLayout  // Canvas position per breakpoint
}
```

### Breakpoints

Support for dynamic, custom breakpoints:

```typescript
interface Breakpoint {
  name: string      // "mobile", "tablet", "desktop", or custom
  minWidth: number  // Minimum viewport width (px)
  gridCols: number  // Canvas grid columns
  gridRows: number  // Canvas grid rows
}
```

### Component Linking

Link components across breakpoints to indicate they represent the same UI element with responsive variations:

```typescript
// Components in different breakpoints that represent the same element
componentLinks: [
  { source: "c1", target: "c4" },  // Mobile Header ↔ Desktop Header
  { source: "c2", target: "c5" }   // Mobile Nav ↔ Desktop Sidebar
]
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run unit tests (watch mode)
pnpm test:run         # Run unit tests once
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage

# E2E Testing
pnpm test:e2e         # Run Playwright tests (headless)
pnpm test:e2e:ui      # Run with Playwright UI
pnpm test:e2e:headed  # Run with visible browser
```

## AI Model Support

Laylder generates optimized prompts for multiple AI models:

| Provider | Models |
|----------|--------|
| **Anthropic** | Claude Sonnet 4.5, Sonnet 4, Opus 4, Haiku 3.5 |
| **OpenAI** | GPT-4.1, GPT-4 Turbo, GPT-4 |
| **Google** | Gemini 2.5 Pro, 2.0 Pro, 2.0 Flash |
| **DeepSeek** | R1, V3, Coder V2 |
| **xAI** | Grok 3, Grok 2 |

Each model has a specialized prompt strategy optimized for its capabilities.

## Export Options

1. **Schema JSON**: Export the raw schema for programmatic use
2. **AI Prompt**: Copy-paste optimized prompts for your preferred AI model
3. **Code Bundle**: Generate React/Tailwind code + ZIP download

## Sample Layouts

Laylder includes 4 sample layouts to get started:

- **github**: GitHub-style layout (Header + Sidebar + Main)
- **dashboard**: Dashboard layout (Fixed Header + Side Menu + Content)
- **marketing**: Marketing site (Sticky Header + Hero + Features + Footer)
- **cardGallery**: Card gallery (Header + Grid Layout)

## Testing

The project maintains high test coverage:

- **Unit Tests**: 579+ tests across 28 test files (~14,000 lines)
- **E2E Tests**: 6 Playwright spec files covering core workflows
- **Coverage**: Core business logic at 75-100% coverage

Key tested modules:
- `canvas-to-grid.ts`: 100%
- `snap-to-grid.ts`: 100%
- `prompt-generator.ts`: 95%+
- `schema-validation.ts`: 85%+

## Migration Guide

If upgrading from v0.x to v1.0.0, see [MIGRATION.md](./MIGRATION.md) for breaking changes:

- Theme colors removed (layout-only philosophy)
- ARIA attributes validation added
- Component library now generates pure structural layouts

## Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant development guide
- [MIGRATION.md](./MIGRATION.md) - Version migration guide
- [docs/schema-v2-examples.md](./docs/schema-v2-examples.md) - Schema examples
- [docs/AI_MODELS_GUIDE.md](./docs/AI_MODELS_GUIDE.md) - AI model integration
- [docs/component-library-reference.md](./docs/component-library-reference.md) - Component templates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the development workflow in [CLAUDE.md](./CLAUDE.md)
4. Run tests (`pnpm test:run && pnpm test:e2e`)
5. Commit your changes
6. Push to the branch
7. Open a Pull Request

## License

This project is private. See the repository for license details.

## Support

- **Issues**: [GitHub Issues](https://github.com/jhlee0409/laylder/issues)
- **Documentation**: See the `docs/` directory

---

Built with Next.js, React, and Tailwind CSS.
