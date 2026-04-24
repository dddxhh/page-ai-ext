import {
  Config,
  Conversation,
  Skill,
  Message,
  ModelConfig,
  ToolCallResponse,
  MCPTool,
} from '../../types'

export const mockConfig: Config = {
  models: [],
  currentModelId: '',
  shortcuts: {
    toggleSidebar: 'Cmd+Shift+A',
    newConversation: 'Cmd+Shift+N',
  },
  theme: 'auto',
  language: 'zh-CN',
  privacy: {
    encryptHistory: false,
    allowPageContentUpload: true,
  },
}

export const mockModelConfig: ModelConfig = {
  id: 'test-model-1',
  name: 'Test Model',
  provider: 'openai',
  apiKey: 'sk-test-key',
  model: 'gpt-4',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
  },
}

export const mockConversation: Conversation = {
  id: 'test-conv-1',
  url: 'https://example.com',
  title: 'Test Page',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export const mockMessage: Message = {
  id: 'test-msg-1',
  role: 'user',
  content: 'Hello, how are you?',
  timestamp: Date.now(),
}

export const mockAssistantMessage: Message = {
  id: 'test-msg-2',
  role: 'assistant',
  content: 'I am doing well, thank you!',
  timestamp: Date.now(),
}

export const mockSkill: Skill = {
  id: 'test-skill-1',
  name: 'Test Skill',
  description: 'A test skill for unit testing',
  systemPrompt: 'You are a helpful assistant.',
  metadata: {
    author: 'Test Author',
    version: '1.0.0',
    tags: ['test', 'helper'],
    examples: ['Example 1', 'Example 2'],
    category: 'general',
  },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
}

export const mockBuiltInSkill: Skill = {
  id: 'built-in-skill-1',
  name: 'Built-in Skill',
  description: 'A built-in skill',
  systemPrompt: 'You are a built-in assistant.',
  metadata: {
    author: 'System',
    version: '1.0.0',
    tags: ['built-in'],
    examples: [],
    category: 'system',
  },
  isBuiltIn: true,
  enabled: true,
  createdAt: Date.now(),
}

export const mockToolCall: ToolCallResponse = {
  id: 'call_test123',
  type: 'function',
  function: {
    name: 'click_element',
    arguments: '{"selector": "#submit-btn"}',
  },
}

export const mockMCPTool: MCPTool = {
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
