<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h3>Settings</h3>
      <el-button @click="handleClose">Close</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="General" name="general">
        <el-form :model="config" label-width="150px">
          <el-form-item label="Theme">
            <el-select v-model="config.theme">
              <el-option label="Light" value="light" />
              <el-option label="Dark" value="dark" />
              <el-option label="Auto" value="auto" />
            </el-select>
          </el-form-item>

          <el-form-item label="Language">
            <el-select v-model="config.language">
              <el-option label="中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="Shortcuts" name="shortcuts">
        <el-form :model="config.shortcuts" label-width="150px">
          <el-form-item label="Toggle Sidebar">
            <el-input v-model="config.shortcuts.toggleSidebar" />
          </el-form-item>

          <el-form-item label="New Conversation">
            <el-input v-model="config.shortcuts.newConversation" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="Privacy" name="privacy">
        <el-form :model="config.privacy" label-width="150px">
          <el-form-item label="Encrypt History">
            <el-switch v-model="config.privacy.encryptHistory" />
          </el-form-item>

          <el-form-item label="Allow Page Content">
            <el-switch v-model="config.privacy.allowPageContentUpload" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="Skills" name="skills">
        <div class="skills-section">
          <el-button type="primary" @click="exportSkills">
            Export Skills
          </el-button>
          <el-button @click="importSkills">
            Import Skills
          </el-button>
        </div>

        <p>Skills management UI coming soon...</p>
      </el-tab-pane>

      <el-tab-pane label="About" name="about">
        <div class="about-section">
          <h4>AI Assistant Extension</h4>
          <p>Version: 1.0.0</p>
          <p>
            A Chrome extension that enables AI-powered page interaction
            using WebMCP protocol.
          </p>
          <p>
            Built with WXT, Vue 3, TypeScript, and Element Plus.
          </p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">
        Save Settings
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storage } from '~/modules/storage';
import { Config } from '~/types';

const activeTab = ref('general');
const config = ref<Config | null>(null);

const emit = defineEmits<{
  close: [];
}>();

onMounted(async () => {
  config.value = await storage.getConfig();
});

async function saveSettings(): Promise<void> {
  if (!config.value) return;

  try {
    await storage.updateConfig(config.value);
    alert('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
    alert('Failed to save settings');
  }
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
    alert('Skills imported successfully');
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
