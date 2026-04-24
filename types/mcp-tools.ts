export interface ClickElementParams {
  selector: string
}

export interface ClickElementResult {
  clicked?: boolean
  cancelled?: boolean
}

export interface FillFormParams {
  selector: string
  value: string
  submit?: boolean
}

export interface FillFormResult {
  filled?: boolean
  cancelled?: boolean
}

export interface ExtractContentParams {
  selector?: string
  format?: 'text' | 'html' | 'markdown'
}

export interface ExtractContentResult {
  content: string
}

export interface ScrollPageParams {
  direction?: 'up' | 'down' | 'top' | 'bottom'
  amount?: number
}

export interface ScrollPageResult {
  scrolled: boolean
  scrollY: number
}

export interface ExecuteScriptParams {
  script: string
}

export interface ExecuteScriptResult {
  result: unknown
}

export interface GetPageContentParams {
  format?: 'text' | 'html' | 'markdown' | 'dom'
}

export interface GetPageContentResult {
  content?: string
  structure?: DOMStructureNode
}

export interface TakeScreenshotParams {
  format?: 'png' | 'jpeg'
}

export interface TakeScreenshotResult {
  dataUrl: string
}

export interface DOMStructureNode {
  tag: string
  id?: string
  className?: string
  text?: string
  children: DOMStructureNode[]
}

export type ToolHandler<TParams, TResult> = (params: TParams) => Promise<TResult>

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
  includePreview?: boolean
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
  previewImage?: string
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
  previewImage?: string
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
  operationDescription: string
}

export interface ConfirmResponse {
  confirmed: boolean
  sessionAllow?: boolean
}
