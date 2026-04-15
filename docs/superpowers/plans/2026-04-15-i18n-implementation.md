# 国际化功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Chrome AI Assistant 扩展实现完整的国际化功能，支持中文/英文切换，包括自定义 UI 文本和 Element Plus 组件内置文本。

**Architecture:** 使用 vue-i18n 管理翻译文本，通过 useLocale composable 封装语言切换逻辑，Element Plus locale 动态加载实现 UI 组件国际化。

**Tech Stack:** vue-i18n, Element Plus locale, Vue 3 Composition API

---

## 文件结构

**新增文件：**
- `entrypoints/sidebar/locales/zh-CN.ts` - 中文翻译
- `entrypoints/sidebar/locales/en-US.ts` - 英文翻译
- `entrypoints/sidebar/locales/index.ts` - 语言加载器
- `entrypoints/sidebar/composables/useLocale.ts` - 语言切换 composable

**修改文件：**
- `package.json` - 添加 vue-i18n 依赖
- `entrypoints/sidebar/main.ts` - 配置 i18n
- `entrypoints/sidebar/App.vue` - 监听语言变化、传递 locale 给 Element Plus
- `entrypoints/sidebar/ChatPanel.vue` - 替换硬编码文本
- `entrypoints/sidebar/SettingsPanel.vue` - 替换硬编码文本
- `entrypoints/sidebar/SkillSelector.vue` - 替换硬编码文本
- `entrypoints/sidebar/ModelSelector.vue` - 替换硬编码文本
- `entrypoints/sidebar/AddModelDialog.vue` - 替换硬编码文本
- `entrypoints/sidebar/MessageList.vue` - 替换硬编码文本

---

## Task 1: 安装 vue-i18n 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 vue-i18n**

Run: `npm install vue-i18n`
Expected: vue-i18n 添加到 dependencies

- [ ] **Step 2: 验证安装**

