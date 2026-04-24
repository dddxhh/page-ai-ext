# MCP 工具完整实现计划（最终版）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:**

1. 补全缺失的 MCP handler（get_page_structure, find_elements）
2. 在 MessageList 中展示工具调用历史（嵌入卡片）
3. find_elements 使用多策略 selector + 优先级排序 + 元素截图预览
4. 自定义 UI 确认对话框（替代 window.confirm）
5. 工具调用历史保存到 Conversation

**Architecture:**

- **Handler 层**：content-handlers.ts + element-utils.ts + screenshot-utils.ts
- **UI 层**：ToolCallCard.vue + ToolConfirmDialog.vue + MessageList.vue
- **确认流程**：content script → CONFIRM_REQUEST → ChatPanel → 确认对话框 → CONFIRM_RESPONSE → 执行
- **数据流**：background → TOOL_EXECUTION → ChatPanel 收集 → MessageList 展示 → Conversation 持久化

---

## 设计决策（已确认）

| 功能         | 决策                | 说明                                          |
| ------------ | ------------------- | --------------------------------------------- |
| 元素截图时机 | 选项 C              | find_elements 返回前 3 个 + click/fill 确认时 |
| 确认行为     | 选项 B              | 危险操作每次确认，安全操作可选"会话内允许"    |
| 对话框位置   | 选项 A              | ChatPanel 内嵌（Element Plus Dialog）         |
| 工具历史     | 保存到 Conversation | 已包含                                        |

---

## 文件结构（最终）

| 文件                                                   | 操作 | 说明                                |
| ------------------------------------------------------ | ---- | ----------------------------------- |
| `types/mcp-tools.ts`                                   | 修改 | 添加所有新类型                      |
| `types/index.ts`                                       | 修改 | 扩展 MessageType + Message metadata |
| `utils/element-utils.ts`                               | 创建 | 元素分析工具                        |
| `utils/screenshot-utils.ts`                            | 创建 | 元素截图工具                        |
| `utils/content-handlers.ts`                            | 修改 | 添加 handler + 截图 + 确认流程      |
| `entrypoints/background.ts`                            | 修改 | 发送完整工具信息 + 确认响应处理     |
| `modules/messaging.ts`                                 | 修改 | 添加 CONFIRM_REQUEST/RESPONSE 处理  |
| `entrypoints/sidebar/components/ToolCallCard.vue`      | 创建 | 工具调用卡片（含截图预览）          |
| `entrypoints/sidebar/components/ToolConfirmDialog.vue` | 创建 | 确认对话框组件                      |
| `entrypoints/sidebar/MessageList.vue`                  | 修改 | 显示 ToolCallCard                   |
| `entrypoints/sidebar/ChatPanel.vue`                    | 修改 | 收集工具历史 + 确认对话框管理       |
| `composables/useToolConfirm.ts`                        | 创建 | 确认对话框状态管理                  |
| `tests/content/content-handlers.test.ts`               | 修改 | 新 handler 测试                     |

---

## 核心数据流

### 1. 工具调用展示流程

```
AI → tool_calls → background.ts → executeTool()
  → TOOL_EXECUTION (pending) → ChatPanel → 显示 ToolCallCard (⏳ pending)
  → content script → handleToolExecution()
  → CONFIRM_REQUEST → ChatPanel → 显示确认对话框
  → 用户确认 → CONFIRM_RESPONSE → content script → 执行
  → TOOL_EXECUTION (success/error) → ChatPanel → 更新 ToolCallCard
  → finalizeMessage → 保存到 Conversation → storage
```

### 2. 确认流程详细

```
handleClickElement() [content script]
  ↓
截图元素 (红色边框高亮)
  ↓
messaging.sendToBackground('CONFIRM_REQUEST', {
  tool: 'click_element',
  params: { selector: '#btn' },
  previewImage: 'base64...',  // 元素截图
  elementInfo: { text: 'Submit', tag: 'button', ... }
})
  ↓
background.ts 收到 → 发送到 sidebar
  ↓
ChatPanel.vue 收到 → 显示 ToolConfirmDialog
  ↓
用户选择：
  - [取消] → send CONFIRM_RESPONSE { confirmed: false }
  - [确认] → send CONFIRM_RESPONSE { confirmed: true }
  - [本次会话允许 click_element] → send CONFIRM_RESPONSE { confirmed: true, sessionAllow: true }
  ↓
background.ts 收到 → 发送到 content script
  ↓
content script：
  - confirmed: false → return { cancelled: true }
  - confirmed: true → 执行操作 → return { clicked: true }
  ↓
background.ts → TOOL_EXECUTION → ChatPanel
```

