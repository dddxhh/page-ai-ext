# 技能增强设计文档 - 禁用/启用 + Markdown 支持

## 概述

为 Chrome AI Assistant 的技能系统添加两项增强功能：

1. 技能禁用/启用控制
2. Markdown 格式支持

## 需求总结

| 功能      | 需求                                                         |
| --------- | ------------------------------------------------------------ |
| 禁用/启用 | **仅自定义技能**可被禁用，禁用后在选择器中灰色显示，不可选择 |
| 内置技能  | 内置技能始终启用，不显示启用开关，但可复制                   |
| MD 支持   | `description` 和 `systemPrompt` 字段支持 Markdown 渲染       |
| MD 预览   | 编辑器中使用实时预览模式（编辑+预览分栏）                    |

## 数据模型改动

### Skill 类型修改

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

### 数据迁移策略

在 `modules/storage.ts` 的 `getAllSkills()` 方法中，对无 `enabled` 字段的旧数据自动补充 `enabled: true`：

```typescript
async getAllSkills(): Promise<Skill[]> {
  const skills = await storage.getAllSkills()
  return skills.map(skill => ({
    ...skill,
    enabled: skill.enabled ?? true  // 兼容旧数据
  }))
}
```

## 组件设计

### SkillEditorDialog.vue 改动

**布局调整**：编辑 + 预览分栏

```
┌─────────────────────────────────────────────────────────────┐
│ 标题栏: 新增技能/编辑技能/复制技能                              │
├─────────────────────────────────────────────────────────────┤
│ 启用状态: [开关]                                              │
├─────────────────────────────────────────────────────────────┤
│ 基础信息                                                      │
│ ├─ 名称 *                                                     │
│ ├─ 描述 * (支持 MD)                                           │
│ │   ┌──────────────────┬──────────────────┐                 │
│ │   │ 编辑区            │ 预览区 (实时)      │                 │
│ │   │ (textarea)       │ (渲染的 MD)       │                 │
│ │   └──────────────────┴──────────────────┘                 │
│ ├─ 分类                                                       │
├─────────────────────────────────────────────────────────────┤
│ 系统提示词 * (支持 MD)                                        │
│ ┌──────────────────┬──────────────────┐                     │
│ │ 编辑区            │ 预览区 (实时)      │                     │
│ │ (textarea)       │ (渲染的 MD)       │                     │
│ └──────────────────┴──────────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│ 元数据                                                        │
│ ├─ 作者、版本号、标签、示例                                     │
├─────────────────────────────────────────────────────────────┤
│                    [取消]  [保存]                             │
└─────────────────────────────────────────────────────────────┘
```

**MD 编辑器组件结构**：

```vue
<template>
  <el-row :gutter="16">
    <el-col :span="12">
      <el-input type="textarea" v-model="localValue" :rows="rows" @input="handleInput" />
    </el-col>
    <el-col :span="12">
      <div class="md-preview" v-html="renderedHtml"></div>
    </el-col>
  </el-row>
</template>
```

**MD 渲染逻辑**：

```typescript
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const renderedHtml = computed(() => {
  const raw = marked.parse(localValue.value) as string
  return DOMPurify.sanitize(raw)
})
```

**新增 Props**：

- `enableSwitch: boolean` - 是否显示启用/禁用开关（仅编辑自定义技能时显示）

**新增字段**：

- `form.enabled: boolean` - 技能启用状态

### SettingsPanel.vue 改动

**技能卡片布局调整**：

```
┌─────────────────────────────────────────────────────────────┐
│ [开关(仅自定义)] 技能名称 [已禁用]           [内置/自定义] [编辑] [复制] [删除] │
│ ├─ 描述 (支持 MD 渲染)                                        │
│ ├─ 分类标签                                                   │
├─────────────────────────────────────────────────────────────┤
```

**开关位置**：技能名称左侧（仅自定义技能显示）

**开关行为**：

- 点击切换 `enabled` 状态
- 内置技能：不显示开关，编辑/删除按钮禁用
- 自定义技能：显示开关，所有按钮可用
- 切换后立即保存

**MD 渲染**：

- 描述字段使用 `marked` + `DOMPurify` 渲染
- 应用简洁的 MD 样式（代码块、列表、链接等）

### SkillSelector.vue 改动

**禁用技能显示**：

