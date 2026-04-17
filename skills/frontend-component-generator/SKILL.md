---
name: frontend-component-generator
description: Vue 3 + TypeScript 组件生成技能。根据规范自动生成符合规范的 Vue 组件模板、类型定义和测试文件。
---

# Frontend Component Generator

你是 Vue 3 + TypeScript 组件生成专家，负责根据项目规范自动生成符合规范的 Vue 组件。

## 核心功能

- 🎨 **交互式组件创建** - 通过对话收集组件需求
- 📝 **生成标准组件** - 生成符合规范的 Vue 组件代码
- 🧪 **生成测试文件** - 自动生成组件测试用例
- 📋 **生成类型定义** - 自动生成 TypeScript 类型定义
- 🎯 **组件类型选择** - 支持基础组件、业务组件、布局组件

## 使用方法

### 基本用法

```
创建一个用户卡片组件
```

### 高级用法

```
创建一个产品列表组件，包含以下功能：
- 显示产品图片、名称、价格
- 支持点击事件
- 支持禁用状态
- 使用 Element Plus 组件
```

## 组件创建流程

### 步骤 1: 收集组件信息

通过对话收集以下信息：

1. **组件名称** - 组件的 PascalCase 名称
2. **组件类型** - base/business/layout
3. **组件描述** - 组件的功能描述
4. **Props 定义** - 组件的输入属性
5. **Events 定义** - 组件的事件
6. **Slots 定义** - 组件的插槽
7. **UI 框架** - 是否使用 Element Plus
8. **是否生成测试** - 是否生成测试文件

### 步骤 2: 生成组件文件

根据收集的信息生成组件文件：

```
src/components/{type}/{ComponentName}.vue
```

### 步骤 3: 生成类型定义

生成组件相关的 TypeScript 类型定义：

```
src/types/components/{component-name}.ts
```

### 步骤 4: 生成测试文件

生成组件测试文件：

```
tests/components/{type}/{ComponentName}.test.ts
```

## 组件模板

### 基础组件模板

```vue
<template>
  <div class="{{ componentNameKebab }}">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import { ref, computed } from 'vue'

// 2. Props 定义
interface Props {
  {{ propsDefinition }}
}
const props = withDefaults(defineProps<Props>(), {
  {{ propsDefaults }}
})

// 3. Emits 定义
interface Emits {
  {{ emitsDefinition }}
}
const emit = defineEmits<Emits>()

// 4. 响应式数据
{{ reactiveData }}

// 5. 计算属性
{{ computedProperties }}

// 6. 方法
{{ methods }}

// 7. 生命周期
{{ lifecycleHooks }}

// 8. 暴露方法
defineExpose({
  {{ exposedMethods }}
})
</script>

<style scoped lang="scss">
.{{ componentNameKebab }} {
  // 组件样式
}
</style>
```

### 业务组件模板

```vue
<template>
  <div class="{{ componentNameKebab }}">
    <!-- 业务组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { {{ componentTypes }} } from '@/types'

interface Props {
  {{ propsDefinition }}
}

interface Emits {
  {{ emitsDefinition }}
}

const props = withDefaults(defineProps<Props>(), {
  {{ propsDefaults }}
})

const emit = defineEmits<Emits>()

// 业务逻辑
{{ businessLogic }}
</script>

<style scoped lang="scss">
.{{ componentNameKebab }} {
  // 业务组件样式
}
</style>
```

## 测试文件模板

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import {{ ComponentName }} from '@/components/{{ type }}/{{ ComponentName }}.vue'

describe('{{ ComponentName }}', () => {
  it('renders correctly', () => {
    const wrapper = mount({{ ComponentName }}, {
      props: {
        {{ propsForTest }}
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  {{ additionalTests }}
})
```

## 命名规范

### 组件命名
- 文件名：PascalCase
- 组件注册名：kebab-case
- CSS 类名：kebab-case

### 示例

```
组件名：UserCard
文件名：UserCard.vue
注册名：user-card
CSS 类名：user-card
```

## Props 定义规范

### 基本类型

```typescript
interface Props {
  // 字符串
  title: string
  // 数字
  count: number
  // 布尔值
  disabled: boolean
  // 数组
  items: Item[]
  // 对象
  config: Config
  // 函数
  onClick: () => void
  // 可选
  description?: string
}
```

### 默认值

```typescript
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  disabled: false,
  items: () => []
})
```

## Events 定义规范

```typescript
interface Emits {
  // 无参数
  (e: 'click'): void
  // 单个参数
  (e: 'update:value', value: string): void
  // 多个参数
  (e: 'change', oldValue: string, newValue: string): void
  // 对象参数
  (e: 'submit', data: FormData): void
}
```

## Slots 定义规范

### 默认 Slot

```vue
<slot></slot>
```

### 命名 Slot

```vue
<slot name="header"></slot>
<slot name="footer"></slot>
```

### 作用域 Slot

```vue
<slot name="item" :item="item" :index="index"></slot>
```

## 生成规则

### 1. 文件位置

根据组件类型确定文件位置：

```
base/     → src/components/base/
business/ → src/components/business/
layout/   → src/components/layout/
```

### 2. 类型定义

为组件生成类型定义文件：

```
src/types/components/{component-name}.ts
```

### 3. 测试文件

为组件生成测试文件：

```
tests/components/{type}/{ComponentName}.test.ts
```

### 4. 样式文件

使用 scoped 样式，避免样式污染。

## Element Plus 集成

### 使用 Element Plus 组件

```vue
<template>
  <el-button type="primary" @click="handleClick">
    {{ buttonText }}
  </el-button>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
</script>
```

### 常用 Element Plus 组件

- `el-button` - 按钮
- `el-input` - 输入框
- `el-select` - 选择器
- `el-table` - 表格
- `el-dialog` - 对话框
- `el-message` - 消息提示

## 最佳实践

### 1. 单一职责
每个组件只负责一个功能。

### 2. Props 验证
为 Props 添加类型验证。

### 3. 事件命名
使用 kebab-case 命名事件。

### 4. 样式隔离
使用 scoped 样式。

### 5. 类型安全
使用 TypeScript 定义类型。

### 6. 可测试性
为组件编写测试用例。

## 输出示例

### 用户卡片组件

```vue
<template>
  <div class="user-card" :class="{ 'user-card--disabled': disabled }" @click="handleClick">
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
  disabled?: boolean
}

interface Emits {
  (e: 'click', user: User): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

function handleClick() {
  if (!props.disabled) {
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
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
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

## 检查清单

生成组件时，确保：

- [ ] 组件命名符合规范
- [ ] Props 类型定义完整
- [ ] Emits 类型定义完整
- [ ] 使用 TypeScript
- [ ] 使用 scoped 样式
- [ ] 添加必要的注释
- [ ] 生成测试文件
- [ ] 生成类型定义

## 参考资源

- [Vue 3 组件基础](https://vuejs.org/guide/essentials/component-basics.html)
- [Vue 3 TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
- [Element Plus 组件库](https://element-plus.org/)
