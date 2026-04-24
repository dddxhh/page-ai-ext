# MCP 工具补全 + 工具展示 UI + find_elements 增强

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:**

1. 补全缺失的 MCP handler（get_page_structure, find_elements）
2. 在 MessageList 中展示工具调用历史（嵌入卡片）
3. find_elements 使用多策略 selector + 优先级排序

**Architecture:**

- Handler 层：content-handlers.ts
- UI 层：ToolCallCard.vue + MessageList.vue
- 数据流：background.ts 发送 TOOL_EXECUTION → ChatPanel 收集 → MessageList 展示

---

## 文件结构

| 文件                                              | 操作 | 说明                                      |
| ------------------------------------------------- | ---- | ----------------------------------------- |
| `types/mcp-tools.ts`                              | 修改 | 添加新类型定义                            |
| `types/index.ts`                                  | 修改 | 扩展 Message metadata                     |
| `utils/content-handlers.ts`                       | 修改 | 添加 2 个 handler + 增强 find_elements    |
| `utils/element-utils.ts`                          | 创建 | 元素分析工具（selector 生成、优先级计算） |
| `entrypoints/sidebar/components/ToolCallCard.vue` | 创建 | 工具调用卡片组件                          |
| `entrypoints/sidebar/MessageList.vue`             | 修改 | 显示 toolCalls                            |
| `entrypoints/sidebar/ChatPanel.vue`               | 修改 | 收集工具调用历史                          |
| `entrypoints/background.ts`                       | 修改 | 发送完整工具信息                          |

---

### Task 1: 添加类型定义

**Files:** `types/mcp-tools.ts`, `types/index.ts`

#### Step 1: 添加 handler 类型（types/mcp-tools.ts）

```typescript
// 在文件末尾添加

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
  status: 'pending' | 'success' | 'error'
  timestamp: number
  duration?: number
}
```

#### Step 2: 扩展 Message 类型（types/index.ts）

```typescript
// 修改 Message.metadata

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: {
    toolCalls?: ToolCall[] // 已有
    toolExecutions?: ToolExecution[] // 新增：完整执行历史
    pageContext?: PageContext
  }
}
```

---

### Task 2: 创建元素分析工具模块

**Files:** `utils/element-utils.ts`（新建）

#### Step 1: 创建文件

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

  // Strategy 1: ID (highest confidence)
  if (element.id) {
    selectors.push({
      type: 'id',
      value: `#${element.id}`,
      confidence: 95,
    })
  }

  // Strategy 2: data-testid
  const testId = element.getAttribute('data-testid')
  if (testId) {
    selectors.push({
      type: 'testid',
      value: `[data-testid="${testId}"]`,
      confidence: 90,
    })
  }

  // Strategy 3: aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) {
    selectors.push({
      type: 'aria',
      value: `[aria-label="${ariaLabel}"]`,
      confidence: 85,
    })
  }

  // Strategy 4: name attribute (for form elements)
  const name = element.getAttribute('name')
  if (name) {
    selectors.push({
      type: 'name',
      value: `[name="${name}"]`,
      confidence: 80,
    })
  }

  // Strategy 5: text content (for buttons/links)
  const text = element.textContent?.trim()
  if (text && text.length < 50 && ['button', 'a'].includes(element.tagName.toLowerCase())) {
    selectors.push({
      type: 'text',
      value: `${element.tagName.toLowerCase()}:has-text("${text.slice(0, 30)}")`,
      confidence: 70,
    })
  }

  // Strategy 6: class + structural (lowest confidence)
  const structural = generateStructuralSelector(element)
  selectors.push({
    type: 'structural',
    value: structural,
    confidence: 40,
  })

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

### Task 3: 实现 Handler

**Files:** `utils/content-handlers.ts`

#### Step 1: 添加导入

```typescript
import {
  // ... existing imports
  type GetPageStructureParams,
  type GetPageStructureResult,
  type FindElementsParams,
  type FindElementsResult,
  type ElementInfo,
} from '~/types/mcp-tools'
import { analyzeElement, isVisible, isInteractive } from './element-utils'
```

#### Step 2: 实现 handleGetPageStructure

```typescript
export async function handleGetPageStructure(
  params: GetPageStructureParams
): Promise<GetPageStructureResult> {
  const { depth = 3, includeText = false } = params

  const structure = getDOMStructure(document.body, depth, includeText)
  return { structure }
}
```