---

## MessageType 扩展

```typescript
export type MessageType =
  | 'SEND_MESSAGE'
  | 'MESSAGE_RESPONSE'
  | 'STOP_MESSAGE'
  | 'EXECUTE_TOOL'
  | 'EXECUTE_MCP_TOOL'
  | 'TOOL_RESULT'
  | 'TOOL_EXECUTION'
  | 'CONFIRM_REQUEST' // 新增：请求用户确认
  | 'CONFIRM_RESPONSE' // 新增：用户确认响应
  | 'GET_PAGE_CONTENT'
  | 'PAGE_CONTENT_RESPONSE'
  | 'TOGGLE_SIDEBAR'
```

---

## Task 分解（共 12 个）

---

### Task 1: 类型定义

**Files:** `types/mcp-tools.ts`, `types/index.ts`

#### 1.1 handler 类型（types/mcp-tools.ts）

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
  visible?: boolean
  interactive?: boolean
  limit?: number
  includePreview?: boolean // 是否包含截图预览
}

export interface ElementInfo {
  selectors: Array<{
    type: 'id' | 'testid' | 'aria' | 'name' | 'text' | 'structural'
    value: string
    confidence: number
  }>
  recommended: string
  text?: string
  tag: string
  isVisible: boolean
  isInteractive: boolean
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  attributes: Record<string, string>
  priority: number
  previewImage?: string // base64 截图
}

export interface FindElementsResult {
  elements: ElementInfo[]
  total: number
  filtered: number
}

export interface ToolExecution {
  id: string
  name: string
  params: Record<string, any>
  result?: any
  error?: string
  status: 'pending' | 'confirming' | 'success' | 'error' | 'cancelled'
  timestamp: number
  duration?: number
  previewImage?: string // 元素截图（用于确认）
}

export interface ConfirmRequest {
  tool: string
  params: Record<string, any>
  previewImage?: string
  elementInfo?: {
    text?: string
    tag: string
    selector: string
  }
  operationDescription: string // 如"点击元素"、"填写表单"
}

export interface ConfirmResponse {
  confirmed: boolean
  sessionAllow?: boolean // 本次会话允许此工具
}
```

#### 1.2 Message 类型扩展（types/index.ts）

```typescript
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: {
    toolCalls?: ToolCall[]
    toolExecutions?: ToolExecution[] // 完整执行历史
    pageContext?: PageContext
  }
}
```

---

### Task 2: 元素分析工具模块

**Files:** `utils/element-utils.ts`（新建）

```typescript
export interface ElementAnalysis {
  selectors: Array<{
    type: 'id' | 'testid' | 'aria' | 'name' | 'text' | 'structural'
    value: string
    confidence: number
  }>
  recommended: string
  isVisible: boolean
  isInteractive: boolean
  priority: number
  boundingBox: { x: number; y: number; width: number; height: number }
}

export function isVisible(element: Element): boolean {
  const htmlElement = element as HTMLElement
  const style = window.getComputedStyle(htmlElement)

  if (style.display === 'none') return false
  if (style.visibility === 'hidden') return false
  if (style.opacity === '0') return false
  if (htmlElement.offsetWidth === 0 || htmlElement.offsetHeight === 0) return false

  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false

  return true
}

export function isInteractive(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'option']

  if (interactiveTags.includes(tag)) return true

  const role = element.getAttribute('role')
  const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem']
  if (role && interactiveRoles.includes(role)) return true

  if (element.hasAttribute('onclick')) return true
  if (element.hasAttribute('ng-click')) return true
  if (element.hasAttribute('@click')) return true

  const style = window.getComputedStyle(element as HTMLElement)
  if (style.cursor === 'pointer') return true

  return false
}

export function calculatePriorityScore(element: Element): number {
  let score = 0

  if (isVisible(element)) score += 30
  if (isInteractive(element)) score += 20

  if (element.id) score += 15
  if (element.getAttribute('data-testid')) score += 12
  if (element.getAttribute('aria-label')) score += 10
  if (element.getAttribute('role')) score += 8
  if (element.getAttribute('name')) score += 5

  const rect = element.getBoundingClientRect()
  const centerY = rect.top + rect.height / 2
  const viewportCenter = window.innerHeight / 2
  const distanceFromCenter = Math.abs(centerY - viewportCenter)
  const viewportHeight = window.innerHeight
  if (distanceFromCenter < viewportHeight * 0.3) score += 10
  else if (distanceFromCenter < viewportHeight * 0.5) score += 5

  if (element.textContent?.trim()) score += 5

  const tag = element.tagName.toLowerCase()
  if (['button', 'a', 'input'].includes(tag)) score += 3

  return score
}

