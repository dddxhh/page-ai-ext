# 技能管理模块实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善技能设置模块，支持在线新增、编辑、删除自定义技能，保护内置技能不被修改。

**Architecture:** 在 SettingsPanel.vue 技能标签页内展示技能卡片列表，点击操作按钮弹出 SkillEditorDialog.vue 编辑对话框。使用 skillManager 和 storage 模块进行数据持久化。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + WXT (Chrome Extension MV3)

---

## 文件结构

| 文件                                        | 操作 | 说明                               |
| ------------------------------------------- | ---- | ---------------------------------- |
| `types/index.ts`                            | 修改 | 添加 `updatedAt` 字段到 Skill 类型 |
| `entrypoints/sidebar/locales/zh-CN.ts`      | 修改 | 添加中文国际化字段                 |
| `entrypoints/sidebar/locales/en-US.ts`      | 修改 | 添加英文国际化字段                 |
| `entrypoints/sidebar/SkillEditorDialog.vue` | 创建 | 技能编辑对话框组件                 |
| `entrypoints/sidebar/SettingsPanel.vue`     | 修改 | 重构技能标签页，展示技能列表       |

---

### Task 1: 更新 Skill 类型定义

**Files:**

- Modify: `types/index.ts:67-75`

- [ ] **Step 1: 添加 updatedAt 字段**

修改 `types/index.ts` 中的 Skill 接口：

