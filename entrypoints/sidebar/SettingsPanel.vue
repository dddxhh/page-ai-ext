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
        <div class="skills-header">
          <el-input
            v-model="searchQuery"
            :placeholder="t('skill.searchPlaceholder')"
            clearable
            style="width: 200px"
            @input="handleSearch"
          />
          <el-select
            v-model="selectedCategory"
            :placeholder="t('skill.categoryFilter')"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option :label="t('skill.allCategories')" value="" />
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
          <el-button type="primary" @click="openEditor('create')">
            {{ t('skill.add') }}
          </el-button>
        </div>

        <el-scrollbar max-height="300px">
          <div class="skill-cards">
            <div v-for="skill in filteredSkills" :key="skill.id" class="skill-card">
              <div class="skill-card-header">
                <span class="skill-name">{{ skill.name }}</span>
                <el-tag size="small" :type="skill.isBuiltIn ? 'info' : 'success'">
                  {{ skill.isBuiltIn ? t('skill.builtIn') : t('skill.custom') }}
                </el-tag>
              </div>
              <p class="skill-card-desc">{{ skill.description }}</p>
              <div class="skill-card-meta">
                <el-tag v-if="skill.metadata.category" size="small" type="warning">
                  {{ skill.metadata.category }}
                </el-tag>
                <el-tag
                  v-for="tag in (Array.isArray(skill.metadata.tags)
                    ? skill.metadata.tags
                    : []
                  ).slice(0, 3)"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="skill-card-actions">
                <el-tooltip
                  v-if="skill.isBuiltIn"
                  :content="t('skill.noEditBuiltIn')"
                  placement="top"
                >
                  <el-button size="small" disabled>{{ t('skill.edit') }}</el-button>
                </el-tooltip>
                <el-button v-else size="small" @click="openEditor('edit', skill)">
                  {{ t('skill.edit') }}
                </el-button>
                <el-button size="small" @click="openEditor('copy', skill)">
                  {{ t('skill.copy') }}
                </el-button>
                <el-tooltip
                  v-if="skill.isBuiltIn"
                  :content="t('skill.noDeleteBuiltIn')"
                  placement="top"
                >
                  <el-button size="small" type="danger" disabled>
                    {{ t('skill.delete') }}
                  </el-button>
                </el-tooltip>
                <el-button v-else size="small" type="danger" @click="handleDelete(skill)">
                  {{ t('skill.delete') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <div class="skills-footer">
          <el-button type="primary" @click="exportSkills">
            {{ t('settings.exportSkills') }}
          </el-button>
          <el-button @click="importSkills">
            {{ t('settings.importSkills') }}
          </el-button>
        </div>

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
  import SkillEditorDialog from './SkillEditorDialog.vue'

  const { t } = useI18n()

  const activeTab = ref('general')
  const config = ref<Config | null>(null)
  const shortcutError = ref<string | null>(null)
  const skills = ref<Skill[]>([])
  const filteredSkills = ref<Skill[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const editorVisible = ref(false)
  const editorMode = ref<'create' | 'edit' | 'copy'>('create')
  const editingSkill = ref<Skill | undefined>()
  const categories = ref<string[]>([])

  const emit = defineEmits<{
    close: 'close'
  }>()

  onMounted(async () => {
    config.value = await storage.getConfig()
    await loadSkills()
  })

  async function loadSkills(): Promise<void> {
    skills.value = await skillManager.getAllSkills()
    filteredSkills.value = skills.value
    const cats = new Set(skills.value.map((s) => s.metadata.category))
    categories.value = Array.from(cats).filter((c) => c)
  }

  async function handleSearch(): Promise<void> {
    filteredSkills.value = skills.value.filter((skill) => {
      const matchesQuery =
        !searchQuery.value ||
        skill.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (Array.isArray(skill.metadata.tags) &&
          skill.metadata.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.value.toLowerCase())
          ))
      const matchesCategory =
        !selectedCategory.value || skill.metadata.category === selectedCategory.value
      return matchesQuery && matchesCategory
    })
  }

  function openEditor(mode: 'create' | 'edit' | 'copy', skill?: Skill): void {
    editorMode.value = mode
    editingSkill.value = skill
    editorVisible.value = true
  }

  async function handleEditorSave(): Promise<void> {
    await loadSkills()
    await handleSearch()
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
        }
      )
      await skillManager.deleteSkill(skill.id)
      ElMessage.success(t('skill.deleteSuccess'))
      await loadSkills()
      await handleSearch()
    } catch {
      // User cancelled or error
    }
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

  async function exportSkills(): Promise<void> {
    const skills = await storage.exportSkills()
    const blob = new Blob([JSON.stringify(skills, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'skills.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importSkills(): Promise<void> {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      const skills = JSON.parse(text)
      await storage.importSkills(skills)
      ElMessage.success(t('settings.skillsImported'))
    }

    input.click()
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

  .skills-section {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .skills-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }

  .skill-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skill-card {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }

  .skill-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .skill-name {
    font-weight: 600;
    font-size: 14px;
  }

  .skill-card-desc {
    color: #666;
    font-size: 12px;
    margin: 8px 0;
    line-height: 1.4;
  }

  .skill-card-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .skill-card-actions {
    display: flex;
    gap: 8px;
  }

  .skills-footer {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
  }

  .about-section h4 {
    margin: 0 0 8px 0;
  }

  .about-section p {
    margin: 8px 0;
    color: #666;
  }
</style>
