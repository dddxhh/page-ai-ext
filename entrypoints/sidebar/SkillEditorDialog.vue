<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="900px" @close="handleClose">
    <div class="editor-layout">
      <div class="editor-left">
        <SkillForm
          ref="skillFormRef"
          :form-data="formData"
          :form-rules="formRules"
          :mode="mode"
          @update-form-data="handleFormDataUpdate"
          @add-example="addExample"
          @remove-example="removeExample"
        />
      </div>
      <div class="editor-right">
        <SkillPreview :skill="formData" />
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
  import { ElMessage } from 'element-plus/es'
  import { skillManager } from '~/modules/skill-manager'
  import { Skill } from '~/types'
  import { useSkillForm } from './composables/useSkillForm'
  import SkillForm from './components/SkillForm.vue'
  import SkillPreview from './components/SkillPreview.vue'

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

  const { t } = useI18n()
  const saving = ref(false)
  const skillFormRef = ref<{ formRef: any }>()

  const modeRef = computed(() => props.mode)
  const skillRef = computed(() => props.skill)
  const existingSkillsRef = computed(() => props.skills)

  const { formData, formRules, initializeForm, prepareSkillForSave, addExample, removeExample } =
    useSkillForm(modeRef, skillRef, existingSkillsRef)

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

  watch(visible, (val) => {
    if (val) {
      initializeForm()
    }
  })

  function handleFormDataUpdate(updated: Skill): void {
    Object.assign(formData.value, updated)
  }

  async function handleSave(): Promise<void> {
    if (!skillFormRef.value?.formRef) return

    try {
      await skillFormRef.value.formRef.validate()
    } catch {
      return
    }

    saving.value = true

    try {
      const skillToSave = prepareSkillForSave()
      await skillManager.saveSkill(skillToSave)
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
    if (skillFormRef.value?.formRef) {
      skillFormRef.value.formRef.resetFields()
    }
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
  }
</style>
