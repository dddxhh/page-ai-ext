<template>
  <el-dialog
    v-model="visible"
    title="Confirm Operation"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="confirm-content">
      <el-alert type="warning" :closable="false">
        <template #title>
          {{ confirmRequest.operationDescription }}
        </template>
      </el-alert>

      <div v-if="confirmRequest.previewImage" class="preview-section">
        <img :src="confirmRequest.previewImage" class="preview-image" />
      </div>
      <div v-else-if="confirmRequest.elementInfo" class="preview-section">
        <div class="element-placeholder">
          <div class="element-tag">{{ confirmRequest.elementInfo.tag }}</div>
          <div v-if="confirmRequest.elementInfo.text" class="element-text">
            {{ confirmRequest.elementInfo.text }}
          </div>
          <div class="element-selector">{{ confirmRequest.elementInfo.selector }}</div>
        </div>
      </div>

      <el-collapse>
        <el-collapse-item title="View Details">
          <pre class="params">{{ JSON.stringify(confirmRequest.params, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>

      <el-checkbox v-if="showSessionAllow" v-model="sessionAllow">
        Allow this tool for the current session (don't ask again)
      </el-checkbox>
    </div>

    <template #footer>
      <el-button @click="handleCancel">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { ConfirmRequest } from '~/types/mcp-tools'

  const props = defineProps<{
    confirmRequest: ConfirmRequest
    showSessionAllow?: boolean
  }>()

  const emit = defineEmits<{
    confirm: [confirmed: boolean, sessionAllow?: string]
    cancel: []
  }>()

  const visible = ref(true)
  const sessionAllow = ref(false)

  function handleConfirm(): void {
    emit('confirm', true, sessionAllow.value ? props.confirmRequest.tool : undefined)
    visible.value = false
  }

  function handleCancel(): void {
    emit('cancel')
    visible.value = false
  }
</script>

<style scoped>
  .confirm-content {
    padding: 16px 0;
  }

  .preview-section {
    margin: 16px 0;
    text-align: center;
  }

  .preview-image {
    max-width: 100%;
    border: 2px solid #409eff;
    border-radius: 4px;
  }

  .element-placeholder {
    background: #f5f5f5;
    border: 2px solid #409eff;
    border-radius: 4px;
    padding: 16px;
  }

  .element-tag {
    font-weight: bold;
    color: #409eff;
  }

  .element-text {
    margin-top: 8px;
    color: #333;
  }

  .element-selector {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .params {
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    margin: 0;
    overflow-x: auto;
  }
</style>
