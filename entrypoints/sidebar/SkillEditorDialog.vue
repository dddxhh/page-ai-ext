<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="700px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-divider content-position="left">{{ t('skill.basicInfo') }}</el-divider>

      <el-form-item :label="t('skill.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('skill.nameRequired')" />
      </el-form-item>

      <el-form-item :label="t('skill.description')" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          :placeholder="t('skill.descriptionRequired')"
        />
      </el-form-item>

      <el-form-item :label="t('skill.category')">
        <el-input v-model="formData.metadata.category" placeholder="e.g., Analysis" />
      </el-form-item>

      <el-divider content-position="left">{{ t('skill.systemPrompt') }}</el-divider>

      <el-form-item :label="t('skill.systemPrompt')" prop="systemPrompt">
        <el-input
          v-model="formData.systemPrompt"
          type="textarea"
          :rows="6"
          :placeholder="t('skill.promptRequired')"
        />
      </el-form-item>

      <el-divider content-position="left">{{ t('skill.metadata') }}</el-divider>

      <el-form-item :label="t('skill.author')">
        <el-input v-model="formData.metadata.author" placeholder="Author name" />
      </el-form-item>

      <el-form-item :label="t('skill.version')" prop="version">
        <el-input v-model="formData.metadata.version" placeholder="e.g., 1.0.0" />
      </el-form-item>

      <el-form-item :label="t('skill.tags')">
        <el-select
          v-model="formData.metadata.tags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Add tags"
        >
          <el-option v-for="tag in formData.metadata.tags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('skill.examplesLabel')">
        <div class="examples-list">
          <div
            v-for="(example, index) in formData.metadata.examples"
            :key="index"
            class="example-item"
          >
            <el-input v-model="formData.metadata.examples[index]" placeholder="Example usage" />
            <el-button type="danger" size="small" @click="removeExample(index)">
              {{ t('skill.delete') }}
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addExample">
            {{ t('skill.addExample') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ t('skill.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus/es'
  import { skillManager } from '~/modules/skill-manager'
  import { Skill, SkillMetadata } from '~/types'

  const { t } = useI18n()

  interface Props {
    skill?: Skill
    mode: 'create' | 'edit' | 'copy'
    skills: Skill[]
  }

  const props = withDefaults(defineProps<Props>(), {
    skill: undefined,
    mode: 'create',
    skills: () => [],
  })

  const visible = defineModel<boolean>('visible', { default: false })
  const emit = defineEmits<{
    save: []
  }>()

  const formRef = ref<FormInstance>()
  const saving = ref(false)

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
    createdAt: Date.now(),
  })

  const dialogTitle = computed(() => {
    switch (props.mode) {
      case 'create':
        return t('skill.createTitle')
      case 'edit':
        return t('skill.editorTitle')
      case 'copy':
        return t('skill.copyTitle')
      default:
        return t('skill.createTitle')
    }
  })

  const validateNameUnique = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error(t('skill.nameRequired')))
      return
    }
    if (value.length < 2) {
      callback(new Error(t('skill.nameMinLength')))
      return
    }
    const existing = props.skills.find((s) => s.name === value && s.id !== formData.value.id)
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
    name: [{ validator: validateNameUnique, trigger: 'blur' }],
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

  function generateId(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20)
    const timestamp = Date.now().toString(36)
    return `${base}-${timestamp}`
  }

  function addExample(): void {
    formData.value.metadata.examples.push('')
  }

  function removeExample(index: number): void {
    formData.value.metadata.examples.splice(index, 1)
  }

  watch(visible, (val) => {
    if (val) {
      if (props.mode === 'edit' && props.skill) {
        formData.value = { ...props.skill, updatedAt: Date.now() }
      } else if (props.mode === 'copy' && props.skill) {
        formData.value = {
          ...props.skill,
          id: '',
          name: t('skill.copiedName', { name: props.skill.name }),
          isBuiltIn: false,
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
          createdAt: Date.now(),
        }
      }
    }
  })

  async function handleSave(): Promise<void> {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    saving.value = true

    try {
      if (!formData.value.id) {
        formData.value.id = generateId(formData.value.name)
      }

      formData.value.metadata.examples = formData.value.metadata.examples.filter((e) => e.trim())

      await skillManager.saveSkill(formData.value)
      ElMessage.success(t('skill.saveSuccess'))
      emit('save')
      handleClose()
    } catch (error) {
      console.error('Failed to save skill:', error)
      ElMessage.error(t('skill.operationFailed'))
    } finally {
      saving.value = false
    }
  }

  function handleClose(): void {
    visible.value = false
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .example-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .example-item .el-input {
    flex: 1;
  }
</style>
