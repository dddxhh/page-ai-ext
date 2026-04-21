<template>
  <el-dialog v-model="visible" :title="t('skill.selectSkill')" width="600px" @close="handleClose">
    <el-input
      v-model="searchQuery"
      :placeholder="t('skill.searchSkills')"
      clearable
      @input="handleSearch"
    />

    <el-scrollbar max-height="400px">
      <div class="skill-list">
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          :class="['skill-item', { 'skill-item-disabled': !skill.enabled }]"
          @click="selectSkill(skill)"
        >
          <div class="skill-header">
            <h4 :class="{ 'skill-name-disabled': !skill.enabled }">{{ skill.name }}</h4>
            <el-tag size="small">{{ skill.metadata.category }}</el-tag>
            <el-tag v-if="!skill.enabled" size="small" type="danger">{{
              t('skill.disabled')
            }}</el-tag>
          </div>
          <p class="skill-description">{{ skill.description }}</p>
          <div class="skill-tags">
            <el-tag
              v-for="tag in Array.isArray(skill.metadata.tags) ? skill.metadata.tags : []"
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div v-if="skill.metadata.examples.length" class="skill-examples">
            <strong>{{ t('skill.examples') }}:</strong>
            <ul>
              <li v-for="example in skill.metadata.examples" :key="example">
                {{ example }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus/es'
  import { skillManager } from '~/modules/skill-manager'
  import { Skill } from '~/types'

  const { t } = useI18n()

  const visible = defineModel<boolean>('visible', { default: false })
  const searchQuery = ref('')
  const skills = ref<Skill[]>([])
  const filteredSkills = ref<Skill[]>([])

  const emit = defineEmits<{
    close: []
    select: [skillId: string]
  }>()

  onMounted(async () => {
    skills.value = await skillManager.getAllSkills()
    filteredSkills.value = skills.value
  })

  async function handleSearch(): Promise<void> {
    if (!searchQuery.value.trim()) {
      filteredSkills.value = skills.value
    } else {
      filteredSkills.value = await skillManager.searchSkills(searchQuery.value)
    }
  }

  function selectSkill(skill: Skill): void {
    if (!skill.enabled) {
      ElMessage.warning(t('skill.skillDisabled'))
      return
    }
    emit('select', skill.id)
    handleClose()
  }

  function handleClose(): void {
    emit('close')
  }
</script>

<style scoped>
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
  }

  .skill-item {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .skill-item:hover {
    background: #f5f5f5;
    border-color: #409eff;
  }

  .skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  h4 {
    margin: 0;
    font-size: 16px;
  }

  .skill-description {
    margin: 8px 0;
    color: #666;
    line-height: 1.5;
  }

  .skill-tags {
    display: flex;
    gap: 8px;
    margin: 8px 0;
  }

  .skill-examples {
    margin-top: 12px;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 4px;
  }

  .skill-examples ul {
    margin: 8px 0 0 16px;
    padding: 0;
  }

  .skill-examples li {
    margin-bottom: 4px;
  }

  .skill-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-item-disabled:hover {
    background: #f5f5f5;
    border-color: #ddd;
  }

  .skill-name-disabled {
    text-decoration: line-through;
    color: var(--el-text-color-secondary);
  }
</style>
