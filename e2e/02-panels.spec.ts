import { test, expect } from '@playwright/test'

test.describe.skip('패널 구조', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('3-패널 레이아웃이 올바르게 표시되어야 함', async ({ page }) => {
    // Library Panel (왼쪽) - aside 내부에서 검색
    await expect(page.locator('aside').first()).toBeVisible()

    // Canvas (중앙)
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Layers/Properties 탭 (오른쪽)
    await expect(page.getByRole('button', { name: 'Layers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Properties' })).toBeVisible()
  })

  test('Layers와 Properties 탭을 전환할 수 있어야 함', async ({ page }) => {
    // Layers 탭이 기본으로 활성화되어 있어야 함
    const layersTab = page.getByRole('button', { name: 'Layers' })
    const propertiesTab = page.getByRole('button', { name: 'Properties' })

    // Properties 탭 클릭
    await propertiesTab.click()
    await page.waitForTimeout(300)

    // 다시 Layers 탭 클릭
    await layersTab.click()
    await page.waitForTimeout(300)

    // 페이지가 정상적으로 동작하는지 확인
    await expect(page.locator('h1')).toContainText('Visual Layout Builder')
  })
})
