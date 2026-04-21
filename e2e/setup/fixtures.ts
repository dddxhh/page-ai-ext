import { test as base, BrowserContext } from '@playwright/test'
import path from 'path'

const extensionPath = path.resolve('.output/chrome-mv3')

export type ExtensionTestFixtures = {
  context: BrowserContext
  extensionId: string
}

export const test = base.extend<ExtensionTestFixtures>({
  browser: async ({ playwright }, use) => {
    const browser = await playwright.chromium.launchPersistentContext(
      '/tmp/playwright-extension-test',
      {
        headless: false,
        args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
      }
    )
    await use(browser)
    await browser.close()
  },
  context: async ({ browser }, use) => {
    await use(browser as unknown as BrowserContext)
  },
  extensionId: async ({ context }, use) => {
    let serviceWorkers = context.serviceWorkers()
    if (serviceWorkers.length > 0) {
      const url = serviceWorkers[0].url()
      const match = url.match(/chrome-extension:\/\/([a-zA-Z0-9-]+)/)
      if (match) {
        await use(match[1])
        return
      }
    }

    let backgroundPages = context.backgroundPages()
    if (backgroundPages.length > 0) {
      const url = backgroundPages[0].url()
      const match = url.match(/chrome-extension:\/\/([a-zA-Z0-9-]+)/)
      if (match) {
        await use(match[1])
        return
      }
    }

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 500))

      serviceWorkers = context.serviceWorkers()
      if (serviceWorkers.length > 0) {
        const url = serviceWorkers[0].url()
        const match = url.match(/chrome-extension:\/\/([a-zA-Z0-9-]+)/)
        if (match) {
          await use(match[1])
          return
        }
      }

      backgroundPages = context.backgroundPages()
      if (backgroundPages.length > 0) {
        const url = backgroundPages[0].url()
        const match = url.match(/chrome-extension:\/\/([a-zA-Z0-9-]+)/)
        if (match) {
          await use(match[1])
          return
        }
      }
    }

    throw new Error('Could not find extension background page or service worker')
  },
})

export { expect } from '@playwright/test'
