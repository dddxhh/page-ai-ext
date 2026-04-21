# 技能增强实现计划 - 禁用/启用 + Markdown 支持

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为技能系统添加禁用/启用控制和 YAML + Markdown 渲染支持

**Architecture:** 在现有 Skill 类型中添加 enabled 字段，使用 js-yaml 解析 YAML front matter，复用 marked + DOMPurify 渲染 Markdown

**Tech Stack:** Vue 3 + TypeScript + Element Plus + js-yaml + marked + DOMPurify

---

## 文件结构

| 文件                                        | 操作 | 职责                             |
| ------------------------------------------- | ---- | -------------------------------- |
| `types/index.ts`                            | 修改 | 添加 `enabled` 字段到 Skill 类型 |
| `modules/storage.ts`                        | 修改 | 添加数据迁移逻辑                 |
| `modules/skill-manager.ts`                  | 修改 | 添加 `toggleSkillEnabled()` 方法 |
| `skills/built-in-skills.ts`                 | 修改 | 内置技能添加 `enabled: true`     |
| `entrypoints/sidebar/SkillEditorDialog.vue` | 修改 | 添加启用开关 + MD 实时预览       |
| `entrypoints/sidebar/SettingsPanel.vue`     | 修改 | 添加启用/禁用开关 + MD 描述渲染  |
| `entrypoints/sidebar/SkillSelector.vue`     | 修改 | 禁用技能灰色显示 + 点击提示      |
| `entrypoints/sidebar/locales/zh-CN.ts`      | 修改 | 添加新国际化字段                 |
| `entrypoints/sidebar/locales/en-US.ts`      | 修改 | 添加新国际化字段                 |
| `package.json`                              | 修改 | 添加 js-yaml 依赖                |
| `tests/modules/skill-manager.test.ts`       | 修改 | 添加 enabled 相关测试            |

---

## Task 1: 添加 js-yaml 依赖

**Files:**

- Modify: `package.json`

- [ ] **Step 1: 安装 js-yaml**

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

- [ ] **Step 2: 验证安装成功**

```bash
npm ls js-yaml
```

Expected: `js-yaml@x.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add js-yaml dependency for YAML front matter parsing"
```

---

## Task 2: 修改 Skill 类型添加 enabled 字段

**Files:**

- Modify: `types/index.ts:67-76`

- [ ] **Step 1: 添加 enabled 字段**

修改 `types/index.ts` 中的 Skill 接口：

```typescript
export interface Skill {
  id: string
  name: string
  description: string
  systemPrompt: string
  metadata: SkillMetadata
  isBuiltIn: boolean
  enabled: boolean // 新增：默认 true
  createdAt: number
  updatedAt?: number
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add enabled field to Skill type"
```

---

## Task 3: 修改内置技能定义

**Files:**

- Modify: `skills/built-in-skills.ts`

- [ ] **Step 1: 为所有内置技能添加 enabled: true**

修改 `skills/built-in-skills.ts`，在每个技能对象中添加 `enabled: true`：

```typescript
import { Skill } from '../types'

export const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'content-analyst',
    name: 'Content Analyst',
    description: 'Analyze and summarize page content',
    systemPrompt: `You are a content analyst. Your role is to:
1. Extract key information from the page
2. Summarize the main points
3. Identify important details
4. Answer questions about the content

