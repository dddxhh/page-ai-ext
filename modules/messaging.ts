import { ExtensionMessage, MessageType } from '../types'

export class Messaging {
  private listeners: Map<
    MessageType,
    Set<(data: any, sender: chrome.runtime.MessageSender) => any>
  > = new Map()

  // Send message to background
  async sendToBackground<T = any>(type: MessageType, data?: T): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  // Send message to content script
  async sendToContentScript<T = any>(tabId: number, type: MessageType, data?: T): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { type, data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  // Send message to all tabs
  async broadcastToTabs<T = any>(type: MessageType, data?: T): Promise<void> {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await this.sendToContentScript(tab.id, type, data)
        } catch (error) {
          console.error('Failed to send to tab:', tab.id, error)
        }
      }
    }
  }

  // Listen for messages
  onMessage<T = any>(
    type: MessageType,
    callback: (data: T, sender: chrome.runtime.MessageSender) => any
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
  }

  // Remove listener
  offMessage(
    type: MessageType,
    callback: (data: any, sender: chrome.runtime.MessageSender) => any
  ): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  // Initialize message listener
  initialize(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { type, data } = message as ExtensionMessage
      const listeners = this.listeners.get(type)

      if (listeners && listeners.size > 0) {
        const callbacks = Array.from(listeners)
        const firstCallback = callbacks[0]

        const result = firstCallback(data, sender)

        if (result instanceof Promise) {
          result
            .then((response) => {
              if (response !== undefined) {
                sendResponse(response)
              }
            })
            .catch((error) => {
              sendResponse({ success: false, error: error.message })
            })
          return true
        } else if (result !== undefined) {
          sendResponse(result)
          return true
        }
      }
    })
  }
}

export class MessagingClass extends Messaging {}

export const messaging = new MessagingClass()
