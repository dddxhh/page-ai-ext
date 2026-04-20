# 代码风格规范

## 概述

本文档定义了前端项目的代码风格规范，包括 ESLint、Prettier、TypeScript 配置和命名约定。

## ESLint 配置

### 安装依赖

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-vue \
  eslint-config-prettier eslint-plugin-prettier
```

### ESLint 配置文件 (Flat Config)

项目使用 ESLint 9 flat config 格式：

```javascript
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: [
      '.output/**',
      '.wxt/**',
      'node_modules/**',
      'coverage/**',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      'prettier/prettier': 'error',
    },
  },
]
```

**关键规则说明：**

| 规则                                 | 设置    | 说明                           |
| ------------------------------------ | ------- | ------------------------------ |
| `@typescript-eslint/no-explicit-any` | `off`   | Chrome API 类型有时需要 any    |
| `@typescript-eslint/no-unused-vars`  | `warn`  | 未使用变量警告，`_` 前缀忽略   |
| `vue/multi-word-component-names`     | `off`   | 允许短组件名                   |
| `prettier/prettier`                  | `error` | 格式不符合 Prettier 规则时报错 |

## Prettier 配置

### 安装依赖

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### Prettier 配置文件

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "vueIndentScriptAndStyle": true,
  "endOfLine": "lf"
}
```

**配置说明：**

| 选项                      | 值      | 说明         |
| ------------------------- | ------- | ------------ |
| `semi`                    | `false` | 无分号       |
| `singleQuote`             | `true`  | 单引号       |
| `tabWidth`                | `2`     | 2空格缩进    |
| `trailingComma`           | `es5`   | ES5 尾逗号   |
| `printWidth`              | `100`   | 行宽100字符  |
| `vueIndentScriptAndStyle` | `true`  | Vue SFC 缩进 |
| `endOfLine`               | `lf`    | Unix换行     |

### Prettier 忽略文件

```
# .prettierignore
.output/
.wxt/
node_modules/
coverage/
auto-imports.d.ts
components.d.ts
```

## TypeScript 配置

### TypeScript 配置文件

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
"outDir": "./dist",
    "rootDir":": "./src",
    "removeComments": false,
    "noEmit": true,
    "importHelpers": true,
    "downlevelIteration": true,
    "isolatedModules": true,
ES2020",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"]
    },
    "types": ["vite/client", "element-plus/global"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "auto-imports.d.ts",
    "components.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage"
  ],
  "vueCompilerOptions": {
    "target": 3
  }
}
```

## 命名约定

### 文件命名

```typescript
// Vue 组件：PascalCase
UserCard.vue
OrderList.vue
ProductDetail.vue

// TypeScript 文件：kebab-case
user - api.ts
date - utils.ts
validation.ts

// 样式文件：kebab-case
button.scss
variables.scss
mixins.scss

// 类型定义文件：kebab-case
user - types.ts
api - types.ts
common - types.ts
```

### 变量命名

```typescript
// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 变量：camelCase
const userName = 'John'
const isLoading = false
const userList = []

// 类/接口/类型：PascalCase
class UserService {}
interface User {}
type UserRole = 'admin' | 'user'

// 函数：camelCase
function getUserById(id: string) {}
function formatDate(date: Date) {}

// 私有属性：_camelCase
class MyClass {
  private _internalState = null
}
```

### 组件命名

```typescript
// 组件文件：PascalCase
UserCard.vue

// 组件注册名：kebab-case
app.component('user-card', UserCard)

// 组件使用：kebab-case
<user-card />
```

### CSS 命名

```scss
// BEM 命名规范
.card {
}
.card__header {
}
.card__title {
}
.card--primary {
}
.card__title--center {
}
```

## 注释规范

### JSDoc 注释

````typescript
/**
 * 获取用户信息
 *
 * @param id - 用户 ID
 * @returns 用户信息
 * @throws {Error} 当用户不存在时抛出错误
 *
 * @example
 * ```typescript
 * const user = await getUserById('123')
 * console.log(user.name)
 * ```
 */
async function getUserById(id: string): Promise<User> {
  // 实现
}
````

### 单行注释

```typescript
// 检查用户权限
if (user.role === 'admin') {
  // 管理员可以访问
}
```

### 多行注释

```typescript
/*
 * 这是一个多行注释
 * 用于解释复杂的逻辑
 */
function complexFunction() {
  // 实现
}
```

### TODO 注释

```typescript
// TODO: 添加错误处理
// FIXME: 修复这个 bug
// HACK: 临时解决方案
// NOTE: 重要提示
```

## Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `revert`: 回退提交

### 提交示例

```bash
# 新功能
git commit -m "feat(user): add user login feature"

# 修复 bug
git commit -m "fix(api): handle network error correctly"

# 文档更新
git commit -m "docs(readme): update installation guide"

# 重构
git commit -m "refactor(component): simplify user card component"

# 性能优化
git commit -m "perf(list): optimize list rendering performance"
```

### Commitlint 配置

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert'],
    ],
    'subject-case': [0],
  },
}
```

## 代码格式化

### 自动格式化

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### VS Code 配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue"]
}
```

## 代码质量检查

### 运行检查

```bash
# ESLint 检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# Prettier 格式化
npm run format

# Prettier 检查
npm run format:check

# TypeScript 类型检查
npm run compile
```

### Git Hooks

```bash
npm install -D husky lint-staged
```

```json
// .lintstagedrc
{
  "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

```bash
# 初始化 husky
npx husky init

# pre-commit hook (自动生成)
echo "npx lint-staged" > .husky/pre-commit
```

## 最佳实践

### 1. 使用 TypeScript

```typescript
// ✅ 好：使用 TypeScript
function greet(name: string): string {
  return `Hello, ${name}!`
}

// ❌ 差：不使用类型
function greet(name) {
  return `Hello, ${name}!`
}
```

### 2. 避免使用 any

```typescript
// ✅ 好：使用具体类型
function processData(data: UserData) {
  // 处理数据
}

// ❌ 差：使用 any
function processData(data: any) {
  // 处理数据
}
```

### 3. 使用 const 优于 let

```typescript
// ✅ 好：使用 const
const count = 10

// ❌ 差：使用 let
let count = 10
```

### 4. 使用箭头函数

```typescript
// ✅ 好：使用箭头函数
const sum = (a: number, b: number) => a + b

// ❌ 差：使用 function
function sum(a: number, b: number) {
  return a + b
}
```

### 5. 使用模板字符串

```typescript
// ✅ 好：使用模板字符串
const message = `Hello, ${name}!`

// ❌ 差：使用字符串拼接
const message = 'Hello, ' + name + '!'
```

### 6. 使用解构赋值

```typescript
// ✅ 好：使用解构赋值
const { name, email } = user

// ❌ 差：不使用解构赋值
const name = user.name
const email = user.email
```

### 7. 使用可选对象

```typescript
// ✅ 好：使用可选链
const userName = user?.name

// ❌ 差：不使用可选链
const userName = user && user.name
```

### 8. 使用空值合并

```typescript
// ✅ 好：使用空值合并
const count = inputCount ?? 0

// ❌ 差：不使用空值合并
const count = inputCount !== null && inputCount !== undefined ? inputCount : 0
```

## 检查清单

提交代码前，确保：

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 Prettier 格式化
- [ ] 代码通过 TypeScript 类型检查
- [ ] 命名符合规范
- [ ] 添加必要的注释
- [ ] Git 提交信息符合规范
- [ ] 代码通过测试

## 参考资源

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
