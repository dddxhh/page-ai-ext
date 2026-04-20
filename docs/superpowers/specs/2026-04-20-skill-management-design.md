# 技能设置模块设计文档

## 概述

完善 Chrome AI Assistant 的技能设置模块，支持在线新增、编辑、删除自定义技能，同时保护内置技能不被修改。

## 需求总结

| 功能         | 需求                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 编辑字段     | 完整字段编辑（名称、描述、系统提示词、作者、版本、标签、分类、示例） |
| 内置技能保护 | 只读，不可编辑/删除，可复制                                          |
| 新增方式     | 手动创建 + 从现有技能复制                                            |
| 删除确认     | 确认对话框                                                           |
| UI布局       | 设置面板标签页 + 编辑对话框                                          |
| 验证规则     | 必填验证、名称唯一性、ID格式、版本号格式                             |

## 数据模型

### Skill 类型（现有，无需修改）

```typescript
interface Skill {
  id: string // 唯一标识符，格式：^[a-z][a-z0-9_-]*$
  name: string // 技能名称，≥2字符，唯一
  description: string // 技能描述，≥10字符
  systemPrompt: string // 系统提示词，≥20字符
  metadata: SkillMetadata
  isBuiltIn: boolean // 是否内置技能
  createdAt: number // 创建时间戳
  updatedAt?: number // 更新时间戳（新增）
}

interface SkillMetadata {
  author: string // 作者
  version: string // 版本号，格式：^\d+\.\d+\.\d+$
  tags: string[] // 标签数组
  examples: string[] // 使用示例数组
  category: string // 分类
}
```

## 组件设计

### 新增组件

#### SkillEditorDialog.vue

**用途**: 技能编辑对话框，支持新增/编辑/复制三种模式

**Props**:

- `visible: boolean` - 对话框可见性
- `skill?: Skill` - 编辑/复制时传入的技能数据
- `mode: 'create' | 'edit' | 'copy'` - 操作模式
- `skills: Skill[]` - 现有技能列表（用于唯一性验证）

**Events**:

- `update:visible` - 更新可见性
- `save` - 保存成功后触发

**布局结构**:

```
┌─────────────────────────────────────┐
│ 标题栏: 新增技能/编辑技能/复制技能     │
├─────────────────────────────────────┤
│ 基础信息                             │
│ ├─ 名称 *                            │
│ ├─ 描述 *                            │
│ ├─ 分类                              │
├─────────────────────────────────────┤
│ 系统提示词 *                         │
│ ├─ textarea，多行编辑                 │
├─────────────────────────────────────┤
│ 元数据                               │
│ ├─ 作者                              │
│ ├─ 版本号                            │
│ ├─ 标签（可多选/输入）                 │
│ ├─ 示例（可添加多条）                  │
├─────────────────────────────────────┤
│          [取消]  [保存]              │
└─────────────────────────────────────┘
```

**特殊处理**:

- `create` 模式：ID 自动生成，所有字段为空
- `edit` 模式：ID 不可修改，加载现有数据
- `copy` 模式：ID 自动生成新值，名称加"-副本"

### 修改组件

#### SettingsPanel.vue

**技能标签页布局**:

```
┌─────────────────────────────────────┐
│ 搜索框  [分类筛选下拉]  [+新增技能]   │
├─────────────────────────────────────┤
│ 技能卡片 1                           │
│ ├─ 名称 + [内置/自定义] 标签         │
│ ├─ 描述                              │
│ ├─ 分类标签                          │
│ ├─ 操作: [编辑][复制][删除]          │
│    (内置技能: 编辑/删除按钮禁用)      │
├─────────────────────────────────────┤
│ 技能卡片 2...                        │
├─────────────────────────────────────┤
│ [导出技能]  [导入技能]               │
└─────────────────────────────────────┘
```

**行为**:

- 内置技能卡片显示"内置"标签，编辑/删除按钮禁用
- 自定义技能显示"自定义"标签，所有按钮可用
- 搜索支持名称/描述/标签匹配
- 分类筛选下拉菜单

## 用户交互流程

