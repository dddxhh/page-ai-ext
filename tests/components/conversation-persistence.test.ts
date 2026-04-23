import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ChatPanel from '../../entrypoints/sidebar/ChatPanel.vue'

const mockGetSkill = vi.hoisted(() => vi.fn())
const mockSendToBackground = vi.hoisted(() => vi.fn())
const mockGetConfig = vi.hoisted(() => vi.fn())
const mockGetConversation = vi.hoisted(() => vi.fn())
const mockSaveConversation = vi.hoisted(() => vi.fn())
const mockDeleteConversation = vi.hoisted(() => vi.fn())
const mockTabsQuery = vi.hoisted(() => vi.fn())

vi.mock('../../modules/skill-manager', () => ({
  skillManager: {
    getSkill: mockGetSkill,
  },
}))

vi.mock('../../modules/messaging', () => ({
  messaging: {
    sendToBackground: mockSendToBackground,
  },
}))

vi.mock('../../modules/storage', () => ({
  storage: {
    getConfig: mockGetConfig,
    getConversation: mockGetConversation,
    saveConversation: mockSaveConversation,
    deleteConversation: mockDeleteConversation,
  },
}))

vi.stubGlobal('chrome', {
  tabs: {
    query: mockTabsQuery,
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
})

vi.mock('../../entrypoints/sidebar/MessageList.vue', () => ({
  default: {
    template: '<div class="message-list-mock"></div>',
    props: ['messages'],
  },
}))

vi.mock('../../entrypoints/sidebar/SkillSelector.vue', () => ({
  default: {
    template: '<div class="skill-selector-mock"></div>',
    emits: ['close', 'select'],
  },
}))

vi.mock('../../entrypoints/sidebar/ModelSelector.vue', () => ({
  default: {
    template: '<div class="model-selector-mock"></div>',
    props: ['visible'],
    emits: ['update:visible', 'close'],
  },
}))

const mockConfig = {
  currentModelId: 'gpt-4',
  models: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai' as const,
      model: 'gpt-4',
      apiKey: 'sk-test',
      parameters: {},
    },
  ],
  shortcuts: {},
  theme: 'light' as const,
  language: 'en-US' as const,
  privacy: {},
}

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      chat: {
        conversation: 'Conversation',
        selectSkill: 'Select Skill',
        changeModel: 'Change Model',
        clear: 'Clear',
        noMessages: 'No messages',
        typeMessage: 'Type a message',
        send: 'Send',
      },
    },
  },
})

function createWrapper() {
  return mount(ChatPanel, {
    global: {
      plugins: [i18n],
      stubs: {
        MessageList: true,
        SkillSelector: true,
        ModelSelector: true,
        ElTag: {
          template:
            '<span class="el-tag" :class="type ? \'el-tag--\' + type : \'\'"><slot /></span>',
          props: ['type', 'size'],
        },
        ElButton: {
          template:
            '<button class="el-button" :class="{ \'is-loading\': loading }"><slot /></button>',
          props: ['type', 'size', 'loading'],
        },
        ElButtonGroup: {
          template: '<div class="el-button-group"><slot /></div>',
        },
        ElIcon: {
          template: '<i class="el-icon"><slot /></i>',
        },
        ElInput: {
          template: '<textarea class="el-input"></textarea>',
          props: ['modelValue', 'type', 'rows', 'placeholder'],
          emits: ['update:modelValue'],
        },
        SwitchButton: {
          template: '<span class="switch-button">SwitchButton</span>',
        },
      },
    },
  })
}

describe('Conversation Persistence', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfig.mockResolvedValue(mockConfig)
    mockSendToBackground.mockResolvedValue(undefined)
    mockTabsQuery.mockResolvedValue([{ url: 'https://test.com', title: 'Test Page' }])
  })

  describe('loadConversation', () => {
    it('should load conversation on mount', async () => {
      mockGetConversation.mockResolvedValue({
        id: 'current',
        url: 'https://test.com',
        title: 'Test',
        messages: [{ id: '1', role: 'user', content: 'Saved message', timestamp: 1000 }],
        skillId: 'test-skill',
        createdAt: 1000,
        updatedAt: 2000,
      })
      mockGetSkill.mockResolvedValue({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test',
        systemPrompt: 'Test',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now(),
      })

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.messages.length).toBe(1)
      expect(wrapper.vm.messages[0].content).toBe('Saved message')
      expect(wrapper.vm.selectedSkill).toBe('test-skill')
      expect(wrapper.vm.selectedSkillName).toBe('Test Skill')
    })

    it('should handle empty conversation', async () => {
      mockGetConversation.mockResolvedValue(null)

      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.messages.length).toBe(0)
      expect(wrapper.vm.selectedSkill).toBe(null)
    })
  })

  describe('clearConversation', () => {
    it('should clear storage when clearing conversation', async () => {
      mockGetConversation.mockResolvedValue(null)
      mockDeleteConversation.mockResolvedValue(undefined)

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.messages = [{ id: '1', role: 'user', content: 'Test', timestamp: 1000 }]
      wrapper.vm.selectedSkill = 'test-skill'
      wrapper.vm.selectedSkillName = 'Test Skill'

      await wrapper.vm.clearConversation()
      await flushPromises()

      expect(wrapper.vm.messages.length).toBe(0)
      expect(wrapper.vm.selectedSkill).toBe(null)
      expect(wrapper.vm.selectedSkillName).toBe(null)
      expect(mockDeleteConversation).toHaveBeenCalledWith('current')
    })

    it('should handle storage deletion error gracefully', async () => {
      mockGetConversation.mockResolvedValue(null)
      mockDeleteConversation.mockRejectedValue(new Error('Storage error'))

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.messages = [{ id: '1', role: 'user', content: 'Test', timestamp: 1000 }]

      await wrapper.vm.clearConversation()
      await flushPromises()

      expect(wrapper.vm.messages.length).toBe(0)
    })
  })

  describe('saveConversationToStorage', () => {
    it('should preserve createdAt on subsequent saves', async () => {
      const originalCreatedAt = 1000
      mockGetConversation.mockResolvedValue({
        id: 'current',
        url: 'https://test.com',
        title: 'Test',
        messages: [],
        skillId: null,
        createdAt: originalCreatedAt,
        updatedAt: 2000,
      })
      mockSaveConversation.mockResolvedValue(undefined)

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.messages = [{ id: '2', role: 'user', content: 'New', timestamp: 3000 }]
      await wrapper.vm.saveConversationToStorage()
      await flushPromises()

      expect(mockSaveConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: originalCreatedAt,
        })
      )
    })

    it('should set createdAt for new conversations', async () => {
      mockGetConversation.mockResolvedValue(null)
      mockSaveConversation.mockResolvedValue(undefined)

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.messages = [{ id: '1', role: 'user', content: 'New', timestamp: 1000 }]
      await wrapper.vm.saveConversationToStorage()
      await flushPromises()

      expect(mockSaveConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Number),
        })
      )
    })
  })

  describe('finalizeMessage', () => {
    it('should save conversation after AI response', async () => {
      mockGetConversation.mockResolvedValue(null)
      mockSaveConversation.mockResolvedValue(undefined)

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.messages = [
        { id: 'streaming', role: 'assistant', content: 'Partial', timestamp: 1000 },
      ]

      await wrapper.vm.finalizeMessage('AI response')
      await flushPromises()

      expect(mockSaveConversation).toHaveBeenCalled()
      expect(wrapper.vm.messages[0].id).not.toBe('streaming')
      expect(wrapper.vm.messages[0].content).toBe('AI response')
    })
  })
})
