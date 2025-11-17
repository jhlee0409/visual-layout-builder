/**
 * Test Script: Improved Prompt Generation
 *
 * 개선된 Code Quality Guidelines가 프롬프트에 포함되는지 테스트
 */

import { generatePrompt } from './lib/prompt-generator'
import type { LaydlerSchema } from './types/schema'

// 간단한 테스트 스키마 생성
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
        className: 'focus-within:outline-none focus-within:ring-2',
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
      components: ['c1', 'c2'],
    },
    desktop: {
      structure: 'vertical',
      components: ['c1', 'c2'],
    },
  },
}

// 프롬프트 생성
console.log('🧪 Testing Improved Prompt Generation...\n')

const result = generatePrompt(testSchema, 'react', 'tailwind')

if (result.success && result.prompt) {
  console.log('✅ Prompt generated successfully!\n')

  // 개선된 부분 확인
  const prompt = result.prompt

  console.log('📋 Checking for Code Quality Guidelines...\n')

  const checks = [
    {
      name: 'Code Quality Standards section',
      test: prompt.includes('**Code Quality Standards (2025):**'),
    },
    {
      name: 'React.FC prohibition',
      test: prompt.includes('DO NOT** use `React.FC`'),
    },
    {
      name: 'PropsWithChildren recommendation',
      test: prompt.includes('PropsWithChildren'),
    },
    {
      name: 'cn() utility requirement',
      test: prompt.includes('cn()') && prompt.includes('lib/utils.ts'),
    },
    {
      name: 'React.AriaRole type',
      test: prompt.includes('React.AriaRole'),
    },
    {
      name: 'JSDoc comment requirement',
      test: prompt.includes('JSDoc'),
    },
    {
      name: 'Component duplication prohibition',
      test: prompt.includes('NO component duplication'),
    },
    {
      name: 'Example component pattern',
      test: prompt.includes('function Header({') && prompt.includes('export { Header }'),
    },
    {
      name: 'Responsive design without duplication example',
      test: prompt.includes("DON'T: Duplicate components"),
    },
    {
      name: 'Required utilities section',
      test: prompt.includes('Required Utilities:'),
    },
  ]

  let passed = 0
  let failed = 0

  checks.forEach((check) => {
    if (check.test) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
      failed++
    }
  })

  console.log(`\n📊 Test Results: ${passed}/${checks.length} checks passed\n`)

  if (failed === 0) {
    console.log('🎉 All checks passed! Code Quality Guidelines are properly integrated.\n')
  } else {
    console.log(`⚠️  ${failed} checks failed. Review the prompt template.\n`)
  }

  // 프롬프트 길이 정보
  const lines = prompt.split('\n').length
  const chars = prompt.length
  const estimatedTokens = Math.ceil(chars / 4) // Rough estimate

  console.log('📈 Prompt Statistics:')
  console.log(`   Lines: ${lines}`)
  console.log(`   Characters: ${chars}`)
  console.log(`   Estimated Tokens: ~${estimatedTokens}\n`)

  // 프롬프트 일부 출력 (처음 100줄)
  console.log('📄 Prompt Preview (first 100 lines):\n')
  console.log('=' .repeat(80))
  const previewLines = prompt.split('\n').slice(0, 100)
  console.log(previewLines.join('\n'))
  console.log('=' .repeat(80))
  console.log(`\n... (${lines - 100} more lines)\n`)

} else {
  console.log('❌ Prompt generation failed!')
  if (result.errors) {
    console.log('\nErrors:')
    result.errors.forEach((error) => console.log(`  - ${error}`))
  }
}
