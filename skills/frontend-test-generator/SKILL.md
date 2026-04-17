---
name: frontend-test-generator
description: Vue 3 + TypeScript 测试生成技能。为组件、API、Store 自动生成符合规范的测试文件。
---

# Frontend Test Generator

你是 Vue 3 + TypeScript 测试生成专家，负责为组件、API、Store 自动生成测试文件。

## 核心功能

- 🧪 **组件测试生成** - 为 Vue 组件生成测试用例
- 🔌 **API 测试生成** - 为 API 模块生成测试
- 🗄️ **Store 测试生成** - 为 Pinia Store 生成测试
- 📋 **测试数据生成** - 生成 Mock 数据和测试夹具
- 📊 **覆盖率分析** - 分析测试覆盖率

## 使用方法

### 基本用法

```
为 UserCard 组件生成测试
```

### 高级用法

```
为 user API 模块生成测试
为 user Store 生成测试
生成所有测试文件
```

## 测试生成流程

### 步骤 1: 识别目标类型

根据文件路径识别目标类型：
- Vue 组件 → 组件测试
- API 模块 → API 测试
- Store 模块 → Store 测试

### 步骤 2: 分析目标文件

分析目标文件的结构：
- Props 定义
- Events 定义
- Methods 定义
- API 接口
- Store 结构

### 步骤 3: 生成测试文件

根据分析结果生成测试文件。

### 步骤 4: 生成 Mock 数据

生成测试所需的 Mock 数据。

## 组件测试生成

### 组件测试模板

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import {{ ComponentName }} from '@/components/{{ type }}/{{ ComponentName }}.vue'
import type { {{ componentTypes }} } from '@/types'

describe('{{ ComponentName }} Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      const wrapper = mount({{ ComponentName }}, {
        props: {
          {{ propsForTest }}
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders with correct props', () => {
      const wrapper = mount({{ ComponentName }}, {
        props: {
          {{ propsForTest }}
        }
      })

      {{ propsAssertions }}
    })
  })

  describe('Events', () => {
    {{ eventTests }}
  })

  describe('Slots', () => {
    {{ slotTests }}
  })

  describe('Methods', () => {
    {{ methodTests }}
  })

  describe('Edge Cases', () => {
    {{ edgeCaseTests }}
  })
})
```

### Props 测试生成

```typescript
// Props 测试
describe('Props', () => {
  it('accepts required props', () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ requiredProps }}
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it({{ 'uses default values for optional props' }}) {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ requiredProps }}
      }
    })

    {{ defaultPropsAssertions }}
  })

  it('validates props', () => {
    // Props 验证测试
  })
})
```

### Events 测试生成

```typescript
// Events 测试
describe('Events', () => {
  it('emits click event', async () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ propsForTest }}
      }
    })

    await wrapper.find('.{{ componentNameKebab }}').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([{{ eventPayload }}])
  })

  it('does not emit event when disabled', async () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ propsForTest }},
        disabled: true
      }
    })

    await wrapper.find('.{{ componentNameKebab }}').trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

### Slots 测试生成

```typescript
// Slots 测试
describe('Slots', () => {
  it('renders default slot', () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ propsForTest }}
      },
      slots: {
        default: 'Slot content'
      }
    })

    expect(wrapper.text()).toContain('Slot content')
  })

  it('renders named slots', () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ propsForTest }}
      },
      slots: {
        header: 'Header content',
        footer: 'Footer content'
      }
    })

    expect(wrapper.text()).toContain('Header content')
    expect(wrapper.text()).toContain('Footer content')
  })
})
```

## API 测试生成

### API 测试模板

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { {moduleName}Api } from '@/api/modules/{module-name}'
import { mock{ModelName}, mock{ModelName}s } from '@/fixtures/data-fixtures'

vi.mock('@/api/request')

