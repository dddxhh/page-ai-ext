# MCP Tool Calling 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善 MCP 工具调用流程，使 AI 能够通过 OpenAI Function Calling 执行页面操作工具。

**Architecture:** 在 api-client 中添加 tool_calls 响应解析，在 background.ts 中实现工具执行循环（AI 返回 tool_calls → 执行工具 → 工具结果作为新消息 → 再次请求 AI）。

**Tech Stack:** TypeScript + OpenAI API (Function Calling) + Chrome Extension Messaging

---

## 问题分析

当前 MCP 工具调用流程不完整：

| 步骤                    | 当前状态  | 问题                                 |
| ----------------------- | --------- | ------------------------------------ |
| 1. 工具定义             | ✅ 已实现 | `mcp-server/tools/*.ts`              |
| 2. 工具传递给 AI        | ✅ 已实现 | `background.ts:92` → `api-client.ts` |
| 3. 解析 tool_calls 响应 | ❌ 缺失   | `api-client.ts` 只处理 `content`     |
| 4. 执行工具调用         | ❌ 缺失   | 需在 `background.ts` 添加            |
| 5. 返回工具结果给 AI    | ❌ 缺失   | 需循环请求                           |

---

## 文件结构

| 文件                               | 操作 | 说明                               |
| ---------------------------------- | ---- | ---------------------------------- |
| `types/mcp-tools.ts`               | 修改 | 添加 tool_calls 相关类型           |
| `types/index.ts`                   | 修改 | 添加 ToolCallResponse 类型         |
| `modules/api-client.ts`            | 修改 | 添加 tool_calls 解析和工具执行循环 |
| `entrypoints/background.ts`        | 修改 | 重构消息处理，支持工具执行循环     |
| `tests/modules/api-client.test.ts` | 修改 | 添加 tool_calls 测试               |
| `tests/fixtures/data-fixtures.ts`  | 修改 | 添加 mockToolCall fixture          |

---

## OpenAI Function Calling 格式

### 工具定义格式 (已实现)

```json
{
  "type": "function",
  "function": {
    "name": "click_element",
    "description": "Click an element on the page",
    "parameters": {
      "type": "object",
      "properties": {
        "selector": { "type": "string", "description": "CSS selector" }
      },
      "required": ["selector"]
    }
  }
}
```

### AI 响应格式 (需处理)

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "click_element",
              "arguments": "{\"selector\": \"#submit-btn\"}"
            }
          }
        ]
      }
    }
  ]
}
```

### 工具结果格式 (需发送)

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": "{\"clicked\": true}"
}
```

---

### Task 1: 添加 tool_calls 类型定义

**Files:**

- Modify: `types/index.ts:32-48`
- Modify: `types/mcp-tools.ts:1-73`

- [ ] **Step 1: 添加 ToolCallResponse 类型到 types/index.ts**

在 `types/index.ts` 中添加：

```typescript
// 在 Message 接口之后添加

export interface ToolCallResponse {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResultMessage {
  role: 'tool'
  tool_call_id: string
  content: string
}

export interface ChatCompletionResponse {
  content?: string
  tool_calls?: ToolCallResponse[]
  finish_reason: 'stop' | 'tool_calls' | 'length'
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run lint`
Expected: PASS (无新增错误)

- [ ] **Step 3: 提交类型定义**

```bash
git add types/index.ts
git commit -m "feat: add ToolCallResponse and ToolResultMessage types"
```

---

### Task 2: 更新 api-client 支持工具调用循环

**Files:**

- Modify: `modules/api-client.ts:25-134`
- Modify: `tests/fixtures/data-fixtures.ts`

- [ ] **Step 1: 添加 mockToolCall fixture**

在 `tests/fixtures/data-fixtures.ts` 末尾添加：

```typescript
export const mockToolCall: ToolCallResponse = {
  id: 'call_test123',
  type: 'function',
  function: {
    name: 'click_element',
    arguments: '{"selector": "#submit-btn"}',
  },
}

export const mockMCPTool = {
  name: 'click_element',
  description: 'Click an element on the page',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'CSS selector' },
    },
    required: ['selector'],
  },
}
```

同时在顶部导入：

```typescript
import { Config, Conversation, Skill, Message, ModelConfig, ToolCallResponse } from '../../types'
```

- [ ] **Step 2: 修改 api-client.ts 添加 chatCompletionWithTools 方法**

在 `modules/api-client.ts` 中，在 `chatCompletion` 方法之后添加新方法：

