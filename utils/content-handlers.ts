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
  type ElementInfo,
  type ConfirmRequest,
} from '~/types/mcp-tools'
import { highlightElement, convertToMarkdown, getDOMStructure } from './content-utils'
import { analyzeElement, isVisible, isInteractive } from './element-utils'
import { getElementPreviewInfo, captureElementScreenshot } from './screenshot-utils'
import { messaging } from '~/modules/messaging'

async function confirmViaMessaging(
  tool: string,
  params: Record<string, any>,
  element?: Element
): Promise<boolean> {
  const previewImage = element ? await captureElementScreenshot(element) : undefined
  const elementInfo = element
    ? {
        text: element.textContent?.slice(0, 100),
        tag: element.tagName?.toLowerCase() || 'unknown',
        selector: params.selector || '',
      }
    : undefined

  const operationDescriptions: Record<string, string> = {
    click_element: '点击元素',
    fill_form: `填写表单: "${params.value}"`,
  }

  const confirmRequest: ConfirmRequest = {
    tool,
    params,
    previewImage,
    elementInfo,
    operationDescription: operationDescriptions[tool] || tool,
  }

  try {
    const response = await messaging.sendToBackground('CONFIRM_REQUEST', confirmRequest)
    return response?.confirmed === true
  } catch (error) {
    console.warn('Confirm request failed, fallback to window.confirm:', error)
    return window.confirm(confirmRequest.operationDescription)
  }
}

export async function handleClickElement(params: ClickElementParams): Promise<ClickElementResult> {
  const { selector } = params
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error('Element not found')
  }

  highlightElement(element)

  const confirmed = await confirmViaMessaging('click_element', params, element)
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
  const confirmed = await confirmViaMessaging('fill_form', params, element)
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
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(script)) {
      throw new Error('脚本包含禁止的操作')
    }
  }

  const isSimpleExpression = /^[\w\s.()[\]"']+$/.test(script) && !script.includes('return')

  try {
    let result: unknown

    if (isSimpleExpression) {
      try {
        result = (0, eval)(script)
      } catch {
        result = new Function('return (' + script + ')')()
      }
    } else {
      const code = script.includes('return') ? script : `return (${script})`
      result = new Function(code)()
    }

    return { result }
  } catch (error) {
    const errorMsg = (error as Error).message

    if (
      errorMsg.includes('Content Security Policy') ||
      errorMsg.includes('unsafe-eval') ||
      errorMsg.includes('CSP') ||
      errorMsg.includes('eval') ||
      errorMsg.includes('Function')
    ) {
      throw new Error(
        '此页面有严格的 CSP 禁止执行动态脚本。\n' +
          '建议使用其他工具:\n' +
          '- click_element: 点击按钮/链接\n' +
          '- fill_form: 填写表单\n' +
          '- find_elements: 查找元素\n' +
          '- extract_content: 提取页面内容\n' +
          '- scroll_page: 滚动页面'
      )
    }

    throw new Error(`脚本执行失败: ${errorMsg}\n请检查脚本语法是否正确`)
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

export async function handleGetPageStructure(
  params: GetPageStructureParams
): Promise<GetPageStructureResult> {
  const { depth = 3, includeText = false } = params

  const structure = getDOMStructure(document.body, depth, includeText)
  return { structure }
}

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

  const analyzedElements: ElementInfo[] = filteredElements
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
        previewImage: includePreview ? getElementPreviewInfo(el) : undefined,
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
      case 'get_page_structure':
        result = await handleGetPageStructure(params)
        break
      case 'find_elements':
        result = await handleFindElements(params)
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
