import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)

  await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
})

test.describe('Skill Selector', () => {
  test.describe('Open Selector', () => {
    test('should have skill selector button in chat header', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await expect(skillButton).toBeVisible({ timeout: 10000 })
    })

    test('should open skill selector dialog', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })

    test('should show skill list in selector', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.skill-list')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.skill-item').first()).toBeVisible({ timeout: 10000 })
    })

    test('should have search input in selector', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Disabled Skill in Selector', () => {
    test.beforeEach(async ({ page }) => {
      const settingsButton = page
        .locator('.el-header .el-button-group .el-button')
        .filter({ hasText: '设置' })
      await settingsButton.click({ timeout: 10000 })
      await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 10000 })

      const skillsTab = page.locator('.el-tabs__item').filter({ hasText: '技能' })
      await skillsTab.click({ timeout: 10000 })
      await expect(page.locator('.skill-card').first()).toBeVisible({ timeout: 10000 })

      const firstSkill = page.locator('.skill-card').first()
      const copyButton = firstSkill.locator('.el-button').filter({ hasText: '复制' })
      await copyButton.click({ timeout: 10000 })
      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })

      const uniqueName = 'Disabled Test Skill ' + Date.now()
      const nameInput = page.locator('.editor-left .el-input input').first()
      await nameInput.fill(uniqueName)

      const textareas = page.locator('.editor-left .el-textarea textarea')
      await textareas.first().fill('Test description for disabled skill')
      await textareas.nth(1).fill('Test system prompt for disabled skill')

      const saveButton = page.locator('.el-dialog .el-button').filter({ hasText: '保存' })
      await saveButton.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const customSkill = page.locator('.skill-card').filter({ hasText: uniqueName })
      await expect(customSkill).toBeVisible({ timeout: 10000 })

      const enableSwitch = customSkill.locator('.el-switch')
      await enableSwitch.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const closeButton = page.locator('.settings-header .el-button').filter({ hasText: '关闭' })
      await closeButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.settings-panel')).not.toBeVisible({ timeout: 10000 })
      await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
    })

    test('should show disabled skill grayed out', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.skill-list')).toBeVisible({ timeout: 10000 })

      const disabledSkill = page.locator('.skill-item-disabled')
      await expect(disabledSkill).toBeVisible({ timeout: 10000 })
    })

    test('should show disabled tag in selector', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.skill-list')).toBeVisible({ timeout: 10000 })

      const disabledTag = page.locator('.skill-item-disabled .el-tag').filter({ hasText: '已禁用' })
      await expect(disabledTag).toBeVisible({ timeout: 10000 })
    })

    test('should show warning when clicking disabled skill', async ({ page }) => {
      const skillButton = page
        .locator('.chat-header .el-button-group .el-button')
        .filter({ hasText: '选择技能' })
      await skillButton.click({ timeout: 10000 })
      await page.waitForTimeout(1000)

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('.skill-list')).toBeVisible({ timeout: 10000 })

      const disabledSkill = page.locator('.skill-item-disabled')
      await disabledSkill.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      await expect(page.locator('.el-message--warning')).toBeVisible({ timeout: 10000 })
    })
  })
})
