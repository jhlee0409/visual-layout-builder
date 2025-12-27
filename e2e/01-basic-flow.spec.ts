import { test, expect } from '@playwright/test'

test.describe.skip('기본 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('페이지가 올바르게 로드되어야 함', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('Visual Layout Builder')

    // 주요 버튼들 확인
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Load Sample' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Prompt' })).toBeVisible()

    // 컴포넌트 카운트 표시 확인 (header 내부에서만 검색)
    await expect(page.locator('header').getByText(/\d+ components/)).toBeVisible()
  })

  test('샘플 레이아웃을 로드할 수 있어야 함', async ({ page }) => {
    // Load Sample 버튼 클릭
    await page.getByRole('button', { name: 'Load Sample' }).click()

    // 컴포넌트가 추가되었는지 확인 (0이 아닌 숫자, header 내에서만 검색)
    await expect(page.locator('header').getByText(/[1-9]\d* components/)).toBeVisible({ timeout: 3000 })

    // 캔버스가 있는지 확인
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
  })

  test('Reset 버튼이 레이아웃을 초기화해야 함', async ({ page }) => {
    // 먼저 샘플 로드
    await page.getByRole('button', { name: 'Load Sample' }).click()
    await expect(page.locator('header').getByText(/[1-9]\d* components/)).toBeVisible({ timeout: 3000 })

    // Reset 버튼 클릭
    await page.getByRole('button', { name: 'Reset' }).click()

    // 컴포넌트 수가 0으로 돌아갔는지 확인 (header 내에서만 검색)
    await expect(page.locator('header').getByText(/0 components/)).toBeVisible()
  })
})
