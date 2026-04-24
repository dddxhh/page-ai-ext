<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div class="header-left">
        <h3>{{ t('chat.conversation') }}</h3>
        <el-tag v-if="selectedSkillName" type="success" size="small">
          {{ selectedSkillName }}
        </el-tag>
        <el-tag v-if="currentModelName" type="info" size="small">
          {{ currentModelName }}
        </el-tag>
        <el-tag v-else type="warning" size="small">
          {{ t('chat.noModelSelected') }}
        </el-tag>
      </div>
      <el-button-group>
        <el-button size="small" @click="showSkillSelector = true">
          {{ t('chat.selectSkill') }}
        </el-button>
        <el-button size="small" @click="showModelSelector = true">
          {{ t('chat.changeModel') }}
        </el-button>
        <el-button size="small" @click="handleClearConversation">
          {{ t('chat.clear') }}
        </el-button>
      </el-button-group>
    </div>

    <el-alert
      v-if="errorMessage"
      type="error"
      :title="errorMessage"
      :closable="true"
      style="margin: 12px"
      @close="errorMessage = null"
    />

    <div v-if="messages.length === 0" class="empty-state">
      <p>{{ t('chat.noMessages') }}</p>
    </div>
    <MessageList v-else :messages="messages" />

    <div class="input-area">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        :placeholder="t('chat.typeMessage')"
        @keydown.enter="handleEnterKey"
      />
      <el-button
        :type="isSending ? 'danger' : 'primary'"
        :loading="false"
        @click="handleSendOrStop"
      >
        <el-icon v-if="isSending"><SwitchButton /></el-icon>
        {{ isSending ? t('chat.stop') : t('chat.send') }}
      </el-button>
    </div>

    <SkillSelector
      v-model:visible="showSkillSelector"
      @close="showSkillSelector = false"
      @select="applySkill"
    />

    <ModelSelector v-model:visible="showModelSelector" @close="handleModelSelectorClose" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, defineAsyncComponent, toRaw } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus/es'
  import { SwitchButton } from '@element-plus/icons-vue'
  import { messaging } from '~/modules/messaging'
  import { storage } from '~/modules/storage'
  import { skillManager } from '~/modules/skill-manager'
  import { Message } from '~/types'
  import { generateId } from '~/utils/id'

  const MessageList = defineAsyncComponent(() => import('./MessageList.vue'))
  const SkillSelector = defineAsyncComponent(() => import('./SkillSelector.vue'))
  const ModelSelector = defineAsyncComponent(() => import('./ModelSelector.vue'))

  const { t } = useI18n()
  const messages = ref<Message[]>([])
  const inputMessage = ref('')
  const isSending = ref(false)
  const showSkillSelector = ref(false)
  const showModelSelector = ref(false)
  const currentResponse = ref('')
  const currentModelName = ref('')
  const selectedSkill = ref<string | null>(null)
  const selectedSkillName = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)

  async function loadCurrentModelName(): Promise<void> {
    try {
      const config = await storage.getConfig()
      const currentModel = config.models.find((m) => m.id === config.currentModelId)
      if (currentModel) {
        currentModelName.value = currentModel.name
      }
    } catch (error) {
      console.error('Failed to load current model name:', error)
    }
  }

  async function loadConversation(): Promise<void> {
    try {
      const conversation = await storage.getConversation('current')
      if (conversation) {
        messages.value = conversation.messages
        selectedSkill.value = conversation.skillId || null
        if (conversation.skillId) {
          const skill = await skillManager.getSkill(conversation.skillId)
          selectedSkillName.value = skill?.name || conversation.skillId
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  onMounted(async () => {
    await loadCurrentModelName()
    await loadConversation()

    // Listen for message responses
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'MESSAGE_RESPONSE') {
        const { content, isStreaming, done, error } = message.data

        if (error) {
          if (error === 'User cancelled') {
            isSending.value = false
            finalizeMessage(currentResponse.value).catch((err) => {
              console.error('Failed to finalize cancelled message:', err)
            })
            currentResponse.value = ''
          } else {
            ElMessage.error(error)
            errorMessage.value = error
            isSending.value = false
          }
          return
        }

        if (isStreaming) {
          currentResponse.value += content
          updateStreamingMessage(content)
        } else if (done) {
          isSending.value = false
          finalizeMessage(currentResponse.value).catch((error) => {
            console.error('Failed to finalize message:', error)
          })
          currentResponse.value = ''
        }
      } else if (message.type === 'TOOL_EXECUTION') {
        const { tool, args, result } = message.data
        console.log(`Tool executed: ${tool}`, args, result)
        ElMessage.info({
          message: `Tool ${tool} executed`,
          duration: 2000,
        })
      } else if (message.type === 'NEW_CONVERSATION') {
        messages.value = []
        selectedSkill.value = null
        selectedSkillName.value = null
        errorMessage.value = null
        isSending.value = false
        currentResponse.value = ''
        ElMessage.success(t('chat.conversationCleared') || '对话已清空')
      }
    })
  })

  onUnmounted(() => {
    // Cleanup listeners
  })

  async function handleSendOrStop(): Promise<void> {
    if (isSending.value) {
      await stopMessage()
    } else {
      await sendMessage()
    }
  }

  async function stopMessage(): Promise<void> {
    try {
      await messaging.sendToBackground('STOP_MESSAGE', {})
    } catch (error) {
      console.error('Stop message error:', error)
      isSending.value = false
    }
  }

  function handleEnterKey(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return
    }
    event.preventDefault()
    if (!isSending.value && inputMessage.value.trim()) {
      sendMessage()
    }
  }

  async function sendMessage(): Promise<void> {
    if (!inputMessage.value.trim() || isSending.value) return

    errorMessage.value = null

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputMessage.value,
      timestamp: Date.now(),
    }

    messages.value.push(userMessage)
    inputMessage.value = ''
    isSending.value = true

    try {
      await messaging.sendToBackground('SEND_MESSAGE', {
        content: userMessage.content,
        skillId: selectedSkill.value,
        includePageContent: true,
      })
      selectedSkill.value = null
      selectedSkillName.value = null
    } catch (error) {
      const errorMsg = (error as Error).message || '发送消息失败'
      console.error('Send message error:', error)
      ElMessage.error(errorMsg)
      errorMessage.value = errorMsg
      isSending.value = false
    }
  }

  function updateStreamingMessage(chunk: string): void {
    // Find or create assistant message
    const existingMessage = messages.value.find(
      (m) => m.role === 'assistant' && m.id === 'streaming'
    )

    if (existingMessage) {
      existingMessage.content += chunk
    } else {
      const newMessage: Message = {
        id: 'streaming',
        role: 'assistant',
        content: chunk,
        timestamp: Date.now(),
      }
      messages.value.push(newMessage)
    }
  }

  async function finalizeMessage(content: string): Promise<void> {
    const index = messages.value.findIndex((m) => m.id === 'streaming')
    if (index >= 0) {
      messages.value[index] = {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
      }
    }
    await saveConversationToStorage()
  }

  async function saveConversationToStorage(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const existing = await storage.getConversation('current')
      const createdAt = existing?.createdAt || Date.now()
      const conversation = {
        id: 'current',
        url: tab.url || '',
        title: tab.title || '',
        messages: toRaw(messages.value),
        skillId: selectedSkill.value ?? undefined,
        createdAt,
        updatedAt: Date.now(),
      }
      await storage.saveConversation(conversation)
    } catch (error) {
      console.error('Failed to save conversation:', error)
    }
  }

  async function clearConversation(): Promise<void> {
    messages.value = []
    selectedSkill.value = null
    selectedSkillName.value = null
    errorMessage.value = null
    isSending.value = false
    currentResponse.value = ''
    try {
      await storage.deleteConversation('current')
    } catch (error) {
      console.error('Failed to clear conversation from storage:', error)
    }
  }

  async function handleClearConversation(): Promise<void> {
    await clearConversation()
  }

  async function applySkill(skillId: string): Promise<void> {
    selectedSkill.value = skillId
    try {
      const skill = await skillManager.getSkill(skillId)
      if (skill) {
        selectedSkillName.value = skill.name
      } else {
        selectedSkillName.value = skillId
      }
    } catch (error) {
      console.error('Failed to load skill name:', error)
      selectedSkillName.value = skillId
    }
  }

  async function handleModelSelectorClose(): Promise<void> {
    await loadCurrentModelName()
  }
</script>

<style scoped>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }

  .input-area {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #ddd;
  }
</style>