Focus on accuracy and clarity.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['analysis', 'summary', 'content'],
      examples: ['Summarize this article', 'What are the key points?', 'Extract all links'],
      category: 'Analysis',
    },
    isBuiltIn: true,
    enabled: true, // 新增
    createdAt: Date.now(),
  },
  {
    id: 'form-filler',
    name: 'Form Filler',
    description: 'Help fill out forms on the page',
    systemPrompt: `You are a form filling assistant. Your role is to:
1. Identify form fields on the page
2. Understand what information is needed
3. Help the user fill forms efficiently
4. Validate form data before submission

Always ask for confirmation before submitting.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['forms', 'automation'],
      examples: [
        'Fill out this registration form',
        'Complete the checkout process',
        'Submit this application',
      ],
      category: 'Automation',
    },
    isBuiltIn: true,
    enabled: true, // 新增
    createdAt: Date.now(),
  },
  {
    id: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract structured data from the page',
    systemPrompt: `You are a data extraction specialist. Your role is to:
1. Identify structured data on the page
2. Extract data in an organized format
3. Handle tables, lists, and other structures
4. Provide data in JSON or CSV format

Focus on accuracy and completeness.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['data', 'extraction', 'scraping'],
      examples: [
        'Extract all product information',
        'Get the table data as JSON',
        'List all contact information',
      ],
      category: 'Data',
    },
    isBuiltIn: true,
    enabled: true, // 新增
    createdAt: Date.now(),
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add skills/built-in-skills.ts
git commit -m "feat: add enabled field to built-in skills"
```

---

## Task 4: 添加数据迁移逻辑

**Files:**

- Modify: `modules/storage.ts:121-123`

- [ ] **Step 1: 修改 getAllSkills 方法添加迁移逻辑**

修改 `modules/storage.ts` 的 `getAllSkills` 方法：

```typescript
async getAllSkills(): Promise<Skill[]> {
  const skills = (await this.get<Skill[]>(STORAGE_KEYS.SKILLS)) || []
  // 数据迁移：为旧数据添加 enabled 字段
  return skills.map(skill => ({
    ...skill,
    enabled: skill.enabled ?? true,
  }))
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/storage.ts
git commit -m "feat: add data migration for enabled field in skills"
```

---

## Task 5: 添加 toggleSkillEnabled 方法

**Files:**

- Modify: `modules/skill-manager.ts`

- [ ] **Step 1: 添加 toggleSkillEnabled 方法**

在 `modules/skill-manager.ts` 的 `SkillManager` 类中添加新方法：

```typescript
async toggleSkillEnabled(id: string): Promise<void> {
  await this.initialize()
  const skill = await storage.getSkill(id)
  if (!skill) return

  const updatedSkill = {
    ...skill,
    enabled: !skill.enabled,
    updatedAt: Date.now(),
  }
  await storage.saveSkill(updatedSkill)
}
```

完整修改后的文件：

```typescript
import { storage } from './storage'
import { Skill } from '../types'
import { BUILT_IN_SKILLS } from '../skills/built-in-skills'

class SkillManager {
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    const existingSkills = await storage.getAllSkills()
    const existingIds = new Set(existingSkills.map((s) => s.id))

    for (const skill of BUILT_IN_SKILLS) {
      if (!existingIds.has(skill.id)) {
        await storage.saveSkill(skill)
      }
    }

    this.initialized = true
  }

  async getAllSkills(): Promise<Skill[]> {
    await this.initialize()
    return await storage.getAllSkills()
  }

  async getSkill(id: string): Promise<Skill | null> {
    await this.initialize()
    return await storage.getSkill(id)
  }

  async saveSkill(skill: Skill): Promise<void> {
    await this.initialize()
    await storage.saveSkill(skill)
  }

  async deleteSkill(id: string): Promise<void> {
    await this.initialize()
    await storage.deleteSkill(id)
  }

  async importSkills(skills: Skill[]): Promise<void> {
    await this.initialize()
    await storage.importSkills(skills)
  }

  async exportSkills(): Promise<Skill[]> {
    await this.initialize()
    return await storage.exportSkills()
  }

  async searchSkills(query: string): Promise<Skill[]> {
    const skills = await this.getAllSkills()
    const lowerQuery = query.toLowerCase()

    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.metadata.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const skills = await this.getAllSkills()
    return skills.filter((skill) => skill.metadata.category === category)
  }

  async toggleSkillEnabled(id: string): Promise<void> {
    await this.initialize()
    const skill = await storage.getSkill(id)
    if (!skill) return

    const updatedSkill = {
      ...skill,
      enabled: !skill.enabled,
      updatedAt: Date.now(),
    }
    await storage.saveSkill(updatedSkill)
  }
}