export function generateSelectors(element: Element): ElementAnalysis['selectors'] {
  const selectors: ElementAnalysis['selectors'] = []

  // Strategy 1: ID
  if (element.id) {
    selectors.push({ type: 'id', value: `#${element.id}`, confidence: 95 })
  }

  // Strategy 2: data-testid
  const testId = element.getAttribute('data-testid')
  if (testId) {
    selectors.push({ type: 'testid', value: `[data-testid="${testId}"]`, confidence: 90 })
  }

  // Strategy 3: aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) {
    selectors.push({ type: 'aria', value: `[aria-label="${ariaLabel}"]`, confidence: 85 })
  }

  // Strategy 4: name
  const name = element.getAttribute('name')
  if (name) {
    selectors.push({ type: 'name', value: `[name="${name}"]`, confidence: 80 })
  }

  // Strategy 5: text content
  const text = element.textContent?.trim()
  if (text && text.length < 50 && ['button', 'a'].includes(element.tagName.toLowerCase())) {
    selectors.push({
      type: 'text',
      value: `${element.tagName.toLowerCase()}:has-text("${text.slice(0, 30)}")`,
      confidence: 70,
    })
  }

  // Strategy 6: structural
  const structural = generateStructuralSelector(element)
  selectors.push({ type: 'structural', value: structural, confidence: 40 })

  return selectors
}

