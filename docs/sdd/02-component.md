# 组件开发规范

## 概述

本文档定义了 Vue 3 + TypeScript 组件的开发规范，确保组件质量、可维护性和一致性。

## 组件命名规范

### 文件命名

- 使用 **PascalCase**
- 示例：`UserCard.vue`, `OrderList.vue`, `ProductDetail.vue`

### 组件注册名

- 使用 **kebab-case**
- 示例：`user-card`, `order-list`, `product-detail`

### 组件内部命名

- 使用 **PascalCase**
- 示例：`UserCard`, `OrderList`, `ProductDetail`

## 单文件组件结构

### 标准结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
  // 1. Imports
  import { ref, computed, onMounted } from 'vue'

  // 2. Props 定义
  interface Props {
    title: string
    count?: number
    disabled?: boolean
  }
  const props = withDefaults(defineProps<Props>(), {
    count: 0,
    disabled: false,
  })

  // 3. Emits 定义
  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'submit', data: FormData): void
  }
  const emit = defineEmits<Emits>()

  // 4. 响应式数据
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 5. 计算属性
  const displayTitle = computed(() => {
    return props.title || 'Default Title'
  })

  // 6. 方法
  async function handleSubmit() {
    loading.value = true
    try {
      // 处理逻辑
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 7. 生命周期
  onMounted(() => {
    console.log('Component mounted')
  })

  // 8. 暴露给父组件的方法
  defineExpose({
    handleSubmit,
  })
</script>

<style scoped lang="scss">
  // 组件样式
  .component {
    // 样式
  }
</style>
```

### 结构说明

#### 1. Imports

导入所有需要的依赖，按类型分组：

- Vue 相关
- 第三方库
- 项目内部模块
- 类型定义

#### 2. Props 定义

- 使用 TypeScript 接口定义 Props 类型
- 使用 `withDefaults` 设置默认值
- Props 应该是只读的，不要直接修改

#### 3. Emits 定义

- 使用 TypeScript 接口定义 Emits 类型
- 事件名使用 kebab-case
- 明确事件参数类型

#### 4. 响应式数据

- 使用 `ref` 或 `reactive` 定义响应式数据
- 复杂对象使用 `reactive`
- 简单值使用 `ref`

#### 5. 计算属性

- 使用 `computed` 定义计算属性
- 计算属性应该是纯函数

#### 6. 方法

- 方法名使用 camelCase
- 方法应该有明确的职责
- 复杂逻辑拆分为多个方法

#### 7. 生命周期

- 按照生命周期顺序排列
- 只在必要时使用生命周期钩子

#### 8. 暴露方法

- 使用 `defineExpose` 暴露需要被父组件调用的方法
- 只暴露必要的方法

## Props 规范

### 命名规范

- 使用 **camelCase**
- 示例：`userName`, `isLoading`, `userList`

### 类型定义

```typescript
interface Props {
  // 基本类型
  id: string
  count: number
  active: boolean

  // 可选类型
  title?: string
  data?: UserData[]

  // 复杂类型
  config: {
    theme: string
    mode: 'light' | 'dark'
  }

  // 函数类型
  onSave?: (data: SaveData) => void

  // 组件类型
  icon?: Component
}
```

### 默认值

```typescript
const props = withDefaults(defineProps<Props>(), {
  title: 'Default Title',
  count: 0,
  active: false,
  data: () => [],
})
```

### Props 验证

```typescript
interface Props {
  email: string
  age: number
}

const props = defineProps<Props>()

// 验证逻辑
if (!isValidEmail(props.email)) {
  throw new Error('Invalid email format')
}

if (props.age < 0 || props.age > 150) {
  throw new Error('Age must be between 0 and 150')
}
```

## Emits 规范

### 命名规范

- 使用 **kebab-case**
- 示例：`update:modelValue`, `item-click`, `form-submit`

### 类型定义

```typescript
interface Emits {
  // 无参数事件
  (e: 'close'): void

  // 单个参数事件
  (e: 'update:value', value: string): void

  // 多个参数事件
  (e: 'change', oldValue: string, newValue: string): void

  // 对象参数事件
  (e: 'submit', data: { id: string; value: any }): void
}

const emit = defineEmits<Emits>()
```

### 事件触发

```typescript
// 触发事件
emit('close')
emit('update:value', newValue)
emit('change', oldValue, newValue)
emit('submit', { id: '1', value: data })
```

## Slots 规范

### 命名规范

- 使用 **kebab-case**
- 示例：`header`, `footer`, `item`

### 默认 Slot

```vue
<template>
  <div class="component">
    <slot></slot>
  </div>
</template>
```

### 命名 Slot

```vue
<template>
  <div class="component">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

### 作用域 Slot

```vue
<template>
  <div class="list">
    <div v-for="item in items" :key="item.id">
      <slot name="item" :item="item" :index="index"></slot>
    </div>
  </div>
</template>
```

## 组件通信模式

### 1. Props Down, Events Up

```vue
<!-- 父组件 -->
<template>
  <ChildComponent :value="parentValue" @update:value="handleUpdate" />
</template>

<!-- 子组件 -->
<script setup lang="ts">
  interface Props {
    value: string
  }

  interface Emits {
    (e: 'update:value', value: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  function handleChange(newValue: string) {
    emit('update:value', newValue)
  }
</script>
```

### 2. v-model

```vue
<!-- 父组件 -->
<template>
  <ChildComponent v-model="value" />
</template>

<!-- 子组件 -->
<script setup lang="ts">
  interface Props {
    modelValue: string
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  function handleChange(newValue: string) {
    emit('update:modelValue', newValue)
  }
</script>
```

### 3. Provide/Inject

```typescript
// 父组件
import { provide } from 'vue'

provide('theme', 'dark')

// 子组件
import { inject } from 'vue'

const theme = inject<string>('theme', 'light')
```

### 4. Ref 暴露

```vue
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const childRef = ref<InstanceType<typeof ChildComponent>>()

  function callChildMethod() {
    childRef.value?.exposedMethod()
  }
</script>

<!-- 子组件 -->
<script setup lang="ts">
  function exposedMethod() {
    // 方法实现
  }

  defineExpose({
    exposedMethod,
  })
</script>
```

## 组件复用原则

### 1. 单一职责

每个组件只负责一个功能。

### 2. 组合优于继承

使用组合式函数复用逻辑。

### 3. Props 配置化

通过 Props 控制组件行为，而不是硬编码。

### 4. Slot 灵活性

使用 Slot 提供扩展点。

## 性能优化

### 1. 使用 v-memo

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.active]">
    {{ item.name }}
  </div>
</template>
```

### 2. 使用 v-once

```vue
<template>
  <div v-once>
    {{ staticContent }}
  </div>
</template>
```

### 3. 计算属性缓存

```typescript
const expensiveValue = computed(() => {
  // 只在依赖变化时重新计算
  return heavyCalculation(props.data)
})
```

### 4. 避免不必要的响应式

```typescript
// 不需要响应式的数据
const staticConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}
```

### 5. 使用 shallowRef/shallowReactive

```typescript
// 大型对象使用浅层响应式
const largeData = shallowRef<LargeDataType>({})
```

## 组件生命周期

### 常用生命周期

```typescript
import { onMounted, onUpdated, onUnmounted } from 'vue'

