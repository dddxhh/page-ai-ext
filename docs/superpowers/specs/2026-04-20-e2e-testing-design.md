# E2E 测试设计文档

## 概述

为 Chrome AI Assistant 扩展集成 E2E 测试，覆盖核心 UI 流程验证。

## 技术选型

| 项目       | 选择        | 理由                               |
| ---------- | ----------- | ---------------------------------- |
| 测试框架   | Playwright  | 现代、支持扩展加载、调试工具强大   |
| 测试范围   | UI 交互验证 | 验证组件可见性、按钮状态、导航流程 |
| 测试浏览器 | Chromium    | 开发效率高，sidePanel 功能完整支持 |

## 目录结构

```
e2e/
├── setup/
│   ├── fixtures.ts           # Playwright fixtures（扩展加载、页面管理）
│   ├── global-setup.ts       # 构建扩展
│   └── helpers.ts            # 辅助函数（打开 sidePanel、清除存储）
├── tests/
│   ├── sidebar/
│   │   ├── chat.spec.ts      # 聊天面板 UI 测试
│   │   ├── settings.spec.ts  # 设置面板测试
│   │   └── skill-management.spec.ts  # 技能管理测试
│   ├── background/
│   │   └── commands.spec.ts  # 快捷键命令注册测试
│   └── integration/
│   │   └── full-flow.spec.ts # 导航流程集成测试
└── playwright.config.ts       # Playwright 配置
```

## 技术实现要点

### 1. Playwright 加载扩展（使用 fixtures）

```typescript
// e2e/setup/fixtures.ts
import { test as base, BrowserContext } from '@playwright/test'
import path from 'path'

const extensionPath = path.resolve('.output/chrome-mv3')

export type ExtensionTestFixtures = {
  context: BrowserContext
  extensionId: string
}

export const test = base.extend<ExtensionTestFixtures>({
  browser: async ({ playwright }, use) => {
    const browser = await playwright.chromium.launchPersistentContext(
      '/tmp/playwright-extension-test',
      {
        headless: false,
        args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
      }
    )
    await use(browser)
    await browser.close()
  },
  context: async ({ browser }, use) => {
    await use(browser as unknown as BrowserContext)
  },
  extensionId: async ({ context }, use) => {
    let serviceWorkers = context.serviceWorkers()
    if (serviceWorkers.length > 0) {
      const url = serviceWorkers[0].url()
      const match = url.match(/chrome-extension:\/\/([a-zA-Z0-9-]+)/)
      if (match) {
        await use(match[1])
        return
      }
    }
    // ... 等待扩展加载
    throw new Error('Could not find extension background page or service worker')
  },
})

export { expect } from '@playwright/test'
```

### 2. 打开 sidePanel 辅助函数

```typescript
// e2e/setup/helpers.ts
import { Page } from '@playwright/test'

export async function openSidePanel(page: Page, extensionId: string): Promise<void> {
  await page.goto(`chrome-extension://${extensionId}/sidebar.html`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
}

export async function clearStorage(page: Page): Promise<void> {
  const url = page.url()
  if (!url.startsWith('chrome-extension://')) {
    throw new Error('clearStorage must be called on an extension page')
  }
  await page.evaluate(() => {
    chrome.storage.local.clear()
  })
}
```

### 3. Global Setup（构建扩展）

```typescript
// e2e/setup/global-setup.ts
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function globalSetup() {
  const outputDir = path.resolve('.output/chrome-mv3')

  // E2E 测试需要生产构建（开发版本引用 localhost:3000）
  console.log('Building extension for E2E tests...')
  execSync('npm run build', { stdio: 'inherit' })

  if (!fs.existsSync(path.join(outputDir, 'manifest.json'))) {
    throw new Error('Build failed: manifest.json not found')
  }

  console.log('Extension ready at:', outputDir)
}

export default globalSetup
```

### 4. playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
  globalSetup: './e2e/setup/global-setup.ts',
})
```

## 测试策略

### 为什么不 Mock API？

Playwright 测试 Chrome 扩展时，API 请求在 service worker 中发起，无法被页面路由拦截。因此测试策略调整为：

1. **UI 交互验证** - 验证组件可见性、按钮状态、导航流程
2. **Chrome API 验证** - 验证 commands.getAll() 等扩展 API
3. **状态管理验证** - 验证按钮禁用/启用状态

### 测试用例设计

#### chat.spec.ts - 聊天面板 UI

| 用例               | 断言                   |
| ------------------ | ---------------------- |
| 显示聊天面板       | `.chat-panel` 可见     |
| 显示空状态         | `.empty-state` 可见    |
| 输入区域可见       | textarea、发送按钮可见 |
| 输入功能正常       | 输入文本后值正确       |
| 发送按钮初始启用   | 可点击                 |
| 空消息不发送       | 点击后无消息           |
| 空白消息不发送     | 点击后无消息           |
| 清空按钮可见       | `.chat-header` 中存在  |
| 技能选择器按钮可见 | 可见                   |
| 模型选择器按钮可见 | 可见                   |

#### settings.spec.ts - 设置面板

| 用例         | 断言                   |
| ------------ | ---------------------- |
| 设置面板显示 | `.settings-panel` 可见 |
| 多标签页     | 5 个标签               |
| 标签切换     | 内容区域变化           |
| 关闭设置面板 | 面板消失               |
| 主题选项显示 | 浅色/深色/自动选项     |
| 语言选项显示 | 中文/English 选项      |
| 版本信息显示 | 包含"AI 助手扩展"      |

#### skill-management.spec.ts - 技能管理

| 用例              | 断言              |
| ----------------- | ----------------- |
| 显示内置技能      | ≥3 个技能卡片     |
| 内置标签显示      | "内置" tag        |
| 搜索输入存在      | 可见              |
| 新增按钮存在      | 可点击            |
| 创建对话框打开    | `.el-dialog` 可见 |
| 表单字段存在      | name input 可见   |
| 内置技能编辑禁用  | 编辑按钮 disabled |
| 内置技能删除禁用  | 删除按钮 disabled |
| 复制按钮启用      | 可点击            |
| 导出/导入按钮存在 | 可见              |
| 导出功能          | 下载 JSON 文件    |

#### commands.spec.ts - 快捷键命令

| 用例                 | 断言                         |
| -------------------- | ---------------------------- |
| toggleSidebar 注册   | command 存在且有 description |
| newConversation 注册 | command 存在且有 description |

#### full-flow.spec.ts - 集成测试

| 用例           | 断言                     |
| -------------- | ------------------------ |
| 导航流程       | chat → settings → skills |
| 技能选择器按钮 | 可见且启用               |
| 模型选择器按钮 | 可点击                   |
| 所有标签导航   | 5 个标签都可切换         |

## 依赖安装

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## npm scripts

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

## 运行测试

```bash
npm run test:e2e
```

## 测试结果

当前共 38 个测试用例，全部通过：

- Chat Flow: 8 个
- Settings Panel: 8 个
- Skill Management: 13 个
- Integration Tests: 4 个
- Keyboard Commands: 2 个

## 注意事项

1. **生产构建**：E2E 测试使用 `npm run build` 的输出，开发版本引用 localhost:3000 无法在 Playwright 中运行
2. **页面管理**：Playwright 使用持久上下文（`launchPersistentContext`），浏览器在所有测试结束后关闭。这是 Chrome 扩展测试的标准做法。
3. **workers=1**：扩展测试需要串行执行，避免持久上下文冲突
4. **timeout=60000**：扩展加载需要额外时间，全局超时设为 60s
