import { test, expect } from '../../setup/fixtures'
import { openSidePanel, clearStorage } from '../../setup/helpers'

test.beforeEach(async ({ page, extensionId }) => {
  test.setTimeout(60000)
  await openSidePanel(page, extensionId)
  await clearStorage(page)
  await page.waitForTimeout(500)
})

test.describe('Keyboard Commands', () => {
  test.describe('Command Registration', () => {
    test('should have toggleSidebar command registered', async ({ page }) => {
      await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
      const commands = await page.evaluate(() => {
        return chrome.commands.getAll()
      })

      const toggleCommand = commands.find((c) => c.name === 'toggleSidebar')
      expect(toggleCommand).toBeDefined()
      expect(toggleCommand?.description).toBeTruthy()
    })

    test('should have newConversation command registered', async ({ page }) => {
      await expect(page.locator('.chat-panel')).toBeVisible({ timeout: 10000 })
      const commands = await page.evaluate(() => {
        return chrome.commands.getAll()
      })

      const newConvCommand = commands.find((c) => c.name === 'newConversation')
      expect(newConvCommand).toBeDefined()
      expect(newConvCommand?.description).toBeTruthy()
    })
  })
})
