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
} from '~/types/mcp-tools'
import {
  highlightElement,
  confirmAction,
  convertToMarkdown,
  getDOMStructure,
} from './content-utils'

export async function handleClickElement(params: ClickElementParams): Promise<ClickElementResult> {
  const { selector } = params
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error('Element not found')
  }

  highlightElement(element)

  const confirmed = await confirmAction('Click this element?')
  if (!confirmed) {
    return { cancelled: true }
  }

  ;(element as HTMLElement).click()
  return { clicked: true }
}

export async function handleFillForm(params: FillFormParams): Promise<FillFormResult> {
  const { selector, value, submit = false } = params
  const element = document.querySelector(selector) as HTMLInputElement

  if (!element) {
    throw new Error('Element not found')
  }

  highlightElement(element)
  const confirmed = await confirmAction(`Fill "${value}" into this field?`)
  if (!confirmed) {
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

export async function handleExtractContent(
  params: ExtractContentParams
): Promise<ExtractContentResult> {
  const { selector, format = 'text' } = params
  const element = selector ? document.querySelector(selector) : document.body

  if (!element) {
    throw new Error('Element not found')
  }

  let content: string

  switch (format) {
    case 'text':
      content = element.textContent || ''
      break
    case 'html':
      content = element.innerHTML
      break
    case 'markdown':
      content = convertToMarkdown(element)
      break
    default:
      throw new Error(`Unknown format: ${format}`)
  }

  return { content }
}

export async function handleScrollPage(params: ScrollPageParams): Promise<ScrollPageResult> {
  const { direction = 'down', amount = 500 } = params

  switch (direction) {
    case 'up':
      window.scrollBy(0, -amount)
      break
    case 'down':
      window.scrollBy(0, amount)
      break
    case 'top':
      window.scrollTo(0, 0)
      break
    case 'bottom':
      window.scrollTo(0, document.body.scrollHeight)
      break
    default:
      throw new Error(`Unknown direction: ${direction}`)
  }

  return { scrolled: true, scrollY: window.scrollY }
}

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
    throw new Error(`脚本执行错误: ${(error as Error).message}`)
  }
}

export async function handleGetPageContent(
  params: GetPageContentParams
): Promise<GetPageContentResult> {
  const { format = 'text' } = params

  switch (format) {
    case 'text':
      return { content: document.body.innerText }
    case 'html':
      return { content: document.body.innerHTML }
    case 'markdown':
      return { content: convertToMarkdown(document.body) }
    case 'dom':
      return { structure: getDOMStructure(document.body, 3, true) }
    default:
      throw new Error(`Unknown format: ${format}`)
  }
}

export async function handleTakeScreenshot(
  params: TakeScreenshotParams
): Promise<TakeScreenshotResult> {
  const { format = 'png' } = params

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) {
    throw new Error('No active tab')
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.id, { format })
  return { dataUrl }
}

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

export async function handleGetPageContentRequest(data: { format?: string }, _sender: any) {
  const { format = 'text' } = data

  try {
    let content: string

    switch (format) {
      case 'text':
        content = document.body.innerText
        break
      case 'html':
        content = document.body.innerHTML
        break
      case 'markdown':
        content = convertToMarkdown(document.body)
        break
      default:
        throw new Error(`Unknown format: ${format}`)
    }

    return { success: true, content }
  } catch (error) {
    console.error('Get page content error:', error)
    return { success: false, error: (error as Error).message }
  }
}