export const skillManager = new SkillManager()
```

- [ ] **Step 2: Commit**

```bash
git add modules/skill-manager.ts
git commit -m "feat: add toggleSkillEnabled method to SkillManager"
```

---

## Task 6: 更新国际化文件

**Files:**

- Modify: `entrypoints/sidebar/locales/zh-CN.ts`
- Modify: `entrypoints/sidebar/locales/en-US.ts`

- [ ] **Step 1: 更新 zh-CN.ts**

在 `skill` 对象中添加新字段：

```typescript
skill: {
  // 现有字段保持不变，添加以下新字段
  enabled: '已启用',
  disabled: '已禁用',
  enableSkill: '启用技能',
  disableSkill: '禁用技能',
  skillDisabled: '此技能已禁用',
  disabledHint: '禁用后，该技能将不会出现在技能选择器中',
  preview: '预览',
  edit: '编辑',
  copy: '复制',
  delete: '删除',
  // ... 其他现有字段
}
```

完整的 skill 部分更新：

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
  enabled: '已启用',
  disabled: '已禁用',
  enabledStatus: '启用状态',
  enableSkill: '启用技能',
  disableSkill: '禁用技能',
  skillDisabled: '此技能已禁用',
  disabledHint: '禁用后，该技能将不会出现在技能选择器中',
  preview: '预览',
},
```

- [ ] **Step 2: 更新 en-US.ts**

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
  confirmDeleteMessage:
    'Are you sure you want to delete skill "{name}"? This action cannot be undone.',
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
  idFormat:
    'Invalid ID format: must start with letter, contain only letters, numbers, underscores and hyphens',
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
  enabled: 'Enabled',
  disabled: 'Disabled',
  enabledStatus: 'Enable Status',
  enableSkill: 'Enable Skill',
  disableSkill: 'Disable Skill',
  skillDisabled: 'This skill is disabled',
  disabledHint: 'When disabled, this skill will not appear in the skill selector',
  preview: 'Preview',
},
```

- [ ] **Step 3: Commit**

```bash
git add entrypoints/sidebar/locales/zh-CN.ts entrypoints/sidebar/locales/en-US.ts
git commit -m "feat: add i18n keys for skill enabled/disabled and preview"
```

---

## Task 7: 修改 SkillEditorDialog.vue 添加左侧编辑+右侧完整 SKILL.md 预览

**Files:**

- Modify: `entrypoints/sidebar/SkillEditorDialog.vue`

**布局设计：**

```
┌──────────────────────────────────────────────────────────────────┐
│ 标题栏: 新增技能/编辑技能/复制技能                                    │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┬────────────────────────────────────┐│
│ │ 编辑表单 (左侧 45%)      │ 完整 SKILL.md 预览 (右侧 55%)      ││
│ │                         │                                    ││
│ │ 名称: [输入框]           │ ---                                ││
│ │ 描述: [textarea]         │ name: xxx                          ││
│ │ 分类: [输入框]           │ description: xxx                   ││
│ │ 作者: [输入框]           │ category: xxx  (有值才显示)        ││
│ │ 版本: [输入框]           │ author: xxx    (有值才显示)        ││
│ │ 标签: [多选]             │ version: 1.0.0 (有值才显示)        ││
│ │ 示例: [多条]             │ tags:          (有值才显示)        ││
│ │                         │ examples:       (有值才显示)        ││
│ │ 系统提示词: [textarea]   │ ---                                ││
│ │                         │                                    ││
│ │ ─────────────────────   │ # Title                            ││
│ │ 启用状态: [开关]         │ Markdown body...                   ││
│ │                         │                                    ││
│ │ [取消] [保存]            │                                    ││
│ └─────────────────────────┴────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

- [ ] **Step 1: 导入 js-yaml 并添加预览生成函数**

在 script setup 顶部添加：

```typescript
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import yaml from 'js-yaml'
```

- [ ] **Step 2: 添加 SKILL.md 格式预览生成函数**

```typescript
function generateSkillPreview(skill: Skill): string {
  const yamlFields: Record<string, any> = {
    name: skill.name,
    description: skill.description,
  }

  if (skill.metadata.category) yamlFields.category = skill.metadata.category
  if (skill.metadata.author) yamlFields.author = skill.metadata.author
  if (skill.metadata.version) yamlFields.version = skill.metadata.version
  if (skill.metadata.tags?.length) yamlFields.tags = skill.metadata.tags
  if (skill.metadata.examples?.length) yamlFields.examples = skill.metadata.examples

  const yamlContent = yaml.dump(yamlFields, { skipInvalid: true, indent: 2 })
  const markdownBody = skill.systemPrompt

  return `---\n${yamlContent}---\n\n${markdownBody}`
}

const skillPreviewHtml = computed(() => {
  const rawSkillMd = generateSkillPreview(formData.value)
  const rawHtml = marked(rawSkillMd) as string
  return DOMPurify.sanitize(rawHtml)
})
```

