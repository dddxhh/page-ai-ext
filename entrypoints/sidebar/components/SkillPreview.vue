<template>
  <div class="skill-preview">
    <div class="preview-header">{{ t('skill.preview') }}</div>
    <el-scrollbar class="preview-scroll">
      <div class="skill-md-preview" v-html="previewHtml"></div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useMarkdown } from '../composables/useMarkdown'
  import type { Skill } from '~/types'

  interface Props {
    skill: Skill
  }

  const props = defineProps<Props>()
  const { t } = useI18n()
  const { renderSkillPreview } = useMarkdown()

  const previewHtml = computed(() => {
    return renderSkillPreview({
      name: props.skill.name,
      description: props.skill.description,
      systemPrompt: props.skill.systemPrompt,
      metadata: props.skill.metadata,
    })
  })
</script>

<style scoped>
  .skill-preview {
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--el-border-color);
    padding-left: 24px;
    min-height: 500px;
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

  .skill-md-preview :deep(.yaml-front-matter) {
    background: var(--el-fill-color-dark);
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
    overflow-x: auto;
  }

  .skill-md-preview :deep(.yaml-front-matter code) {
    color: var(--el-text-color-primary);
    background: transparent;
    padding: 0;
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
</style>
