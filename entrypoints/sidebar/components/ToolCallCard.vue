<template>
  <div class="tool-call-card" :class="execution.status">
    <div class="tool-header">
      <span class="tool-icon">{{ toolIcon }}</span>
      <span class="tool-name">{{ execution.name }}</span>
      <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
    </div>

    <div v-if="execution.previewImage" class="preview-section">
      <img :src="execution.previewImage" class="preview-thumbnail" />
    </div>

    <el-collapse>
      <el-collapse-item title="Parameters">
        <pre class="params">{{ JSON.stringify(execution.params, null, 2) }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.result" title="Result">
        <div v-if="isFindElementsResult" class="elements-result">
          <div v-for="(el, idx) in execution.result.elements" :key="idx" class="element-item">
            <div class="element-header">
              <span class="element-tag">{{ el.tag }}</span>
              <span class="element-selector">{{ el.recommended }}</span>
              <span class="element-priority">Priority: {{ el.priority }}</span>
            </div>
            <div class="element-selectors">
              <el-tag
                v-for="s in el.selectors"
                :key="s.type"
                size="small"
                :type="selectorType(s.confidence)"
              >
                {{ s.type }}: {{ s.value }} ({{ s.confidence }}%)
              </el-tag>
            </div>
          </div>
        </div>
        <pre v-else class="result">{{ formatResult }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.error" title="Error">
        <div class="error">{{ execution.error }}</div>
      </el-collapse-item>
    </el-collapse>

    <div class="tool-meta">
      <span v-if="execution.duration" class="duration">{{ execution.duration }}ms</span>
      <span class="timestamp">{{ formatTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ToolExecution } from '~/types/mcp-tools'

  const props = defineProps<{
    execution: ToolExecution
  }>()

  const toolIcon = computed(() => {
    const icons: Record<string, string> = {
      click_element: '🖱',
      fill_form: '📝',
      extract_content: '📋',
      scroll_page: '⬇',
      execute_script: '⚡',
      get_page_content: '📄',
      get_page_structure: '🏗',
      find_elements: '🔍',
      take_screenshot: '📸',
    }
    return icons[props.execution.name] || '🔧'
  })

  const statusType = computed(() => {
    switch (props.execution.status) {
      case 'pending':
        return 'info'
      case 'confirming':
        return 'warning'
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'cancelled':
        return 'info'
      default:
        return 'info'
    }
  })

  const statusText = computed(() => {
    switch (props.execution.status) {
      case 'pending':
        return 'Pending'
      case 'confirming':
        return 'Waiting'
      case 'success':
        return 'Success'
      case 'error':
        return 'Error'
      case 'cancelled':
        return 'Cancelled'
      default:
        return props.execution.status
    }
  })

  const formatResult = computed(() => {
    if (typeof props.execution.result === 'object') {
      return JSON.stringify(props.execution.result, null, 2)
    }
    return String(props.execution.result)
  })

  const formatTime = computed(() => {
    return new Date(props.execution.timestamp).toLocaleTimeString()
  })

  const isFindElementsResult = computed(() => {
    return (
      props.execution.name === 'find_elements' &&
      props.execution.result &&
      'elements' in props.execution.result
    )
  })

  function selectorType(confidence: number): '' | 'success' | 'warning' | 'danger' | 'info' {
    if (confidence >= 85) return 'success'
    if (confidence >= 70) return 'info'
    if (confidence >= 50) return 'warning'
    return ''
  }
</script>

<style scoped>
  .tool-call-card {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 8px 0;
    background: #fafafa;
  }

  .tool-call-card.pending {
    border-color: #1976d2;
    background: #e3f2fd;
  }

  .tool-call-card.confirming {
    border-color: #f57c00;
    background: #fff3e0;
  }

  .tool-call-card.success {
    border-color: #388e3c;
    background: #e8f5e9;
  }

  .tool-call-card.error {
    border-color: #d32f2f;
    background: #ffebee;
  }

  .tool-call-card.cancelled {
    border-color: #757575;
    background: #f5f5f5;
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-icon {
    font-size: 18px;
  }

  .tool-name {
    font-weight: 500;
    flex: 1;
  }

  .preview-section {
    margin: 8px 0;
    text-align: center;
  }

  .preview-thumbnail {
    max-width: 200px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .params,
  .result {
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
  }

  .error {
    color: #d32f2f;
    font-size: 13px;
  }

  .elements-result {
    max-height: 300px;
    overflow-y: auto;
  }

  .element-item {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px;
    margin: 8px 0;
  }

  .element-header {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .element-tag {
    background: #e0e0e0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .element-selector {
    font-weight: 500;
    color: #1976d2;
  }

  .element-priority {
    font-size: 11px;
    color: #666;
  }

  .element-selectors {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .tool-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }
</style>
