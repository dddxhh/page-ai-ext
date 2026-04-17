---
name: frontend-doc-generator
description: Vue 3 + TypeScript 文档生成技能。从组件、API、Store 自动生成 Markdown 格式的文档。
---

# Frontend Doc Generator

你是 Vue 3 + TypeScript 文档生成专家，负责从代码自动生成 Markdown 格式的文档。

## 核心功能

- 📄 **组件文档生成** - 从 Vue 组件生成使用文档
- 🔌 **API 文档生成** - 从 API 模块生成接口文档
- 🗄️ **Store 文档生成** - 从 Pinia Store 生成状态管理文档
- 📋 **类型文档生成** - 从 TypeScript 类型生成类型文档
- 🎯 **示例代码生成** - 生成使用示例代码

## 使用方法

### 基本用法

```
生成 UserCard 组件的文档
```

### 高级用法

```
生成所有组件的文档
生成 API 文档
生成 Store 文档
生成完整项目文档
```

## 文档生成流程

### 步骤 1: 识别目标类型

根据文件路径识别目标类型：
- Vue 组件 → 组件文档
- API 模块 → API 文档
- Store 模块 → Store 文档
- 类型定义 → 类型文档

### 步骤 2: 解析源代码

解析源代码，提取：
- Props 定义
- Events 定义
- Slots 定义
- Methods 定义
- 类型定义
- JSDoc 注释

### 步骤 3: 生成文档

根据解析结果生成 Markdown 文档。

### 步骤 4: 生成示例代码

生成使用示例代码。

## 组件文档生成

### 组件文档模板

```markdown
# {{ ComponentName }} 组件

{{ description }}

## 基本用法

```vue
<template>
  <{{ componentNameKebab }} {{ basicUsageProps }} />
</template>

<script setup lang="ts">
import {{ ComponentName }} from '@/components/{{ type }}/{{ ComponentName }}.vue'
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
{{ propsTable }}

### Props 示例

```typescript
const props = {
  {{ propsExample }}
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
{{ eventsTable }}

### Events 示例

```vue
<template>
  <{{ componentNameKebab }}
    {{ eventsUsage }}
  />
</template>

<script setup lang="ts">
function {{ eventHandlerName }}({{ eventParams }}) {
  // 处理事件
}
</script>
```

## Slots

| 插槽名 | 说明 | 作用域 |
|--------|------|--------|
{{ slotsTable }}

### Slots 示例

```vue
<template>
  <{{ componentNameKebab }}>
    {{ slotsUsage }}
  </{{ componentNameKebab }}>
</template>
```

## Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
{{ methodsTable }}

### Methods 示例

```typescript
const componentRef = ref<InstanceType<typeof {{ ComponentName }}>>()

// 调用方法
componentRef.value?.{{ methodName }}({{ methodParams }})
```

## 完整示例

```vue
<template>
  <{{ componentNameKebab }}
    {{ fullExampleProps }}
    @{{ eventName }}="{{ eventHandler }}"
  >
    <template #{{ slotName }}>
      {{ slotContent }}
    </template>
  </{{ componentNameKebab }}>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {{ ComponentName }} from '@/components/{{ type }}/{{ ComponentName }}.vue'

const {{ componentNameCamel }} = ref<InstanceType<typeof {{ ComponentName }}>>()

function {{ eventHandler }}({{ eventParams }}) {
  console.log('{{ eventName }}:', {{ eventParams }})
}
</script>
```

## 样式变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
{{ styleVariablesTable }}

## 注意事项

{{ notes }}

## 相关组件

{{ relatedComponents }}

## 更新日志

- **v1.0.0** ({{ date }})
  - 初始版本
```

## API 文档生成

### API 文档模板