function generateStructuralSelector(element: Element): string {
  const path: string[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      path.unshift(`#${current.id}`)
      break
    }

    const className = current.className
    if (className && typeof className === 'string') {
      const classes = className
        .split(' ')
        .filter((c) => c && !c.includes(':'))
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

export function analyzeElement(element: Element): ElementAnalysis {
  const selectors = generateSelectors(element)
  const recommended = selectors.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  ).value

  const rect = element.getBoundingClientRect()

  return {
    selectors,
    recommended,
    isVisible: isVisible(element),
    isInteractive: isInteractive(element),
    priority: calculatePriorityScore(element),
    boundingBox: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  }
}
```

---

### Task 3: 元素截图工具

**Files:** `utils/screenshot-utils.ts`（新建）

```typescript
export async function captureElementScreenshot(
  element: Element,
  highlight: boolean = true
): Promise<string | null> {
  try {
    // 高亮元素（红色边框）
    if (highlight) {
      const originalOutline = element.getAttribute('style') || ''
      element.setAttribute(
        'style',
        originalOutline + '; outline: 3px solid red !important; outline-offset: 2px;'
      )

      // 等待样式生效
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 截图后恢复
      setTimeout(() => {
        element.setAttribute('style', originalOutline)
      }, 500)
    }

    // 使用 canvas 截图元素
    const rect = element.getBoundingClientRect()

    // 方法1：使用 html2canvas（如果可用）
    // 方法2：使用 canvas 绘制 DOM（简化版）

    // 简化方案：返回元素位置信息，由 UI 层决定是否需要实际截图
    // 实际项目中可集成 html2canvas 库

    return null // 暂时返回 null，后续可集成真实截图
  } catch (error) {
    console.error('Failed to capture element screenshot:', error)
    return null
  }
}

export async function captureVisibleArea(): Promise<string | null> {
  try {
    // 使用 Chrome API 截图当前可见区域
    // 需要在 background script 中调用 chrome.tabs.captureVisibleTab

    return null
  } catch (error) {
    return null
  }
}

export function getPreviewDataUrl(element: Element): string | null {
  // 简化版：返回元素的基本信息作为"预览"
  // 实际项目中应使用 canvas 或 html2canvas

  const rect = element.getBoundingClientRect()
  const text = element.textContent?.slice(0, 50) || ''

  // 返回一个标记字符串，UI 层可以显示"元素预览不可用"
  // 或者显示元素的文本内容作为替代

  return null
}
```

**说明：**

- 元素截图需要 canvas 或 html2canvas 库
- 简化方案：先实现框架，后续集成真实截图库
- 当前可以显示元素文本 + boundingBox 作为"预览替代"

---

### Task 4: Handler 实现

**Files:** `utils/content-handlers.ts`

#### 4.1 添加导入

```typescript
import {
  // ... existing
  type GetPageStructureParams,
  type GetPageStructureResult,
  type FindElementsParams,
  type FindElementsResult,
  type ElementInfo,
  type ToolExecution,
  type ConfirmRequest,
  type ConfirmResponse,
} from '~/types/mcp-tools'
import { analyzeElement, isVisible, isInteractive } from './element-utils'
import { getPreviewDataUrl } from './screenshot-utils'
import { messaging } from '~/modules/messaging'
```

#### 4.2 handleGetPageStructure

```typescript
export async function handleGetPageStructure(
  params: GetPageStructureParams
): Promise<GetPageStructureResult> {
  const { depth = 3, includeText = false } = params

  const structure = getDOMStructure(document.body, depth, includeText)
  return { structure }
}
```

#### 4.3 handleFindElements（增强版 + 截图）

```typescript
export async function handleFindElements(params: FindElementsParams): Promise<FindElementsResult> {
  const {
    text,
    tag,
    attribute,
    attributeValue,
    visible = true,
    interactive = false,
    limit = 10,
    includePreview = true,
  } = params

  let selector = tag || '*'
  if (attribute && attributeValue) {
    selector += `[${attribute}="${attributeValue}"]`
  }

  const allElements = Array.from(document.querySelectorAll(selector))

  const filteredElements = allElements.filter((el) => {
    if (text && !el.textContent?.toLowerCase().includes(text.toLowerCase())) {
      return false
    }
    if (visible && !isVisible(el)) {
      return false
    }
    if (interactive && !isInteractive(el)) {
      return false
    }
    return true
  })

  const analyzedElements = filteredElements
    .map((el) => {
      const analysis = analyzeElement(el)

      const attrs: Record<string, string> = {}
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== 'class' || attr.value.length < 100) {
          attrs[attr.name] = attr.value
        }
      })

      return {
        ...analysis,
        text: el.textContent?.trim().slice(0, 100) || undefined,
        tag: el.tagName.toLowerCase(),
        attributes: attrs,
        previewImage: includePreview ? getPreviewDataUrl(el) : undefined,
      }
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)

  // 为前 3 个元素添加实际截图（如果集成截图库）
  if (includePreview && analyzedElements.length > 0) {
    const topElements = filteredElements.slice(0, 3)
    // await captureElementScreenshot(topElements[0]) // 后续集成
  }

  return {
    elements: analyzedElements,
    total: allElements.length,
    filtered: filteredElements.length,
  }
}
```

#### 4.4 修改 handleClickElement（使用 UI 确认）

```typescript
export async function handleClickElement(params: ClickElementParams): Promise<ClickElementResult> {
  const { selector } = params
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error('Element not found')
  }

  // 高亮元素
  highlightElement(element)

  // 发送确认请求到 UI
  const previewImage = await captureElementScreenshot(element)
  const elementInfo = {
    text: element.textContent?.slice(0, 100),
    tag: element.tagName.toLowerCase(),
    selector,
  }

  const response = await messaging.sendToBackground('CONFIRM_REQUEST', {
    tool: 'click_element',
    params: { selector },
    previewImage,
    elementInfo,
    operationDescription: '点击元素',
  })

  if (!response?.confirmed) {
    return { cancelled: true }
  }

  // 执行点击
  ;(element as HTMLElement).click()
  return { clicked: true }
}
```

#### 4.5 修改 handleFillForm（使用 UI 确认）

```typescript
export async function handleFillForm(params: FillFormParams): Promise<FillFormResult> {
  const { selector, value, submit = false } = params
  const element = document.querySelector(selector) as HTMLInputElement

  if (!element) {
    throw new Error('Element not found')
  }

  highlightElement(element)

  const previewImage = await captureElementScreenshot(element)
  const elementInfo = {
    text: element.textContent?.slice(0, 100),
    tag: element.tagName.toLowerCase(),
    selector,
  }

  const response = await messaging.sendToBackground('CONFIRM_REQUEST', {
    tool: 'fill_form',
    params: { selector, value, submit },
    previewImage,
    elementInfo,
    operationDescription: `填写表单: "${value}"`,
  })

  if (!response?.confirmed) {
    return { cancelled: true }
  }

  element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))

  if (submit) {
    const form = element.closest('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }))
    }
  }

  return { filled: true }
}
```

#### 4.6 handleExecuteScript（CSP 处理）

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
        '此页面有严格的 CSP 禁止执行动态脚本。\n' +
          '建议使用其他工具:\n' +
          '- find_elements: 查找页面元素\n' +
          '- click_element: 点击元素\n' +
          '- fill_form: 填写表单\n' +
          '- extract_content: 提取内容'
      )
    }

    throw new Error(`脚本执行错误: ${errorMsg}`)
  }
}
```

#### 4.7 handleToolExecution（更新 switch）

