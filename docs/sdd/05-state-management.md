# 状态管理规范

## 概述

本文档定义了前端项目的状态管理规范，使用 Pinia 作为状态管理工具，确保状态管理的一致性和可维护性。

## Store 组织结构

### 目录结构

```
src/stores/
├── index.ts          # Store 入口
├── user.ts           # 用户状态
├── product.ts        # 产品状态
├── cart.ts           # 购物车状态
├── app.ts            # 应用状态
└── modules/          # 模块化 Store
    └── settings.ts   # 设置状态
```

### Store 命名规范

- 文件名：`kebab-case.ts`
- Store ID：与文件名一致
- 示例：`user.ts` → `useUserStore`

## Store 基本结构

### 标准 Store 结构

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || 'guest')

  // ========== Actions ==========
  async function fetchUser() {
    loading.value = true
    error.value = null

    try {
      user.value = await userApi.getCurrentUser()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    try {
      const { user: userData, token: userToken } = await userApi.login(credentials)
      user.value = userData
      token.value = userToken

      // 持久化到 localStorage
      localStorage.setItem('token', userToken)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  // ========== 初始化 ==========
  function initialize() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      fetchUser()
    }
  }

  // ========== 返回 ==========
  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isLoggedIn,
    userName,
    userRole,

    // Actions
    fetchUser,
    login,
    logout,
    updateUser,
    initialize
  }
})
```

## Store 类型定义

### State 类型

```typescript
interface UserState {
  user: User | null
  token: string
  loading: boolean
  error: string | null
}
```

### Getters 类型

```typescript
interface UserGetters {
  isLoggedIn: boolean
  userName: string
  userRole: string
}
```

### Actions 类型

```typescript
interface UserActions {
  fetchUser: () => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  initialize: () => void
}
```

## 状态持久化

### 使用 Pinia 插件

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(createPersistedState())

export default pinia
```

### 配置持久化

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // ... store 实现
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['user', 'token'] // 只持久化指定的状态
  }
})
```

### Session Storage

```typescript
export const useCartStore = defineStore('cart', () => {
  // ... store 实现
}, {
  persist: {
    key: 'cart-store',
    storage: sessionStorage
  }
})
```

## Store 通信

### Store 之间通信

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function addItem(product: Product) {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    items.value.push({
      productId: product.id,
      userId: userStore.user!.id,
      quantity: 1
    })
  }

  return {
    items,
    addItem
  }
})
```

## 异步状态管理

### 加载状态

```typescript
export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      products.value = await productApi.list()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts
  }
})
```

### 分页状态

```typescript
export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)

  async function fetchProducts() {
    loading.value = true

    try {
      const { list, total: totalCount } = await productApi.list({
        page: page.value,
        pageSize: pageSize.value
      })

      products.value = list
      total.value = totalCount
    } finally {
      loading.value = false
    }
  }

  function nextPage() {
    if (page.value * pageSize.value < total.value) {
      page.value++
      fetchProducts()
    }
  }

  return {
    products,
    total,
    page,
    pageSize,
    loading,
    fetchProducts,
    nextPage
  }
})
```

## 计算属性优化

### 使用 computed

```typescript
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })

  return {
    items,
    totalItems,
    totalPrice
  }
})
```

### 缓存计算结果

```typescript
const expensiveValue = computed(() => {
  // 只在依赖变化时重新计算
  return heavyCalculation(data.value)
})
```

## Store 模块化

### 按功能模块化

```typescript
// stores/modules/settings.ts
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const notifications = ref(true)

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function setLanguage(newLanguage: string) {
    language.value = newLanguage
  }

  function toggleNotifications() {
    notifications.value = !notifications.value
  }

  return {
    theme,
    language,
    notifications,
    setTheme,
    setLanguage,
    toggleNotifications
  }
}, {
  persist: true
})
```

## Store 测试

### 单元测试

```typescript
// tests/stores/user.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

vi.mock('@/api')

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty state', () => {
    const store = useUserStore()

    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('should fetch user successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    }

    vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser)

    const store = useUserStore()
    await store.fetchUser()

    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('should handle fetch user error', async () => {
    vi.mocked(userApi.getCurrentUser).mockRejectedValue(
      new Error('Failed to fetch user')
    )

    const store = useUserStore()

    try {
      await store.fetchUser()
    } catch (error) {
      expect(store.error).toBe('Failed to fetch user')
    }
  })
})
```

## 最佳实践

### 1. 保持 Store 简单
每个 Store 只负责一个领域的状态。

### 2. 使用 TypeScript
为 State、Getters、Actions 定义类型。

### 3. 避免深层嵌套
保持状态结构扁平，便于管理。

### 4. 使用计算属性
使用 computed 派生状态，避免重复计算。

### 5. 持久化关键状态
只持久化必要的状态，避免存储过多数据。

### 6. 错误处理
在异步操作中添加适当的错误处理。

### 7. 加载状态
为异步操作添加加载状态，提升用户体验。

## 性能优化

### 1. 使用 shallowRef
对于大型对象，使用 shallowRef 减少响应式开销。

```typescript
const largeData = shallowRef<LargeDataType>({})
```

### 2. 避免不必要的响应式
对于不需要响应式的数据，使用普通变量。

```typescript
const staticConfig = {
  apiUrl: 'https://api.example.com'
}
```

### 3. 使用 computed 缓存
使用 computed 缓存计算结果。

### 4. 批量更新
对于多个状态更新，使用批量更新。

```typescript
function updateMultipleStates() {
  state1.value = newValue1
  state2.value = newValue2
  state3.value = newValue3
}
```

## 检查清单

创建 Store 时，确保：

- [ ] Store 命名符合规范
- [ ] 类型使用 TypeScript 定义
- [ ] State、Getters、Actions 分离清晰
- [ ] 异步操作有加载状态
- [ ] 错误处理完善
- [ ] 必要的状态持久化
- [ ] 编写单元测试
- [ ] 添加必要的注释

## 示例 Store

```typescript
// stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const message = ref<string | null>(null)

  // Getters
  const sidebarWidth = computed(() => {
    return sidebarCollapsed.value ? '64px' : '256px'
  })

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function showLoading() {
    loading.value = true
  }

  function hideLoading() {
    loading.value = false
  }

  function showMessage(msg: string) {
    message.value = msg
    setTimeout(() => {
      message.value = null
    }, 3000)
  }

  return {
    sidebarCollapsed,
    loading,
    message,
    sidebarWidth,
    toggleSidebar,
    setSidebarCollapsed,
    showLoading,
    hideLoading,
    showMessage
  }
}, {
  persist: {
    key: 'app-store',
    paths: ['sidebarCollapsed']
  }
})
```

## 参考资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
