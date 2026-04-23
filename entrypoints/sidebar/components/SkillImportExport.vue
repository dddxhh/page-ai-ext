<template>
  <div class="skill-import-export">
    <el-button type="primary" @click="emit('export')">
      {{ t('settings.exportSkills') }}
    </el-button>
    <el-button @click="emit('import')">
      {{ t('settings.importSkills') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const emit = defineEmits<{
    export: []
    import: []
  }>()
</script>

<style scoped>
  .skill-import-export {
    display: flex;
    gap: 12px;
  }
</style>
