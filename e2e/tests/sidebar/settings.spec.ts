import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)
})

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
    const settingsButton = page
      .locator('.el-header .el-button-group .el-button')
      .filter({ hasText: '设置' })
    await settingsButton.click({ timeout: 10000 })
    await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 10000 })
  })

  test.describe('Navigation', () => {
    test('should display settings panel', async ({ page }) => {
      await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.settings-header h3')).toContainText('设置')
    })

    test('should have multiple tabs', async ({ page }) => {
      const tabs = page.locator('.el-tabs__item')
      await expect(tabs).toHaveCount(5, { timeout: 10000 })
    })

    test('should switch between tabs', async ({ page }) => {
      const skillsTab = page.locator('.el-tabs__item').filter({ hasText: '技能' })
      await skillsTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)
      await expect(page.locator('.skill-cards')).toBeVisible({ timeout: 10000 })

      const aboutTab = page.locator('.el-tabs__item').filter({ hasText: '关于' })
      await aboutTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)
      await expect(page.locator('.about-section')).toBeVisible({ timeout: 10000 })
    })

    test('should close settings panel', async ({ page }) => {
      const closeButton = page.locator('.settings-header .el-button').filter({ hasText: '关闭' })
      await closeButton.click()
      await page.waitForTimeout(1000)
      await expect(page.locator('.settings-panel')).not.toBeVisible()
    })
  })

  test.describe('Theme Settings', () => {
    test('should display theme options', async ({ page }) => {
      const generalTab = page.locator('.el-tabs__item').filter({ hasText: '通用' })
      await generalTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const themeSelect = page
        .locator('.el-form-item')
        .filter({ hasText: '主题' })
        .locator('.el-select')
      await themeSelect.click({ timeout: 10000 })

      await expect(
        page.locator('.el-select-dropdown__item').filter({ hasText: '浅色' })
      ).toBeVisible()
      await expect(
        page.locator('.el-select-dropdown__item').filter({ hasText: '深色' })
      ).toBeVisible()
      await expect(
        page.locator('.el-select-dropdown__item').filter({ hasText: '自动' })
      ).toBeVisible()
    })

    test('should change theme to dark', async ({ page }) => {
      const generalTab = page.locator('.el-tabs__item').filter({ hasText: '通用' })
      await generalTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const themeSelect = page
        .locator('.el-form-item')
        .filter({ hasText: '主题' })
        .locator('.el-select')
      await themeSelect.click({ timeout: 10000 })
      await page.locator('.el-select-dropdown__item').filter({ hasText: '深色' }).click()
      await page.waitForTimeout(500)

      const saveButton = page.locator('.settings-footer .el-button--primary')
      await expect(saveButton).toBeEnabled()
    })
  })

  test.describe('Language Settings', () => {
    test('should display language options', async ({ page }) => {
      const generalTab = page.locator('.el-tabs__item').filter({ hasText: '通用' })
      await generalTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const languageSelect = page
        .locator('.el-form-item')
        .filter({ hasText: '语言' })
        .locator('.el-select')
      await languageSelect.click({ timeout: 10000 })

      await expect(
        page.locator('.el-select-dropdown__item').filter({ hasText: '中文' })
      ).toBeVisible()
      await expect(
        page.locator('.el-select-dropdown__item').filter({ hasText: 'English' })
      ).toBeVisible()
    })
  })

  test.describe('About Section', () => {
    test('should display version information', async ({ page }) => {
      const aboutTab = page.locator('.el-tabs__item').filter({ hasText: '关于' })
      await aboutTab.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      await expect(page.locator('.about-section')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.about-section')).toContainText('AI 助手扩展')
    })
  })
})
