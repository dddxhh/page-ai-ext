import { ModelConfig, Message, AppError, ErrorType } from '../types'

interface ChatCompletionOptions {
  messages: Message[]
  tools?: any[]
  stream?: boolean
  onChunk?: (chunk: string) => void
}

export class APIClient {
  private currentModel: ModelConfig | null = null

  setModel(model: ModelConfig): void {
    this.currentModel = model
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<string> {
    if (!this.currentModel) {
      throw this.createError(ErrorType.API_KEY_INVALID, 'No model configured')
    }

    const { messages, tools, stream, onChunk } = options

    try {
      if (stream && onChunk) {
        return await this.streamChatCompletion(messages, tools || [], onChunk)
      } else {
        return await this.nonStreamChatCompletion(messages, tools || [])
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private async nonStreamChatCompletion(messages: Message[], tools?: any[]): Promise<string> {
    const response = await fetch(this.getAPIURL(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.currentModel!.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        tools,
      }),
    })

    if (!response.ok) {
      throw await this.handleAPIError(response)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async streamChatCompletion(
    messages: Message[],
    tools: any[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await fetch(this.getAPIURL(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.currentModel!.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        tools,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw await this.handleAPIError(response)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response reader')
    }

    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return fullContent
  }

  private getAPIURL(): string {
    const baseURL = this.currentModel?.baseURL
    if (baseURL) {
      return `${baseURL}/chat/completions`
    }

    // Default URLs based on provider
    switch (this.currentModel?.provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions'
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages'
      case 'google':
        return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
      case 'deepseek':
        return 'https://api.deepseek.com/v1/chat/completions'
      default:
        throw new Error('Unknown provider')
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (
      this.currentModel?.provider === 'openai' ||
      this.currentModel?.provider === 'custom' ||
      this.currentModel?.provider === 'deepseek'
    ) {
      headers['Authorization'] = `Bearer ${this.currentModel.apiKey}`
    } else if (this.currentModel?.provider === 'anthropic') {
      headers['x-api-key'] = this.currentModel.apiKey
      headers['anthropic-version'] = '2023-06-01'
    }

    return headers
  }

  private async handleAPIError(response: Response): Promise<AppError> {
    const data = await response.json().catch(() => ({}))

    if (response.status === 401) {
      return this.createError(ErrorType.API_KEY_INVALID, 'Invalid API key', data)
    } else if (response.status === 429) {
      return this.createError(ErrorType.QUOTA_EXCEEDED, 'API quota exceeded', data)
    } else {
      return this.createError(ErrorType.NETWORK_ERROR, `API error: ${response.status}`, data)
    }
  }

  private handleError(error: any): AppError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(ErrorType.NETWORK_ERROR, 'Network error', error)
    }
    return error as AppError
  }

  private createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      retryable: type === ErrorType.NETWORK_ERROR || type === ErrorType.TIMEOUT,
    }
  }
}

export const apiClient = new APIClient()
