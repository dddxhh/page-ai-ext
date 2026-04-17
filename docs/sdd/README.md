# Vue 3 + TypeScript 前端 SDD 规范体系

## 概述

这是一套完整的 Vue 3 + TypeScript 前端开发规范体系，包含 7 个规范文档和 5 个自动化技能，旨在实现标准化的开发流程，提高代码质量和开发效率。

## 规范文档

### 1. 项目架构规范 (`docs/sdd/01-architecture.md`)

定义项目的标准目录结构、模块划分原则、文件命名规范和构建配置标准。

**核心内容**：
- 标准目录结构
- 模块划分原则
- 文件命名规范
- 依赖管理规范
- 构建配置标准

### 2. 组件开发规范 (`docs/sdd/02-component.md`)

定义 Vue 3 组件的开发规范，包括组件结构、Props/Emits/Slots 使用规范和组件通信模式。

**核心内容**：
- 组件命名规范
- 单文件组件结构
- Props 规范
- Emits 规范
- Slots 规范
- 组件通信模式
- 性能优化

### 3. 样式规范 (`docs/sdd/03-style.md`)

定义 CSS/SCSS 样式规范，包括样式组织方式、BEM 命名规范、主题系统和响应式设计。

**核心内容**：
- 样式组织方式
- CSS 变量规范
- BEM 命名规范
- SCSS Mixins
- 响应式设计
- 主题系统

### 4. API 规范 (`docs/sdd/04-api.md`)

定义 API 接口规范，包括 API 模块组织、请求/响应类型定义、错误处理策略和接口版本管理。

**核心内容**：
- API 模块组织
- 请求封装
- 类型定义
- 错误处理策略
- 接口版本管理
- Mock 数据

### 5. 状态管理规范 (`docs/sdd/05-state-management.md`)

定义 Pinia 状态管理规范，包括 Store 组织结构、状态持久化、Store 通信和异步状态管理。

**核心内容**：
- Store 组织结构
- Store 基本结构
- 状态持久化
- Store 通信
- 异步状态管理
- 性能优化

### 6. 测试规范 (`docs/sdd/06-testing.md`)

定义测试规范，包括单元测试、组件测试、集成测试和 E2E 测试的编写规范。

**核心内容**：
- 测试框架配置
- 测试目录结构
- 单元测试
- 组件测试
- Store 测试
- E2E 测试
- 测试覆盖率

### 7. 代码风格规范 (`docs/sdd/07-code-style.md`)

定义代码风格规范，包括 ESLint、Prettier、TypeScript 配置和命名约定。

**核心内容**：
- ESLint 配置
- Prettier 配置
- TypeScript 配置
- 命名约定
- 注释规范
- Git 提交规范

## 自动化技能

### 1. frontend-component-generator

**功能**：Vue 3 + TypeScript 组件生成技能

**特点**：
- 交互式组件创建向导
- 根据规范生成组件模板
- 自动生成配套测试文件
- 支持组件类型选择（基础/业务/布局）

**使用示例**：
```
创建一个用户卡片组件
```

**技能文件**：`skills/frontend-component-generator/SKILL.md`

### 2. frontend-module-creator

**功能**：功能模块创建技能

**特点**：
- 创建新的功能模块
- 生成完整的目录结构
- 创建 API 接口模块
- 生成 Store 模块
- 创建类型定义

**使用示例**：
```
创建订单管理模块
```

**技能文件**：`skills/frontend-module-creator/SKILL.md`

### 3. frontend-code-reviewer

**功能**：代码审查技能

**特点**：
- 检查代码是否符合规范
- 自动修复常见问题
- 生成审查报告
- 支持增量审查

**检查项**：
- 组件结构规范
- 命名规范
- 类型定义完整性
- 样式组织
- API 调用规范
- 状态管理规范

**使用示例**：
```
审查 src/components/UserCard.vue 的代码
```

**技能文件**：`skills/frontend-code-reviewer/SKILL.md`

### 4. frontend-test-generator

**功能**：测试生成技能

**特点**：
- 为组件组件生成测试用例
- 为 API 模块生成测试
- 为 Store 生成测试
- 支持测试覆盖率分析

**使用示例**：
```
为 ChatPanel 组件生成测试
```

**技能文件**：`skills/frontend-test-generator/SKILL.md`

### 5. frontend-doc-generator

**功能**：文档生成技能

**特点**：
- 从组件生成文档
- 生成 API 文档
- 生成类型文档
- 支持 Markdown 输出

**使用示例**：
```
生成组件文档
```

**技能文件**：`skills/frontend-doc-generator/SKILL.md`

## 使用指南

### 1. 查看规范文档

所有规范文档位于 `docs/sdd/` 目录下：

```bash
# 查看项目架构规范
cat docs/sdd/01-architecture.md

# 查看组件开发规范
cat docs/sdd/02-component.md
```

### 2. 使用自动化技能

技能位于 `skills/` 目录下，可以通过 OpenCode 的技能系统调用：

