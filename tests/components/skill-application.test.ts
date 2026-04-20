import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ChatPanel from '../../entrypoints/sidebar/ChatPanel.vue'

const mockGetSkill = vi.hoisted(() => vi.fn())
const mockSendToBackground = vi.hoisted(() => vi.fn())
const mockGetConfig = vi.hoisted(() => vi.fn())

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
  },
}))

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
  shortcuts: {
    toggleSidebar: 'Ctrl+Shift+A',
    newConversation: 'Ctrl+Shift+N',
  },
  theme: 'light' as const,
  language: 'en-US' as const,
  privacy: {
    encryptHistory: false,
    allowPageContentUpload: true,
  },
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
        ElInput: {
          template: '<textarea class="el-input"></textarea>',
          props: ['modelValue', 'type', 'rows', 'placeholder'],
          emits: ['update:modelValue'],
        },
      },
    },
  })
}

describe('Skill Application', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfig.mockResolvedValue(mockConfig)
    mockSendToBackground.mockResolvedValue(undefined)
  })

  describe('applySkill', () => {
    it('should set skill name from skill manager when skill exists', async () => {
      mockGetSkill.mockResolvedValue({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now(),
      })

      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('test-skill')
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('test-skill')
      expect(wrapper.vm.selectedSkillName).toBe('Test Skill')
      expect(mockGetSkill).toHaveBeenCalledWith('test-skill')
    })

    it('should fallback to skill ID when skill not found', async () => {
      mockGetSkill.mockResolvedValue(null)

      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('unknown-skill')
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('unknown-skill')
      expect(wrapper.vm.selectedSkillName).toBe('unknown-skill')
    })

    it('should fallback to skill ID on error', async () => {
      mockGetSkill.mockRejectedValue(new Error('Load error'))

      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('error-skill')
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('error-skill')
      expect(wrapper.vm.selectedSkillName).toBe('error-skill')
    })
  })

  describe('sendMessage with skill', () => {
    it('should clear skill selection after successful message send', async () => {
      mockGetSkill.mockResolvedValue({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now(),
      })
      mockSendToBackground.mockResolvedValue(undefined)

      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('test-skill')
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('test-skill')
      expect(wrapper.vm.selectedSkillName).toBe('Test Skill')

      wrapper.vm.inputMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe(null)
      expect(wrapper.vm.selectedSkillName).toBe(null)
      expect(mockSendToBackground).toHaveBeenCalledWith('SEND_MESSAGE', {
        content: 'Test message',
        skillId: 'test-skill',
        includePageContent: true,
      })
    })

    it('should not clear skill on send error', async () => {
      mockGetSkill.mockResolvedValue({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now(),
      })
      mockSendToBackground.mockRejectedValue(new Error('Send error'))

      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('test-skill')
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('test-skill')

      wrapper.vm.inputMessage = 'Test message'
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(wrapper.vm.selectedSkill).toBe('test-skill')
      expect(wrapper.vm.selectedSkillName).toBe('Test Skill')
    })

    it('should not send when input is empty', async () => {
      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.applySkill('test-skill')
      await flushPromises()

      wrapper.vm.inputMessage = ''
      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(mockSendToBackground).not.toHaveBeenCalled()
      expect(wrapper.vm.selectedSkill).toBe('test-skill')
    })

    it('should not send when already sending', async () => {
      mockSendToBackground.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.inputMessage = 'Test message'
      wrapper.vm.isSending = true

      await wrapper.vm.sendMessage()
      await flushPromises()

      expect(mockSendToBackground).not.toHaveBeenCalled()
    })
  })

  describe('UI rendering', () => {
    it('should display skill name tag when skill is selected', async () => {
      mockGetSkill.mockResolvedValue({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now(),
      })

      wrapper = createWrapper()
      await flushPromises()

      const htmlBefore = wrapper.html()
      expect(htmlBefore).not.toContain('Test Skill')

      await wrapper.vm.applySkill('test-skill')
      await flushPromises()
      await wrapper.vm.$nextTick()

      const htmlAfter = wrapper.html()
      expect(htmlAfter).toContain('Test Skill')
      expect(htmlAfter).toContain('el-tag--success')
    })

    it('should not display skill tag when no skill is selected', async () => {
      wrapper = createWrapper()
      await flushPromises()

      const html = wrapper.html()
      expect(html).not.toContain('el-tag--success')
    })
  })
})