```markdown
# {{ ModuleName }} API

{{ description }}

## 基础配置

```typescript
import { {moduleName}Api } from '@/api/modules/{module-name}'
```

## 接口列表

### 1. list

获取 {{ modelName }} 列表

**接口地址**: `GET /{module-name}s`

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
{{ listParamsTable }}

**请求示例**:

```typescript
const result = await {moduleName}Api.list({
  page: 1,
  pageSize: 10
})
```

**响应数据**:

```typescript
interface PageResponse<{{ ModelName }}> {
  list: {{ ModelName }}[]
  total: number
  page: number
  pageSize: number
}
```

**响应示例**:

```json
{
  "list": [
    {{ responseExample }}
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 2. detail

获取 {{ modelName }} 详情

**接口地址**: `GET /{module-name}s/:id`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | {{ modelName }} ID |

**请求示例**:

```typescript
const result = await {moduleName}Api.detail('123')
```

**响应数据**:

```typescript
interface {{ ModelName }} {
  id: string
  {{ modelFields }}
  createdAt: string
  updatedAt: string
}
```

### 3. create

创建 {{ modelName }}

**接口地址**: `POST /{module-name}s`

**请求参数**:

```typescript
interface Create{{ ModelName }}Dto {
  {{ createFields }}
}
```

**请求示例**:

```typescript
const data: Create{{ ModelName }}Dto = {
  {{ createExample }}
}

const result = await {moduleName}Api.create(data)
```

### 4. update

更新 {{ modelName }}

**接口地址**: `PUT /{module-name}s/:id`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | {{ modelName }} ID |
| data | Update{{ ModelName }}Dto | 是 | 更新数据 |

```typescript
interface Update{{ ModelName }}Dto {
  {{ updateFields }}
}
```

**请求示例**:

```typescript
const data: Update{{ ModelName }}Dto = {
  {{ updateExample }}
}

const result = await {moduleName}Api.update('123', data)
```

### 5. delete

删除 {{ modelName }}

**接口地址**: `DELETE /{module-name}s/:id`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | {{ modelName }} ID |

**请求示例**:

```typescript
await {moduleName}Api.delete('123')
```

### 6. batchDelete

批量删除 {{ modelName }}

**接口地址**: `DELETE /{module-name}s/batch`

**请求参数**:

```typescript
interface BatchDeleteDto {
  ids: string[]
}
```

**请求示例**:

```typescript
await {moduleName}Api.batchDelete(['123', '456'])
```

## 错误码

| 错误码 | 说明 |
|--------|------|
{{ errorCodesTable }}

## 使用示例

### 获取列表

```typescript
import { {moduleName}Api } from '@/api/modules/{module-name}'

async function fetch{{ ModelName }}s() {
  try {
    const result = await {moduleName}Api.list({
      page: 1,
      pageSize: 10
    })

    console.log('列表:', result.list)
    console.log('总数:', result.total)
  } catch (error) {
    console.error('获取列表失败:', error)
  }
}
```

### 获取详情

```typescript
async function fetch{{ ModelName }}Detail(id: string) {
  try {
    const detail = await {moduleName}Api.detail(id)
    console.log('详情:', detail)
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}
```

### 创建数据

```typescript
async function create{{ ModelName }}() {
  try {
    const data: Create{{ ModelName }}Dto = {
      {{ createExample }}
    }

    const result = await {moduleName}Api.create(data)
    console.log('创建成功:', result)
  } catch (error) {
    console.error('创建失败:', error)
  }
}
```

## 注意事项

{{ apiNotes }}
```

## Store 文档生成

### Store 文档模板

```markdown
# {{ ModelName }} Store

{{ description }}

## 基础配置

```typescript
import { use{{ ModelName }}Store } from '@/stores/{{ module-name }}'

const {{ modelName }}Store = use{{ ModelName }}Store()
```

## State

| 状态名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
{{ stateTable }}

## Getters

| 计算属性名 | 类型 | 说明 |
|------------|------|------|
{{ gettersTable }}

## Actions

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
{{ actionsTable }}

## 使用示例

### 获取列表

```typescript
import { use{{ ModelName }}Store } from '@/stores/{{ module-name }}'

const {{ modelName }}Store = use{{ ModelName }}Store()

// 获取列表
await {{ modelName }}Store.fetch{{ ModelName }}s()

// 访问数据
console.log({{ modelName }}Store.{{ modelNames }})
console.log({{ modelName }}Store.total)
```

### 获取详情

```typescript
// 获取详情
await {{ modelName }}Store.fetch{{ ModelName }}Detail('123')

// 访问详情
console.log({{ modelName }}Store.current{{ ModelName }})
```

### 创建数据

```typescript
try {
  const data: Create{{ ModelName }}Dto = {
    {{ createExample }}
  }

  const result = await {{ modelName }}Store.create{{ ModelName }}(data)
  console.log('创建成功:', result)
} catch (error) {
  console.error('创建失败:', error)
}
```

### 更新数据

```typescript
try {
  const data: Update{{ ModelName }}Dto = {
    {{ updateExample }}
  }

  const result = await {{ modelName }}Store.update{{ ModelName }}('123', data)
  console.log('更新成功:', result)
} catch (error) {
  console.error('更新失败:', error)
}
```

### 删除数据

```typescript
try {
  await {{ modelName }}Store.delete{{ ModelName }}('123')
  console.log('删除成功')
} catch (error) {
  console.error('删除失败:', error)
}
```

### 在组件中使用

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="item in {{ modelNames }}" :key="item.id">
        {{ itemDisplay }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { use{{ ModelName }}Store } from '@/stores/{{ module-name }}'

const {{ modelName }}Store = use{{ ModelName }}Store()

const { {{ modelNames }}, loading, error } = storeToRefs({{ modelName }}Store)

onMounted(async () => {
  await {{ modelName }}Store.fetch{{ ModelName }}s()
})
</script>
```

## 持久化配置

```typescript
// Store 配置
{
  persist: {
    key: '{{ module-name }}-store',
    storage: localStorage,
    paths: ['{{ persistedState }}']
  }
}
```

## 注意事项

{{ storeNotes }}
```

## 类型文档生成

### 类型文档模板

```markdown
# {{ TypeName }} 类型定义

{{ description }}

## 类型定义

```typescript
{{ typeDefinition }}
```

## 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
{{ propertiesTable }}

## 使用示例

### 基本使用

```typescript
const data: {{ TypeName }} = {
  {{ usageExample }}
}
```

### 函数参数

```typescript
function processData(data: {{ TypeName }}) {
  // 处理数据
}
```

### 组件 Props

```vue
<script setup lang="ts">
import type { {{ TypeName }} } from '@/types'

interface Props {
  data: {{ TypeName }}
}

const props = defineProps<Props>()
</script>
```

## 相关类型

{{ relatedTypes }}
```

## 文档生成规则

### 1. 提取 JSDoc 注释

从代码中提取 JSDoc 注释作为文档说明。

### 2. 解析 TypeScript 类型

解析 TypeScript 类型定义，生成类型说明。

### 3. 生成示例代码

根据类型定义生成使用示例。

### 4. 格式化输出

生成格式化的 Markdown 文档。

## 文档输出位置

### 组件文档

```
docs/components/{{ type }}/{{ ComponentName }}.md
```

### API 文档

```
docs/api/{{ module-name }}.md
```

### Store 文档

```
docs/stores/{{ module-name }}.md
```

### 类型文档

```
docs/types/{{ type-name }}.md
```

## 最佳实践

### 1. 添加 JSDoc 注释

为代码添加详细的 JSDoc 注释。

### 2. 使用清晰的命名

使用有意义的命名，便于理解。

### 3. 提供示例代码

提供完整的使用示例。

### 4. 保持文档更新

代码变更时及时更新文档。

## 检查清单

生成文档时，确保：

- [ ] 文档结构完整
- [ ] Props/Events/Slots 说明清晰
- [ ] 示例代码可正确运行
- [ ] 类型定义准确
- [ ] 注意事项完整
- [ ] 相关资源链接有效

## 参考资源

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
