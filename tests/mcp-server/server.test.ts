import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mcpServer } from '../../mcp-server/server'

const mockSendToContentScript = vi.hoisted(() => vi.fn())

vi.mock('../../modules/messaging', () => ({
  messaging: {
    sendToContentScript: mockSendToContentScript,
  },
}))

describe('MCPServer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mcpServer as any).tools = new Map()
    ;(mcpServer as any).resources = new Map()
    chrome.tabs.query = vi.fn().mockResolvedValue([{ id: 123 }])
    mockSendToContentScript.mockResolvedValue({ success: true })
  })

  describe('registerTool', () => {
    it('should register a tool', () => {
      const tool = {
        name: 'test_tool',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: {} },
      }

      mcpServer.registerTool(tool)

      const tools = mcpServer.getTools()
      expect(tools).toHaveLength(1)
      expect(tools[0].name).toBe('test_tool')
    })

    it('should overwrite existing tool with same name', () => {
      const tool1 = { name: 'test_tool', description: 'Tool 1', inputSchema: {} }
      const tool2 = { name: 'test_tool', description: 'Tool 2', inputSchema: {} }

      mcpServer.registerTool(tool1)
      mcpServer.registerTool(tool2)

      const tools = mcpServer.getTools()
      expect(tools).toHaveLength(1)
      expect(tools[0].description).toBe('Tool 2')
    })

    it('should register multiple tools', () => {
      mcpServer.registerTool({ name: 'tool1', description: 'Tool 1', inputSchema: {} })
      mcpServer.registerTool({ name: 'tool2', description: 'Tool 2', inputSchema: {} })

      const tools = mcpServer.getTools()
      expect(tools).toHaveLength(2)
    })
  })

  describe('registerResource', () => {
    it('should register a resource', () => {
      const resource = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'Test',
        mimeType: 'text/plain',
      }

      mcpServer.registerResource(resource)

      const resources = mcpServer.getResources()
      expect(resources).toHaveLength(1)
      expect(resources[0].uri).toBe('test://resource')
    })

    it('should overwrite existing resource with same uri', () => {
      const resource1 = {
        uri: 'test://resource',
        name: 'Resource 1',
        description: '',
        mimeType: '',
      }
      const resource2 = {
        uri: 'test://resource',
        name: 'Resource 2',
        description: '',
        mimeType: '',
      }

      mcpServer.registerResource(resource1)
      mcpServer.registerResource(resource2)

      const resources = mcpServer.getResources()
      expect(resources).toHaveLength(1)
      expect(resources[0].name).toBe('Resource 2')
    })
  })

  describe('getTools', () => {
    it('should return all registered tools', () => {
      mcpServer.registerTool({ name: 'tool1', description: '1', inputSchema: {} })
      mcpServer.registerTool({ name: 'tool2', description: '2', inputSchema: {} })

      const tools = mcpServer.getTools()

      expect(tools).toHaveLength(2)
    })

    it('should return empty array when no tools', () => {
      const tools = mcpServer.getTools()

      expect(tools).toHaveLength(0)
    })
  })

  describe('getResources', () => {
    it('should return all registered resources', () => {
      mcpServer.registerResource({ uri: 'r1', name: 'R1', description: '', mimeType: '' })
      mcpServer.registerResource({ uri: 'r2', name: 'R2', description: '', mimeType: '' })

      const resources = mcpServer.getResources()

      expect(resources).toHaveLength(2)
    })

    it('should return empty array when no resources', () => {
      const resources = mcpServer.getResources()

      expect(resources).toHaveLength(0)
    })
  })

  describe('executeTool', () => {
    it('should execute registered tool', async () => {
      mcpServer.registerTool({ name: 'click_element', description: 'Click', inputSchema: {} })
      mockSendToContentScript.mockResolvedValue({ success: true })

      const result = await mcpServer.executeTool('click_element', { selector: '#btn' })

      expect(mockSendToContentScript).toHaveBeenCalledWith(123, 'EXECUTE_TOOL', {
        tool: 'click_element',
        params: { selector: '#btn' },
      })
      expect(result).toEqual({ success: true })
    })

    it('should throw error for unregistered tool', async () => {
      await expect(mcpServer.executeTool('unknown_tool', {})).rejects.toThrow(
        'Tool not found: unknown_tool'
      )
    })

    it('should throw error when no active tab', async () => {
      mcpServer.registerTool({ name: 'test_tool', description: 'Test', inputSchema: {} })
      chrome.tabs.query = vi.fn().mockResolvedValue([{ id: undefined }])

      await expect(mcpServer.executeTool('test_tool', {})).rejects.toThrow('No active tab')
    })

    it('should pass through messaging errors', async () => {
      mcpServer.registerTool({ name: 'test_tool', description: 'Test', inputSchema: {} })
      mockSendToContentScript.mockRejectedValue(new Error('Script error'))

      await expect(mcpServer.executeTool('test_tool', {})).rejects.toThrow('Script error')
    })
  })

  describe('getResource', () => {
    it('should get registered resource', async () => {
      mcpServer.registerResource({
        uri: 'page://content',
        name: 'Page Content',
        description: '',
        mimeType: 'text/html',
      })
      mockSendToContentScript.mockResolvedValue({ content: 'test' })

      const result = await mcpServer.getResource('page://content')

      expect(mockSendToContentScript).toHaveBeenCalledWith(123, 'GET_PAGE_CONTENT', {
        uri: 'page://content',
      })
      expect(result).toEqual({ content: 'test' })
    })

    it('should throw error for unregistered resource', async () => {
      await expect(mcpServer.getResource('unknown://resource')).rejects.toThrow(
        'Resource not found: unknown://resource'
      )
    })

    it('should throw error when no active tab', async () => {
      mcpServer.registerResource({
        uri: 'test://resource',
        name: 'Test',
        description: '',
        mimeType: '',
      })
      chrome.tabs.query = vi.fn().mockResolvedValue([{ id: undefined }])

      await expect(mcpServer.getResource('test://resource')).rejects.toThrow('No active tab')
    })

    it('should pass through messaging errors', async () => {
      mcpServer.registerResource({
        uri: 'test://resource',
        name: 'Test',
        description: '',
        mimeType: '',
      })
      mockSendToContentScript.mockRejectedValue(new Error('Content error'))

      await expect(mcpServer.getResource('test://resource')).rejects.toThrow('Content error')
    })
  })
})
