import { messaging } from '~/modules/messaging'

interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
}

interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
}

class MCPServer {
  private tools: Map<string, MCPTool> = new Map()
  private resources: Map<string, MCPResource> = new Map()

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool)
  }

  registerResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource)
  }

  getTools(): MCPTool[] {
    return Array.from(this.tools.values())
  }

  getResources(): MCPResource[] {
    return Array.from(this.resources.values())
  }

  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool not found: ${name}`)
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
      throw new Error('No active tab')
    }

    return await messaging.sendToContentScript(tab.id, 'EXECUTE_TOOL', {
      tool: name,
      params: args,
    })
  }

  async getResource(uri: string): Promise<any> {
    const resource = this.resources.get(uri)
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`)
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
      throw new Error('No active tab')
    }

    return await messaging.sendToContentScript(tab.id, 'GET_PAGE_CONTENT', { uri })
  }
}

export const mcpServer = new MCPServer()
