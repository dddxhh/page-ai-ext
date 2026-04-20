# API 规范

## 概述

本文档定义了前端项目的 API 调用规范，包括 API 模块组织、请求/响应类型定义、错误处理策略和接口版本管理。

## API 模块组织

### 目录结构

```
src/api/
├── modules/           # API 模块
│   ├── user.ts       # 用户相关 API
│   ├── product.ts    # 产品相关 API
│   └── order.ts      # 订单相关 API
├── request.ts        # 请求封装
├── types.ts          # API 类型定义
└── index.ts          # API 入口
```

### 模块组织原则

1. 按业务领域划分模块
2. 每个模块包含相关的 API 接口
3. 使用 TypeScript 定义类型
4. 统一的错误处理

## 请求封装

### 基础请求配置

```typescript
// api/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求 ID
    config.headers['X-Request-ID'] = generateRequestId()

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    handleError(error)
    return Promise.reject(error)
  }
)

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function handleError(error: any) {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 401:
        ElMessage.error('未授权，请重新登录')
        // 跳转到登录页
        window.location.href = '/login'
        break
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误')
        break
      default:
        ElMessage.error(data.message || '请求失败')
    }
  } else if (error.request) {
    ElMessage.error('网络错误，请检查网络连接')
  } else {
    ElMessage.error('请求配置错误')
  }
}

export default instance
```

### 请求方法封装

```typescript
// api/request.ts
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config)
  },
}
```

## API 类型定义

### 通用类型

```typescript
// api/types.ts

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 通用响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  errors?: Record<string, string[]>
}
```

### 用户模块类型

```typescript
// api/modules/user.ts

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user'
}

export interface UpdateUserDto {
  name?: string
  email?: string
  avatar?: string
  role?: 'admin' | 'user'
}

export interface UserListParams extends PageParams {
  keyword?: string
  role?: string
  startDate?: string
  endDate?: string
}
```

### 产品模块类型

```typescript
// api/modules/product.ts

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: string
  images?: string[]
}

export interface ProductListParams extends PageParams {
  keyword?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}
```

## API 模块实现

### 用户模块

```typescript
// api/modules/user.ts
import request from '../request'
import type { User, CreateUserDto, UpdateUserDto, UserListParams, PageResponse } from '../types'

export const userApi = {
  // 获取用户列表
  list(params: UserListParams): Promise<PageResponse<User>> {
    return request.get('/users', { params })
  },

  // 获取用户详情
  detail(id: string): Promise<User> {
    return request.get(`/users/${id}`)
  },

  // 创建用户
  create(data: CreateUserDto): Promise<User> {
    return request.post('/users', data)
  },

  // 更新用户
  update(id: string, data: UpdateUserDto): Promise<User> {
    return request.put(`/users/${id}`, data)
  },

  // 删除用户
  delete(id: string): Promise<void> {
    return request.delete(`/users/${id}`)
  },

  // 批量删除用户
  batchDelete(ids: string[]): Promise<void> {
    return request.delete('/users/batch', { data: { ids } })
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<User> {
    return request.get('/users/me')
  },

  // 更新当前用户信息
  updateCurrentUser(data: UpdateUserDto): Promise<User> {
    return request.put('/users/me', data)
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    return request.post('/users/change-password', data)
  },
}
```

### 产品模块

```typescript
// api/modules/product.ts
import request from '../request'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductListParams,
  PageResponse,
} from '../types'

export const productApi = {
  // 获取产品列表
  list(params: ProductListParams): Promise<PageResponse<Product>> {
    return request.get('/products', { params })
  },

  // 获取产品详情
  detail(id: string): Promise<Product> {
    return request.get(`/products/${id}`)
  },

  // 创建产品
  create(data: CreateProductDto): Promise<Product> {
    return request.post('/products', data)
  },

  // 更新产品
  update(id: string, data: UpdateProductDto): Promise<Product> {
    return request.put(`/products/${id}`, data)
  },

  // 删除产品
  delete(id: string): Promise<void> {
    return request.delete(`/products/${id}`)
  },

  // 批量删除产品
  batchDelete(ids: string[]): Promise<void> {
    return request.delete('/products/batch', { data: { ids } })
  },

  // 更新库存
  updateStock(id: string, stock: number): Promise<void> {
    return request.patch(`/products/${id}/stock`, { stock })
  },

  // 上传产品图片
  uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
```

## API 入口

