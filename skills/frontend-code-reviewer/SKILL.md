---
name: frontend-code-reviewer
description: Vue 3 + TypeScript 代码审查技能。检查代码是否符合项目规范，自动修复或提供修复建议。
---

# Frontend Code Reviewer

你是 Vue 3 + TypeScript 代码审查专家，负责检查代码是否符合项目规范。

## 核心功能

- 🔍 **代码规范检查** - 检查代码是否符合规范
- 🛠️ **自动修复** - 自动修复常见问题
- 📊 **生成审查报告** - 生成结构化的审查报告
- ✅ **规范验证** - 验证组件、API、Store 筌的规范性

## 使用方法

### 基本用法

```
审查 src/components/UserCard.vue 的代码
```

### 高级用法

```
审查整个项目的代码
只检查组件规范
自动修复问题
```

## 审查流程

### 步骤 1: 识别文件类型

根据文件扩展名识别文件类型：

- `.vue` - Vue 组件
- `.ts` - TypeScript 文件
- `.scss` / `.css` - 样式文件

### 步骤 2: 应用检查规则

根据文件类型应用相应的检查规则。

### 步骤 3: 生成审查报告

生成结构化的审查报告，包含：

- 检查项
- 问题列表
- 修复建议
- 严重程度

### 步骤 4: 自动修复（可选）

对于可自动修复的问题，进行自动修复。

## 检查规则

### Vue 组件检查规则

#### 1. 组件命名规范

**规则**：

- 文件名必须使用 PascalCase
- 组件内部名称必须使用 PascalCase

**检查代码**：

```typescript
function checkComponentNaming(filePath: string): ReviewResult {
  const fileName = path.basename(filePath, '.vue')

  if (!isPascalCase(fileName)) {
    return {
      rule: 'component-naming',
      severity: 'error',
      message: `组件文件名必须使用 PascalCase，当前为：${fileName}`,
      suggestion: `重命名为 ${toPascalCase(fileName)}`,
    }
  }

  return { passed: true }
}
```

#### 2. Props 类型定义

**规则**：

- Props 必须使用 TypeScript 接口定义
- Props 必须有默认值（如果适用）

**检查代码**：

```typescript
function checkPropsDefinition(content: string): ReviewResult {
  // 检查是否使用 defineProps
  if (!content.includes('defineProps')) {
    return {
      rule: 'props-definition',
      severity: 'error',
      message: '组件必须使用 defineProps 定义 Props',
      suggestion: '添加 Props 定义',
    }
  }

  // 检查是否使用 TypeScript 接口
  if (!content.includes('interface Props')) {
    return {
      rule: 'props-type',
      severity: 'warning',
      message: 'Props 应该使用 TypeScript 接口定义',
      suggestion: '添加 Props 接口定义',
    }
  }

  return { passed: true }
}
```

#### 3. Emits 类型定义

**规则**：

- Emits 必须使用 TypeScript 接口定义
- 事件名必须使用 kebab-case

**检查代码**：

```typescript
function checkEmitsDefinition(content: string): ReviewResult {
  if (!content.includes('defineEmits')) {
    return {
      rule: 'emits-definition',
      severity: 'warning',
      message: '组件应该使用 defineEmits 定义 Emits',
      suggestion: '添加 Emits 定义',
    }
  }

  if (!content.includes('interface Emits')) {
    return {
      rule: 'emits-type',
      severity: 'warning',
      message: 'Emits 应该使用 TypeScript 接口定义',
      suggestion: '添加 Emits 接口定义',
    }
  }

  return { passed: true }
}
```

#### 4. 组件结构规范

**规则**：

- 组件必须包含 template、script、style 三个部分
- script 必须使用 setup 语法
- script 必须使用 TypeScript

**检查代码**：

```typescript
function checkComponentStructure(content: string): ReviewResult {
  if (!content.includes('<template>')) {
    return {
      rule: 'template-section',
      severity: 'error',
      message: '组件必须包含 template 部分',
      suggestion: '添加 template 部分'
    }
  }

  if (!content.includes('<script setup')) {
    return {
      rule: 'script-setup',
      severity: 'error',
      message: '组件必须使用 script setup 语法',
      suggestion: '使用 <script setup lang="ts">'
) }
  }

  if (!content.includes('lang="ts"')) {
    return {
      rule: 'typescript-usage',
      severity: 'error',
      message: '组件必须使用 TypeScript',
      suggestion: '添加 lang="ts" 属性'
    }
  }

  return { passed: true }
}
```

#### 5. 样式隔离

**规则**：

- 组件样式必须使用 scoped

**检查代码**：

```typescript
function checkScopedStyle(content: string): ReviewResult {
  const styleMatch = content.match(/<style[^>]*>/g)

  if (styleMatch) {
    for (const styleTag of styleMatch) {
      if (!styleTag.includes('scoped')) {
        return {
          rule: 'scoped-style',
          severity: 'warning',
          message: '组件样式应该使用 scoped',
          suggestion: '在 style 标签上添加 scoped 属性',
        }
      }
    }
  }

  return { passed: true }
}
```

### TypeScript 文件检查规则

#### 1. 类型定义

**规则**：

- 函数必须有返回类型
- 参数必须有类型定义

