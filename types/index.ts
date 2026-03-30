// Configuration
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  baseURL?: string;
  model: string;
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface Config {
  models: ModelConfig[];
  currentModelId: string;
  shortcuts: {
    toggleSidebar: string;
    newConversation: string;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  privacy: {
    encryptHistory: boolean;
    allowPageContentUpload: boolean;
  };
}

// Conversation
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    toolCalls?: ToolCall[];
    pageContext?: PageContext;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface PageContext {
  url: string;
  title: string;
  content?: string;
}

export interface Conversation {
  id: string;
  url: string;
  title: string;
  messages: Message[];
  skillId?: string;
  createdAt: number;
  updatedAt: number;
}

// Skills
export interface Skill {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  metadata: SkillMetadata;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface SkillMetadata {
  author: string;
  version: string;
  tags: string[];
  examples: string[];
  category: string;
}

// Storage
export const STORAGE_KEYS = {
  CONFIG: 'config',
  CONVERSATIONS: 'conversations',
  SKILLS: 'skills',
  CURRENT_CONVERSATION: 'currentConversation'
} as const;

// Messaging
export type MessageType =
  | 'SEND_MESSAGE'
  | 'MESSAGE_RESPONSE'
  | 'EXECUTE_TOOL'
  | 'EXECUTE_MCP_TOOL'
  | 'TOOL_RESULT'
  | 'GET_PAGE_CONTENT'
  | 'PAGE_CONTENT_RESPONSE'
  | 'TOGGLE_SIDEBAR';

export interface ExtensionMessage<T = any> {
  type: MessageType;
  data?: T;
  tabId?: number;
}

// MCP
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Record<string, any>;
}

// Error
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SKILL_LOAD_ERROR = 'SKILL_LOAD_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  retryable: boolean;
  userAction?: string;
}