describe('{ModelName} API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should return {model-name} list', async () => {
      const mockResponse = {
        list: mock{ModelName}s,
        total: mock{ModelName}s.length,
        page: 1,
        pageSize: 10
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await {moduleName}Api.list({ page: 1, pageSize: 10 })

      expect(result).toEqual(mockResponse)
      expect(request.get).toHaveBeenCalledWith('/{module-name}s', {
        params: { page: 1, pageSize: 10 }
      })
    })

    it('should handle pagination params', async () => {
      const mockResponse = {
        list: [],
        total: 0,
        page: 2,
        pageSize: 20
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      await {moduleName}Api.list({ page: 2, pageSize: 20 })

      expect(request.get).toHaveBeenCalledWith('/{module-name}s', {
        params: { page: 2, pageSize: 20 }
      })
    })

    it('should handle API error', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('API Error'))

      await expect({moduleName}Api.list({ page: 1, pageSize: 10 }))
        .rejects.toThrow('API Error')
    })
  })

  describe('detail', () => {
    it('should return {model-name} detail', async () => {
      vi.mocked(request.get).mockResolvedValue(mock{ModelName})

      const result = await {moduleName}Api.detail('1')

      expect(result).toEqual(mock{ModelName})
      expect(request.get).toHaveBeenCalledWith('/{module-name}s/1')
    })

    it('should handle not found error', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('Not Found'))

      await expect({moduleName}Api.detail('999'))
        .rejects.toThrow('Not Found')
    })
  })

  describe('create', () => {
    it('should create {model-name}', async () => {
      const createDto: Create{ModelName}Dto = {
        {{ createFields }}
      }

      vi.mocked(request.post).mockResolvedValue(mock{ModelName})

      const result = await {moduleName}Api.create(createDto)

      expect(result).toEqual(mock{ModelName})
      expect(request.post).toHaveBeenCalledWith('/{module-name}s', createDto)
    })
  })

  describe('update', () => {
    it('should update {model-name}', async () => {
      const updateDto: Update{ModelName}Dto = {
        {{ updateFields }}
      }

      vi.mocked(request.put).mockResolvedValue(mock{ModelName})

      const result = await {moduleName}Api.update('1', updateDto)

      expect(result).toEqual(mock{ModelName})
      expect(request.put).toHaveBeenCalledWith('/{module-name}s/1', updateDto)
    })
  })

  describe('delete', () => {
    it('should delete {model-name}', async () => {
      vi.mocked(request.delete).mockResolvedValue(undefined)

      await {moduleName}Api.delete('1')

      expect(request.delete).toHaveBeenCalledWith('/{module-name}s/1')
    })
  })
})
```

## Store 测试生成

### Store 测试模板

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { use{ModelName}Store } from '@/stores/{module-name}'
import { mock{ModelName}, mock{ModelName}s } from '@/fixtures/data-fixtures'

vi.mock('@/api/modules/{module-name}')

describe('{ModelName} Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with empty state', () => {
      const store = use{ModelName}Store()

      expect(store.{modelNames}).toEqual([])
      expect(store.current{ModelName}).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.total).toBe(0)
      expect(store.page).toBe(1)
      expect(store.pageSize).toBe(10)
    })

    it('computes has{ModelName}s correctly', () => {
      const store = use{ModelName}Store()

      expect(store.has{ModelName}s).toBe(false)

      store.{modelNames} = [mock{ModelName}]

      expect(store.has{ModelName}s).toBe(true)
    })
  })

  describe('fetch{ModelName}s', () => {
    it('should fetch {model-name}s successfully', async () => {
      const mockResponse = {
        list: mock{ModelName}s,
        total: mock{ModelName}s.length,
        page: 1,
        pageSize: 10
      }

      vi.mocked({moduleName}Api.list).mockResolvedValue(mockResponse)

      const store = use{ModelName}Store()
      await store.fetch{ModelName}s()

      expect(store.{modelNames}).toEqual(mock{ModelName}s)
      expect(store.total).toBe(mock{ModelName}s.length)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set loading state', async () => {
      vi.mocked({moduleName}Api.list).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      const store = use{ModelName}Store()
      const fetchPromise = store.fetch{ModelName}s()

      expect(store.loading).toBe(true)

      await fetchPromise

      expect(store.loading).toBe(false)
    })

    it('should handle error', async () => {
      vi.mocked({moduleName}Api.list).mockRejectedValue(
        new Error('Failed to fetch')
      )

      const store = use{ModelName}Store()

      try {
        await store.fetch{ModelName}s()
      } catch (error) {
        expect(store.error).toBe('Failed to fetch')
        expect(store.loading).toBe(false)
      }
    })
  })

  describe('fetch{ModelName}Detail', () => {
    it('should fetch {model-name} detail successfully', async () => {
      vi.mocked({moduleName}Api.detail).mockResolvedValue(mock{ModelName})

      const store = use{ModelName}Store()
      await store.fetch{ModelName}Detail('1')

      expect(store.current{ModelName}).toEqual(mock{ModelName})
      expect(store.loading).toBe(false)
    })
  })

  describe('create{ModelName}', () => {
    it('should create {model-name} successfully', async () => {
      const createDto: Create{ModelName}Dto = {
        {{ createFields }}
      }

      vi.mocked({moduleName}Api.create).mockResolvedValue(mock{ModelName})

      const store = use{ModelName}Store()
      const result = await store.create{ModelName}(createDto)

      expect(result).toEqual(mock{ModelName})
      expect(store.{modelNames}).toContain(mock{ModelName})
      expect(store.{modelNames}[0]).toEqual(mock{ModelName})
    })
  })

  describe('update{ModelName}', () => {
    it('should update {model-name} successfully', async () => {
      const updated{ModelName} = { ...mock{ModelName}, name: 'Updated' }
      const updateDto: Update{ModelName}Dto = { name: 'Updated' }

      vi.mocked({moduleName}Api.update).mockResolvedValue(updated{ModelName})

      const store = use{ModelName}Store()
      store.{modelNames} = [mock{ModelName}]

      const result = await store.update{ModelName}('1', updateDto)

      expect(result).toEqual(updated{ModelName})
      expect(store.{modelNames}[0]).toEqual(updated{ModelName})
    })
  })

  describe('delete{ModelName}', () => {
    it('should delete {model-name} successfully', async () => {
      vi.mocked({moduleName}Api.delete).mockResolvedValue(undefined)

      const store = use{ModelName}Store()
      store.{modelNames} = [mock{ModelName}]

      await store.delete{ModelName}('1')

      expect(store.{modelNames}).toHaveLength(0)
    })
  })

  describe('reset', () => {
    it('should reset store state', () => {
      const store = use{ModelName}Store()
      store.{modelNames} = [mock{ModelName}]
      store.current{ModelName} = mock{ModelName}
      store.loading = true
      store.error = 'Error'
      store.total = 10
      store.page = 2

      store.reset()

      expect(store.{modelNames}).toEqual([])
      expect(store.current{ModelName}).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.total).toBe(0)
      expect(store.page).toBe(1)
    })
  })
})
```