```typescript
export async function handleToolExecution(data: { tool: string; params: any }, _sender: any) {
  const { tool, params } = data

  try {
    let result: any

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

    return { success: true, result }
  } catch (error) {
    console.error('Tool execution error:', error)
    return { success: false, error: (error as Error).message }
  }
}
```

---

### Task 5: 确认对话框组件

**Files:** `entrypoints/sidebar/components/ToolConfirmDialog.vue`（新建）

```vue
<template>
  <el-dialog v-model="visible" title="确认操作" width="500px" :close-on-click-modal="false">
    <div class="confirm-content">
      <!-- 操作说明 -->
      <el-alert type="warning" :closable="false">
        <template #title>
          {{ confirmRequest.operationDescription }}
        </template>
      </el-alert>

      <!-- 元素预览 -->
      <div v-if="confirmRequest.previewImage" class="preview-section">
        <img :src="confirmRequest.previewImage" class="preview-image" />
      </div>
      <div v-else-if="confirmRequest.elementInfo" class="preview-section">
        <div class="element-placeholder">
          <div class="element-tag">{{ confirmRequest.elementInfo.tag }}</div>
          <div class="element-text">{{ confirmRequest.elementInfo.text }}</div>
          <div class="element-selector">{{ confirmRequest.elementInfo.selector }}</div>
        </div>
      </div>

      <!-- 参数详情 -->
      <el-collapse>
        <el-collapse-item title="查看详细参数">
          <pre class="params">{{ JSON.stringify(confirmRequest.params, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>

      <!-- 会话允许选项 -->
      <el-checkbox v-if="showSessionAllow" v-model="sessionAllow">
        本次会话内允许此工具，不再询问
      </el-checkbox>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm"> 确认执行 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ConfirmRequest } from '~/types/mcp-tools'

  const props = defineProps<{
    confirmRequest: ConfirmRequest
    showSessionAllow?: boolean // 安全工具显示此选项
  }>()

  const emit = defineEmits<{
    confirm: [confirmed: boolean, sessionAllow?: boolean]
    cancel: []
  }>()

  const visible = ref(true)
  const sessionAllow = ref(false)

  const handleConfirm = () => {
    emit('confirm', true, sessionAllow.value ? props.confirmRequest.tool : undefined)
    visible.value = false
  }

  const handleCancel = () => {
    emit('cancel')
    visible.value = false
  }
</script>

<style scoped>
  .confirm-content {
    padding: 16px 0;
  }

  .preview-section {
    margin: 16px 0;
    text-align: center;
  }

  .preview-image {
    max-width: 100%;
    border: 2px solid #409eff;
    border-radius: 4px;
  }

  .element-placeholder {
    background: #f5f5f5;
    border: 2px solid #409eff;
    border-radius: 4px;
    padding: 16px;
  }

  .element-tag {
    font-weight: bold;
    color: #409eff;
  }

  .element-text {
    margin-top: 8px;
    color: #333;
  }

  .element-selector {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .params {
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
  }
</style>
```

---

### Task 6: 工具调用卡片组件

**Files:** `entrypoints/sidebar/components/ToolCallCard.vue`（新建）