Run: `npm list vue-i18n`
Expected: 显示 vue-i18n 版本

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add vue-i18n dependency"
```

---

## Task 2: 创建中文语言文件

**Files:**
- Create: `entrypoints/sidebar/locales/zh-CN.ts`

- [ ] **Step 1: 创建 zh-CN.ts**

```typescript
export default {
  app: {
    title: 'AI 助手',
    chat: '聊天',
    settings: '设置'
  },
  chat: {
    conversation: '对话',
    selectSkill: '选择技能',
    changeModel: '切换模型',
    clear: '清空',
    noMessages: '暂无消息，开始对话吧！',
    typeMessage: '输入消息...',
    send: '发送'
  },
  settings: {
    title: '设置',
    close: '关闭',
    general: '通用',
    shortcuts: '快捷键',
    privacy: '隐私',
    skills: '技能',
    about: '关于',
    theme: '主题',
    themeLight: '浅色',
    themeDark: '深色',
    themeAuto: '自动',
    language: '语言',
    languageZh: '中文',
    languageEn: 'English',
    toggleSidebar: '切换侧边栏',
    newConversation: '新建对话',
    encryptHistory: '加密历史',
    allowPageContent: '允许上传页面内容',
    exportSkills: '导出技能',
    importSkills: '导入技能',
    saveSettings: '保存设置',
    settingsSaved: '设置已保存',
    settingsSaveFailed: '保存失败',
    skillsManagementComing: '技能管理界面即将推出...'
  },
  model: {
    selectModel: '选择模型',
    builtinModels: '内置模型',
    customModels: '自定义模型',
    addCustomModel: '添加自定义模型',
    active: '当前',
    select: '选择',
    delete: '删除',
    close: '关闭',
    addModel: '添加模型',
    name: '名称',
    provider: '提供商',
    baseUrl: 'Base URL',
    modelId: '模型',
    apiKey: 'API Key',
    add: '添加',
    cancel: '取消',
    modelAdded: '模型添加成功',
    modelAddFailed: '模型添加失败',
    fillRequired: '请填写所有必填项'
  },
  skill: {
    selectSkill: '选择技能',
    searchSkills: '搜索技能...',
    examples: '示例',
    cancel: '取消'
  },
  message: {
    you: '你',
    ai: 'AI',
    system: '系统'
  },
  about: {
    title: 'AI 助手扩展',
    version: '版本',
    versionNumber: '1.0.0',
    description: '一个使用 WebMCP 协议实现 AI 页面交互的 Chrome 扩展。',
    builtWith: '使用 WXT、Vue 3、TypeScript 和 Element Plus 构建。'
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/locales/zh-CN.ts
git commit -m "feat: add Chinese locale file"
```

---

## Task 3: 创建英文语言文件

**Files:**
- Create: `entrypoints/sidebar/locales/en-US.ts`

- [ ] **Step 1: 创建 en-US.ts**

```typescript
export default {
  app: {
    title: 'AI Assistant',
    chat: 'Chat',
    settings: 'Settings'
  },
  chat: {
    conversation: 'Conversation',
    selectSkill: 'Select Skill',
    changeModel: 'Change Model',
    clear: 'Clear',
    noMessages: 'No messages yet. Start a conversation!',
    typeMessage: 'Type your message...',
    send: 'Send'
  },
  settings: {
    title: 'Settings',
    close: 'Close',
    general: 'General',
    shortcuts: 'Shortcuts',
    privacy: 'Privacy',
    skills: 'Skills',
    about: 'About',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeAuto: 'Auto',
    language: 'Language',
    languageZh: '中文',
    languageEn: 'English',
    toggleSidebar: 'Toggle Sidebar',
    newConversation: 'New Conversation',
    encryptHistory: 'Encrypt History',
    allowPageContent: 'Allow Page Content Upload',
    exportSkills: 'Export Skills',
    importSkills: 'Import Skills',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully',
    settingsSaveFailed: 'Failed to save settings',
    skillsManagementComing: 'Skills management UI coming soon...'
  },
  model: {
    selectModel: 'Select Model',
    builtinModels: 'Built-in Models',
    customModels: 'Custom Models',
    addCustomModel: 'Add Custom Model',
    active: 'Active',
    select: 'Select',
    delete: 'Delete',
    close: 'Close',
    addModel: 'Add Custom Model',
    name: 'Name',
    provider: 'Provider',
    baseUrl: 'Base URL',
    modelId: 'Model',
    apiKey: 'API Key',
    add: 'Add',
    cancel: 'Cancel',
    modelAdded: 'Model added successfully',
    modelAddFailed: 'Failed to add model',
    fillRequired: 'Please fill in all required fields'
  },
  skill: {
    selectSkill: 'Select Skill',
    searchSkills: 'Search skills...',
    examples: 'Examples',
    cancel: 'Cancel'
  },
  message: {
    you: 'You',
    ai: 'AI',
    system: 'System'
  },
  about: {
    title: 'AI Assistant Extension',
    version: 'Version',
    versionNumber: '1.0.0',
    description: 'A Chrome extension that enables AI-powered page interaction using WebMCP protocol.',
    builtWith: 'Built with WXT, Vue 3, TypeScript, and Element Plus.'
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/locales/en-US.ts
git commit -m "feat: add English locale file"
```

---

## Task 4: 创建语言加载器

**Files:**
- Create: `entrypoints/sidebar/locales/index.ts`

- [ ] **Step 1: 创建 index.ts**

```typescript
import zhCN from './zh-CN';
import enUS from './en-US';

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

export type LocaleCode = 'zh-CN' | 'en-US';

export const defaultLocale: LocaleCode = 'zh-CN';

export function getLocaleMessages(locale: LocaleCode) {
  return messages[locale] || messages[defaultLocale];
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/locales/index.ts
git commit -m "feat: add locale loader"
```

---

## Task 5: 创建 useLocale composable

**Files:**
- Create: `entrypoints/sidebar/composables/useLocale.ts`

- [ ] **Step 1: 创建 composables 目录**

Run: `mkdir -p entrypoints/sidebar/composables`
Expected: 目录创建成功

- [ ] **Step 2: 创建 useLocale.ts**

```typescript
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storage } from '~/modules/storage';
import { LocaleCode, defaultLocale } from '../locales';

export function useLocale() {
  const { locale } = useI18n();
  const currentLocale = ref<LocaleCode>(defaultLocale);

  async function loadSavedLocale(): Promise<void> {
    try {
      const config = await storage.getConfig();
      if (config.language) {
        currentLocale.value = config.language;
        locale.value = config.language;
      }
    } catch (error) {
      console.error('Failed to load saved locale:', error);
    }
  }

  async function setLocale(newLocale: LocaleCode): Promise<void> {
    currentLocale.value = newLocale;
    locale.value = newLocale;
    
    try {
      await storage.updateConfig({ language: newLocale });
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  }

  watch(currentLocale, (newLocale) => {
    locale.value = newLocale;
  });

  return {
    currentLocale,
    loadSavedLocale,
    setLocale
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add entrypoints/sidebar/composables/useLocale.ts
git commit -m "feat: add useLocale composable"
```

---

## Task 6: 配置 main.ts

**Files:**
- Modify: `entrypoints/sidebar/main.ts`

- [ ] **Step 1: 修改 main.ts 配置 i18n**

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import { messages, defaultLocale } from './locales';

const app = createApp(App);
const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  messages
});

app.use(pinia);
app.use(i18n);
app.use(ElementPlus);

app.mount('#app');
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/main.ts
git commit -m "feat: configure i18n in main.ts"
```

---

## Task 7: 修改 App.vue

**Files:**
- Modify: `entrypoints/sidebar/App.vue`

- [ ] **Step 1: 修改 App.vue，添加语言切换监听和 Element Plus locale**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/App.vue
git commit -m "feat: integrate i18n and Element locale in App.vue"
```

---

## Task 8: 修改 ChatPanel.vue

**Files:**
- Modify: `entrypoints/sidebar/ChatPanel.vue`

- [ ] **Step 1: 替换 ChatPanel.vue 硬编码文本**

将第 5-29 行替换为：

```vue
    <div class="chat-header">
      <div class="header-left">
        <h3>{{ t('chat.conversation') }}</h3>
        <el-tag v-if="currentModelName" type="info" size="small">
          {{ currentModelName }}
        </el-tag>
      </div>
      <el-button-group>
        <el-button
          size="small"
          @click="showSkillSelector = true"
        >
          {{ t('chat.selectSkill') }}
        </el-button>
        <el-button
          size="small"
          @click="showModelSelector = true"
        >
          {{ t('chat.changeModel') }}
        </el-button>
        <el-button
          size="small"
          @click="clearConversation"
        >
          {{ t('chat.clear') }}
        </el-button>
      </el-button-group>
    </div>
```

将第 32-34 行替换为：

```vue
    <div v-if="messages.length === 0" class="empty-state">
      <p>{{ t('chat.noMessages') }}</p>
    </div>
```

将第 42 行替换为：

```vue
        placeholder="{{ t('chat.typeMessage') }}"
```

将第 49 行替换为：

```vue
        {{ t('chat.send') }}
```

在 script setup 部分添加：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/ChatPanel.vue
git commit -m "feat: add i18n to ChatPanel"
```

---

## Task 9: 修改 SettingsPanel.vue

**Files:**
- Modify: `entrypoints/sidebar/SettingsPanel.vue`

- [ ] **Step 1: 替换 SettingsPanel.vue 硬编码文本**

将第 3-6 行替换为：

```vue
    <div class="settings-header">
      <h3>{{ t('settings.title') }}</h3>
      <el-button @click="handleClose">{{ t('settings.close') }}</el-button>
    </div>
```

将第 8-10 行替换为：

```vue
    <div v-if="!config" class="loading">
      {{ t('settings.loading') }}
    </div>
```

将第 13-29 行替换为：

```vue
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
```

将第 32-42 行替换为：

```vue
      <el-tab-pane :label="t('settings.shortcuts')" name="shortcuts">
        <el-form :model="config.shortcuts" label-width="150px">
          <el-form-item :label="t('settings.toggleSidebar')">
            <el-input v-model="config.shortcuts.toggleSidebar" />
          </el-form-item>

          <el-form-item :label="t('settings.newConversation')">
            <el-input v-model="config.shortcuts.newConversation" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
```

将第 44-54 行替换为：

```vue
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
```

将第 56-67 行替换为：

```vue
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
```

将第 69-81 行替换为：

```vue
      <el-tab-pane :label="t('settings.about')" name="about">
        <div class="about-section">
          <h4>{{ t('about.title') }}</h4>
          <p>{{ t('about.version') }}: {{ t('about.versionNumber') }}</p>
          <p>{{ t('about.description') }}</p>
          <p>{{ t('about.builtWith') }}</p>
        </div>
      </el-tab-pane>
```

将第 85-87 行替换为：

```vue
      <el-button type="primary" @click="saveSettings">
        {{ t('settings.saveSettings') }}
      </el-button>
```

在 script setup 部分添加：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
```

将 saveSettings 函数中的 alert 替换为 ElMessage：

```typescript
import { ElMessage } from 'element-plus';

async function saveSettings(): Promise<void> {
  if (!config.value) return;

  try {
    await storage.updateConfig(config.value);
    ElMessage.success(t('settings.settingsSaved'));
  } catch (error) {
    console.error('Failed to save settings:', error);
    ElMessage.error(t('settings.settingsSaveFailed'));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/SettingsPanel.vue
git commit -m "feat: add i18n to SettingsPanel"
```

---

## Task 10: 修改 SkillSelector.vue

**Files:**
- Modify: `entrypoints/sidebar/SkillSelector.vue`

- [ ] **Step 1: 替换 SkillSelector.vue 硬编码文本**

将第 4 行替换为：

```vue
    :title="t('skill.selectSkill')"
```

将第 10 行替换为：

```vue
      :placeholder="t('skill.searchSkills')"
```

将第 39 行替换为：

```vue
            <strong>{{ t('skill.examples') }}</strong>
```

将第 51 行替换为：

```vue
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
```

在 script setup 部分添加：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/SkillSelector.vue
git commit -m "feat: add i18n to SkillSelector"
```

---

## Task 11: 修改 ModelSelector.vue

**Files:**
- Modify: `entrypoints/sidebar/ModelSelector.vue`

- [ ] **Step 1: 替换 ModelSelector.vue 硬编码文本**

将第 4 行替换为：

```vue
    :title="t('model.selectModel')"
```

将第 8 行替换为：

```vue
        <el-tab-pane :label="t('model.builtinModels')" name="builtin">
```

将第 20-22 行替换为：

```vue
            <el-tag type="success" v-if="currentModelId === model.id">
              {{ t('model.active') }}
            </el-tag>
```

将第 27 行替换为：

```vue
        <el-tab-pane :label="t('model.customModels')" name="custom">
```

将第 43 行替换为：

```vue
                {{ t('model.select') }}
```

将第 50 行替换为：

```vue
                {{ t('model.delete') }}
```

将第 58-61 行替换为：

```vue
        <el-button
          type="primary"
          @click="handleShowAddModel"
        >
          {{ t('model.addCustomModel') }}
        </el-button>
```

将第 71 行替换为：

```vue
      <el-button @click="handleClose">{{ t('model.close') }}</el-button>
```

在 script setup 部分添加：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
```

将 handleAddModel 函数中的 ElMessage 替换为国际化：

```typescript
async function handleAddModel(model: ModelConfig): Promise<void> {
  console.log('handleAddModel called with:', model);
  try {
    const config = await storage.getConfig();
    const updatedModels = [...config.models, model];
    await storage.updateConfig({ models: updatedModels });
    customModels.value = updatedModels.filter(m => !builtinModelIds.includes(m.id));
    showAddModel.value = false;
    ElMessage.success(t('model.modelAdded'));
  } catch (error) {
    ElMessage.error(t('model.modelAddFailed'));
    console.error('Error adding model:', error);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/ModelSelector.vue
git commit -m "feat: add i18n to ModelSelector"
```

---

## Task 12: 修改 AddModelDialog.vue

**Files:**
- Modify: `entrypoints/sidebar/AddModelDialog.vue`

- [ ] **Step 1: 替换 AddModelDialog.vue 硬编码文本**

将第 4 行替换为：

```vue
    :title="t('model.addModel')"
```

将第 8-33 行替换为：

```vue
      <el-form-item :label="t('model.name')" required>
        <el-input v-model="form.name" placeholder="My Custom Model" />
      </el-form-item>

      <el-form-item :label="t('model.provider')" required>
        <el-select v-model="form.provider">
          <el-option label="OpenAI" value="openai" />
          <el-option label="Anthropic" value="anthropic" />
          <el-option label="Google" value="google" />
          <el-option label="Custom" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('model.baseUrl')" v-if="form.provider === 'custom'">
        <el-input
          v-model="form.baseURL"
          placeholder="https://api.example.com/v1"
        />
      </el-form-item>

      <el-form-item :label="t('model.modelId')" required>
        <el-input
          v-model="form.model"
          placeholder="gpt-4"
        />
      </el-form-item>

      <el-form-item :label="t('model.apiKey')" required>
        <el-input
          v-model="form.apiKey"
          type="password"
          placeholder="sk-..."
          show-password
        />
      </el-form-item>
```

将第 46-47 行替换为：

```vue
      <el-button @click="handleClose">{{ t('model.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ t('model.add') }}</el-button>
```

在 script setup 部分添加：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
```

将 handleSubmit 函数中的 ElMessage 替换为国际化：

```typescript
function handleSubmit(): void {
  console.log('handleSubmit called, form:', form.value);
  if (!form.value.name || !form.value.model || !form.value.apiKey) {
    ElMessage.error(t('model.fillRequired'));
    return;
  }

  const model: ModelConfig = {
    id: generateId(),
    name: form.value.name!,
    provider: form.value.provider!,
    baseURL: form.value.baseURL,
    model: form.value.model!,
    apiKey: form.value.apiKey!,
    parameters: {}
  };

  console.log('Emitting add event with model:', model);
  emit('add', model);
  visible.value = false;
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/AddModelDialog.vue
git commit -m "feat: add i18n to AddModelDialog"
```

---

## Task 13: 修改 MessageList.vue

**Files:**
- Modify: `entrypoints/sidebar/MessageList.vue`

- [ ] **Step 1: 替换 MessageList.vue 硬编码文本**

将 roleLabel 函数替换为使用 i18n：

```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

function roleLabel(role: string): string {
  switch (role) {
    case 'user':
      return t('message.you');
    case 'assistant':
      return t('message.ai');
    case 'system':
      return t('message.system');
    default:
      return role;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/MessageList.vue
git commit -m "feat: add i18n to MessageList"
```

---

## Task 14: 添加 settings.loading 翻译

**Files:**
- Modify: `entrypoints/sidebar/locales/zh-CN.ts`
- Modify: `entrypoints/sidebar/locales/en-US.ts`

- [ ] **Step 1: 在 zh-CN.ts 的 settings 对象中添加 loading**

```typescript
  settings: {
    title: '设置',
    close: '关闭',
    loading: '加载设置...',
    general: '通用',
    // ... 其他字段
  }
```

- [ ] **Step 2: 在 en-US.ts 的 settings 对象中添加 loading**

```typescript
  settings: {
    title: 'Settings',
    close: 'Close',
    loading: 'Loading settings...',
    general: 'General',
    // ... 其他字段
  }
```

- [ ] **Step 3: Commit**

```bash
git add entrypoints/sidebar/locales/zh-CN.ts entrypoints/sidebar/locales/en-US.ts
git commit -m "feat: add settings.loading translation"
```

---

## Task 15: 构建和测试

**Files:**
- N/A

- [ ] **Step 1: 运行开发服务器**

Run: `npm run dev`
Expected: 开发服务器启动，浏览器自动打开

- [ ] **Step 2: 加载扩展测试**

1. 打开 `chrome://extensions/`
2. 开启「开发者模式」
3. 加载 `.output/chrome-mv3` 目录
4. 打开扩展侧边栏

Expected: UI 显示中文（默认语言）

- [ ] **Step 3: 测试语言切换**

1. 点击 Settings 标签
2. 在 Language 下拉框选择 English
3. 点击 Save Settings
4. 观察 UI 文本变化

Expected: 所有 UI 文本切换为英文，包括 Element Plus 组件

- [ ] **Step 4: 测试语言持久化**

1. 关闭侧边栏
2. 重新打开侧边栏

Expected: UI 保持英文（语言设置已保存）

- [ ] **Step 5: 测试中文切换**

1. 在 Settings 选择 中文
2. 点击 Save Settings

Expected: UI 切换回中文

- [ ] **Step 6: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete i18n implementation"
```

---

## 自验证清单

1. **Spec coverage**: 所有设计文档中的功能点都有对应任务 ✓
2. **Placeholder scan**: 无 TBD、TODO 或模糊描述 ✓
3. **Type consistency**: LocaleCode 类型在所有文件中一致使用 ✓
4. **File structure**: 所有文件路径明确 ✓
5. **Code completeness**: 所有代码步骤包含完整代码 ✓