```typescript
import { ChatCompletionResponse, ToolCallResponse, ToolResultMessage } from '../types'

interface ToolExecutor {
  (name: string, args: Record<string, any>): Promise<any>
}

async chatCompletionWithTools(
  messages: Message[],
  tools: MCPTool[],
  executeTool: ToolExecutor,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const formattedTools = this.formatToolsForAPI(tools)
  let currentMessages = [...messages]
  let maxIterations = 10

  while (maxIterations > 0) {
    maxIterations--

    const response = await this.sendChatRequest(currentMessages, formattedTools)

    if (response.finish_reason === 'stop' && response.content) {
      if (onChunk) {
        onChunk(response.content)
      }
      return response.content
    }

    if (response.finish_reason === 'tool_calls' && response.tool_calls) {
      const assistantMessage = {
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.tool_calls,
      }
      currentMessages.push(assistantMessage as Message)

      for (const toolCall of response.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments)
        const result = await executeTool(toolCall.function.name, args)

        const toolResult: ToolResultMessage = {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        }
        currentMessages.push(toolResult as Message)
      }

      continue
    }

    if (response.finish_reason === 'length') {
      throw new Error('Response truncated due to token limit')
    }

    break
  }

  throw new Error('Tool calling loop exceeded maximum iterations')
}

private formatToolsForAPI(tools: MCPTool[]): any[] {
  return tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }))
}

private async sendChatRequest(
  messages: Message[],
  tools: any[]
): Promise<ChatCompletionResponse> {
  const response = await fetch(this.getAPIURL(), {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify({
      model: this.currentModel!.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id,
      })),
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined,
    }),
    signal: this.currentAbortController?.signal,
  })

  if (!response.ok) {
    throw await this.handleAPIError(response)
  }

  const data = await response.json()
  const choice = data.choices[0]

  return {
    content: choice.message?.content,
    tool_calls: choice.message?.tool_calls,
    finish_reason: choice.finish_reason,
  }
}
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run lint`
Expected: PASS 或显示需要修复的类型错误

- [ ] **Step 4: 提交 api-client 更新**

```bash
git add modules/api-client.ts tests/fixtures/data-fixtures.ts
git commit -m "feat: add tool calling loop support in api-client"
```

---

### Task 3: 为 api-client 工具调用编写测试

**Files:**

- Modify: `tests/modules/api-client.test.ts`

- [ ] **Step 1: 添加测试：解析 tool_calls 响应**

在 `tests/modules/api-client.test.ts` 中添加新的 describe 块：

```typescript
import { mockToolCall, mockMCPTool } from '../fixtures/data-fixtures'

describe('Tool Calling', () => {
  beforeEach(() => {
    apiClient.setModel(mockModelConfig)
  })

  describe('formatToolsForAPI', () => {
    it('should format MCP tools for OpenAI API', () => {
      const formatted = (apiClient as any).formatToolsForAPI([mockMCPTool])

      expect(formatted).toEqual([
        {
          type: 'function',
          function: {
            name: 'click_element',
            description: 'Click an element on the page',
            parameters: mockMCPTool.inputSchema,
          },
        },
      ])
    })

    it('should return empty array for no tools', () => {
      const formatted = (apiClient as any).formatToolsForAPI([])

      expect(formatted).toEqual([])
    })
  })

  describe('sendChatRequest', () => {
    it('should parse tool_calls response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: null,
                tool_calls: [mockToolCall],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await (apiClient as any).sendChatRequest([mockMessage], [])

      expect(result.tool_calls).toBeDefined()
      expect(result.tool_calls?.[0].function.name).toBe('click_element')
      expect(result.finish_reason).toBe('tool_calls')
    })

    it('should parse stop response with content', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: { content: 'Final answer' },
              finish_reason: 'stop',
            },
          ],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await (apiClient as any).sendChatRequest([mockMessage], [])

      expect(result.content).toBe('Final answer')
      expect(result.finish_reason).toBe('stop')
    })
  })

  describe('chatCompletionWithTools', () => {
    it('should execute tool and continue conversation', async () => {
      const toolResponses = [
        {
          ok: true,
          json: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: null,
                  tool_calls: [mockToolCall],
                },
                finish_reason: 'tool_calls',
              },
            ],
          }),
        },
        {
          ok: true,
          json: vi.fn().mockResolvedValue({
            choices: [
              {
                message: { content: 'Element clicked successfully' },
                finish_reason: 'stop',
              },
            ],
          }),
        },
      ]
      mockFetch.mockImplementation(() => Promise.resolve(toolResponses.shift()!))

      const mockExecuteTool = vi.fn().mockResolvedValue({ clicked: true })

      const result = await apiClient.chatCompletionWithTools(
        [mockMessage],
        [mockMCPTool],
        mockExecuteTool
      )

      expect(mockExecuteTool).toHaveBeenCalledWith('click_element', { selector: '#submit-btn' })
      expect(result).toBe('Element clicked successfully')
    })

    it('should throw error on max iterations', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: null,
                tool_calls: [mockToolCall],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const mockExecuteTool = vi.fn().mockResolvedValue({ clicked: true })

      await expect(
        apiClient.chatCompletionWithTools([mockMessage], [mockMCPTool], mockExecuteTool)
      ).rejects.toThrow('Tool calling loop exceeded maximum iterations')
    })
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run tests/modules/api-client.test.ts`
Expected: FAIL (方法未实现)

