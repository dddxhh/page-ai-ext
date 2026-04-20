<template>
  <div class="message-list">
    <div v-for="message in messages" :key="message.id" :class="['message', message.role]">
      <div class="message-header">
        <span class="role">{{ roleLabel(message.role) }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-content">
        <div v-if="message.role === 'user'" class="user-content">
          {{ message.content }}
        </div>
        <div v-else class="assistant-content">
          <div v-html="renderedContent(message.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Message } from '~/types'
  import { marked } from 'marked'

  const { t } = useI18n()

  const props = defineProps<{
    messages: Message[]
  }>()

  function roleLabel(role: string): string {
    switch (role) {
      case 'user':
        return t('message.you')
      case 'assistant':
        return t('message.ai')
      case 'system':
        return t('message.system')
      default:
        return role
    }
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  function renderedContent(content: string): string {
    return marked(content)
  }
</script>

<style scoped>
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    overflow-y: auto;
    flex: 1;
  }

  .message {
    border-radius: 8px;
    padding: 12px;
  }

  .message.user {
    background: #e3f2fd;
    align-self: flex-end;
    max-width: 80%;
  }

  .message.assistant {
    background: #f5f5f5;
    align-self: flex-start;
    max-width: 90%;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 8px;
    opacity: 0.7;
  }

  .role {
    font-weight: bold;
  }

  .message-content {
    line-height: 1.6;
  }

  .assistant-content :deep(pre) {
    background: #2d2d2d;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }

  .assistant-content :deep(code) {
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }
</style>