```
# 创建组件
使用 frontend-component-generator 技能创建一个用户卡片组件

# 创建模块
使用 frontend-module-creator 技能创建产品管理模块

# 审查代码
使用 frontend-code-reviewer 技能审查 UserCard 组件

# 生成测试
使用 frontend-test-generator 技能为 UserCard 组件生成测试

# 生成文档
使用 frontend-doc-generator 技能生成组件文档
```

### 3. 集成到开发流程

#### 在项目中应用规范

1. **阅读规范文档**：了解所有规范要求
2. **使用技能生成代码**：使用自动化技能生成符合规范的代码
3. **代码审查**：使用代码审查技能检查代码质量
4. **生成测试**：使用测试生成技能编写测试
5. **生成文档**：使用文档生成技能生成文档

#### 持续集成

可以将规范检查集成到 CI/CD 流程中：

```yaml
# .github/workflows/lint.yml
name: Lint and Test

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Run linter
      run: npm run lint
    - name: Run tests
      run: npm run test
    - name: Check coverage
      run: npm run test:coverage
```

## 技术栈

- **框架**：Vue 3.4+
- **语言**：TypeScript 5.3+
- **构建工具**：Vite 5.0+
- **状态管理**：Pinia 2.1+
- **UI 组件库**：Element Plus 2.8+
- **测试框架**：Vitest 1.2+
- **测试工具**：@vue/test-utils 2.4+

## 项目结构

```
chrome-ai-assistant/
├── docs/
│   └── sdd/                           # SDD 规范文档
│       ├── 01-architecture.md          # 项目架构规范
│       ├── 02-component.md             # 组件开发规范
│       ├── 03-style.md                 # 样式规范
│       ├── 04-api.md                   # API 规范
│       ├── 05-state-management.md      # 状态管理规范
│       ├── 06-testing.md               # 测试规范
│       └── 07-code-style.md            # 代码风格规范
├── skills/                             # 自动化技能
│   ├── frontend-component-generator/    # 组件生成技能
│   │   └── SKILL.md
│   ├── frontend-module-creator/        # 模块创建技能
│   │   └── SKILL.md
│   ├── frontend-code-reviewer/         # 代码审查技能
│   │   └── SKILL.md
│   ├── frontend-test-generator/        # 测试生成技能
│   │   └── SKILL.md
│   └── frontend-doc-generator/         # 文档生成技能
│       └── SKILL.md
└── README.md                           # 项目说明
```

## 预期效果

### 开发效率提升
- 通过自动化生成减少 40% 的重复工作
- 标准化的开发流程减少决策时间
- 统一的规范减少代码审查时间

### 代码质量提升
- 统一的规范保证代码一致性
- 自动化检查减少人为错误
- 完整的测试覆盖保证代码质量

### 维护成本降低
- 规范化的结构便于维护
- 清晰的文档便于理解
- 完整的测试便于重构

### 新人上手加快
- 清晰的规范文档
- 自动化工具减少学习成本
- 示例代码便于参考

## 扩展和定制

### 添加新的规范

1. 在 `docs/sdd/` 目录下创建新的规范文档
2. 遵循现有规范文档的格式
3. 更新本总结文档

### 添加新的技能

1. 在 `skills/` 目录下创建新的技能目录
2. 创建 `SKILL.md` 文件
3. 按照技能模板编写技能文档
4. 更新本总结文档

### 定制现有规范

1.根据项目需求修改规范文档
2. 更新相关技能以符合新规范
3. 通知团队成员规范变更

## 最佳实践

### 1. 遵循规范
始终遵循规范文档进行开发。

### 2. 使用自动化工具
充分利用自动化技能提高效率。

### 3. 持续改进
根据实际使用情况持续改进规范和技能。

### 4. 团队协作
确保团队成员都了解并遵循规范。

### 5. 文档维护
及时更新文档以反映最新的规范。

## 常见问题

### Q: 如何在现有项目中应用这套规范？

A:
1. 阅读所有规范文档
2. 根据规范重构现有代码
3. 使用自动化技能生成新代码
4. 逐步将规范集成到开发流程中

### Q: 技能如何与 OpenCode 集成？

A: 技能文件位于项目的 `skills/` 目录下，OpenCode 会自动识别并加载这些技能。

### Q: 如何定制规范以适应特定项目需求？

A: 可以根据项目需求修改规范文档，并相应更新技能以符合新规范。

### Q: 规范是否适用于其他技术栈？

A: 这套规范主要针对 Vue 3 + TypeScript 技术栈，但其中的原则可以应用到其他技术栈。

## 参考资源

### 官方文档
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)

### 工具文档
- [Vitest 官方文档](https://vitest.dev/)
- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)

### 最佳实践
- [Vue 3 风格指南](https://vuejs.org/style-guide/)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## 版本历史

### v1.0.0 (2026-04-13)
- 🎉 初始版本
- ✨ 7 个规范文档
- ✨ 5 个自动化技能
- 📝 完整的使用文档

## 贡献

欢迎提出改进建议和 bug 报告！

## 许可证

MIT

---

**祝您开发愉快！** 🚀
