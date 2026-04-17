import { messaging } from '../modules/messaging';
import { storage } from '../modules/storage';
import { apiClient } from '../modules/api-client';
import { skillManager } from '../modules/skill-manager';
import { mcpServer } from '../mcp-server/server';
import { ExtensionMessage, Message, Conversation, ModelConfig } from '../types';
import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  // Initialize modules
  messaging.initialize();
  skillManager.initialize();

  // Load configuration and set model
  storage.getConfig().then(async (config) => {
    const model = config.models.find(m => m.id === config.currentModelId);
    if (model) {
      apiClient.setModel(model);
    }
  });

  // Handle message from sidebar
  messaging.onMessage('SEND_MESSAGE', async (data, sender) => {
    const { content, skillId, includePageContent = true } = data;

    try {
      // Get or create conversation
      let conversation = await storage.getConversation('current');
      if (!conversation) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        conversation = {
          id: 'current',
          url: tab.url || '',
          title: tab.title || '',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      conversation.messages.push(userMessage);

      // Apply skill if selected
      if (skillId) {
        const skill = await skillManager.getSkill(skillId);
        if (skill) {
          conversation.skillId = skillId;
          const systemMessage: Message = {
            id: generateId(),
            role: 'system',
            content: skill.systemPrompt,
            timestamp: Date.now()
          };
          conversation.messages.unshift(systemMessage);
        }
      }

      // Add page content if requested
      if (includePageContent) {
        const pageContent = await getPageContent();
        if (pageContent) {
          const contextMessage: Message = {
            id: generateId(),
            role: 'system',
            content: `Page content:\n${pageContent}`,
            timestamp: Date.now()
          };
          conversation.messages.push(contextMessage);
        }
      }

      // Get MCP tools
      const tools = mcpServer.getTools();

      // Send to AI with streaming
      let assistantContent = '';
      await apiClient.chatCompletion({
        messages: conversation.messages,
        tools,
        stream: true,
        onChunk: (chunk: string) => {
          assistantContent += chunk;
          // Send chunk to sidebar
          chrome.runtime.sendMessage({
            type: 'MESSAGE_RESPONSE',
            data: {
              content: chunk,
              isStreaming: true,
              done: false
            }
          });
        }
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now()
      };
      conversation.messages.push(assistantMessage);

      // Save conversation
      await storage.saveConversation(conversation);

      // Send final response
      chrome.runtime.sendMessage({
        type: 'MESSAGE_RESPONSE',
        data: {
          content: assistantContent,
          isStreaming: false,
          done: true
        }
      });

      return {
        success: true,
        conversation: {
          id: 'current',
          url: conversation.url,
          title: conversation.title,
          messages: conversation.messages,
          skillId: skillId,
          createdAt: conversation.createdAt,
          updatedAt: Date.now()
        }
      };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Handle tool execution from AI
  messaging.onMessage('EXECUTE_MCP_TOOL', async (data) => {
    const { tool, arguments: args } = data;

    try {
      const result = await mcpServer.executeTool(tool, args);
      return { success: true, result };
    } catch (error) {
      console.error('MCP tool execution error:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Handle toggle sidebar
  messaging.onMessage('TOGGLE_SIDEBAR', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Helper functions
  function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async function getPageContent(): Promise<string | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return null;

      const result = await messaging.sendToContentScript(tab.id, 'GET_PAGE_CONTENT', {
        format: 'markdown'
      });

      return result?.content || null;
    } catch (error) {
      console.error('Get page content error:', error);
      return null;
    }
  }

  // Install handler
  chrome.runtime.onInstalled.addListener(async () => {
    console.log('AI Assistant extension installed');

    // Initialize built-in skills
    await skillManager.initialize();

    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('sidebar.html')
    });
  });
});
