import { mcpServer } from '../server'

mcpServer.registerTool({
  name: 'get_page_content',
  description: 'Extract main content from the page',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['text', 'markdown', 'html', 'json'],
        description: 'Output format',
        default: 'markdown',
      },
      selector: {
        type: 'string',
        description: 'CSS selector for a specific section (optional)',
      },
    },
    required: [],
  },
})

mcpServer.registerTool({
  name: 'get_page_structure',
  description: 'Get page structure and hierarchy',
  inputSchema: {
    type: 'object',
    properties: {
      depth: {
        type: 'number',
        description: 'Depth of structure to return',
        default: 3,
      },
      includeText: {
        type: 'boolean',
        description: 'Include text content in structure',
        default: false,
      },
    },
    required: [],
  },
})

mcpServer.registerTool({
  name: 'find_elements',
  description: 'Find elements matching criteria',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Element text content (optional)',
      },
      tag: {
        type: 'string',
        description: 'HTML tag name (optional)',
      },
      attribute: {
        type: 'string',
        description: 'Attribute name (optional)',
      },
      attributeValue: {
        type: 'string',
        description: 'Attribute value (optional)',
      },
    },
    required: [],
  },
})