```vue
<template>
  <div class="tool-call-card" :class="execution.status">
    <div class="tool-header">
      <span class="tool-icon">{{ toolIcon }}</span>
      <span class="tool-name">{{ execution.name }}</span>
      <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
    </div>

    <!-- 截图预览 -->
    <div v-if="execution.previewImage" class="preview-section">
      <img :src="execution.previewImage" class="preview-thumbnail" />
    </div>

    <!-- 详细信息（可折叠） -->
    <el-collapse>
      <el-collapse-item title="参数">
        <pre class="params">{{ JSON.stringify(execution.params, null, 2) }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.result" title="结果">
        <div v-if="isFindElementsResult" class="elements-result">
          <div v-for="(el, idx) in execution.result.elements" :key="idx" class="element-item">
            <div class="element-header">
              <span class="element-tag">{{ el.tag }}</span>
              <span class="element-selector">{{ el.recommended }}</span>
              <span class="element-priority">Priority: {{ el.priority }}</span>
            </div>
            <div class="element-selectors">
              <el-tag
                v-for="s in el.selectors"
                :key="s.type"
                size="small"
                :type="selectorType(s.confidence)"
              >
                {{ s.type }}: {{ s.value }} ({{ s.confidence }}%)
              </el-tag>
            </div>
          </div>
        </div>
        <pre v-else class="result">{{ formatResult }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.error" title="错误">
        <div class="error">{{ execution.error }}</div>
      </el-collapse-item>
    </el-collapse>

    <div class="tool-meta">
      <span v-if="execution.duration" class="duration">{{ execution.duration }}ms</span>
      <span class="timestamp">{{ formatTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ToolExecution, FindElementsResult } from '~/types/mcp-tools'

  const props = defineProps<{
    execution: ToolExecution
  }>()

  const toolIcon = computed(() => {
    const icons: Record<string, string> = {
      click_element: '🖱',
      fill_form: '📝',
      extract_content: '📋',
      scroll_page: '⬇',
      execute_script: '⚡',
      get_page_content: '📄',
      get_page_structure: '🏗',
      find_elements: '🔍',
      take_screenshot: '📸',
    }
    return icons[props.execution.name] || '🔧'
  })

  const statusType = computed(() => {
    switch (props.execution.status) {
      case 'pending':
        return 'info'
      case 'confirming':
        return 'warning'
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'cancelled':
        return ''
      default:
        return 'info'
    }
  })

  const statusText = computed(() => {
    switch (props.execution.status) {
      case 'pending':
        return '等待执行'
      case 'confirming':
        return '等待确认'
      case 'success':
        return '成功'
      case 'error':
        return '失败'
      case 'cancelled':
        return '已取消'
      default:
        return props.execution.status
    }
  })

  const formatResult = computed(() => {
    if (typeof props.execution.result === 'object') {
      return JSON.stringify(props.execution.result, null, 2)
    }
    return String(props.execution.result)
  })

  const formatTime = computed(() => {
    return new Date(props.execution.timestamp).toLocaleTimeString()
  })

  const isFindElementsResult = computed(() => {
    return (
      props.execution.name === 'find_elements' &&
      props.execution.result &&
      'elements' in props.execution.result
    )
  })

  function selectorType(confidence: number): '' | 'success' | 'warning' | 'danger' | 'info' {
    if (confidence >= 85) return 'success'
    if (confidence >= 70) return 'info'
    if (confidence >= 50) return 'warning'
    return ''
  }
</script>

<style scoped>
  .tool-call-card {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 8px 0;
    background: #fafafa;
  }

  .tool-call-card.pending {
    border-color: #1976d2;
    background: #e3f2fd;
  }
  .tool-call-card.confirming {
    border-color: #f57c00;
    background: #fff3e0;
  }
  .tool-call-card.success {
    border-color: #388e3c;
    background: #e8f5e9;
  }
  .tool-call-card.error {
    border-color: #d32f2f;
    background: #ffebee;
  }
  .tool-call-card.cancelled {
    border-color: #757575;
    background: #f5f5f5;
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-icon {
    font-size: 18px;
  }
  .tool-name {
    font-weight: 500;
    flex: 1;
  }

  .preview-section {
    margin: 8px 0;
    text-align: center;
  }

  .preview-thumbnail {
    max-width: 200px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .params,
  .result {
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }

  .error {
    color: #d32f2f;
    font-size: 13px;
  }

  .elements-result {
    max-height: 300px;
    overflow-y: auto;
  }

  .element-item {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px;
    margin: 8px 0;
  }

  .element-header {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .element-tag {
    background: #e0e0e0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .element-selector {
    font-weight: 500;
    color: #1976d2;
  }

  .element-priority {
    font-size: 11px;
    color: #666;
  }

  .element-selectors {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }

  .tool-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }
</style>
```

---

### Task 7: 确认状态管理 Composable

**Files:** `composables/useToolConfirm.ts`（新建）

```typescript
import { ref } from 'vue'
import { ConfirmRequest } from '~/types/mcp-tools'

const sessionAllowedTools = ref<Set<string>>(new Set())

export function useToolConfirm() {
  const pendingConfirm = ref<ConfirmRequest | null>(null)
  const confirmCallback = ref<((confirmed: boolean, sessionAllow?: string) => void) | null>(null)

  function requestConfirm(
    request: ConfirmRequest,
    callback: (confirmed: boolean, sessionAllow?: string) => void
  ) {
    // 检查是否已会话允许
    if (sessionAllowedTools.value.has(request.tool)) {
      callback(true)
      return
    }

    pendingConfirm.value = request
    confirmCallback.value = callback
  }

  function handleConfirm(confirmed: boolean, sessionAllow?: string) {
    if (confirmed && sessionAllow) {
      sessionAllowedTools.value.add(sessionAllow)
    }

    if (confirmCallback.value) {
      confirmCallback.value(confirmed, sessionAllow)
    }

    pendingConfirm.value = null
    confirmCallback.value = null
  }

  function cancelConfirm() {
    if (confirmCallback.value) {
      confirmCallback.value(false)
    }
    pendingConfirm.value = null
    confirmCallback.value = null
  }

  function isSessionAllowed(tool: string): boolean {
    return sessionAllowedTools.value.has(tool)
  }

  function clearSessionAllowed() {
    sessionAllowedTools.value.clear()
  }

  return {
    pendingConfirm,
    requestConfirm,
    handleConfirm,
    cancelConfirm,
    isSessionAllowed,
    clearSessionAllowed,
  }
}
```

