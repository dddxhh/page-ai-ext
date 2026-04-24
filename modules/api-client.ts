import {
  ModelConfig,
  Message,
  AppError,
  ErrorType,
  ChatCompletionResponse,
  ToolCallResponse,
  MCPTool,
} from '../types'

interface ToolExecutor {
  (name: string, args: Record<string, any>): Promise<any>
}

interface APIMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: ToolCallResponse[]
  tool_call_id?: string
}

interface ChatCompletionOptions {
  messages: Message[]
  tools?: any[]
  stream?: boolean
  onChunk?: (chunk: string) => void
}

export class APIClient {
  private currentModel: ModelConfig | null = null
  private currentAbortController: AbortController | null = null

  setModel(model: ModelConfig): void {
    this.currentModel = model
  }

  abort(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<string> {
    if (!this.currentModel) {
      throw this.createError(ErrorType.API_KEY_INVALID, 'No model configured')
    }

    this.currentAbortController = new AbortController()
    const { messages, tools, stream, onChunk } = options

    try {
      if (stream && onChunk) {
        return await this.streamChatCompletion(messages, tools || [], onChunk)
      } else {
        return await this.nonStreamChatCompletion(messages, tools || [])
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('User cancelled')
      }
      throw this.handleError(error)
    } finally {
      this.currentAbortController = null
    }
  }

  async chatCompletionWithTools(
    messages: Message[],
    tools: MCPTool[],
    executeTool: ToolExecutor,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.currentModel) {
      throw this.createError(ErrorType.API_KEY_INVALID, 'No model configured')
    }

    this.currentAbortController = new AbortController()
    const formattedTools = this.formatToolsForAPI(tools)
    const initialMessages: APIMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
    const currentMessages: APIMessage[] = [...initialMessages]
    let maxIterations = 10

    try {
      while (maxIterations > 0) {
        maxIterations--

        const response = await this.sendChatRequest(currentMessages, formattedTools)

        if (response.finish_reason === 'stop' && response.content) {
          if (onChunk) {
            onChunk(response.content)
          }
          return response.content
        }

        if (response.finish_reason === 'tool_calls' && response.tool_calls) {
          const assistantMessage: APIMessage = {
            role: 'assistant',
            content: response.content || '',
            tool_calls: response.tool_calls,
          }
          currentMessages.push(assistantMessage)

          for (const toolCall of response.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments)
            const result = await executeTool(toolCall.function.name, args)

            const toolResult: APIMessage = {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            }
            currentMessages.push(toolResult)
          }

          continue
        }

        if (response.finish_reason === 'length') {
          throw new Error('Response truncated due to token limit')
        }

        break
      }

      throw new Error('Tool calling loop exceeded maximum iterations')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('User cancelled')
      }
      throw this.handleError(error)
    } finally {
      this.currentAbortController = null
    }
  }

  private formatToolsForAPI(tools: MCPTool[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }))
  }

  private async sendChatRequest(
    messages: APIMessage[],
    tools: any[]
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(this.getAPIURL(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.currentModel!.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          tool_calls: m.tool_calls,
          tool_call_id: m.tool_call_id,
        })),
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
      }),
      signal: this.currentAbortController?.signal,
    })

    if (!response.ok) {
      throw await this.handleAPIError(response)
    }

    const data = await response.json()
    const choice = data.choices[0]

    return {
      content: choice.message?.content,
      tool_calls: choice.message?.tool_calls,
      finish_reason: choice.finish_reason,
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
      signal: this.currentAbortController?.signal,
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
      signal: this.currentAbortController?.signal,
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
      if (this.currentAbortController?.signal.aborted) {
        break
      }
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
