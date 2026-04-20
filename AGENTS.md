# Chrome AI Assistant - Agent 指导文档

## 项目概述

Chrome 扩展 (MV3)，使用 WXT 框架 + Vue 3 + TypeScript + Element Plus。
通过 WebMCP 协议实现 AI 驱动的页面交互。

## 常用命令

```bash
npm run dev              # 开发服务器，输出到 .output/chrome-mv3/
npm run dev:firefox      # Firefox 版本
npm run build            # 生产构建
npm run zip              # 打包发布

npm run test             # Vitest 监听模式
npm run test:run         # 单次运行测试
npm run test:coverage    # 覆盖率报告
```

## 项目架构

| 目录 | 用途 |
|------|------|
| `entrypoints/` | Chrome 扩展入口点 |
| `modules/` | 核心逻辑：storage, messaging, api-client, skill-manager |
| `mcp-server/` | MCP 工具，用于 DOM/页面操作 |
| `types/` | TypeScript 类型定义中心 |
| `tests/` | Vitest 测试，setup.ts 已 mock Chrome API |

**关键文件：**
- `entrypoints/background.ts` - Service worker，处理 AI 聊天、MCP 工具执行
- `entrypoints/content.ts` - 内容脚本，页面操作
- `entrypoints/sidebar/*.vue` - Vue UI 组件

## 构建输出

运行 `npm run dev` 或 `npm run build` 后，在 Chrome 中加载 `.output/chrome-mv3/` 目录（解压加载扩展）。

## 路径别名

`@/*` 和 `~/*` 都指向项目根目录。导入示例：
```ts
import { storage } from '~/modules/storage';
```

## 测试说明

- `tests/setup.ts` 已全局 mock Chrome API（storage, runtime, tabs）
- Vitest 使用 jsdom 环境
- 组件测试需要 stub Element Plus 组件
- 提交前运行测试确认

## 开发规范文档

详细的 Vue 3 + TypeScript 规范在 `docs/sdd/` 目录：
- `01-architecture.md` - 目录结构、命名规范
- `02-component.md` - Vue 组件开发模式
- `06-testing.md` - 测试规范

## OpenCode 技能

项目在 `skills/` 目录包含自定义技能：
- 组件生成、代码审查、模块创建、测试生成、文档生成

通过 OpenCode 技能系统调用。