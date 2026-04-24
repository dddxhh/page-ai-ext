# MCP 工具 Handler 补全 + CSP 处理修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补全缺失的 MCP 工具 handler（get_page_structure、find_elements）并处理 execute_script 的 CSP 限制。

**Architecture:** 在 content-handlers.ts 中添加缺失的 handler 函数，更新 switch 语句，改进 execute_script 以优雅处理 CSP 错误。

**Tech Stack:** TypeScript + DOM API + Chrome Extension Content Script

---

## 问题分析

### 问题 1: Unknown tool: get_page_structure / find_elements

**根因：**

- 工具定义存在 (`mcp-server/tools/page-tools.ts`)
- 工具注册成功 (background.js 构建中已注册)
- **缺失：content-handlers.ts 中 handler 函数未实现**

**数据流断裂点：**

```
AI → tool_calls(get_page_structure)
  → background.ts → mcpServer.executeTool()
  → content script → handleToolExecution()
  → switch (tool) { ... } → default: throw Error("Unknown tool")
```

**当前 handleToolExecution switch 语句 (content-handlers.ts:193-216)：**

```typescript
switch (tool) {
  case 'click_element': // ✅ 已实现
  case 'fill_form': // ✅ 已实现
  case 'extract_content': // ✅ 已实现
  case 'scroll_page': // ✅ 已实现
  case 'execute_script': // ✅ 已实现（但有 CSP 问题）
  case 'get_page_content': // ✅ 已实现
  case 'take_screenshot': // ✅ 已实现
  // ❌ 缺失: get_page_structure
  // ❌ 缺失: find_elements
  default:
    throw new Error(`Unknown tool: ${tool}`)
}
```

### 问题 2: execute_script CSP violation

**根因：**

- 百度等网站有严格 CSP：`script-src 'self' 'wasm-unsafe-eval' ...`
- 不允许 `unsafe-eval` → `new Function()` 被禁止
- 当前实现使用 `new Function('return ' + script)` 执行

**CSP 错误示例：**

```
Evaluating a string as JavaScript violates the following Content Security Policy directive:
"script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' ..."
```

---

## 文件结构

| 文件                                     | 操作     | 说明                                                          |
| ---------------------------------------- | -------- | ------------------------------------------------------------- |
| `types/mcp-tools.ts`                     | 修改     | 添加 GetPageStructureParams/Result, FindElementsParams/Result |
| `utils/content-handlers.ts`              | 修改     | 添加 2 个 handler 函数 + 更新 switch + 改进 execute_script    |
| `utils/content-utils.ts`                 | 无需修改 | 已有 getDOMStructure 函数                                     |
| `tests/content/content-handlers.test.ts` | 修改     | 添加新 handler 测试                                           |

---

### Task 1: 添加类型定义

**Files:**

- Modify: `types/mcp-tools.ts`

- [ ] **Step 1: 添加 GetPageStructureParams/Result 类型**

在 `types/mcp-tools.ts` 末尾添加（在 DOMStructureNode 之后）：

```typescript
export interface GetPageStructureParams {
  depth?: number
  includeText?: boolean
}

export interface GetPageStructureResult {
  structure: DOMStructureNode
}

export interface FindElementsParams {
  text?: string
  tag?: string
  attribute?: string
  attributeValue?: string
}

export interface FindElementsResult {
  elements: Array<{
    selector: string
    text?: string
    tag: string
    attributes: Record<string, string>
  }>
}
```

- [ ] **Step 2: 运行类型检查**

Run: `npm run lint`
Expected: PASS

---

### Task 2: 实现 handleGetPageStructure handler

**Files:**

- Modify: `utils/content-handlers.ts`

- [ ] **Step 1: 添加类型导入**

更新 `content-handlers.ts` 顶部导入（添加新类型）：

```typescript
import {
  type ClickElementParams,
  type ClickElementResult,
  type FillFormParams,
  type FillFormResult,
  type ExtractContentParams,
  type ExtractContentResult,
  type ScrollPageParams,
  type ScrollPageResult,
  type ExecuteScriptParams,
  type ExecuteScriptResult,
  type GetPageContentParams,
  type GetPageContentResult,
  type TakeScreenshotParams,
  type TakeScreenshotResult,
  type GetPageStructureParams,
  type GetPageStructureResult,
  type FindElementsParams,
  type FindElementsResult,
} from '~/types/mcp-tools'
```

- [ ] **Step 2: 实现 handleGetPageStructure 函数**

