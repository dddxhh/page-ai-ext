import { messaging } from '~/modules/messaging'
import { handleToolExecution, handleGetPageContentRequest } from '~/utils/content-handlers'
import { defineContentScript } from 'wxt/sandbox'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    messaging.initialize()

    messaging.onMessage('EXECUTE_TOOL', handleToolExecution)

    messaging.onMessage('GET_PAGE_CONTENT', handleGetPageContentRequest)
  },
})
