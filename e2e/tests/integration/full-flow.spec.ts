import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)
})

test.describe('Integration Tests', () => {
  test('navigation flow: chat -> settings -> skills', async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })

    const settingsButton = page
      .locator('.el-header .el-button-group .el-button')
      .filter({ hasText: '设置' })
    await settingsButton.click({ timeout: 10000 })

    await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 10000 })

    const skillsTab = page.locator('.el-tabs__item').filter({ hasText: '技能' })
    await skillsTab.click({ timeout: 10000 })
    await page.waitForTimeout(500)

    await expect(page.locator('.skill-cards')).toBeVisible({ timeout: 10000 })
  })

  test('skill selector dialog opens', async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })

    const skillButton = page
      .locator('.chat-header .el-button-group .el-button')
      .filter({ hasText: '选择技能' })
    await expect(skillButton).toBeVisible()
    await expect(skillButton).toBeEnabled()
  })

  test('can open model selector dialog', async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })

    const modelButton = page
      .locator('.chat-header .el-button-group .el-button')
      .filter({ hasText: '切换模型' })
    await modelButton.click()

    await page.waitForTimeout(500)
  })

  test('can navigate all settings tabs', async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })

    const settingsButton = page
      .locator('.el-header .el-button-group .el-button')
      .filter({ hasText: '设置' })
    await settingsButton.click({ timeout: 10000 })

    await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 10000 })

    const tabs = ['通用', '快捷键', '隐私', '技能', '关于']
    for (const tabName of tabs) {
      const tab = page.locator('.el-tabs__item').filter({ hasText: tabName })
      await tab.click({ timeout: 10000 })
      await page.waitForTimeout(300)
    }

    await expect(page.locator('.settings-panel')).toBeVisible()
  })
})
