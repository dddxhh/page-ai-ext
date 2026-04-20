import { describe, it, expect, beforeEach, vi } from 'vitest'
import { APIClient } from '../../modules/api-client'
import { ErrorType } from '../../types'
import { mockModelConfig, mockMessage } from '../fixtures/data-fixtures'

describe('API Client Module', () => {
  let apiClient: APIClient
  let mockFetch: any

  beforeEach(() => {
    apiClient = new APIClient()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('Model Configuration', () => {
    it('should set current model', () => {
      apiClient.setModel(mockModelConfig)
      expect((apiClient as any).currentModel).toEqual(mockModelConfig)
    })

    it('should throw error if no model configured', async () => {
      await expect(
        apiClient.chatCompletion({
          messages: [mockMessage],
        })
      ).rejects.toThrow('No model configured')
    })
  })

  describe('Non-Streaming Chat Completion', () => {
    beforeEach(() => {
      apiClient.setModel(mockModelConfig)
    })

    it('should send correct request to OpenAI', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      const result = await apiClient.chatCompletion({
        messages: [mockMessage],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockModelConfig.apiKey}`,
          }),
        })
      )
      expect(result).toBe('Test response')
    })

    it('should send correct request to Anthropic', async () => {
      const anthropicModel = { ...mockModelConfig, provider: 'anthropic' as const }
      apiClient.setModel(anthropicModel)

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await apiClient.chatCompletion({
        messages: [mockMessage],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': anthropicModel.apiKey,
            'anthropic-version': '2023-06-01',
          }),
        })
      )
    })

    it('should send correct request to Google', async () => {
      const googleModel = { ...mockModelConfig, provider: 'google' as const }
      apiClient.setModel(googleModel)

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await apiClient.chatCompletion({
        messages: [mockMessage],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should handle 401 API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Invalid API key' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        apiClient.chatCompletion({
          messages: [mockMessage],
        })
      ).rejects.toMatchObject({
        type: ErrorType.API_KEY_INVALID,
        message: 'Invalid API key',
      })
    })

    it('should handle 429 quota errors', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({ error: 'Quota exceeded' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        apiClient.chatCompletion({
          messages: [mockMessage],
        })
      ).rejects.toMatchObject({
        type: ErrorType.QUOTA_EXCEEDED,
        message: 'API quota exceeded',
      })
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

      await expect(
        apiClient.chatCompletion({
          messages: [mockMessage],
        })
      ).rejects.toMatchObject({
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error',
      })
    })
  })

  describe('Streaming Chat Completion', () => {
    beforeEach(() => {
      apiClient.setModel(mockModelConfig)
    })

    it('should stream response chunks', async () => {
      const chunks = [
        'data: {"choices": [{"delta": {"content": "Hello"}}]}\n\n',
        'data: {"choices": [{"delta": {"content": " world"}}]}\n\n',
        'data: [DONE]\n\n',
      ]

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[0]) })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[1]) })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[2]) })
          .mockResolvedValueOnce({ done: true }),
      }

      const mockResponse = {
        ok: true,
        body: { getReader: vi.fn().mockReturnValue(mockReader) },
      }
      mockFetch.mockResolvedValue(mockResponse)

      const receivedChunks: string[] = []
      const result = await apiClient.chatCompletion({
        messages: [mockMessage],
        stream: true,
        onChunk: (chunk) => receivedChunks.push(chunk),
      })

      expect(receivedChunks).toEqual(['Hello', ' world'])
      expect(result).toBe('Hello world')
    })

    it('should handle streaming errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Internal server error' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        apiClient.chatCompletion({
          messages: [mockMessage],
          stream: true,
          onChunk: vi.fn(),
        })
      ).rejects.toMatchObject({
        type: ErrorType.NETWORK_ERROR,
      })
    })
  })

  describe('Error Handling', () => {
    it('should mark network errors as retryable', async () => {
      apiClient.setModel(mockModelConfig)
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

      try {
        await apiClient.chatCompletion({ messages: [mockMessage] })
      } catch (error: any) {
        expect(error.retryable).toBe(true)
      }
    })

    it('should mark API key errors as non-retryable', async () => {
      apiClient.setModel(mockModelConfig)
      const mockResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Invalid API key' }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      try {
        await apiClient.chatCompletion({ messages: [mockMessage] })
      } catch (error: any) {
        expect(error.retryable).toBe(false)
      }
    })
  })

  describe('Custom Base URL', () => {
    it('should use custom base URL when provided', async () => {
      const customModel = {
        ...mockModelConfig,
        provider: 'custom' as const,
        baseURL: 'https://custom-api.example.com/v1',
      }
      apiClient.setModel(customModel)

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
        }),
      }
      mockFetch.mockResolvedValue(mockResponse)

      await apiClient.chatCompletion({
        messages: [mockMessage],
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-api.example.com/v1/chat/completions',
        expect.any(Object)
      )
    })
  })
})