在 `handleTakeScreenshot` 函数之后、`handleToolExecution` 之前添加：

```typescript
export async function handleGetPageStructure(
  params: GetPageStructureParams
): Promise<GetPageStructureResult> {
  const { depth = 3, includeText = false } = params

  const structure = getDOMStructure(document.body, depth, includeText)
  return { structure }
}

export async function handleFindElements(params: FindElementsParams): Promise<FindElementsResult> {
  const { text, tag, attribute, attributeValue } = params

  let selector = ''

  if (tag) {
    selector += tag
  }

  if (attribute && attributeValue) {
    selector += `[${attribute}="${attributeValue}"]`
  }

  if (!selector) {
    selector = '*'
  }

  const elements = Array.from(document.querySelectorAll(selector))

  const filteredElements = elements
    .filter((el) => {
      if (text && !el.textContent?.includes(text)) {
        return false
      }
      return true
    })
    .slice(0, 50)
    .map((el) => {
      const attrs: Record<string, string> = {}
      Array.from(el.attributes).forEach((attr) => {
        attrs[attr.name] = attr.value
      })

      return {
        selector: el.id ? `#${el.id}` : generateSelector(el),
        text: el.textContent?.slice(0, 100) || undefined,
        tag: el.tagName.toLowerCase(),
        attributes: attrs,
      }
    })

  return { elements: filteredElements }
}

