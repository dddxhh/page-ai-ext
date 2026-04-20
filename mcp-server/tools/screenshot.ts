import { mcpServer } from '../server'

mcpServer.registerTool({
  name: 'take_screenshot',
  description: 'Take a screenshot of the page or an element',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for an element (optional, full page if omitted)',
      },
      format: {
        type: 'string',
        enum: ['png', 'jpeg'],
        description: 'Image format',
        default: 'png',
      },
    },
  },
})
