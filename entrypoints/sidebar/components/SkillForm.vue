<template>
  <el-form
    ref="formRef"
    :model="localFormData"
    :rules="formRules"
    label-width="80px"
    label-position="top"
  >
    <el-form-item :label="t('skill.name')" prop="name">
      <el-input v-model="localFormData.name" :placeholder="t('skill.nameRequired')" />
    </el-form-item>

    <el-form-item :label="t('skill.description')" prop="description">
      <el-input
        v-model="localFormData.description"
        type="textarea"
        :rows="3"
        :placeholder="t('skill.descriptionRequired')"
      />
    </el-form-item>

    <el-form-item :label="t('skill.category')">
      <el-input v-model="localFormData.metadata.category" placeholder="e.g., Analysis" />
    </el-form-item>

    <el-form-item :label="t('skill.author')">
      <el-input v-model="localFormData.metadata.author" placeholder="Author name" />
    </el-form-item>

    <el-form-item :label="t('skill.version')" prop="version">
      <el-input v-model="localFormData.metadata.version" placeholder="e.g., 1.0.0" />
    </el-form-item>

    <el-form-item :label="t('skill.tags')">
      <el-select
        v-model="localFormData.metadata.tags"
        multiple
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        placeholder="Add tags"
      >
        <el-option
          v-for="tag in localFormData.metadata.tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </el-form-item>

    <el-form-item :label="t('skill.examplesLabel')">
      <div class="examples-list">
        <div
          v-for="(example, index) in localFormData.metadata.examples"
          :key="index"
          class="example-item"
        >
          <el-input v-model="localFormData.metadata.examples[index]" placeholder="Example usage" />
          <el-button type="danger" size="small" @click="emit('removeExample', index)">
            {{ t('skill.delete') }}
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="emit('addExample')">
          {{ t('skill.addExample') }}
        </el-button>
      </div>
    </el-form-item>

    <el-divider />

    <el-form-item :label="t('skill.systemPrompt')" prop="systemPrompt">
      <el-input
        v-model="localFormData.systemPrompt"
        type="textarea"
        :rows="6"
        :placeholder="t('skill.promptRequired')"
      />
    </el-form-item>

    <el-divider />

    <el-form-item
      v-if="mode === 'edit' && !localFormData.isBuiltIn"
      :label="t('skill.enabledStatus')"
    >
      <el-switch v-model="localFormData.enabled" />
      <el-text type="info" size="small" style="margin-left: 8px">
        {{ localFormData.enabled ? t('skill.enabled') : t('skill.disabled') }}
      </el-text>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { Skill } from '~/types'

  interface Props {
    formData: Skill
    formRules: FormRules
    mode: 'create' | 'edit' | 'copy'
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    updateFormData: [skill: Skill]
    addExample: []
    removeExample: [index: number]
  }>()

  const { t } = useI18n()
  const formRef = ref<FormInstance>()

  const localFormData = ref<Skill>({ ...props.formData })

  watch(
    () => props.formData,
    (newData) => {
      localFormData.value = { ...newData }
    },
    { deep: true }
  )

  watch(
    localFormData,
    (newData) => {
      emit('updateFormData', newData)
    },
    { deep: true }
  )

  defineExpose({
    formRef,
  })
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
