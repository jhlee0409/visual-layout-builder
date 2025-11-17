import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 테스트 환경 (DOM 환경)
    environment: 'happy-dom',

    // 글로벌 설정
    globals: true,

    // 테스트 파일 패턴
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx}',
      '**/*.{test,spec}.{ts,tsx}'
    ],

    // 제외할 파일/폴더
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'e2e',
      'scripts'
    ],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.ts',
      ],
      exclude: [
        // TypeScript 정의 및 설정 파일
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/node_modules/**',

        /**
         * Zustand Stores - UI/통합 테스트 필요
         * 이유: React 컴포넌트와 상호작용하는 상태 관리 로직으로
         * 실제 UI 컨텍스트에서의 통합 테스트가 필요함
         */
        'store/**/*.ts',

        /**
         * AI Prompt Strategies - 별도 E2E 테스트 필요
         * 이유: 실제 AI 모델 API 호출과 응답 검증이 필요하며,
         * 단위 테스트로 검증하기 어려운 외부 의존성 존재
         */
        'lib/prompt-strategies/**/*.ts',

        /**
         * 샘플 데이터 및 템플릿 - 정적 데이터
         * 이유: 하드코딩된 샘플 스키마와 템플릿으로 로직이 없음
         */
        'lib/sample-data.ts',
        'lib/prompt-templates.ts',

        /**
         * AI 서비스 레이어 - 외부 API 통합
         * 이유: 외부 AI API (Claude, GPT 등) 호출 로직으로
         * Mock이 아닌 실제 통합 테스트가 필요함
         */
        'lib/ai-service.ts',
        'lib/ai-model-registry.ts',

        /**
         * UI 유틸리티 및 생성기 - UI 의존성
         * 이유: React 컴포넌트 생성 및 파일 시스템 작업을 포함하여
         * 브라우저 환경 또는 통합 테스트가 필요함
         */
        'lib/utils.ts',
        'lib/component-library.ts',
        'lib/file-exporter.ts',
        'lib/code-generator.ts',
      ],
      // 커버리지 임계값 설정
      // 현재 달성: 89.22% lines, 93.75% functions, 76.45% branches, 89.26% statements
      // 임계값을 실제 달성 수준에 근접하게 상향하여 회귀 방지 강화
      thresholds: {
        lines: 88,      // 현재 89.22% 달성 → 88% 유지 필수 (회귀 방지 강화)
        functions: 90,  // 현재 93.75% 달성 → 90% 유지 필수 (회귀 방지 강화)
        branches: 75,   // 현재 76.45% 달성 → 75% 유지 필수 (회귀 방지 강화)
        statements: 88  // 현재 89.26% 달성 → 88% 유지 필수 (회귀 방지 강화)
      }
    },

    // 테스트 실행 설정 - 빠른 피드백을 위해 5초로 최적화
    testTimeout: 5000,
    hookTimeout: 5000,
  },

  // Path alias 설정 (Next.js와 동일하게)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/store': path.resolve(__dirname, './store'),
      '@/types': path.resolve(__dirname, './types'),
    }
  }
})