```typescript
export interface Skill {
  id: string
  name: string
  description: string
  systemPrompt: string
  metadata: SkillMetadata
  isBuiltIn: boolean
  createdAt: number
  updatedAt?: number
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run lint`
Expected: No errors related to types

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "types: add updatedAt field to Skill interface"
```

---

### Task 2: 添加中文国际化字段

**Files:**

- Modify: `entrypoints/sidebar/locales/zh-CN.ts:78-83`

- [ ] **Step 1: 扩展 skill 字段**

修改 `entrypoints/sidebar/locales/zh-CN.ts`，替换 skill 部分：

```typescript
  skill: {
    selectSkill: '选择技能',
    searchSkills: '搜索技能...',
    examples: '示例',
    cancel: '取消',
    add: '新增技能',
    edit: '编辑',
    copy: '复制',
    delete: '删除',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除技能 "{name}" 吗？此操作不可撤销。',
    builtIn: '内置',
    custom: '自定义',
    saveSuccess: '技能保存成功',
    deleteSuccess: '技能删除成功',
    operationFailed: '操作失败',
    editorTitle: '编辑技能',
    createTitle: '新增技能',
    copyTitle: '复制技能',
    basicInfo: '基础信息',
    systemPrompt: '系统提示词',
    metadata: '元数据',
    nameRequired: '请输入技能名称',
    nameMinLength: '名称至少需要 2 个字符',
    nameDuplicate: '技能名称已存在',
    descriptionRequired: '请输入描述',
    descriptionMinLength: '描述至少需要 10 个字符',
    promptRequired: '请输入系统提示词',
    promptMinLength: '系统提示词至少需要 20 个字符',
    idFormat: 'ID 格式错误：需以字母开头，只能包含字母、数字、下划线和横线',
    versionFormat: '版本号格式错误：如 1.0.0',
    noEditBuiltIn: '内置技能不可编辑',
    noDeleteBuiltIn: '内置技能不可删除',
    searchPlaceholder: '搜索技能...',
    categoryFilter: '分类筛选',
    allCategories: '全部',
    name: '名称',
    description: '描述',
    category: '分类',
    author: '作者',
    version: '版本',
    tags: '标签',
    examplesLabel: '使用示例',
    addTag: '添加标签',
    addExample: '添加示例',
    save: '保存',
    generatingId: '正在生成 ID...',
    copiedName: '{name} - 副本',
  },
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/locales/zh-CN.ts
git commit -m "i18n: add skill management zh-CN translations"
```

---

### Task 3: 添加英文国际化字段

**Files:**

- Modify: `entrypoints/sidebar/locales/en-US.ts:78-83`

- [ ] **Step 1: 扩展 skill 字段**

修改 `entrypoints/sidebar/locales/en-US.ts`，添加对应英文翻译：

```typescript
  skill: {
    selectSkill: 'Select Skill',
    searchSkills: 'Search skills...',
    examples: 'Examples',
    cancel: 'Cancel',
    add: 'Add Skill',
    edit: 'Edit',
    copy: 'Copy',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete skill "{name}"? This action cannot be undone.',
    builtIn: 'Built-in',
    custom: 'Custom',
    saveSuccess: 'Skill saved successfully',
    deleteSuccess: 'Skill deleted successfully',
    operationFailed: 'Operation failed',
    editorTitle: 'Edit Skill',
    createTitle: 'Create Skill',
    copyTitle: 'Copy Skill',
    basicInfo: 'Basic Info',
    systemPrompt: 'System Prompt',
    metadata: 'Metadata',
    nameRequired: 'Please enter skill name',
    nameMinLength: 'Name must be at least 2 characters',
    nameDuplicate: 'Skill name already exists',
    descriptionRequired: 'Please enter description',
    descriptionMinLength: 'Description must be at least 10 characters',
    promptRequired: 'Please enter system prompt',
    promptMinLength: 'System prompt must be at least 20 characters',
    idFormat: 'Invalid ID format: must start with letter, contain only letters, numbers, underscores and hyphens',
    versionFormat: 'Invalid version format: e.g., 1.0.0',
    noEditBuiltIn: 'Built-in skills cannot be edited',
    noDeleteBuiltIn: 'Built-in skills cannot be deleted',
    searchPlaceholder: 'Search skills...',
    categoryFilter: 'Category Filter',
    allCategories: 'All',
    name: 'Name',
    description: 'Description',
    category: 'Category',
    author: 'Author',
    version: 'Version',
    tags: 'Tags',
    examplesLabel: 'Examples',
    addTag: 'Add Tag',
    addExample: 'Add Example',
    save: 'Save',
    generatingId: 'Generating ID...',
    copiedName: '{name} - Copy',
  },
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/sidebar/locales/en-US.ts
git commit -m "i18n: add skill management en-US translations"
```

---

### Task 4: 创建 SkillEditorDialog.vue 组件

**Files:**

- Create: `entrypoints/sidebar/SkillEditorDialog.vue`

- [ ] **Step 1: 创建组件基础结构**

创建 `entrypoints/sidebar/SkillEditorDialog.vue`：

```vue
<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="700px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-divider content-position="left">{{ t('skill.basicInfo') }}</el-divider>

      <el-form-item :label="t('skill.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('skill.nameRequired')" />
      </el-form-item>

      <el-form-item :label="t('skill.description')" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          :placeholder="t('skill.descriptionRequired')"
        />
      </el-form-item>

      <el-form-item :label="t('skill.category')">
        <el-input v-model="formData.metadata.category" placeholder="e.g., Analysis" />
      </el-form-item>

      <el-divider content-position="left">{{ t('skill.systemPrompt') }}</el-divider>

      <el-form-item :label="t('skill.systemPrompt')" prop="systemPrompt">
        <el-input
          v-model="formData.systemPrompt"
          type="textarea"
          :rows="6"
          :placeholder="t('skill.promptRequired')"
        />
      </el-form-item>

      <el-divider content-position="left">{{ t('skill.metadata') }}</el-divider>

      <el-form-item :label="t('skill.author')">
        <el-input v-model="formData.metadata.author" placeholder="Author name" />
      </el-form-item>

      <el-form-item :label="t('skill.version')" prop="version">
        <el-input v-model="formData.metadata.version" placeholder="e.g., 1.0.0" />
      </el-form-item>

      <el-form-item :label="t('skill.tags')">
        <el-select
          v-model="formData.metadata.tags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Add tags"
        >
          <el-option v-for="tag in formData.metadata.tags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('skill.examplesLabel')">
        <div class="examples-list">
          <div
            v-for="(example, index) in formData.metadata.examples"
            :key="index"
            class="example-item"
          >
            <el-input v-model="formData.metadata.examples[index]" placeholder="Example usage" />
            <el-button type="danger" size="small" @click="removeExample(index)">
              {{ t('skill.delete') }}
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addExample">
            {{ t('skill.addExample') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ t('skill.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus/es'
  import { skillManager } from '~/modules/skill-manager'
  import { Skill, SkillMetadata } from '~/types'

  const { t } = useI18n()

  interface Props {
    skill?: Skill
    mode: 'create' | 'edit' | 'copy'
    skills: Skill[]
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'create',
    skills: () => [],
  })

  const visible = defineModel<boolean>('visible', { default: false })
  const emit = defineEmits<{
    save: []
  }>()

  const formRef = ref<FormInstance>()
  const saving = ref(false)

  const defaultMetadata: SkillMetadata = {
    author: '',
    version: '1.0.0',
    tags: [],
    examples: [],
    category: '',
  }

  const formData = ref<Skill>({
    id: '',
    name: '',
    description: '',
    systemPrompt: '',
    metadata: { ...defaultMetadata },
    isBuiltIn: false,
    createdAt: Date.now(),
  })

  const dialogTitle = computed(() => {
    switch (props.mode) {
      case 'create':
        return t('skill.createTitle')
      case 'edit':
        return t('skill.editorTitle')
      case 'copy':
        return t('skill.copyTitle')
      default:
        return t('skill.createTitle')
    }
  })

  const validateNameUnique = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error(t('skill.nameRequired')))
      return
    }
    if (value.length < 2) {
      callback(new Error(t('skill.nameMinLength')))
      return
    }
    const existing = props.skills.find((s) => s.name === value && s.id !== formData.value.id)
    if (existing) {
      callback(new Error(t('skill.nameDuplicate')))
      return
    }
    callback()
  }

  const validateVersion = (rule: any, value: string, callback: any) => {
    if (value && !/^\d+\.\d+\.\d+$/.test(value)) {
      callback(new Error(t('skill.versionFormat')))
      return
    }
    callback()
  }

  const formRules: FormRules = {
    name: [{ validator: validateNameUnique, trigger: 'blur' }],
    description: [
      { required: true, message: t('skill.descriptionRequired'), trigger: 'blur' },
      { min: 10, message: t('skill.descriptionMinLength'), trigger: 'blur' },
    ],
    systemPrompt: [
      { required: true, message: t('skill.promptRequired'), trigger: 'blur' },
      { min: 20, message: t('skill.promptMinLength'), trigger: 'blur' },
    ],
    version: [{ validator: validateVersion, trigger: 'blur' }],
  }

  function generateId(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20)
    const timestamp = Date.now().toString(36)
    return `${base}-${timestamp}`
  }

  function addExample(): void {
    formData.value.metadata.examples.push('')
  }

  function removeExample(index: number): void {
    formData.value.metadata.examples.splice(index, 1)
  }

  watch(visible, (val) => {
    if (val) {
      if (props.mode === 'edit' && props.skill) {
        formData.value = { ...props.skill, updatedAt: Date.now() }
      } else if (props.mode === 'copy' && props.skill) {
        formData.value = {
          ...props.skill,
          id: '',
          name: t('skill.copiedName', { name: props.skill.name }),
          isBuiltIn: false,
          createdAt: Date.now(),
          updatedAt: undefined,
        }
      } else {
        formData.value = {
          id: '',
          name: '',
          description: '',
          systemPrompt: '',
          metadata: { ...defaultMetadata },
          isBuiltIn: false,
          createdAt: Date.now(),
        }
      }
    }
  })

  async function handleSave(): Promise<void> {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    saving.value = true

    try {
      if (!formData.value.id) {
        formData.value.id = generateId(formData.value.name)
      }

      formData.value.metadata.examples = formData.value.metadata.examples.filter((e) => e.trim())

      await skillManager.saveSkill(formData.value)
      ElMessage.success(t('skill.saveSuccess'))
      emit('save')
      handleClose()
    } catch (error) {
      console.error('Failed to save skill:', error)
      ElMessage.error(t('skill.operationFailed'))
    } finally {
      saving.value = false
    }
  }

  function handleClose(): void {
    visible.value = false
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .example-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .example-item .el-input {
    flex: 1;
  }
</style>
```

- [ ] **Step 2: 运行 lint 检查**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add entrypoints/sidebar/SkillEditorDialog.vue
git commit -m "feat: add SkillEditorDialog component for skill CRUD"
```

---

### Task 5: 重构 SettingsPanel.vue 技能标签页

**Files:**

- Modify: `entrypoints/sidebar/SettingsPanel.vue:80-91`

- [ ] **Step 1: 添加导入和状态**

在 `<script setup>` 部分添加：

```typescript
import { skillManager } from '~/modules/skill-manager'
import { Skill } from '~/types'
import SkillEditorDialog from './SkillEditorDialog.vue'

const skills = ref<Skill[]>([])
const filteredSkills = ref<Skill[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const editorVisible = ref(false)
const editorMode = ref<'create' | 'edit' | 'copy'>('create')
const editingSkill = ref<Skill | undefined>()
const categories = ref<string[]>([])
```

- [ ] **Step 2: 添加数据加载逻辑**

在 `onMounted` 中添加：

```typescript
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
      skill.metadata.tags.some((tag) => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
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
```

需要添加 `ElMessageBox` 导入：

```typescript
import { ElMessage, ElMessageBox } from 'element-plus/es'
```

- [ ] **Step 3: 重构技能标签页模板**

替换 `el-tab-pane` 技能部分（第 80-91 行）：

```vue
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
                  v-for="tag in skill.metadata.tags.slice(0, 3)"
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
                <el-button
                  v-else
                  size="small"
                  type="danger"
                  @click="handleDelete(skill)"
                >
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
```

- [ ] **Step 4: 添加样式**

在 `<style scoped>` 部分添加：

```css
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
```

- [ ] **Step 5: 运行 lint 检查**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 6: 运行开发服务器验证**

Run: `npm run dev`
Expected: Extension builds successfully, no runtime errors in console

- [ ] **Step 7: Commit**

```bash
git add entrypoints/sidebar/SettingsPanel.vue
git commit -m "feat: implement skill management UI with CRUD operations"
```

---

### Task 6: 运行完整测试

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 2: 运行测试**

Run: `npm run test:run`
Expected: All tests pass

- [ ] **Step 3: 运行构建**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: 手动测试清单**

在 Chrome 中加载扩展后验证：

1. 新增技能：填写表单，保存成功，列表显示新技能
2. 编辑技能：修改字段，保存成功，更新显示
3. 复制技能：生成新技能，名称带"-副本"
4. 删除技能：确认对话框，删除成功
5. 内置技能：编辑/删除按钮禁用，复制可用
6. 搜索功能：输入关键词过滤列表
7. 分类筛选：选择分类过滤列表
8. 国际化：切换语言显示正确翻译

---

## 自检清单

**1. Spec coverage:**

- [x] 编辑字段范围 → Task 4 SkillEditorDialog.vue
- [x] 内置技能保护 → Task 5 禁用按钮 + Tooltip
- [x] 新增方式 → Task 5 openEditor('create')
- [x] 复制功能 → Task 5 openEditor('copy')
- [x] 删除确认 → Task 5 ElMessageBox.confirm
- [x] UI布局 → Task 5 技能卡片列表 + 对话框
- [x] 验证规则 → Task 4 formRules
- [x] 国际化 → Task 2, Task 3

**2. Placeholder scan:** 无 TBD、TODO 等占位符

**3. Type consistency:** Skill、SkillMetadata 类型在所有任务中一致使用
