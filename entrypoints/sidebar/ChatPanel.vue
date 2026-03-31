<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div class="header-left">
        <h3>Conversation</h3>
        <el-tag v-if="currentModelName" type="info" size="small">
          {{ currentModelName }}
        </el-tag>
      </div>
      <el-button-group>
        <el-button
          size="small"
          @click="showSkillSelector = true"
        >
          Select Skill
        </el-button>
        <el-button
          size="small"
          @click="showModelSelector = true"
        >
          Change Model
        </el-button>
        <el-button
          size="small"
          @click="clearConversation"
        >
          Clear
        </el-button>
      </el-button-group>
    </div>

    <div v-if="messages.length === 0" class="empty-state">
      <p>No messages yet. Start a conversation!</p>
    </div>
    <MessageList v-else :messages="messages" />

    <div class="input-area">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="Type your message..."
        @keydown.ctrl.enter="sendMessage"
      />
      <el-button
        type="primary"
        :loading="isSending"
        @click="sendMessage"
      >
        Send
      </el-button>
    </div>

    <SkillSelector
      v-if="showSkillSelector"
      @close="showSkillSelector = false"
      @select="applySkill"
    />

    <ModelSelector
      v-model:visible="showModelSelector"
      @close="handleModelSelectorClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { messaging } from '~/modules/messaging';
import { storage } from '~/modules/storage';
import { Message, ModelConfig } from '~/types';
import MessageList from './MessageList.vue';
import SkillSelector from './SkillSelector.vue';
import ModelSelector from './ModelSelector.vue';

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isSending = ref(false);
const showSkillSelector = ref(false);
const showModelSelector = ref(false);
const currentResponse = ref('');
const currentModelName = ref('');

async function loadCurrentModelName(): Promise<void> {
  try {
    const config = await storage.getConfig();
    const currentModel = config.models.find(m => m.id === config.currentModelId);
    if (currentModel) {
      currentModelName.value = currentModel.name;
    }
  } catch (error) {
    console.error('Failed to load current model name:', error);
  }
}

onMounted(async () => {
  console.log('ChatPanel mounted');
  await loadCurrentModelName();

  // Listen for message responses
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'MESSAGE_RESPONSE') {
      const { content, isStreaming, done } = message.data;

      if (isStreaming) {
        currentResponse.value += content;
        // Update or add streaming message
        updateStreamingMessage(content);
      } else if (done) {
        isSending.value = false;
        // Finalize message
        finalizeMessage(currentResponse.value);
        currentResponse.value = '';
      }
    }
  });
});

onUnmounted(() => {
  // Cleanup listeners
});

async function sendMessage(): Promise<void> {
  if (!inputMessage.value.trim() || isSending.value) return;

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: inputMessage.value,
    timestamp: Date.now()
  };

  messages.value.push(userMessage);
  inputMessage.value = '';
  isSending.value = true;

  try {
    await messaging.sendToBackground('SEND_MESSAGE', {
      content: userMessage.content,
      includePageContent: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    isSending.value = false;
  }
}

  function updateStreamingMessage(chunk: string): void {
  // Find or create assistant message
  const existingMessage = messages.value.find(m => m.role === 'assistant' && m.id === 'streaming');
  
  if (existingMessage) {
    existingMessage.content += chunk;
  } else {
    const newMessage: Message = {
      id: 'streaming',
      role: 'assistant',
      content: chunk,
      timestamp: Date.now()
    };
    messages.value.push(newMessage);
  }
}

function finalizeMessage(content: string): void {
  // Replace streaming message with final message
  const index = messages.value.findIndex(m => m.id === 'streaming');
  if (index >= 0) {
    messages.value[index] = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
  }
}

function clearConversation(): void {
  messages.value = [];
}

function applySkill(skillId: string): void {
  // Apply skill to next message
  console.log('Applying skill:', skillId);
}

async function handleModelSelectorClose(): Promise<void> {
  await loadCurrentModelName();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const emit = defineEmits<{
  'toggle-settings': [];
}>();
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