- 仍显示在列表中
- CSS 样式：`opacity: 0.5; cursor: not-allowed;`
- 点击时显示 ElMessage 提示："此技能已禁用"
- 分类筛选时仍计入统计

**过滤逻辑**：

```typescript
const selectableSkills = computed(() => skills.value.filter((s) => s.enabled !== false))

const disabledSkills = computed(() => skills.value.filter((s) => s.enabled === false))
```

## 用户交互流程

### 禁用技能流程

```
设置页面 → 点击技能卡片开关 → 切换 enabled 状态 → 保存 → 显示成功提示
```

### 选择禁用技能流程

```
聊天页面 → 打开技能选择器 → 点击禁用的技能 → 显示提示"此技能已禁用" → 无法选择
```

### 编辑技能（含 MD 预览）流程

```
点击编辑按钮 → 打开 SkillEditorDialog → 显示启用开关 → 编辑字段 → 左侧编辑、右侧实时预览 → 保存
```

## 国际化新增

### zh-CN.ts 新增字段

```typescript
skill: {
  // 现有字段...
  enabled: '已启用',
  disabled: '已禁用',
  enableSkill: '启用技能',
  disableSkill: '禁用技能',
  skillDisabled: '此技能已禁用',
  disabledHint: '禁用后，该技能将不会出现在技能选择器中',
  preview: '预览',
}
```

### en-US.ts 对应翻译

```typescript
skill: {
  // existing fields...
  enabled: 'Enabled',
  disabled: 'Disabled',
  enableSkill: 'Enable Skill',
  disableSkill: 'Disable Skill',
  skillDisabled: 'This skill is disabled',
  disabledHint: 'When disabled, this skill will not appear in the skill selector',
  preview: 'Preview',
}
```

## 样式设计

### MD 预览区样式

```css
.md-preview {
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
}

.md-preview code {
  background-color: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.md-preview pre {
  background-color: var(--el-fill-color-dark);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.md-preview blockquote {
  border-left: 3px solid var(--el-border-color);
  padding-left: 12px;
  color: var(--el-text-color-secondary);
}
```

### 禁用技能卡片样式

```css
.skill-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.skill-card.disabled .skill-name {
  text-decoration: line-through;
}
```

## 实现范围

### 需要修改的文件

| 文件                                        | 改动内容                         |
| ------------------------------------------- | -------------------------------- |
| `types/index.ts`                            | 添加 `enabled` 字段到 Skill 类型 |
| `modules/storage.ts`                        | 添加数据迁移逻辑（兼容旧数据）   |
| `modules/skill-manager.ts`                  | 添加 `toggleSkillEnabled()` 方法 |
| `entrypoints/sidebar/SkillEditorDialog.vue` | 添加启用开关 + MD 实时预览       |
| `entrypoints/sidebar/SettingsPanel.vue`     | 添加启用/禁用开关 + MD 描述渲染  |
| `entrypoints/sidebar/SkillSelector.vue`     | 禁用技能灰色显示 + 点击提示      |
| `entrypoints/sidebar/locales/zh-CN.ts`      | 添加新国际化字段                 |
| `entrypoints/sidebar/locales/en-US.ts`      | 添加新国际化字段                 |

### 不需要修改的文件

- `entrypoints/background.ts` - 技能应用逻辑不变
- `skills/built-in-skills.ts` - 内置技能定义不变（初始化时自动设 enabled: true）

## 测试要点

### 功能测试

1. **禁用/启用**
   - 验证开关切换正确保存
   - 验证内置技能不显示启用开关
   - 验证自定义技能可禁用/启用
   - 验证禁用状态持久化

2. **禁用技能选择**
   - 验证禁用技能在选择器中灰色显示
   - 验证点击禁用技能显示提示
   - 验证无法选择禁用技能

3. **MD 渲染**
   - 验证 description 和 systemPrompt 的 MD 正确渲染
   - 验证实时预览与编辑同步
   - 验证 DOMPurify 清理恶意内容

### 兼容性测试

1. 验证旧数据（无 enabled 字段）自动迁移
2. 验证内置技能初始化后 enabled 为 true

### UI 测试

1. 验证暗色模式下预览区样式
2. 验证禁用技能卡片样式
3. 验证国际化显示正确

## 数据存储

- **存储位置**: `chrome.storage.local`
- **存储键**: `'skills'`
- **数据格式**: `Skill[]` 数组（含 `enabled` 字段）
