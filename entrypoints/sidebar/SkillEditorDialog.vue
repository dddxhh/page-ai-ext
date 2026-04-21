<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="900px" @close="handleClose">
    <div class="editor-layout">
      <div class="editor-left">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
          label-position="top"
        >
          <el-form-item :label="t('skill.name')" prop="name">
            <el-input v-model="formData.name" :placeholder="t('skill.nameRequired')" />
          </el-form-item>

          <el-form-item :label="t('skill.description')" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              :placeholder="t('skill.descriptionRequired')"
            />
          </el-form-item>

          <el-form-item :label="t('skill.category')">
            <el-input v-model="formData.metadata.category" placeholder="e.g., Analysis" />
          </el-form-item>

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
              <el-option
                v-for="tag in formData.metadata.tags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
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

          <el-divider />

          <el-form-item :label="t('skill.systemPrompt')" prop="systemPrompt">
            <el-input
              v-model="formData.systemPrompt"
              type="textarea"
              :rows="6"
              :placeholder="t('skill.promptRequired')"
            />
          </el-form-item>

          <el-divider />

          <el-form-item v-if="mode === 'edit'" :label="t('skill.enabledStatus')">
            <el-switch v-model="formData.enabled" />
            <el-text type="info" size="small" style="margin-left: 8px">
              {{ formData.enabled ? t('skill.enabled') : t('skill.disabled') }}
            </el-text>
          </el-form-item>
        </el-form>
      </div>

      <div class="editor-right">
        <div class="preview-header">{{ t('skill.preview') }}</div>
        <el-scrollbar class="preview-scroll">
          <div class="skill-md-preview" v-html="skillPreviewHtml"></div>
        </el-scrollbar>
      </div>
    </div>

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
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import yaml from 'js-yaml'
  import { skillManager } from '~/modules/skill-manager'
  import { Skill, SkillMetadata } from '~/types'
  import { generateIdFromName } from '~/utils/id'

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
    enabled: true,
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

  function generateSkillPreview(skill: Skill): string {
    const yamlFields: Record<string, any> = {
      name: skill.name,
      description: skill.description,
    }

    if (skill.metadata.category) yamlFields.category = skill.metadata.category
    if (skill.metadata.author) yamlFields.author = skill.metadata.author
    if (skill.metadata.version) yamlFields.version = skill.metadata.version
    if (skill.metadata.tags?.length) yamlFields.tags = skill.metadata.tags
    if (skill.metadata.examples?.length) yamlFields.examples = skill.metadata.examples

    const yamlContent = yaml.dump(yamlFields, { skipInvalid: true, indent: 2 })
    const markdownBody = skill.systemPrompt

    return `---\n${yamlContent}---\n\n${markdownBody}`
  }

  const skillPreviewHtml = computed(() => {
    const rawSkillMd = generateSkillPreview(formData.value)
    const rawHtml = marked(rawSkillMd) as string
    return DOMPurify.sanitize(rawHtml)
  })

  const validateNameUnique = (rule: any, value: string, callback: any) => {
    if (!value || value.length < 2) {
      callback()
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
        formData.value.id = generateIdFromName(formData.value.name)
      }

      formData.value.metadata.examples = formData.value.metadata.examples.filter((e) => e.trim())
      if (!Array.isArray(formData.value.metadata.tags)) {
        formData.value.metadata.tags = []
      }

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
  .editor-layout {
    display: flex;
    gap: 24px;
    min-height: 500px;
  }

  .editor-left {
    flex: 0 0 45%;
    overflow-y: auto;
    padding-right: 12px;
  }

  .editor-right {
    flex: 0 0 55%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--el-border-color);
    padding-left: 24px;
  }

  .preview-header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .preview-scroll {
    flex: 1;
  }

  .skill-md-preview {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
  }

  .skill-md-preview :deep(h1) {
    font-size: 18px;
    margin: 16px 0 8px 0;
    border-bottom: 1px solid var(--el-border-color);
    padding-bottom: 4px;
  }

  .skill-md-preview :deep(h2) {
    font-size: 16px;
    margin: 12px 0 6px 0;
  }

  .skill-md-preview :deep(h3) {
    font-size: 14px;
    margin: 8px 0 4px 0;
  }

  .skill-md-preview :deep(pre) {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
  }

  .skill-md-preview :deep(code) {
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
  }

  .skill-md-preview :deep(p code) {
    background: var(--el-fill-color);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .skill-md-preview :deep(ul),
  .skill-md-preview :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  .skill-md-preview :deep(li) {
    margin: 4px 0;
  }

  .skill-md-preview :deep(blockquote) {
    border-left: 4px solid var(--el-color-primary);
    padding-left: 12px;
    margin: 8px 0;
    color: var(--el-text-color-secondary);
  }

  .skill-md-preview :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
  }

  .skill-md-preview :deep(th),
  .skill-md-preview :deep(td) {
    border: 1px solid var(--el-border-color);
    padding: 8px;
    text-align: left;
  }

  .skill-md-preview :deep(th) {
    background: var(--el-fill-color);
    font-weight: 600;
  }

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