---

### Task 8: ChatPanel 确认对话框管理

**Files:** `entrypoints/sidebar/ChatPanel.vue`

#### 8.1 添加导入和状态

```typescript
import ToolConfirmDialog from './components/ToolConfirmDialog.vue'
import { useToolConfirm } from '~/composables/useToolConfirm'
import { ConfirmRequest } from '~/types/mcp-tools'

const { pendingConfirm, requestConfirm, handleConfirm, cancelConfirm, isSessionAllowed } =
  useToolConfirm()
const currentToolExecutions = ref<ToolExecution[]>([])
```

#### 8.2 处理 CONFIRM_REQUEST 消息

```typescript
chrome.runtime.onMessage.addListener((message) => {
  // ... existing handlers

  else if (message.type === 'CONFIRM_REQUEST') {
    const confirmRequest: ConfirmRequest = message.data

    requestConfirm(confirmRequest, (confirmed, sessionAllow) => {
      // 发送确认响应到 background
      chrome.runtime.sendMessage({
        type: 'CONFIRM_RESPONSE',
        data: {
          requestId: message.requestId,
          confirmed,
          sessionAllow,
        },
      })
    })
  }
})
```

#### 8.3 模板添加确认对话框

```vue
<template>
  <div class="chat-panel">
    <!-- ... existing content -->

    <!-- Tool Confirm Dialog -->
    <ToolConfirmDialog
      v-if="pendingConfirm"
      :confirm-request="pendingConfirm"
      :show-session-allow="isSafeTool(pendingConfirm.tool)"
      @confirm="handleConfirmDialog"
      @cancel="cancelConfirm"
    />
  </div>
</template>

<script setup>
  function handleConfirmDialog(confirmed: boolean, sessionAllow?: string) {
    handleConfirm(confirmed, sessionAllow)
  }

  function isSafeTool(tool: string): boolean {
    // 安全工具：可以选择"会话内允许"
    const safeTools = ['scroll_page', 'extract_content', 'get_page_content', 'get_page_structure']
    return safeTools.includes(tool)
  }
</script>
```

---

### Task 9: Background 确认响应处理

**Files:** `entrypoints/background.ts`

#### 9.1 添加确认请求/响应 handler

```typescript
const pendingConfirmRequests = new Map<string, { resolve: Function; reject: Function }>()

messaging.onMessage('CONFIRM_REQUEST', async (data, sender) => {
  const requestId = generateId()

  return new Promise((resolve) => {
    pendingConfirmRequests.set(requestId, { resolve })

    // 发送到 sidebar
    chrome.runtime.sendMessage({
      type: 'CONFIRM_REQUEST',
      requestId,
      data,
    })
  })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CONFIRM_RESPONSE') {
    const { requestId, confirmed, sessionAllow } = message.data
    const pending = pendingConfirmRequests.get(requestId)

    if (pending) {
      pending.resolve({ confirmed, sessionAllow })
      pendingConfirmRequests.delete(requestId)
    }
  }
})
```

#### 9.2 toolExecutor 发送完整信息

```typescript
const toolExecutor = async (name: string, args: Record<string, any>) => {
  const toolId = generateId()
  const startTime = Date.now()

  // 发送 pending 状态
  chrome.runtime.sendMessage({
    type: 'TOOL_EXECUTION',
    data: {
      id: toolId,
      tool: name,
      args,
      status: 'pending',
      timestamp: startTime,
    },
  })

  try {
    const result = await mcpServer.executeTool(name, args)
    const endTime = Date.now()

    // 如果是 confirm 状态，先更新
    if (result.status === 'confirming') {
      chrome.runtime.sendMessage({
        type: 'TOOL_EXECUTION',
        data: {
          id: toolId,
          tool: name,
          args,
          status: 'confirming',
          previewImage: result.previewImage,
          timestamp: endTime,
        },
      })

      // 等待用户确认
      const confirmResponse = await waitForConfirm(toolId)

      if (!confirmResponse.confirmed) {
        chrome.runtime.sendMessage({
          type: 'TOOL_EXECUTION',
          data: {
            id: toolId,
            tool: name,
            args,
            status: 'cancelled',
            timestamp: Date.now(),
            duration: Date.now() - startTime,
          },
        })
        return { cancelled: true }
      }

      // 继续执行
      result = await mcpServer.executeToolConfirmed(name, args, toolId)
    }

    chrome.runtime.sendMessage({
      type: 'TOOL_EXECUTION',
      data: {
        id: toolId,
        tool: name,
        args,
        result,
        status: 'success',
        timestamp: endTime,
        duration: endTime - startTime,
      },
    })

    return result
  } catch (error) {
    // ... error handling
  }
}
```

