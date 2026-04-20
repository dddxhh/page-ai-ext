# 测试规范

## 概述

本文档定义了前端项目的测试规范，包括单元测试、组件测试、集成测试和 E2E 测试的编写规范。

## 测试框架

### 技术栈

- **单元测试**: Vitest
- **组件测试**: @vue/test-utils
- **E2E 测试**: Playwright
- **测试覆盖率**: @vitest/coverage-v8

### 配置文件

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/mockData', 'dist/'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
})
```

## 测试目录结构

```
tests/
├── setup.ts              # 测试配置
├── mocks/                # Mock 数据
│   ├── chrome-api.mock.ts
│   └── api.mock.ts
├── fixtures/             # 测试数据
│   └── data-fixtures.ts
├── unit/                 # 单元测试
│   ├── utils/
│   │   └── date-utils.test.ts
│   └── api/
│       └── user-api.test.ts
├── components/           # 组件测试
│   ├── base/
│   │   └── Button.test.ts
│   └── business/
│       └── UserCard.test.ts
├── stores/               # Store 测试
│   └── user.test.ts
└── e2e/                  # E2E 测试
    └── login.spec.ts
```

## 测试配置

### 全局配置

```typescript
// tests/setup.ts
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局 mock
vi.mock('@/api/user', () => ({
  userApi: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

// 全局组件配置
config.global.mocks = {
  $t: (key: string) => key,
}
```

### Mock 数据

```typescript
// tests/fixtures/data-fixtures.ts
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

export const mockProduct = {
  id: '1',
  name: 'Product 1',
  description: 'Description',
  price: 100,
  stock: 10,
  category: 'electronics',
}

export const mockUsers = [
  mockUser,
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'user',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
]
```

## 单元测试

### 工具函数测试

```typescript
// tests/unit/utils/date-utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, getRelativeTime } from '@/utils/date-utils'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01')
      expect(formatDate(date)).toBe('2024-01-01')
    })

    it('should handle invalid date', () => {
      expect(formatDate(null)).toBe('')
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-01T12:00:00')
      expect(formatTime(date)).toBe('12:00')
    })
  })

  describe('getRelativeTime', () => {
    it('should return "just now" for now', () => {
      const now = new Date()
      expect(getRelativeTime(now)).toBe('just now')
    })

    it('should return "1 hour ago" for 1 hour ago', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago')
    })
  })
})
```

### API 测试

```typescript
// tests/unit/api/user-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userApi } from '@/api/user'
import { mockUser, mockUsers } from '@/fixtures/data-fixtures'

vi.mock('@/api/request')

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      vi.mocked(request.get).mockResolvedValue(mockUser)

      const user = await userApi.getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(request.get).toHaveBeenCalledWith('/users/me')
    })
  })

  describe('list', () => {
    it('should return user list', async () => {
      const mockResponse = {
        list: mockUsers,
        total: 2,
        page: 1,
        pageSize: 10,
      }

      vi.mocked(request.get).mockResolvedValue(mockResponse)

      const result = await userApi.list({ page: 1, pageSize: 10 })

      expect(result).toEqual(mockResponse)
      expect(request.get).toHaveBeenCalledWith('/users', {
        params: { page: 1, pageSize: 10 },
      })
    })
  })
})
```

## 组件测试

### 基础组件测试

```typescript
// tests/components/base/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/base/Button.vue'

describe('Button Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Click me',
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Click me',
        disabled: true,
      },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('applies correct class for type', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Click me',
        type: 'primary',
      },
    })

    expect(wrapper.find('button').classes()).toContain('button--primary')
  })
})
```

### 业务组件测试

```typescript
// tests/components/business/UserCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '@/components/business/UserCard.vue'
import { mockUser } from '@/fixtures/data-fixtures'

