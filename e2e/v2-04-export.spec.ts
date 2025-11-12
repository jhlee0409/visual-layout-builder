import { test, expect } from '@playwright/test'

test.describe('V2 코드 Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v2')
    // 샘플 로드
    await page.getByRole('button', { name: 'Load Sample' }).click()
    await expect(page.locator('header').getByText(/[1-9]\d* components/)).toBeVisible({ timeout: 3000 })
  })

  test('Export 모달을 열 수 있어야 함', async ({ page }) => {
    // Generate Prompt 버튼 클릭
    const exportButton = page.getByRole('button', { name: 'Generate Prompt' })
    await expect(exportButton).toBeVisible()

    await exportButton.click()
    await page.waitForTimeout(500)

    // 모달이 열렸는지 확인
    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible({ timeout: 2000 })
  })

  test('모달에서 export 옵션을 확인할 수 있어야 함', async ({ page }) => {
    // Generate Prompt 버튼 클릭
    await page.getByRole('button', { name: 'Generate Prompt' }).click()
    await page.waitForTimeout(500)

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible()

    // 모달 내부에 버튼이나 옵션이 있는지 확인
    const modalButtons = await modal.getByRole('button').all()
    expect(modalButtons.length).toBeGreaterThan(0)
  })

  test('모달을 닫을 수 있어야 함', async ({ page }) => {
    // 모달 열기
    await page.getByRole('button', { name: 'Generate Prompt' }).click()
    await page.waitForTimeout(500)

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible()

    // Close 버튼이나 X 버튼 찾기
    const closeButton = modal.locator('button').filter({ hasText: /Close|Cancel|×/ }).first()

    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForTimeout(300)
      await expect(modal).not.toBeVisible()
    } else {
      // ESC 키로 닫기
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await expect(modal).not.toBeVisible()
    }
  })
})
