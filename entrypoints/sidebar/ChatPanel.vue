<template>
  <div class="chat-panel">
    <div class="chat-header">
      <h3>Conversation</h3>
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

    <MessageList :messages="messages" />

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
      v-if="showModelSelector"
      @close="showModelSelector = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { messaging } from '~/modules/messaging';
import { Message } from '~/types';

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isSending = ref(false);
const showSkillSelector = ref(false);
const showModelSelector = ref(false);
const currentResponse = ref('');

onMounted(() => {
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

h3 {
  margin: 0;
  font-size: 16px;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #ddd;
}
</style>