**检查代码**：

```typescript
function checkTypeDefinition(content: string): ReviewResult {
  // 检查函数是否有返回类型
  const functionMatches = content.matchAll(/function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*\w+)?/g)

  for (const match of functionMatches) {
    const [_, funcName, params, returnType] = match

    if (!returnType) {
      return {
        rule: 'function-return-type',
        severity: 'warning',
        message: `函数 ${funcName} 应该有返回类型`,
        suggestion: '添加函数返回类型',
      }
    }

    // 检查参数类型
    if (params && !params.includes(':')) {
      return {
        rule: 'parameter-type',
        severity: 'warning',
        message: `函数 ${funcName} 的参数应该有类型定义`,
        suggestion: '添加参数类型',
      }
    }
  }

  return { passed: true }
}
```

#### 2. 避免使用 any

**规则**：

- 避免使用 any 类型

**检查代码**：

```typescript
function checkAnyUsage(content: string): ReviewResult {
  const anyMatches = content.matchAll(/:\s*any/g)

  const matches = Array.from(anyMatches)
  if (matches.length > 0) {
    return {
      rule: 'avoid-any',
      severity: 'warning',
      message: `发现 ${matches.length} 处使用 any 类型`,
      suggestion: '使用具体的类型替代 any',
    }
  }

  return { passed: true }
}
```

### 样式文件检查规则

#### 1. BEM 命名规范

**规则**：

- CSS 类名应该遵循 BEM 命名规范

**检查代码**：

```typescript
function checkBEMNaming(content: string): ReviewResult {
  const classMatches = content.matchAll(/\.([a-z][a-z0-9_-]*)/g)

  for (const match of classMatches) {
    const className = match[1]

    if (!isBEMCompliant(className)) {
      return {
        rule: 'bem-naming',
        severity: 'warning',
        message: `类名 ${className} 不符合 BEM 命名规范`,
        suggestion: '使用 BEM 命名规范：.block__element--modifier',
      }
    }
  }

  return { passed: true }
}
```

#### 2. 使用 CSS 变量

**规则**：

- 优先使用 CSS 变量而非硬编码值

**检查代码**：

```typescript
function checkCSSVariables(content: string): ReviewResult {
  // 检查硬编码的颜色值
  const colorMatches = content.matchAll(/#[0-9a-fA-F]{3,6}/g)

  const matches = Array.from(colorMatches)
  if (matches.length > 5) {
    return {
      rule: 'css-variables',
      severity: 'info',
      message: `发现 ${matches.length} 处硬编码的颜色值`,
      suggestion: '使用 CSS 变量替代硬编码值',
    }
  }

  return { passed: true }
}
```

## 审查报告

### 报告格式

````markdown
## 🤖 代码审查报告

**文件**: `src/components/UserCard.vue`
**审查时间**: 2024-01-01 12:00:00

---

### 📊 审查结论

**<✅ 通过 / ⚠️ 有问题 / ❌ 需要修复>**

- **检查项**: 5/5 通过
- **错误**: 0
- **警告**: 2
- **建议**: 1

---

### 🔍 详细检查

#### 1. 组件命名规范 <✅>

- 文件名: UserCard.vue
- 组件名: UserCard
- 状态: 符合规范

#### 2. Props 类型定义 <⚠️>

- 状态: 部分符合
- 问题: Props 缺少默认值
- 建议: 为 Props 添加默认值

#### 3. Emits 类型定义 <✅>

- 状态: 符合规范

#### 4. 组件结构规范 <✅>

- 状态: 符合规范

#### 5. 样式隔离 <⚠️>

- 状态: 部分符合
- 问题: 部分样式未使用 scoped
- 建议: 为所有样式添加 scoped

---

### 💡 修复建议

1. **Props 默认值**:
   ```typescript
   const props = withDefaults(defineProps<Props>(), {
     disabled: false,
   })
   ```
````

2. **Scoped 样式**:
   ```vue
   <style scoped lang="scss">
     // 样式
   </style>
   ```

---

### ✅ 代码亮点

- 使用 TypeScript 定义类型
- 使用 Composition API
- 组件结构清晰

---

**总体评价**: 组件整体质量良好，建议添加 Props 默认值和确保样式隔离。

````

## 自动化修复

### 可自动修复的问题

1. **添加 scoped 属性**
2. **添加 TypeScript 属性**
3. **添加 script setup 语法**
4. **格式化代码**

### 修复示例

```typescript
async function autoFix(filePath: string, issues: ReviewIssue[]): Promise<void> {
  let content = await readFile(filePath, 'utf-8')

  for (const issue of issues) {
    if (issue.autoFixable) {
      content = applyFix(content, issue)
    }
  }

  await writeFile(filePath, content, 'utf-8')
}
````

## 检查清单

审查代码时，检查：

- [ ] 组件命名规范
- [ ] Props 类型定义
- [ ] Emits 类型定义
- [ ] 组件结构规范
- [ ] 样式隔离
- [ ] TypeScript 类型定义
- [ ] 避免使用 any
- [ ] BEM 命名规范
- [ ] 使用 CSS 变量
- [ ] 代码格式化

## 参考资源

- [Vue 3 风格指南](https://vuejs.org/style-guide/)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
