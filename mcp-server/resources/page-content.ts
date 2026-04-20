import { mcpServer } from '../server'

mcpServer.registerResource({
  uri: 'page://content',
  name: 'Page Content',
  description: 'Current page content',
  mimeType: 'text/markdown',
})

mcpServer.registerResource({
  uri: 'page://structure',
  name: 'Page Structure',
  description: 'Page DOM structure',
  mimeType: 'application/json',
})

mcpServer.registerResource({
  uri: 'conversation://history',
  name: 'Conversation History',
  description: 'Current conversation history',
  mimeType: 'application/json',
})
