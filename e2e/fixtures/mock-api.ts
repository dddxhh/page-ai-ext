import { Page, Route } from '@playwright/test'

export interface MockChatResponse {
  content: string
  role?: string
  finishReason?: string
}

export async function mockChatCompletion(page: Page, response: MockChatResponse): Promise<void> {
  await page.route('**/v1/chat/completions', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-chat-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'mock-model',
        choices: [
          {
            index: 0,
            message: {
              role: response.role || 'assistant',
              content: response.content,
            },
            finish_reason: response.finishReason || 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }),
    })
  })
}

export async function mockStreamingChatCompletion(page: Page, chunks: string[]): Promise<void> {
  await page.route('**/v1/chat/completions', async (route: Route) => {
    const lines = chunks.map((chunk, index) => {
      return `data: ${JSON.stringify({
        id: 'mock-stream-id',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'mock-model',
        choices: [
          {
            index: 0,
            delta: {
              content: chunk,
            },
            finish_reason: index === chunks.length - 1 ? 'stop' : null,
          },
        ],
      })}`
    })

    lines.push('data: [DONE]')

    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
      body: lines.join('\n\n'),
    })
  })
}

export async function mockChatError(page: Page, errorMessage: string): Promise<void> {
  await page.route('**/v1/chat/completions', async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          message: errorMessage,
          type: 'api_error',
          code: 'internal_error',
        },
      }),
    })
  })
}

export async function unmockChatCompletion(page: Page): Promise<void> {
  await page.unroute('**/v1/chat/completions')
}

export const defaultMockResponse: MockChatResponse = {
  content: 'This is a mock AI response for testing purposes.',
  role: 'assistant',
  finishReason: 'stop',
}

export const defaultStreamChunks = ['This ', 'is ', 'a ', 'mock ', 'streaming ', 'response.']
