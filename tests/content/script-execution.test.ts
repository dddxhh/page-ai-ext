import { describe, it, expect } from 'vitest'

describe('Script Execution Security', () => {
  // Mock handleExecuteScript logic for testing
  async function handleExecuteScript(params: any): Promise<any> {
    const { script } = params

    const dangerousPatterns = [
      /chrome\./i,
      /fetch\(/i,
      /XMLHttpRequest/i,
      /document\.cookie/i,
      /localStorage/i,
      /sessionStorage/i,
      /window\.location/i,
      /eval\(/i,
      /Function\(/i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(script)) {
        throw new Error('脚本包含禁止的操作')
      }
    }

    try {
      const fn = new Function('return ' + script)
      const result = fn()
      return { result }
    } catch (error) {
      throw new Error(`脚本执行错误: ${(error as Error).message}`)
    }
  }

  it('should execute safe arithmetic script', async () => {
    const result = await handleExecuteScript({ script: '1 + 1' })
    expect(result.result).toBe(2)
  })

  it('should execute safe string script', async () => {
    const result = await handleExecuteScript({ script: "'hello'.toUpperCase()" })
    expect(result.result).toBe('HELLO')
  })

  it('should block chrome API access', async () => {
    await expect(handleExecuteScript({ script: 'chrome.runtime' })).rejects.toThrow(
      '脚本包含禁止的操作'
    )
  })

  it('should block fetch calls', async () => {
    await expect(handleExecuteScript({ script: 'fetch("https://evil.com")' })).rejects.toThrow(
      '脚本包含禁止的操作'
    )
  })

  it('should block localStorage access', async () => {
    await expect(handleExecuteScript({ script: 'localStorage.getItem("key")' })).rejects.toThrow(
      '脚本包含禁止的操作'
    )
  })

  it('should block nested eval', async () => {
    await expect(handleExecuteScript({ script: 'eval("test")' })).rejects.toThrow(
      '脚本包含禁止的操作'
    )
  })

  it('should block nested Function', async () => {
    await expect(handleExecuteScript({ script: 'Function("return 1")' })).rejects.toThrow(
      '脚本包含禁止的操作'
    )
  })

  it('should handle syntax errors gracefully', async () => {
    await expect(handleExecuteScript({ script: 'invalid syntax here' })).rejects.toThrow(
      '脚本执行错误'
    )
  })

  it('should execute object operations', async () => {
    const result = await handleExecuteScript({ script: '{ a: 1, b: 2 }.a' })
    expect(result.result).toBe(1)
  })
})