- [ ] **Step 3: 提交测试文件**

```bash
git add tests/modules/api-client.test.ts
git commit -m "test: add tool calling tests for api-client"
```

---

### Task 4: 重构 background.ts 使用工具调用循环

**Files:**

- Modify: `entrypoints/background.ts:35-178`

- [ ] **Step 1: 修改 SEND_MESSAGE handler 使用 chatCompletionWithTools**

替换 `entrypoints/background.ts` 中的 `SEND_MESSAGE` handler (35-178行)：

```typescript
messaging.onMessage('SEND_MESSAGE', async (data, _sender) => {
  const { content, skillId, includePageContent = true } = data

  try {
    let conversation = await storage.getConversation('current')
    if (!conversation) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      conversation = {
        id: 'current',
        url: tab.url || '',
        title: tab.title || '',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    conversation.messages.push(userMessage)

    if (skillId) {
      const skill = await skillManager.getSkill(skillId)
      if (skill) {
        conversation.skillId = skillId
        const systemMessage: Message = {
          id: generateId(),
          role: 'system',
          content: skill.systemPrompt,
          timestamp: Date.now(),
        }
        conversation.messages.unshift(systemMessage)
      }
    }

    if (includePageContent) {
      const pageContent = await getPageContent()
      if (pageContent) {
        const contextMessage: Message = {
          id: generateId(),
          role: 'system',
          content: `Current page content:\n${pageContent}\n\nYou can use the available tools to interact with the page.`,
          timestamp: Date.now(),
        }
        conversation.messages.push(contextMessage)
      }
    }

    const tools = mcpServer.getTools()

    const toolExecutor = async (name: string, args: Record<string, any>) => {
      const result = await mcpServer.executeTool(name, args)
      chrome.runtime.sendMessage({
        type: 'TOOL_EXECUTION',
        data: { tool: name, args, result },
      })
      return result
    }

    let assistantContent = ''
    await apiClient.chatCompletionWithTools(
      conversation.messages,
      tools,
      toolExecutor,
      (chunk: string) => {
        assistantContent += chunk
        chrome.runtime.sendMessage({
          type: 'MESSAGE_RESPONSE',
          data: {
            content: chunk,
            isStreaming: true,
            done: false,
          },
        })
      }
    )

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
    }
    conversation.messages.push(assistantMessage)

    await storage.saveConversation(conversation)

    chrome.runtime.sendMessage({
      type: 'MESSAGE_RESPONSE',
      data: {
        content: assistantContent,
        isStreaming: false,
        done: true,
      },
    })

    return {
      success: true,
      conversation: {
        id: 'current',
        url: conversation.url,
        title: conversation.title,
        messages: conversation.messages,
        skillId: skillId,
        createdAt: conversation.createdAt,
        updatedAt: Date.now(),
      },
    }
  } catch (error) {
    const errorMsg = (error as Error).message || 'Unknown error occurred'
    console.error('Send message error:', error)

    chrome.runtime.sendMessage({
      type: 'MESSAGE_RESPONSE',
      data: {
        error: errorMsg,
        isStreaming: false,
        done: true,
      },
    })

    return {
      success: false,
      error: errorMsg,
      timestamp: Date.now(),
    }
  }
})
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: 提交 background.ts 更新**

```bash
git add entrypoints/background.ts
git commit -m "feat: integrate tool calling loop in message handler"
```

---

### Task 5: 添加 TOOL_EXECUTION 消息类型和 UI 显示

**Files:**

- Modify: `types/index.ts:96-105`
- Modify: `entrypoints/sidebar/ChatPanel.vue:130-169`

- [ ] **Step 1: 添加 TOOL_EXECUTION 消息类型**

在 `types/index.ts` 的 MessageType 中添加：

```typescript
export type MessageType =
  | 'SEND_MESSAGE'
  | 'MESSAGE_RESPONSE'
  | 'STOP_MESSAGE'
  | 'EXECUTE_TOOL'
  | 'EXECUTE_MCP_TOOL'
  | 'TOOL_RESULT'
  | 'TOOL_EXECUTION'
  | 'GET_PAGE_CONTENT'
  | 'PAGE_CONTENT_RESPONSE'
  | 'TOGGLE_SIDEBAR'