```typescript
// api/index.ts
export { userApi } from './modules/user'
export { productApi } from './modules/product'
export type * from './types'
```

## 错误处理策略

### 错误类型

```typescript
// api/error.ts

export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 0,
  SUCCESS = 1,
  PARAM_ERROR = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,

  // 业务错误
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INVALID_PASSWORD = 1003,
  PRODUCT_NOT_FOUND = 2001,
  PRODUCT_OUT_OF_STOCK = 2002,
}

export class ApiError extends Error {
  code: ErrorCode
  details?: any

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}
```

### 错误处理

```typescript
// api/request.ts
import { ApiError, ErrorCode } from './error'

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data

    if (code === ErrorCode.SUCCESS) {
      return data
    } else {
      throw new ApiError(code, message, response.data)
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      throw new ApiError(status, data.message || '请求失败', data)
    } else if (error.request) {
      throw new ApiError(ErrorCode.UNKNOWN_ERROR, '网络错误')
    } else {
      throw new ApiError(ErrorCode.UNKNOWN_ERROR, '请求配置错误')
    }
  }
)
```

### 使用示例

```typescript
import { userApi } from '@/api'
import { ApiError, ErrorCode } from '@/api/error'

try {
  const user = await userApi.detail('123')
  console.log(user)
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ErrorCode.USER_NOT_FOUND:
        console.log('用户不存在')
        break
      case ErrorCode.UNAUTHORIZED:
        console.log('未授权')
        break
      default:
        console.log(error.message)
    }
  }
}
```

## 接口版本管理

### 版本策略

使用 URL 路径进行版本控制：

```
/v1/users
/v2/users
```

### 版本配置

```typescript
// api/config.ts
export const API_VERSION = 'v1'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
```

### 版本化请求

```typescript
// api/request.ts
import { API_VERSION, API_BASE_URL } from './config'

const instance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 10000,
})
```

## Mock 数据

### Mock 配置

```typescript
// api/mock/user.ts
import type { User, CreateUserDto, UpdateUserDto, UserListParams, PageResponse } from '../types'

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

export const mockUserApi = {
  async list(params: UserListParams): Promise<PageResponse<User>> {
    await delay(500)

    let filteredUsers = [...mockUsers]

    if (params.keyword) {
      filteredUsers = filteredUsers.filter(
        (user) => user.name.includes(params.keyword!) || user.email.includes(params.keyword!)
      )
    }

    if (params.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === params.role)
    }

    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize

    return {
      list: filteredUsers.slice(start, end),
      total: filteredUsers.length,
      page: params.page,
      pageSize: params.pageSize,
    }
  },

  async detail(id: string): Promise<User> {
    await delay(300)

    const user = mockUsers.find((u) => u.id === id)
    if (!user) {
      throw new Error('User not found')
    }

    return user
  },

  async create(data: CreateUserDto): Promise<User> {
    await delay(500)

    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    return newUser
  },
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

### Mock 切换

```typescript
// api/modules/user.ts
import request from '../request'
import { mockUserApi } from '../mock/user'
import type { User, CreateUserDto, UpdateUserDto, UserListParams, PageResponse } from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const userApi = USE_MOCK
  ? mockUserApi
  : {
      // 真实 API 实现
    }
```

## 最佳实践

### 1. 类型安全

始终使用 TypeScript 定义 API 接口的类型。

### 2. 错误处理

统一处理 API 错误，提供友好的错误提示。

### 3. 请求取消

使用 Axios CancelToken 取消未完成的请求。

```typescript
import axios from 'axios'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

request.get('/users', {
  cancelToken: source.token,
})

// 取消请求
source.cancel('Request canceled')
```

### 4. 请求重试

对于失败的请求，实现自动重试机制。

```typescript
import axios from 'axios'

async function requestWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
```

### 5. 请求缓存

对于不经常变化的数据，实现请求缓存。

```typescript
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

async function cachedRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const data = await fn()
  cache.set(key, { data, timestamp: Date.now() })

  return data
}
```

## 检查清单

创建 API 模块时，确保：

- [ ] 模块按业务领域划分
- [ ] 类型定义完整
- [ ] 错误处理完善
- [ ] 添加必要的注释
- [ ] 编写单元测试
- [ ] 考虑请求取消
- [ ] 考虑请求重试
- [ ] 考虑请求缓存

## 参考资源

- [Axios 官方文档](https://axios-http.com/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