onMounted(() => {
  // 组件挂载后
})

onUpdated(() => {
  // 组件更新后
})

onUnmounted(() => {
  // 组件卸载前
})
```

### 清理资源

```typescript
onUnmounted(() => {
  // 清理定时器
  clearInterval(timer)

  // 清理事件监听
  window.removeEventListener('resize', handleResize)

  // 清理订阅
  subscription.unsubscribe()
})
```

## 组件测试

### 测试结构

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('emits event on click', async () => {
    const wrapper = mount(MyComponent)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

## 组件文档

### JSDoc 注释

````typescript
/**
 * 用户卡片组件
 *
 * @description 显示用户信息的卡片组件
 *
 * @example
 * ```vue
 * <UserCard
 *   :user="userData"
 *   @click="handleUserClick"
 * />
 * ```
 */
````

### Props 文档

```typescript
/**
 * 用户数据
 */
user: {
  type: Object as PropType<User>,
  required: true,
  validator: (value: User) => {
    return value.id && value.name
  }
}
```

## 最佳实践

### 1. 组件拆分

将大型组件拆分为多个小组件。

### 2. 逻辑复用

使用组合式函数复用逻辑。

### 3. 类型安全

始终使用 TypeScript 类型定义。

### 4. 错误处理

添加适当的错误处理和边界检查。

### 5. 可访问性

遵循 WCAG 可访问性标准。

### 6. 性能监控

使用 Vue DevTools 监控组件性能。

## 检查清单

创建组件时，确保：

- [ ] 组件命名符合规范
- [ ] Props 类型定义完整
- [ ] Emits 类型定义完整
- [ ] 组件结构符合标准
- [ ] 添加必要的注释
- [ ] 编写单元测试
- [ ] 考虑性能优化
- [ ] 处理错误情况
- [ ] 添加可访问性支持

## 示例组件

```vue
<template>
  <div class="user-card">
    <div class="user-card__avatar">
      <img :src="user.avatar" :alt="user.name" />
    </div>
    <div class="user-card__info">
      <h3 class="user-card__name">{{ user.name }}</h3>
      <p class="user-card__email">{{ user.email }}</p>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
  import type { User } from '@/types'

  interface Props {
    user: User
    clickable?: boolean
  }

  interface Emits {
    (e: 'click', user: User): void
  }

  const props = withDefaults(defineProps<Props>(), {
    clickable: false,
  })

  const emit = defineEmits<Emits>()

  function handleClick() {
    if (props.clickable) {
      emit('click', props.user)
    }
  }
