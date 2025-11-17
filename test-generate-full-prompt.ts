/**
 * Generate Full Prompt Example
 * 개선된 프롬프트 전체 출력
 */

import { generatePrompt } from './lib/prompt-generator'
import type { LaydlerSchema } from './types/schema'
import * as fs from 'fs'

// 간단한 테스트 스키마
const testSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'c1',
      name: 'Header',
      semanticTag: 'header',
      positioning: {
        type: 'sticky',
        position: {
          top: 0,
          zIndex: 50,
        },
      },
      layout: {
        type: 'container',
        container: {
          maxWidth: 'full',
          padding: '1rem',
          centered: true,
        },
      },
      styling: {
        border: 'b',
        className: 'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none',
      },
      props: {
        children: 'Header Content',
        role: 'banner',
        'aria-label': 'Main navigation',
      },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
        desktop: { x: 0, y: 0, width: 12, height: 1 },
      },
    },
    {
      id: 'c2',
      name: 'MainContent',
      semanticTag: 'main',
      positioning: {
        type: 'static',
      },
      layout: {
        type: 'flex',
        flex: {
          direction: 'column',
          gap: '2rem',
        },
      },
      styling: {
        className: 'min-h-screen px-4 py-8',
      },
      props: {
        children: 'Main Content',
        role: 'main',
      },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 1, width: 4, height: 6 },
        desktop: { x: 2, y: 1, width: 8, height: 6 },
      },
    },
    {
      id: 'c3',
      name: 'Sidebar',
      semanticTag: 'aside',
      positioning: {
        type: 'sticky',
        position: {
          top: 64,
        },
      },
      layout: {
        type: 'flex',
        flex: {
          direction: 'column',
          gap: '1rem',
        },
      },
      styling: {
        border: 'r',
        className: 'h-full',
      },
      props: {
        role: 'complementary',
        'aria-label': 'Sidebar navigation',
      },
      responsive: {
        mobile: {
          hidden: true,
        },
        desktop: {
          hidden: false,
        },
      },
      responsiveCanvasLayout: {
        desktop: { x: 0, y: 1, width: 2, height: 6 },
      },
    },
    {
      id: 'c4',
      name: 'Footer',
      semanticTag: 'footer',
      positioning: {
        type: 'static',
      },
      layout: {
        type: 'container',
        container: {
          maxWidth: 'full',
          padding: '2rem 1rem',
          centered: true,
        },
      },
      styling: {
        border: 't',
      },
      props: {
        children: 'Footer Content',
        role: 'contentinfo',
        'aria-label': 'Site footer',
      },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 7, width: 4, height: 1 },
        desktop: { x: 0, y: 7, width: 12, height: 1 },
      },
    },
  ],
  breakpoints: [
    { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    mobile: {
      structure: 'vertical',
      components: ['c1', 'c2', 'c4'],
    },
    desktop: {
      structure: 'sidebar-main',
      components: ['c1', 'c3', 'c2', 'c4'],
      roles: {
        header: 'c1',
        sidebar: 'c3',
        main: 'c2',
        footer: 'c4',
      },
    },
  },
}

// 프롬프트 생성
const result = generatePrompt(testSchema, 'react', 'tailwind')

if (result.success && result.prompt) {
  // 파일로 저장
  fs.writeFileSync('improved-prompt-output.md', result.prompt, 'utf-8')
  console.log('✅ Full prompt saved to: improved-prompt-output.md')
  console.log(`\n📊 Statistics:`)
  console.log(`   Lines: ${result.prompt.split('\n').length}`)
  console.log(`   Characters: ${result.prompt.length}`)
  console.log(`   Estimated Tokens: ~${Math.ceil(result.prompt.length / 4)}`)
} else {
  console.log('❌ Failed to generate prompt')
  if (result.errors) {
    result.errors.forEach((e) => console.log(`  - ${e}`))
  }
}
