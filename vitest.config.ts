import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.ts',
      ],
      exclude: [
        'node_modules/**',
        'e2e/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types/**',
        '**/*.d.ts',
        'lib/utils.ts', // shadcn/ui utility
        'lib/ai-service.ts', // External API calls
        'lib/theme-system.ts', // Theme configuration
        'lib/sample-data.ts', // Data fixtures
        'lib/prompt-templates.ts', // Template strings - mostly static
      ],
      thresholds: {
        lines: 83,
        functions: 90,
        branches: 70,
        statements: 83,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