function generateSelector(element: Element): string {
  const path: string[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector = `#${current.id}`
      path.unshift(selector)
      break
    }

    if (current.className) {
      const classes = current.className
        .split(' ')
        .filter((c) => c)
        .slice(0, 2)
      if (classes.length > 0) {
        selector += '.' + classes.join('.')
      }
    }

    const siblings = current.parentElement?.children
    if (siblings && siblings.length > 1) {
      const index = Array.from(siblings).indexOf(current) + 1
      selector += `:nth-child(${index})`
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}
```

---

### Task 3: 更新 handleToolExecution switch 语句

**Files:**

- Modify: `utils/content-handlers.ts:193-216`

- [ ] **Step 1: 添加缺失的 case 分支**

修改 `handleToolExecution` 函数的 switch 语句：

```typescript
switch (tool) {
  case 'click_element':
    result = await handleClickElement(params)
    break
  case 'fill_form':
    result = await handleFillForm(params)
    break
  case 'extract_content':
    result = await handleExtractContent(params)
    break
  case 'scroll_page':
    result = await handleScrollPage(params)
    break
  case 'execute_script':
    result = await handleExecuteScript(params)
    break
  case 'get_page_content':
    result = await handleGetPageContent(params)
    break
  case 'get_page_structure':
    result = await handleGetPageStructure(params)
    break
  case 'find_elements':
    result = await handleFindElements(params)
    break
  case 'take_screenshot':
    result = await handleTakeScreenshot(params)
    break
  default:
    throw new Error(`Unknown tool: ${tool}`)
}
```

---

### Task 4: 处理 execute_script CSP 问题

**Files:**

- Modify: `utils/content-handlers.ts:122-152`

**策略：优雅失败 - 检测 CSP 错误，返回友好消息**

- [ ] **Step 1: 改进 handleExecuteScript 函数**

修改 `handleExecuteScript` 函数：

```typescript
export async function handleExecuteScript(
  params: ExecuteScriptParams
): Promise<ExecuteScriptResult> {
  const { script } = params

  const dangerousPatterns = [
    /chrome\./i,
    /fetch\(/i,
    /XMLHttpRequest/i,
    /document\.cookie/i,
    /localStorage/i,
    /sessionStorage/i,
    /window\.location/i,
    /eval\(/i,
    /Function\(/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(script)) {
      throw new Error('脚本包含禁止的操作')
    }
  }

  try {
    const fn = new Function('return ' + script)
    const result = fn()
    return { result }
  } catch (error) {
    const errorMsg = (error as Error).message

    if (
      errorMsg.includes('Content Security Policy') ||
      errorMsg.includes('unsafe-eval') ||
      errorMsg.includes('CSP')
    ) {
      throw new Error(
        '此页面有严格的 CSP (Content Security Policy) 安全策略，禁止执行动态脚本。' +
          '请使用其他工具如 click_element、fill_form、extract_content 等来操作页面。'
      )
    }

    throw new Error(`脚本执行错误: ${errorMsg}`)
  }
}
```

---

### Task 5: 添加测试

**Files:**

- Modify: `tests/content/content-handlers.test.ts`

- [ ] **Step 1: 添加 handleGetPageStructure 测试**

```typescript
describe('handleGetPageStructure', () => {
  it('should return DOM structure with default depth', async () => {
    const result = await handleGetPageStructure({})

    expect(result.structure).toBeDefined()
    expect(result.structure.tag).toBe('body')
    expect(Array.isArray(result.structure.children)).toBe(true)
  })

  it('should respect depth parameter', async () => {
    const result = await handleGetPageStructure({ depth: 1 })

    expect(result.structure.children.length).toBeGreaterThan(0)
    expect(result.structure.children[0].children.length).toBe(0)
  })

  it('should include text when requested', async () => {
    const result = await handleGetPageStructure({ depth: 2, includeText: true })

    expect(result.structure.text).toBeDefined()
  })
})
```

- [ ] **Step 2: 添加 handleFindElements 测试**

```typescript
describe('handleFindElements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-div" class="container">
        <button class="btn primary">Submit</button>
        <button class="btn secondary">Cancel</button>
        <a href="/link" data-type="nav">Link</a>
      </div>
    `
  })

  it('should find elements by tag', async () => {
    const result = await handleFindElements({ tag: 'button' })

    expect(result.elements.length).toBe(2)
    expect(result.elements[0].tag).toBe('button')
  })

  it('should find elements by attribute', async () => {
    const result = await handleFindElements({ attribute: 'data-type', attributeValue: 'nav' })

    expect(result.elements.length).toBe(1)
    expect(result.elements[0].attributes['data-type']).toBe('nav')
  })

  it('should find elements by text', async () => {
    const result = await handleFindElements({ text: 'Submit' })

    expect(result.elements.length).toBeGreaterThanOrEqual(1)
    expect(result.elements.some((e) => e.text?.includes('Submit'))).toBe(true)
  })

  it('should return empty array when no matches', async () => {
    const result = await handleFindElements({ tag: 'nonexistent' })

    expect(result.elements).toEqual([])
  })
})
```

- [ ] **Step 3: 添加 CSP 错误测试**

```typescript
describe('handleExecuteScript CSP handling', () => {
  it('should throw friendly CSP error message', async () => {
    const originalFunction = global.Function
    global.Function = class {
      constructor() {
        throw new Error('Content Security Policy directive: unsafe-eval')
      }
    } as any

    try {
      await handleExecuteScript({ script: '1 + 1' })
    } catch (error) {
      expect((error as Error).message).toContain('CSP')
      expect((error as Error).message).toContain('请使用其他工具')
    }

    global.Function = originalFunction
  })
})
```

---

### Task 6: 运行验证

- [ ] **Step 1: 运行单元测试**

Run: `npm run test:run`
Expected: PASS (所有测试通过)

- [ ] **Step 2: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: 构建扩展**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: 手动测试**

1. 加载扩展到 Chrome
2. 打开百度首页
3. 输入 "分析页面结构" → AI 应调用 get_page_structure
4. 输入 "找到搜索按钮" → AI 应调用 find_elements
5. 观察 execute_script CSP 错误是否显示友好消息

---

## 验证方法

### 预期行为

**get_page_structure:**

```
用户: "分析页面结构"
→ AI 调用 get_page_structure({ depth: 3 })
→ 返回 DOM 树结构
→ AI 解析结构并回答
```

**find_elements:**

```
用户: "找到搜索按钮"
→ AI 调用 find_elements({ tag: "button", text: "搜索" })
→ 返回元素列表 [{ selector: "#su", tag: "button", text: "百度一下" }]
→ AI 可以用 selector 执行 click_element
```

**execute_script CSP 处理:**

```
AI 调用 execute_script({ script: "document.title" })
→ 百度页面 CSP 禁止
→ 返回错误: "此页面有严格的 CSP...请使用其他工具..."
→ AI 收到错误，改用其他工具
```

---

## 注意事项

1. **find_elements 结果限制**: 返回最多 50 个元素，避免超大响应
2. **generateSelector**: 为无 ID 元素生成唯一 CSS selector
3. **CSP 检测**: 通过错误消息关键词判断 CSP 错误
4. **向后兼容**: 不修改现有 handler 的行为

---

## 后续优化建议

1. 为 find_elements 添加更多筛选条件（如 visibility、size）
2. 缓存 DOM 结构避免重复查询
3. 添加元素交互预览（hover 高亮）
4. 支持更复杂的 selector 生成策略
