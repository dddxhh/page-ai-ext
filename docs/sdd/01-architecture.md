# 项目架构规范

## 概述

本文档定义了 Vue 3 + TypeScript 前端项目的标准架构规范，确保项目结构清晰、可维护、可扩展。

## 目录结构

### 标准目录结构

```
src/
├── assets/              # 静态资源
│   ├── images/         # 图片资源
│   ├── icons/          # 图标资源
│   └── fonts/          # 字体文件
├── components/          # 组件目录
│   ├── base/           # 基础组件（Button, Input 等）
│   ├── business/       # 业务组件（UserCard, OrderList 等）
│   └── layout/         # 布局组件（Header, Sidebar 等）
├── composables/         # 组合式函数（可复用逻辑）
├── stores/             # Pinia 状态管理
├── api/                # API 接口
│   ├── modules/        # API 模块
│   ├── request.ts      # 请求封装
│   └── types.ts        # API 类型定义
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── constants/          # 常量定义
├── styles/             # 全局样式
│   ├── variables.scss  # CSS 变量
│   ├── mixins.scss     # SCSS mixins
│   └── index.scss      # 样式入口
├── router/              # 路由配置
├── views/              # 页面组件
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

### 目录说明

#### assets/
存放静态资源文件，按类型分类。

**命名规范**：
- 图片：`kebab-case.png` 或 `kebab-case.svg`
- 图标：`icon-name.svg`
- 字体：`font-name.woff2`

#### components/
组件目录，按用途分为三类：

**base/** - 基础组件
- 纯 UI 组件，无业务逻辑
- 可复用性强
- 示例：`Button.vue`, `Input.vue`, `Modal.vue`

**business/** - 业务组件
- 包含业务逻辑的组件
- 特定于业务场景
- 示例：`UserCard.vue`, `OrderList.vue`, `ProductCard.vue`

**layout/** - 布局组件
- 页面布局相关组件
- 示例：`Header.vue`, `Sidebar.vue`, `Footer.vue`

#### composables/
使用 Composition API 的可复用逻辑。

**命名规范**：
- 文件名：`use<功能名>.ts`
- 示例：`useAuth.ts`, `useRequest.ts`, `useLocalStorage.ts`

**结构规范**：
```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue'

export function useAuth() {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  // Methods
  async function login(credentials: LoginCredentials) {
    // 登录逻辑
  }

  function logout() {
    // 登出逻辑
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}
```

#### stores/
Pinia 状态管理模块。

**命名规范**：
- 文件名：`<模块名>.ts`
- Store ID：与文件名一致
- 示例：`user.ts`, `product.ts`, `cart.ts`

#### api/
API 接口模块。

**modules/** - 按 API 模块分类
- 示例：`user.ts`, `product.ts`, `order.ts`

**request.ts** - 请求封装
- 统一的请求拦截器
- 统一的错误处理
- 请求/响应转换

**types.ts** - API 类型定义
- 请求参数类型
- 响应数据类型

#### types/
全局 TypeScript 类型定义。

**分类**：
- `api.ts` - API 相关类型
- `models.ts` - 数据模型类型
- `components.ts` - 组件 Props/Events 类型
- `common.ts` - 通用类型

#### utils/
工具函数，按功能分类。

**命名规范**：
- 文件名：`kebab-case.ts`
- 函数名：`camelCase`
- 示例：`date-utils.ts`, `string-utils.ts`, `validation.ts`

#### constants/
常量定义，避免魔法值。

**命名规范**：
- 文件名：`kebab-case.ts`
- 常量名：`UPPER_SNAKE_CASE`
- 示例：`api-endpoints.ts`, `error-codes.ts`, `config.ts`

#### styles/
全局样式文件。

**variables.scss** - CSS 变量
- 颜色变量
- 间距变量
- 字体变量
- 断点变量

**mixins.scss** - SCSS mixins
- 常用样式混入
- 响应式混入

**index.scss** - 样式入口
- 导入所有样式文件

## 模块划分原则

### 单一职责原则
每个模块只负责一个功能领域。

### 依赖方向
上层模块依赖下层模块，避免循环依赖。

```
views (页面)
  ↓
components (组件)
  ↓
stores (状态)
  ↓
api (接口)
  ↓
utils (工具)
```

### 模块边界
- 模块间通过明确的接口通信
- 避免跨模块直接访问内部实现
- 使用 TypeScript 类型定义接口

## 文件命名规范

### Vue 组件
- 使用 PascalCase
- 示例：`UserCard.vue`, `OrderList.vue`

### TypeScript 文件
- 使用 kebab-case
- 示例：`user-api.ts`, `date-utils.ts`

### 样式文件
- 使用 kebab-case
- 示例：`button.scss`, `variables.scss`

### 类型定义文件
- 使用 kebab-case
- 示例：`user-types.ts`, `api-types.ts`

## 依赖管理规范

### 依赖分类
- **dependencies** - 运行时依赖
- **devDependencies** - 开发依赖

### 依赖安装
```bash
# 生产依赖
npm install <package>

# 开发依赖
npm install -D <package>

# 精确版本
npm install --save-exact <package>
```

### 依赖更新
```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 审计安全漏洞
npm audit
npm audit fix
```

## 构建配置标准

### Vite 配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

### TypeScript 配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

## 最佳实践

### 1. 按功能组织代码
将相关的文件放在同一个目录下，便于查找和维护。

### 2. 保持目录扁平
避免过深的目录嵌套，一般不超过 3 层。

### 3. 使用路径别名
配置路径别名，简化导入路径。

### 4. 分离关注点
将 UI、逻辑、数据分离到不同的文件中。

### 5. 模块化设计
每个模块应该独立可测试，可复用。

### 6. 文档化
为每个模块、组件、函数添加清晰的注释。

## 检查清单

创建新模块时，确保：

- [ ] 目录结构符合规范
- [ ] 文件命名符合规范
- [ ] 类型定义完整
- [ ] 导出路径正确
- [ ] 依赖关系清晰
- [ ] 添加必要的注释
- [ ] 编写单元测试

## 示例项目

参考当前项目 `chrome-ai-assistant` 的目录结构：

```
chrome-ai-assistant/
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   ├── sidebar.html
│   └── sidebar/
│       ├── main.ts
│       ├── App.vue
│       ├── ChatPanel.vue
│       ├── SettingsPanel.vue
│       ├── MessageList.vue
│       ├── SkillSelector.vue
│       ├── ModelSelector.vue
│       └── AddModelDialog.vue
├── modules/
│   ├── storage.ts
│   ├── messaging.ts
│   ├── api-client.ts
│   └── skill-manager.ts
├── mcp-server/
│   ├── server.ts
│   ├── tools/
│   └── resources/
├── skills/
│   └── built-in-skills.ts
├── types/
│   └── index.ts
└── tests/
    ├── setup.ts
    ├── fixtures/
    ├── mocks/
    └── modules/
```

## 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