</script>

<style scoped lang="scss">
  .user-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;

    &:hover {
      background: #f5f5f5;
    }

    &__avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__info {
      flex: 1;
    }

    &__name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    &__email {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
</style>
```

## Composables 开发规范

### 概述

Composables 是 Vue 3 Composition API 的核心概念，用于封装和复用有状态的逻辑。

### 文件命名

- 使用 `use` 前缀 + 功能名称
- 示例：`useMarkdown.ts`, `useSkillFilter.ts`, `useLocale.ts`
- 文件位置：`entrypoints/sidebar/composables/`

### 标准结构

```typescript
// composables/useExample.ts
import { ref, computed } from 'vue'

export function useExample(initialValue: string) {
  // 1. 响应式状态
  const data = ref(initialValue)
  const isLoading = ref(false)

  // 2. 计算属性
  const processedData = computed(() => {
    return data.value.toUpperCase()
  })

  // 3. 方法
  async function fetchData(): Promise<void> {
    isLoading.value = true
    try {
      // 业务逻辑
    } finally {
      isLoading.value = false
    }
  }

  // 4. 返回值 - 导出所有需要的状态和方法
  return {
    data,
    isLoading,
    processedData,
    fetchData,
  }
}
```

### Composables 最佳实践

1. **单一职责** - 每个 composable 只负责一个功能领域
2. **可组合** - composables 可以相互调用
3. **无副作用** - 除非必要，避免直接修改外部状态
4. **返回值类型** - 使用 TypeScript 定义返回类型

### 项目中的 Composables

| Composable             | 功能                                   | 文件位置                              |
| ---------------------- | -------------------------------------- | ------------------------------------- |
| `useMarkdown`          | Markdown 渲染 + YAML front matter 解析 | `composables/useMarkdown.ts`          |
| `useSkillFilter`       | 技能搜索、分类过滤                     | `composables/useSkillFilter.ts`       |
| `useSkillImportExport` | 技能导入导出                           | `composables/useSkillImportExport.ts` |
| `useSkillForm`         | 技能表单验证、数据初始化               | `composables/useSkillForm.ts`         |
| `useLocale`            | 国际化语言切换                         | `composables/useLocale.ts`            |

### Composable 测试

每个 composable 应有对应的测试文件，位于 `tests/composables/` 目录：

```
tests/composables/
├── useMarkdown.test.ts
├── useSkillFilter.test.ts
├── useSkillImportExport.test.ts
└── useSkillForm.test.ts
```

## 参考资源

- [Vue 3 组件基础](https://vuejs.org/guide/essentials/component-basics.html)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