describe('UserCard Component', () => {
  it('renders user information', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: mockUser,
      },
    })

    expect(wrapper.text()).toContain(mockUser.name)
    expect(wrapper.text()).toContain(mockUser.email)
  })

  it('emits click event when clickable', async () => {
    const wrapper = mount(UserCard, {
      props: {
        user: mockUser,
        clickable: true,
      },
    })

    await wrapper.find('.user-card').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([mockUser])
  })

  it('does not emit click event when not clickable', async () => {
    const wrapper = mount(UserCard, {
      props: {
        user: mockUser,
        clickable: false,
      },
    })

    await wrapper.find('.user-card').trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

### 异步组件测试

```typescript
// tests/components/business/UserList.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserList from '@/components/business/UserList.vue'
import { mockUsers } from '@/fixtures/data-fixtures'

vi.mock('@/api/user')

describe('UserList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    const wrapper = mount(UserList)

    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('renders user list after loading', async () => {
    vi.mocked(userApi.list).mockResolvedValue({
      list: mockUsers,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    const wrapper = mount(UserList)

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.findAll('.user-card')).toHaveLength(2)
  })

  it('renders error message on error', async () => {
    vi.mocked(userApi.list).mockRejectedValue(new Error('Failed to fetch'))

    const wrapper = mount(UserList)

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to fetch')
  })
})
```

## Store 测试

```typescript
// tests/stores/user.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { mockUser } from '@/fixtures/data-fixtures'

vi.mock('@/api/user')

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useUserStore()

    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('fetches user successfully', async () => {
    vi.mocked(userApi.getCurrentUser).mockResolvedValue(mockUser)

    const store = useUserStore()
    await store.fetchUser()

    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('handles fetch user error', async () => {
    vi.mocked(userApi.getCurrentUser).mockRejectedValue(new Error('Failed to fetch user'))

    const store = useUserStore()

    try {
      await store.fetchUser()
    } catch (error) {
      expect(store.error).toBe('Failed to fetch user')
    }
  })

  it('logs in successfully', async () => {
    const credentials = {
      email: 'john@example.com',
      password: 'password',
    }

    vi.mocked(userApi.login).mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    })

    const store = useUserStore()
    await store.login(credentials)

    expect(store.user).toEqual(mockUser)
    expect(store.token).toBe('mock-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('logs out correctly', () => {
    const store = useUserStore()
    store.user = mockUser
    store.token = 'mock-token'

    store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })
})
```

## E2E 测试

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
```

### E2E 测试示例

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.user-name')).toContainText('Test User')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    await expect(page.locator('.email-error')).toBeVisible()
    await expect(page.locator('.email-error')).toContainText('Invalid email format')
  })
})
```

## 测试覆盖率

### 覆盖率要求

- **整体覆盖率**: ≥ 80%
- **关键模块覆盖率**: ≥ 90%
- **工具函数覆盖率**: 100%

### 运行覆盖率测试

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看覆盖率报告
open coverage/index.html
```

## 测试最佳实践

### 1. 测试命名

```typescript
// ✅ 好
it('should return user when id is valid', () => {})

// ❌ 差
it('test user', () => {})
```

### 2. 测试隔离

```typescript
// ✅ 好：每个测试独立
beforeEach(() => {
  vi.clearAllMocks()
})

it('test 1', () => {})
it('test 2', () => {})
```

### 3. 使用描述性测试

```typescript
// ✅ 好
describe('User API', () => {
  describe('getCurrentUser', () => {
    it('should return current user', () => {})
  })
})

// ❌ 差
describe('Tests', () => {
  it('test 1', () => {})
})
```

### 4. Mock 外部依赖

```typescript
// ✅ 好：mock 外部 API
vi.mock('@/api/user')

// ❌ 差：使用真实 API
```

### 5. 测试边界情况

```typescript
// ✅ 好：测试各种情况
it('handles empty input', () => {})
it('handles null input', () => {})
it('handles invalid input', () => {})

// ❌ 差：只测试正常情况
it('works', () => {})
```

## 检查清单

编写测试时，确保：

- [ ] 测试命名清晰
- [ ] 测试相互独立
- [ ] Mock 外部依赖
- [ ] 测试边界情况
- [ ] 测试错误处理
- [ ] 测试覆盖率达标
- [ ] 添加必要的注释
- [ ] 测试运行快速

## 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行组件测试
npm run test:components

# 运行 E2E 测试
npm run test:e2e

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 官方文档](https://test-utils.vuejs.org/)
- [Playwright 官方文档](https://playwright.dev/)