#### Step 3: 实现 handleFindElements（增强版）

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
  } = params

  // Build selector
  let selector = tag || '*'
  if (attribute && attributeValue) {
    selector += `[${attribute}="${attributeValue}"]`
  }

  const allElements = Array.from(document.querySelectorAll(selector))

  // Filter by criteria
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

  // Analyze and sort by priority
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
      }
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)

  return {
    elements: analyzedElements,
    total: allElements.length,
    filtered: filteredElements.length,
  }
}
```

#### Step 4: 更新 handleToolExecution switch

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

### Task 4: 处理 execute_script CSP

**Files:** `utils/content-handlers.ts`

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

---

### Task 5: 创建工具调用卡片组件

**Files:** `entrypoints/sidebar/components/ToolCallCard.vue`（新建）

```vue
<template>
  <div class="tool-call-card" :class="execution.status">
    <div class="tool-header">
      <span class="tool-icon">
        {{ toolIcon }}
      </span>
      <span class="tool-name">{{ execution.name }}</span>
      <span class="tool-status">
        <el-icon v-if="execution.status === 'pending'" class="is-loading">
          <Loading />
        </el-icon>
        <el-icon v-else-if="execution.status === 'success'">
          <CircleCheck />
        </el-icon>
        <el-icon v-else-if="execution.status === 'error'">
          <CircleClose />
        </el-icon>
      </span>
    </div>

    <el-collapse v-if="showDetails">
      <el-collapse-item title="参数">
        <pre class="params">{{ JSON.stringify(execution.params, null, 2) }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.result" title="结果">
        <pre class="result">{{ formatResult }}</pre>
      </el-collapse-item>

      <el-collapse-item v-if="execution.error" title="错误">
        <div class="error">{{ execution.error }}</div>
      </el-collapse-item>
    </el-collapse>

    <div class="tool-meta">
      <span class="duration" v-if="execution.duration"> {{ execution.duration }}ms </span>
      <span class="timestamp">{{ formatTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
  import { ToolExecution } from '~/types'

  const props = defineProps<{
    execution: ToolExecution
    showDetails?: boolean
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

  const formatResult = computed(() => {
    if (typeof props.execution.result === 'object') {
      return JSON.stringify(props.execution.result, null, 2)
    }
    return String(props.execution.result)
  })

  const formatTime = computed(() => {
    const date = new Date(props.execution.timestamp)
    return date.toLocaleTimeString()
  })
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

  .tool-call-card.success {
    border-color: #388e3c;
    background: #e8f5e9;
  }

  .tool-call-card.error {
    border-color: #d32f2f;
    background: #ffebee;
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

  .tool-status {
    font-size: 16px;
  }

  .params,
  .result {
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 200px;
  }

  .error {
    color: #d32f2f;
    font-size: 13px;
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

### Task 6: 修改 MessageList 显示工具调用

**Files:** `entrypoints/sidebar/MessageList.vue`

#### Step 1: 导入 ToolCallCard

```typescript
import ToolCallCard from './components/ToolCallCard.vue'
```

#### Step 2: 修改模板

```vue
<template>
  <div class="message-list">
    <div v-for="message in messages" :key="message.id" :class="['message', message.role]">
      <div class="message-header">
        <span class="role">{{ roleLabel(message.role) }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- Tool executions -->
      <div v-if="message.metadata?.toolExecutions" class="tool-executions">
        <ToolCallCard
          v-for="execution in message.metadata.toolExecutions"
          :key="execution.id"
          :execution="execution"
          :show-details="true"
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
```

#### Step 3: 添加样式

```css
.tool-executions {
  margin: 8px 0;
}
```

---

### Task 7: ChatPanel 收集工具调用历史

**Files:** `entrypoints/sidebar/ChatPanel.vue`

#### Step 1: 添加 toolExecutions ref

```typescript
const currentToolExecutions = ref<ToolExecution[]>([])
```

#### Step 2: 修改 TOOL_EXECUTION handler

```typescript
} else if (message.type === 'TOOL_EXECUTION') {
  const { tool, args, result, error, status, id, timestamp, duration } = message.data

  // 添加到当前工具调用历史
  currentToolExecutions.value.push({
    id: id || generateId(),
    name: tool,
    params: args,
    result,
    error,
    status,
    timestamp: timestamp || Date.now(),
    duration,
  })

  // 更新或创建 streaming message 的 metadata
  const streamingMsg = messages.value.find(m => m.id === 'streaming')
  if (streamingMsg) {
    streamingMsg.metadata = {
      ...streamingMsg.metadata,
      toolExecutions: [...currentToolExecutions.value],
    }
  }
}
```

#### Step 3: 在 finalizeMessage 时保存 toolExecutions

```typescript
async function finalizeMessage(content: string): Promise<void> {
  const index = messages.value.findIndex((m) => m.id === 'streaming')
  if (index >= 0) {
    messages.value[index] = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      metadata: {
        toolExecutions:
          currentToolExecutions.value.length > 0 ? [...currentToolExecutions.value] : undefined,
      },
    }
  }

  // 清空工具调用历史
  currentToolExecutions.value = []

  await saveConversationToStorage()
}
```

---

### Task 8: Background 发送完整工具信息

**Files:** `entrypoints/background.ts`

#### Step 1: 修改 toolExecutor

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
    const endTime = Date.now()
    const errorMsg = error instanceof Error ? error.message : String(error)

    chrome.runtime.sendMessage({
      type: 'TOOL_EXECUTION',
      data: {
        id: toolId,
        tool: name,
        args,
        error: errorMsg,
        status: 'error',
        timestamp: endTime,
        duration: endTime - startTime,
      },
    })

    return { error: errorMsg, tool: name }
  }
}
```

---

### Task 9: 测试

#### Step 1: 添加 handler 测试

在 `tests/content/content-handlers.test.ts` 中添加：

```typescript
import { handleGetPageStructure, handleFindElements } from '../../utils/content-handlers'

describe('handleGetPageStructure', () => {
  it('should return structure with default depth', async () => {
    const result = await handleGetPageStructure({})
    expect(result.structure.tag).toBe('body')
    expect(result.structure.children.length).toBeGreaterThan(0)
  })
})

describe('handleFindElements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="submit-btn" class="primary">Submit</button>
      <button class="secondary">Cancel</button>
      <input name="email" type="text" />
      <a href="/link" aria-label="Navigation">Link</a>
      <div style="display:none;">Hidden</div>
    `
  })

  it('should find by tag and sort by priority', async () => {
    const result = await handleFindElements({ tag: 'button' })
    expect(result.elements.length).toBe(2)
    expect(result.elements[0].priority).toBeGreaterThanOrEqual(result.elements[1].priority)
  })

  it('should return multiple selector strategies', async () => {
    const result = await handleFindElements({ tag: 'button', limit: 1 })
    expect(result.elements[0].selectors.length).toBeGreaterThan(1)
    expect(result.elements[0].recommended).toBe('#submit-btn')
  })

  it('should filter visible elements', async () => {
    const result = await handleFindElements({ tag: 'div', visible: true })
    expect(result.elements.every((e) => e.isVisible)).toBe(true)
  })
})
```

#### Step 2: 运行测试

```bash
npm run test:run
npm run lint
npm run build
```

---

### Task 10: 手动验证

1. 加载扩展
2. 打开百度首页
3. 输入 "找到搜索按钮并点击"
4. 观察：
   - MessageList 中应显示 ToolCallCard
   - find_elements 返回多个 selector + priority
   - click_element 使用推荐的 selector

---

## 预期效果

### find_elements 返回示例

```json
{
  "elements": [
    {
      "selectors": [
        { "type": "id", "value": "#su", "confidence": 95 },
        { "type": "text", "value": "button:has-text(\"百度一下\")", "confidence": 70 },
        { "type": "structural", "value": "#form > span > button", "confidence": 40 }
      ],
      "recommended": "#su",
      "text": "百度一下",
      "tag": "button",
      "isVisible": true,
      "isInteractive": true,
      "priority": 68,
      "boundingBox": { "x": 500, "y": 300, "width": 100, "height": 36 }
    }
  ],
  "total": 50,
  "filtered": 10
}
```

### MessageList 展示效果

```
┌─────────────────────────────────┐
│ AI: 我来帮你找到并点击搜索按钮   │
│                                 │
│ ┌─ 🔍 find_elements ────────┐ │
│ │ ✅ Success | 150ms        │ │
│ │ [展开] 参数/结果           │ │
│ └───────────────────────────┘ │
│                                 │
│ ┌─ 🖱 click_element ────────┐ │
│ │ ⏳ Pending | waiting...   │ │
│ └───────────────────────────┘ │
│                                 │
│ 已找到搜索按钮，请确认是否点击  │
└─────────────────────────────────┘
```

---

## 注意事项

1. **CSP 处理**: 仅在 execute_script 中处理，其他工具不受影响
2. **性能**: find_elements 默认限制 10 个元素，避免过大响应
3. **Selector 稳定性**: 优先使用 ID/data-testid，其次是语义属性
4. **UI 状态**: pending → success/error 状态转换实时更新
