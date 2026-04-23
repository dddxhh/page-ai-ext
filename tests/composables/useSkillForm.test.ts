import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSkillForm } from '../../entrypoints/sidebar/composables/useSkillForm'
import type { Skill } from '../../types'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => {
      if (key === 'skill.copiedName' && params) {
        return `${params.name} (副本)`
      }
      return key
    },
  }),
}))

const createMockSkill = (): Skill => ({
  id: 'existing-skill',
  name: 'Existing Skill',
  description: 'An existing skill for testing',
  systemPrompt: 'This is a system prompt that is long enough.',
  metadata: {
    author: 'Test Author',
    version: '1.0.0',
    tags: ['test'],
    examples: ['Example 1'],
    category: 'Testing',
  },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
})

describe('useSkillForm', () => {
  let mode: any
  let skill: any
  let existingSkills: any

  beforeEach(() => {
    vi.clearAllMocks()
    mode = ref<'create' | 'edit' | 'copy'>('create')
    skill = ref<Skill | undefined>(undefined)
    existingSkills = ref<Skill[]>([createMockSkill()])
  })

  describe('initializeForm', () => {
    it('should initialize empty form in create mode', () => {
      const { formData, initializeForm } = useSkillForm(mode, skill, existingSkills)
      initializeForm()

      expect(formData.value.id).toBe('')
      expect(formData.value.name).toBe('')
      expect(formData.value.description).toBe('')
      expect(formData.value.systemPrompt).toBe('')
      expect(formData.value.isBuiltIn).toBe(false)
      expect(formData.value.enabled).toBe(true)
    })

    it('should copy skill data in edit mode', () => {
      mode.value = 'edit'
      skill.value = createMockSkill()

      const { formData, initializeForm } = useSkillForm(mode, skill, existingSkills)
      initializeForm()

      expect(formData.value.id).toBe('existing-skill')
      expect(formData.value.name).toBe('Existing Skill')
      expect(formData.value.updatedAt).toBeDefined()
    })

    it('should create copy with modified name in copy mode', () => {
      mode.value = 'copy'
      skill.value = createMockSkill()

      const { formData, initializeForm } = useSkillForm(mode, skill, existingSkills)
      initializeForm()

      expect(formData.value.id).toBe('')
      expect(formData.value.name).toContain('副本')
      expect(formData.value.isBuiltIn).toBe(false)
      expect(formData.value.enabled).toBe(true)
    })
  })

  describe('resetForm', () => {
    it('should reset form to empty state', () => {
      const { formData, initializeForm, resetForm } = useSkillForm(mode, skill, existingSkills)
      initializeForm()
      formData.value.name = 'Modified'
      resetForm()

      expect(formData.value.name).toBe('')
      expect(formData.value.id).toBe('')
    })
  })

  describe('prepareSkillForSave', () => {
    it('should generate id if empty', () => {
      const { formData, prepareSkillForSave } = useSkillForm(mode, skill, existingSkills)
      formData.value.name = 'New Skill Name'
      formData.value.description = 'Valid description here'
      formData.value.systemPrompt = 'Valid system prompt here that is long enough.'

      const result = prepareSkillForSave()

      expect(result.id).toMatch(/^new-skill-name-\w+$/)
      expect(result.id).toContain('new-skill-name')
    })

    it('should filter empty examples', () => {
      const { formData, prepareSkillForSave } = useSkillForm(mode, skill, existingSkills)
      formData.value.metadata.examples = ['Valid', '', 'Also Valid']

      const result = prepareSkillForSave()

      expect(result.metadata.examples).toEqual(['Valid', 'Also Valid'])
    })

    it('should ensure tags is array', () => {
      const { formData, prepareSkillForSave } = useSkillForm(mode, skill, existingSkills)
      formData.value.metadata.tags = 'invalid' as any

      const result = prepareSkillForSave()

      expect(Array.isArray(result.metadata.tags)).toBe(true)
    })
  })

  describe('formRules', () => {
    it('should have validation rules for required fields', () => {
      const { formRules } = useSkillForm(mode, skill, existingSkills)

      expect(formRules.name).toBeDefined()
      expect(formRules.name.length).toBeGreaterThan(0)
      expect(formRules.description).toBeDefined()
      expect(formRules.systemPrompt).toBeDefined()
    })

    it('should have version format validation', () => {
      const { formRules } = useSkillForm(mode, skill, existingSkills)

      expect(formRules.version).toBeDefined()
    })
  })

  describe('addExample / removeExample', () => {
    it('should add empty example', () => {
      const { formData, addExample } = useSkillForm(mode, skill, existingSkills)
      const initialLength = formData.value.metadata.examples.length
      addExample()

      expect(formData.value.metadata.examples.length).toBe(initialLength + 1)
      expect(formData.value.metadata.examples[initialLength]).toBe('')
    })

    it('should remove example at index', () => {
      const { formData, removeExample } = useSkillForm(mode, skill, existingSkills)
      formData.value.metadata.examples = ['Ex1', 'Ex2', 'Ex3']
      removeExample(1)

      expect(formData.value.metadata.examples).toEqual(['Ex1', 'Ex3'])
    })
  })
})