- [ ] **Step 3: 修改 formData 初始化添加 enabled 字段**

修改 `formData` ref：

```typescript
const formData = ref<Skill>({
  id: '',
  name: '',
  description: '',
  systemPrompt: '',
  metadata: { ...defaultMetadata },
  isBuiltIn: false,
  enabled: true,
  createdAt: Date.now(),
})
```

- [ ] **Step 4: 修改模板为左右分栏布局**

完整修改后的 template：

```vue
<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="900px" @close="handleClose">
    <div class="editor-layout">
      <div class="editor-left">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
          label-position="top"
        >
          <el-form-item :label="t('skill.name')" prop="name">
            <el-input v-model="formData.name" :placeholder="t('skill.nameRequired')" />
          </el-form-item>

          <el-form-item :label="t('skill.description')" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              :placeholder="t('skill.descriptionRequired')"
            />
          </el-form-item>

          <el-form-item :label="t('skill.category')">
            <el-input v-model="formData.metadata.category" placeholder="e.g., Analysis" />
          </el-form-item>

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
              <el-option
                v-for="tag in formData.metadata.tags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
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

          <el-divider />

          <el-form-item :label="t('skill.systemPrompt')" prop="systemPrompt">
            <el-input
              v-model="formData.systemPrompt"
              type="textarea"
              :rows="6"
              :placeholder="t('skill.promptRequired')"
            />
          </el-form-item>

          <el-divider />

          <el-form-item v-if="mode === 'edit'" :label="t('skill.enabledStatus')">
            <el-switch v-model="formData.enabled" />
            <el-text type="info" size="small" style="margin-left: 8px">
              {{ formData.enabled ? t('skill.enabled') : t('skill.disabled') }}
            </el-text>
          </el-form-item>
        </el-form>
      </div>

      <div class="editor-right">
        <div class="preview-header">{{ t('skill.preview') }}</div>
        <el-scrollbar class="preview-scroll">
          <div class="skill-md-preview" v-html="skillPreviewHtml"></div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ t('skill.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 5: 修改 watch 初始化逻辑**

更新 `watch` 中初始化逻辑：

```typescript
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
        enabled: true,
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
        enabled: true,
        createdAt: Date.now(),
      }
    }
  }
})
```

- [ ] **Step 6: 添加左右分栏布局样式**

完整修改后的 style：

```css
<style scoped>
  .editor-layout {
    display: flex;
    gap: 24px;
    min-height: 500px;
  }

  .editor-left {
    flex: 0 0 45%;
    overflow-y: auto;
    padding-right: 12px;
  }

  .editor-right {
    flex: 0 0 55%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--el-border-color);
    padding-left: 24px;
  }

  .preview-header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .preview-scroll {
    flex: 1;
  }

  .skill-md-preview {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
  }

  .skill-md-preview :deep(h1) {
    font-size: 18px;
    margin: 16px 0 8px 0;
    border-bottom: 1px solid var(--el-border-color);
    padding-bottom: 4px;
  }

  .skill-md-preview :deep(h2) {
    font-size: 16px;
    margin: 12px 0 6px 0;
  }

  .skill-md-preview :deep(h3) {
    font-size: 14px;
    margin: 8px 0 4px 0;
  }

  .skill-md-preview :deep(pre) {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
  }

  .skill-md-preview :deep(code) {
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
  }

  .skill-md-preview :deep(p code) {
    background: var(--el-fill-color);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .skill-md-preview :deep(ul),
  .skill-md-preview :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
  }

  .skill-md-preview :deep(li) {
    margin: 4px 0;
  }

  .skill-md-preview :deep(blockquote) {
    border-left: 4px solid var(--el-color-primary);
    padding-left: 12px;
    margin: 8px 0;
    color: var(--el-text-color-secondary);
  }

  .skill-md-preview :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
  }

  .skill-md-preview :deep(th),
  .skill-md-preview :deep(td) {
    border: 1px solid var(--el-border-color);
    padding: 8px;
    text-align: left;
  }

  .skill-md-preview :deep(th) {
    background: var(--el-fill-color);
    font-weight: 600;
  }

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

- [ ] **Step 7: Commit**

```bash
git add entrypoints/sidebar/SkillEditorDialog.vue
git commit -m "feat: redesign SkillEditorDialog with left-right layout and full SKILL.md preview"
```

