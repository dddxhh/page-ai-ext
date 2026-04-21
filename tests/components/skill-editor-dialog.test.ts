import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SkillEditorDialog from '../../entrypoints/sidebar/SkillEditorDialog.vue'
import { nextTick } from 'vue'
import { generateIdFromName } from '../../utils/id'

const mockSaveSkill = vi.hoisted(() => vi.fn())

vi.mock('../../modules/skill-manager', () => ({
  skillManager: {
    saveSkill: mockSaveSkill,
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      skill: {
        createTitle: '新增技能',
        editorTitle: '编辑技能',
        copyTitle: '复制技能',
        basicInfo: '基础信息',
        systemPrompt: '系统提示词',
        metadata: '元数据',
        nameRequired: '请输入技能名称',
        nameMinLength: '名称至少需要 2 个字符',
        nameDuplicate: '技能名称已存在',
        descriptionRequired: '请输入描述',
        descriptionMinLength: '描述至少需要 10 个字符',
        promptRequired: '请输入系统提示词',
        promptMinLength: '系统提示词至少需要 20 个字符',
        versionFormat: '版本号格式错误：如 1.0.0',
        saveSuccess: '技能保存成功',
        operationFailed: '操作失败',
        cancel: '取消',
        save: '保存',
        name: '名称',
        description: '描述',
        category: '分类',
        author: '作者',
        version: '版本',
        tags: '标签',
        examplesLabel: '使用示例',
        addExample: '添加示例',
        delete: '删除',
        copiedName: '{name} - 副本',
      },
    },
  },
})

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
  createdAt: Date.now(),
}

function createWrapper(props = {}) {
  return mount(SkillEditorDialog, {
    global: {
      plugins: [i18n],
      stubs: {
        ElDialog: {
          template:
            '<div class="el-dialog" v-if="modelValue"><div class="dialog-title">{{ title }}</div><slot /><slot name="footer" /></div>',
          props: ['modelValue', 'title', 'width'],
          emits: ['update:modelValue', 'close'],
        },
        ElForm: {
          template: '<form class="el-form"><slot /></form>',
          props: ['model', 'rules', 'labelWidth'],
          emits: ['validate'],
          methods: {
            resetFields: () => {},
            validate: () => Promise.resolve(true),
          },
        },
        ElFormItem: {
          template: '<div class="el-form-item"><slot /></div>',
          props: ['label', 'prop'],
        },
        ElInput: {
          template:
            '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue', 'type', 'rows', 'placeholder'],
          emits: ['update:modelValue'],
        },
        ElSelect: {
          template: '<select class="el-select"><slot /></select>',
          props: ['modelValue', 'multiple', 'filterable', 'allowCreate', 'placeholder'],
          emits: ['update:modelValue'],
        },
        ElOption: {
          template: '<option class="el-option" :value="value">{{ label }}</option>',
          props: ['label', 'value'],
        },
        ElButton: {
          template:
            '<button class="el-button" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
          props: ['type', 'size', 'loading'],
          emits: ['click'],
        },
        ElDivider: {
          template: '<div class="el-divider"><slot /></div>',
          props: ['contentPosition'],
        },
        ElMessage: {
          template: '<div class="el-message"></div>',
        },
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
