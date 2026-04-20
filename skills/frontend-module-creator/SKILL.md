---
name: frontend-module-creator
description: 功能模块创建技能。根据规范自动生成完整的功能模块，包括 API 接口、Store、类型定义和组件。
---

# Frontend Module Creator

你是 Vue 3 + TypeScript 功能模块创建专家，负责根据项目规范自动生成完整的功能模块。

## 核心功能

- 🏗️ **创建完整模块** - 生成 API、Store、类型定义和组件
- 📁 **标准目录结构** - 按照规范组织模块文件
- 🔌 **API 接口生成** - 自动生成 CRUD 接口
- 🗄️ **Store 生成** - 自动生成 Pinia Store
- 🧪 **测试文件生成** - 自动生成模块测试

## 使用方法

### 基本用法

```
创建订单管理模块
```

### 高级用法

```
创建产品管理模块，包含以下功能：
- 产品列表查询
- 产品详情查看
- 产品创建和编辑
- 产品删除
- 库存管理
```

## 模块创建流程

### 步骤 1: 收集模块信息

通过对话收集以下信息：

1. **模块名称** - 模块的英文名称
2. **模块描述** - 模块的功能描述
3. **数据模型** - 主要数据模型字段
4. **功能需求** - 需要的 CRUD 功能
5. **是否生成组件** - 是否生成相关组件
6. **是否生成测试** - 是否生成测试文件

### 步骤 2: 生成类型定义

生成模块相关的 TypeScript 类型定义：

```
src/types/{module-name}.ts
```

### 步骤 3: 生成 API 接口

生成模块的 API 接口：

```
src/api/modules/{module-name}.ts
```

### 步骤 4: 生成 Store

生成模块的 Pinia Store：

```
src/stores/{module-name}.ts
```

### 步骤 5: 生成组件（可选）

生成模块相关的组件：

```
src/components/business/{ModuleName}List.vue
src/components/business/{ModuleName}Detail.vue
src/components/business/{ModuleName}Form.vue
```

### 步骤 6: 生成测试文件

生成模块测试文件：

```
tests/api/modules/{module-name}.test.ts
tests/stores/{module-name}.test.ts
```

## 类型定义模板

```typescript
// src/types/{module-name}.ts

export interface {ModelName} {
  id: string
  {{ modelFields }}
  createdAt: string
  updatedAt: string
}

export interface Create{ModelName}Dto {
  {{ createFields }}
}

export interface Update{ModelName}Dto {
  {{ updateFields }}
}

export interface {ModelName}ListParams extends PageParams {
  {{ listParams }}
}
```

## API 接口模板

```typescript
// src/api/modules/{module-name}.ts
import request from '../request'
import type { {ModelName}, Create{ModelName}Dto, Update{ModelName}Dto, {ModelName}ListParams, PageResponse } from '../types'

export const {moduleName}Api = {
  // 获取列表
  list(params: {ModelName}ListParams): Promise<PageResponse<{ModelName}>> {
    return request.get('/{module-name}s', { params })
  },

  // 获取详情
  detail(id: string): Promise<{ModelName}> {
    return request.get(`/{module-name}s/${id}`)
  },

  // 创建
  create(data: Create{ModelName}Dto): Promise<{ModelName}> {
    return request.post('/{module-name}s', data)
  },

  // 更新
  update(id: string, data: Update{ModelName}Dto): Promise<{ModelName}> {
    return request.put(`/{module-name}s/${id}`, data)
  },

  // 删除
  delete(id: string): Promise<void> {
    return request.delete(`/{module-name}s/${id}`)
  },

  // 批量删除
  batchDelete(ids: string[]): Promise<void> {
    return request.delete('/{module-name}s/batch', { data: { ids } })
  }
}
```

## Store 模板

```typescript
// src/stores/{module-name}.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { {ModelName} } from '@/types'
import { {moduleName}Api } from '@/api'

export const use{ModelName}Store = defineStore('{moduleName}', () => {
  // State
  const {modelNames} = ref<{ModelName}[]>([])
  const current{ModelName} = ref<{ModelName} | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)

  // Getters
  const has{ModelName}s = computed(() => {modelNames}.value.length > 0)

  // Actions
  async function fetch{ModelName}s(params?: {ModelName}ListParams) {
    loading.value = true
    error.value = null

    try {
      const { list, total: totalCount } = await {moduleName}Api.list({
        page: page.value,
        pageSize: pageSize.value,
        ...params
      })

      {modelNames}.value = list
      total.value = totalCount
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetch{ModelName}Detail(id: string) {
    loading.value = true
    error.value = null

    try {
      current{ModelName}.value = await {moduleName}Api.detail(id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create{ModelName}(data: Create{ModelName}Dto) {
    loading.value = true
    error.value = null

    try {
      const new{ModelName} = await {moduleName}Api.create(data)
      {modelNames}.value.unshift(new{ModelName})
      return new{ModelName}
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update{ModelName}(id: string, data: Update{ModelName}Dto) {
    loading.value = true
    error.value = null

    try {
      const updated{ModelName} = await {moduleName}Api.update(id, data)
      const index = {modelNames}.value.findIndex(item => item.id === id)
      if (index !== -1) {
        {modelNames}.value[index] = updated{ModelName}
      }
      if (current{ModelName}.value?.id === id) {
        current{ModelName}.value = updated{ModelName}
      }
      return updated{ModelName}
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function delete{ModelName}(id: string) {
    loading.value = true
    error.value = null

    try {
      await {moduleName}Api.delete(id)
      {modelNames}.value = {modelNames}.value.filter(item => item.id !== id)
      if (current{ModelName}.value?.id === id) {
        current{ModelName}.value = null
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset() {
    {modelNames}.value = []
    current{ModelName}.value = null
    loading.value = false
    error.value = null
    total.value = 0
    page.value = 1
  }

  return {
    // State
    {modelNames},
    current{ModelName},
    loading,
    error,
    total,
    page,
    pageSize,

    // Getters
    has{ModelName}s,

    // Actions
    fetch{ModelName}s,
    fetch{ModelName}Detail,
    create{ModelName},
    update{ModelName},
    delete{ModelName},
    reset
  }
})
```

