import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleClickElement,
  handleFillForm,
  handleExtractContent,
  handleScrollPage,
  handleExecuteScript,
  handleGetPageContent,
} from '../../utils/content-handlers'

const mockSendToBackground = vi.hoisted(() => vi.fn().mockResolvedValue({ confirmed: true }))

vi.mock('../../modules/messaging', () => ({
  messaging: {
    sendToBackground: mockSendToBackground,
  },
}))

describe('content-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendToBackground.mockResolvedValue({ confirmed: true })
  })

  describe('handleClickElement', () => {
    it('should throw error if element not found', async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      await expect(handleClickElement({ selector: '#non-existent' })).rejects.toThrow(
        'Element not found'
      )
    })

    it('should return clicked: true if confirmed', async () => {
      const mockElement = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(''),
        removeAttribute: vi.fn(),
        tagName: 'BUTTON',
        textContent: 'Submit',
      }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)
      vi.spyOn(window, 'setTimeout').mockImplementation((fn: any) => fn())

      const result = await handleClickElement({ selector: '#button' })

      expect(mockSendToBackground).toHaveBeenCalledWith('CONFIRM_REQUEST', expect.any(Object))
      expect(result.clicked).toBe(true)
      expect(mockElement.click).toHaveBeenCalled()
    })

    it('should return cancelled: true if not confirmed', async () => {
      mockSendToBackground.mockResolvedValueOnce({ confirmed: false })

      const mockElement = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(''),
        removeAttribute: vi.fn(),
        tagName: 'BUTTON',
        textContent: 'Cancel',
      }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)
      vi.spyOn(window, 'setTimeout').mockImplementation((fn: any) => fn())

      const result = await handleClickElement({ selector: '#button' })

      expect(result.cancelled).toBe(true)
      expect(mockElement.click).not.toHaveBeenCalled()
    })
  })

  describe('handleFillForm', () => {
    it('should throw error if element not found', async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      await expect(handleFillForm({ selector: '#input', value: 'test' })).rejects.toThrow(
        'Element not found'
      )
    })

    it('should fill form and return filled: true', async () => {
      const mockInput = {
        value: '',
        dispatchEvent: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(''),
        removeAttribute: vi.fn(),
        closest: vi.fn().mockReturnValue(null),
        tagName: 'INPUT',
        textContent: '',
      }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockInput as any)
      vi.spyOn(window, 'setTimeout').mockImplementation((fn: any) => fn())

      const result = await handleFillForm({ selector: '#input', value: 'test value' })

      expect(mockSendToBackground).toHaveBeenCalledWith('CONFIRM_REQUEST', expect.any(Object))
      expect(result.filled).toBe(true)
      expect(mockInput.value).toBe('test value')
      expect(mockInput.dispatchEvent).toHaveBeenCalled()
    })

    it('should submit form if submit option is true', async () => {
      const mockForm = { dispatchEvent: vi.fn() }
      const mockInput = {
        value: '',
        dispatchEvent: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(''),
        removeAttribute: vi.fn(),
        closest: vi.fn().mockReturnValue(mockForm),
        tagName: 'INPUT',
        textContent: '',
      }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockInput as any)
      vi.spyOn(window, 'setTimeout').mockImplementation((fn: any) => fn())

      const result = await handleFillForm({ selector: '#input', value: 'test', submit: true })

      expect(result.filled).toBe(true)
      expect(mockForm.dispatchEvent).toHaveBeenCalled()
    })
  })

  describe('handleExtractContent', () => {
    it('should extract text content', async () => {
      const mockElement = { textContent: 'Hello World' }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

      const result = await handleExtractContent({ selector: '#content', format: 'text' })

      expect(result.content).toBe('Hello World')
    })

    it('should extract html content', async () => {
      const mockElement = { innerHTML: '<p>Hello</p>' }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

      const result = await handleExtractContent({ selector: '#content', format: 'html' })

      expect(result.content).toBe('<p>Hello</p>')
    })

    it('should use document.body if no selector', async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      const result = await handleExtractContent({ format: 'text' })

      expect(result.content).toBeDefined()
    })
  })

  describe('handleScrollPage', () => {
    it('should scroll down', async () => {
      vi.spyOn(window, 'scrollBy').mockReturnValue(undefined)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500)

      const result = await handleScrollPage({ direction: 'down', amount: 100 })

      expect(result.scrolled).toBe(true)
      expect(result.scrollY).toBe(500)
      expect(window.scrollBy).toHaveBeenCalledWith(0, 100)
    })

    it('should scroll up', async () => {
      vi.spyOn(window, 'scrollBy').mockReturnValue(undefined)

      const result = await handleScrollPage({ direction: 'up', amount: 200 })

      expect(result.scrolled).toBe(true)
      expect(window.scrollBy).toHaveBeenCalledWith(0, -200)
    })

    it('should scroll to top', async () => {
      vi.spyOn(window, 'scrollTo').mockReturnValue(undefined)

      const result = await handleScrollPage({ direction: 'top' })

      expect(result.scrolled).toBe(true)
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    })

    it('should scroll to bottom', async () => {
      vi.spyOn(window, 'scrollTo').mockReturnValue(undefined)

      const result = await handleScrollPage({ direction: 'bottom' })

      expect(result.scrolled).toBe(true)
    })
  })

  describe('handleExecuteScript', () => {
    it('should execute valid script', async () => {
      const result = await handleExecuteScript({ script: '1 + 1' })

      expect(result.result).toBe(2)
    })

    it('should throw error for dangerous patterns', async () => {
      await expect(handleExecuteScript({ script: 'chrome.tabs' })).rejects.toThrow(
        '脚本包含禁止的操作'
      )

      await expect(handleExecuteScript({ script: 'fetch("url")' })).rejects.toThrow(
        '脚本包含禁止的操作'
      )

      await expect(handleExecuteScript({ script: 'localStorage.getItem' })).rejects.toThrow(
        '脚本包含禁止的操作'
      )
    })

    it('should throw error for invalid script', async () => {
      await expect(handleExecuteScript({ script: 'invalid syntax here!!!' })).rejects.toThrow(
        '脚本执行错误'
      )
    })
  })

  describe('handleGetPageContent', () => {
    it('should handle text content format', async () => {
      // In jsdom, document.body.innerText may be undefined or empty
      const result = await handleGetPageContent({ format: 'text' })

      // content may be undefined in jsdom, but should not throw
      expect(result).toBeDefined()
    })

    it('should handle html content format', async () => {
      // In jsdom, document.body.innerHTML returns minimal content
      const result = await handleGetPageContent({ format: 'html' })

      expect(typeof result.content).toBe('string')
    })

    it('should return dom structure', async () => {
      const result = await handleGetPageContent({ format: 'dom' })

      expect(result.structure).toBeDefined()
      expect(result.structure?.tag).toBe('body')
      expect(Array.isArray(result.structure?.children)).toBe(true)
    })
  })
})