---

## Task 8: 修改 SettingsPanel.vue 添加启用开关和 MD 渲染

**Files:**

- Modify: `entrypoints/sidebar/SettingsPanel.vue`

- [ ] **Step 1: 导入 MD 渲染工具**

在 script setup 中添加：

```typescript
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import yaml from 'js-yaml'
```

- [ ] **Step 2: 添加 MD 渲染函数**

```typescript
function renderSkillDescription(description: string): string {
  const yamlMatch = description.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (yamlMatch) {
    try {
      const metadata = yaml.load(yamlMatch[1]) as Record<string, any>
      const markdownBody = yamlMatch[2]
      const metadataHtml = Object.entries(metadata)
        .map(
          ([key, value]) =>
            `<span class="yaml-key">${key}:</span> <span class="yaml-value">${value}</span>`
        )
        .join(' | ')
      const bodyHtml = DOMPurify.sanitize(marked(markdownBody) as string)
      return `<div class="yaml-inline">${metadataHtml}</div>${bodyHtml}`
    } catch {
      return DOMPurify.sanitize(marked(description) as string)
    }
  }

  return DOMPurify.sanitize(marked(description) as string)
}
```

- [ ] **Step 3: 添加 toggleSkillEnabled 方法**

```typescript
async function toggleSkillEnabled(skill: Skill): Promise<void> {
  await skillManager.toggleSkillEnabled(skill.id)
  await loadSkills()
  await handleSearch()
  ElMessage.success(skill.enabled ? t('skill.disableSkill') : t('skill.enableSkill'))
}
```

- [ ] **Step 4: 修改技能卡片模板**

修改 skills tab 中的技能卡片部分（约 line 104-158）：

```vue
<el-scrollbar max-height="300px">
  <div class="skill-cards">
    <div 
      v-for="skill in filteredSkills" 
      :key="skill.id" 
      :class="['skill-card', { 'skill-card-disabled': !skill.enabled }]"
    >
      <div class="skill-card-header">
        <el-switch 
          v-model="skill.enabled" 
          size="small"
          @change="toggleSkillEnabled(skill)"
        />
        <span :class="['skill-name', { 'skill-name-disabled': !skill.enabled }]">{{ skill.name }}</span>
        <el-tag size="small" :type="skill.isBuiltIn ? 'info' : 'success'">
          {{ skill.isBuiltIn ? t('skill.builtIn') : t('skill.custom') }}
        </el-tag>
        <el-tag v-if="!skill.enabled" size="small" type="danger">
          {{ t('skill.disabled') }}
        </el-tag>
      </div>
      <p class="skill-card-desc" v-html="renderSkillDescription(skill.description)"></p>
      <div class="skill-card-meta">
        <el-tag v-if="skill.metadata.category" size="small" type="warning">
          {{ skill.metadata.category }}
        </el-tag>
        <el-tag
          v-for="tag in (Array.isArray(skill.metadata.tags) ? skill.metadata.tags : []).slice(0, 3)"
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
```

- [ ] **Step 5: 添加禁用状态样式**

在 style 中添加：

```css
.skill-card-disabled {
  opacity: 0.6;
}

.skill-name-disabled {
  text-decoration: line-through;
}

.skill-card-desc :deep(code) {
  background: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
}

.skill-card-desc :deep(pre) {
  background: var(--el-fill-color-dark);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.yaml-inline {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  font-family: monospace;
}

.yaml-inline .yaml-key {
  color: var(--el-color-primary);
}
```

- [ ] **Step 6: Commit**

```bash
git add entrypoints/sidebar/SettingsPanel.vue
git commit -m "feat: add enable/disable switch and MD rendering to SettingsPanel"
```

---

## Task 9: 修改 SkillSelector.vue 禁用技能灰色显示

**Files:**

- Modify: `entrypoints/sidebar/SkillSelector.vue`

- [ ] **Step 1: 修改模板禁用技能处理**

完整修改后的 template：