### 新增技能流程

```
点击新增技能按钮 → 打开 SkillEditorDialog → mode='create' → 填写表单 → 系统生成ID → 点击保存 → 验证 → 存储 → 刷新列表 → 关闭对话框
```

### 编辑技能流程

```
点击编辑按钮 → (内置技能? 按钮禁用) → 打开 SkillEditorDialog → mode='edit',加载技能数据 → ID字段禁用 → 修改其他字段 → 点击保存 → 验证 → 更新存储 → 刷新列表 → 关闭对话框
```

### 复制技能流程

```
点击复制按钮 → 打开 SkillEditorDialog → mode='copy',加载技能数据 → ID自动生成新值 → 名称加'-副本' → 修改字段 → 点击保存 → 验证 → 存储新技能 → 刷新列表 → 关闭对话框
```

### 删除技能流程

```
点击删除按钮 → (内置技能? 按钮禁用) → 弹出确认对话框 → 用户确认 → 删除技能 → 刷新列表
```

## 验证逻辑

### 验证规则

| 字段       | 规则                   | 正则/条件            |
| ---------- | ---------------------- | -------------------- |
| 名称       | 必填、最小长度、唯一性 | ≥2字符，名称不重复   |
| 描述       | 必填、最小长度         | ≥10字符              |
| 系统提示词 | 必填、最小长度         | ≥20字符              |
| ID         | 格式验证               | `^[a-z][a-z0-9_-]*$` |
| 版本号     | 格式验证               | `^\d+\.\d+\.\d+$`    |

### 验证时机

- **实时验证**: 输入时即时显示字段下方错误提示
- **提交验证**: 点击保存时汇总所有错误，阻止提交

## 错误处理

### 存储操作失败

- 显示 `ElMessage.error('操作失败')`
- 不关闭对话框，允许用户修正后重新提交

### 内置技能操作拦截

- 编辑/删除按钮设置 `disabled` 属性
- 添加 Tooltip: "内置技能不可编辑/删除"

### 验证失败

- 阻止提交
- 高亮错误字段，显示具体错误信息

## 国际化新增

### zh-CN.ts 新增字段

```typescript
skill: {
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
}
```

### en-US.ts 对应翻译

```typescript
skill: {
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
}
```

## 实现范围

### 需要修改的文件

1. `types/index.ts` - 添加 `updatedAt` 字段到 Skill 类型
2. `entrypoints/sidebar/SettingsPanel.vue` - 重构技能标签页
3. `entrypoints/sidebar/SkillEditorDialog.vue` - 新建编辑对话框组件
4. `entrypoints/sidebar/locales/zh-CN.ts` - 添加国际化字段
5. `entrypoints/sidebar/locales/en-US.ts` - 添加国际化字段

### 不需要修改的文件

- `modules/storage.ts` - 现有 saveSkill/deleteSkill 方法已满足需求
- `skills/built-in-skills.ts` - 内置技能定义不变
- `entrypoints/sidebar/SkillSelector.vue` - 技能选择器不变

## 测试要点

### 功能测试

1. 新增技能：验证字段保存正确，ID 自动生成
2. 编辑技能：验证更新保存正确，ID 不变
3. 复制技能：验证新技能独立，ID 不同
4. 删除技能：验证确认对话框，删除后列表更新
5. 内置技能：验证编辑/删除按钮禁用，复制可用

### 验证测试

1. 必填验证：空值提交被阻止
2. 格式验证：错误格式显示提示
3. 唯一性验证：重复名称被阻止
4. 实时验证：输入时即时反馈

### UI 测试

1. 搜索/筛选功能正常
2. 国际化显示正确
3. 按钮禁用状态 + Tooltip 提示

## 数据存储位置

- **存储位置**: `chrome.storage.local`
- **存储键**: `'skills'`（定义在 `STORAGE_KEYS.SKILLS`）
- **数据格式**: `Skill[]` 数组

存储流程：

```
用户操作 → SkillEditorDialog → skillManager.saveSkill() → storage.saveSkill() → chrome.storage.local.set({ skills: [...] })
```
