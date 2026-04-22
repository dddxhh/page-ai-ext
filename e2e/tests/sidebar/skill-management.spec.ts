import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)

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

test.describe('Skill Management', () => {
  test.describe('Load and Display', () => {
    test('should display built-in skills on load', async ({ page }) => {
      const skillCards = page.locator('.skill-card')
      await expect(skillCards.first()).toBeVisible({ timeout: 10000 })
      const count = await skillCards.count()
      await expect(count).toBeGreaterThanOrEqual(3)
    })

    test('should show built-in tag for built-in skills', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      await expect(firstSkill.locator('.el-tag').filter({ hasText: '内置' })).toBeVisible({
        timeout: 10000,
      })
    })

    test('should have search input', async ({ page }) => {
      const searchInput = page.locator('.skills-header .el-input input')
      await expect(searchInput).toBeVisible()
    })

    test('should have add skill button', async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button--primary')
      await expect(addButton).toBeVisible()
      await expect(addButton).toBeEnabled()
    })
  })

  test.describe('Create Skill', () => {
    test('should open create dialog', async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button--primary')
      await addButton.click({ timeout: 10000 })

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })

    test('should have form fields in dialog', async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button--primary')
      await addButton.click({ timeout: 10000 })

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })

      const nameInput = page.locator('.el-dialog .el-form').locator('.el-input input').first()
      await expect(nameInput).toBeVisible()
    })

    test('should have save button in dialog', async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button--primary')
      await addButton.click({ timeout: 10000 })

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })

      const saveButton = page.locator('.el-dialog .el-dialog__footer .el-button--primary')
      await expect(saveButton).toBeVisible()
    })

    test('should have cancel button in dialog', async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button--primary')
      await addButton.click({ timeout: 10000 })

      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })

      const cancelButton = page.locator('.el-dialog .el-dialog__footer .el-button').first()
      await expect(cancelButton).toBeVisible()
    })
  })

  test.describe('Built-in Skill Protection', () => {
    test('should disable edit button for built-in skills', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      const editButton = firstSkill
        .locator('.skill-card-actions .el-button')
        .filter({ hasText: '编辑' })
      await expect(editButton).toBeDisabled()
    })

    test('should disable delete button for built-in skills', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      const deleteButton = firstSkill.locator('.skill-card-actions .el-button--danger')
      await expect(deleteButton).toBeDisabled()
    })

    test('should have copy button enabled for built-in skills', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      const copyButton = firstSkill
        .locator('.skill-card-actions .el-button')
        .filter({ hasText: '复制' })
      await expect(copyButton).toBeEnabled()
    })
  })

  test.describe('Export and Import', () => {
    test('should have export button', async ({ page }) => {
      const exportButton = page.locator('.skills-footer .el-button').filter({ hasText: '导出技能' })
      await expect(exportButton).toBeVisible()
    })

    test('should have import button', async ({ page }) => {
      const importButton = page.locator('.skills-footer .el-button').filter({ hasText: '导入技能' })
      await expect(importButton).toBeVisible()
    })

    test('should export skills', async ({ page }) => {
      const exportButton = page.locator('.skills-footer .el-button').filter({ hasText: '导出技能' })

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        exportButton.click(),
      ])

      expect(download).toBeTruthy()
      const fileName = download.suggestedFilename()
      expect(fileName).toContain('.json')
    })
  })

  test.describe('Enable/Disable Custom Skill', () => {
    test('custom skill enable/disable flow', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      const copyButton = firstSkill.locator('.el-button').filter({ hasText: '复制' })
      await copyButton.click({ timeout: 10000 })
      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })

      const uniqueName = 'Test Enable Disable ' + Date.now()
      const nameInput = page.locator('.editor-left .el-input input').first()
      await nameInput.fill(uniqueName)

      const textareas = page.locator('.editor-left .el-textarea textarea')
      await textareas.first().fill('Test description for enable/disable testing')
      await textareas.nth(1).fill('Test system prompt for enable/disable testing')

      const saveButton = page.locator('.el-dialog .el-button').filter({ hasText: '保存' })
      await saveButton.click({ timeout: 10000 })
      await page.waitForTimeout(500)

      const customSkill = page.locator('.skill-card').filter({ hasText: uniqueName })
      await expect(customSkill).toBeVisible({ timeout: 10000 })

      const enableSwitch = customSkill.locator('.el-switch')
      await expect(enableSwitch).toBeVisible({ timeout: 10000 })
      await expect(enableSwitch).toHaveClass(/is-checked/, { timeout: 10000 })

      await enableSwitch.click({ timeout: 10000 })
      await page.waitForTimeout(500)
      await expect(enableSwitch).not.toHaveClass(/is-checked/, { timeout: 10000 })
      await expect(customSkill).toHaveClass(/skill-card-disabled/, { timeout: 10000 })
      await expect(customSkill.locator('.el-tag').filter({ hasText: '已禁用' })).toBeVisible({
        timeout: 10000,
      })

      await enableSwitch.click({ timeout: 10000 })
      await page.waitForTimeout(500)
      await expect(enableSwitch).toHaveClass(/is-checked/, { timeout: 10000 })
      await expect(customSkill.locator('.el-tag').filter({ hasText: '已禁用' })).not.toBeVisible({
        timeout: 10000,
      })
    })

    test('built-in skill has no enable switch', async ({ page }) => {
      const firstSkill = page.locator('.skill-card').first()
      const enableSwitch = firstSkill.locator('.el-switch')
      await expect(enableSwitch).not.toBeVisible({ timeout: 10000 })
    })
  })
})
