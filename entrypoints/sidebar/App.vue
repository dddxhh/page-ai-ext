<template>
  <el-config-provider :locale="elementLocale">
    <div id="app" :class="themeClass">
      <el-container>
        <el-header>
          <div class="header">
            <h2>{{ t('app.title') }}</h2>
            <el-button-group>
              <el-button
                type="primary"
                @click="showChat = true; showSettings = false"
                :disabled="showChat"
              >
                {{ t('app.chat') }}
              </el-button>
              <el-button
                @click="showSettings = true; showChat = false"
                :disabled="showSettings"
              >
                {{ t('app.settings') }}
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
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storage } from '~/modules/storage';
import { Config } from '~/types';
import ChatPanel from './ChatPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import { useLocale } from './composables/useLocale';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

const { t } = useI18n();
const { currentLocale, loadSavedLocale } = useLocale();

const showChat = ref(true);
const showSettings = ref(false);
const config = ref<Config | null>(null);

const elementLocale = computed(() => {
  return currentLocale.value === 'zh-CN' ? zhCn : en;
});

const themeClass = computed(() => {
  if (!config.value) return 'light';
  const theme = config.value.theme;
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
});

onMounted(async () => {
  console.log('App mounted, loading config...');
  try {
    config.value = await storage.getConfig();
    console.log('Config loaded:', config.value);
    if (config.value.language) {
      currentLocale.value = config.value.language;
    }
    await loadSavedLocale();
  } catch (error) {
    console.error('Failed to load config:', error);
  }
});

watch(() => config.value?.language, (newLanguage) => {
  if (newLanguage) {
    currentLocale.value = newLanguage;
  }
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