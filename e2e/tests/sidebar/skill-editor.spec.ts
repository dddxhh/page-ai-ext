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
  await expect(page.locator('.skill-cards')).toBeVisible({ timeout: 10000 })
})

test.describe('Skill Editor', () => {
  test.describe('Editor Layout', () => {
    test.beforeEach(async ({ page }) => {
      const copyButton = page
        .locator('.skill-card')
        .first()
        .locator('.el-button')
        .filter({ hasText: '复制' })
      await copyButton.click({ timeout: 10000 })
      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })

    test('should show left edit form', async ({ page }) => {
      const editorLayout = page.locator('.editor-layout')
      await expect(editorLayout).toBeVisible({ timeout: 10000 })
      await expect(editorLayout.locator('.editor-left')).toBeVisible({ timeout: 10000 })
    })

    test('should show right preview panel', async ({ page }) => {
      const editorLayout = page.locator('.editor-layout')
      await expect(editorLayout.locator('.editor-right')).toBeVisible({ timeout: 10000 })
    })

    test('should show name input in edit form', async ({ page }) => {
      const nameInput = page.locator('.editor-left .el-form-item').first().locator('input')
      await expect(nameInput).toBeVisible({ timeout: 10000 })
    })

    test('should show description textarea in edit form', async ({ page }) => {
      const textareas = page.locator('.editor-left .el-textarea textarea')
      await expect(textareas.first()).toBeVisible({ timeout: 10000 })
    })

    test('should show system prompt textarea in edit form', async ({ page }) => {
      const textareas = page.locator('.editor-left .el-textarea textarea')
      await expect(textareas.nth(1)).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Markdown Preview', () => {
    test.beforeEach(async ({ page }) => {
      const copyButton = page
        .locator('.skill-card')
        .first()
        .locator('.el-button')
        .filter({ hasText: '复制' })
      await copyButton.click({ timeout: 10000 })
      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })

    test('should render preview content', async ({ page }) => {
      const preview = page.locator('.skill-md-preview')
      await expect(preview).toBeVisible({ timeout: 10000 })
    })

    test('should show YAML front matter in preview', async ({ page }) => {
      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toBeVisible({ timeout: 10000 })
    })

    test('should show skill name in YAML', async ({ page }) => {
      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toContainText('name:', { timeout: 10000 })
    })

    test('should show description in YAML', async ({ page }) => {
      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toContainText('description:', { timeout: 10000 })
    })

    test('should update preview when editing name', async ({ page }) => {
      const nameInput = page.locator('.editor-left .el-input input').first()
      const uniqueName = 'Test Skill Name ' + Date.now()
      await nameInput.fill(uniqueName)
      await page.waitForTimeout(500)

      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toContainText(uniqueName, { timeout: 10000 })
    })

    test('should update preview when editing description', async ({ page }) => {
      const textareas = page.locator('.editor-left .el-textarea textarea')
      const uniqueDesc = 'Test Description ' + Date.now()
      await textareas.first().fill(uniqueDesc)
      await page.waitForTimeout(500)

      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toContainText('Test Description', { timeout: 10000 })
    })
  })

  test.describe('New Skill with Markdown', () => {
    test.beforeEach(async ({ page }) => {
      const addButton = page.locator('.skills-header .el-button').filter({ hasText: '新增技能' })
      await addButton.click({ timeout: 10000 })
      await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 10000 })
    })

    test('should show empty form for new skill', async ({ page }) => {
      const nameInput = page.locator('.editor-left .el-input input').first()
      await expect(nameInput).toHaveValue('', { timeout: 10000 })
    })

    test('should show preview with default values', async ({ page }) => {
      const yamlBlock = page.locator('.yaml-front-matter')
      await expect(yamlBlock).toBeVisible({ timeout: 10000 })
    })

    test('should allow saving new skill', async ({ page }) => {
      const nameInput = page.locator('.editor-left .el-input input').first()
      await nameInput.fill('New Test Skill')

      const textareas = page.locator('.editor-left .el-textarea textarea')
      await textareas.first().fill('New skill description for testing')
      await textareas.nth(1).fill('System prompt content for testing purposes')

      const saveButton = page.locator('.el-dialog .el-button').filter({ hasText: '保存' })
      await saveButton.click({ timeout: 10000 })

      await expect(page.locator('.el-dialog')).not.toBeVisible({ timeout: 10000 })
    })
  })
})
