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
