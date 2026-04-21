import { Page } from '@playwright/test'

export async function openSidePanel(page: Page, extensionId: string): Promise<void> {
  await page.goto(`chrome-extension://${extensionId}/sidebar.html`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
}

export async function clearStorage(page: Page): Promise<void> {
  const url = page.url()
  if (!url.startsWith('chrome-extension://')) {
    throw new Error('clearStorage must be called on an extension page')
  }
  await page.evaluate(() => {
    chrome.storage.local.clear()
  })
}
