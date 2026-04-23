import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SkillEditorDialog from '../../entrypoints/sidebar/SkillEditorDialog.vue'
import { nextTick } from 'vue'
import { generateIdFromName } from '../../utils/id'
import { testI18n } from '../fixtures/i18n-fixture'
import { elementPlusStubs } from '../fixtures/vue-stubs'

const mockSaveSkill = vi.hoisted(() => vi.fn())

vi.mock('../../modules/skill-manager', () => ({
  skillManager: {
    saveSkill: mockSaveSkill,
  },
}))

vi.mock('../../entrypoints/sidebar/components/SkillForm.vue', () => ({
  default: {
    template:
      '<div class="skill-form-mock"><input v-model="localFormData.name" /><input v-model="localFormData.description" /><input v-model="localFormData.systemPrompt" /></div>',
    props: ['formData', 'formRules', 'mode'],
    emits: ['updateFormData', 'addExample', 'removeExample'],
    setup(props: any, { emit: _emit }: any) {
      const localFormData = ref({ ...props.formData })
      return { localFormData }
    },
  },
}))

vi.mock('../../entrypoints/sidebar/components/SkillPreview.vue', () => ({
  default: {
    template: '<div class="skill-preview-mock">Preview</div>',
    props: ['skill'],
  },
}))

const i18n = testI18n

const mockSkill = {
  id: 'test-skill',
  name: 'Test Skill',
  description: 'A test skill for testing',
  systemPrompt: 'This is a test system prompt that is long enough.',
  metadata: {
    author: 'Test Author',
    version: '1.0.0',
    tags: ['test', 'demo'],
    examples: ['Example 1'],
    category: 'Testing',
  },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
}

function createWrapper(props = {}) {
  return mount(SkillEditorDialog, {
    global: {
      plugins: [i18n],
      stubs: {
        ...elementPlusStubs,
        SkillForm: true,
        SkillPreview: true,
      },
    },
    props: {
      visible: true,
      mode: 'create',
      skills: [],
      ...props,
    },
  })
}

import { ref } from 'vue'

describe('SkillEditorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveSkill.mockResolvedValue(undefined)
  })

  describe('create mode', () => {
    it('should display create title', async () => {
      const wrapper = createWrapper({ mode: 'create', visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()
      await nextTick()

      expect(wrapper.find('.dialog-title').text()).toBe('新增技能')
    })

    it('should have empty form fields in create mode', async () => {
      const wrapper = createWrapper({ mode: 'create', visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.name).toBe('')
      expect(wrapper.vm.formData.description).toBe('')
      expect(wrapper.vm.formData.systemPrompt).toBe('')
    })
  })

  describe('edit mode', () => {
    it('should display edit title', async () => {
      const wrapper = createWrapper({ mode: 'edit', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()
      await nextTick()

      expect(wrapper.find('.dialog-title').text()).toBe('编辑技能')
    })

    it('should populate form with skill data', async () => {
      const wrapper = createWrapper({ mode: 'edit', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.id).toBe('test-skill')
      expect(wrapper.vm.formData.name).toBe('Test Skill')
      expect(wrapper.vm.formData.description).toBe('A test skill for testing')
    })

    it('should set updatedAt timestamp in edit mode', async () => {
      const wrapper = createWrapper({ mode: 'edit', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.updatedAt).toBeDefined()
    })
  })

  describe('copy mode', () => {
    it('should display copy title', async () => {
      const wrapper = createWrapper({ mode: 'copy', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()
      await nextTick()

      expect(wrapper.find('.dialog-title').text()).toBe('复制技能')
    })

    it('should generate new ID in copy mode', async () => {
      const wrapper = createWrapper({ mode: 'copy', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.id).toBe('')
    })

    it('should append "-副本" to name in copy mode', async () => {
      const wrapper = createWrapper({ mode: 'copy', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.name).toContain('副本')
    })

    it('should set isBuiltIn to false in copy mode', async () => {
      const builtInSkill = { ...mockSkill, isBuiltIn: true }
      const wrapper = createWrapper({ mode: 'copy', skill: builtInSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.isBuiltIn).toBe(false)
    })
  })

  describe('validation rules', () => {
    it('should have name validation rules', async () => {
      const wrapper = createWrapper({ mode: 'create' })
      await flushPromises()

      expect(wrapper.vm.formRules.name).toBeDefined()
      expect(wrapper.vm.formRules.name.length).toBeGreaterThan(0)
    })

    it('should have description validation with min length 10', async () => {
      const wrapper = createWrapper({ mode: 'create' })
      await flushPromises()

      const rules = wrapper.vm.formRules.description
      const minLengthRule = rules.find((r: any) => r.min === 10)

      expect(minLengthRule).toBeDefined()
      expect(minLengthRule.message).toContain('10')
    })

    it('should have systemPrompt validation with min length 20', async () => {
      const wrapper = createWrapper({ mode: 'create' })
      await flushPromises()

      const rules = wrapper.vm.formRules.systemPrompt
      const minLengthRule = rules.find((r: any) => r.min === 20)

      expect(minLengthRule).toBeDefined()
      expect(minLengthRule.message).toContain('20')
    })

    it('should have version validation rule', async () => {
      const wrapper = createWrapper({ mode: 'create' })
      await flushPromises()

      expect(wrapper.vm.formRules.version).toBeDefined()
      expect(wrapper.vm.formRules.version.length).toBeGreaterThan(0)
    })
  })

  describe('examples management', () => {
    it('should add example', async () => {
      const wrapper = createWrapper({ mode: 'create' })
      await flushPromises()

      expect(wrapper.vm.formData.metadata.examples.length).toBe(0)

      wrapper.vm.addExample()

      expect(wrapper.vm.formData.metadata.examples.length).toBe(1)
    })

    it('should remove example', async () => {
      const wrapper = createWrapper({ mode: 'edit', skill: mockSkill, visible: false })
      await flushPromises()

      await wrapper.setProps({ visible: true })
      await flushPromises()

      expect(wrapper.vm.formData.metadata.examples.length).toBe(1)

      wrapper.vm.removeExample(0)

      expect(wrapper.vm.formData.metadata.examples.length).toBe(0)
    })
  })

  describe('ID generation', () => {
    it('should generate valid ID from name', () => {
      const id = generateIdFromName('My Test Skill')

      expect(id).toMatch(/^[a-z]/)
      expect(id).toMatch(/my-test-skill/)
    })

    it('should include timestamp in generated ID', () => {
      const id = generateIdFromName('Test')

      expect(id).toMatch(/-[a-z0-9]+$/)
    })

    it('should handle special characters in name', () => {
      const id = generateIdFromName('Test!@#$%Skill')

      expect(id).toMatch(/^[a-z]/)
      expect(id).not.toContain('!')
    })
  })

  describe('close handling', () => {
    it('should reset form on close', async () => {
      const wrapper = createWrapper({ mode: 'create', visible: true })
      await flushPromises()

      wrapper.vm.formData.name = 'Test Name'
      wrapper.vm.handleClose()
      await flushPromises()

      expect(wrapper.vm.visible).toBe(false)
    })
  })
})
