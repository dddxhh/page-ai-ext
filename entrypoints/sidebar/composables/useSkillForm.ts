import { ref, type Ref } from 'vue'
import type { FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { Skill, SkillMetadata } from '~/types'
import { generateIdFromName } from '~/utils/id'

export function useSkillForm(
  mode: Ref<'create' | 'edit' | 'copy'>,
  skill: Ref<Skill | undefined>,
  existingSkills: Ref<Skill[]>
) {
  const { t } = useI18n()

  const defaultMetadata: SkillMetadata = {
    author: '',
    version: '1.0.0',
    tags: [],
    examples: [],
    category: '',
  }

  const formData = ref<Skill>({
    id: '',
    name: '',
    description: '',
    systemPrompt: '',
    metadata: { ...defaultMetadata },
    isBuiltIn: false,
    enabled: true,
    createdAt: Date.now(),
  })

  const validateNameUnique = (rule: any, value: string, callback: any) => {
    if (!value || value.length < 2) {
      callback()
      return
    }
    const existing = existingSkills.value.find(
      (s) => s.name === value && s.id !== formData.value.id
    )
    if (existing) {
      callback(new Error(t('skill.nameDuplicate')))
      return
    }
    callback()
  }

  const validateVersion = (rule: any, value: string, callback: any) => {
    if (value && !/^\d+\.\d+\.\d+$/.test(value)) {
      callback(new Error(t('skill.versionFormat')))
      return
    }
    callback()
  }

  const formRules: FormRules = {
    name: [
      { required: true, message: t('skill.nameRequired'), trigger: 'blur' },
      { min: 2, message: t('skill.nameMinLength'), trigger: 'blur' },
      { validator: validateNameUnique, trigger: 'blur' },
    ],
    description: [
      { required: true, message: t('skill.descriptionRequired'), trigger: 'blur' },
      { min: 10, message: t('skill.descriptionMinLength'), trigger: 'blur' },
    ],
    systemPrompt: [
      { required: true, message: t('skill.promptRequired'), trigger: 'blur' },
      { min: 20, message: t('skill.promptMinLength'), trigger: 'blur' },
    ],
    version: [{ validator: validateVersion, trigger: 'blur' }],
  }

  function initializeForm(): void {
    if (mode.value === 'edit' && skill.value) {
      formData.value = { ...skill.value, updatedAt: Date.now() }
    } else if (mode.value === 'copy' && skill.value) {
      formData.value = {
        ...skill.value,
        id: '',
        name: t('skill.copiedName', { name: skill.value.name }),
        isBuiltIn: false,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: undefined,
      }
    } else {
      formData.value = {
        id: '',
        name: '',
        description: '',
        systemPrompt: '',
        metadata: { ...defaultMetadata },
        isBuiltIn: false,
        enabled: true,
        createdAt: Date.now(),
      }
    }
  }

  function resetForm(): void {
    formData.value = {
      id: '',
      name: '',
      description: '',
      systemPrompt: '',
      metadata: { ...defaultMetadata },
      isBuiltIn: false,
      enabled: true,
      createdAt: Date.now(),
    }
  }

  function prepareSkillForSave(): Skill {
    if (!formData.value.id) {
      formData.value.id = generateIdFromName(formData.value.name)
    }

    formData.value.metadata.examples = formData.value.metadata.examples.filter((e) => e.trim())
    if (!Array.isArray(formData.value.metadata.tags)) {
      formData.value.metadata.tags = []
    }

    return { ...formData.value }
  }

  function addExample(): void {
    formData.value.metadata.examples.push('')
  }

  function removeExample(index: number): void {
    formData.value.metadata.examples.splice(index, 1)
  }

  return {
    formData,
    formRules,
    defaultMetadata,
    initializeForm,
    resetForm,
    prepareSkillForSave,
    addExample,
    removeExample,
  }
}