---

### Task 10: MessageList 显示工具调用

**Files:** `entrypoints/sidebar/MessageList.vue`

```vue
<template>
  <div class="message-list">
    <div v-for="message in messages" :key="message.id" :class="['message', message.role]">
      <div class="message-header">
        <span class="role">{{ roleLabel(message.role) }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- Tool executions -->
      <div v-if="message.metadata?.toolExecutions?.length" class="tool-executions">
        <ToolCallCard
          v-for="execution in message.metadata.toolExecutions"
          :key="execution.id"
          :execution="execution"
        />
      </div>

      <!-- Message content -->
      <div class="message-content">
        <div v-if="message.role === 'user'" class="user-content">
          {{ message.content }}
        </div>
        <div v-else class="assistant-content">
          <div v-html="renderedContent(message.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import ToolCallCard from './components/ToolCallCard.vue'
  // ... existing imports
</script>

<style scoped>
  .tool-executions {
    margin: 8px 0;
    border-left: 3px solid #1976d2;
    padding-left: 8px;
  }
</style>
```

---

### Task 11: 测试

**Files:** `tests/content/content-handlers.test.ts`

添加测试：

- handleGetPageStructure
- handleFindElements（优先级排序、多策略 selector）
- UI 确认流程（mock messaging）
- CSP 错误处理

---

### Task 12: 构建和验证

#### 12.1 运行测试

```bash
npm run test:run
npm run lint
npm run build
```

#### 12.2 手动测试场景

1. **百度首页搜索：**
   - 输入："找到搜索按钮"
   - 观察：find_elements 返回多个 selector + priority
   - 输入："点击搜索按钮"
   - 观察：显示确认对话框 + 元素预览

2. **CSP 错误：**
   - 输入："执行脚本获取标题"
   - 观察：显示友好 CSP 错误提示

3. **会话允许：**
   - 输入："滚动到底部"
   - 确认对话框勾选"本次会话允许"
   - 再次输入："再滚动一次"
   - 观察：不再显示确认对话框

---

## 完整效果预览

### find_elements 输出（MessageList）

```
┌─ 🔍 find_elements ────────────────┐
│ ✅ Success | 150ms                │
│                                   │
│ 元素列表 (10/50 个):              │
│                                   │
│ ┌─ 元素 #1 ───────────────────┐  │
│ │ button | #su (推荐)         │  │
│ │ Priority: 68                │  │
│ │ [ID: 95%] [text: 70%]       │  │
│ │ "百度一下"                   │  │
│ └───────────────────────────┘  │
│                                   │
│ ┌─ 元素 #2 ───────────────────┐  │
│ │ a | [aria-label="导航"]     │  │
│ │ Priority: 55                │  │
│ └───────────────────────────┘  │
└───────────────────────────────┘
```

### 确认对话框（ChatPanel）

```
┌─ 确认操作 ──────────────────────────┐
│                                     │
│ ⚠ 点击元素                          │
│                                     │
│ ┌───────────────────────────────┐  │
│ │  [📸 元素截图预览]             │  │
│ │                               │  │
│ │   button                      │  │
│ │   "百度一下"                   │  │
│ │   #su                         │  │
│ └───────────────────────────────┘  │
│                                     │
│ ☐ 本次会话内允许此工具，不再询问    │
│                                     │
│      [取消]         [确认执行]      │
│                                     │
└─────────────────────────────────────┘
```

---

## 注意事项

1. **截图功能简化**：当前框架使用 placeholder，后续可集成 html2canvas
2. **确认流程阻塞**：content script 通过 messaging 等待 UI 确认
3. **会话允许范围**：仅本次会话有效，刷新后清空
4. **性能考虑**：find_elements 默认限制 10 个，截图仅前 3 个
5. **向后兼容**：现有工具行为不变，仅 UI 层新增确认

---

## 后续优化建议

1. 集成 html2canvas 实现真实元素截图
2. 添加"撤销上次工具操作"功能
3. 工具执行日志导出
4. 设置页面配置确认行为
5. 支持"信任此网站"选项