## Mock 数据生成

### Mock 数据模板

```typescript
// tests/fixtures/data-fixtures.ts

export const mock{ModelName}: {ModelName} = {
  id: '1',
  {{ mockFields }}
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mock{ModelName}s: {ModelName}[] = [
  mock{ModelName},
  {
    id: '2',
    {{ mockFields2 }}
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

export const mockCreate{ModelName}Dto: Create{ModelName}Dto = {
  {{ createFields }}
}

export const mockUpdate{ModelName}Dto: Update{ModelName}Dto = {
  {{ updateFields }}
}
```

## 测试文件位置

### 组件测试

```
tests/components/{type}/{ComponentName}.test.ts
```

### API 测试

```
tests/api/modules/{module-name}.test.ts
```

### Store 测试

```
tests/stores/{module-name}.test.ts
```

### Mock 数据

```
tests/fixtures/data-fixtures.ts
```

## 测试覆盖率

### 覆盖率要求

- **组件测试**: ≥ 80%
- **API 测试**: 100%
- **Store 测试**: ≥ 90%
- **工具函数测试**: 100%

### 生成覆盖率报告

```bash
npm run test:coverage
```

## 最佳实践

### 1. 测试隔离
每个测试应该独立运行，不依赖其他测试。

### 2. Mock 外部依赖
使用 Mock 隔离外部依赖。

### 3. 测试边界情况
测试正常情况和边界情况。

### 4. 使用描述性测试
使用清晰的测试描述。

### 5. 测试异步操作
正确测试异步操作。

## 检查清单

生成测试时，确保：

- [ ] 测试文件位置正确
- [ ] Mock 数据完整
- [ ] 测试用例覆盖全面
- [ ] 测试描述清晰
- [ ] 测试相互独立
- [ ] 测试异步操作正确
- [ ] 测试错误处理
- [ ] 测试覆盖率达标

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 官方文档](https://test-utils.vuejs.org/)
- [Pinia 测试指南](https://pinia.vuejs.org/cookbook/testing.html)
