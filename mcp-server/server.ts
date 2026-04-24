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

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) {
        throw new Error('No active tab')
      }

      const result = await messaging.sendToContentScript(tab.id, 'EXECUTE_TOOL', {
        tool: name,
        params: args,
      })

      if (result?.success === false) {
        throw new Error(result.error || 'Tool execution failed')
      }

      return result?.result || result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`Tool execution error (${name}):`, error)
      throw new Error(`Failed to execute tool ${name}: ${errorMsg}`)
    }
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
