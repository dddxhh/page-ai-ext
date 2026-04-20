import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Messaging } from '../../modules/messaging'
import { MessageType } from '../../types'

describe('Messaging Module', () => {
  let messaging: Messaging

  beforeEach(() => {
    messaging = new Messaging()
    vi.clearAllMocks()
  })

  describe('Message Listeners', () => {
    it('should register message listener', () => {
      const callback = vi.fn()
      messaging.onMessage('SEND_MESSAGE', callback)

      const listeners = (messaging as any).listeners.get('SEND_MESSAGE')
      expect(listeners).toBeDefined()
      expect(listeners?.has(callback)).toBe(true)
    })

    it('should remove message listener', () => {
      const callback = vi.fn()
      messaging.onMessage('SEND_MESSAGE', callback)
      messaging.offMessage('SEND_MESSAGE', callback)

      const listeners = (messaging as any).listeners.get('SEND_MESSAGE')
      expect(listeners?.has(callback)).toBe(false)
    })

    it('should call multiple listeners for same message type', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      messaging.onMessage('SEND_MESSAGE', callback1)
      messaging.onMessage('SEND_MESSAGE', callback2)

      const listeners = (messaging as any).listeners.get('SEND_MESSAGE')
      expect(listeners?.size).toBe(2)
    })

    it('should handle different message types separately', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      messaging.onMessage('SEND_MESSAGE', callback1)
      messaging.onMessage('EXECUTE_TOOL', callback2)

      const sendListeners = (messaging as any).listeners.get('SEND_MESSAGE')
      const executeListeners = (messaging as any).listeners.get('EXECUTE_TOOL')

      expect(sendListeners?.has(callback1)).toBe(true)
      expect(executeListeners?.has(callback2)).toBe(true)
      expect(sendListeners?.has(callback2)).toBe(false)
    })
  })

  describe('Message Initialization', () => {
    it('should initialize Chrome runtime listener', () => {
      messaging.initialize()

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled()
    })

    it('should route messages to correct listeners', () => {
      const callback = vi.fn().mockReturnValue('response')
      messaging.onMessage('SEND_MESSAGE', callback)
      messaging.initialize()

      const addListener = vi.mocked(chrome.runtime.onMessage.addListener)
      const listenerCallback = addListener.mock.calls[0][0]

      const mockSendResponse = vi.fn()
      listenerCallback({ type: 'SEND_MESSAGE', data: { content: 'test' } }, {}, mockSendResponse)

      expect(callback).toHaveBeenCalledWith({ content: 'test' }, {})
      expect(mockSendResponse).toHaveBeenCalledWith('response')
    })

    it('should not call listeners for unregistered message types', () => {
      const callback = vi.fn()
      messaging.onMessage('SEND_MESSAGE', callback)
      messaging.initialize()

      const addListener = vi.mocked(chrome.runtime.onMessage.addListener)
      const listenerCallback = addListener.mock.calls[0][0]

      const mockSendResponse = vi.fn()
      listenerCallback({ type: 'EXECUTE_TOOL', data: { tool: 'test' } }, {}, mockSendResponse)

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
