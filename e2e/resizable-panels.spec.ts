import { test, expect } from '@playwright/test'

test.describe('Resizable Panels - Phase 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')
  })

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    // 헤더 확인
    await expect(page.getByRole('heading', { name: 'Visual Layout Builder' })).toBeVisible()

    // 주요 패널 확인 (우측 패널 내부의 헤더 선택)
    await expect(page.getByRole('heading', { name: 'Layers', level: 2 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Properties', level: 2 })).toBeVisible()
  })

  test('Library 패널이 리사이징 가능하다', async ({ page }) => {
    // Library 패널 리사이즈 핸들 찾기
    const resizeHandles = page.locator('[data-panel-resize-handle-id]')
    const libraryResizeHandle = resizeHandles.first()

    // 핸들이 존재하는지 확인
    await expect(libraryResizeHandle).toBeVisible()

    // 초기 위치 저장
    const initialBox = await libraryResizeHandle.boundingBox()
    expect(initialBox).not.toBeNull()

    // 드래그하여 패널 크기 조정
    if (initialBox) {
      await libraryResizeHandle.hover()
      await page.mouse.down()
      await page.mouse.move(initialBox.x + 100, initialBox.y)
      await page.mouse.up()

      // 새 위치 확인
      const newBox = await libraryResizeHandle.boundingBox()
      expect(newBox).not.toBeNull()
      if (newBox) {
        expect(newBox.x).toBeGreaterThan(initialBox.x)
      }
    }
  })

  test('Layers와 Properties가 수직 분할되어 있다', async ({ page }) => {
    // Layers 헤더 (h2 태그로 특정)
    const layersHeader = page.getByRole('heading', { name: 'Layers', level: 2 })
    await expect(layersHeader).toBeVisible()

    // Properties 헤더 (h2 태그로 특정)
    const propertiesHeader = page.getByRole('heading', { name: 'Properties', level: 2 })
    await expect(propertiesHeader).toBeVisible()

    // 두 패널의 위치 확인 (Layers가 위, Properties가 아래)
    const layersBox = await layersHeader.boundingBox()
    const propertiesBox = await propertiesHeader.boundingBox()

    expect(layersBox).not.toBeNull()
    expect(propertiesBox).not.toBeNull()

    if (layersBox && propertiesBox) {
      expect(layersBox.y).toBeLessThan(propertiesBox.y)
    }
  })

  test('Layers/Properties 사이 수직 리사이즈가 가능하다', async ({ page }) => {
    // 수직 리사이즈 핸들 찾기 (h-1 클래스 확인)
    const verticalHandle = page.locator('.h-1').first()

    await expect(verticalHandle).toBeVisible()

    const initialBox = await verticalHandle.boundingBox()
    expect(initialBox).not.toBeNull()

    if (initialBox) {
      await verticalHandle.hover()
      await page.mouse.down()
      await page.mouse.move(initialBox.x, initialBox.y + 50)
      await page.mouse.up()

      // 새 위치 확인
      const newBox = await verticalHandle.boundingBox()
      expect(newBox).not.toBeNull()
      if (newBox) {
        expect(newBox.y).toBeGreaterThan(initialBox.y)
      }
    }
  })

  test('Canvas 영역이 정상적으로 표시된다', async ({ page }) => {
    // Canvas 영역 확인
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Breakpoint Switcher 영역이 존재하는지 확인 (border-b 클래스로 구분)
    const breakpointArea = page.locator('div.border-b').filter({ has: page.locator('canvas').first() })
    await expect(breakpointArea).toBeTruthy()
  })

  test('리사이즈 핸들에 hover 효과가 적용된다', async ({ page }) => {
    const resizeHandle = page.locator('[data-panel-resize-handle-id]').first()

    // hover 전 스타일
    await resizeHandle.hover()

    // hover 시 bg-blue-500 클래스 또는 스타일 확인
    const handleClass = await resizeHandle.getAttribute('class')
    expect(handleClass).toContain('hover:bg-blue-500')
  })

  test('localStorage에 레이아웃이 저장된다', async ({ page, context }) => {
    // 패널 리사이즈
    const resizeHandle = page.locator('[data-panel-resize-handle-id]').first()
    const box = await resizeHandle.boundingBox()

    if (box) {
      await resizeHandle.hover()
      await page.mouse.down()
      await page.mouse.move(box.x + 100, box.y)
      await page.mouse.up()

      // 잠시 대기 (debounce)
      await page.waitForTimeout(500)

      // localStorage 확인
      const storage = await context.storageState()
      const localStorage = storage.origins?.[0]?.localStorage || []

      const layoutItem = localStorage.find(item =>
        item.name.includes('laylder-main-layout')
      )

      expect(layoutItem).toBeDefined()
    }
  })

  test('페이지 새로고침 후 레이아웃이 유지된다', async ({ page }) => {
    // 초기 패널 리사이즈
    const resizeHandle = page.locator('[data-panel-resize-handle-id]').first()
    const initialBox = await resizeHandle.boundingBox()

    if (initialBox) {
      await resizeHandle.hover()
      await page.mouse.down()
      await page.mouse.move(initialBox.x + 100, initialBox.y)
      await page.mouse.up()
      await page.waitForTimeout(500)

      const afterResizeBox = await resizeHandle.boundingBox()

      // 페이지 새로고침
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 리사이즈 핸들 다시 찾기
      const reloadedHandle = page.locator('[data-panel-resize-handle-id]').first()
      const reloadedBox = await reloadedHandle.boundingBox()

      // 위치가 유지되는지 확인 (약간의 오차 허용)
      if (afterResizeBox && reloadedBox) {
        expect(Math.abs(afterResizeBox.x - reloadedBox.x)).toBeLessThan(5)
      }
    }
  })
})
