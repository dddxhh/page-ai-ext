import { mcpServer } from '../server'

// Register DOM tools
mcpServer.registerTool({
  name: 'click_element',
  description: 'Click an element on the page',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the element',
      },
      text: {
        type: 'string',
        description: 'Element text content (optional)',
      },
      index: {
        type: 'number',
        description: 'Element index if multiple match (optional)',
      },
    },
    required: ['selector'],
  },
})

mcpServer.registerTool({
  name: 'fill_form',
  description: 'Fill a form field with text',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the form field',
      },
      value: {
        type: 'string',
        description: 'Value to fill',
      },
      submit: {
        type: 'boolean',
        description: 'Submit form after filling (optional)',
        default: false,
      },
    },
    required: ['selector', 'value'],
  },
})

mcpServer.registerTool({
  name: 'extract_content',
  description: 'Extract text or data from an element',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the element',
      },
      format: {
        type: 'string',
        enum: ['text', 'html', 'markdown'],
        description: 'Output format',
        default: 'text',
      },
    },
    required: ['selector'],
  },
})

mcpServer.registerTool({
  name: 'scroll_page',
  description: 'Scroll the page',
  inputSchema: {
    type: 'object',
    properties: {
      direction: {
        type: 'string',
        enum: ['up', 'down', 'top', 'bottom'],
        description: 'Scroll direction',
      },
      amount: {
        type: 'number',
        description: 'Scroll amount in pixels (optional)',
      },
    },
  },
})

mcpServer.registerTool({
  name: 'execute_script',
  description: 'Execute custom JavaScript on the page',
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'JavaScript code to execute',
      },
    },
    required: ['code'],
  },
})