```vue
<template>
  <el-dialog v-model="visible" :title="t('skill.selectSkill')" width="600px" @close="handleClose">
    <el-input
      v-model="searchQuery"
      :placeholder="t('skill.searchSkills')"
      clearable
      @input="handleSearch"
    />

    <el-scrollbar max-height="400px">
      <div class="skill-list">
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          :class="['skill-item', { 'skill-item-disabled': !skill.enabled }]"
          @click="selectSkill(skill)"
        >
          <div class="skill-header">
            <h4 :class="{ 'skill-name-disabled': !skill.enabled }">{{ skill.name }}</h4>
            <el-tag size="small">{{ skill.metadata.category }}</el-tag>
            <el-tag v-if="!skill.enabled" size="small" type="danger">
              {{ t('skill.disabled') }}
            </el-tag>
          </div>
          <p class="skill-description">{{ skill.description }}</p>
          <div class="skill-tags">
            <el-tag
              v-for="tag in Array.isArray(skill.metadata.tags) ? skill.metadata.tags : []"
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div v-if="skill.metadata.examples.length" class="skill-examples">
            <strong>{{ t('skill.examples') }}:</strong>
            <ul>
              <li v-for="example in skill.metadata.examples" :key="example">
                {{ example }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <el-button @click="handleClose">{{ t('skill.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 修改 selectSkill 方法**

```typescript
function selectSkill(skill: Skill): void {
  if (!skill.enabled) {
    ElMessage.warning(t('skill.skillDisabled'))
    return
  }
  emit('select', skill.id)
  handleClose()
}
```

需要在 script setup 中导入 ElMessage：

```typescript
import { ElMessage } from 'element-plus/es'
```

- [ ] **Step 3: 添加禁用样式**

在 style 中添加：

```css
.skill-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.skill-item-disabled:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.skill-name-disabled {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}
```

完整修改后的 style：

```css
<style scoped>
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
  }

  .skill-item {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .skill-item:hover {
    background: #f5f5f5;
    border-color: #409eff;
  }

  .skill-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-item-disabled:hover {
    background: #f5f5f5;
    border-color: #ddd;
  }

  .skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
  }

  h4 {
    margin: 0;
    font-size: 16px;
  }

  .skill-name-disabled {
    text-decoration: line-through;
    color: var(--el-text-color-secondary);
  }

  .skill-description {
    margin: 8px 0;
    color: #666;
    line-height: 1.5;
  }

  .skill-tags {
    display: flex;
    gap: 8px;
    margin: 8px 0;
  }

  .skill-examples {
    margin-top: 12px;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 4px;
  }

  .skill-examples ul {
    margin: 8px 0 0 16px;
    padding: 0;
  }

  .skill-examples li {
    margin-bottom: 4px;
  }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add entrypoints/sidebar/SkillSelector.vue
git commit -m "feat: show disabled skills grayed out in SkillSelector"
```

---

## Task 10: 运行测试验证

- [ ] **Step 1: 运行 lint 检查**

```bash
npm run lint
```

Expected: 无错误

- [ ] **Step 2: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 3: 运行单元测试**

```bash
npm run test:run
```

Expected: 所有测试通过

- [ ] **Step 4: 运行开发构建验证**

```bash
npm run dev
```

Expected: 构建成功，无错误

- [ ] **Step 5: 手动验证功能**

在 Chrome 中加载扩展：

1. 打开设置 → 技能标签页
2. 验证启用/禁用开关正常工作
3. 验证禁用技能在 SkillSelector 中灰色显示
4. 验证 MD 预览正常渲染
5. 验证 YAML front matter 正确解析

---

## Task 11: 最终 Commit

- [ ] **Step 1: 确保所有更改已提交**

```bash
git status
```

Expected: 无未提交的更改

- [ ] **Step 2: 查看 commit 历史**

```bash
git log --oneline -10
```

Expected: 所有 commit 信息清晰

---

## 自查清单

**1. Spec coverage:**

- ✓ 禁用/启用功能 - Task 2-5, 7-9
- ✓ 内置技能可禁用 - Task 3, 8
- ✓ YAML + Markdown 支持 - Task 7, 8
- ✓ 左侧编辑+右侧完整 SKILL.md 预览 - Task 7
- ✓ 可选字段无值时不显示 - Task 7
- ✓ 国际化 - Task 6
- ✓ 数据迁移 - Task 4

**2. Placeholder scan:**

- 无 TBD、TODO、implement later
- 所有代码完整展示

**3. Type consistency:**

- `enabled: boolean` 在所有 Skill 相关代码中一致使用
- `toggleSkillEnabled(id: string)` 方法签名一致
- `SkillMetadata` 接口未改变