## 组件模板

### 列表组件

```vue
<template>
  <div class="{module-name}-list">
    <el-table :data="{ modelNames }" :loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      {{ tableColumns }}
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)"> 查看 </el-button>
          <el-button type="warning" size="small" @click="handleEdit(row)"> 编辑 </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { use{ModelName}Store } from '@/stores/{module-name}'
  import type { {ModelName} } from '@/types'

  const {modelName}Store = use{ModelName}Store()

  const {modelNames} = computed(() => {moduleName}Store.{modelNames})
  const loading = computed(() => {moduleName}Store.loading)
  const total = computed(() => {moduleName}Store.total)
  const page = computed({
    get: () => {moduleName}Store.page,
    set: (value) => {moduleName}Store.page = value
  })
  const pageSize = computed({
    get: () => {moduleName}Store.pageSize,
    set: (value) => {moduleName}Store.pageSize = value
  })

  onMounted(() => {
    {moduleName}Store.fetch{ModelName}s()
  })

  function handleView(row: {ModelName}) {
    // 查看详情
  }

  function handleEdit(row: {ModelName}) {
    // 编辑
  }

  async function handleDelete(row: {ModelName}) {
    try {
      await {moduleName}Store.delete{ModelName}(row.id)
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  function handlePageChange(page: number) {
    {moduleName}Store.fetch{ModelName}s()
  }

  function handleSizeChange(size: number) {
    {moduleName}Store.fetch{ModelName}s()
  }
</script>

<style scoped lang="scss">
  .{module-name}-list {
    padding: 16px;
  }
</style>
```

## 测试文件模板

### API 测试

```typescript
// tests/api/modules/{module-name}.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { {moduleName}Api } from '@/api/modules/{module-name}'
import { mock{ModelName} } from '@/fixtures/data-fixtures'

vi.mock('@/api/request')

describe('{ModelName} API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return {model-name} list', async () => {
      const mockResponse = {
        list: [mock{ModelName}],
        total: 1,
        page: 1,
        pageSize: 10
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await {moduleName}Api.list({ page: 1, pageSize: 10 })

      expect(result).toEqual(mockResponse)
    })
  })

  describe('detail', () => {
    it('should return {model-name} detail', async () => {
      vi.mocked(request.get).mockResolvedValue(mock{ModelName})

      const result = await {moduleName}Api.detail('1')

      expect(result).toEqual(mock{ModelName})
    })
  })
})
```

### Store 测试

```typescript
// tests/stores/{module-name}.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { use{ModelName}Store } from '@/stores/{module-name}'
import { mock{ModelName} } from '@/fixtures/data-fixtures'

vi.mock('@/api/modules/{module-name}')

describe('{ModelName} Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = use{ModelName}Store()

    expect(store.{modelNames}).toEqual([])
    expect(store.current{ModelName}).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('fetches {model-name}s successfully', async () => {
    vi.mocked({moduleName}Api.list).mockResolvedValue({
      list: [mock{ModelName}],
      total: 1,
      page: 1,
      pageSize: 10
    })

    const store = use{ModelName}Store()
    await store.fetch{ModelName}s()

    expect(store.{modelNames}).toHaveLength(1)
    expect(store.total).toBe(1)
  })
})
```

## 模块结构

### 完整模块结构

```
src/
├── types/
│   └── {module-name}.ts
├── api/
│   └── modules/
│       └── {module-name}.ts
├── stores/
│   └── {module-name}.ts
└── components/
    └── business/
        ├── {ModuleName}List.vue
        ├── {ModuleName}Detail.vue
        └── {ModuleName}Form.vue

tests/
├── api/
│   └── modules/
│       └── {module-name}.test.ts
└── stores/
    └── {module-name}.test.ts
```

## 命名规范

### 模块命名

- 模块名：kebab-case
- 模型名：PascalCase
- 复数形式：kebab-case + s

### 示例

```
模块名：order
模型名：Order
复数：orders
```

## 最佳实践

### 1. 模块化设计

每个模块独立，职责单一。

### 2. 类型安全

使用 TypeScript 定义所有类型。

### 3. 错误处理

在 Store 中统一处理错误。

### 4. 加载状态

为异步操作添加加载状态。

### 5. 测试覆盖

为 API 和 Store 编写测试。

## 检查清单

创建模块时，确保：

- [ ] 模块命名符合规范
- [ ] 类型定义完整
- [ ] API 接口完整
- [ ] Store 功能完整
- [ ] 组件符合规范
- [ ] 测试文件完整
- [ ] 添加必要的注释
- [ ] 遵循项目规范

## 参考资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
