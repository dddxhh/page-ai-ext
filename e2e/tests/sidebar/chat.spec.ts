import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)
})

test.describe('Chat Flow', () => {
  test('should display chat panel on load', async ({ page }) => {
    await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.empty-state')).toBeVisible({ timeout: 10000 })
  })

  test('should show empty state when no messages', async ({ page }) => {
    await expect(page.locator('.empty-state')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.empty-state')).toContainText('暂无消息')
  })

  test('should have input area visible', async ({ page }) => {
    await expect(page.locator('.input-area')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.input-area textarea')).toBeVisible()
    await expect(page.locator('.input-area .el-button--primary')).toBeVisible()
  })

  test('should allow typing in input', async ({ page }) => {
    const input = page.locator('.input-area textarea')
    await input.fill('Hello, this is a test message')
    await expect(input).toHaveValue('Hello, this is a test message')
  })

  test('should have send button initially enabled', async ({ page }) => {
    const sendButton = page.locator('.input-area .el-button--primary')
    await expect(sendButton).toBeEnabled()
  })

  test('should not send empty message', async ({ page }) => {
    const sendButton = page.locator('.input-area .el-button--primary')
    await sendButton.click()
    await expect(page.locator('.message')).toHaveCount(0)
  })

  test('should not send whitespace only message', async ({ page }) => {
    const input = page.locator('.input-area textarea')
    await input.fill('   ')
    const sendButton = page.locator('.input-area .el-button--primary')
    await sendButton.click()
    await expect(page.locator('.message')).toHaveCount(0)
  })

  test('should have clear button in header', async ({ page }) => {
    const clearButton = page
      .locator('.chat-header .el-button-group .el-button')
      .filter({ hasText: '清空' })
    await expect(clearButton).toBeVisible()
  })

  test('should have skill selector button', async ({ page }) => {
    const skillButton = page
      .locator('.chat-header .el-button-group .el-button')
      .filter({ hasText: '选择技能' })
    await expect(skillButton).toBeVisible()
  })

  test('should have model selector button', async ({ page }) => {
    const modelButton = page
      .locator('.chat-header .el-button-group .el-button')
      .filter({ hasText: '切换模型' })
    await expect(modelButton).toBeVisible()
  })
})
