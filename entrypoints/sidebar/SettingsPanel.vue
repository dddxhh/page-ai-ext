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
              {{ t('settings.shortcutFormat') }}: Ctrl+Shift+O (Windows/Linux), Command+Shift+O
              (Mac)
            </el-text>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="shortcutError"
          type="error"
          :title="shortcutError"
          :closable="true"
          style="margin-top: 12px"
          @close="shortcutError = null"
        />
      </el-tab-pane>

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
        <SkillListPanel
          :skills="skills"
          @create="openEditor('create')"
          @toggle-enabled="handleToggleEnabled"
          @edit="openEditor('edit', $event)"
          @copy="openEditor('copy', $event)"
          @delete="handleDelete"
          @export="handleExport"
          @import="handleImport"
        />

        <SkillEditorDialog
          v-model:visible="editorVisible"
          :skill="editingSkill"
          :mode="editorMode"
          :skills="skills"
          @save="handleEditorSave"
        />
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

    <div v-if="config" class="settings-footer">
      <el-button type="primary" @click="saveSettings">
        {{ t('settings.saveSettings') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, ElMessageBox } from 'element-plus/es'
  import { storage } from '~/modules/storage'
  import { skillManager } from '~/modules/skill-manager'
  import { Config, Skill } from '~/types'
  import SkillListPanel from './components/SkillListPanel.vue'
  import SkillEditorDialog from './SkillEditorDialog.vue'
  import { useSkillImportExport } from './composables/useSkillImportExport'

  const { t } = useI18n()

  const activeTab = ref('general')
  const config = ref<Config | null>(null)
  const shortcutError = ref<string | null>(null)
  const skills = ref<Skill[]>([])
  const editorVisible = ref(false)
  const editorMode = ref<'create' | 'edit' | 'copy'>('create')
  const editingSkill = ref<Skill | undefined>()

  const { exportSkills, importSkills } = useSkillImportExport(loadSkills)

  const emit = defineEmits<{
    close: 'close'
  }>()

  onMounted(async () => {
    config.value = await storage.getConfig()
    await loadSkills()
  })

  async function loadSkills(): Promise<void> {
    skills.value = await skillManager.getAllSkills()
  }

  function openEditor(mode: 'create' | 'edit' | 'copy', skill?: Skill): void {
    editorMode.value = mode
    editingSkill.value = skill
    editorVisible.value = true
  }

  async function handleEditorSave(): Promise<void> {
    await loadSkills()
  }

  async function handleDelete(skill: Skill): Promise<void> {
    if (skill.isBuiltIn) return

    try {
      await ElMessageBox.confirm(
        t('skill.confirmDeleteMessage', { name: skill.name }),
        t('skill.confirmDelete'),
        {
          confirmButtonText: t('skill.delete'),
          cancelButtonText: t('skill.cancel'),
          type: 'warning',
          customClass: 'skill-delete-confirm-dialog',
        }
      )
      await skillManager.deleteSkill(skill.id)
      ElMessage.success(t('skill.deleteSuccess'))
      await loadSkills()
    } catch {
      // User cancelled deletion
    }
  }

  async function handleToggleEnabled(skill: Skill): Promise<void> {
    await skillManager.toggleSkillEnabled(skill.id)
    await loadSkills()
    ElMessage.success(skill.enabled ? t('skill.disableSkill') : t('skill.enableSkill'))
  }

  async function handleExport(): Promise<void> {
    await exportSkills(() => storage.exportSkills())
  }

  async function handleImport(): Promise<void> {
    await importSkills((importedSkills) => storage.importSkills(importedSkills))
  }

  async function saveSettings(): Promise<void> {
    if (!config.value) return

    try {
      if (!validateShortcuts()) {
        return
      }

      await storage.updateConfig(config.value)
      ElMessage.success(t('settings.settingsSaved'))
    } catch (error) {
      console.error('Failed to save settings:', error)
      ElMessage.error(t('settings.settingsSaveFailed'))
    }
  }

  function validateShortcuts(): boolean {
    if (!config.value) return false

    const { toggleSidebar, newConversation } = config.value.shortcuts

    const shortcutPattern =
      /^(Ctrl|Command|Cmd|Alt|Meta|Shift)(\+(Ctrl|Command|Cmd|Alt|Meta|Shift))*\+([A-Za-z0-9])$/

    if (toggleSidebar && !shortcutPattern.test(toggleSidebar)) {
      shortcutError.value = t('settings.invalidShortcutFormat') + ': ' + t('settings.toggleSidebar')
      return false
    }

    if (newConversation && !shortcutPattern.test(newConversation)) {
      shortcutError.value =
        t('settings.invalidShortcutFormat') + ': ' + t('settings.newConversation')
      return false
    }

    if (toggleSidebar && newConversation && toggleSidebar === newConversation) {
      shortcutError.value = t('settings.shortcutConflict')
      return false
    }

    shortcutError.value = null
    return true
  }

  function handleClose(): void {
    emit('close')
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

  .loading {
    color: #999;
    text-align: center;
    padding: 20px;
  }

  .about-section h4 {
    margin: 0 0 8px 0;
  }

  .about-section p {
    margin: 8px 0;
    color: #666;
  }
</style>