```

- [ ] **Step 2: 在 ChatPanel.vue 中处理 TOOL_EXECUTION 消息**

在 `entrypoints/sidebar/ChatPanel.vue` 的 `onMounted` 中添加：

```typescript
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'MESSAGE_RESPONSE') {
    // ... existing code ...
  } else if (message.type === 'TOOL_EXECUTION') {
    const { tool, args, result } = message.data
    console.log(`Tool executed: ${tool}`, args, result)
    ElMessage.info({
      message: `Tool ${tool} executed`,
      duration: 2000,
    })
  } else if (message.type === 'NEW_CONVERSATION') {
    // ... existing code ...
  }
})
```

- [ ] **Step 3: 运行类型检查**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: 提交 UI 更新**

```bash
git add types/index.ts entrypoints/sidebar/ChatPanel.vue
git commit -m "feat: add TOOL_EXECUTION message handling and UI feedback"
```

---

### Task 6: 确保 MCP 工具格式正确

**Files:**

- Modify: `mcp-server/tools/dom-tools.ts`
- Modify: `mcp-server/tools/page-tools.ts`

- [ ] **Step 1: 检查 dom-tools.ts 工具定义格式**

确认 `mcp-server/tools/dom-tools.ts` 中的工具定义包含正确的 `parameters` 格式：

```typescript
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
    },
    required: ['selector'],
  },
})
```

当前定义缺少 `required` 字段，需要添加。

- [ ] **Step 2: 更新 dom-tools.ts 添加 required 字段**

修改所有工具定义，添加 `required` 数组：

```typescript
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
    required: [],
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
```

- [ ] **Step 3: 更新 page-tools.ts 工具定义**

修改 `mcp-server/tools/page-tools.ts`：

```typescript
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
```

- [ ] **Step 4: 提交工具定义更新**

```bash
git add mcp-server/tools/dom-tools.ts mcp-server/tools/page-tools.ts
git commit -m "fix: add required fields to MCP tool definitions"
```

---

### Task 7: 运行完整测试套件

- [ ] **Step 1: 运行所有单元测试**

Run: `npm run test:run`
Expected: PASS (所有测试通过)

- [ ] **Step 2: 运行 lint 检查**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: 运行构建检查**

Run: `npm run build`
Expected: PASS (无构建错误)

- [ ] **Step 4: 提交最终验证**

```bash
git add -A
git commit -m "chore: verify all tests pass after MCP tool calling implementation"
```

---

## 验证方法

### 手动测试步骤

1. 加载扩展到 Chrome：`.output/chrome-mv3/`
2. 打开任意网页，打开侧边栏
3. 输入 "点击页面上的提交按钮" 或 "帮我滚动页面"
4. 观察：
   - AI 应返回 tool_calls
   - 工具执行应弹出确认对话框
   - ChatPanel 应显示 "Tool xxx executed" 提示
   - AI 最终应返回执行结果

### 预期行为

```
用户: "点击页面上的搜索按钮"
→ AI 分析页面内容
→ AI 返回 tool_calls: click_element({ selector: "#search-btn" })
→ 工具执行，弹出确认对话框
→ 用户确认
→ 工具结果 { clicked: true } 发送给 AI
→ AI 返回: "我已经点击了搜索按钮"
```

---

## 注意事项

1. **OpenAI API 版本要求**: Function Calling 需要 gpt-3.5-turbo 或 gpt-4 模型
2. **其他提供商适配**: Anthropic 和 Google 的工具调用格式不同，后续需要适配
3. **流式响应限制**: tool_calls 响应通常不支持流式，需要等待完整响应
4. **安全考虑**: 工具执行已有用户确认机制，保持不变

---

## 后续优化建议

1. 添加 Anthropic Claude 工具调用适配（使用 `tools` 和 `tool_use` 格式）
2. 添加 Google Gemini 工具调用适配
3. 添加工具执行状态的详细 UI 显示（如执行中、成功、失败）
4. 支持工具执行的撤销功能
5. 添加工具执行日志记录
