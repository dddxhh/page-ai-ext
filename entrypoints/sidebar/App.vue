<template>
  <div id="app" :class="themeClass">
    <el-container>
      <el-header>
        <div class="header">
          <h2>AI Assistant</h2>
          <el-button-group>
            <el-button
              type="primary"
              @click="showChat = true"
              :disabled="showChat"
            >
              Chat
            </el-button>
            <el-button
              @click="showSettings = true"
              :disabled="showSettings"
            >
              Settings
            </el-button>
          </el-button-group>
        </div>
      </el-header>

      <el-main>
        <ChatPanel
          v-if="showChat"
          @toggle-settings="showSettings = true"
        />
        <SettingsPanel
          v-if="showSettings"
          @close="showSettings = false"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storage } from '~/modules/storage';
import { Config } from '~/types';

const showChat = ref(true);
const showSettings = ref(false);
const config = ref<Config | null>(null);

const themeClass = computed(() => {
  if (!config.value) return '';
  const theme = config.value.theme;
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
});

onMounted(async () => {
  config.value = await storage.getConfig();
});
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

h2 {
  margin: 0;
  font-size: 18px;
}

.dark {
  background: #1a1a1a;
  color: #fff;
}

.light {
  background: #fff;
  color: #333;
}
</style>
