<template>
  <div class="skill-list-panel">
    <div class="skills-header">
      <el-input
        v-model="searchQuery"
        :placeholder="t('skill.searchPlaceholder')"
        clearable
        style="width: 200px"
      />
      <el-select
        v-model="selectedCategory"
        :placeholder="t('skill.categoryFilter')"
        clearable
        style="width: 150px"
      >
        <el-option :label="t('skill.allCategories')" value="" />
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>
      <el-button type="primary" @click="emit('create')">
        {{ t('skill.add') }}
      </el-button>
    </div>

    <el-scrollbar max-height="300px">
      <div class="skill-cards">
        <SkillCard
          v-for="skill in filteredSkills"
          :key="skill.id"
          :skill="skill"
          @toggle-enabled="emit('toggleEnabled', skill)"
          @edit="emit('edit', skill)"
          @copy="emit('copy', skill)"
          @delete="emit('delete', skill)"
        />
      </div>
    </el-scrollbar>

    <div class="skills-footer">
      <SkillImportExport @export="emit('export')" @import="emit('import')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSkillFilter } from '../composables/useSkillFilter'
  import SkillCard from './SkillCard.vue'
  import SkillImportExport from './SkillImportExport.vue'
  import type { Skill } from '~/types'

  interface Props {
    skills: Skill[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    create: []
    toggleEnabled: [skill: Skill]
    edit: [skill: Skill]
    copy: [skill: Skill]
    delete: [skill: Skill]
    export: []
    import: []
  }>()

  const { t } = useI18n()
  const { searchQuery, selectedCategory, categories, filteredSkills } = useSkillFilter(
    computed(() => props.skills)
  )
</script>

<style scoped>
  .skill-list-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skills-header {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .skill-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skills-footer {
    padding-top: 12px;
    border-top: 1px solid #ddd;
  }
</style>
