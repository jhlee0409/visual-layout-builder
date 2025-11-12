import { test, expect } from '@playwright/test'

test.describe.skip('브레이크포인트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 샘플 로드
    await page.getByRole('button', { name: 'Load Sample' }).click()
    await expect(page.locator('header').getByText(/[1-9]\d* components/)).toBeVisible({ timeout: 3000 })
  })

  test('브레이크포인트 전환 버튼이 표시되어야 함', async ({ page }) => {
    // 브레이크포인트 관련 버튼 찾기
    const buttons = await page.getByRole('button').all()

    // Mobile, Tablet, Desktop 등의 브레이크포인트 버튼이 있는지 확인
    const buttonTexts = await Promise.all(buttons.map(b => b.textContent()))
    const hasBreakpointButtons = buttonTexts.some(text =>
      text && /mobile|tablet|desktop|sm|md|lg|xl/i.test(text)
    )

    expect(hasBreakpointButtons).toBe(true)
  })

  test('다른 브레이크포인트로 전환할 수 있어야 함', async ({ page }) => {
    // 모든 버튼 가져오기
    const buttons = await page.getByRole('button').all()

    // 브레이크포인트 버튼 찾기
    const breakpointButtons = []
    for (const button of buttons) {
      const text = await button.textContent()
      if (text && /mobile|tablet|desktop|sm|md|lg|xl/i.test(text)) {
        breakpointButtons.push(button)
      }
    }

    // 브레이크포인트 버튼이 2개 이상 있으면 전환 테스트
    if (breakpointButtons.length >= 2) {
      await breakpointButtons[0].click()
      await page.waitForTimeout(300)

      await breakpointButtons[1].click()
      await page.waitForTimeout(300)

      // 캔버스가 여전히 표시되는지 확인
      const canvas = page.locator('canvas').first()
      await expect(canvas).toBeVisible()
    }
  })
})
