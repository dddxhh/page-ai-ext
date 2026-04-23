import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SettingsPanel from '../../entrypoints/sidebar/SettingsPanel.vue'
import { testI18n } from '../fixtures/i18n-fixture'
import { elementPlusStubs } from '../fixtures/vue-stubs'

const mockGetConfig = vi.hoisted(() => vi.fn())
const mockGetAllSkills = vi.hoisted(() => vi.fn())
const mockDeleteSkill = vi.hoisted(() => vi.fn())
const mockExportSkills = vi.hoisted(() => vi.fn())
const mockImportSkills = vi.hoisted(() => vi.fn())
const mockToggleSkillEnabled = vi.hoisted(() => vi.fn())

vi.mock('../../modules/storage', () => ({
  storage: {
    getConfig: mockGetConfig,
    exportSkills: mockExportSkills,
    importSkills: mockImportSkills,
    updateConfig: vi.fn(),
  },
}))

vi.mock('../../modules/skill-manager', () => ({
  skillManager: {
    getAllSkills: mockGetAllSkills,
    deleteSkill: mockDeleteSkill,
    toggleSkillEnabled: mockToggleSkillEnabled,
  },
}))

vi.mock('../../entrypoints/sidebar/SkillEditorDialog.vue', () => ({
  default: {
    template: '<div class="skill-editor-dialog-mock" v-if="visible"></div>',
    props: ['visible', 'skill', 'mode', 'skills'],
    emits: ['update:visible', 'save'],
  },
}))

vi.mock('../../entrypoints/sidebar/components/SkillListPanel.vue', () => ({
  default: {
    template: '<div class="skill-list-panel-mock" :skills="skills"></div>',
    props: ['skills'],
    emits: ['create', 'toggleEnabled', 'edit', 'copy', 'delete', 'export', 'import'],
  },
}))

const mockConfig = {
  currentModelId: 'gpt-4',
  models: [],
  shortcuts: {
    toggleSidebar: 'Ctrl+Shift+A',
    newConversation: 'Ctrl+Shift+N',
  },
  theme: 'light' as const,
  language: 'zh-CN' as const,
  privacy: {
    encryptHistory: false,
    allowPageContentUpload: true,
  },
}

const mockSkills = [
  {
    id: 'built-in-skill',
    name: 'Built-in Skill',
    description: 'A built-in skill for testing purposes',
    systemPrompt: 'This is a built-in skill prompt.',
    metadata: {
      author: 'System',
      version: '1.0.0',
      tags: ['built-in'],
      examples: ['Example'],
      category: 'Analysis',
    },
    isBuiltIn: true,
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: 'custom-skill',
    name: 'Custom Skill',
    description: 'A custom skill created by user',
    systemPrompt: 'This is a custom skill prompt.',
    metadata: {
      author: 'User',
      version: '1.0.0',
      tags: ['custom'],
      examples: [],
      category: 'Automation',
    },
    isBuiltIn: false,
    enabled: true,
    createdAt: Date.now(),
  },
]

const i18n = testI18n

function createWrapper() {
  return mount(SettingsPanel, {
    global: {
      plugins: [i18n],
      stubs: {
        ...elementPlusStubs,
        SkillEditorDialog: true,
        SkillListPanel: true,
      },
    },
  })
}

describe('SettingsPanel Skill Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfig.mockResolvedValue(mockConfig)
    mockGetAllSkills.mockResolvedValue(mockSkills)
    mockDeleteSkill.mockResolvedValue(undefined)
    mockExportSkills.mockResolvedValue(mockSkills)
    mockImportSkills.mockResolvedValue(undefined)
    mockToggleSkillEnabled.mockResolvedValue(undefined)
  })

  describe('loadSkills', () => {
    it('should load skills on mount', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(mockGetAllSkills).toHaveBeenCalled()
      expect(wrapper.vm.skills.length).toBe(2)
    })
  })

  describe('openEditor', () => {
    it('should open editor in create mode', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      wrapper.vm.openEditor('create')
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('create')
      expect(wrapper.vm.editorVisible).toBe(true)
      expect(wrapper.vm.editingSkill).toBeUndefined()
    })

    it('should open editor in edit mode with skill', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const skill = mockSkills[1]
      wrapper.vm.openEditor('edit', skill)
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('edit')
      expect(wrapper.vm.editorVisible).toBe(true)
      expect(wrapper.vm.editingSkill).toStrictEqual(skill)
    })

    it('should open editor in copy mode with skill', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const skill = mockSkills[0]
      wrapper.vm.openEditor('copy', skill)
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('copy')
      expect(wrapper.vm.editingSkill).toStrictEqual(skill)
    })
  })

  describe('handleDelete', () => {
    it('should not delete built-in skill', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const builtInSkill = mockSkills[0]
      await wrapper.vm.handleDelete(builtInSkill)

      expect(mockDeleteSkill).not.toHaveBeenCalled()
    })
  })

  describe('handleEditorSave', () => {
    it('should reload skills after save', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.handleEditorSave()

      expect(mockGetAllSkills).toHaveBeenCalledTimes(2)
    })
  })

  describe('handleToggleEnabled', () => {
    it('should toggle skill enabled status', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const skill = mockSkills[1]
      await wrapper.vm.handleToggleEnabled(skill)

      expect(mockToggleSkillEnabled).toHaveBeenCalledWith(skill.id)
      expect(mockGetAllSkills).toHaveBeenCalledTimes(2)
    })
  })

  describe('built-in skill protection', () => {
    it('should identify built-in skills', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.skills[0].isBuiltIn).toBe(true)
    })

    it('should identify custom skills', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.skills[1].isBuiltIn).toBe(false)
    })
  })
})
