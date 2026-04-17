<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h3>{{ t('settings.title') }}</h3>
      <el-button @click="handleClose">{{ t('settings.close') }}</el-button>
    </div>

    <div v-if="!config" class="loading">
      {{ t('settings.loading') }}
    </div>

    <el-tabs v-else v-model="activeTab">
      <el-tab-pane :label="t('settings.general')" name="general">
        <el-form :model="config" label-width="150px">
          <el-form-item :label="t('settings.theme')">
            <el-select v-model="config.theme">
              <el-option :label="t('settings.themeLight')" value="light" />
              <el-option :label="t('settings.themeDark')" value="dark" />
              <el-option :label="t('settings.themeAuto')" value="auto" />
            </el-select>
          </el-form-item>

          <el-form-item :label="t('settings.language')">
            <el-select v-model="config.language">
              <el-option :label="t('settings.languageZh')" value="zh-CN" />
              <el-option :label="t('settings.languageEn')" value="en-US" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="t('settings.shortcuts')" name="shortcuts">
        <el-form :model="config.shortcuts" label-width="150px">
          <el-form-item :label="t('settings.toggleSidebar')">
            <el-input 
              v-model="config.shortcuts.toggleSidebar" 
              :placeholder="t('settings.shortcutPlaceholder')"
            />
            <el-text type="info" size="small" style="margin-top: 4px">
              {{ t('settings.shortcutFormat') }}: Ctrl+Shift+A (Windows/Linux), Cmd+Shift+A (Mac)
            </el-text>
          </el-form-item>

          <el-form-item :label="t('settings.newConversation')">
            <el-input 
              v-model="config.shortcuts.newConversation"
              :placeholder="t('settings.shortcutPlaceholder')"
            />
            <el-text type="info" size="small" style="margin-top: 4px">
              {{ t('settings.shortcutFormat') }}: Ctrl+Shift+O (Windows/Linux), Command+Shift+O (Mac)
            </el-text>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="shortcutError"
          type="error"
          :title="shortcutError"
          :closable="true"
          @close="shortcutError = null"
          style="margin-top: 12px"
        />
      </el-tab-pane>

.

      <el-tab-pane :label="t('settings.privacy')" name="privacy">
        <el-form :model="config.privacy" label-width="150px">
          <el-form-item :label="t('settings.encryptHistory')">
            <el-switch v-model="config.privacy.encryptHistory" />
          </el-form-item>

          <el-form-item :label="t('settings.allowPageContent')">
            <el-switch v-model="config.privacy.allowPageContentUpload" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane :label="t('settings.skills')" name="skills">
        <div class="skills-section">
          <el-button type="primary" @click="exportSkills">
            {{ t('settings.exportSkills') }}
          </el-button>
          <el-button @click="importSkills">
            {{ t('settings.importSkills') }}
          </el-button>
        </div>

        <p>{{ t('settings.skillsManagementComing') }}</p>
      </el-tab-pane>

      <el-tab-pane :label="t('settings.about')" name="about">
        <div class="about-section">
          <h4>{{ t('about.title') }}</h4>
          <p>{{ t('about.version') }}: {{ t('about.versionNumber') }}</p>
          <p>{{ t('about.description') }}</p>
          <p>{{ t('about.builtWith') }}</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="settings-footer" v-if="config">
      <el-button type="primary" @click="saveSettings">
        {{ t('settings.saveSettings') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { storage } from '~/modules/storage';
import { Config } from '~/types';

const { t } = useI18n();

const activeTab = ref('general');
const config = ref<Config | null>(null);
const shortcutError = ref<string | null>(null);

const emit = defineEmits<{
  close: 'close';
}>();

onMounted(async () => {
  config.value = await storage.getConfig();
});

async function saveSettings(): Promise<void> {
  if (!config.value) return;

  try {
    if (!validateShortcuts()) {
      return;
    }

    await storage.updateConfig(config.value);
    ElMessage.success(t('settings.settingsSaved'));
  } catch (error) {
    console.error('Failed to save settings:', error);
    ElMessage.error(t('settings.settingsSaveFailed'));
  }
}

function validateShortcuts(): boolean {
  if (!config.value) return false;

  const { toggleSidebar, newConversation } = config.value.shortcuts;
  
  const shortcutPattern = /^(Ctrl|Cmd|Alt|Meta|Shift)\+([A-Za-z0-9]|\w+([A-Za-z0-9]))$/;
  
  if (toggleSidebar && !shortcutPattern.test(toggleSidebar)) {
    shortcutError.value = t('settings.invalidShortcutFormat') + ': ' + t('settings.toggleSidebar');
    return false;
  }

  if (newConversation && !shortcutPattern.test(newConversation)) {
    shortcutError.value = t('settings.invalidShortcutFormat') + ': ' + t('settings.newConversation');
    return false;
  }

  if (toggleSidebar && newConversation && toggleSidebar === newConversation) {
    shortcutError.value = t('settings.shortcutConflict');
    return false;
  }

  shortcutError.value = null;
  return true;
}

async function exportSkills(): Promise<void> {
  const skills = await storage.exportSkills();
  const blob = new Blob([JSON.stringify(skills, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skills.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importSkills(): Promise<void> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const text = await file.text();
    const skills = JSON.parse(text);
    await storage.importSkills(skills);
    ElMessage.success(t('settings.skillsImported'));
  };

  input.click();
}

function handleClose(): void {
  emit('close');
}
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h3 {
  margin: 0;
}

.settings-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #ddd;
}

.skills-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.about-section h4 {
  margin: 0 0 8px 0;
}

.about-section p {
  margin: 8px 0;
  color: #666;
}
</style>
