<template>
  <div class="skill-card" :class="{ 'skill-card-disabled': !skill.enabled && !skill.isBuiltIn }">
    <div class="skill-card-header">
      <div class="skill-card-header-left">
        <el-switch
          v-if="!skill.isBuiltIn"
          :model-value="skill.enabled"
          size="small"
          @change="handleToggleEnabled"
        />
        <span
          class="skill-name"
          :class="{ 'skill-name-disabled': !skill.enabled && !skill.isBuiltIn }"
        >
          {{ skill.name }}
        </span>
        <el-tag v-if="!skill.enabled && !skill.isBuiltIn" size="small" type="info">
          {{ t('skill.disabled') }}
        </el-tag>
      </div>
      <el-tag size="small" :type="skill.isBuiltIn ? 'info' : 'success'">
        {{ skill.isBuiltIn ? t('skill.builtIn') : t('skill.custom') }}
      </el-tag>
    </div>
    <p class="skill-card-desc" v-html="renderedDescription"></p>
    <div class="skill-card-meta">
      <el-tag v-if="skill.metadata.category" size="small" type="warning">
        {{ skill.metadata.category }}
      </el-tag>
      <el-tag v-for="tag in displayTags" :key="tag" size="small" type="info">
        {{ tag }}
      </el-tag>
    </div>
    <div class="skill-card-actions">
      <el-tooltip v-if="skill.isBuiltIn" :content="t('skill.noEditBuiltIn')" placement="top">
        <el-button size="small" disabled>{{ t('skill.edit') }}</el-button>
      </el-tooltip>
      <el-button v-else size="small" @click="emit('edit')">
        {{ t('skill.edit') }}
      </el-button>
      <el-button size="small" @click="emit('copy')">
        {{ t('skill.copy') }}
      </el-button>
      <el-tooltip v-if="skill.isBuiltIn" :content="t('skill.noDeleteBuiltIn')" placement="top">
        <el-button size="small" type="danger" disabled>
          {{ t('skill.delete') }}
        </el-button>
      </el-tooltip>
      <el-button v-else size="small" type="danger" @click="emit('delete')">
        {{ t('skill.delete') }}
      </el-button>
    </div>
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
  const emit = defineEmits<{
    toggleEnabled: []
    edit: []
    copy: []
    delete: []
  }>()

  const { t } = useI18n()
  const { renderSkillDescription } = useMarkdown()

  const renderedDescription = computed(() => {
    return renderSkillDescription(props.skill.description)
  })

  const displayTags = computed(() => {
    const tags = Array.isArray(props.skill.metadata.tags) ? props.skill.metadata.tags : []
    return tags.slice(0, 3)
  })

  function handleToggleEnabled(): void {
    emit('toggleEnabled')
  }
</script>

<style scoped>
  .skill-card {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }

  .skill-card-disabled {
    opacity: 0.6;
  }

  .skill-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .skill-card-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .skill-name {
    font-weight: 600;
    font-size: 14px;
  }

  .skill-name-disabled {
    text-decoration: line-through;
  }

  .skill-card-desc {
    color: #666;
    font-size: 12px;
    margin: 8px 0;
    line-height: 1.4;
  }

  .skill-card-desc :deep(code) {
    background: var(--el-fill-color);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
  }

  .skill-card-desc :deep(pre) {
    background: var(--el-fill-color-dark);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
  }

  .skill-card-desc :deep(.yaml-inline) {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    font-family: monospace;
  }

  .skill-card-desc :deep(.yaml-key) {
    color: var(--el-color-primary);
  }

  .skill-card-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .skill-card-actions {
    display: flex;
    gap: 8px;
  }
</style>
