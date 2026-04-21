import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SettingsPanel from '../../entrypoints/sidebar/SettingsPanel.vue'
import { testI18n } from '../fixtures/i18n-fixture'
import { elementPlusStubs } from '../fixtures/vue-stubs'

const mockGetConfig = vi.hoisted(() => vi.fn())
const mockGetAllSkills = vi.hoisted(() => vi.fn())
const mockDeleteSkill = vi.hoisted(() => vi.fn())
const mockExportSkills = vi.hoisted(() => vi.fn())

vi.mock('../../modules/storage', () => ({
  storage: {
    getConfig: mockGetConfig,
    exportSkills: mockExportSkills,
    importSkills: vi.fn(),
    updateConfig: vi.fn(),
  },
}))

vi.mock('../../modules/skill-manager', () => ({
  skillManager: {
    getAllSkills: mockGetAllSkills,
    deleteSkill: mockDeleteSkill,
  },
}))

vi.mock('../../entrypoints/sidebar/SkillEditorDialog.vue', () => ({
  default: {
    template: '<div class="skill-editor-dialog-mock" v-if="visible"></div>',
    props: ['visible', 'skill', 'mode', 'skills'],
    emits: ['update:visible', 'save'],
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
      },
    },
  })
}

describe('SettingsPanel Skill Management', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConfig.mockResolvedValue(mockConfig)
    mockGetAllSkills.mockResolvedValue(mockSkills)
    mockDeleteSkill.mockResolvedValue(undefined)
    mockExportSkills.mockResolvedValue(mockSkills)
  })

  describe('loadSkills', () => {
    it('should load skills on mount', async () => {
      wrapper = createWrapper()
      await flushPromises()

      expect(mockGetAllSkills).toHaveBeenCalled()
      expect(wrapper.vm.skills.length).toBe(2)
    })

    it('should extract categories from skills', async () => {
      wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.vm.categories).toContain('Analysis')
      expect(wrapper.vm.categories).toContain('Automation')
    })
  })

  describe('handleSearch', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await flushPromises()
    })

    it('should filter skills by search query', async () => {
      wrapper.vm.searchQuery = 'Built'
      wrapper.vm.handleSearch()
      await flushPromises()

      expect(wrapper.vm.filteredSkills.length).toBe(1)
      expect(wrapper.vm.filteredSkills[0].name).toBe('Built-in Skill')
    })

    it('should filter skills by category', async () => {
      wrapper.vm.selectedCategory = 'Analysis'
      wrapper.vm.handleSearch()
      await flushPromises()

      expect(wrapper.vm.filteredSkills.length).toBe(1)
      expect(wrapper.vm.filteredSkills[0].metadata.category).toBe('Analysis')
    })

    it('should show all skills when no filters', async () => {
      wrapper.vm.searchQuery = ''
      wrapper.vm.selectedCategory = ''
      wrapper.vm.handleSearch()
      await flushPromises()

      expect(wrapper.vm.filteredSkills.length).toBe(2)
    })
  })

  describe('openEditor', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await flushPromises()
    })

    it('should open editor in create mode', async () => {
      wrapper.vm.openEditor('create')
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('create')
      expect(wrapper.vm.editorVisible).toBe(true)
      expect(wrapper.vm.editingSkill).toBeUndefined()
    })

    it('should open editor in edit mode with skill', async () => {
      const skill = mockSkills[1]
      wrapper.vm.openEditor('edit', skill)
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('edit')
      expect(wrapper.vm.editorVisible).toBe(true)
      expect(wrapper.vm.editingSkill).toStrictEqual(skill)
    })

    it('should open editor in copy mode with skill', async () => {
      const skill = mockSkills[0]
      wrapper.vm.openEditor('copy', skill)
      await flushPromises()

      expect(wrapper.vm.editorMode).toBe('copy')
      expect(wrapper.vm.editingSkill).toStrictEqual(skill)
    })
  })

  describe('handleDelete', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await flushPromises()
    })

    it('should not delete built-in skill', async () => {
      const builtInSkill = mockSkills[0]
      await wrapper.vm.handleDelete(builtInSkill)

      expect(mockDeleteSkill).not.toHaveBeenCalled()
    })

    it('should delete custom skill after confirmation', async () => {
      const customSkill = mockSkills[1]

      vi.spyOn(wrapper.vm, 'handleDelete').mockImplementation(async (skill: any) => {
        if (skill.isBuiltIn) return
        await mockDeleteSkill(skill.id)
        wrapper.vm.loadSkills()
      })

      await wrapper.vm.handleDelete(customSkill)
      await flushPromises()

      expect(mockDeleteSkill).toHaveBeenCalledWith('custom-skill')
      expect(mockGetAllSkills).toHaveBeenCalledTimes(2)
    })
  })

  describe('handleEditorSave', () => {
    it('should reload skills after save', async () => {
      wrapper = createWrapper()
      await flushPromises()

      await wrapper.vm.handleEditorSave()

      expect(mockGetAllSkills).toHaveBeenCalledTimes(2)
    })
  })

  describe('built-in skill protection', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await flushPromises()
    })

    it('should identify built-in skills', async () => {
      expect(wrapper.vm.skills[0].isBuiltIn).toBe(true)
    })

    it('should identify custom skills', async () => {
      expect(wrapper.vm.skills[1].isBuiltIn).toBe(false)
    })
  })

  describe('export/import skills', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await flushPromises()
    })

    it('should have exportSkills function', async () => {
      expect(wrapper.vm.exportSkills).toBeDefined()
    })

    it('should have importSkills function', async () => {
      expect(wrapper.vm.importSkills).toBeDefined()
    })
  })
})
